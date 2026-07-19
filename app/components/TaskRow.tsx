"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/types";
import { EisenhowerQuadrant, ImpactEffortQuadrant } from "@/lib/scoring";
import MatrixPanel from "./MatrixPanel";

interface TaskRowProps {
  task: Task;
  isDragMode: boolean;
  isBacklog?: boolean;
  onComplete: (id: number) => void;
  onPromote?: (id: number) => void;
  onUpdateMatrix: (
    id: number,
    updates: {
      eisenhower_quadrant?: EisenhowerQuadrant | null;
      impact_effort_quadrant?: ImpactEffortQuadrant | null;
    }
  ) => void;
}

const EISENHOWER_BADGE: Record<EisenhowerQuadrant, { label: string; cls: string }> = {
  do_first:  { label: "Do First",  cls: "bg-red-950/60 text-red-400 border border-red-800/50" },
  schedule:  { label: "Schedule",  cls: "bg-blue-950/60 text-blue-400 border border-blue-800/50" },
  delegate:  { label: "Delegate",  cls: "bg-amber-950/60 text-amber-400 border border-amber-800/50" },
  eliminate: { label: "Eliminate", cls: "bg-white/5 text-white/30 border border-white/10" },
};

const IE_BADGE: Record<ImpactEffortQuadrant, { label: string; cls: string }> = {
  quick_win:     { label: "Quick Win",     cls: "bg-green-950/60 text-green-400 border border-green-800/50" },
  major_project: { label: "Major Project", cls: "bg-purple-950/60 text-purple-400 border border-purple-800/50" },
  fill_in:       { label: "Fill-in",       cls: "bg-white/5 text-white/30 border border-white/10" },
  thankless:     { label: "Thankless",     cls: "bg-red-950/30 text-red-500/60 border border-red-900/30" },
};

function formatDue(dateString: string): { label: string; urgent: boolean } {
  const due = new Date(dateString);
  const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Overdue", urgent: true };
  if (days === 0) return { label: "Today", urgent: true };
  if (days === 1) return { label: "Tomorrow", urgent: true };
  if (days <= 7) return { label: `${days}d`, urgent: false };
  return { label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }), urgent: false };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function TaskRow({ task, isDragMode, isBacklog, onComplete, onPromote, onUpdateMatrix }: TaskRowProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !isDragMode || !!isBacklog,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  function handleComplete() {
    setCompleting(true);
    onComplete(task.id);
  }

  async function handlePromote() {
    if (!onPromote) return;
    setPromoting(true);
    try {
      await onPromote(task.id);
    } finally {
      setPromoting(false);
    }
  }

  const eisBadge = task.eisenhower_quadrant ? EISENHOWER_BADGE[task.eisenhower_quadrant] : null;
  const ieBadge = task.impact_effort_quadrant ? IE_BADGE[task.impact_effort_quadrant] : null;
  const due = task.due_date ? formatDue(task.due_date) : null;
  const hasBadges = !!(eisBadge || ieBadge || due || task.duration_minutes != null);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border bg-surface transition-all duration-200 ${
        isDragging
          ? "border-accent/50 shadow-lg shadow-accent/10"
          : "border-white/[0.08] hover:border-white/[0.14] hover:bg-surface-2"
      } ${completing ? "opacity-0 scale-95 pointer-events-none" : ""}`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Left slot: drag handle OR promote button */}
        {isBacklog ? (
          <button
            type="button"
            onClick={handlePromote}
            disabled={promoting}
            title="Move to Focus"
            aria-label="Move to Focus list"
            className="mt-0.5 shrink-0 rounded-lg p-1 text-white/20 transition hover:text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            {promoting ? (
              <svg width="14" height="14" viewBox="0 0 14 14" className="animate-spin" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        ) : isDragMode ? (
          <button
            type="button"
            className="mt-0.5 shrink-0 cursor-grab touch-none rounded-lg p-1 text-white/20 transition hover:text-white/40 active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="4" cy="3" r="1.2" />
              <circle cx="10" cy="3" r="1.2" />
              <circle cx="4" cy="7" r="1.2" />
              <circle cx="10" cy="7" r="1.2" />
              <circle cx="4" cy="11" r="1.2" />
              <circle cx="10" cy="11" r="1.2" />
            </svg>
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}

        {/* Checkbox */}
        <button
          type="button"
          aria-label="Complete task"
          onClick={handleComplete}
          className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-white/25 transition hover:border-green-400 hover:bg-green-950/40 active:scale-90"
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className={`text-[15px] leading-snug ${isBacklog ? "text-ink-2" : "text-ink"}`}>
            {task.title}
          </p>

          {hasBadges && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {eisBadge && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${eisBadge.cls}`}>
                  {eisBadge.label}
                </span>
              )}
              {ieBadge && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${ieBadge.cls}`}>
                  {ieBadge.label}
                </span>
              )}
              {due && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    due.urgent
                      ? "bg-red-950/60 text-red-400 border border-red-800/50"
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}
                >
                  {due.label}
                </span>
              )}
              {task.duration_minutes != null && (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/40">
                  {formatDuration(task.duration_minutes)}
                </span>
              )}
              {!hasBadges && !task.ai_scored && (
                <span className="text-[11px] text-white/20">Scoring…</span>
              )}
            </div>
          )}

          {panelOpen && task.ai_rationale && (
            <p className="mt-2 text-xs leading-relaxed text-white/30">{task.ai_rationale}</p>
          )}
        </div>

        {/* Expand chevron */}
        <button
          type="button"
          aria-label={panelOpen ? "Close matrix" : "Open priority matrix"}
          onClick={() => setPanelOpen((v) => !v)}
          className={`mt-0.5 shrink-0 rounded-lg p-1.5 transition ${
            panelOpen ? "text-accent bg-accent/10" : "text-white/20 hover:text-white/50 hover:bg-white/5"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform duration-200 ${panelOpen ? "rotate-180" : ""}`}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {panelOpen && (
        <div className="animate-slide-down border-t border-white/[0.08] px-4 pb-4 pt-3">
          <MatrixPanel
            task={task}
            onChange={(updates) => onUpdateMatrix(task.id, updates)}
            onClose={() => setPanelOpen(false)}
          />
        </div>
      )}
    </li>
  );
}
