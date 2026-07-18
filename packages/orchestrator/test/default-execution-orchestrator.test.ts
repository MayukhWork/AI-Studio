import { describe, expect, it } from 'vitest';

import { MockAiGateway } from '@ai3d/ai-gateway';
import { createCubeToolId, type CreateCubeToolRequest } from '@ai3d/contracts';
import type { SceneRuntime } from '@ai3d/runtime-protocol';
import { InMemoryWorkflowEngine } from '@ai3d/workflow-engine';

import { DefaultExecutionOrchestrator } from '../src/index.js';

describe('DefaultExecutionOrchestrator', () => {
  it('passes a structured proposal through the workflow to the runtime', async () => {
    const requests: CreateCubeToolRequest[] = [];
    const runtime: SceneRuntime = {
      createCube: async (request) => {
        requests.push(request);
        return {
          toolId: request.toolId,
          correlationId: request.correlationId,
          status: 'completed',
        };
      },
    };
    const orchestrator = new DefaultExecutionOrchestrator({
      aiGateway: new MockAiGateway(),
      workflowEngine: new InMemoryWorkflowEngine(),
      runtime,
    });

    const result = await orchestrator.executePrompt({
      prompt: 'Create a cube',
      correlationId: 'correlation-1',
    });

    expect(result.proposal).toEqual({ kind: 'create-cube' });
    expect(result.toolResult.status).toBe('completed');
    expect(requests).toEqual([{ toolId: createCubeToolId, correlationId: 'correlation-1' }]);
  });
});
