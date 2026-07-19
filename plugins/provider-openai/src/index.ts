import { parseSceneProposal, type SceneProposal } from '@ai3d/contracts';
import type { AiGateway, ProposeSceneRequest } from '@ai3d/ai-gateway';

/** Configuration for the first-party OpenAI provider adapter. */
export interface OpenAiGatewayOptions {
  /** API key obtained from a caller-controlled secret source. */
  readonly apiKey: string;
  /** Optional model override. Defaults to a current general-purpose model. */
  readonly model?: string;
  /** Injectable transport for deterministic tests. */
  readonly fetchImplementation?: typeof fetch;
}

/** Raised when OpenAI cannot supply a usable structured scene plan. */
export class OpenAiPlanningError extends Error {
  /** Creates a safe provider error without exposing credentials. */
  public constructor(message: string) {
    super(message);
    this.name = 'OpenAiPlanningError';
  }
}

/**
 * First-party OpenAI implementation of the provider-neutral `AiGateway` port.
 * It sends only the prompt and receives declarative ScenePlan data, never Python.
 */
export class OpenAiGateway implements AiGateway {
  private readonly fetchImplementation: typeof fetch;
  private readonly model: string;

  /** Creates the gateway from an explicitly supplied API key and optional model. */
  public constructor(private readonly options: OpenAiGatewayOptions) {
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.model = options.model ?? 'gpt-5.6-terra';
  }

  /** @inheritdoc */
  public async proposeScene(request: ProposeSceneRequest): Promise<SceneProposal> {
    const response = await this.fetchImplementation('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        instructions: scenePlanningInstructions,
        input: request.prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'scene_plan_v1',
            strict: true,
            schema: sceneProposalJsonSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new OpenAiPlanningError(`OpenAI planning request failed with status ${response.status}.`);
    }

    const responseBody: unknown = await response.json();
    const outputText = extractOutputText(responseBody);

    try {
      return parseSceneProposal(JSON.parse(outputText) as unknown);
    } catch (error: unknown) {
      if (error instanceof OpenAiPlanningError) {
        throw error;
      }

      throw new OpenAiPlanningError('OpenAI returned a ScenePlan that failed validation.');
    }
  }
}

function extractOutputText(value: unknown): string {
  if (isRecord(value) && typeof value.output_text === 'string') {
    return value.output_text;
  }

  if (isRecord(value) && Array.isArray(value.output)) {
    for (const item of value.output) {
      if (isRecord(item) && Array.isArray(item.content)) {
        for (const content of item.content) {
          if (isRecord(content) && content.type === 'output_text' && typeof content.text === 'string') {
            return content.text;
          }
        }
      }
    }
  }

  throw new OpenAiPlanningError('OpenAI returned no structured planning output.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const scenePlanningInstructions = `You are AI Studio's planning component. Convert the user's request into a ScenePlan v1. Return only schema-valid JSON. Do not return Blender Python, code, operators, markdown, assets, animation, or unsupported primitives. Use cubes, spheres, and cylinders compositionally. Include a camera and lights. Keep object count at or below 60 and use materials to communicate the requested style.`;

const vector3Schema = {
  type: 'array',
  items: { type: 'number' },
  minItems: 3,
  maxItems: 3,
} as const;

const sceneProposalJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['kind', 'scene'],
  properties: {
    kind: { const: 'create-scene' },
    scene: {
      type: 'object',
      additionalProperties: false,
      required: ['version', 'summary', 'objects', 'lights', 'camera'],
      properties: {
        version: { const: 'v1' },
        summary: { type: 'string' },
        objects: {
          type: 'array',
          minItems: 1,
          maxItems: 60,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'primitive', 'transform'],
            properties: {
              name: { type: 'string' },
              primitive: { enum: ['cube', 'sphere', 'cylinder'] },
              transform: {
                type: 'object',
                additionalProperties: false,
                required: ['location', 'rotation', 'scale'],
                properties: {
                  location: vector3Schema,
                  rotation: vector3Schema,
                  scale: vector3Schema,
                },
              },
              material: {
                type: 'object',
                additionalProperties: false,
                required: ['color', 'metallic', 'roughness'],
                properties: {
                  color: vector3Schema,
                  metallic: { type: 'number' },
                  roughness: { type: 'number' },
                },
              },
            },
          },
        },
        lights: {
          type: 'array',
          maxItems: 8,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'type', 'location', 'rotation', 'color', 'energy', 'size'],
            properties: {
              name: { type: 'string' },
              type: { enum: ['point', 'area', 'sun'] },
              location: vector3Schema,
              rotation: vector3Schema,
              color: vector3Schema,
              energy: { type: 'number' },
              size: { type: 'number' },
            },
          },
        },
        camera: {
          type: 'object',
          additionalProperties: false,
          required: ['location', 'rotation', 'lens'],
          properties: {
            location: vector3Schema,
            rotation: vector3Schema,
            lens: { type: 'number' },
          },
        },
      },
    },
  },
} as const;
