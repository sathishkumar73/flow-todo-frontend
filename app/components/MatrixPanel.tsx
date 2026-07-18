"use client";

import { EisenhowerQuadrant, ImpactEffortQuadrant } from "@/lib/scoring";
import type { Task } from "@/lib/types";

interface MatrixPanelProps {
  task: Task;
  onChange: (updates: {
    eisenhower_quadrant?: EisenhowerQuadrant | null;
    impact_effort_quadrant?: ImpactEffortQuadrant | null;
  }) => void;
  onClose: () => void;
}

const EISENHOWER_CELLS: { key: EisenhowerQuadrant; label: string; sub: string; active: string }[] = [
  { key: "do_first",  label: "Do First",  sub: "Urgent + Important",      active: "border-red-500/60 bg-red-950/60 text-red-300" },
  { key: "schedule",  label: "Schedule",  sub: "Important, not Urgent",   active: "border-blue-500/60 bg-blue-950/60 text-blue-300" },
  { key: "delegate",  label: "Delegate",  sub: "Urgent, not Important",   active: "border-amber-500/60 bg-amber-950/60 text-amber-300" },
  { key: "eliminate", label: "Eliminate", sub: "Neither",                 active: "border-white/20 bg-white/5 text-white/60" },
];

const IMPACT_EFFORT_CELLS: { key: ImpactEffortQuadrant; label: string; sub: string; active: string }[] = [
  { key: "quick_win",     label: "Quick Win",     sub: "High Impact, Low Effort",  active: "border-green-500/60 bg-green-950/60 text-green-300" },
  { key: "major_project", label: "Major Project", sub: "High Impact, High Effort", active: "border-purple-500/60 bg-purple-950/60 text-purple-300" },
  { key: "fill_in",       label: "Fill-in",       sub: "Low Impact, Low Effort",   active: "border-white/20 bg-white/5 text-white/60" },
  { key: "thankless",     label: "Thankless",     sub: "Low Impact, High Effort",  active: "border-red-900/40 bg-red-950/30 text-red-500/70" },
];

const IDLE = "border-white/7 bg-white/3 text-ink-3 hover:border-white/15 hover:bg-white/5";

export default function MatrixPanel({ task, onChange, onClose }: MatrixPanelProps) {
  return (
    <div className="space-y-4">
      {/* Eisenhower */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Eisenhower Matrix
        </p>
        <div className="grid grid-cols-2 gap-2">
          {EISENHOWER_CELLS.map((cell) => {
            const isActive = task.eisenhower_quadrant === cell.key;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => onChange({ eisenhower_quadrant: isActive ? null : cell.key })}
                className={`rounded-xl border p-2.5 text-left transition ${isActive ? cell.active : IDLE}`}
              >
                <div className="text-[13px] font-semibold">{cell.label}</div>
                <div className="mt-0.5 text-[11px] opacity-60">{cell.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Impact / Effort */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Impact / Effort
        </p>
        <div className="grid grid-cols-2 gap-2">
          {IMPACT_EFFORT_CELLS.map((cell) => {
            const isActive = task.impact_effort_quadrant === cell.key;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => onChange({ impact_effort_quadrant: isActive ? null : cell.key })}
                className={`rounded-xl border p-2.5 text-left transition ${isActive ? cell.active : IDLE}`}
              >
                <div className="text-[13px] font-semibold">{cell.label}</div>
                <div className="mt-0.5 text-[11px] opacity-60">{cell.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-white/30">
          Priority score: <span className="font-semibold text-white/50">{task.effective_priority ?? task.priority_score}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[12px] font-medium text-accent hover:underline"
        >
          Done
        </button>
      </div>
    </div>
  );
}
