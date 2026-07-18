/**
 * Stable identifier for the only allowlisted runtime tool in Milestone 2.
 *
 * Future tools must use their own versioned identifiers rather than accepting
 * arbitrary Blender operators or scripts.
 */
export const createCubeToolId = 'scene.CreateCube@v1' as const;

/**
 * A validated, engine-neutral request to create the Milestone 2 cube.
 */
export interface CreateCubeToolRequest {
  /** The versioned allowlisted tool identifier. */
  readonly toolId: typeof createCubeToolId;
  /** Correlates the request across the application layers. */
  readonly correlationId: string;
}

/**
 * The observed outcome returned by a runtime after creating the cube.
 */
export interface CreateCubeToolResult {
  /** The versioned allowlisted tool identifier. */
  readonly toolId: typeof createCubeToolId;
  /** Correlates the result with its originating request. */
  readonly correlationId: string;
  /** The runtime accepted the request and launched the operation. */
  readonly status: 'completed';
}

/**
 * The only structured proposal that the mock AI Gateway can produce in
 * Milestone 2.
 */
export interface CreateCubeProposal {
  /** Identifies the semantic action, independent of Blender APIs. */
  readonly kind: 'create-cube';
}

/**
 * A structured proposal returned by an AI Gateway after prompt handling.
 */
export type SceneProposal = CreateCubeProposal;
