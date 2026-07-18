"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";

type TriageAction = "do_this_week" | "someday" | "delete";

interface TriagePanelProps {
  staleTasks: Task[];
  onTriage: (id: number, action: TriageAction) => Promise<void>;
  onDone: () => void;
}

export default function TriagePanel({ staleTasks, onTriage, onDone }: TriagePanelProps) {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState<Task[]>(staleTasks);
  const [busy, setBusy] = useState<number | null>(null);
  const [handled, setHandled] = useState(0);

  if (staleTasks.length === 0) return null;

  async function act(id: number, action: TriageAction) {
    setBusy(id);
    try {
      await onTriage(id, action);
      setRemaining((prev) => prev.filter((t) => t.id !== id));
      setHandled((n) => n + 1);
    } finally {
      setBusy(null);
    }
  }

  if (!open) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-amber-800/40 bg-amber-950/30 px-4 py-3">
        <p className="text-sm text-amber-400/80">
          {staleTasks.length} {staleTasks.length === 1 ? "task" : "tasks"} untouched for 2+ weeks
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg bg-amber-600/20 border border-amber-600/30 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-600/30"
        >
          Triage (3 min)
        </button>
      </div>
    );
  }

  if (remaining.length === 0) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-green-800/40 bg-green-950/30 px-4 py-3">
        <p className="text-sm text-green-400/80">
          Done — {handled} {handled === 1 ? "task" : "tasks"} handled. Feels lighter.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-green-400 transition hover:bg-green-900/30"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 animate-fade-in overflow-hidden rounded-2xl border border-amber-800/40 bg-surface">
      <div className="border-b border-amber-800/20 bg-amber-950/20 px-4 py-2.5">
        <p className="text-[11px] font-medium text-amber-400/70">
          Weekly triage — {remaining.length} left. One decision each.
        </p>
      </div>
      <ul>
        {remaining.map((task) => (
          <li
            key={task.id}
            className="flex flex-col gap-2 border-b border-white/5 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="min-w-0 text-sm text-ink-2 truncate">{task.title}</span>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                disabled={busy === task.id}
                onClick={() => act(task.id, "do_this_week")}
                className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent transition hover:bg-accent/20 disabled:opacity-50"
              >
                This week
              </button>
              <button
                type="button"
                disabled={busy === task.id}
                onClick={() => act(task.id, "someday")}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/40 transition hover:bg-white/10 disabled:opacity-50"
              >
                Someday
              </button>
              <button
                type="button"
                disabled={busy === task.id}
                onClick={() => act(task.id, "delete")}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-white/25 transition hover:bg-red-950/40 hover:text-red-400 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
