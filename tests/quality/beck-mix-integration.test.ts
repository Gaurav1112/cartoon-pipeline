import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { buildMixCommand } from '../../src/audio/audio-mixer';

// Beck (Jeff Beck — Pixar audio supervisor / general "real-mix" anchor):
// the unit tests cover graph construction; this proves the *real* ffmpeg
// can survive a dense mix without the libmp3lame psymodel crash that
// blocked rendering in v1.
//
// Gated on RUN_INTEGRATION=1 because it spawns real ffmpeg N+1 times.
// CI runs it on the render-eligible workflow; local dev opts in.

const RUN = process.env.RUN_INTEGRATION === '1';
const ffmpeg = '/opt/homebrew/bin/ffmpeg';
const haveFfmpeg = existsSync(ffmpeg) || existsSync('/usr/bin/ffmpeg') || existsSync('/usr/local/bin/ffmpeg');
const ffmpegBin = existsSync(ffmpeg) ? ffmpeg : 'ffmpeg';

describe.skipIf(!RUN || !haveFfmpeg)('Beck: real-ffmpeg dense mix integration', () => {
  it('mixes 73 layers without libmp3lame psymodel crash', () => {
    const N = 73;
    const dir = tmpdir();
    const inputs: string[] = [];
    for (let i = 0; i < N; i++) {
      const p = join(dir, `beck_in_${i}.wav`);
      const r = spawnSync(
        ffmpegBin,
        ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', '1', '-c:a', 'pcm_s16le', p],
        { stdio: 'ignore' }
      );
      expect(r.status).toBe(0);
      inputs.push(p);
    }

    const layers = inputs.map((p, i) => ({
      type: (i < N / 2 ? 'dialogue' : 'sfx') as 'dialogue' | 'sfx',
      filePath: p,
      startMs: i * 50,
      volumeDb: -6,
      duckDuringDialogue: i >= N / 2,
    }));

    const out = join(dir, 'beck_out.wav');
    const args = buildMixCommand(out, layers);
    const r = spawnSync(ffmpegBin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    if (r.status !== 0) {
      // Surface the stderr tail for debugging in CI logs.
      console.error('beck mix stderr tail:\n' + r.stderr.toString().split('\n').slice(-15).join('\n'));
    }
    expect(r.status).toBe(0);
    expect(existsSync(out)).toBe(true);
  }, 180_000);
});
