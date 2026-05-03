// tests/quality/zimmer-motifs.test.ts
//
// M4.3 — Hans Zimmer leitmotif gap. Pin: every character has a 3–6
// note motif with a unique interval set, and buildMotifFfmpegFilter
// emits an `aevalsrc` chain encoding the requested startMs.

import { describe, it, expect } from 'vitest';
import {
  MOTIF_BY_CHARACTER,
  buildMotifFfmpegFilter,
} from '../../src/audio/character-motifs';
import type { CharacterId } from '../../src/types';

const ALL_CHARACTERS: CharacterId[] = [
  'arjun',
  'meera',
  'bablu',
  'guruji',
  'kaaliya',
  'amma',
  'raja',
  'moti',
];

describe('Zimmer per-character leitmotifs', () => {
  it('every CharacterId has a motif entry', () => {
    for (const c of ALL_CHARACTERS) {
      const m = MOTIF_BY_CHARACTER[c];
      expect(m, `missing motif for ${c}`).toBeDefined();
      expect(m.intervals.length).toBe(m.durationsMs.length);
    }
  });

  it('every motif has 3–6 notes (memorable, not melody)', () => {
    for (const c of ALL_CHARACTERS) {
      const m = MOTIF_BY_CHARACTER[c];
      expect(m.intervals.length).toBeGreaterThanOrEqual(3);
      expect(m.intervals.length).toBeLessThanOrEqual(6);
    }
  });

  it('every motif uses a sine or triangle waveform', () => {
    for (const c of ALL_CHARACTERS) {
      expect(['sine', 'triangle']).toContain(MOTIF_BY_CHARACTER[c].waveform);
    }
  });

  it('no two characters share the same intervals[]', () => {
    const seen = new Map<string, CharacterId>();
    for (const c of ALL_CHARACTERS) {
      const key = MOTIF_BY_CHARACTER[c].intervals.join(',');
      const prev = seen.get(key);
      if (prev) {
        throw new Error(`Motif intervals collide: ${prev} and ${c} both = [${key}]`);
      }
      seen.set(key, c);
    }
  });

  it('buildMotifFfmpegFilter contains aevalsrc and encodes startMs', () => {
    const filter = buildMotifFfmpegFilter('moti', 1500);
    expect(filter).toContain('aevalsrc');
    expect(filter).toContain('1500');
  });

  it('buildMotifFfmpegFilter is pure / deterministic', () => {
    const a = buildMotifFfmpegFilter('kaaliya', 800);
    const b = buildMotifFfmpegFilter('kaaliya', 800);
    expect(a).toBe(b);
  });

  it('different startMs yields different filter strings', () => {
    const a = buildMotifFfmpegFilter('arjun', 200);
    const b = buildMotifFfmpegFilter('arjun', 1200);
    expect(a).not.toBe(b);
  });
});
