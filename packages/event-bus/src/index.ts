/**
 * Public boundary for @ai3d/event-bus.
 *
 * This interface is intentionally behavior-free in Milestone 1. Later milestones
 * may add compatible members only after the relevant architecture review.
 */
export interface EventBus {
  /**
   * Stable identifier of the package boundary.
   */
  readonly packageId: '@ai3d/event-bus';
}
