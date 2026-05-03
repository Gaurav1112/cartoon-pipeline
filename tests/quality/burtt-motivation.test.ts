// tests/quality/burtt-motivation.test.ts
//
// M4.4 — Ben Burtt motivation contract. Every SFX has a non-empty
// motivationTag, and selection drops any orphan sound (no on-screen
// character/beat backing it). SFX layer count is bounded ≤8/scene.

import { describe, it, expect } from 'vitest';
import {
  SFX_DATABASE,
  selectMotivatedSfx,
  MAX_SFX_LAYERS_PER_SCENE,
  type MotivationTag,
} from '../../src/audio/sfx-triggers';
import { generateEpisode } from '../../src/story/story-engine';

const ALLOWED: MotivationTag[] = [
  'character_action',
  'environment_event',
  'emotional_amplifier',
  'establishing',
];

describe('Burtt motivation contract', () => {
  it('every SFX in SFX_DATABASE has a motivationTag in the allowed set', () => {
    expect(SFX_DATABASE.length).toBeGreaterThan(50);
    for (const e of SFX_DATABASE) {
      expect(e.motivationTag, `missing tag: ${e.keyword}`).toBeTruthy();
      expect(ALLOWED).toContain(e.motivationTag);
    }
  });

  it('selectMotivatedSfx caps layer count at the per-scene bound', () => {
    expect(MAX_SFX_LAYERS_PER_SCENE).toBeLessThanOrEqual(8);
    // Stuff a scene with many keywords; the selector must still cap.
    const flooded = {
      sfxKeywords: SFX_DATABASE.slice(0, 30).map((e) => e.keyword),
      characters: [{ characterId: 'arjun' as const }],
      mood: 'climax',
      dialogue: [{ emotion: 'angry' as const }],
    };
    const out = selectMotivatedSfx(flooded);
    expect(out.length).toBeLessThanOrEqual(MAX_SFX_LAYERS_PER_SCENE);
  });

  it('drops character_action SFX when no character is on-screen', () => {
    const scene = {
      sfxKeywords: ['running', 'crash'], // both 'character_action'
      characters: [], // no characters
      mood: 'tense',
      dialogue: [],
    };
    const out = selectMotivatedSfx(scene);
    for (const m of out) {
      expect(m.motivationTag).not.toBe('character_action');
    }
  });

  it('drops emotional_amplifier SFX when there is no emotional beat', () => {
    const scene = {
      sfxKeywords: ['dramatic', 'reveal'], // both emotional_amplifier
      characters: [{ characterId: 'arjun' as const }],
      mood: undefined,
      dialogue: [{ emotion: 'neutral' as const }],
    };
    const out = selectMotivatedSfx(scene);
    for (const m of out) {
      expect(m.motivationTag).not.toBe('emotional_amplifier');
    }
  });

  it('keeps establishing SFX even on a sparse scene', () => {
    const scene = {
      sfxKeywords: ['birds'],
      characters: [],
      mood: undefined,
      dialogue: [],
    };
    const out = selectMotivatedSfx(scene);
    const tags = out.map((m) => m.motivationTag);
    expect(tags).toContain('establishing');
  });

  it('100% of selected SFX in a generated episode trace back to a character or beat', () => {
    const ep = generateEpisode(1, 42);
    let totalLayers = 0;
    for (const scene of ep.scenes) {
      const layers = selectMotivatedSfx(scene);
      totalLayers += layers.length;
      expect(layers.length).toBeLessThanOrEqual(MAX_SFX_LAYERS_PER_SCENE);
      for (const m of layers) {
        switch (m.motivationTag) {
          case 'character_action':
            expect(scene.characters.length).toBeGreaterThan(0);
            break;
          case 'environment_event':
            expect(!!scene.mood || scene.sfxKeywords.length > 0).toBe(true);
            break;
          case 'emotional_amplifier':
            expect(
              !!scene.mood ||
                scene.dialogue.some(
                  (d) => d.emotion && d.emotion !== 'neutral',
                ),
            ).toBe(true);
            break;
          case 'establishing':
            // Always motivated by location/ambience.
            break;
        }
      }
    }
    expect(totalLayers).toBeGreaterThan(0);
  });
});
