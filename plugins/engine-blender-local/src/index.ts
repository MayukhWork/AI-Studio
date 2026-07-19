import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  createCubeToolId,
  createSceneToolId,
  type CreateCubeToolRequest,
  type CreateCubeToolResult,
  type CreateSceneToolRequest,
  type CreateSceneToolResult,
  type ScenePlanV1,
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

  /** @inheritdoc */
  public async createScene(request: CreateSceneToolRequest): Promise<CreateSceneToolResult> {
    const planPath = await writeScenePlan(request.scene);
    await this.processLauncher.launch({
      executablePath: this.options.blenderExecutablePath,
      pythonExpression: createScenePythonExpression(planPath),
    });

    return {
      toolId: createSceneToolId,
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

async function writeScenePlan(scene: ScenePlanV1): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'ai3d-scene-'));
  const planPath = join(directory, 'scene-plan.json');
  await writeFile(planPath, JSON.stringify(scene), 'utf8');
  return planPath;
}

function createScenePythonExpression(planPath: string): string {
  return [
    'import bpy,json,os',
    `plan=json.load(open(${JSON.stringify(planPath)},encoding='utf-8'))`,
    `os.remove(${JSON.stringify(planPath)})`,
    "bpy.ops.object.select_all(action='SELECT')",
    'bpy.ops.object.delete(use_global=False)',
    "operators={'cube':bpy.ops.mesh.primitive_cube_add,'sphere':bpy.ops.mesh.primitive_uv_sphere_add,'cylinder':bpy.ops.mesh.primitive_cylinder_add}",
    "[(operators[o['primitive']](),setattr(bpy.context.object,'name',o['name']),setattr(bpy.context.object,'location',o['transform']['location']),setattr(bpy.context.object,'rotation_euler',o['transform']['rotation']),setattr(bpy.context.object,'scale',o['transform']['scale']),bpy.context.object.data.materials.append((lambda m:(setattr(m,'diffuse_color',(*o['material']['color'],1)),setattr(m,'metallic',o['material']['metallic']),setattr(m,'roughness',o['material']['roughness']),m)[3])(bpy.data.materials.new(o['name']+'_Material'))) if 'material' in o else None) for o in plan['objects']]",
    "[(lambda d,l:(setattr(d,'energy',l['energy']),setattr(d,'color',l['color']),setattr(d,'size',l['size']) if l['type']=='area' else None,bpy.context.collection.objects.link((lambda x:(setattr(x,'location',l['location']),setattr(x,'rotation_euler',l['rotation']),x)[2])(bpy.data.objects.new(l['name'],d)))))(bpy.data.lights.new(l['name'],l['type'].upper()),l) for l in plan['lights']]",
    "cam=bpy.data.cameras.new('AI3D_Camera')",
    "cam.lens=plan['camera']['lens']",
    "obj=bpy.data.objects.new('AI3D_Camera',cam)",
    "obj.location=plan['camera']['location']",
    "obj.rotation_euler=plan['camera']['rotation']",
    'bpy.context.collection.objects.link(obj)',
    'bpy.context.scene.camera=obj',
  ].join(';');
}
