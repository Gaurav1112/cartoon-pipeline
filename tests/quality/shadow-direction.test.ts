import { describe, it, expect } from 'vitest';
import { shadowForTime } from '../../src/characters/shadow-direction';

// Deakins shadow direction contract — pinned per timeOfDay.

describe('shadowForTime (Deakins)', () => {
  it('dawn shadow points west (negative offsetX)', () => {
    expect(shadowForTime('dawn').offsetX).toBeLessThan(0);
  });
  it('dusk shadow points east (positive offsetX)', () => {
    expect(shadowForTime('dusk').offsetX).toBeGreaterThan(0);
  });
  it('day shadow is short (lengthMul < 1.0) and neutral', () => {
    const d = shadowForTime('day');
    expect(d.lengthMul).toBeLessThan(1.0);
    expect(Math.abs(d.offsetX)).toBeLessThan(2);
  });
  it('night shadow is shortest and dimmest', () => {
    const n = shadowForTime('night');
    expect(n.opacity).toBeLessThanOrEqual(0.18);
    expect(n.lengthMul).toBeLessThan(0.8);
  });
  it('dawn and dusk shadow lengths are long (> 1.4) — magic-hour rake', () => {
    expect(shadowForTime('dawn').lengthMul).toBeGreaterThan(1.4);
    expect(shadowForTime('dusk').lengthMul).toBeGreaterThan(1.4);
  });
  it('is pure / deterministic', () => {
    expect(shadowForTime('day')).toEqual(shadowForTime('day'));
  });
});
