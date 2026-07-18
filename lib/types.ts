import type { EisenhowerQuadrant, ImpactEffortQuadrant } from "./scoring";

export interface Task {
  id: number;
  title: string;
  status: "active" | "done" | "someday";
  created_at: string;
  completed_at: string | null;
  eisenhower_quadrant: EisenhowerQuadrant | null;
  impact_effort_quadrant: ImpactEffortQuadrant | null;
  priority_score: number;
  stack_position: number;
  due_date: string | null;
  duration_minutes: number | null;
  ai_rationale: string | null;
  ai_scored: boolean;
  last_touched_at: string;
  effective_priority?: number;
}
