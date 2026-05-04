// tests/quality/m24-scene-chopper.test.ts
/**
 * M24: Scene Chopper — boost cut frequency from 16 to 26+ cuts in 76s episode.
 */

import { chopScene } from '../../src/compositions/episode1/scene-chopper';

describe('M24: Scene Chopper', () => {
  test('short scene returns 1 sub-shot', () => {
    const result = chopScene('test', 30, 'close_up', 1.0);
    expect(result).toHaveLength(1);
  });

  test('long scene gets chopped', () => {
    const result = chopScene('test', 130, 'wide', 0.5);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  test('episode has ≥26 cuts', async () => {
    const { LION_RABBIT_SCENES } = await import('../../src/compositions/episode1/scenes-lion-rabbit');
    let count = 0;
    for (const scene of LION_RABBIT_SCENES) {
      if (scene.shortsCutScene) { count++; continue; }
      const dur = (typeof scene.dur === 'number' ? scene.dur * 30 : 150);
      count += chopScene(scene.id, dur, scene.cam, scene.camI).length;
    }
    expect(count).toBeGreaterThanOrEqual(26);
  });
});
