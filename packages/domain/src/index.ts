/**
 * Public boundary for @ai3d/domain.
 *
 * This interface is intentionally behavior-free in Milestone 1. Later milestones
 * may add compatible members only after the relevant architecture review.
 */
export interface DomainModel {
  /**
   * Stable identifier of the package boundary.
   */
  readonly packageId: '@ai3d/domain';
}
