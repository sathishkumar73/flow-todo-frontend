"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { createApi } from "../../../lib/api";
import type { Task } from "../../../lib/types";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatHistoryDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

interface DumpDay {
  date: string;
  tasks: Task[];
}

// ── Task row for today's list ──────────────────────────────────────────────
function DumpTaskRow({
  task,
  onComplete,
  onUnpin,
}: {
  task: Task;
  onComplete: (id: number) => void;
  onUnpin: (id: number) => void;
}) {
  const done = task.status === "done";
  return (
    <li className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
      done
        ? "border-white/[0.05] bg-white/[0.02] opacity-60"
        : "border-white/[0.09] bg-[#13131c] hover:border-white/[0.14]"
    }`}>
      {/* Checkbox */}
      <button
        onClick={() => !done && onComplete(task.id)}
        disabled={done}
        className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
          done
            ? "border-emerald-500 bg-emerald-500/20"
            : "border-white/25 hover:border-emerald-400 hover:bg-emerald-400/10"
        }`}
        title={done ? "Done" : "Mark done"}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${done ? "line-through text-white/30" : "text-white/85"}`}>
          {task.title}
        </p>
        {done && task.completed_at && (
          <p className="text-[11px] text-white/25 mt-0.5">Done at {formatTime(task.completed_at)}</p>
        )}
        {!done && (task.eisenhower_quadrant || task.impact_effort_quadrant) && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {task.eisenhower_quadrant && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-500/15 text-blue-400">
                {task.eisenhower_quadrant.replace("_", " ")}
              </span>
            )}
            {task.impact_effort_quadrant && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-purple-500/15 text-purple-400">
                {task.impact_effort_quadrant.replace("_", " ")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Unpin — only for active tasks, shown on hover */}
      {!done && (
        <button
          onClick={() => onUnpin(task.id)}
          className="shrink-0 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-white/20 hover:text-white/50 hover:bg-white/5 transition"
          title="Remove from today"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </li>
  );
}

// ── History day card ───────────────────────────────────────────────────────
function HistoryDay({ day }: { day: DumpDay }) {
  const done = day.tasks.filter((t) => t.status === "done");
  const total = day.tasks.length;
  const pct = total > 0 ? Math.round((done.length / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[#13131c] overflow-hidden">
      {/* Date row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white/70">{formatHistoryDate(day.date)}</span>
          <span className="text-xs text-white/30">{done.length}/{total} done</span>
        </div>
        {/* Mini progress bar */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500/70 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] text-white/25 w-7 text-right">{pct}%</span>
        </div>
      </div>

      {/* Tasks */}
      <ul className="divide-y divide-white/[0.04]">
        {day.tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className={`shrink-0 flex items-center justify-center w-4 h-4 rounded-full border ${
              t.status === "done"
                ? "border-emerald-500 bg-emerald-500/20"
                : "border-white/20"
            }`}>
              {t.status === "done" && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4l1.8 2L6.5 2" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`flex-1 min-w-0 text-sm truncate ${t.status === "done" ? "line-through text-white/25" : "text-white/55"}`}>
              {t.title}
            </span>
            {t.status === "done" && t.completed_at && (
              <span className="shrink-0 text-[11px] text-white/20">{formatTime(t.completed_at)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TodayPage() {
  const { getToken } = useAuth();
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
      const [todayRes, streakRes] = await Promise.allSettled([
        api.get<{ tasks: Task[] }>("/api/v1/tasks/today"),
        api.get<{ streak: number }>("/api/v1/tasks/streak"),
      ]);
      if (todayRes.status === "fulfilled") setTasks(todayRes.value.tasks);
      if (streakRes.status === "fulfilled") setStreak(streakRes.value.streak ?? 0);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const res = await api.get<{ history: DumpDay[] }>("/api/v1/tasks/today/history");
      setHistory(res.history ?? []);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    load();
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchView(v: "today" | "history") {
    setView(v);
    if (v === "history" && history.length === 0) loadHistory();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const title = input.trim();
    if (!title || adding) return;
    setAdding(true);
    const optimistic: Task = {
      id: Date.now(),
      title,
      status: "active",
      created_at: new Date().toISOString(),
      completed_at: null,
      eisenhower_quadrant: null,
      impact_effort_quadrant: null,
      priority_score: 0,
      stack_position: 0,
      due_date: null,
      duration_minutes: null,
      ai_rationale: null,
      ai_scored: false,
      last_touched_at: new Date().toISOString(),
      focus_date: new Date().toISOString().slice(0, 10),
    };
    setTasks((prev) => [optimistic, ...prev]);
    setInput("");
    try {
      const res = await api.post<{ task: Task }>("/api/v1/tasks", { title, focus_today: true });
      setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? res.task : t)));
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
      setInput(title);
    } finally {
      setAdding(false);
    }
  }

  async function completeTask(id: number) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "done", completed_at: new Date().toISOString() } : t
      )
    );
    try {
      await api.patch(`/api/v1/tasks/${id}`, { status: "done" });
      api.get<{ streak: number }>("/api/v1/tasks/streak").then((r) => setStreak(r.streak ?? 0)).catch(() => {});
    } catch {
      await load();
    }
  }

  async function unpinTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.delete(`/api/v1/tasks/${id}/pin`);
    } catch {
      await load();
    }
  }

  async function openPicker() {
    setShowPicker(true);
    setPickerLoading(true);
    try {
      const res = await api.get<{ tasks: Task[] }>("/api/v1/tasks");
      const pinnedIds = new Set(tasks.map((t) => t.id));
      setAllTasks(res.tasks.filter((t) => t.status === "active" && !pinnedIds.has(t.id)));
    } finally {
      setPickerLoading(false);
    }
  }

  async function pinExisting(id: number) {
    setPinningId(id);
    try {
      const res = await api.post<{ task: Task }>(`/api/v1/tasks/${id}/pin`, {});
      setTasks((prev) => [res.task, ...prev]);
      setAllTasks((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setPinningId(null);
    }
  }

  const filteredPicker = allTasks.filter((t) =>
    t.title.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white/90">Today&apos;s Dump</h1>
          <p className="text-sm text-white/40 mt-0.5">{todayLabel()}</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
              <span className="text-base leading-none">🔥</span>
              <div>
                <p className="text-sm font-bold leading-none text-orange-400">{streak}</p>
                <p className="text-[10px] text-orange-400/60 mt-0.5">streak</p>
              </div>
            </div>
          )}
          <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
            <button
              onClick={() => switchView("today")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                view === "today" ? "bg-accent text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => switchView("history")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                view === "history" ? "bg-accent text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* ── TODAY VIEW ── */}
      {view === "today" && (
        <>
          {/* Quick add */}
          <form onSubmit={addTask} className="mb-5">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add to today's focus…"
                className="flex-1 rounded-xl border border-white/10 bg-[#13131c] px-4 py-3 text-sm text-white/85 placeholder-white/25 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
              />
              <button
                type="submit"
                disabled={!input.trim() || adding}
                className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/80 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </form>

          {/* Task list */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-2xl border border-white/[0.06] bg-[#13131c] animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="text-4xl opacity-30">☀️</div>
              <p className="text-sm text-white/40">Nothing pinned for today yet.</p>
              <p className="text-xs text-white/25">Add tasks above or pull from your list below.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-5">
              {/* Active */}
              {activeTasks.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-2">
                    Focus — {activeTasks.length} left
                  </p>
                  <ul className="space-y-2">
                    {activeTasks.map((task) => (
                      <DumpTaskRow key={task.id} task={task} onComplete={completeTask} onUnpin={unpinTask} />
                    ))}
                  </ul>
                </div>
              )}

              {/* Done */}
              {doneTasks.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-2">
                    Done today — {doneTasks.length}
                  </p>
                  <ul className="space-y-2">
                    {doneTasks.map((task) => (
                      <DumpTaskRow key={task.id} task={task} onComplete={completeTask} onUnpin={unpinTask} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Add from task list */}
          <div className="rounded-2xl border border-white/[0.09] overflow-hidden">
            <button
              onClick={showPicker ? () => setShowPicker(false) : openPicker}
              className="flex w-full items-center justify-between px-4 py-3.5 text-sm text-white/40 hover:bg-white/[0.03] transition"
            >
              <span className="font-medium">Add from task list</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                className={`transition-transform ${showPicker ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {showPicker && (
              <div className="border-t border-white/[0.06]">
                <div className="px-3 py-2">
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Search tasks…"
                    autoFocus
                    className="w-full rounded-xl border border-white/10 bg-[#0f0f14] px-3 py-2 text-sm text-white/85 placeholder-white/25 outline-none focus:border-accent/50 transition"
                  />
                </div>

                {pickerLoading ? (
                  <div className="px-4 py-6 text-center text-sm text-white/30">Loading…</div>
                ) : filteredPicker.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-white/30">
                    {pickerSearch ? "No matching tasks" : "All active tasks are already in today's dump"}
                  </div>
                ) : (
                  <ul className="max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
                    {filteredPicker.map((task) => (
                      <li key={task.id}>
                        <button
                          onClick={() => pinExisting(task.id)}
                          disabled={pinningId === task.id}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/[0.03] disabled:opacity-50"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span className="min-w-0 flex-1 truncate text-white/70">{task.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {!loading && tasks.length > 0 && (
            <p className="mt-5 text-center text-xs text-white/25">
              {doneTasks.length} of {tasks.length} done today
            </p>
          )}
        </>
      )}

      {/* ── HISTORY VIEW ── */}
      {view === "history" && (
        <>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl border border-white/[0.06] bg-[#13131c] animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="text-4xl opacity-30">📅</div>
              <p className="text-sm text-white/40">No past dumps yet.</p>
              <p className="text-xs text-white/25">Complete tasks today and they'll appear here tomorrow.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((day) => (
                <HistoryDay key={day.date} day={day} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
