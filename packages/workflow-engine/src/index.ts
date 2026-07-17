/**
 * Public boundary for @ai3d/workflow-engine.
 *
 * This interface is intentionally behavior-free in Milestone 1. Later milestones
 * may add compatible members only after the relevant architecture review.
 */
export interface WorkflowEngine {
  /**
   * Stable identifier of the package boundary.
   */
  readonly packageId: '@ai3d/workflow-engine';
}
