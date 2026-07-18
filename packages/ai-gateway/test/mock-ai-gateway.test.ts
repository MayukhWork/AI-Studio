import { describe, expect, it } from 'vitest';

import { MockAiGateway, UnsupportedPromptError } from '../src/index.js';

describe('MockAiGateway', () => {
  it('returns a structured proposal for the supported prompt', async () => {
    const gateway = new MockAiGateway();

    await expect(gateway.proposeScene({ prompt: 'Create a cube' })).resolves.toEqual({
      kind: 'create-cube',
    });
  });

  it('rejects unsupported prompts before they enter the execution path', async () => {
    const gateway = new MockAiGateway();

    await expect(gateway.proposeScene({ prompt: 'Create a sphere' })).rejects.toBeInstanceOf(
      UnsupportedPromptError,
    );
  });
});
