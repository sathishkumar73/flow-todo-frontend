"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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

const PAGE_SIZE = 6;
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/7 bg-surface px-3 py-3 sm:px-4">
      <span className={`text-2xl font-bold tabular-nums leading-none ${accent ?? "text-ink"}`}>
        {value}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/30">
        {label}
      </span>
    </div>
  );
}

// ── Completed row ──────────────────────────────────────────────────────────────
function CompletedRow({ task }: { task: Task }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-950/50 border border-green-800/40">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="min-w-0 flex-1 truncate text-sm text-white/30 line-through decoration-white/20">
        {task.title}
      </span>
      {task.completed_at && (
        <span className="shrink-0 text-[11px] text-white/20">{timeAgo(task.completed_at)}</span>
      )}
    </li>
  );
}

// ── Onboarding empty state ─────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🎯", label: "AI Priority", desc: "Every task scored on creation" },
  { icon: "✦",  label: "AI Sharpen",  desc: "Turn vague ideas into actions" },
  { icon: "☀️", label: "Briefing",    desc: "Morning focus summary" },
  { icon: "🔁", label: "Triage",      desc: "Clear stale tasks in 3 min" },
];
const EXAMPLES = [
  "Write intro email to first customer",
  "Fix the login bug on mobile",
  "Review Q3 metrics and take notes",
];

function EmptyState({ onAdd }: { onAdd: (t: string) => void }) {
  return (
    <div className="mt-10 animate-fade-in text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-accent">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-ink">Your focus board is clear</h2>
      <p className="mx-auto mt-2 max-w-[280px] text-sm text-white/35">
        Add tasks above. Flow Todo keeps your top 10 in focus — AI scores them automatically.
      </p>
      <div className="mx-auto mt-5 grid max-w-[300px] grid-cols-2 gap-2 text-left">
        {FEATURES.map((f) => (
          <div key={f.label} className="rounded-xl border border-white/7 bg-surface p-3">
            <div className="mb-1 text-sm">{f.icon}</div>
            <div className="text-[12px] font-semibold text-white/60">{f.label}</div>
            <div className="text-[10px] leading-tight text-white/25">{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-white/20">Try an example</p>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onAdd(ex)}
            className="block w-full rounded-xl border border-white/7 bg-surface px-4 py-2.5 text-left text-sm text-white/35 transition hover:border-accent/30 hover:text-white/60"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const api = useMemo(() => createApi(() => getToken()), [getToken]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedToday, setCompletedToday] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<SortMode>("stack");
  const [currentPage, setCurrentPage] = useState(1);
  const [title, setTitle] = useState("");
  const [completedOpen, setCompletedOpen] = useState(false);
  const [sharpening, setSharpening] = useState(false);
  const [staleTasks, setStaleTasks] = useState<Task[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [taskData, completedData, triageData] = await Promise.allSettled([
        api.get<{ tasks: Task[] }>("/api/v1/tasks"),
        api.get<{ tasks: Task[] }>("/api/v1/tasks/completed"),
        api.get<{ tasks: Task[] }>("/api/v1/tasks/triage"),
      ]);
      if (taskData.status === "fulfilled") setTasks(taskData.value.tasks ?? []);
      if (completedData.status === "fulfilled") setCompletedToday(completedData.value.tasks ?? []);
      if (triageData.status === "fulfilled") setStaleTasks(triageData.value.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }

  const activeTasks = useMemo(() => tasks.filter((t) => t.status === "active"), [tasks]);
  const sorted = useMemo(() => sortTasks(activeTasks, mode), [activeTasks, mode]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageTasks = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const isDragMode = mode === "stack";

  // Reset to page 1 when sort mode changes or total shrinks past current page
  useEffect(() => { setCurrentPage(1); }, [mode]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  async function submitTask(taskTitle: string) {
    const trimmed = taskTitle.trim();
    if (!trimmed) return;
    setTitle("");
    try {
      const data = await api.post<{ task: Task }>("/api/v1/tasks", { title: trimmed });
      if (data.task) setTasks((prev) => [data.task, ...prev]);
    } catch {}
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    await submitTask(title);
  }

  async function sharpenTitle() {
    const trimmed = title.trim();
    if (!trimmed || sharpening) return;
    setSharpening(true);
    try {
      const data = await api.post<{ suggestion: string }>("/api/v1/tasks/sharpen", { title: trimmed });
      if (data.suggestion) setTitle(data.suggestion);
    } catch {
    } finally {
      setSharpening(false);
    }
  }

  async function completeTask(id: number) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    // optimistic
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const now = new Date().toISOString();
    setCompletedToday((prev) => [{ ...task, status: "done", completed_at: now }, ...prev]);
    try {
      await api.patch(`/api/v1/tasks/${id}`, { status: "done" });
    } catch {
      // rollback
      setTasks((prev) => [...prev, task]);
      setCompletedToday((prev) => prev.filter((t) => t.id !== id));
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
    if (data.task) setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
  }

  async function promoteToFocus(id: number) {
    const data = await api.post<{ task: Task }>(`/api/v1/tasks/${id}/promote`, {});
    if (data.task) setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setTasks((prev) => {
        const ai = prev.findIndex((t) => t.id === active.id);
        const oi = prev.findIndex((t) => t.id === over.id);
        if (ai === -1 || oi === -1) return prev;
        const reordered = arrayMove(prev, ai, oi);
        api.post("/api/v1/tasks/reorder", { ordered_ids: reordered.map((t) => t.id) }).catch(() => {});
        return reordered;
      });
    },
    [api]
  );

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-40 border-b border-white/7 bg-[#07070f]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-purple-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-ink">Flow Todo</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort toggle */}
            <div className="flex items-center rounded-full border border-white/10 bg-surface p-0.5">
              {(["stack", "priority"] as SortMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                    mode === m ? "bg-accent text-white" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* User avatar */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-purple-600 text-[11px] font-bold text-white">
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

      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-5 sm:px-6 sm:py-6">

        {/* ── Stats row ── */}
        {!loading && (
          <div className="mb-5 grid grid-cols-4 gap-2 sm:gap-3">
            <StatCard value={activeTasks.length} label="Active" accent="text-accent" />
            <StatCard value={totalPages} label="Pages" />
            <StatCard value={completedToday.length} label="Done today" accent="text-green-400" />
            <StatCard value={safePage} label="Page" />
          </div>
        )}

        {/* ── Add task ── */}
        <form onSubmit={addTask} className="relative mb-5">
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to happen?"
            className="w-full rounded-2xl border border-white/10 bg-surface px-4 py-3.5 pr-28 text-[15px] text-ink placeholder-white/25 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {title.trim() && (
              <>
                <button
                  type="button"
                  title="AI Sharpen — rewrite as a concrete, actionable task"
                  onClick={sharpenTitle}
                  disabled={sharpening}
                  className={`rounded-lg px-2 py-1.5 text-[13px] font-medium transition ${
                    sharpening ? "animate-pulse text-accent" : "text-white/30 hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  ✦
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-dark"
                >
                  Add
                </button>
              </>
            )}
          </div>
        </form>

        {/* ── AI panels ── */}
        <BriefingCard fetchBriefing={() => api.get<{ date: string; content: string }>("/api/v1/briefing")} />
        <InsightsBanner fetchInsights={() => api.get<{ burnout_signal: boolean; message: string | null }>("/api/v1/insights")} />
        <TriagePanel
          staleTasks={staleTasks}
          onTriage={async (id, action) => {
            await api.post(`/api/v1/tasks/${id}/triage`, { action });
            if (action !== "do_this_week") setTasks((prev) => prev.filter((t) => t.id !== id));
          }}
          onDone={() => { setStaleTasks([]); fetchAll(); }}
        />

        {/* ── Task list ── */}
        {loading ? (
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[60px] animate-pulse rounded-2xl border border-white/5 bg-surface" />
            ))}
          </div>
        ) : activeTasks.length === 0 && completedToday.length === 0 ? (
          <EmptyState onAdd={submitTask} />
        ) : (
          <>
            {/* Task list — paginated */}
            {pageTasks.length > 0 && (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-white/25">
                    Tasks
                  </span>
                  <span className="text-[11px] text-white/20">
                    {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length}
                    {isDragMode && " · drag to reorder"}
                  </span>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={pageTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                      {pageTasks.map((task) => (
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

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/7 bg-surface px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition hover:bg-white/5 hover:text-white/70 disabled:pointer-events-none disabled:opacity-25"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Prev
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`h-7 w-7 rounded-lg text-xs font-medium transition ${
                            p === safePage
                              ? "bg-accent text-white"
                              : "text-white/30 hover:bg-white/5 hover:text-white/60"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition hover:bg-white/5 hover:text-white/70 disabled:pointer-events-none disabled:opacity-25"
                    >
                      Next
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Completed today */}
            {completedToday.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setCompletedOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/7 bg-surface px-4 py-3 transition hover:border-white/12"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-950/60 border border-green-800/40">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l1.8 2L6.5 2" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-white/35">Completed today</span>
                    <span className="rounded-full border border-green-900/40 bg-green-950/30 px-2 py-0.5 text-xs text-green-400/70">
                      {completedToday.length}
                    </span>
                  </div>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={`text-white/25 transition-transform duration-200 ${completedOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {completedOpen && (
                  <div className="mt-2 animate-slide-down rounded-2xl border border-white/5 bg-surface px-4">
                    <ul className="divide-y divide-white/5">
                      {completedToday.map((task) => (
                        <CompletedRow key={task.id} task={task} />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <RetroPanel fetchRetro={() => api.get<{ week_start: string; content: string }>("/api/v1/insights/retrospective")} />
      </main>
    </div>
  );
}
