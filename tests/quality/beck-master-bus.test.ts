import { describe, it, expect } from 'vitest';
import { buildMixCommand } from '../../src/audio/audio-mixer';
import type { AudioLayer } from '../../src/types';

// Beck gap M1.2 — SFX stacking on top of dialogue can briefly clip
// > 0 dBFS before EBU loudnorm catches up (loudnorm is a slow
// gain-stage, not a sample-domain limiter). A true brick-wall limiter
// must sit *after* loudnorm to clamp transient peaks at -0.5 dBFS.
//
// Contract: every master filter graph ends with
//   ...,loudnorm=...,alimiter=...[out]
// in that order.

function layers(): AudioLayer[] {
  return [
    { type: 'dialogue', filePath: '/x/d.wav', startMs: 0, volumeDb: -5 },
    { type: 'sfx', filePath: '/x/s.wav', startMs: 100, volumeDb: -10, duckDuringDialogue: true },
    { type: 'music', filePath: '/x/m.wav', startMs: 0, volumeDb: -16, duckDuringDialogue: true },
    { type: 'ambience', filePath: '/x/a.wav', startMs: 0, volumeDb: -22 },
  ];
}

function getGraph(cmd: string[]): string {
  const i = cmd.indexOf('-filter_complex');
  expect(i).toBeGreaterThan(-1);
  return cmd[i + 1];
}

describe('Beck master-bus brick-wall limiter (M1.2)', () => {
  it('graph contains an alimiter stage', () => {
    const graph = getGraph(buildMixCommand('/x/out.wav', layers()));
    expect(graph).toMatch(/alimiter=/);
  });

  it('alimiter sits AFTER loudnorm (post-EBU peak clamp)', () => {
    const graph = getGraph(buildMixCommand('/x/out.wav', layers()));
    const loud = graph.indexOf('loudnorm=');
    const limit = graph.indexOf('alimiter=');
    expect(loud).toBeGreaterThan(-1);
    expect(limit).toBeGreaterThan(loud);
  });

  it('alimiter clamps to <= 0.95 (≈ -0.45 dBFS) — true brick wall, not loudnorm TP', () => {
    const graph = getGraph(buildMixCommand('/x/out.wav', layers()));
    const m = graph.match(/alimiter=[^,\]]*limit=([\d.]+)/);
    expect(m, `alimiter limit= not found in ${graph}`).not.toBeNull();
    expect(parseFloat(m![1])).toBeLessThanOrEqual(0.95);
  });

  it('graph terminates at [out] — limiter is the last stage before output', () => {
    const graph = getGraph(buildMixCommand('/x/out.wav', layers()));
    // The final pipeline must end ...alimiter=...[out]
    expect(graph).toMatch(/alimiter=[^[\];]*\[out\]\s*$/);
  });

  it('single-input (no amix) path also gets the limiter', () => {
    // One dialogue layer only — exercises the single-input branch.
    const cmd = buildMixCommand('/x/out.wav', [
      { type: 'dialogue', filePath: '/x/d.wav', startMs: 0, volumeDb: -5 },
    ]);
    const graph = getGraph(cmd);
    expect(graph).toMatch(/loudnorm=/);
    expect(graph).toMatch(/alimiter=/);
    expect(graph.indexOf('alimiter=')).toBeGreaterThan(graph.indexOf('loudnorm='));
  });
});
