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

export default function TodayPage() {
  const { getToken } = useAuth();
  const api = createApi(getToken);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pinningId, setPinningId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<{ tasks: Task[] }>("/api/v1/tasks/today");
      setTasks(res.tasks);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const res = await api.post<{ task: Task }>("/api/v1/tasks", {
        title,
        focus_today: true,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === optimistic.id ? res.task : t))
      );
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
      setInput(title);
    } finally {
      setAdding(false);
    }
  }

  async function completeTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.patch(`/api/v1/tasks/${id}`, { status: "done" });
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
      setAllTasks(
        res.tasks.filter(
          (t) => t.status === "active" && !pinnedIds.has(t.id)
        )
      );
    } finally {
      setPickerLoading(false);
    }
  }

  async function pinExisting(id: number) {
    setPinningId(id);
    try {
      const res = await api.post<{ task: Task }>(
        `/api/v1/tasks/${id}/pin`,
        {}
      );
      setTasks((prev) => [res.task, ...prev]);
      setAllTasks((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setPinningId(null);
    }
  }

  const filteredPicker = allTasks.filter((t) =>
    t.title.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const quadrantColor: Record<string, string> = {
    do_first: "bg-red-500/20 text-red-400",
    schedule: "bg-yellow-500/20 text-yellow-400",
    delegate: "bg-blue-500/20 text-blue-400",
    eliminate: "bg-white/10 text-white/40",
    quick_win: "bg-emerald-500/20 text-emerald-400",
    major_project: "bg-purple-500/20 text-purple-400",
    fill_in: "bg-sky-500/20 text-sky-400",
    thankless: "bg-white/10 text-white/40",
  };

  function quadrantLabel(q: string | null) {
    if (!q) return null;
    const labels: Record<string, string> = {
      do_first: "Do First",
      schedule: "Schedule",
      delegate: "Delegate",
      eliminate: "Eliminate",
      quick_win: "Quick Win",
      major_project: "Major",
      fill_in: "Fill In",
      thankless: "Thankless",
    };
    return labels[q] ?? q;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Today&apos;s Dump</h1>
        <p className="text-sm text-ink-2 mt-0.5">{todayLabel()}</p>
      </div>

      {/* Quick add */}
      <form onSubmit={addTask} className="mb-6">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add to today's focus…"
            className="flex-1 rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink placeholder-ink-3 outline-none ring-1 ring-white/10 focus:ring-accent transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || adding}
            className="rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition hover:bg-accent/80 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </form>

      {/* Task list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-surface-2 animate-pulse"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="text-4xl opacity-30">☀️</div>
          <p className="text-sm text-ink-2">Nothing pinned to today yet.</p>
          <p className="text-xs text-ink-3">
            Add tasks above or pull from your list below.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 mb-6">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-start gap-3 rounded-xl bg-surface-2 px-4 py-3.5 ring-1 ring-white/5 transition hover:ring-white/10"
            >
              {/* Complete checkbox */}
              <button
                onClick={() => completeTask(task.id)}
                className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded-full border border-white/25 transition hover:border-emerald-400 hover:bg-emerald-400/10"
                title="Mark done"
              >
                <span className="sr-only">Complete</span>
              </button>

              {/* Title + badges */}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink leading-snug">{task.title}</p>
                {(task.eisenhower_quadrant || task.impact_effort_quadrant) && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {task.eisenhower_quadrant && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${quadrantColor[task.eisenhower_quadrant] ?? ""}`}
                      >
                        {quadrantLabel(task.eisenhower_quadrant)}
                      </span>
                    )}
                    {task.impact_effort_quadrant && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${quadrantColor[task.impact_effort_quadrant] ?? ""}`}
                      >
                        {quadrantLabel(task.impact_effort_quadrant)}
                      </span>
                    )}
                    {task.duration_minutes && (
                      <span className="inline-flex items-center rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/40">
                        {task.duration_minutes}m
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Unpin */}
              <button
                onClick={() => unpinTask(task.id)}
                className="shrink-0 rounded-lg p-1.5 text-white/20 opacity-0 transition hover:bg-white/5 hover:text-white/50 group-hover:opacity-100"
                title="Remove from today"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Pick from task list */}
      <div className="rounded-xl ring-1 ring-white/8 overflow-hidden">
        <button
          onClick={showPicker ? () => setShowPicker(false) : openPicker}
          className="flex w-full items-center justify-between px-4 py-3.5 text-sm text-ink-2 hover:bg-surface-2 transition"
        >
          <span className="font-medium">Add from task list</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-transform ${showPicker ? "rotate-180" : ""}`}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {showPicker && (
          <div className="border-t border-white/8">
            <div className="px-3 py-2">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search tasks…"
                autoFocus
                className="w-full rounded-lg bg-surface px-3 py-2 text-sm text-ink placeholder-ink-3 outline-none ring-1 ring-white/10 focus:ring-accent transition"
              />
            </div>

            {pickerLoading ? (
              <div className="px-4 py-6 text-center text-sm text-ink-3">
                Loading…
              </div>
            ) : filteredPicker.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-ink-3">
                {pickerSearch ? "No matching tasks" : "All active tasks are already in today's dump"}
              </div>
            ) : (
              <ul className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
                {filteredPicker.map((task) => (
                  <li key={task.id}>
                    <button
                      onClick={() => pinExisting(task.id)}
                      disabled={pinningId === task.id}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-surface-2 disabled:opacity-50"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="shrink-0 text-accent"
                      >
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="min-w-0 flex-1 truncate text-ink">
                        {task.title}
                      </span>
                      {task.eisenhower_quadrant && (
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${quadrantColor[task.eisenhower_quadrant] ?? ""}`}
                        >
                          {quadrantLabel(task.eisenhower_quadrant)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Progress summary */}
      {!loading && tasks.length > 0 && (
        <p className="mt-6 text-center text-xs text-ink-3">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} in focus today
        </p>
      )}
    </div>
  );
}
