import { describe, expect, it } from 'vitest';

import { sceneProposalV1JsonSchema } from '../src/index.js';

describe('sceneProposalV1JsonSchema', () => {
  it('does not duplicate the object-count business limit in the provider schema', () => {
    const objectsSchema = sceneProposalV1JsonSchema.properties.scene.properties.objects;

    expect(objectsSchema).not.toHaveProperty('maxItems');
  });
});
