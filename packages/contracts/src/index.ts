/**
 * Stable identifier for the only allowlisted runtime tool in Milestone 2.
 *
 * Future tools must use their own versioned identifiers rather than accepting
 * arbitrary Blender operators or scripts.
 */
export const createCubeToolId = 'scene.CreateCube@v1' as const;

/** Stable identifier for the declarative scene-generation tool. */
export const createSceneToolId = 'scene.CreateScene@v1' as const;

/** A three-dimensional coordinate, rotation, scale, or RGB color value. */
export type Vector3 = readonly [number, number, number];

/** Primitive shapes supported by the first scene-plan version. */
export type ScenePrimitive = 'cube' | 'sphere' | 'cylinder';

/** Transform data for a generated primitive. */
export interface SceneTransform {
  /** World-space position in Blender units. */
  readonly location: Vector3;
  /** Euler rotation in radians. */
  readonly rotation: Vector3;
  /** Per-axis object scale. */
  readonly scale: Vector3;
}

/** Simple Principled-BSDF material parameters supported by ScenePlan v1. */
export interface SceneMaterial {
  /** Base color as normalized RGB values. */
  readonly color: Vector3;
  /** Metallic value in the inclusive range zero through one. */
  readonly metallic: number;
  /** Roughness value in the inclusive range zero through one. */
  readonly roughness: number;
}

/** One semantic object that the runtime maps to an allowlisted primitive. */
export interface SceneObject {
  /** Human-readable runtime object name. */
  readonly name: string;
  /** Primitive chosen by the planner. */
  readonly primitive: ScenePrimitive;
  /** Object transform. */
  readonly transform: SceneTransform;
  /** Optional simple material. */
  readonly material?: SceneMaterial;
}

/** Light types supported by ScenePlan v1. */
export type SceneLightType = 'point' | 'area' | 'sun';

/** Declarative scene light. */
export interface SceneLight {
  /** Human-readable runtime light name. */
  readonly name: string;
  /** Allowlisted Blender light type. */
  readonly type: SceneLightType;
  /** World-space light position. */
  readonly location: Vector3;
  /** Euler light rotation in radians. */
  readonly rotation: Vector3;
  /** Normalized RGB light color. */
  readonly color: Vector3;
  /** Non-negative light intensity. */
  readonly energy: number;
  /** Area-light size; ignored by other light types. */
  readonly size: number;
}

/** Declarative active camera. */
export interface SceneCamera {
  /** World-space camera position. */
  readonly location: Vector3;
  /** Euler camera rotation in radians. */
  readonly rotation: Vector3;
  /** Camera focal length in millimetres. */
  readonly lens: number;
}

/**
 * Version 1 scene plan. It is data, never executable code: the runtime owns its
 * Blender mapping and accepts only these allowlisted primitives and properties.
 */
export interface ScenePlanV1 {
  /** Explicit plan schema version. */
  readonly version: 'v1';
  /** Short user-visible summary of the intended scene. */
  readonly summary: string;
  /** Objects to generate, bounded by the gateway validator. */
  readonly objects: readonly SceneObject[];
  /** Lights to generate. */
  readonly lights: readonly SceneLight[];
  /** Camera to create and activate. */
  readonly camera: SceneCamera;
}

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

/** A typed request to create an entire declarative ScenePlan v1. */
export interface CreateSceneToolRequest {
  /** The versioned allowlisted tool identifier. */
  readonly toolId: typeof createSceneToolId;
  /** Correlates the request across the application layers. */
  readonly correlationId: string;
  /** Validated scene data for runtime-owned Blender translation. */
  readonly scene: ScenePlanV1;
}

/** Result reported after the runtime launches the generated scene operation. */
export interface CreateSceneToolResult {
  /** The versioned allowlisted tool identifier. */
  readonly toolId: typeof createSceneToolId;
  /** Correlates the result with its originating request. */
  readonly correlationId: string;
  /** The runtime accepted the plan and launched the operation. */
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

/** Structured proposal containing the declarative scene plan for execution. */
export interface CreateSceneProposal {
  /** Identifies a plan that requires runtime scene generation. */
  readonly kind: 'create-scene';
  /** Schema-validated scene plan. */
  readonly scene: ScenePlanV1;
}

/**
 * A structured proposal returned by an AI Gateway after prompt handling.
 */
export type SceneProposal = CreateCubeProposal | CreateSceneProposal;

/** Runtime result for either currently supported typed tool. */
export type SceneToolResult = CreateCubeToolResult | CreateSceneToolResult;

/** Raised when untrusted provider output does not match ScenePlan v1. */
export class InvalidSceneProposalError extends Error {
  /** Creates a safe validation error without retaining raw provider output. */
  public constructor() {
    super('The AI provider returned an invalid ScenePlan v1 proposal.');
    this.name = 'InvalidSceneProposalError';
  }
}

/** Validates and narrows untrusted provider output to a supported proposal. */
export function parseSceneProposal(value: unknown): SceneProposal {
  if (isRecord(value) && value.kind === 'create-cube') {
    return { kind: 'create-cube' };
  }

  if (isRecord(value) && value.kind === 'create-scene') {
    return { kind: 'create-scene', scene: parseScenePlan(value.scene) };
  }

  throw new InvalidSceneProposalError();
}

function parseScenePlan(value: unknown): ScenePlanV1 {
  if (!isRecord(value) || value.version !== 'v1' || !isShortText(value.summary)) {
    throw new InvalidSceneProposalError();
  }

  if (!Array.isArray(value.objects) || value.objects.length === 0 || value.objects.length > 60) {
    throw new InvalidSceneProposalError();
  }

  if (!Array.isArray(value.lights) || value.lights.length > 8) {
    throw new InvalidSceneProposalError();
  }

  return {
    version: 'v1',
    summary: value.summary,
    objects: value.objects.map(parseSceneObject),
    lights: value.lights.map(parseSceneLight),
    camera: parseSceneCamera(value.camera),
  };
}

function parseSceneObject(value: unknown): SceneObject {
  if (!isRecord(value) || !isShortText(value.name) || !isScenePrimitive(value.primitive)) {
    throw new InvalidSceneProposalError();
  }

  const material = value.material === undefined ? undefined : parseSceneMaterial(value.material);
  return {
    name: value.name,
    primitive: value.primitive,
    transform: parseSceneTransform(value.transform),
    ...(material === undefined ? {} : { material }),
  };
}

function parseSceneLight(value: unknown): SceneLight {
  if (!isRecord(value) || !isShortText(value.name) || !isSceneLightType(value.type)) {
    throw new InvalidSceneProposalError();
  }

  const energy = parseFiniteNumber(value.energy, 0, 100_000);
  const size = parseFiniteNumber(value.size, 0.01, 100);
  return {
    name: value.name,
    type: value.type,
    location: parseVector3(value.location, -1_000, 1_000),
    rotation: parseVector3(value.rotation, -Math.PI * 2, Math.PI * 2),
    color: parseVector3(value.color, 0, 1),
    energy,
    size,
  };
}

function parseSceneCamera(value: unknown): SceneCamera {
  if (!isRecord(value)) {
    throw new InvalidSceneProposalError();
  }

  return {
    location: parseVector3(value.location, -1_000, 1_000),
    rotation: parseVector3(value.rotation, -Math.PI * 2, Math.PI * 2),
    lens: parseFiniteNumber(value.lens, 1, 300),
  };
}

function parseSceneTransform(value: unknown): SceneTransform {
  if (!isRecord(value)) {
    throw new InvalidSceneProposalError();
  }

  return {
    location: parseVector3(value.location, -1_000, 1_000),
    rotation: parseVector3(value.rotation, -Math.PI * 2, Math.PI * 2),
    scale: parseVector3(value.scale, 0.01, 1_000),
  };
}

function parseSceneMaterial(value: unknown): SceneMaterial {
  if (!isRecord(value)) {
    throw new InvalidSceneProposalError();
  }

  return {
    color: parseVector3(value.color, 0, 1),
    metallic: parseFiniteNumber(value.metallic, 0, 1),
    roughness: parseFiniteNumber(value.roughness, 0, 1),
  };
}

function parseVector3(value: unknown, minimum: number, maximum: number): Vector3 {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new InvalidSceneProposalError();
  }

  return [
    parseFiniteNumber(value[0], minimum, maximum),
    parseFiniteNumber(value[1], minimum, maximum),
    parseFiniteNumber(value[2], minimum, maximum),
  ];
}

function parseFiniteNumber(value: unknown, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new InvalidSceneProposalError();
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isShortText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 120;
}

function isScenePrimitive(value: unknown): value is ScenePrimitive {
  return value === 'cube' || value === 'sphere' || value === 'cylinder';
}

function isSceneLightType(value: unknown): value is SceneLightType {
  return value === 'point' || value === 'area' || value === 'sun';
}
