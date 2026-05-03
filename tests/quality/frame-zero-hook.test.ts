/**
 * MrBeast/Brad Bird retention principle: frame 0 of every Composition must
 * already show the protagonist + supporting motion. A 0-opacity / scale=0
 * intro burns retention before the viewer can lock in.
 *
 * These tests pin two contracts:
 *   1. The first character of any scene must NOT be ramped in via spring
 *      from scale=0 — the entrance scale on frame 0 must be ≥ 0.85.
 *   2. The opening hook scene of Episode 1 must contain at least one
 *      character at index 0 (so frame 0 has a face on it).
 */

import { describe, it, expect } from 'vitest';
import { spring } from 'remotion';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { firstCharEntranceScale } from '../../src/compositions/episode1/entrance';

describe('frame-0 hook contract', () => {
  it('the opening scene has at least one character at index 0', () => {
    const opening = LION_RABBIT_SCENES[0];
    expect(opening.chars.length).toBeGreaterThan(0);
    expect(opening.chars[0].id).toBeTruthy();
  });

  it('first-character entrance scale is ≥ 0.85 at frame 0 (visible immediately)', () => {
    const s = firstCharEntranceScale({ frame: 0, fps: 30, charIndex: 0 });
    expect(s).toBeGreaterThanOrEqual(0.85);
  });

  it('subsequent characters still stagger in (i=1 visibly less than i=0 at frame 0)', () => {
    const s0 = firstCharEntranceScale({ frame: 0, fps: 30, charIndex: 0 });
    const s1 = firstCharEntranceScale({ frame: 0, fps: 30, charIndex: 1 });
    expect(s0).toBeGreaterThan(s1);
  });

  it('first character converges to a stable ~1.0 scale by frame 30', () => {
    const s = firstCharEntranceScale({ frame: 30, fps: 30, charIndex: 0 });
    expect(s).toBeGreaterThan(0.97);
    expect(s).toBeLessThan(1.05);
  });
});

describe('reference: vanilla Remotion spring is what we are improving over', () => {
  // Sanity: confirm the OLD behaviour was actually the broken case we claim
  it('vanilla spring at frame 0 is far below 0.85 (justifying the fix)', () => {
    const s = spring({ frame: 0, fps: 30, config: { damping: 14, stiffness: 120, mass: 0.45 } });
    expect(s).toBeLessThan(0.5);
  });
});
