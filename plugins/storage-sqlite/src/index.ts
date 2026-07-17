/**
 * Public boundary for @ai3d/plugin-storage-sqlite.
 *
 * This interface is intentionally behavior-free in Milestone 1. Later milestones
 * may add compatible members only after the relevant architecture review.
 */
export interface SqliteStoragePlugin {
  /**
   * Stable identifier of the package boundary.
   */
  readonly packageId: '@ai3d/plugin-storage-sqlite';
}
