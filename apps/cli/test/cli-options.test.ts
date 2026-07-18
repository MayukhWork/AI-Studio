import { describe, expect, it } from 'vitest';

import { parseCreateCubeCliOptions } from '../src/index.js';

describe('parseCreateCubeCliOptions', () => {
  it('requires a prompt and a Blender executable path', () => {
    expect(() => parseCreateCubeCliOptions([])).toThrow('Usage: ai3d-create-cube');
  });

  it('parses the runnable create-cube command', () => {
    expect(
      parseCreateCubeCliOptions(['Create a cube', '--blender', 'C:/Blender/blender.exe']),
    ).toEqual({
      prompt: 'Create a cube',
      blenderExecutablePath: 'C:/Blender/blender.exe',
    });
  });
});
