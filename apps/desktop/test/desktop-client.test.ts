import { describe, expect, it } from 'vitest';

import { ApplicationFacade, type PromptExecutionService } from '@ai3d/application';

import { DesktopClient } from '../src/index.js';

describe('DesktopClient', () => {
  it('uses the application API instead of a runtime adapter', async () => {
    const applicationService: PromptExecutionService = {
      executePrompt: async (request) => ({
        proposal: { kind: 'create-cube' },
        toolResult: {
          toolId: 'scene.CreateCube@v1',
          correlationId: request.correlationId,
          status: 'completed',
        },
      }),
    };
    const desktopClient = new DesktopClient(new ApplicationFacade(applicationService));

    const viewModel = await desktopClient.submitPrompt('Create a cube');

    expect(viewModel.message).toBe('Blender was launched to create one cube.');
    expect(viewModel.execution.proposal).toEqual({ kind: 'create-cube' });
  });
});
