import type {
  CreateCubeToolRequest,
  CreateCubeToolResult,
  CreateSceneToolRequest,
  CreateSceneToolResult,
} from '@ai3d/contracts';

/**
 * Engine-neutral execution port used by the orchestrator.
 *
 * The local Blender plugin implements this port in Milestone 2. Future local
 * add-on and remote-worker transports preserve this boundary.
 */
export interface SceneRuntime {
  /** Executes the sole typed, allowlisted operation in Milestone 2. */
  createCube(request: CreateCubeToolRequest): Promise<CreateCubeToolResult>;
  /** Translates a validated declarative scene plan into engine-specific work. */
  createScene(request: CreateSceneToolRequest): Promise<CreateSceneToolResult>;
}
