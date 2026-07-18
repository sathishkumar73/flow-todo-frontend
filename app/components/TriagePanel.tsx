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
      <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-800">
          {staleTasks.length} {staleTasks.length === 1 ? "task has" : "tasks have"} been
          sitting for 2+ weeks.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
        >
          Triage (3 min)
        </button>
      </div>
    );
  }

  if (remaining.length === 0) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <p className="text-sm text-emerald-800">
          Triage done — {handled} {handled === 1 ? "task" : "tasks"} handled. Feels lighter
          already.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-white">
      <div className="border-b border-amber-100 bg-amber-50 px-4 py-2.5 rounded-t-xl">
        <p className="text-xs font-medium text-amber-800">
          Weekly triage — {remaining.length} left. One decision each, then they're out of
          sight.
        </p>
      </div>
      <ul>
        {remaining.map((task) => (
          <li
            key={task.id}
            className="flex flex-col gap-2 border-b border-neutral-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="min-w-0 truncate text-sm text-neutral-800">{task.title}</span>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                disabled={busy === task.id}
                onClick={() => act(task.id, "do_this_week")}
                className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent transition hover:bg-accent/20 disabled:opacity-50"
              >
                This week
              </button>
              <button
                type="button"
                disabled={busy === task.id}
                onClick={() => act(task.id, "someday")}
                className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-200 disabled:opacity-50"
              >
                Someday
              </button>
              <button
                type="button"
                disabled={busy === task.id}
                onClick={() => act(task.id, "delete")}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
