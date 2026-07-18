import { describe, expect, it } from 'vitest';

import { createCubeToolId } from '@ai3d/contracts';

import {
  LocalBlenderRuntime,
  type BlenderLaunchRequest,
  type BlenderProcessLauncher,
} from '../src/index.js';

describe('LocalBlenderRuntime', () => {
  it('launches Blender using its fixed create-cube expression', async () => {
    const requests: BlenderLaunchRequest[] = [];
    const launcher: BlenderProcessLauncher = {
      launch: async (request) => {
        requests.push(request);
      },
    };
    const runtime = new LocalBlenderRuntime({
      blenderExecutablePath: 'C:/Blender/blender.exe',
      processLauncher: launcher,
    });

    const result = await runtime.createCube({
      toolId: createCubeToolId,
      correlationId: 'correlation-1',
    });

    expect(result).toEqual({
      toolId: createCubeToolId,
      correlationId: 'correlation-1',
      status: 'completed',
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ executablePath: 'C:/Blender/blender.exe' });
    expect(requests[0]?.pythonExpression).toContain('primitive_cube_add');
    expect(requests[0]?.pythonExpression).not.toContain('correlation-1');
  });
});
