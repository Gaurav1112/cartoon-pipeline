import { describe, it, expect } from 'vitest';
import {
  landingSquash,
  tailDamping,
  eyeDart,
  anticipationCrouch,
} from '../../src/characters/animation-life';

// Keane + Lasseter contracts pinned.

describe('animation-life pure functions (Keane + Lasseter)', () => {
  describe('landingSquash', () => {
    it('returns neutral 1.0 when not near a strike', () => {
      const r = landingSquash(0.25);
      expect(r.squashY).toBeCloseTo(1.0, 4);
      expect(r.stretchX).toBeCloseTo(1.0, 4);
    });
    it('squashes Y and stretches X at foot strike (phase=0)', () => {
      const r = landingSquash(0);
      expect(r.squashY).toBeLessThan(1.0);
      expect(r.stretchX).toBeGreaterThan(1.0);
    });
    it('also strikes at phase=0.5 (other foot)', () => {
      const r = landingSquash(0.5);
      expect(r.squashY).toBeLessThan(1.0);
    });
    it('is deterministic', () => {
      expect(landingSquash(0.1)).toEqual(landingSquash(0.1));
    });
    it('squash never exceeds 8% (no rubber characters)', () => {
      for (let p = 0; p < 1; p += 0.01) {
        const r = landingSquash(p);
        expect(r.squashY).toBeGreaterThanOrEqual(0.92);
        expect(r.stretchX).toBeLessThanOrEqual(1.05);
      }
    });
  });

  describe('tailDamping', () => {
    it('starts at full amplitude × sin(0) = 0 at framesSincePose=0', () => {
      expect(tailDamping(0, 0.3, 10, 30)).toBeCloseTo(0, 6);
    });
    it('decays exponentially: amplitude at half-life is half of initial peak', () => {
      // Find peak in first quarter cycle, then check at half-life.
      const peakFrame = Math.round((Math.PI / 2) / 0.3); // freq 0.3 → peak at ~5.2 fr
      const initial = Math.abs(tailDamping(peakFrame, 0.3, 10, 30));
      const halfLife = Math.abs(tailDamping(peakFrame + 30, 0.3, 10, 30));
      // After one half-life of decay the new peak (at peakFrame+30) should be
      // ≈ half of the initial peak. Allow 30% tolerance for sinusoidal phase.
      expect(halfLife).toBeLessThan(initial);
      expect(halfLife / initial).toBeLessThan(0.7);
    });
    it('handles negative framesSincePose by clamping to 0', () => {
      expect(tailDamping(-5, 0.3, 10, 30)).toBe(0);
    });
  });

  describe('eyeDart', () => {
    it('is (0,0) most of the time', () => {
      let zeroes = 0;
      for (let f = 0; f < 200; f++) {
        const r = eyeDart(f, 65);
        if (r.dx === 0 && r.dy === 0) zeroes++;
      }
      expect(zeroes).toBeGreaterThan(150); // dart is rare
    });
    it('produces a non-zero dart at least once per cycle', () => {
      let any = false;
      for (let f = 0; f < 200; f++) {
        const r = eyeDart(f, 65);
        if (r.dx !== 0 || r.dy !== 0) {
          any = true;
          break;
        }
      }
      expect(any).toBe(true);
    });
    it('is deterministic per seed', () => {
      expect(eyeDart(95, 65)).toEqual(eyeDart(95, 65));
    });
    it('dart magnitude bounded ≤ 2.5 px (subtle)', () => {
      for (let f = 0; f < 300; f++) {
        const r = eyeDart(f, 65);
        const mag = Math.hypot(r.dx, r.dy);
        expect(mag).toBeLessThanOrEqual(2.5);
      }
    });
  });

  describe('anticipationCrouch', () => {
    it('returns 1.0 when no action pending', () => {
      expect(anticipationCrouch(-1)).toBe(1.0);
      expect(anticipationCrouch(100)).toBe(1.0);
    });
    it('compresses (returns < 1) within the 8-frame window', () => {
      expect(anticipationCrouch(2)).toBeLessThan(1.0);
    });
    it('peak crouch is at t=2 (deepest before action)', () => {
      const v0 = anticipationCrouch(0);
      const v2 = anticipationCrouch(2);
      const v6 = anticipationCrouch(6);
      expect(v2).toBeLessThanOrEqual(v0);
      expect(v2).toBeLessThanOrEqual(v6);
    });
    it('crouch never exceeds 8%', () => {
      for (let f = 0; f <= 8; f++) {
        expect(anticipationCrouch(f)).toBeGreaterThanOrEqual(0.92);
      }
    });
  });
});
