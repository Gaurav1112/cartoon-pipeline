// tests/quality/m15-baker-scar.test.ts
//
// M15 (Baker v12 fix): Kaaliya scar must pass WCAG contrast on a
// phone screen at postage-stamp size. v11/v12 measured the original
// #3A0A0A scar on dark skin at 1.2:1 contrast — invisible. Bump to
// bright red + thicker stroke + drop-shadow so the villain's
// signature mark reads from any angle.
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const charSrc = fs.readFileSync(
  path.join(__dirname, '../../src/characters/CharacterRenderer.tsx'),
  'utf-8',
);

describe('M15: Kaaliya scar contrast (Baker v12 fix)', () => {
  it('scar uses bright red (not low-contrast dark red)', () => {
    expect(charSrc).toContain('stroke="#FF3333"');
    expect(charSrc).not.toContain('stroke="#3A0A0A"');
  });

  it('scar stroke width is ≥ 3 px (broadcast-readable)', () => {
    const m = charSrc.match(/stroke="#FF3333"[^]*?strokeWidth=\{([\d.]+)\}/);
    expect(m, 'scar strokeWidth must be set').toBeTruthy();
    expect(parseFloat(m![1])).toBeGreaterThanOrEqual(3);
  });

  it('scar has a drop-shadow for shadow-pose readability', () => {
    expect(charSrc).toMatch(/stroke="#FF3333"[^]*?drop-shadow/);
  });
});
