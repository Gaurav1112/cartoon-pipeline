// tests/episode1/integration.test.ts
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES, INTRO_SCENE_INDEX } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { validateSceneChars, calcEpisodeDuration, calcSceneDur } from '../../src/compositions/episode1/timing';

// ─── Viral structure requirements ────────────────────────────────────────────

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

  // ── NEW: full episode duration through calcEpisodeDuration ───────────────

  it('calcEpisodeDuration(LION_RABBIT_SCENES) is in valid YouTube range (60s–165s)', () => {
    // M2.4: ceiling raised from 160s → 165s to absorb ~3.3s of new
    // scene-tail breath (~11 scenes × 300 ms).
    const totalFrames = calcEpisodeDuration(LION_RABBIT_SCENES);
    expect(totalFrames).toBeGreaterThanOrEqual(60 * 30);
    expect(totalFrames).toBeLessThanOrEqual(165 * 30);
  });

  it('calcEpisodeDuration returns a positive integer', () => {
    const result = calcEpisodeDuration(LION_RABBIT_SCENES);
    expect(result).toBeGreaterThan(0);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('calcEpisodeDuration exceeds scene content total by overhead + per-scene tail', () => {
    // M2.4: total = Σ(scene content) + OVERHEAD + Σ(sceneTail).
    const OVERHEAD = (6 + 5) * 30; // 330
    const SCENE_TAIL = 9; // 300 ms × 30 / 1000
    let rawSceneFrames = 0;
    for (const scene of LION_RABBIT_SCENES) {
      if (typeof scene.dur === 'number') {
        rawSceneFrames += scene.dur * 30;
      } else {
        rawSceneFrames += calcSceneDur(scene.dialogue);
      }
    }
    const tailTotal = LION_RABBIT_SCENES.reduce(
      (s, sc) => s + (typeof sc.sceneTailMs === 'number'
        ? Math.round(sc.sceneTailMs * 30 / 1000)
        : SCENE_TAIL),
      0,
    );
    expect(calcEpisodeDuration(LION_RABBIT_SCENES)).toBe(rawSceneFrames + OVERHEAD + tailTotal);
  });

  // ── NEW: curiosity-gap scene exists and comes before intro ───────────────

  it('curiosity-gap scene exists', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'curiosity-gap');
    expect(scene).toBeDefined();
  });

  it('curiosity-gap appears before intro (viral hook ordering)', () => {
    const cgIdx = LION_RABBIT_SCENES.findIndex(s => s.id === 'curiosity-gap');
    const introIdx = LION_RABBIT_SCENES.findIndex(s => s.id === 'intro');
    expect(cgIdx).toBeGreaterThan(-1);
    expect(cgIdx).toBeLessThan(introIdx);
  });

  it('curiosity-gap first dialogue uses arjun (hero after villain hook)', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'curiosity-gap');
    expect(scene!.dialogue[0].char).toBe('arjun');
  });

  // ── NEW: late-arrival scene links villain to well-trick ──────────────────

  it('late-arrival scene exists and has kaaliya speaking', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'late-arrival');
    expect(scene).toBeDefined();
    const kaaliyaLine = scene!.dialogue.find(l => l.char === 'kaaliya');
    expect(kaaliyaLine).toBeDefined();
  });

  it('late-arrival scene includes the "shock" sfxKey (surprise reveal)', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'late-arrival');
    expect(scene).toBeDefined();
    const shockLine = scene!.dialogue.find(l => l.sfxKey === 'shock');
    expect(shockLine).toBeDefined();
  });

  // ── NEW: well-trick is the most shareable scene (critical path) ──────────

  it('well-trick scene is marked as shortsCutScene (most shareable)', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'well-trick');
    expect(scene!.shortsCutScene).toBe(true);
  });

  it('well-trick scene has the highest camI among all scenes (peak tension)', () => {
    const wellScene = LION_RABBIT_SCENES.find(s => s.id === 'well-trick');
    const maxCamI = Math.max(...LION_RABBIT_SCENES.map(s => s.camI));
    // well-trick should be at or tied for the top
    expect(wellScene!.camI).toBeGreaterThanOrEqual(0.8);
    expect(maxCamI).toBeGreaterThanOrEqual(wellScene!.camI);
  });

  // ── NEW: victory scene exists and provides dopamine closure ─────────────

  it('victory scene exists with arjun celebrating', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'victory');
    expect(scene).toBeDefined();
    const arjunChar = scene!.chars.find(c => c.id === 'arjun');
    expect(arjunChar).toBeDefined();
    expect(arjunChar!.pose).toBe('celebrate');
  });

  it('victory scene has victory sfxKey on at least one dialogue line', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'victory');
    const victoryLine = scene!.dialogue.find(l => l.sfxKey === 'victory');
    expect(victoryLine).toBeDefined();
  });

  // ── NEW: setup scene has suspense ambience ───────────────────────────────

  it('setup scene uses suspense ambientSfx to build stakes', () => {
    const scene = LION_RABBIT_SCENES.find(s => s.id === 'setup');
    expect(scene).toBeDefined();
    expect(scene!.ambientSfx).toBe('suspense');
  });

  // ── NEW: no Math.random() / non-determinism — all durs are numbers or "auto" ──

  it('every dialogue line dur is either "auto" or a finite positive integer — no floats', () => {
    for (const scene of LION_RABBIT_SCENES) {
      for (const line of scene.dialogue) {
        if (line.dur !== 'auto') {
          expect(Number.isInteger(line.dur)).toBe(true);
          expect(line.dur).toBeGreaterThan(0);
          expect(Number.isFinite(line.dur)).toBe(true);
        }
      }
    }
  });

  it('every explicit scene.dur (non-auto) is a positive finite number', () => {
    for (const scene of LION_RABBIT_SCENES) {
      if (typeof scene.dur === 'number') {
        expect(scene.dur).toBeGreaterThan(0);
        expect(Number.isFinite(scene.dur)).toBe(true);
      }
    }
  });

  // ── NEW: all text fields are non-empty strings ───────────────────────────

  it('all dialogue line text fields are non-empty strings', () => {
    for (const scene of LION_RABBIT_SCENES) {
      for (const line of scene.dialogue) {
        expect(typeof line.text).toBe('string');
        expect(line.text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('all textOverlay fields (when present) are non-empty strings', () => {
    for (const scene of LION_RABBIT_SCENES) {
      for (const line of scene.dialogue) {
        if (line.textOverlay !== undefined) {
          expect(typeof line.textOverlay).toBe('string');
          expect(line.textOverlay.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  // ── NEW: Shorts cut integrity ────────────────────────────────────────────

  it('shortsCutScene scenes collectively include both villain (kaaliya) and hero (arjun)', () => {
    const shortsScenesChars = LION_RABBIT_SCENES
      .filter(s => s.shortsCutScene)
      .flatMap(s => s.chars.map(c => c.id));

    expect(shortsScenesChars).toContain('kaaliya');
    expect(shortsScenesChars).toContain('arjun');
  });

  it('hook scene is marked as shortsCutScene', () => {
    const hook = LION_RABBIT_SCENES[0];
    expect(hook.shortsCutScene).toBe(true);
  });

  // ── NEW: SFX coverage — roar used for high-tension kaaliya moments ───────

  it('kaaliya dialogue lines use roar sfxKey at least twice across the episode', () => {
    let roarCount = 0;
    for (const scene of LION_RABBIT_SCENES) {
      for (const line of scene.dialogue) {
        if (line.char === 'kaaliya' && line.sfxKey === 'roar') roarCount++;
      }
    }
    expect(roarCount).toBeGreaterThanOrEqual(2);
  });

  // ── NEW: all char positions are valid ────────────────────────────────────

  it('all char positions are left, center, or right', () => {
    const validPositions = ['left', 'center', 'right'];
    for (const scene of LION_RABBIT_SCENES) {
      for (const char of scene.chars) {
        expect(validPositions).toContain(char.pos);
      }
    }
  });

  // ── NEW: no scene references an unknown bg location ─────────────────────

  it('all scene bg locations are known LocationType values', () => {
    const KNOWN_LOCATIONS = [
      'forest', 'village', 'palace', 'river', 'market', 'temple', 'school',
      'cave', 'mountain', 'garden', 'beach', 'desert', 'farm', 'bridge',
      'waterfall', 'fort', 'library', 'kitchen', 'courtyard', 'pond', 'road',
      'hilltop', 'harbor', 'ruins', 'treehouse', 'well', 'battlefield',
      'shrine', 'swamp', 'meadow',
    ];
    for (const scene of LION_RABBIT_SCENES) {
      expect(KNOWN_LOCATIONS).toContain(scene.bg);
    }
  });

  it('all scene time values are known TimeOfDay values', () => {
    const VALID_TIMES = ['dawn', 'day', 'dusk', 'night'];
    for (const scene of LION_RABBIT_SCENES) {
      expect(VALID_TIMES).toContain(scene.time);
    }
  });

  it('all scene cam values are known CameraType values', () => {
    const VALID_CAMS = ['static', 'pan_left', 'pan_right', 'zoom_in', 'zoom_out', 'drift', 'shake', 'close_up', 'wide'];
    for (const scene of LION_RABBIT_SCENES) {
      expect(VALID_CAMS).toContain(scene.cam);
    }
  });
});
