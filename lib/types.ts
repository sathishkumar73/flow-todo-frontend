import type { EisenhowerQuadrant, ImpactEffortQuadrant } from "./scoring";

export interface Task {
  id: number;
  title: string;
  status: "active" | "done";
  created_at: string;
  completed_at: string | null;
  eisenhower_quadrant: EisenhowerQuadrant | null;
  impact_effort_quadrant: ImpactEffortQuadrant | null;
  priority_score: number;
  stack_position: number;
}
