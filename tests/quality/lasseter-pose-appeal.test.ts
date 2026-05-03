import { describe, it, expect } from 'vitest';
import { poseModifierByEmotion } from '../../src/characters/animation-life';
import type { EmotionType } from '../../src/types';

// John Lasseter gap M2.3 — same idle pose regardless of emotion violates
// the Pixar 12 principles ("appeal", "exaggeration", "solid drawing").
// Lasseter scored the work 5/10. The fix is a pure lookup that returns
// per-emotion silhouette modifiers (head tilt, hip shift, arm raise) so
// each emotion produces a *distinct silhouette* a viewer can read at a
// glance.

const ALL_EMOTIONS: EmotionType[] = [
  'neutral', 'happy', 'sad', 'angry', 'scared',
  'surprised', 'thinking', 'determined',
];

describe('M2.3 poseModifierByEmotion — Lasseter pose appeal', () => {
  it('all 8 emotions return distinct (tiltDeg, hipShiftPx, armRaisePx) triples', () => {
    const seen = new Set<string>();
    for (const e of ALL_EMOTIONS) {
      const m = poseModifierByEmotion(e);
      const key = `${m.tiltDeg}|${m.hipShiftPx}|${m.armRaisePx}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
    expect(seen.size).toBe(ALL_EMOTIONS.length);
  });

  it('all values are within reasonable bounds: |tilt|≤15, |hipShift|≤5, |armRaise|≤12', () => {
    for (const e of ALL_EMOTIONS) {
      const m = poseModifierByEmotion(e);
      expect(Math.abs(m.tiltDeg)).toBeLessThanOrEqual(15);
      expect(Math.abs(m.hipShiftPx)).toBeLessThanOrEqual(5);
      expect(Math.abs(m.armRaisePx)).toBeLessThanOrEqual(12);
    }
  });

  it('pure: same emotion → same triple (deterministic)', () => {
    for (const e of ALL_EMOTIONS) {
      const a = poseModifierByEmotion(e);
      const b = poseModifierByEmotion(e);
      expect(a).toEqual(b);
    }
  });

  it('neutral is the zero-pose anchor', () => {
    expect(poseModifierByEmotion('neutral')).toEqual({
      tiltDeg: 0, hipShiftPx: 0, armRaisePx: 0,
    });
  });

  it('thinking is head-cocked (large positive tilt)', () => {
    expect(poseModifierByEmotion('thinking').tiltDeg).toBeGreaterThanOrEqual(5);
  });

  it('scared raises arms defensively (positive armRaise)', () => {
    expect(poseModifierByEmotion('scared').armRaisePx).toBeGreaterThan(0);
  });

  it('sad is slumped (positive tilt, lowered arms)', () => {
    const m = poseModifierByEmotion('sad');
    expect(m.tiltDeg).toBeGreaterThan(0);
    expect(m.armRaisePx).toBeLessThan(0);
  });

  it('angry leans forward (negative tilt)', () => {
    expect(poseModifierByEmotion('angry').tiltDeg).toBeLessThan(0);
  });

  it('returns finite numbers for every EmotionType', () => {
    for (const e of ALL_EMOTIONS) {
      const m = poseModifierByEmotion(e);
      expect(Number.isFinite(m.tiltDeg)).toBe(true);
      expect(Number.isFinite(m.hipShiftPx)).toBe(true);
      expect(Number.isFinite(m.armRaisePx)).toBe(true);
    }
  });
});
