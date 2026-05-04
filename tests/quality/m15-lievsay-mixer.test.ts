// tests/quality/m15-lievsay-mixer.test.ts
//
// M15: Apply Lievsay's audio-v11/v12 fix to the master mixer so the
// rendered LRA reaches the 10-11 LU target (currently 4.7 LU). The
// mixer was over-compressing because:
//   1. sidechain ratio=4 was pumping ~6-8dB on every dialogue attack
//      ("compressor breathing between words", per Lievsay)
//   2. duck threshold=0.010 was triggering on every transient
//   3. master loudnorm LRA=7 crushed the residual dynamic range
// All three feed each other; fixing them together restores breathing
// room without making the mix inaudible on a phone speaker.
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const mixerSrc = fs.readFileSync(
  path.join(__dirname, '../../src/audio/audio-mixer.ts'),
  'utf-8',
);

describe('M15: Lievsay mixer params (kid-broadcast LRA, invisible ducking)', () => {
  it('sidechain compressor ratio is 2.5 (was 4 — too pumpy)', () => {
    expect(mixerSrc).toMatch(/sidechaincompress=threshold=\$\{duckThreshold\}:ratio=2\.5/);
    expect(mixerSrc).not.toMatch(/sidechaincompress=threshold=\$\{duckThreshold\}:ratio=4\b/);
  });

  it('sidechain release is ≥400ms (slower → invisible to ear)', () => {
    const m = mixerSrc.match(/sidechaincompress[^[]+release=(\d+)/);
    expect(m, 'release param must exist on sidechaincompress').toBeTruthy();
    const release = parseInt(m![1], 10);
    expect(release).toBeGreaterThanOrEqual(400);
  });

  it('default DUCK_THRESHOLD is 0.015 (was 0.010 — was reacting on transients)', () => {
    expect(mixerSrc).toMatch(/export const DUCK_THRESHOLD = 0\.015/);
  });

  it('master loudnorm LRA is 11 (was 7 — was crushing dynamic range)', () => {
    expect(mixerSrc).toContain('loudnorm=I=-14:LRA=11:TP=-1.5');
    expect(mixerSrc).not.toContain('loudnorm=I=-14:LRA=7:TP=-1.5');
  });
});
