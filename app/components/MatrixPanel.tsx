"use client";

import {
  EisenhowerQuadrant,
  ImpactEffortQuadrant,
} from "@/lib/scoring";
import type { Task } from "@/lib/types";

interface MatrixPanelProps {
  task: Task;
  onChange: (updates: {
    eisenhower_quadrant?: EisenhowerQuadrant | null;
    impact_effort_quadrant?: ImpactEffortQuadrant | null;
  }) => void;
  onClose: () => void;
}

const EISENHOWER_CELLS: { key: EisenhowerQuadrant; label: string; sub: string }[] = [
  { key: "do_first", label: "Do First", sub: "Urgent + Important" },
  { key: "schedule", label: "Schedule", sub: "Important, not Urgent" },
  { key: "delegate", label: "Delegate", sub: "Urgent, not Important" },
  { key: "eliminate", label: "Eliminate", sub: "Neither" },
];

const IMPACT_EFFORT_CELLS: { key: ImpactEffortQuadrant; label: string; sub: string }[] = [
  { key: "quick_win", label: "Quick Win", sub: "High Impact, Low Effort" },
  { key: "major_project", label: "Major Project", sub: "High Impact, High Effort" },
  { key: "fill_in", label: "Fill-in", sub: "Low Impact, Low Effort" },
  { key: "thankless", label: "Thankless Task", sub: "Low Impact, High Effort" },
];

export default function MatrixPanel({ task, onChange, onClose }: MatrixPanelProps) {
  return (
    <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-2">
          Eisenhower Matrix
        </p>
        <div className="grid grid-cols-2 gap-2">
          {EISENHOWER_CELLS.map((cell) => {
            const active = task.eisenhower_quadrant === cell.key;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() =>
                  onChange({
                    eisenhower_quadrant: active ? null : cell.key,
                  })
                }
                className={`rounded-lg border p-2 text-left transition ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="text-sm font-medium">{cell.label}</div>
                <div className={`text-xs ${active ? "text-white/80" : "text-neutral-500"}`}>
                  {cell.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-2">
          Impact / Effort Matrix
        </p>
        <div className="grid grid-cols-2 gap-2">
          {IMPACT_EFFORT_CELLS.map((cell) => {
            const active = task.impact_effort_quadrant === cell.key;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() =>
                  onChange({
                    impact_effort_quadrant: active ? null : cell.key,
                  })
                }
                className={`rounded-lg border p-2 text-left transition ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="text-sm font-medium">{cell.label}</div>
                <div className={`text-xs ${active ? "text-white/80" : "text-neutral-500"}`}>
                  {cell.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-neutral-500">
          Priority score: <span className="font-semibold text-neutral-700">{task.priority_score}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-accent hover:underline"
        >
          Done
        </button>
      </div>
    </div>
  );
}
