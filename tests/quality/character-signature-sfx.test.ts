import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  CHARACTER_SIGNATURE_SFX,
  planCharacterSignatureLayers,
} from '../../src/audio/character-signatures';
import type { CharacterId } from '../../src/types';

const ALL_CHARS: CharacterId[] = [
  'arjun', 'meera', 'bablu', 'guruji', 'kaaliya', 'amma', 'raja', 'moti',
];

describe('character signature SFX (Peppa/Bheem creature-voice layer)', () => {
  it('every CharacterId has exactly one signature SFX file mapped', () => {
    for (const id of ALL_CHARS) {
      const entry = CHARACTER_SIGNATURE_SFX[id];
      expect(entry, `missing signature for ${id}`).toBeDefined();
      expect(entry.sfxFile).toMatch(/^sfx\/characters\/[a-z_]+\.mp3$/);
    }
  });

  it('all eight signature SFX files are unique (no shared sounds)', () => {
    const files = ALL_CHARS.map((c) => CHARACTER_SIGNATURE_SFX[c].sfxFile);
    expect(new Set(files).size).toBe(files.length);
  });

  it('all signature SFX assets exist on disk after voices/sfx generation', () => {
    const root = resolve(process.cwd(), 'public', 'audio');
    for (const id of ALL_CHARS) {
      const p = resolve(root, CHARACTER_SIGNATURE_SFX[id].sfxFile);
      expect(existsSync(p), `missing asset: ${p}`).toBe(true);
    }
  });

  it('plans one signature layer per (scene, character first-line) — deterministic', () => {
    const scenes = [
      {
        sceneIndex: 0,
        dialogue: [
          { characterId: 'arjun' as CharacterId, startMs: 1_000, durationMs: 800 },
          { characterId: 'meera' as CharacterId, startMs: 2_000, durationMs: 800 },
          { characterId: 'arjun' as CharacterId, startMs: 3_000, durationMs: 800 },
        ],
      },
      {
        sceneIndex: 1,
        dialogue: [
          { characterId: 'arjun' as CharacterId, startMs: 5_000, durationMs: 800 },
          { characterId: 'kaaliya' as CharacterId, startMs: 6_000, durationMs: 800 },
        ],
      },
    ];
    const layers = planCharacterSignatureLayers(scenes);
    // Per scene: arjun (1) + meera (1) in scene 0; arjun (1) + kaaliya (1) in scene 1 = 4
    expect(layers).toHaveLength(4);
    // First trigger should fire ~250ms BEFORE the line
    expect(layers[0].startMs).toBe(1_000 - 250);
    // Layers should be tagged 'sfx' and ducked under dialogue
    for (const l of layers) {
      expect(l.type).toBe('sfx');
      expect(l.duckDuringDialogue).toBe(true);
      expect(l.volumeDb).toBeLessThanOrEqual(-12);
    }
  });

  it('startMs never goes negative (scene-opener lines clamped to 0)', () => {
    const layers = planCharacterSignatureLayers([
      {
        sceneIndex: 0,
        dialogue: [
          { characterId: 'arjun' as CharacterId, startMs: 100, durationMs: 800 },
        ],
      },
    ]);
    expect(layers[0].startMs).toBeGreaterThanOrEqual(0);
  });
});
