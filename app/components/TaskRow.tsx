"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { EisenhowerQuadrant, ImpactEffortQuadrant } from "@/lib/scoring";
import MatrixPanel from "./MatrixPanel";

interface TaskRowProps {
  task: Task;
  onComplete: (id: number) => void;
  onUpdateMatrix: (
    id: number,
    updates: {
      eisenhower_quadrant?: EisenhowerQuadrant | null;
      impact_effort_quadrant?: ImpactEffortQuadrant | null;
    }
  ) => void;
}

const DOT_COLOR: Record<string, string> = {
  do_first: "bg-red-500",
  schedule: "bg-amber-500",
  delegate: "bg-sky-500",
  eliminate: "bg-neutral-400",
};

function formatDue(dateString: string): { label: string; urgent: boolean } {
  const due = new Date(dateString);
  const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Overdue", urgent: true };
  if (days === 0) return { label: "Today", urgent: true };
  if (days === 1) return { label: "Tomorrow", urgent: true };
  if (days <= 7) return { label: `${days}d`, urgent: false };
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    urgent: false,
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function TaskRow({ task, onComplete, onUpdateMatrix }: TaskRowProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const hasTag = task.eisenhower_quadrant || task.impact_effort_quadrant;
  const dotColor = task.eisenhower_quadrant
    ? DOT_COLOR[task.eisenhower_quadrant]
    : hasTag
    ? "bg-accent"
    : null;

  return (
    <li className="border-b border-neutral-100 last:border-b-0">
      <div className="flex items-center gap-3 py-3">
        <button
          type="button"
          aria-label="Complete task"
          onClick={() => onComplete(task.id)}
          className="h-6 w-6 shrink-0 rounded-full border-2 border-neutral-300 hover:border-accent transition"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {dotColor && <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />}
            <span className="truncate text-base text-neutral-900">{task.title}</span>
            {task.due_date && (() => {
              const due = formatDue(task.due_date);
              return (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    due.urgent ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {due.label}
                </span>
              );
            })()}
            {task.duration_minutes != null && (
              <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
                {formatDuration(task.duration_minutes)}
              </span>
            )}
          </div>
          {panelOpen && task.ai_rationale && (
            <p className="mt-1 truncate text-xs text-neutral-400">{task.ai_rationale}</p>
          )}
        </div>
        <button
          type="button"
          aria-label="Prioritize task"
          onClick={() => setPanelOpen((v) => !v)}
          className={`shrink-0 rounded-full p-2 transition hover:bg-neutral-100 ${
            panelOpen ? "text-accent" : "text-neutral-400"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 6h16M4 12h10M4 18h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {panelOpen && (
        <MatrixPanel
          task={task}
          onChange={(updates) => onUpdateMatrix(task.id, updates)}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </li>
  );
}
