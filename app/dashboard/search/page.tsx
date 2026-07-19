"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApi } from "@/lib/api";
import type { Task } from "@/lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const EIS_LABEL: Record<string, string> = {
  do_first: "Do First",
  schedule: "Schedule",
  delegate: "Delegate",
  eliminate: "Eliminate",
};
const IE_LABEL: Record<string, string> = {
  quick_win: "Quick Win",
  major_project: "Major Project",
  fill_in: "Fill In",
  thankless: "Thankless",
};

function statusBadge(status: string) {
  if (status === "someday")
    return <span className="rounded-full border border-yellow-900/40 bg-yellow-950/30 px-2 py-0.5 text-[10px] font-medium text-yellow-400/70">Someday</span>;
  return null;
}

function findDuplicates(tasks: Task[]): Set<number> {
  const seen = new Map<string, number[]>();
  for (const t of tasks) {
    const key = t.title.trim().toLowerCase();
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(t.id);
  }
  const dupeIds = new Set<number>();
  for (const ids of seen.values()) {
    if (ids.length > 1) ids.forEach((id) => dupeIds.add(id));
  }
  return dupeIds;
}

interface ActionMenuProps {
  task: Task;
  onComplete: (id: number) => void;
  onSomeday: (id: number) => void;
  onDelete: (id: number) => void;
  pending: boolean;
}

function ActionMenu({ task, onComplete, onSomeday, onDelete, pending }: ActionMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        disabled={pending}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/5 hover:text-white/60 disabled:pointer-events-none disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="2.5" r="1.2" fill="currentColor" />
          <circle cx="7" cy="7" r="1.2" fill="currentColor" />
          <circle cx="7" cy="11.5" r="1.2" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full z-50 mt-1 min-w-[160px] animate-fade-in rounded-xl border border-white/10 bg-surface-2 py-1 shadow-2xl shadow-black/40"
        >
          {task.status !== "done" && (
            <button
              type="button"
              onClick={() => { setOpen(false); onComplete(task.id); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 transition hover:bg-accent/10 hover:text-accent"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Complete
            </button>
          )}
          {task.status === "active" && (
            <button
              type="button"
              onClick={() => { setOpen(false); onSomeday(task.id); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white/70"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v3M7 9.5v3M1.5 7h3M9.5 7h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Move to Someday
            </button>
          )}
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete(task.id); }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/70 transition hover:bg-red-950/30 hover:text-red-400"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 3.5h9M5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M5.5 6v4.5M8.5 6v4.5M3.5 3.5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  isDupe,
  onComplete,
  onSomeday,
  onDelete,
  query,
}: {
  task: Task;
  isDupe: boolean;
  onComplete: (id: number) => void;
  onSomeday: (id: number) => void;
  onDelete: (id: number) => void;
  query: string;
}) {
  const [pending, setPending] = useState(false);

  function highlight(text: string, q: string) {
    if (!q.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded bg-accent/20 text-accent not-italic px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  async function handle(fn: (id: number) => Promise<void>, id: number) {
    setPending(true);
    try { await fn(id); } finally { setPending(false); }
  }

  return (
    <li
      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
        isDupe
          ? "border-yellow-800/30 bg-yellow-950/[0.15] hover:bg-yellow-950/25"
          : "border-white/[0.08] bg-surface hover:bg-surface-2"
      } ${pending ? "opacity-50" : ""}`}
    >
      {/* Left accent for duplicates */}
      {isDupe && (
        <div className="h-7 w-0.5 shrink-0 rounded-full bg-yellow-600/50" />
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="min-w-0 flex-1 truncate text-[14px] font-medium leading-snug text-white/90">
            {highlight(task.title, query)}
          </p>
          <span className="shrink-0 text-[11px] tabular-nums text-white/25">{timeAgo(task.created_at)}</span>
        </div>
        {(task.eisenhower_quadrant || task.impact_effort_quadrant || task.status === "someday") && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {statusBadge(task.status)}
            {task.eisenhower_quadrant && (
              <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent/80">
                {EIS_LABEL[task.eisenhower_quadrant] ?? task.eisenhower_quadrant}
              </span>
            )}
            {task.impact_effort_quadrant && (
              <span className="rounded-full border border-purple-800/30 bg-purple-950/30 px-2 py-0.5 text-[10px] font-medium text-purple-400/70">
                {IE_LABEL[task.impact_effort_quadrant] ?? task.impact_effort_quadrant}
              </span>
            )}
          </div>
        )}
      </div>

      <ActionMenu
        task={task}
        pending={pending}
        onComplete={(id) => handle(onComplete as (id: number) => Promise<void>, id)}
        onSomeday={(id) => handle(onSomeday as (id: number) => Promise<void>, id)}
        onDelete={(id) => handle(onDelete as (id: number) => Promise<void>, id)}
      />
    </li>
  );
}

export default function SearchPage() {
  const { getToken } = useAuth();
  const api = useMemo(() => createApi(() => getToken()), [getToken]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "someday">("all");

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ tasks: Task[] }>("/api/v1/tasks/all");
      setTasks(data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let list = tasks;
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q));
    return list;
  }, [tasks, query, statusFilter]);

  const dupes = useMemo(() => findDuplicates(filtered), [filtered]);

  const dupeCount = useMemo(
    () => [...new Set(filtered.filter((t) => dupes.has(t.id)).map((t) => t.title.trim().toLowerCase()))].length,
    [filtered, dupes]
  );

  const handleComplete = useCallback(async (id: number) => {
    await api.patch(`/api/v1/tasks/${id}`, { status: "done" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [api]);

  const handleSomeday = useCallback(async (id: number) => {
    const data = await api.patch<{ task: Task }>(`/api/v1/tasks/${id}`, { status: "someday" });
    if (data.task) setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
  }, [api]);

  const handleDelete = useCallback(async (id: number) => {
    await api.delete(`/api/v1/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [api]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.09] bg-[#0f0f14]/92 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-purple-600">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-ink">Flow Todo</span>
          </div>
          <span className="hidden lg:block text-sm font-semibold text-white/30">Search</span>
          <div className="flex items-center gap-2">
            {/* Status filter */}
            <div className="flex items-center rounded-full border border-white/10 bg-surface p-0.5">
              {(["all", "active", "someday"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                    statusFilter === s ? "bg-accent text-white" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className="px-4 pb-3 sm:px-6">
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="w-full rounded-xl border border-white/[0.12] bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-white/25 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 xl:grid xl:grid-cols-[1fr_320px] xl:gap-6 xl:items-start px-4 py-5 sm:px-6 xl:px-8 xl:py-6 max-w-[1440px] mx-auto w-full">

        {/* ═══ LEFT: results list ═══════════════════════════════════════════ */}
        <div className="min-w-0">
          {/* Results count row */}
          {!loading && (
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-white/30">
                {filtered.length} task{filtered.length !== 1 ? "s" : ""}
                {query && <span className="text-white/20"> for &ldquo;{query}&rdquo;</span>}
              </span>
              {dupeCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-yellow-900/30 bg-yellow-950/20 px-2.5 py-0.5 text-xs text-yellow-400/70">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v4M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/></svg>
                  {dupeCount} duplicate group{dupeCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-2.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[72px] animate-pulse rounded-2xl border border-white/[0.07] bg-surface" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-16 text-center animate-fade-in">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.09] bg-surface">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white/20">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
                  <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm text-white/30">
                {query ? `No tasks matching "${query}"` : "No tasks yet"}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDupe={dupes.has(task.id)}
                  query={query}
                  onComplete={handleComplete}
                  onSomeday={handleSomeday}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </div>

        {/* ═══ RIGHT: stats panel (xl+ only) ════════════════════════════════ */}
        <aside className="hidden xl:flex xl:flex-col xl:gap-4 xl:sticky xl:top-[49px] xl:self-start xl:max-h-[calc(100vh-49px)] xl:overflow-y-auto xl:pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          {/* Summary counts */}
          {!loading && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: tasks.filter((t) => t.status === "active").length, label: "Active", color: "text-accent" },
                  { value: tasks.filter((t) => t.status === "someday").length, label: "Someday", color: "text-amber-400" },
                  { value: tasks.length, label: "Total", color: "text-white/60" },
                  { value: dupeCount, label: "Dupe groups", color: "text-yellow-400" },
                ].map(({ value, label, color }) => (
                  <div key={label} className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#13131c] px-3 py-3.5">
                    <span className={`text-2xl font-bold tabular-nums leading-none ${color}`}>{value}</span>
                    <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/30">{label}</span>
                  </div>
                ))}
              </div>

              {/* Duplicate alert */}
              {dupeCount > 0 && (
                <div className="rounded-2xl border border-yellow-800/20 bg-yellow-950/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-yellow-400 shrink-0">
                      <path d="M7 2v4M7 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    <span className="text-xs font-semibold text-yellow-400/80">Duplicate tasks found</span>
                  </div>
                  <p className="text-[11px] text-white/35 leading-relaxed">
                    {dupeCount} group{dupeCount !== 1 ? "s" : ""} of tasks with identical titles. Review and delete duplicates to keep your list clean.
                  </p>
                </div>
              )}

              {/* Tips */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-3">Tips</p>
                <div className="space-y-2.5">
                  {[
                    { icon: "⚡", tip: "Use the filter to focus on Someday tasks for your weekly review" },
                    { icon: "🗑️", tip: "Duplicate tasks are highlighted in yellow — delete the extras" },
                    { icon: "📅", tip: "Move tasks to Someday to park them without deleting" },
                  ].map(({ icon, tip }) => (
                    <div key={tip} className="flex items-start gap-2">
                      <span className="text-sm shrink-0 leading-none mt-0.5">{icon}</span>
                      <span className="text-[11px] text-white/30 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
