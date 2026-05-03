/**
 * Single source of truth for deterministic randomness across the pipeline.
 *
 * Hard rule (enforced by tests/quality/no-nondeterminism.test.ts):
 *   - The standard library RNG is BANNED anywhere in src/ at render time.
 *   - Wall-clock APIs are BANNED in render-affecting code paths.
 *   - All "randomness" must derive from a numeric seed flowing through these helpers.
 *
 * Why mulberry32?
 *   - 32-bit state, deterministic across V8/JSC/SpiderMonkey
 *   - Good statistical quality for our scale (a few thousand draws per episode)
 *   - Tiny + branchless, safe to call inside React render
 *
 * Reproducibility contract:
 *   createRng(s)() called N times produces the same N numbers on every machine,
 *   every Node version, every render run.
 */

export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const createRng = mulberry32;

export function seededPick<T>(arr: readonly T[], rng: () => number): T {
  if (arr.length === 0) throw new Error('seededPick: empty array');
  return arr[Math.floor(rng() * arr.length)];
}

export function seededShuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Deterministic int in [min, max] (inclusive). */
export function seededInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Deterministic float in [min, max). */
export function seededFloat(min: number, max: number, rng: () => number): number {
  return rng() * (max - min) + min;
}

/**
 * Combine multiple seeds into one. Uses xmur3-style mixing so that small
 * changes in inputs produce well-distributed outputs.
 */
export function combineSeeds(...seeds: number[]): number {
  let h = 1779033703 ^ seeds.length;
  for (const s of seeds) {
    h = Math.imul(h ^ (s | 0), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
