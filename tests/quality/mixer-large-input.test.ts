import { describe, it, expect } from 'vitest';
import { buildMixCommand } from '../../src/audio/audio-mixer';
import type { AudioLayer } from '../../src/types';

// Murch / Catmull P0 — the master mix must:
//   1. produce a balanced filter graph for arbitrary input counts
//   2. NEVER encode through libmp3lame, whose ffmpeg-8.1 psymodel asserts
//      on extreme filter chains (already burned us on voice transform).
// Master output is now WAV (pcm_s16le) — the visual+audio mux re-encodes
// once to AAC, which is rock-solid in ffmpeg 8.1.

describe('buildMixCommand — robust mix for any input count', () => {
  function makeLayers(n: number): AudioLayer[] {
    return Array.from({ length: n }, (_, i) => ({
      type: i < n / 2 ? ('dialogue' as const) : ('sfx' as const),
      filePath: `/tmp/in_${i}.wav`,
      startMs: i * 100,
      volumeDb: -6,
      duckDuringDialogue: i >= n / 2,
    }));
  }

  it('handles 73 layers with balanced bracket labels', () => {
    const cmd = buildMixCommand('/tmp/out.wav', makeLayers(73));
    const fcIdx = cmd.indexOf('-filter_complex');
    expect(fcIdx).toBeGreaterThan(-1);
    const graph = cmd[fcIdx + 1];
    const opens = (graph.match(/\[/g) ?? []).length;
    const closes = (graph.match(/\]/g) ?? []).length;
    expect(opens).toBe(closes);
  });

  it('uses pcm_s16le codec (no libmp3lame, no psymodel assertion possible)', () => {
    const cmd = buildMixCommand('/tmp/out.wav', makeLayers(10));
    const codecIdx = cmd.indexOf('-c:a');
    expect(codecIdx).toBeGreaterThan(-1);
    expect(cmd[codecIdx + 1]).toBe('pcm_s16le');
    expect(cmd).not.toContain('libmp3lame');
  });

  it('output ends with -map [out]', () => {
    const cmd = buildMixCommand('/tmp/out.wav', makeLayers(10));
    const mapIdx = cmd.indexOf('-map');
    expect(mapIdx).toBeGreaterThan(-1);
    expect(cmd[mapIdx + 1]).toBe('[out]');
  });

  it('regression: small input counts still work', () => {
    const cmd = buildMixCommand('/tmp/out.wav', makeLayers(3));
    expect(cmd.indexOf('-filter_complex')).toBeGreaterThan(-1);
  });
});

