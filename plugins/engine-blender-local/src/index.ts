import { spawn } from 'node:child_process';

import {
  createCubeToolId,
  type CreateCubeToolRequest,
  type CreateCubeToolResult,
} from '@ai3d/contracts';
import type { SceneRuntime } from '@ai3d/runtime-protocol';

/** Parameters used to start the locally installed Blender executable. */
export interface BlenderLaunchRequest {
  /** Absolute path or command name of the Blender executable. */
  readonly executablePath: string;
  /** Static Python expression for the single allowlisted operation. */
  readonly pythonExpression: string;
}

/** Process boundary kept injectable so the engine can be tested without Blender. */
export interface BlenderProcessLauncher {
  /** Starts a visible Blender process and resolves after the OS accepts it. */
  launch(request: BlenderLaunchRequest): Promise<void>;
}

/** Runtime configuration for the local Blender engine. */
export interface LocalBlenderRuntimeOptions {
  /** Absolute path or command name for the supported Blender installation. */
  readonly blenderExecutablePath: string;
  /** Injectable process launcher. Defaults to the Node.js implementation. */
  readonly processLauncher?: BlenderProcessLauncher;
}

/**
 * Starts Blender in its normal visible UI and runs a fixed cube-creation
 * expression. The expression is static; no prompt text or arbitrary code is
 * accepted by this adapter.
 */
export class LocalBlenderRuntime implements SceneRuntime {
  private readonly processLauncher: BlenderProcessLauncher;

  /** Creates a local runtime bound to one Blender executable. */
  public constructor(private readonly options: LocalBlenderRuntimeOptions) {
    this.processLauncher = options.processLauncher ?? new NodeBlenderProcessLauncher();
  }

  /** @inheritdoc */
  public async createCube(request: CreateCubeToolRequest): Promise<CreateCubeToolResult> {
    await this.processLauncher.launch({
      executablePath: this.options.blenderExecutablePath,
      pythonExpression: createSingleCubePythonExpression,
    });

    return {
      toolId: createCubeToolId,
      correlationId: request.correlationId,
      status: 'completed',
    };
  }
}

/** Starts Blender through Node.js without opening a separate shell. */
export class NodeBlenderProcessLauncher implements BlenderProcessLauncher {
  /** @inheritdoc */
  public launch(request: BlenderLaunchRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(request.executablePath, ['--python-expr', request.pythonExpression], {
        detached: true,
        stdio: 'ignore',
        windowsHide: false,
      });

      process.once('error', reject);
      process.once('spawn', () => {
        process.unref();
        resolve();
      });
    });
  }
}

/**
 * Deletes default scene objects and adds exactly one cube. This is a bounded
 * adapter implementation for the typed `scene.CreateCube@v1` tool only.
 */
const createSingleCubePythonExpression = [
  'import bpy',
  "bpy.ops.object.select_all(action='SELECT')",
  'bpy.ops.object.delete(use_global=False)',
  'bpy.ops.mesh.primitive_cube_add()',
].join('; ');
