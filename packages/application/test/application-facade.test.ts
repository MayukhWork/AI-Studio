import { describe, expect, it } from 'vitest';

import type { PromptExecutionService } from '../src/index.js';
import { ApplicationFacade } from '../src/index.js';

describe('ApplicationFacade', () => {
  it('delegates a client command to the orchestration port', async () => {
    const requests: { prompt: string; correlationId: string }[] = [];
    const service: PromptExecutionService = {
      executePrompt: async (request) => {
        requests.push(request);
        return {
          proposal: { kind: 'create-cube' },
          toolResult: {
            toolId: 'scene.CreateCube@v1',
            correlationId: request.correlationId,
            status: 'completed',
          },
        };
      },
    };
    const application = new ApplicationFacade(service);

    await application.executePrompt({ prompt: 'Create a cube', correlationId: 'correlation-1' });

    expect(requests).toEqual([{ prompt: 'Create a cube', correlationId: 'correlation-1' }]);
  });
});
