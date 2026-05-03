import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Tartakovsky: a colorscript is the spine of a short film.
// We pin three contracts:
//   1. Backgrounds are not monotone — at least 2 distinct bg values.
//   2. timeOfDay is not monotone — at least 2 distinct time values.
//   3. The MotionSmear (impact-frame) component is exported and used.
describe('Tartakovsky colorscript + impact-frame language', () => {
  it('uses at least 2 distinct backgrounds across the episode', () => {
    const bgs = new Set(LION_RABBIT_SCENES.map((s) => s.bg));
    expect(bgs.size).toBeGreaterThanOrEqual(2);
  });

  it('uses at least 2 distinct timeOfDay values (colorscript variation)', () => {
    const times = new Set(LION_RABBIT_SCENES.map((s) => s.time));
    expect(times.size).toBeGreaterThanOrEqual(2);
  });

  it('hook scene opens at dusk OR dawn (warm/dramatic lighting)', () => {
    const hook = LION_RABBIT_SCENES.find((s) => s.id === 'hook');
    expect(hook).toBeDefined();
    expect(['dusk', 'dawn']).toContain(hook!.time);
  });

  it('MotionSmear component is wired into SceneRenderer', () => {
    const sceneSrc = readFileSync(
      resolve(__dirname, '../../src/compositions/episode1/SceneRenderer.tsx'),
      'utf8'
    );
    expect(sceneSrc).toMatch(/MotionSmear/);
  });
});
