import { describe, it, expect } from 'vitest';
import { generateEpisode } from '../../src/story/story-engine';
import {
  mulberry32, createRng, seededPick, seededShuffle, combineSeeds,
} from '../../src/utils/seeded-rng';

describe('determinism contract', () => {
  it('mulberry32 produces identical streams for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 1000; i++) expect(a()).toBe(b());
  });

  it('mulberry32 produces different streams for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    let differentCount = 0;
    for (let i = 0; i < 100; i++) if (a() !== b()) differentCount++;
    expect(differentCount).toBeGreaterThan(95);
  });

  it('createRng is the canonical alias for mulberry32', () => {
    const a = createRng(99);
    const b = mulberry32(99);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it('seededPick is deterministic for fixed seed', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const r1 = createRng(7);
    const r2 = createRng(7);
    for (let i = 0; i < 50; i++) {
      expect(seededPick(arr, r1)).toBe(seededPick(arr, r2));
    }
  });

  it('seededShuffle preserves length and elements, deterministic per seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const s1 = seededShuffle(arr, createRng(5));
    const s2 = seededShuffle(arr, createRng(5));
    expect(s1).toEqual(s2);
    expect([...s1].sort((a, b) => a - b)).toEqual(arr);
  });

  it('combineSeeds: same inputs → same output, different inputs likely differ', () => {
    expect(combineSeeds(1, 2, 3)).toBe(combineSeeds(1, 2, 3));
    expect(combineSeeds(1, 2, 3)).not.toBe(combineSeeds(3, 2, 1));
  });

  it('generateEpisode is byte-identical on repeat calls (seed contract)', () => {
    for (const [topicId, ep] of [[1, 1], [42, 7], [101, 3]] as const) {
      const a = generateEpisode(topicId, ep);
      const b = generateEpisode(topicId, ep);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it('generateEpisode varies across different (topicId, episode) pairs', () => {
    const a = generateEpisode(1, 1);
    const b = generateEpisode(1, 2);
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });
});
