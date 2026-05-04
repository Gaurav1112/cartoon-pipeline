// M11 audit-v10 (Lievsay/Zimmer): tighten mix dynamics so dialogue
// pops above music. Sidechain ratio=2 was crushing nothing; LRA=11
// flattens punchlines. Bump ratio to 4, threshold to 0.010, LRA to 7.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildMixCommand, DUCK_THRESHOLD } from '../../src/audio/audio-mixer';

const SRC = readFileSync(
  join(__dirname, '../../src/audio/audio-mixer.ts'),
  'utf8',
);

describe('M11 mix discipline (audit-v10 Lievsay/Zimmer)', () => {
  it('sidechaincompress ratio is 4 (was 2 — too gentle)', () => {
    expect(SRC).toMatch(/sidechaincompress=threshold=\$\{duckThreshold\}:ratio=4:/);
  });

  it('default DUCK_THRESHOLD is 0.010 (was 0.015 — late trigger)', () => {
    expect(DUCK_THRESHOLD).toBe(0.010);
  });

  it('loudnorm LRA is 7 (was 11 — flattens dynamics, kills comedy)', () => {
    expect(SRC).toMatch(/loudnorm=I=-14:LRA=7:TP=-1\.5/);
    expect(SRC).not.toMatch(/loudnorm=I=-14:LRA=11/);
  });

  it('buildMixCommand emits ratio=4 in the rendered filter graph', () => {
    const cmd = buildMixCommand('/tmp/out.wav', [
      { type: 'dialogue', filePath: '/tmp/d.wav', startMs: 0, volumeDb: 0 },
      { type: 'music', filePath: '/tmp/m.wav', startMs: 0, volumeDb: -6, duckDuringDialogue: true },
    ] as any);
    const filterIdx = cmd.indexOf('-filter_complex');
    expect(filterIdx).toBeGreaterThan(-1);
    expect(cmd[filterIdx + 1]).toMatch(/sidechaincompress=threshold=[\d.]+:ratio=4:/);
  });
});
