// M11 audit-v10 (Glen Keane / Mark Baker): "Mirrored limb pairs are the
// #1 robot tell. Real anatomy is asymmetric. Break it." Pin every named
// pose to non-mirrored arm angles so characters stop reading as paper
// cutouts. 2-degree min asymmetry is enough to kill the tell.
import { describe, it, expect } from 'vitest';
import { POSES } from '../../src/characters/poses';

const ASYMMETRIC_POSES = [
  'idle_stand',
  'walk_cycle',
  'surprised',
  'angry',
  'laugh',
  'celebrate',
] as const;

describe('M11 asymmetric poses (audit-v10 Keane/Baker)', () => {
  for (const poseName of ASYMMETRIC_POSES) {
    it(`${poseName}: arm angles are NOT mirrored`, () => {
      const p = POSES[poseName];
      const lAbs = Math.abs(p.leftArm.angle);
      const rAbs = Math.abs(p.rightArm.angle);
      expect(Math.abs(lAbs - rAbs)).toBeGreaterThanOrEqual(2);
    });
  }

  it('walk_cycle: leg angles are NOT mirrored', () => {
    const p = POSES.walk_cycle;
    const asym = Math.abs(Math.abs(p.leftLeg.angle) - Math.abs(p.rightLeg.angle));
    expect(asym).toBeGreaterThanOrEqual(2);
  });
});
