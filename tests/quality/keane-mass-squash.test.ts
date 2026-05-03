import { describe, it, expect } from 'vitest';
import { groundContactSquash } from '../../src/characters/animation-physics';

// Glen Keane gap M2.2 — the existing landingSquash() is a simple sine on
// walk-cycle phase. It does not respect ground-contact moment, anticipation
// before launch, or volume preservation. Keane scored the work 6/10.
//
// `groundContactSquash(verticalVelocity, mass)` is a pure utility that
// returns {sx, sy} multipliers around 1.0:
//   - tiny v (|v| < 0.5) → {1, 1}        (rest)
//   - v < 0 (downward impact) → squash sy ∈ [0.7, 1)
//   - v > 0 (upward launch / anticipation) → stretch sy > 1
//   - sx = 1 / sy (volume preservation, treating depth sz=1)
//   - mass scales effective impact by 1/√mass (heavier → less squash)
//
// This test pins the contract. Wiring into render is Phase M3 work
// (vertical velocity is not yet exposed in pose data).

describe('M2.2 groundContactSquash — Glen Keane mass-aware squash', () => {
  it('rest: v=0 returns {sx: 1, sy: 1}', () => {
    const r = groundContactSquash(0, 1);
    expect(r.sx).toBe(1);
    expect(r.sy).toBe(1);
  });

  it('rest: |v| < 0.5 returns identity', () => {
    for (const v of [-0.49, -0.1, 0, 0.1, 0.49]) {
      const r = groundContactSquash(v, 1);
      expect(r.sx).toBe(1);
      expect(r.sy).toBe(1);
    }
  });

  it('hard impact (v=-5, mass=1): sy < 0.85 and sx > 1/0.85', () => {
    const r = groundContactSquash(-5, 1);
    expect(r.sy).toBeLessThan(0.85);
    expect(r.sx).toBeGreaterThan(1 / 0.85);
  });

  it('volume preservation: sx * sy * sz ≈ 1 within 1% (sz=1)', () => {
    for (const v of [-5, -3, -1, 1, 2, 4]) {
      const { sx, sy } = groundContactSquash(v, 1);
      const vol = sx * sy * 1;
      expect(Math.abs(vol - 1)).toBeLessThanOrEqual(0.01);
    }
  });

  it('squash is clamped: sy never below 0.7', () => {
    for (const v of [-5, -10, -50, -1000]) {
      const { sy } = groundContactSquash(v, 1);
      expect(sy).toBeGreaterThanOrEqual(0.7);
    }
  });

  it('squash is clamped: sy never above 1 on impact (downward v)', () => {
    for (const v of [-5, -10, -1, -0.6]) {
      const { sy } = groundContactSquash(v, 1);
      expect(sy).toBeLessThanOrEqual(1.0);
    }
  });

  it('launch: upward v stretches (sy > 1), sx < 1', () => {
    const { sx, sy } = groundContactSquash(2, 1);
    expect(sy).toBeGreaterThan(1);
    expect(sx).toBeLessThan(1);
  });

  it('mass=4 produces less squash than mass=1 for same velocity', () => {
    // Use v=-2 so light's sy stays above the 0.7 clamp floor; the mass
    // effect must actually be observable, not hidden behind clamping.
    const heavy = groundContactSquash(-2, 4);
    const light = groundContactSquash(-2, 1);
    // Less squash = sy closer to 1 (i.e. heavier number is GREATER than light's sy).
    expect(heavy.sy).toBeGreaterThan(light.sy);
  });

  it('determinism: same input → same output', () => {
    for (const v of [-5, -1, 0, 1, 5]) {
      for (const m of [1, 2, 4]) {
        const a = groundContactSquash(v, m);
        const b = groundContactSquash(v, m);
        expect(a.sx).toBe(b.sx);
        expect(a.sy).toBe(b.sy);
      }
    }
  });

  it('mass defaults to 1 when omitted', () => {
    const r1 = groundContactSquash(-5);
    const r2 = groundContactSquash(-5, 1);
    expect(r1.sx).toBe(r2.sx);
    expect(r1.sy).toBe(r2.sy);
  });

  it('returns finite numbers for extreme inputs', () => {
    for (const v of [-1000, -10, 0, 10, 1000]) {
      for (const m of [0.25, 1, 100]) {
        const { sx, sy } = groundContactSquash(v, m);
        expect(Number.isFinite(sx)).toBe(true);
        expect(Number.isFinite(sy)).toBe(true);
      }
    }
  });
});
