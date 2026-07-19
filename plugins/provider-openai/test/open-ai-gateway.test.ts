import { describe, expect, it } from 'vitest';

import { OpenAiGateway } from '../src/index.js';

describe('OpenAiGateway', () => {
  it('validates a structured provider scene plan before returning it', async () => {
    const gateway = new OpenAiGateway({
      apiKey: 'test-key',
      fetchImplementation: async () =>
        new Response(
          JSON.stringify({
            output_text: JSON.stringify({
              kind: 'create-scene',
              scene: {
                version: 'v1',
                summary: 'A minimal office.',
                objects: [
                  {
                    name: 'Desk',
                    primitive: 'cube',
                    transform: {
                      location: [0, 0, 0],
                      rotation: [0, 0, 0],
                      scale: [1, 1, 1],
                    },
                  },
                ],
                lights: [],
                camera: { location: [4, -4, 3], rotation: [1, 0, 0.7], lens: 50 },
              },
            }),
          }),
          { status: 200 },
        ),
    });

    await expect(gateway.proposeScene({ prompt: 'Create an office' })).resolves.toMatchObject({
      kind: 'create-scene',
      scene: { summary: 'A minimal office.' },
    });
  });
});
