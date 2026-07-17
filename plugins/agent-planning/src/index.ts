/**
 * Public boundary for @ai3d/plugin-agent-planning.
 *
 * This interface is intentionally behavior-free in Milestone 1. Later milestones
 * may add compatible members only after the relevant architecture review.
 */
export interface PlanningAgentPlugin {
  /**
   * Stable identifier of the package boundary.
   */
  readonly packageId: '@ai3d/plugin-agent-planning';
}
