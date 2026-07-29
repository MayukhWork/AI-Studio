import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import { isCliEntrypoint, parseCreateCubeCliOptions } from '../src/index.js';

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

  it('recognizes an entrypoint after converting its path to a file URL', () => {
    const entrypointPath = process.argv[1];

    if (entrypointPath === undefined) {
      throw new Error('Vitest did not provide an entrypoint path.');
    }

    expect(isCliEntrypoint(pathToFileURL(entrypointPath).href, entrypointPath)).toBe(true);
  });
});
