// SUPERSEDED by M15 audit-v12 (Lievsay v12). The M11 numbers
// (ratio=4, threshold=0.010, LRA=7) were measured to crush dynamics
// at I=-15.2 LUFS / LRA=4.7 in the v12 panel. M15 reverts to gentler
// ratio=2.5, longer release, threshold=0.015, LRA=11. New invariants
// live in `m15-lievsay-mixer.test.ts`.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildMixCommand, DUCK_THRESHOLD } from '../../src/audio/audio-mixer';

const SRC = readFileSync(
  join(__dirname, '../../src/audio/audio-mixer.ts'),
  'utf8',
);

describe('M15 mix discipline (audit-v12 Lievsay revert)', () => {
  it('sidechaincompress ratio is 2.5 (audit-v12: ratio=4 over-crushed)', () => {
    expect(SRC).toMatch(/sidechaincompress=threshold=\$\{duckThreshold\}:ratio=2\.5:/);
  });

  it('default DUCK_THRESHOLD is 0.015 (audit-v12: 0.010 triggered too eagerly)', () => {
    expect(DUCK_THRESHOLD).toBe(0.015);
  });

  it('loudnorm LRA is 11 (audit-v12: LRA=7 measured 4.7 LU — flat)', () => {
    expect(SRC).toMatch(/loudnorm=I=-14:LRA=11:TP=-1\.5/);
    expect(SRC).not.toMatch(/loudnorm=I=-14:LRA=7/);
  });

  it('buildMixCommand emits ratio=2.5 in the rendered filter graph', () => {
    const cmd = buildMixCommand('/tmp/out.wav', [
      { type: 'dialogue', filePath: '/tmp/d.wav', startMs: 0, volumeDb: 0 },
      { type: 'music', filePath: '/tmp/m.wav', startMs: 0, volumeDb: -6, duckDuringDialogue: true },
    ] as any);
    const filterIdx = cmd.indexOf('-filter_complex');
    expect(filterIdx).toBeGreaterThan(-1);
    expect(cmd[filterIdx + 1]).toMatch(/sidechaincompress=threshold=[\d.]+:ratio=2\.5:/);
  });
});

