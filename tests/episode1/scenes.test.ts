// tests/episode1/scenes.test.ts
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { validateSceneChars, calcDialogueDur, calcSceneDur } from '../../src/compositions/episode1/timing';

describe('LION_RABBIT_SCENES data integrity', () => {
  it('has at least 8 scenes', () => {
    expect(LION_RABBIT_SCENES.length).toBeGreaterThanOrEqual(8);
  });

  it('first scene (hook) has kaaliya as first dialogue speaker', () => {
    const hook = LION_RABBIT_SCENES[0];
    const firstLine = hook.dialogue[0];
    expect(firstLine.char).toBe('kaaliya');
  });

  it('no scene has phantom chars in dialogue', () => {
    for (const scene of LION_RABBIT_SCENES) {
      expect(() => validateSceneChars(scene)).not.toThrow();
    }
  });

  it('has no hardcoded dur: 135', () => {
    for (const scene of LION_RABBIT_SCENES) {
      for (const line of scene.dialogue) {
        expect(line.dur).not.toBe(135);
      }
    }
  });

  it('tension scenes have camI >= 0.7', () => {
    const tensionScenes = LION_RABBIT_SCENES.filter(s =>
      s.id === 'well-trick' || s.id === 'reveal' || s.id === 'hook'
    );
    expect(tensionScenes.length).toBeGreaterThan(0);
    for (const scene of tensionScenes) {
      expect(scene.camI).toBeGreaterThanOrEqual(0.7);
    }
  });

  it('at least 4 scenes have shortsFlag lines or shortsCutScene', () => {
    const scenesWithShorts = LION_RABBIT_SCENES.filter(scene =>
      scene.dialogue.some(line => line.shortsFlag) || scene.shortsCutScene
    );
    expect(scenesWithShorts.length).toBeGreaterThanOrEqual(4);
  });

  it('last scene has a loop hook line with shortsFlag', () => {
    const lastScene = LION_RABBIT_SCENES[LION_RABBIT_SCENES.length - 1];
    const hasLoopHook = lastScene.dialogue.some(l => l.shortsFlag);
    expect(hasLoopHook).toBe(true);
  });
});

describe('LION_RABBIT_SCENES timing', () => {
  it('total duration with auto-calculated dialogue is under 145s (4350 frames)', () => {
    let totalFrames = 0;
    for (const scene of LION_RABBIT_SCENES) {
      if (typeof scene.dur === 'number') {
        totalFrames += scene.dur * 30;
      } else {
        totalFrames += calcSceneDur(scene.dialogue);
      }
    }
    totalFrames += (6 + 5) * 30;
    expect(totalFrames).toBeLessThanOrEqual(4350);
  });

  it('Shorts-flagged content totals between 45s and 65s', () => {
    let shortsFrames = 0;
    for (const scene of LION_RABBIT_SCENES) {
      if (scene.shortsCutScene) {
        if (typeof scene.dur === 'number') {
          shortsFrames += scene.dur * 30;
        } else {
          shortsFrames += calcSceneDur(scene.dialogue);
        }
      }
    }
    expect(shortsFrames).toBeGreaterThanOrEqual(45 * 30);
    expect(shortsFrames).toBeLessThanOrEqual(65 * 30);
  });
});
