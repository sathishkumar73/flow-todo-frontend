"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { createApi } from "../../../lib/api";
import type { Task } from "../../../lib/types";

const FOCUS_LIMIT = 10;

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function fmtDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

interface DumpDay { date: string; tasks: Task[] }

// ── Progress ring ─────────────────────────────────────────────────────────────
function Ring({ done, total }: { done: number; total: number }) {
  const r = 32, circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(done / total, 1) : 0;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="#10b981" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold leading-none text-white/90">{done}</span>
        <span className="text-[10px] text-white/30 leading-none mt-0.5">/{total}</span>
      </div>
    </div>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────
function DumpRow({ task, onComplete, onUnpin }: {
  task: Task; onComplete: (id: number) => void; onUnpin: (id: number) => void;
}) {
  const done = task.status === "done";
  return (
    <li className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all ${
      done
        ? "border-white/[0.05] bg-white/[0.02] opacity-60"
        : "border-white/[0.09] bg-surface hover:border-white/[0.16] hover:bg-surface-2"
    }`}>
      {/* Checkbox — wrapped in 40px touch target */}
      <span className="shrink-0 flex items-center justify-center w-10 h-10 -m-2.5">
        <button onClick={() => !done && onComplete(task.id)} disabled={done}
          className={`flex items-center justify-center w-[22px] h-[22px] rounded-full border-2 transition-all ${
            done ? "border-emerald-500 bg-emerald-500/20" : "border-white/25 hover:border-emerald-400 hover:bg-emerald-400/10"
          }`}>
          {done && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </span>

      <div className="min-w-0 flex-1">
        <p className={`text-[14px] leading-snug ${done ? "line-through text-white/30" : "text-white/85"}`}>
          {task.title}
        </p>
        {done && task.completed_at && (
          <p className="text-[11px] text-white/25 mt-0.5">Done at {fmtTime(task.completed_at)}</p>
        )}
        {!done && (task.eisenhower_quadrant || task.impact_effort_quadrant) && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {task.eisenhower_quadrant && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-500/15 text-blue-400">
                {task.eisenhower_quadrant.replace(/_/g, " ")}
              </span>
            )}
            {task.impact_effort_quadrant && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-purple-500/15 text-purple-400">
                {task.impact_effort_quadrant.replace(/_/g, " ")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Unpin — always visible on touch (sm:opacity-0 sm:group-hover:opacity-100) */}
      {!done && (
        <button onClick={() => onUnpin(task.id)}
          className="shrink-0 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </li>
  );
}

// ── History day ───────────────────────────────────────────────────────────────
function HistoryDay({ day }: { day: DumpDay }) {
  const done = day.tasks.filter((t) => t.status === "done").length;
  const pct = day.tasks.length > 0 ? Math.round((done / day.tasks.length) * 100) : 0;
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-sm font-semibold text-white/70">{fmtDate(day.date)}</span>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-white/30">{done}/{day.tasks.length}</span>
          <div className="w-16 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500/60 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] text-white/20 w-6 text-right">{pct}%</span>
        </div>
      </div>
      <ul className="divide-y divide-white/[0.04]">
        {day.tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className={`shrink-0 flex items-center justify-center w-4 h-4 rounded-full border ${
              t.status === "done" ? "border-emerald-500 bg-emerald-500/20" : "border-white/20"
            }`}>
              {t.status === "done" && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4l1.8 2L6.5 2" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span className={`flex-1 min-w-0 text-[13px] truncate ${t.status === "done" ? "line-through text-white/25" : "text-white/55"}`}>
              {t.title}
            </span>
            {t.status === "done" && t.completed_at && (
              <span className="shrink-0 text-[11px] text-white/20">{fmtTime(t.completed_at)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TodayPage() {
  const { getToken, isLoaded, userId } = useAuth();
  const api = createApi(getToken);

  const [view, setView] = useState<"today" | "history">("today");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<DumpDay[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pinningId, setPinningId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const [tr, sr] = await Promise.allSettled([
        api.get<{ tasks: Task[] }>("/api/v1/tasks/today"),
        api.get<{ streak: number }>("/api/v1/tasks/streak"),
      ]);
      if (tr.status === "fulfilled") setTasks(tr.value.tasks);
      if (sr.status === "fulfilled") setStreak(sr.value.streak ?? 0);
    } finally { setLoading(false); }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const r = await api.get<{ history: DumpDay[] }>("/api/v1/tasks/today/history");
      setHistory(r.history ?? []);
    } finally { setHistoryLoading(false); }
  }

  useEffect(() => {
    if (!isLoaded || !userId) return;
    load();
    loadHistory();
    inputRef.current?.focus();
  }, [isLoaded, userId]); // eslint-disable-line

  function switchView(v: "today" | "history") {
    setView(v);
    if (v === "history" && history.length === 0) loadHistory();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const title = input.trim();
    if (!title || adding) return;
    setAdding(true);
    const opt: Task = {
      id: Date.now(), title, status: "active",
      created_at: new Date().toISOString(), completed_at: null,
      eisenhower_quadrant: null, impact_effort_quadrant: null,
      priority_score: 0, stack_position: 0, due_date: null,
      duration_minutes: null, ai_rationale: null, ai_scored: false,
      last_touched_at: new Date().toISOString(),
      focus_date: new Date().toISOString().slice(0, 10),
    };
    setTasks((p) => [opt, ...p]);
    setInput("");
    try {
      const r = await api.post<{ task: Task }>("/api/v1/tasks", { title, focus_today: true });
      setTasks((p) => p.map((t) => (t.id === opt.id ? r.task : t)));
    } catch {
      setTasks((p) => p.filter((t) => t.id !== opt.id));
      setInput(title);
    } finally { setAdding(false); }
  }

  async function completeTask(id: number) {
    setTasks((p) => p.map((t) => t.id === id ? { ...t, status: "done", completed_at: new Date().toISOString() } : t));
    try {
      await api.patch(`/api/v1/tasks/${id}`, { status: "done" });
      api.get<{ streak: number }>("/api/v1/tasks/streak").then((r) => setStreak(r.streak ?? 0)).catch(() => {});
    } catch { await load(); }
  }

  async function unpinTask(id: number) {
    setTasks((p) => p.filter((t) => t.id !== id));
    try { await api.delete(`/api/v1/tasks/${id}/pin`); } catch { await load(); }
  }

  async function openPicker() {
    setShowPicker(true);
    setPickerLoading(true);
    try {
      const r = await api.get<{ tasks: Task[] }>("/api/v1/tasks");
      const pinned = new Set(tasks.map((t) => t.id));
      setAllTasks(r.tasks.filter((t) => t.status === "active" && !pinned.has(t.id)));
    } finally { setPickerLoading(false); }
  }

  async function pinExisting(id: number) {
    setPinningId(id);
    try {
      const r = await api.post<{ task: Task }>(`/api/v1/tasks/${id}/pin`, {});
      setTasks((p) => [r.task, ...p]);
      setAllTasks((p) => p.filter((t) => t.id !== id));
    } finally { setPinningId(null); }
  }

  const filteredPicker = allTasks.filter((t) =>
    t.title.toLowerCase().includes(pickerSearch.toLowerCase())
  );
  const activeTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const focusTasks = activeTasks.slice(0, FOCUS_LIMIT);
  const overflowTasks = activeTasks.slice(FOCUS_LIMIT);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center border-b border-white/[0.08] bg-[#0f0f14]/92 backdrop-blur-md backdrop-saturate-150">
        <div className="flex items-center justify-between gap-3 px-4 py-3 w-full xl:px-8 sm:px-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-purple-600">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-ink">Flow Todo</span>
          </div>
          {/* Desktop title */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm font-semibold text-white/30">Today&apos;s Dump</span>
            <span className="text-xs text-white/15">·</span>
            <span className="text-xs text-white/20">{todayLabel()}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Streak — always in header */}
            {streak > 0 && (
              <div className="flex items-center gap-1 rounded-xl border border-orange-500/20 bg-orange-500/10 px-2.5 py-1.5">
                <span className="text-sm leading-none">🔥</span>
                <span className="text-sm font-bold text-orange-400 tabular-nums">{streak}</span>
              </div>
            )}
            {/* Today/History toggle */}
            <div className="flex w-full sm:w-auto rounded-xl border border-white/10 bg-surface p-0.5">
              {(["today", "history"] as const).map((v) => (
                <button key={v} onClick={() => switchView(v)}
                  className={`flex-1 sm:flex-none rounded-lg px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-medium capitalize transition ${
                    view === v ? "bg-accent text-white" : "text-white/40 hover:text-white/70"
                  }`}>{v}</button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main — 2-column grid on xl ───────────────────────────────────── */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-8 w-full max-w-[1440px] mx-auto">

        {/* ═══ LEFT: actions ════════════════════════════════════════════════ */}
        <div className="flex flex-col min-w-0">

          {view === "today" && (
            <>
              {/* Mobile-only inline progress bar (xl:hidden) */}
              {!loading && tasks.length > 0 && (
                <div className="xl:hidden flex items-center gap-3 mb-4 rounded-xl border border-white/[0.07] bg-[#13131c] px-4 py-3">
                  {streak > 0 && (
                    <span className="flex items-center gap-1 text-orange-400 text-sm font-bold shrink-0">
                      🔥{streak}
                    </span>
                  )}
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${Math.min((doneTasks.length / FOCUS_LIMIT) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[11px] text-white/40 tabular-nums shrink-0">
                    {doneTasks.length}/{FOCUS_LIMIT}
                  </span>
                </div>
              )}

              {/* Quick-add */}
              <form onSubmit={addTask} className="flex gap-2 mb-5">
                <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Add to today's focus…"
                  className="flex-1 rounded-2xl border border-white/[0.09] bg-surface px-4 py-3.5 text-sm text-ink placeholder-white/25 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
                <button type="submit" disabled={!input.trim() || adding}
                  className="rounded-2xl bg-accent px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-accent/80 disabled:opacity-40">
                  Add
                </button>
              </form>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-[58px] rounded-2xl border border-white/[0.06] bg-surface animate-pulse" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20 text-center rounded-2xl border border-white/[0.07] bg-surface">
                  <div className="text-4xl opacity-30">☀️</div>
                  <p className="text-sm text-white/40">Nothing pinned for today.</p>
                  <p className="text-xs text-white/25">Type above or pull from your task list →</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Focus list — top 10 */}
                  {focusTasks.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-2.5 flex items-center gap-2">
                        Focus — {focusTasks.length}/{FOCUS_LIMIT}
                        {focusTasks.length === FOCUS_LIMIT && activeTasks.length === FOCUS_LIMIT && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </p>
                      <ul className="space-y-2">
                        {focusTasks.map((t) => (
                          <DumpRow key={t.id} task={t} onComplete={completeTask} onUnpin={unpinTask} />
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Overflow — "carry forward tomorrow" */}
                  {overflowTasks.length > 0 && (
                    <details className="rounded-2xl border border-amber-500/20 bg-amber-950/10 overflow-hidden">
                      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none select-none hover:bg-amber-950/20 transition">
                        <span className="text-sm font-medium text-amber-400/80">
                          {overflowTasks.length} more — carry forward tomorrow
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-amber-400/50 transition-transform details-open:rotate-180">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </summary>
                      <ul className="divide-y divide-white/[0.04] px-2 pb-2">
                        {overflowTasks.map((t) => (
                          <DumpRow key={t.id} task={t} onComplete={completeTask} onUnpin={unpinTask} />
                        ))}
                      </ul>
                    </details>
                  )}

                  {/* Done tasks — collapsed */}
                  {doneTasks.length > 0 && (
                    <details>
                      <summary className="flex items-center gap-2 px-1 py-2 cursor-pointer list-none select-none text-[11px] font-semibold uppercase tracking-widest text-white/20 hover:text-white/40 transition">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Done today — {doneTasks.length}
                      </summary>
                      <ul className="mt-2 space-y-1.5 opacity-60">
                        {doneTasks.map((t) => (
                          <DumpRow key={t.id} task={t} onComplete={completeTask} onUnpin={unpinTask} />
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}

              {/* Add from task list */}
              <div className="mt-4 rounded-2xl border border-white/[0.09] overflow-hidden">
                <button onClick={showPicker ? () => setShowPicker(false) : openPicker}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-sm text-white/40 hover:bg-surface transition">
                  <span className="font-medium">Add from task list</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    className={`transition-transform ${showPicker ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showPicker && (
                  <div className="border-t border-white/[0.06]">
                    <div className="px-3 py-2">
                      <input type="text" value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        placeholder="Search tasks…" autoFocus
                        className="w-full rounded-xl border border-white/10 bg-[#0f0f14] px-3 py-2 text-sm text-ink placeholder-white/25 outline-none focus:border-accent/50 transition" />
                    </div>
                    {pickerLoading ? (
                      <div className="px-4 py-5 text-center text-sm text-white/30">Loading…</div>
                    ) : filteredPicker.length === 0 ? (
                      <div className="px-4 py-5 text-center text-sm text-white/30">
                        {pickerSearch ? "No matches" : "All tasks already pinned"}
                      </div>
                    ) : (
                      <ul className="max-h-52 overflow-y-auto divide-y divide-white/[0.04]">
                        {filteredPicker.map((t) => (
                          <li key={t.id}>
                            <button onClick={() => pinExisting(t.id)} disabled={pinningId === t.id}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface disabled:opacity-50">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              <span className="min-w-0 flex-1 truncate text-[13px] text-white/65">{t.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── History view ─────────────────────────────────────────────── */}
          {view === "history" && (
            historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl border border-white/[0.06] bg-surface animate-pulse" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <div className="text-4xl opacity-30">📅</div>
                <p className="text-sm text-white/40">No history yet.</p>
                <p className="text-xs text-white/25">Complete tasks today — they&apos;ll show up here tomorrow.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((day) => <HistoryDay key={day.date} day={day} />)}
              </div>
            )
          )}
        </div>

        {/* ═══ RIGHT: context panel (xl+ only) ══════════════════════════════ */}
        <aside className="hidden xl:flex xl:flex-col xl:gap-4 xl:sticky xl:top-[49px] xl:self-start xl:max-h-[calc(100vh-49px)] xl:overflow-y-auto">

          {/* Progress Ring card */}
          {!loading && (
            <div className="rounded-2xl border border-white/[0.09] bg-[#13131c] p-5">
              <div className="flex items-center gap-5">
                <Ring done={doneTasks.length} total={FOCUS_LIMIT} />
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums text-white/90 leading-none">
                    {doneTasks.length}<span className="text-white/30 text-lg">/{FOCUS_LIMIT}</span>
                  </p>
                  <p className="text-[12px] text-white/40 mt-1">done today</p>
                  {doneTasks.length === FOCUS_LIMIT && (
                    <p className="text-[11px] text-emerald-400 mt-1 font-semibold">Perfect 10! 🎉</p>
                  )}
                </div>
              </div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.min((doneTasks.length / FOCUS_LIMIT) * 100, 100)}%` }} />
              </div>
              <p className="text-[11px] text-white/20 mt-1.5 text-right tabular-nums">
                {Math.round(Math.min(doneTasks.length / FOCUS_LIMIT, 1) * 100)}% of daily quota
              </p>
            </div>
          )}

          {/* Streak + active count */}
          {!loading && (
            <div className="rounded-2xl border border-white/[0.09] bg-[#13131c] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">🔥</span>
                  <div>
                    <p className="text-xl font-bold text-orange-400 leading-none tabular-nums">{streak}</p>
                    <p className="text-[10px] text-orange-400/50 mt-0.5">day streak</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white/80 leading-none tabular-nums">{activeTasks.length}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">active today</p>
                </div>
              </div>
            </div>
          )}

          {/* Tomorrow queue (overflow preview) */}
          {overflowTasks.length > 0 && (
            <div className="rounded-2xl border border-amber-500/15 bg-amber-950/10 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/60 mb-3">
                Tomorrow&apos;s queue
              </p>
              <ul className="space-y-1.5">
                {overflowTasks.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40 shrink-0" />
                    <span className="text-[13px] text-white/40 truncate">{t.title}</span>
                  </li>
                ))}
                {overflowTasks.length > 5 && (
                  <li className="text-[11px] text-white/20 pl-3.5">+{overflowTasks.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          {/* Recent days preview */}
          {history.length > 0 && (
            <div className="rounded-2xl border border-white/[0.09] bg-[#13131c] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-3">Recent days</p>
              <div className="space-y-2">
                {history.slice(0, 4).map((day) => {
                  const d = day.tasks.filter((t) => t.status === "done").length;
                  const pct = day.tasks.length > 0 ? Math.round((d / day.tasks.length) * 100) : 0;
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-[11px] text-white/30 w-[60px] shrink-0">{fmtDate(day.date)}</span>
                      <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full bg-emerald-500/50 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-white/20 w-7 text-right tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
