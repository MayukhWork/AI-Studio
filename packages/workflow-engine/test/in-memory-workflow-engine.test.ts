import { describe, expect, it } from 'vitest';

import { InMemoryWorkflowEngine } from '../src/index.js';

describe('InMemoryWorkflowEngine', () => {
  it('runs one step and records completion', async () => {
    const workflow = new InMemoryWorkflowEngine();

    const result = await workflow.run({
      name: 'create-cube',
      run: async () => 'created',
    });

    expect(result).toEqual({ status: 'completed', value: 'created' });
    expect(workflow.getStatus()).toBe('completed');
  });

  it('records a failed state when a step rejects', async () => {
    const workflow = new InMemoryWorkflowEngine();

    await expect(
      workflow.run({
        name: 'create-cube',
        run: async () => Promise.reject(new Error('runtime unavailable')),
      }),
    ).rejects.toThrow('runtime unavailable');

    expect(workflow.getStatus()).toBe('failed');
  });
});
