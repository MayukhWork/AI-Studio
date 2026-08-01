import { describe, expect, it } from 'vitest';

import { scenePlanV1Instructions } from '../src/index.js';

describe('scenePlanV1Instructions', () => {
  it('requires rotations in radians and provides concrete conversion examples', () => {
    expect(scenePlanV1Instructions).toContain('radians, never degrees');
    expect(scenePlanV1Instructions).toContain('90° = 1.5708');
    expect(scenePlanV1Instructions).toContain('45° = 0.7854');
    expect(scenePlanV1Instructions).toContain('180° = 3.1416');
    expect(scenePlanV1Instructions).toContain('summary at 120 characters or fewer');
    expect(scenePlanV1Instructions).toContain('every light size to at least 0.01');
  });
});
