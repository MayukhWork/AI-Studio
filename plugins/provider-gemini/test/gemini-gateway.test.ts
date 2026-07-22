import { describe, expect, it } from 'vitest';

import { GeminiGateway, GeminiGatewayNotImplementedError } from '../src/index.js';

describe('GeminiGateway', () => {
  it('is selectable without making a network request in Phase 1', async () => {
    const gateway = new GeminiGateway({ apiKey: 'test-key', model: 'gemini-2.5-flash' });

    await expect(gateway.proposeScene({ prompt: 'Create a cube' })).rejects.toBeInstanceOf(
      GeminiGatewayNotImplementedError,
    );
  });
});
