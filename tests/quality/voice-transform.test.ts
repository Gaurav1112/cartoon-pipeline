import { describe, it, expect } from 'vitest';
import { buildTransformFfmpegArgs } from '../../src/audio/cartoon-audio';

// TDD pin (Murch / Catmull): Voice transformation must use a lossless PCM
// intermediate. ffmpeg 8.1's libmp3lame psymodel asserts on extreme filter
// chains (asetrate + atempo + EQ + compressor + vibrato). PCM/WAV bypasses
// the encoder entirely; the master mix re-encodes once at the end.
describe('voice transform — lossless intermediate (no psymodel crash)', () => {
  it('writes to a .wav path, not .mp3', () => {
    const args = buildTransformFfmpegArgs(
      'asetrate=62367,aresample=44100,atempo=0.8132',
      '/tmp/in.mp3',
      '/tmp/out.wav',
    );
    const outIdx = args.lastIndexOf('/tmp/out.wav');
    expect(outIdx).toBeGreaterThan(-1);
  });

  it('uses pcm_s16le codec (no mp3 encoder in path)', () => {
    const args = buildTransformFfmpegArgs(
      'asetrate=62367,aresample=44100,atempo=0.8132',
      '/tmp/in.mp3',
      '/tmp/out.wav',
    );
    const codecIdx = args.indexOf('-c:a');
    expect(codecIdx).toBeGreaterThan(-1);
    expect(args[codecIdx + 1]).toBe('pcm_s16le');
    expect(args).not.toContain('libmp3lame');
  });

  it('still applies the supplied filter chain', () => {
    const args = buildTransformFfmpegArgs('volume=0.8', '/tmp/in.mp3', '/tmp/out.wav');
    const afIdx = args.indexOf('-af');
    expect(afIdx).toBeGreaterThan(-1);
    expect(args[afIdx + 1]).toBe('volume=0.8');
  });
});
