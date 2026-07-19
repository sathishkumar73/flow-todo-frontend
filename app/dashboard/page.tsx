"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { createApi } from "@/lib/api";
import type { Task } from "@/lib/types";
import BrainDump from "../components/BrainDump";

// ── Types ──────────────────────────────────────────────────────────────────
interface Routine {
  id: number;
  title: string;
  frequency: "daily" | "weekdays" | "weekly" | "monthly";
  day_of_week: number | null;
  day_of_month: number | null;
  is_done_today: boolean;
  is_due_today: boolean;
  last_done_at: string | null;
  created_at: string;
}

interface DashboardStats {
  active: number;
  completed_today: number;
  completed_week: number;
  someday: number;
  ai_scored: number;
  eisenhower: Record<string, number>;
  impact_effort: Record<string, number>;
  daily_completions: { date: string; count: number }[];
  top_tasks: { id: number; title: string; priority_score: number; eisenhower_quadrant: string | null }[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const DAY_CHARS = ["S", "M", "T", "W", "T", "F", "S"];
const FREQ_LABELS: Record<string, string> = {
  daily: "Every day", weekdays: "Weekdays", weekly: "Weekly", monthly: "Monthly",
};

function greeting(name: string) {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return name ? `${g}, ${name}` : g;
}

function isToday(iso: string) {
  return iso.startsWith(new Date().toISOString().slice(0, 10));
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Skeleton({ cls }: { cls: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.05] ${cls}`} />;
}

function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-[80px] items-end gap-1.5">
      {data.map((d, i) => {
        const barH = Math.round((d.count / max) * 56);
        const isLast = i === data.length - 1;
        const dayChar = DAY_CHARS[new Date(d.date + "T12:00:00").getDay()];
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            {d.count > 0 ? <span className="text-[9px] text-white/30">{d.count}</span> : <span className="text-[9px]">&nbsp;</span>}
            <div className="flex w-full flex-col justify-end" style={{ height: 52 }}>
              <div className={`w-full rounded-t-md ${isLast ? "bg-accent" : d.count > 0 ? "bg-white/20" : "bg-white/[0.05]"}`}
                style={{ height: Math.max(barH, d.count > 0 ? 4 : 2) }} />
            </div>
            <span className={`text-[9px] font-medium ${isLast ? "text-accent" : "text-white/25"}`}>{dayChar}</span>
          </div>
        );
      })}
    </div>
  );
}

function RingChart({ value, max }: { value: number; max: number }) {
  const r = 30, circ = 2 * Math.PI * r;
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  const pct = Math.round(ratio * 100);
  return (
    <div className="relative h-[76px] w-[76px]">
      <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <circle cx="38" cy="38" r={r} fill="none" stroke="#2563eb" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ratio)}
          className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[15px] font-bold tabular-nums text-ink leading-none">{pct}%</span>
      </div>
    </div>
  );
}

const EIS_CLS: Record<string, string> = {
  do_first: "bg-red-950/60 text-red-400 border-red-800/40",
  schedule: "bg-blue-950/60 text-blue-400 border-blue-800/40",
  delegate: "bg-amber-950/60 text-amber-400 border-amber-800/40",
  eliminate: "bg-white/5 text-white/30 border-white/10",
};
const EIS_SHORT: Record<string, string> = {
  do_first: "Do First", schedule: "Schedule", delegate: "Delegate", eliminate: "Eliminate",
};
const EIS_CELLS = [
  { key: "do_first",  label: "Do First",  bg: "bg-red-950/40",    border: "border-red-800/25",    tc: "text-red-400" },
  { key: "schedule",  label: "Schedule",  bg: "bg-blue-950/40",   border: "border-blue-800/25",   tc: "text-blue-400" },
  { key: "delegate",  label: "Delegate",  bg: "bg-amber-950/40",  border: "border-amber-800/25",  tc: "text-amber-400" },
  { key: "eliminate", label: "Eliminate", bg: "bg-surface",       border: "border-white/[0.08]",  tc: "text-white/35" },
];
const IE_CELLS = [
  { key: "quick_win",     label: "Quick Win",  bg: "bg-green-950/40",  border: "border-green-800/25",  tc: "text-green-400" },
  { key: "major_project", label: "Big Bet",    bg: "bg-purple-950/40", border: "border-purple-800/25", tc: "text-purple-400" },
  { key: "fill_in",       label: "Fill-in",    bg: "bg-surface",       border: "border-white/[0.08]",  tc: "text-white/35" },
  { key: "thankless",     label: "Thankless",  bg: "bg-red-950/20",    border: "border-red-900/20",    tc: "text-red-500/60" },
];

function MatrixGrid({ cells, data }: { cells: typeof EIS_CELLS; data: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {cells.map((c) => (
        <div key={c.key} className={`rounded-xl border ${c.bg} ${c.border} px-3 py-2.5`}>
          <div className={`text-xl font-bold tabular-nums leading-none ${c.tc}`}>{data[c.key] ?? 0}</div>
          <div className="mt-0.5 text-[11px] font-medium text-white/55 leading-none">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Routine row ──────────────────────────────────────────────────────────────
function RoutineRow({ routine, onToggle, onDelete }: {
  routine: Routine;
  onToggle: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const [pending, setPending] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function toggle() {
    setPending(true);
    try { await onToggle(routine.id, routine.is_done_today); } finally { setPending(false); }
  }

  return (
    <li className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
      routine.is_done_today
        ? "border-green-900/25 bg-green-950/10"
        : "border-white/[0.08] bg-surface hover:bg-surface-2"
    }`}>
      <button type="button" onClick={toggle} disabled={pending}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          routine.is_done_today
            ? "border-green-500 bg-green-500/20"
            : "border-white/25 hover:border-green-400 hover:bg-green-950/30"
        } disabled:opacity-50`}>
        {routine.is_done_today && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5l2 2L7.5 2" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span className={`flex-1 min-w-0 truncate text-[13px] ${routine.is_done_today ? "text-white/35 line-through decoration-white/20" : "text-white/80"}`}>
        {routine.title}
      </span>
      <span className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/25">
        {FREQ_LABELS[routine.frequency]}
      </span>
      <button type="button"
        onClick={() => setShowDelete(true)}
        className="shrink-0 rounded p-0.5 text-white/15 opacity-0 transition group-hover:opacity-100 hover:text-red-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
      {showDelete && (
        <div className="absolute z-50 ml-2 flex items-center gap-1 rounded-lg border border-red-900/30 bg-surface-2 px-2 py-1 shadow-lg">
          <span className="text-[11px] text-white/50">Delete?</span>
          <button onClick={() => onDelete(routine.id)} className="text-[11px] text-red-400 hover:text-red-300 font-medium">Yes</button>
          <button onClick={() => setShowDelete(false)} className="text-[11px] text-white/30 hover:text-white/60">No</button>
        </div>
      )}
    </li>
  );
}

// ── Today task row (quick complete) ─────────────────────────────────────────
function TodayTaskRow({ task, onComplete }: { task: Task; onComplete: (id: number) => void }) {
  const [done, setDone] = useState(false);
  const eiCls = task.eisenhower_quadrant ? EIS_CLS[task.eisenhower_quadrant] : null;
  const eiLabel = task.eisenhower_quadrant ? EIS_SHORT[task.eisenhower_quadrant] : null;

  function handle() {
    setDone(true);
    setTimeout(() => onComplete(task.id), 280);
  }

  return (
    <li className={`group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-surface px-3 py-2.5 transition-all duration-300 ${done ? "opacity-0 scale-95" : "hover:bg-surface-2"}`}>
      <button type="button" onClick={handle}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white/25 transition hover:border-green-400 hover:bg-green-950/30" />
      <span className="flex-1 min-w-0 truncate text-[13px] text-white/80">{task.title}</span>
      {eiCls && eiLabel && (
        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${eiCls}`}>{eiLabel}</span>
      )}
    </li>
  );
}

// ── Add routine form ────────────────────────────────────────────────────────
function AddRoutineForm({ onAdd, onClose }: { onAdd: (title: string, freq: string) => Promise<void>; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [freq, setFreq] = useState<"daily" | "weekdays" | "weekly" | "monthly">("daily");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try { await onAdd(title.trim(), freq); onClose(); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="mt-2 animate-slide-down rounded-xl border border-accent/20 bg-surface-2 p-3">
      <input ref={ref} value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Routine name…"
        className="w-full rounded-lg border border-white/[0.09] bg-surface px-3 py-2 text-sm text-ink placeholder-white/20 outline-none focus:border-accent/50" />
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 items-center rounded-full border border-white/[0.09] bg-surface p-0.5">
          {(["daily", "weekdays", "weekly"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFreq(f)}
              className={`flex-1 rounded-full py-1 text-[11px] font-medium transition-all ${freq === f ? "bg-accent text-white" : "text-white/35 hover:text-white/60"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/25 hover:text-white/60">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
        <button type="submit" disabled={!title.trim() || saving}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">
          {saving ? "…" : "Add"}
        </button>
      </div>
    </form>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const api = useMemo(() => createApi(() => getToken()), [getToken]);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDump, setShowDump] = useState(false);
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchAll = useCallback(async () => {
    const [s, t, r] = await Promise.allSettled([
      api.get<DashboardStats>("/api/v1/tasks/stats"),
      api.get<{ tasks: Task[] }>("/api/v1/tasks"),
      api.get<{ routines: Routine[] }>("/api/v1/routines"),
    ]);
    if (s.status === "fulfilled") setStats(s.value);
    if (t.status === "fulfilled") setTasks(t.value.tasks ?? []);
    if (r.status === "fulfilled") setRoutines(r.value.routines ?? []);
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Refresh on tab focus
  useEffect(() => {
    const handler = () => { if (document.visibilityState === "visible") fetchAll(); };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [fetchAll]);

  const todayTasks = useMemo(() =>
    tasks.filter((t) => t.status === "active" && isToday(t.created_at))
      .sort((a, b) => b.stack_position - a.stack_position)
      .slice(0, 8),
    [tasks]
  );

  const dueRoutines = routines.filter((r) => r.is_due_today);

  async function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = quickTitle.trim();
    if (!title || adding) return;
    setAdding(true);
    setQuickTitle("");
    try {
      const data = await api.post<{ task: Task }>("/api/v1/tasks", { title });
      if (data.task) {
        setTasks((prev) => [data.task, ...prev]);
        setStats((prev) => prev ? { ...prev, active: prev.active + 1 } : prev);
      }
    } finally { setAdding(false); }
  }

  async function completeTask(id: number) {
    await api.patch(`/api/v1/tasks/${id}`, { status: "done" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setStats((prev) => prev ? {
      ...prev,
      active: Math.max(0, prev.active - 1),
      completed_today: prev.completed_today + 1,
      completed_week: prev.completed_week + 1,
    } : prev);
  }

  async function bulkAdd(titles: string[]): Promise<number> {
    const data = await api.post<{ tasks: Task[]; count: number }>("/api/v1/tasks/bulk", { titles });
    if (data.tasks?.length) {
      setTasks((prev) => [...data.tasks, ...prev]);
      setStats((prev) => prev ? { ...prev, active: prev.active + data.tasks.length } : prev);
    }
    return data.count ?? titles.length;
  }

  const toggleRoutine = useCallback(async (id: number, isDone: boolean) => {
    const data = isDone
      ? await api.delete<{ routine: Routine }>(`/api/v1/routines/${id}/done`)
      : await api.post<{ routine: Routine }>(`/api/v1/routines/${id}/done`, {});
    if (data.routine) setRoutines((prev) => prev.map((r) => r.id === id ? data.routine : r));
  }, [api]);

  const addRoutine = useCallback(async (title: string, frequency: string) => {
    const data = await api.post<{ routine: Routine }>("/api/v1/routines", { title, frequency });
    if (data.routine) setRoutines((prev) => [...prev, data.routine]);
  }, [api]);

  const deleteRoutine = useCallback(async (id: number) => {
    await api.delete(`/api/v1/routines/${id}`);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }, [api]);

  const doneRoutineCount = dueRoutines.filter((r) => r.is_done_today).length;

  return (
    <>
      {showDump && (
        <BrainDump onSubmit={bulkAdd} onClose={() => { setShowDump(false); fetchAll(); }} />
      )}

      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0f0f14]/92 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-purple-600">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[15px] font-semibold text-ink">Flow Todo</span>
            </div>
            <span className="hidden lg:block text-sm font-semibold text-white/30">Home</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDump(true)} type="button"
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.09] bg-surface px-3 py-1.5 text-xs font-medium text-white/50 transition hover:border-accent/30 hover:text-accent">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8 2 5 5 5 9c0 2.4 1.1 4.5 2.8 5.9L8 18h8l.2-3.1C17.9 13.5 19 11.4 19 9c0-4-3-7-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Brain Dump
              </button>
              <button onClick={fetchAll} type="button" title="Refresh"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.09] bg-surface text-white/30 transition hover:text-white/60">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 space-y-5">

          {/* ── Greeting ── */}
          <div>
            <h1 className="text-xl font-bold text-ink">{greeting(user?.firstName ?? "")} 👋</h1>
            <p className="text-sm text-white/35">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* ── Quick capture ── */}
          <form onSubmit={quickAdd} className="relative">
            <input value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Quick capture — what needs to happen?"
              className="w-full rounded-2xl border border-white/[0.09] bg-surface px-4 py-3.5 pr-24 text-[15px] text-ink placeholder-white/20 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
            {quickTitle.trim() && (
              <button type="submit" disabled={adding}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50">
                {adding ? "…" : "Add"}
              </button>
            )}
          </form>

          {/* ── Today section ── */}
          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Today</span>
                {dueRoutines.length > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    doneRoutineCount === dueRoutines.length
                      ? "bg-green-950/40 text-green-400"
                      : "bg-accent/10 text-accent"
                  }`}>
                    {doneRoutineCount}/{dueRoutines.length} routines
                  </span>
                )}
              </div>
              <button type="button" onClick={() => setShowAddRoutine((v) => !v)}
                className="flex items-center gap-1 text-[11px] text-white/30 transition hover:text-accent">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                Add routine
              </button>
            </div>

            {showAddRoutine && (
              <AddRoutineForm onAdd={addRoutine} onClose={() => setShowAddRoutine(false)} />
            )}

            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} cls="h-10" />)}
              </div>
            ) : (dueRoutines.length === 0 && todayTasks.length === 0) ? (
              <div className="rounded-xl border border-white/[0.07] bg-surface px-4 py-5 text-center">
                <p className="text-sm text-white/30">Nothing captured today yet.</p>
                <p className="mt-0.5 text-[11px] text-white/20">Quick-add above or use Brain Dump.</p>
              </div>
            ) : (
              <ul className="space-y-1.5 relative">
                {dueRoutines.map((r) => (
                  <RoutineRow key={r.id} routine={r} onToggle={toggleRoutine} onDelete={deleteRoutine} />
                ))}
                {todayTasks.map((t) => (
                  <TodayTaskRow key={t.id} task={t} onComplete={completeTask} />
                ))}
              </ul>
            )}
          </section>

          {/* ── Stat cards ── */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} cls="h-[100px]" />)}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { value: stats.active, label: "Active", href: "/dashboard/tasks", color: "text-accent" },
                { value: stats.completed_today, label: "Done today", href: "/dashboard/tasks", color: "text-green-400" },
                { value: stats.completed_week, label: "This week", href: "/dashboard/tasks", color: "text-emerald-400" },
                { value: stats.someday, label: "Someday", href: "/dashboard/search?filter=someday", color: "text-amber-400" },
              ].map(({ value, label, href, color }) => (
                <Link key={label} href={href}
                  className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-surface p-4 transition hover:border-white/[0.14] hover:bg-surface-2">
                  <div className={`text-3xl font-bold tabular-nums leading-none ${color}`}>{value}</div>
                  <div className="mt-2 text-[11px] font-medium text-white/40">{label}</div>
                </Link>
              ))}
            </div>
          )}

          {/* ── Charts ── */}
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton cls="h-[150px]" /><Skeleton cls="h-[150px]" />
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-white/50">Completed last 7 days</span>
                  <span className="text-[11px] text-white/25">{stats.daily_completions.reduce((s, d) => s + d.count, 0)} total</span>
                </div>
                <BarChart data={stats.daily_completions} />
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
                <div className="mb-3"><span className="text-[12px] font-semibold text-white/50">AI scoring coverage</span></div>
                <div className="flex items-center gap-4">
                  <RingChart value={stats.ai_scored} max={stats.active} />
                  <div className="flex-1 space-y-2.5">
                    {[
                      { label: "Scored", value: stats.ai_scored, cls: "bg-accent" },
                      { label: "Pending", value: stats.active - stats.ai_scored, cls: "bg-white/20" },
                    ].map(({ label, value, cls }) => (
                      <div key={label}>
                        <div className="flex justify-between text-[11px] text-white/40 mb-1">
                          <span>{label}</span><span className="font-medium text-ink">{value}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                          <div className={`h-full rounded-full transition-all duration-700 ${cls}`}
                            style={{ width: stats.active > 0 ? `${(value / stats.active) * 100}%` : "0%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 2×2 matrices ── */}
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton cls="h-[180px]" /><Skeleton cls="h-[180px]" />
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-white/50">Eisenhower matrix</span>
                  {(stats.eisenhower["none"] ?? 0) > 0 && (
                    <span className="text-[10px] text-white/20">+{stats.eisenhower["none"]} unscored</span>
                  )}
                </div>
                <MatrixGrid cells={EIS_CELLS} data={stats.eisenhower} />
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-white/50">Impact × Effort</span>
                  {(stats.impact_effort["none"] ?? 0) > 0 && (
                    <span className="text-[10px] text-white/20">+{stats.impact_effort["none"]} unscored</span>
                  )}
                </div>
                <MatrixGrid cells={IE_CELLS} data={stats.impact_effort} />
              </div>
            </div>
          )}

          {/* ── Top priority ── */}
          {!loading && stats && stats.top_tasks.length > 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white/50">Top priority</span>
                <Link href="/dashboard/tasks?mode=priority" className="text-[11px] text-accent/70 hover:text-accent transition">View all →</Link>
              </div>
              <ol className="space-y-2">
                {stats.top_tasks.map((t, i) => {
                  const eiCls = t.eisenhower_quadrant ? EIS_CLS[t.eisenhower_quadrant] : null;
                  const eiLabel = t.eisenhower_quadrant ? EIS_SHORT[t.eisenhower_quadrant] : null;
                  return (
                    <li key={t.id} className="flex items-center gap-3">
                      <span className="w-4 shrink-0 text-center text-[11px] font-bold text-white/20">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-white/80">{t.title}</span>
                      {eiCls && eiLabel && (
                        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${eiCls}`}>{eiLabel}</span>
                      )}
                      <span className="shrink-0 text-[11px] tabular-nums text-white/20">{t.priority_score}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* ── Bottom nav shortcuts ── */}
          {!loading && (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/tasks"
                className="flex items-center justify-center gap-2 rounded-2xl border border-accent/25 bg-accent/8 py-3 text-sm font-semibold text-accent transition hover:bg-accent/15">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Task Board
              </Link>
              <Link href="/dashboard/search"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.09] bg-surface py-3 text-sm font-medium text-white/45 transition hover:border-white/[0.15] hover:text-white/70">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
                  <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
                Search & Review
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
