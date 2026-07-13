export type EisenhowerQuadrant = "do_first" | "schedule" | "delegate" | "eliminate";
export type ImpactEffortQuadrant = "quick_win" | "major_project" | "fill_in" | "thankless";

const EISENHOWER_SCORES: Record<EisenhowerQuadrant, number> = {
  do_first: 100,
  schedule: 70,
  delegate: 40,
  eliminate: 10,
};

const IMPACT_EFFORT_SCORES: Record<ImpactEffortQuadrant, number> = {
  quick_win: 100,
  major_project: 70,
  fill_in: 40,
  thankless: 10,
};

/**
 * priority_score = average of both matrix scores if both are set,
 * whichever one is set if only one is present, or 0 if neither is set.
 */
export function computePriorityScore(
  eisenhower: EisenhowerQuadrant | null | undefined,
  impactEffort: ImpactEffortQuadrant | null | undefined
): number {
  const e = eisenhower ? EISENHOWER_SCORES[eisenhower] : null;
  const i = impactEffort ? IMPACT_EFFORT_SCORES[impactEffort] : null;

  if (e !== null && i !== null) return Math.round((e + i) / 2);
  if (e !== null) return e;
  if (i !== null) return i;
  return 0;
}

export const EISENHOWER_LABELS: Record<EisenhowerQuadrant, string> = {
  do_first: "Do First",
  schedule: "Schedule",
  delegate: "Delegate",
  eliminate: "Eliminate",
};

export const IMPACT_EFFORT_LABELS: Record<ImpactEffortQuadrant, string> = {
  quick_win: "Quick Win",
  major_project: "Major Project",
  fill_in: "Fill-in",
  thankless: "Thankless Task",
};
