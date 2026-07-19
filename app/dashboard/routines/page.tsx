"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApi } from "@/lib/api";

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

const FREQ_LABELS: Record<string, string> = {
  daily: "Every day",
  weekdays: "Weekdays (Mon–Fri)",
  weekly: "Weekly",
  monthly: "Monthly",
};
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Skeleton({ cls }: { cls: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.05] ${cls}`} />;
}

function RoutineCard({
  routine,
  onToggle,
  onDelete,
}: {
  routine: Routine;
  onToggle: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function toggle() {
    setPending(true);
    try { await onToggle(routine.id, routine.is_done_today); } finally { setPending(false); }
  }

  function freqDetail() {
    if (routine.frequency === "weekly" && routine.day_of_week != null)
      return `Every ${DAY_NAMES[routine.day_of_week]}`;
    if (routine.frequency === "monthly" && routine.day_of_month != null)
      return `Day ${routine.day_of_month} of each month`;
    return FREQ_LABELS[routine.frequency];
  }

  return (
    <li className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
      routine.is_done_today && routine.is_due_today
        ? "border-green-900/25 bg-green-950/10"
        : "border-white/[0.08] bg-surface hover:bg-surface-2"
    }`}>
      {/* Done toggle */}
      {routine.is_due_today ? (
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
      ) : (
        <div className="h-5 w-5 shrink-0 rounded-full border-2 border-white/[0.08]" />
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className={`text-[14px] font-medium leading-snug ${
          routine.is_done_today && routine.is_due_today ? "text-white/35 line-through" : "text-white/85"
        }`}>
          {routine.title}
        </p>
        <p className="mt-0.5 text-[11px] text-white/30">{freqDetail()}</p>
      </div>

      {/* Status badge */}
      {routine.is_due_today ? (
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
          routine.is_done_today
            ? "border-green-900/30 bg-green-950/20 text-green-400/70"
            : "border-accent/20 bg-accent/10 text-accent/80"
        }`}>
          {routine.is_done_today ? "Done" : "Due today"}
        </span>
      ) : (
        <span className="shrink-0 rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/20">
          Not today
        </span>
      )}

      {/* Delete */}
      {confirming ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-white/40">Delete?</span>
          <button onClick={() => onDelete(routine.id)} className="text-[11px] font-semibold text-red-400 hover:text-red-300">Yes</button>
          <button onClick={() => setConfirming(false)} className="text-[11px] text-white/30 hover:text-white/60">No</button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)}
          className="shrink-0 rounded-lg p-1.5 text-white/15 transition hover:bg-red-950/30 hover:text-red-400">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 3.5h9M5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M5.5 6v4.5M8.5 6v4.5M3.5 3.5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </li>
  );
}

export default function RoutinesPage() {
  const { getToken, isLoaded } = useAuth();
  const api = useMemo(() => createApi(() => getToken()), [getToken]);

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [freq, setFreq] = useState<"daily" | "weekdays" | "weekly" | "monthly">("daily");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    api.get<{ routines: Routine[] }>("/api/v1/routines")
      .then((d) => setRoutines(d.routines ?? []))
      .finally(() => setLoading(false));
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const dueToday = useMemo(() => routines.filter((r) => r.is_due_today), [routines]);
  const doneCount = useMemo(() => dueToday.filter((r) => r.is_done_today).length, [dueToday]);

  async function addRoutine(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const data = await api.post<{ routine: Routine }>("/api/v1/routines", { title: trimmed, frequency: freq });
      if (data.routine) setRoutines((prev) => [...prev, data.routine]);
      setTitle("");
    } finally { setSaving(false); }
  }

  const handleToggle = useCallback(async (id: number, isDone: boolean) => {
    const data = isDone
      ? await api.delete<{ routine: Routine }>(`/api/v1/routines/${id}/done`)
      : await api.post<{ routine: Routine }>(`/api/v1/routines/${id}/done`, {});
    if (data.routine) setRoutines((prev) => prev.map((r) => (r.id === id ? data.routine : r)));
  }, [api]);

  const handleDelete = useCallback(async (id: number) => {
    await api.delete(`/api/v1/routines/${id}`);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }, [api]);

  return (
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
          <span className="hidden lg:block text-sm font-semibold text-white/30">Routines</span>
          {dueToday.length > 0 && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              doneCount === dueToday.length
                ? "bg-green-950/40 text-green-400"
                : "bg-accent/10 text-accent"
            }`}>
              {doneCount}/{dueToday.length} done today
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 xl:grid xl:grid-cols-[1fr_360px] xl:gap-6 xl:items-start px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-8 max-w-[1440px] mx-auto w-full">

        {/* ═══ LEFT: add form + due today ════════════════════════════════════ */}
        <div className="space-y-5 min-w-0">
          {/* Add routine form */}
          <form onSubmit={addRoutine} className="rounded-2xl border border-white/[0.08] bg-surface p-4">
            <p className="mb-3 text-[12px] font-semibold text-white/40">New routine</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning standup, Check emails, Review metrics…"
              className="w-full rounded-xl border border-white/[0.09] bg-surface-2 px-4 py-2.5 text-sm text-ink placeholder-white/20 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
            <div className="mt-3 flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-full border border-white/[0.09] bg-surface-2 p-0.5">
                {(["daily", "weekdays", "weekly"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setFreq(f)}
                    className={`flex-1 rounded-full py-1.5 text-[11px] font-medium transition-all ${
                      freq === f ? "bg-accent text-white" : "text-white/35 hover:text-white/60"
                    }`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={!title.trim() || saving}
                className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-40">
                {saving ? "Adding…" : "Add"}
              </button>
            </div>
          </form>

          {/* Today's due routines */}
          {!loading && dueToday.length > 0 && (
            <section>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Due today</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${(doneCount / dueToday.length) * 100}%` }} />
                </div>
                <span className="text-[11px] tabular-nums text-white/25">{doneCount}/{dueToday.length}</span>
              </div>
              <ul className="space-y-1.5">
                {dueToday.map((r) => (
                  <RoutineCard key={r.id} routine={r} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </ul>
            </section>
          )}

          {/* Mobile-only: all routines */}
          <section className="xl:hidden">
            <div className="mb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">All routines</span>
            </div>
            {loading ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} cls="h-14" />)}</div>
            ) : routines.length === 0 ? (
              <div className="rounded-xl border border-white/[0.07] bg-surface px-5 py-8 text-center">
                <p className="text-[13px] text-white/30">No routines yet.</p>
                <p className="mt-1 text-[11px] text-white/20">Add habits above — they'll appear in your daily Home view.</p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {routines.map((r) => (
                  <RoutineCard key={r.id} routine={r} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ═══ RIGHT: all routines library + stats (xl+ only) ═══════════════ */}
        <aside className="hidden xl:flex xl:flex-col xl:gap-4 xl:sticky xl:top-[49px] xl:self-start xl:max-h-[calc(100vh-49px)] xl:overflow-y-auto xl:pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          {/* Stats summary */}
          {!loading && (
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#13131c] px-3 py-3.5">
                <span className="text-2xl font-bold tabular-nums text-accent">{routines.length}</span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/30">Total</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#13131c] px-3 py-3.5">
                <span className="text-2xl font-bold tabular-nums text-green-400">{doneCount}</span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/30">Done</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#13131c] px-3 py-3.5">
                <span className="text-2xl font-bold tabular-nums text-white/60">{dueToday.length}</span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/30">Due today</span>
              </div>
            </div>
          )}

          {/* All routines library */}
          <div className="rounded-2xl border border-white/[0.09] bg-[#13131c] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">All routines</span>
            </div>
            {loading ? (
              <div className="p-3 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} cls="h-14" />)}</div>
            ) : routines.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[13px] text-white/30">No routines yet.</p>
                <p className="mt-1 text-[11px] text-white/20">Add habits to see them here.</p>
              </div>
            ) : (
              <ul className="p-3 space-y-1.5">
                {routines.map((r) => (
                  <RoutineCard key={r.id} routine={r} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
