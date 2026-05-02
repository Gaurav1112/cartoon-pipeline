// tests/episode1/integration.test.ts
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES, INTRO_SCENE_INDEX } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { validateSceneChars } from '../../src/compositions/episode1/timing';

describe('Episode1 integration — viral requirements', () => {
  it('intro scene appears AFTER index 0', () => {
    const introIndex = LION_RABBIT_SCENES.findIndex(s => s.id === 'intro');
    expect(introIndex).toBeGreaterThan(0);
  });

  it('INTRO_SCENE_INDEX is exported and > 0', () => {
    expect(INTRO_SCENE_INDEX).toBeGreaterThan(0);
  });

  it('hook scene is first and has a textOverlay on its first line', () => {
    const hook = LION_RABBIT_SCENES[0];
    expect(hook.id).toBe('hook');
    expect(hook.dialogue[0].textOverlay).toBeDefined();
  });

  it('all scenes pass phantom-char validation', () => {
    for (const scene of LION_RABBIT_SCENES) {
      expect(() => validateSceneChars(scene)).not.toThrow();
    }
  });

  it('well-trick scene has sfxKey: splash on at least one line', () => {
    const wellScene = LION_RABBIT_SCENES.find(s => s.id === 'well-trick');
    expect(wellScene).toBeDefined();
    const splashLine = wellScene!.dialogue.find(l => l.sfxKey === 'splash');
    expect(splashLine).toBeDefined();
  });

  it('moral scene has at least one bablu line', () => {
    const moralScene = LION_RABBIT_SCENES.find(s => s.id === 'moral');
    expect(moralScene).toBeDefined();
    const babluLine = moralScene!.dialogue.find(l => l.char === 'bablu');
    expect(babluLine).toBeDefined();
  });

  it('no tension scene has camI of 0', () => {
    const expectedTensionIds = ['well-trick', 'hook'];
    for (const id of expectedTensionIds) {
      const scene = LION_RABBIT_SCENES.find(s => s.id === id);
      if (scene) expect(scene.camI).toBeGreaterThan(0);
    }
  });
});
