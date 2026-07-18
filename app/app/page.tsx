"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { Task } from "@/lib/types";
import { EisenhowerQuadrant, ImpactEffortQuadrant } from "@/lib/scoring";
import { createApi } from "@/lib/api";
import TaskRow from "../components/TaskRow";
import BriefingCard from "../components/BriefingCard";
import TriagePanel from "../components/TriagePanel";
import InsightsBanner from "../components/InsightsBanner";
import RetroPanel from "../components/RetroPanel";

const FOCUS_LIMIT = 10;

type SortMode = "stack" | "priority";

function sortTasks(tasks: Task[], mode: SortMode): Task[] {
  if (mode === "stack") {
    return [...tasks].sort((a, b) => b.stack_position - a.stack_position);
  }
  return [...tasks].sort((a, b) => {
    const pa = a.effective_priority ?? a.priority_score;
    const pb = b.effective_priority ?? b.priority_score;
    if (pb !== pa) return pb - pa;
    return b.stack_position - a.stack_position;
  });
}

export default function Home() {
  const { getToken } = useAuth();
  const api = useMemo(() => createApi(() => getToken()), [getToken]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<SortMode>("stack");
  const [title, setTitle] = useState("");
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [doneToday, setDoneToday] = useState(0);
  const [sharpening, setSharpening] = useState(false);
  const [staleTasks, setStaleTasks] = useState<Task[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  useEffect(() => {
    fetchTasks();
    api
      .get<{ tasks: Task[] }>("/api/v1/tasks/triage")
      .then((data) => setStaleTasks(data.tasks ?? []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const data = await api.get<{ tasks: Task[] }>("/api/v1/tasks");
      setTasks(data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }

  const activeTasks = useMemo(() => tasks.filter((t) => t.status === "active"), [tasks]);
  const sorted = useMemo(() => sortTasks(activeTasks, mode), [activeTasks, mode]);
  const focusTasks = sorted.slice(0, FOCUS_LIMIT);
  const backlogTasks = sorted.slice(FOCUS_LIMIT);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setTitle("");
    const data = await api.post<{ task: Task }>("/api/v1/tasks", { title: trimmed });
    if (data.task) {
      setTasks((prev) => [data.task, ...prev]);
    }
  }

  async function sharpenTitle() {
    const trimmed = title.trim();
    if (!trimmed || sharpening) return;
    setSharpening(true);
    try {
      const data = await api.post<{ suggestion: string }>("/api/v1/tasks/sharpen", {
        title: trimmed,
      });
      if (data.suggestion) setTitle(data.suggestion);
    } catch {
      // best-effort; keep original text
    } finally {
      setSharpening(false);
    }
  }

  async function completeTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDoneToday((n) => n + 1);
    await api.patch(`/api/v1/tasks/${id}`, { status: "done" });
  }

  async function updateMatrix(
    id: number,
    updates: {
      eisenhower_quadrant?: EisenhowerQuadrant | null;
      impact_effort_quadrant?: ImpactEffortQuadrant | null;
    }
  ) {
    const data = await api.patch<{ task: Task }>(`/api/v1/tasks/${id}`, updates);
    if (data.task) {
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
    }
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === active.id);
        const overIndex = prev.findIndex((t) => t.id === over.id);
        if (activeIndex === -1 || overIndex === -1) return prev;
        const reordered = arrayMove(prev, activeIndex, overIndex);
        // Persist new order in background — fire and forget
        const orderedIds = reordered.map((t) => t.id);
        api.post("/api/v1/tasks/reorder", { ordered_ids: orderedIds }).catch(() => {});
        return reordered;
      });
    },
    [api]
  );

  const isDragMode = mode === "stack";

  return (
    <main className="mx-auto flex min-h-screen max-w-[680px] flex-col px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-lg font-semibold tracking-tight text-ink">Flow Todo</h1>
        </div>

        {/* Sort toggle pill */}
        <div className="flex items-center rounded-full border border-white/10 bg-surface p-0.5">
          <button
            type="button"
            onClick={() => setMode("stack")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              mode === "stack"
                ? "bg-accent text-white shadow-sm"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            Stack
          </button>
          <button
            type="button"
            onClick={() => setMode("priority")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              mode === "priority"
                ? "bg-accent text-white shadow-sm"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            Priority
          </button>
        </div>
      </header>

      {/* Add task input */}
      <form onSubmit={addTask} className="mb-5 relative">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to happen?"
          className="w-full rounded-2xl border border-white/10 bg-surface px-4 py-3.5 pr-14 text-[15px] text-ink placeholder-white/25 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {title.trim() && (
            <button
              type="button"
              aria-label="AI Sharpen"
              title="Rewrite as a concrete, actionable task"
              onClick={sharpenTitle}
              disabled={sharpening}
              className={`rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition ${
                sharpening
                  ? "animate-pulse text-accent"
                  : "text-white/30 hover:bg-accent/10 hover:text-accent"
              }`}
            >
              ✦
            </button>
          )}
        </div>
      </form>

      {/* AI banners */}
      <BriefingCard
        fetchBriefing={() => api.get<{ date: string; content: string }>("/api/v1/briefing")}
      />
      <InsightsBanner
        fetchInsights={() =>
          api.get<{ burnout_signal: boolean; message: string | null }>("/api/v1/insights")
        }
      />
      <TriagePanel
        staleTasks={staleTasks}
        onTriage={async (id, action) => {
          await api.post(`/api/v1/tasks/${id}/triage`, { action });
          if (action !== "do_this_week") {
            setTasks((prev) => prev.filter((t) => t.id !== id));
          }
        }}
        onDone={() => {
          setStaleTasks([]);
          fetchTasks();
        }}
      />

      {/* Done counter */}
      {doneToday > 0 && (
        <p className="mb-4 text-xs text-white/30">
          Completed today:{" "}
          <span className="font-semibold text-green-400">{doneToday}</span>
        </p>
      )}

      {/* Focus task list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-2xl border border-white/5 bg-surface animate-pulse"
            />
          ))}
        </div>
      ) : focusTasks.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-[15px] text-white/25">Nothing here.</p>
          <p className="mt-1 text-sm text-white/15">Add your first task above.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={focusTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {focusTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isDragMode={isDragMode}
                  onComplete={completeTask}
                  onUpdateMatrix={updateMatrix}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* Backlog */}
      {backlogTasks.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setBacklogOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/7 bg-surface px-4 py-3 text-sm text-white/30 transition hover:border-white/12 hover:text-white/50"
          >
            <span>Backlog</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                {backlogTasks.length}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={`transition-transform duration-200 ${backlogOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M3 5l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>

          {backlogOpen && (
            <ul className="mt-2 space-y-2 animate-slide-down opacity-70">
              {backlogTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isDragMode={false}
                  onComplete={completeTask}
                  onUpdateMatrix={updateMatrix}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <RetroPanel
        fetchRetro={() =>
          api.get<{ week_start: string; content: string }>("/api/v1/insights/retrospective")
        }
      />
    </main>
  );
}
