import { describe, expect, it } from 'vitest';

import { GeminiConfigurationError, GeminiGateway, GeminiPlanningError } from '../src/index.js';

describe('GeminiGateway', () => {
  it('sends a structured request and returns a validated SceneProposal', async () => {
    let receivedRequest: RequestInit | undefined;
    const gateway = new GeminiGateway({
      apiKey: 'test-key',
      model: 'gemini-test-model',
      fetchImplementation: async (_input, init) => {
        receivedRequest = init;
        return jsonResponse(successfulGeminiResponse);
      },
    });

    await expect(gateway.proposeScene({ prompt: 'Create an office' })).resolves.toMatchObject({
      kind: 'create-scene',
      scene: { summary: 'A minimal office.' },
    });

    expect(receivedRequest?.headers).toMatchObject({
      'Content-Type': 'application/json',
      'x-goog-api-key': 'test-key',
    });
    expect(JSON.parse(String(receivedRequest?.body))).toMatchObject({
      contents: [{ role: 'user', parts: [{ text: 'Create an office' }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });
  });

  it('uses the Version 1 default Gemini model', async () => {
    let requestedUrl = '';
    const gateway = new GeminiGateway({
      apiKey: 'test-key',
      fetchImplementation: async (input) => {
        requestedUrl = String(input);
        return jsonResponse(successfulGeminiResponse);
      },
    });

    await gateway.proposeScene({ prompt: 'Create an office' });

    expect(requestedUrl).toContain('/models/gemini-2.5-flash:generateContent');
  });

  it('rejects missing credentials before making a request', () => {
    expect(() => new GeminiGateway({ apiKey: '  ' })).toThrow(GeminiConfigurationError);
  });

  it('reports authentication failures without exposing the API response body', async () => {
    const gateway = gatewayWithResponse(new Response('credential detail', { status: 401 }));

    await expect(gateway.proposeScene({ prompt: 'Create an office' })).rejects.toThrow(
      'Gemini authentication failed. Verify GEMINI_API_KEY.',
    );
  });

  it('reports unavailable or unsupported models', async () => {
    const gateway = gatewayWithResponse(new Response(null, { status: 404 }));

    await expect(gateway.proposeScene({ prompt: 'Create an office' })).rejects.toThrow(
      'The configured Gemini model is unavailable or unsupported.',
    );
  });

  it('reports network failures', async () => {
    const gateway = new GeminiGateway({
      apiKey: 'test-key',
      fetchImplementation: async () => Promise.reject(new Error('network unavailable')),
    });

    await expect(gateway.proposeScene({ prompt: 'Create an office' })).rejects.toThrow(
      'Gemini planning request failed due to a network error.',
    );
  });

  it('reports request timeouts', async () => {
    const gateway = new GeminiGateway({
      apiKey: 'test-key',
      timeoutMilliseconds: 1,
      fetchImplementation: async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('request aborted')));
        }),
    });

    await expect(gateway.proposeScene({ prompt: 'Create an office' })).rejects.toThrow(
      'Gemini planning request timed out.',
    );
  });

  it('rejects malformed Gemini API responses', async () => {
    const gateway = gatewayWithResponse(new Response('not-json', { status: 200 }));

    await expect(gateway.proposeScene({ prompt: 'Create an office' })).rejects.toThrow(
      'Gemini returned a malformed API response.',
    );
  });

  it('rejects malformed SceneProposal JSON', async () => {
    const gateway = gatewayWithResponse(
      jsonResponse({ candidates: [{ content: { parts: [{ text: '{not-json' }] } }] }),
    );

    await expect(gateway.proposeScene({ prompt: 'Create an office' })).rejects.toBeInstanceOf(
      GeminiPlanningError,
    );
  });

  it('rejects SceneProposal values that fail contract validation', async () => {
    const gateway = gatewayWithResponse(
      jsonResponse({
        candidates: [{ content: { parts: [{ text: JSON.stringify({ kind: 'unsupported' }) }] } }],
      }),
    );

    await expect(gateway.proposeScene({ prompt: 'Create an office' })).rejects.toThrow(
      'Gemini returned a ScenePlan that failed validation.',
    );
  });
});

function gatewayWithResponse(response: Response): GeminiGateway {
  return new GeminiGateway({
    apiKey: 'test-key',
    fetchImplementation: async () => response,
  });
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

const successfulGeminiResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
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
                    material: {
                      color: [0.5, 0.5, 0.5],
                      metallic: 0,
                      roughness: 0.5,
                    },
                  },
                ],
                lights: [],
                camera: { location: [4, -4, 3], rotation: [1, 0, 0.7], lens: 50 },
              },
            }),
          },
        ],
      },
    },
  ],
};
