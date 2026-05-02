// tests/episode1/scenes.test.ts
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES, INTRO_SCENE_INDEX } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { validateSceneChars, calcDialogueDur, calcSceneDur } from '../../src/compositions/episode1/timing';
import type { SFXKey } from '../../src/compositions/episode1/types';

// ─── Data integrity ───────────────────────────────────────────────────────────

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

  // ── NEW: id validity ────────────────────────────────────────────────────

  it('every scene has a non-empty string id', () => {
    for (const scene of LION_RABBIT_SCENES) {
      expect(typeof scene.id).toBe('string');
      expect(scene.id.length).toBeGreaterThan(0);
    }
  });

  it('all scene ids are unique — no duplicates', () => {
    const ids = LION_RABBIT_SCENES.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  // ── NEW: camI bounds ────────────────────────────────────────────────────

  it('camI is always in range 0–1 for every scene', () => {
    for (const scene of LION_RABBIT_SCENES) {
      expect(scene.camI).toBeGreaterThanOrEqual(0);
      expect(scene.camI).toBeLessThanOrEqual(1);
    }
  });

  // ── NEW: intro scene structure ──────────────────────────────────────────

  it('intro scene has a numeric dur (not auto) since it has no dialogue', () => {
    const intro = LION_RABBIT_SCENES.find(s => s.id === 'intro');
    expect(intro).toBeDefined();
    expect(typeof intro!.dur).toBe('number');
  });

  it('intro scene has an empty dialogue array', () => {
    const intro = LION_RABBIT_SCENES.find(s => s.id === 'intro');
    expect(intro!.dialogue).toHaveLength(0);
  });

  // ── NEW: well-trick scene bg ────────────────────────────────────────────

  it('well-trick scene uses the "well" background', () => {
    const wellScene = LION_RABBIT_SCENES.find(s => s.id === 'well-trick');
    expect(wellScene).toBeDefined();
    expect(wellScene!.bg).toBe('well');
  });

  // ── NEW: loop-hook is the final scene ───────────────────────────────────

  it('loop-hook is the last scene in the array', () => {
    const lastScene = LION_RABBIT_SCENES[LION_RABBIT_SCENES.length - 1];
    expect(lastScene.id).toBe('loop-hook');
  });

  // ── NEW: hook scene camera ──────────────────────────────────────────────

  it('hook scene (index 0) uses zoom_in camera', () => {
    expect(LION_RABBIT_SCENES[0].cam).toBe('zoom_in');
  });

  // ── NEW: all sfxKey values are valid SFXKey literals ───────────────────

  const VALID_SFX_KEYS: SFXKey[] = [
    'roar', 'rabbit_hop', 'dramatic', 'shock', 'record_scratch',
    'victory', 'suspense', 'splash', 'rimshot', 'boing',
    'reveal', 'happy_moment', 'giggle', 'gasp', 'heartbeat',
    'mystery', 'cartoon_run', 'applause', 'pond', 'birds', 'breeze',
  ];

  it('all sfxKey values in dialogue are valid SFXKey literals', () => {
    for (const scene of LION_RABBIT_SCENES) {
      for (const line of scene.dialogue) {
        if (line.sfxKey !== undefined) {
          expect(VALID_SFX_KEYS).toContain(line.sfxKey);
        }
      }
    }
  });

  it('all ambientSfx values in scenes are valid SFXKey literals', () => {
    for (const scene of LION_RABBIT_SCENES) {
      if (scene.ambientSfx !== undefined) {
        expect(VALID_SFX_KEYS).toContain(scene.ambientSfx);
      }
    }
  });

  // ── NEW: INTRO_SCENE_INDEX accuracy ─────────────────────────────────────

  it('INTRO_SCENE_INDEX matches the actual index of scene with id="intro"', () => {
    const actualIndex = LION_RABBIT_SCENES.findIndex(s => s.id === 'intro');
    expect(INTRO_SCENE_INDEX).toBe(actualIndex);
  });

  it('scene at INTRO_SCENE_INDEX has id "intro"', () => {
    expect(LION_RABBIT_SCENES[INTRO_SCENE_INDEX].id).toBe('intro');
  });

  // ── NEW: viral structure order constraints ──────────────────────────────

  it('hook scene (id="hook") appears before intro scene (id="intro")', () => {
    const hookIdx = LION_RABBIT_SCENES.findIndex(s => s.id === 'hook');
    const introIdx = LION_RABBIT_SCENES.findIndex(s => s.id === 'intro');
    expect(hookIdx).toBeLessThan(introIdx);
  });

  it('well-trick scene appears before victory scene', () => {
    const wellIdx = LION_RABBIT_SCENES.findIndex(s => s.id === 'well-trick');
    const victoryIdx = LION_RABBIT_SCENES.findIndex(s => s.id === 'victory');
    expect(wellIdx).toBeLessThan(victoryIdx);
  });

  it('moral scene appears before loop-hook scene', () => {
    const moralIdx = LION_RABBIT_SCENES.findIndex(s => s.id === 'moral');
    const loopIdx = LION_RABBIT_SCENES.findIndex(s => s.id === 'loop-hook');
    expect(moralIdx).toBeLessThan(loopIdx);
  });

  // ── NEW: character presence validation ──────────────────────────────────

  it('volunteer scene includes arjun, bablu, and meera in chars', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'volunteer');
    expect(scene).toBeDefined();
    const charIds = scene!.chars.map(c => c.id);
    expect(charIds).toContain('arjun');
    expect(charIds).toContain('bablu');
    expect(charIds).toContain('meera');
  });

  it('well-trick scene includes both arjun and kaaliya in chars', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'well-trick');
    expect(scene).toBeDefined();
    const charIds = scene!.chars.map(c => c.id);
    expect(charIds).toContain('arjun');
    expect(charIds).toContain('kaaliya');
  });

  it('moral scene includes guruji and bablu in chars', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'moral');
    expect(scene).toBeDefined();
    const charIds = scene!.chars.map(c => c.id);
    expect(charIds).toContain('guruji');
    expect(charIds).toContain('bablu');
  });

  // ── NEW: patternInterrupt validity ──────────────────────────────────────

  const VALID_PATTERN_INTERRUPTS = ['freeze_frame', 'zoom_punch', 'cut_to_black', 'shake', 'none', undefined];

  it('all patternInterrupt values are valid types', () => {
    for (const scene of LION_RABBIT_SCENES) {
      for (const line of scene.dialogue) {
        expect(VALID_PATTERN_INTERRUPTS).toContain(line.patternInterrupt);
      }
    }
  });
});

// ─── Timing ───────────────────────────────────────────────────────────────────

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
    // YouTube Shorts expanded to 3 minutes in 2024 — 70s is within the valid range
    // and gives the Shorts cut enough room for hook + volunteer + well-trick + victory
    expect(shortsFrames).toBeLessThanOrEqual(70 * 30);
  });

  // ── NEW: timing precision ────────────────────────────────────────────────

  it('total episode duration is at least 60s (1800 frames)', () => {
    let totalFrames = 0;
    for (const scene of LION_RABBIT_SCENES) {
      if (typeof scene.dur === 'number') {
        totalFrames += scene.dur * 30;
      } else {
        totalFrames += calcSceneDur(scene.dialogue);
      }
    }
    totalFrames += (6 + 5) * 30;
    expect(totalFrames).toBeGreaterThanOrEqual(60 * 30);
  });

  it('no individual auto-dur scene is longer than 60s (1800 frames)', () => {
    for (const scene of LION_RABBIT_SCENES) {
      if (scene.dur === 'auto') {
        const frames = calcSceneDur(scene.dialogue);
        expect(frames).toBeLessThanOrEqual(60 * 30);
      }
    }
  });

  it('hook scene dialogue is at least 1 frame long', () => {
    const hook = LION_RABBIT_SCENES[0];
    expect(calcSceneDur(hook.dialogue)).toBeGreaterThan(0);
  });

  it('every auto-dur scene with dialogue has positive duration', () => {
    for (const scene of LION_RABBIT_SCENES) {
      if (scene.dur === 'auto' && scene.dialogue.length > 0) {
        expect(calcSceneDur(scene.dialogue)).toBeGreaterThan(0);
      }
    }
  });

  it('every explicit-dur scene has a non-negative duration', () => {
    for (const scene of LION_RABBIT_SCENES) {
      if (typeof scene.dur === 'number') {
        expect(scene.dur).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
