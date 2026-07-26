/** Versioned instructions shared by providers that generate ScenePlan v1 data. */
export const scenePlanV1Instructions = `You are AI Studio's planning component. Convert the user's request into a ScenePlan v1. Return only schema-valid JSON. Do not return Blender Python, code, operators, markdown, assets, animation, or unsupported primitives. Use cubes, spheres, and cylinders compositionally. Include a camera and lights. Keep object count at or below 60 and use materials to communicate the requested style.`;

const vector3Schema = {
  type: 'array',
  items: { type: 'number' },
  minItems: 3,
  maxItems: 3,
} as const;

/**
 * Provider-neutral JSON Schema for the versioned SceneProposal contract.
 * Providers must still validate model output with `parseSceneProposal`.
 */
export const sceneProposalV1JsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['kind', 'scene'],
  properties: {
    kind: {
      type: 'string',
      enum: ['create-scene'],
    },
    scene: {
      type: 'object',
      additionalProperties: false,
      required: ['version', 'summary', 'objects', 'lights', 'camera'],
      properties: {
        version: {
          type: 'string',
          enum: ['v1'],
        },
        summary: {
          type: 'string',
        },
        objects: {
          type: 'array',
          minItems: 1,
          maxItems: 60,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'primitive', 'transform', 'material'],
            properties: {
              name: {
                type: 'string',
              },
              primitive: {
                type: 'string',
                enum: ['cube', 'sphere', 'cylinder'],
              },
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
                  metallic: {
                    type: 'number',
                  },
                  roughness: {
                    type: 'number',
                  },
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
              name: {
                type: 'string',
              },
              type: {
                type: 'string',
                enum: ['point', 'area', 'sun'],
              },
              location: vector3Schema,
              rotation: vector3Schema,
              color: vector3Schema,
              energy: {
                type: 'number',
              },
              size: {
                type: 'number',
              },
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
            lens: {
              type: 'number',
            },
          },
        },
      },
    },
  },
} as const;
