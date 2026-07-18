"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
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

const AI_FEATURES = [
  { label: "AI Priority", icon: "🎯", desc: "Every task auto-scored on creation" },
  { label: "Daily Briefing", icon: "☀️", desc: "Morning summary of what matters today" },
  { label: "Sharpen", icon: "✦", desc: "Rewrite vague tasks into actionable ones" },
  { label: "Weekly Triage", icon: "🔁", desc: "Clear stale tasks in 3 minutes" },
];

function OnboardingEmpty({ onAdd }: { onAdd: (title: string) => void }) {
  const EXAMPLES = [
    "Write intro email to new client",
    "Review Q3 metrics dashboard",
    "Fix login bug on mobile",
  ];

  return (
    <div className="mt-10 animate-fade-in">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-accent">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-center text-lg font-semibold text-ink">Your focus board is empty</h2>
      <p className="mx-auto mt-2 max-w-xs text-center text-sm text-white/40">
        Add tasks above. Flow Todo keeps your top 10 in focus — everything else goes to
        backlog. AI scores each task automatically.
      </p>

      {/* AI feature chips */}
      <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-2">
        {AI_FEATURES.map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-white/7 bg-surface p-3"
          >
            <div className="mb-1 text-base">{f.icon}</div>
            <div className="text-[12px] font-medium text-white/70">{f.label}</div>
            <div className="mt-0.5 text-[10px] leading-tight text-white/30">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Quick-start examples */}
      <div className="mt-6">
        <p className="mb-2 text-center text-[11px] uppercase tracking-widest text-white/20">
          Try an example
        </p>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onAdd(ex)}
              className="rounded-xl border border-white/7 bg-surface px-4 py-2.5 text-left text-sm text-white/40 transition hover:border-accent/30 hover:text-white/70"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const api = useMemo(() => createApi(() => getToken()), [getToken]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<SortMode>("stack");
  const [title, setTitle] = useState("");
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [doneToday, setDoneToday] = useState(0);
  const [sharpening, setSharpening] = useState(false);
  const [staleTasks, setStaleTasks] = useState<Task[]>([]);
  const [addingExample, setAddingExample] = useState(false);

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

  async function submitTask(taskTitle: string) {
    const trimmed = taskTitle.trim();
    if (!trimmed) return;
    setTitle("");
    try {
      const data = await api.post<{ task: Task }>("/api/v1/tasks", { title: trimmed });
      if (data.task) {
        setTasks((prev) => [data.task, ...prev]);
      }
    } catch {}
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    await submitTask(title);
  }

  async function addExample(exTitle: string) {
    setAddingExample(true);
    try {
      await submitTask(exTitle);
    } finally {
      setAddingExample(false);
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
      // best-effort
    } finally {
      setSharpening(false);
    }
  }

  async function completeTask(id: number) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDoneToday((n) => n + 1);
    try {
      await api.patch(`/api/v1/tasks/${id}`, { status: "done" });
    } catch {
      // Rollback: task wasn't saved as done, restore it
      setTasks((prev) => [...prev, task]);
      setDoneToday((n) => n - 1);
    }
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

  async function promoteToFocus(id: number) {
    const data = await api.post<{ task: Task }>(`/api/v1/tasks/${id}/promote`, {});
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
        api.post("/api/v1/tasks/reorder", { ordered_ids: reordered.map((t) => t.id) }).catch(() => {});
        return reordered;
      });
    },
    [api]
  );

  const isDragMode = mode === "stack";
  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Sticky nav ── */}
      <header className="sticky top-0 z-40 border-b border-white/7 bg-[#07070f]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[680px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[15px] font-semibold tracking-tight text-ink">Flow Todo</span>
            {doneToday > 0 && (
              <span className="ml-1 rounded-full bg-green-950/60 border border-green-800/50 px-2 py-0.5 text-[11px] font-medium text-green-400">
                ✓ {doneToday} done
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort toggle */}
            <div className="flex items-center rounded-full border border-white/10 bg-surface p-0.5">
              <button
                type="button"
                onClick={() => setMode("stack")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  mode === "stack" ? "bg-accent text-white shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                Stack
              </button>
              <button
                type="button"
                onClick={() => setMode("priority")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  mode === "priority" ? "bg-accent text-white shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                Priority
              </button>
            </div>

            {/* User avatar */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-purple-600 text-[11px] font-semibold text-white">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt={userInitials} className="h-full w-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="mx-auto w-full max-w-[680px] flex-1 px-4 py-5 sm:px-6 sm:py-7">

        {/* Add task input */}
        <form onSubmit={addTask} className="relative mb-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to happen?"
            className="w-full rounded-2xl border border-white/10 bg-surface px-4 py-3.5 pr-16 text-[15px] text-ink placeholder-white/25 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {title.trim() ? (
              <>
                <button
                  type="button"
                  aria-label="AI Sharpen — rewrite as a concrete, actionable task"
                  title="AI Sharpen"
                  onClick={sharpenTitle}
                  disabled={sharpening}
                  className={`rounded-lg px-2 py-1.5 text-sm font-medium transition ${
                    sharpening ? "animate-pulse text-accent" : "text-white/30 hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  ✦
                </button>
                <button
                  type="submit"
                  aria-label="Add task"
                  className="rounded-lg bg-accent/15 px-2 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/25"
                >
                  Add
                </button>
              </>
            ) : (
              <span className="text-[12px] text-white/15">↵</span>
            )}
          </div>
        </form>

        {/* AI panels */}
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

        {/* Task list */}
        {loading ? (
          <div className="mt-1 space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[60px] animate-pulse rounded-2xl border border-white/5 bg-surface" />
            ))}
          </div>
        ) : activeTasks.length === 0 ? (
          <OnboardingEmpty onAdd={addingExample ? () => {} : addExample} />
        ) : (
          <>
            {/* Focus section header */}
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/25">
                Focus
              </span>
              <span className="text-[11px] text-white/20">
                {focusTasks.length} / {FOCUS_LIMIT}
                {mode === "stack" && " · drag to reorder"}
              </span>
            </div>

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

            {/* Backlog */}
            {backlogTasks.length > 0 && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setBacklogOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/7 bg-surface px-4 py-3 transition hover:border-white/12"
                >
                  <div className="flex items-center gap-2 text-sm text-white/35">
                    <span>Backlog</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                      {backlogTasks.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/25">
                    {!backlogOpen && <span>↑ to promote</span>}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className={`transition-transform duration-200 ${backlogOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>

                {backlogOpen && (
                  <ul className="mt-2 animate-slide-down space-y-2 opacity-75">
                    {backlogTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isDragMode={false}
                        isBacklog
                        onComplete={completeTask}
                        onPromote={promoteToFocus}
                        onUpdateMatrix={updateMatrix}
                      />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        <RetroPanel
          fetchRetro={() =>
            api.get<{ week_start: string; content: string }>("/api/v1/insights/retrospective")
          }
        />
      </main>
    </div>
  );
}
