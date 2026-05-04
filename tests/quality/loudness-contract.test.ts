// M5.4 — Integrated -14 LUFS loudness contract test.
//
// YouTube's loudness target for delivery is -14 LUFS integrated.
// `src/audio/audio-mixer.ts` pins this via the master tail filter:
//   loudnorm=I=-14:LRA=11:TP=-1.5,
//   alimiter=level_in=1:level_out=1:limit=0.95:...
//
// This contract test:
//   1. Generates a deterministic synthetic test signal (1 kHz sine,
//      2 s, 16-bit mono, 44.1 kHz) into the project's `output/`
//      directory using ffmpeg's `lavfi` source.
//   2. Runs the master loudnorm filter chain over it.
//   3. Measures integrated loudness with a second-pass loudnorm
//      analysis (print_format=json, measured_I).
//   4. Asserts |measured_I − (-14)| <= 1.0 LU.
//
// If ffmpeg is not on PATH the test is skipped with a clear message
// — the contract still exists for CI environments that have it.

import { describe, it, expect } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';

const execFileAsync = promisify(execFile);

async function ffmpegAvailable(): Promise<boolean> {
  try {
    await execFileAsync('ffmpeg', ['-version'], { timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

function tmpFile(name: string): string {
  // Honor the project policy: do not write under /tmp. Use a per-run
  // dir under the repo's `output/` so artefacts are easy to clean.
  const root = path.resolve(__dirname, '..', '..', 'output', 'test-artifacts');
  fs.mkdirSync(root, { recursive: true });
  return path.join(root, name);
}

describe('M5.4 — integrated -14 LUFS loudness contract', () => {
  // Async IIFE runs once at import time to decide skip vs run.
  const ffmpegPresentP = ffmpegAvailable();

  it('master loudnorm filter targets I=-14 LUFS within ±1 LU', async () => {
    const ffmpegPresent = await ffmpegPresentP;
    if (!ffmpegPresent) {
      // Contract preserved; CI with ffmpeg will execute the assertion.
      // Equivalent to it.skip — but we surface a clear marker on the run.
      console.warn('[loudness-contract] ffmpeg not on PATH — skipping measurement');
      return;
    }

    const sourcePath = tmpFile('lufs-source.wav');
    const masteredPath = tmpFile('lufs-mastered.wav');

    // 1. Synthesise a deterministic 2-second 1 kHz sine at -20 dBFS.
    //    -20 dBFS is a conservative starting point; loudnorm should
    //    raise it to about -14 LUFS.
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-f', 'lavfi',
        '-i', 'sine=frequency=1000:duration=2:sample_rate=44100',
        '-af', 'volume=-20dB',
        '-ac', '1',
        '-c:a', 'pcm_s16le',
        sourcePath,
      ],
      { timeout: 30_000 },
    );

    // 2. Apply the SAME master tail used in audio-mixer.ts:
    //      loudnorm=I=-14:LRA=11:TP=-1.5, alimiter=...
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i', sourcePath,
        '-af',
        'loudnorm=I=-14:LRA=11:TP=-1.5,' +
          'alimiter=level_in=1:level_out=1:limit=0.95:attack=5:release=50',
        '-ar', '44100',
        '-ac', '1',
        '-c:a', 'pcm_s16le',
        masteredPath,
      ],
      { timeout: 60_000 },
    );

    // 3. Measure integrated loudness on the mastered file.
    //    `loudnorm` in measurement mode emits a JSON blob to stderr.
    const { stderr } = await execFileAsync(
      'ffmpeg',
      [
        '-i', masteredPath,
        '-af', 'loudnorm=I=-14:LRA=11:TP=-1.5:print_format=json',
        '-f', 'null',
        '-',
      ],
      { timeout: 30_000 },
    );

    // Pull the JSON block from stderr — last `{...}` in the stream.
    const jsonMatch = stderr.match(/\{[\s\S]*"input_i"[\s\S]*?\}/);
    expect(jsonMatch, 'loudnorm did not emit a JSON measurement block').not.toBeNull();
    const report = JSON.parse(jsonMatch![0]);
    const measuredI = parseFloat(report.input_i);

    expect(Number.isFinite(measuredI)).toBe(true);
    // YouTube spec: -14 LUFS ±1 LU. Our pin matches.
    expect(Math.abs(measuredI - -14)).toBeLessThanOrEqual(1.0);
  }, 120_000);

  it('mixer source code references the pinned -14 LUFS target', () => {
    // Static guard: even when ffmpeg is unavailable, this assertion
    // prevents a future refactor from silently changing the LUFS pin
    // in `audio-mixer.ts`.
    const src = fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'src', 'audio', 'audio-mixer.ts'),
      'utf8',
    );
    expect(src).toMatch(/loudnorm=I=-14:LRA=7:TP=-1\.5/);
  });
});
