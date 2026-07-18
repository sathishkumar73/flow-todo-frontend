"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
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
      // sharpen is best-effort; keep the user's original text
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

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-8 sm:py-12">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Flow Todo</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className={mode === "stack" ? "font-medium text-neutral-900" : "text-neutral-400"}>
            Stack
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={mode === "priority"}
            onClick={() => setMode((m) => (m === "stack" ? "priority" : "stack"))}
            className="relative h-6 w-11 shrink-0 rounded-full bg-neutral-200 transition"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-accent shadow transition ${
                mode === "priority" ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
          <span className={mode === "priority" ? "font-medium text-neutral-900" : "text-neutral-400"}>
            Priority
          </span>
        </div>
      </header>

      <form onSubmit={addTask} className="mb-6 relative">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task and hit Enter…"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-12 text-base outline-none focus:border-accent"
        />
        {title.trim() && (
          <button
            type="button"
            aria-label="Sharpen task with AI"
            title="Sharpen: rewrite as a concrete, actionable task"
            onClick={sharpenTitle}
            disabled={sharpening}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-sm transition hover:bg-neutral-100 ${
              sharpening ? "animate-pulse text-accent" : "text-neutral-400 hover:text-accent"
            }`}
          >
            ✦
          </button>
        )}
      </form>

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

      {doneToday > 0 && (
        <p className="mb-4 text-sm text-neutral-500">
          Done today: <span className="font-medium text-neutral-700">{doneToday}</span>
        </p>
      )}

      {loading ? (
        <p className="text-sm text-neutral-400">Loading…</p>
      ) : focusTasks.length === 0 ? (
        <p className="text-sm text-neutral-400">Nothing here. Add your first task above.</p>
      ) : (
        <ul className="rounded-xl border border-neutral-100 bg-white px-4">
          {focusTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={completeTask}
              onUpdateMatrix={updateMatrix}
            />
          ))}
        </ul>
      )}

      {backlogTasks.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setBacklogOpen((v) => !v)}
            className="text-xs text-neutral-400 hover:text-neutral-600"
          >
            {backlogOpen ? "Hide" : "Backlog"} ({backlogTasks.length})
          </button>
          {backlogOpen && (
            <ul className="mt-2 rounded-xl border border-neutral-100 bg-white px-4 opacity-70">
              {backlogTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
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
