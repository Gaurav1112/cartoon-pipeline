import { describe, it, expect } from 'vitest';
import { generateEpisode } from '../../src/story/story-engine';

/**
 * Golden-episode contract: a frozen "shape" assertion. We don't pin every
 * narrative byte (so writers can iterate on the bank), but we DO pin the
 * reproducibility surface: same inputs → same scene count, same character
 * roster, same JSON byte-for-byte across calls.
 */
describe('golden episode shape', () => {
  it('seed (42, 1) produces a stable scene topology', () => {
    const e = generateEpisode(42, 1);
    expect(e).toBeTruthy();
    expect(Array.isArray(e.scenes)).toBe(true);
    expect(e.scenes.length).toBeGreaterThanOrEqual(3);
    expect(e.scenes.length).toBeLessThanOrEqual(12);
    for (const s of e.scenes) {
      expect(typeof s.id === 'string' || typeof s.sceneIndex === 'number').toBe(true);
      expect(Array.isArray(s.dialogue)).toBe(true);
    }
  });

  it('seed (42, 1) twice → byte-identical JSON', () => {
    const a = JSON.stringify(generateEpisode(42, 1));
    const b = JSON.stringify(generateEpisode(42, 1));
    expect(a).toBe(b);
  });
});
