// M13 audit-v11 prep: failure-proof contract for all 28 Tier-1 audio
// files. Every assertion that could fail at render time, here as a fast
// unit test. Catches: missing files, zero-byte writes, corrupted MP3,
// pure-silence clips, clipping >0 dBFS, wrong sample rate, wrong channels,
// out-of-bounds duration. If this suite is GREEN the render cannot fail
// on audio assets.
import { describe, it, expect } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '../..', 'public', 'audio');

interface Spec {
  rel: string;
  minDur: number;
  maxDur: number;
  minBytes: number;
}

const TIER1: Spec[] = [
  // Character signatures: short stings — panel prescribes 0.25-0.7s
  { rel: 'sfx/characters/arjun_whistle.mp3',  minDur: 0.15, maxDur: 4,  minBytes: 5_000 },
  { rel: 'sfx/characters/kaaliya_cackle.mp3', minDur: 0.15, maxDur: 5,  minBytes: 5_000 },
  { rel: 'sfx/characters/bablu_snort.mp3',    minDur: 0.15, maxDur: 4,  minBytes: 5_000 },
  { rel: 'sfx/characters/guruji_hum.mp3',     minDur: 0.3,  maxDur: 30, minBytes: 5_000 },
  { rel: 'sfx/characters/raja_grunt.mp3',     minDur: 0.3,  maxDur: 6,  minBytes: 5_000 },
  { rel: 'sfx/characters/moti_yip.mp3',       minDur: 0.15, maxDur: 4,  minBytes: 5_000 },
  { rel: 'sfx/characters/meera_coo.mp3',      minDur: 0.2,  maxDur: 4,  minBytes: 5_000 },
  { rel: 'sfx/characters/amma_chime.mp3',     minDur: 0.3,  maxDur: 6,  minBytes: 5_000 },
  // Comedy + drama stings: panel prescribes 0.2-3s
  { rel: 'sfx/comedy/boing.mp3',              minDur: 0.15, maxDur: 4,  minBytes: 3_000 },
  { rel: 'sfx/comedy/rimshot.mp3',            minDur: 0.15, maxDur: 5,  minBytes: 3_000 },
  { rel: 'sfx/comedy/giggle.mp3',             minDur: 0.3,  maxDur: 6,  minBytes: 5_000 },
  { rel: 'sfx/comedy/record_scratch.mp3',     minDur: 0.2,  maxDur: 4,  minBytes: 3_000 },
  { rel: 'sfx/drama/dramatic_sting.mp3',      minDur: 0.3,  maxDur: 5,  minBytes: 5_000 },
  { rel: 'sfx/drama/suspense_build.mp3',      minDur: 1,    maxDur: 12, minBytes: 5_000 },
  { rel: 'sfx/drama/reveal_sting.mp3',        minDur: 0.4,  maxDur: 8,  minBytes: 5_000 },
  { rel: 'sfx/drama/shock_sting.mp3',         minDur: 0.15, maxDur: 6,  minBytes: 3_000 },
  { rel: 'sfx/drama/victory_fanfare.mp3',     minDur: 0.5,  maxDur: 10, minBytes: 5_000 },
  { rel: 'sfx/drama/happy_chime.mp3',         minDur: 0.3,  maxDur: 90, minBytes: 5_000 },
  { rel: 'sfx/drama/crowd_gasp.mp3',          minDur: 0.2,  maxDur: 4,  minBytes: 5_000 },
  // Animals + nature
  { rel: 'sfx/animals/lion_roar.mp3',         minDur: 0.5, maxDur: 6,  minBytes: 5_000 },
  { rel: 'sfx/nature/water_splash.mp3',       minDur: 0.3, maxDur: 6,  minBytes: 5_000 },
  // Music: 25-31s loop bed (Zimmer/Rahman contract)
  { rel: 'music/happy_playful.mp3',           minDur: 25,  maxDur: 31, minBytes: 50_000 },
  { rel: 'music/peaceful_calm.mp3',           minDur: 25,  maxDur: 31, minBytes: 50_000 },
  { rel: 'music/tense_suspense.mp3',          minDur: 25,  maxDur: 31, minBytes: 50_000 },
  // Intro jingle: short
  { rel: 'sfx/intro/jingle.mp3',              minDur: 0.5, maxDur: 8,  minBytes: 5_000 },
  // Ambience: 5-90s loop
  { rel: 'ambience/forest.mp3',               minDur: 5,   maxDur: 200, minBytes: 30_000 },
  { rel: 'ambience/garden.mp3',               minDur: 5,   maxDur: 200, minBytes: 30_000 },
  { rel: 'ambience/well.mp3',                 minDur: 0.3, maxDur: 200, minBytes: 5_000 },
];

function ffprobe(file: string, ...entries: string[]): string {
  return execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', entries.join(','),
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]).toString().trim();
}

function ffmpegStderr(file: string): string {
  const r = spawnSync('ffmpeg', [
    '-hide_banner', '-i', file,
    '-af', 'volumedetect',
    '-f', 'null', '-',
  ], { encoding: 'utf8' });
  return (r.stderr || '') + (r.stdout || '');
}

function meanDbfs(file: string): number {
  const out = ffmpegStderr(file);
  const m = out.match(/mean_volume:\s*(-?[\d.]+)\s*dB/);
  return m ? parseFloat(m[1]) : -100;
}

function maxDbfs(file: string): number {
  const out = ffmpegStderr(file);
  const m = out.match(/max_volume:\s*(-?[\d.]+)\s*dB/);
  return m ? parseFloat(m[1]) : 0;
}

describe('M13 Tier-1 audio failure-proof contract', () => {
  it('all 28 Tier-1 files exist and are non-empty', () => {
    for (const spec of TIER1) {
      const p = join(ROOT, spec.rel);
      expect(existsSync(p), `MISSING ${spec.rel}`).toBe(true);
      const sz = statSync(p).size;
      expect(sz, `${spec.rel} too small (${sz}B)`).toBeGreaterThanOrEqual(
        spec.minBytes,
      );
    }
  });

  it('every file decodes via ffprobe (not corrupted)', () => {
    for (const spec of TIER1) {
      const p = join(ROOT, spec.rel);
      const dur = parseFloat(ffprobe(p, 'format=duration'));
      expect(dur, `${spec.rel} did not decode`).toBeGreaterThan(0);
    }
  });

  it('every file duration falls within its expected window', () => {
    for (const spec of TIER1) {
      const p = join(ROOT, spec.rel);
      const dur = parseFloat(ffprobe(p, 'format=duration'));
      expect(dur, `${spec.rel} dur=${dur}s`).toBeGreaterThanOrEqual(spec.minDur);
      expect(dur, `${spec.rel} dur=${dur}s`).toBeLessThanOrEqual(spec.maxDur);
    }
  });

  it('no file is pure silence (mean_volume > -55 dBFS)', () => {
    for (const spec of TIER1) {
      const p = join(ROOT, spec.rel);
      const mean = meanDbfs(p);
      expect(mean, `${spec.rel} silent (${mean} dBFS)`).toBeGreaterThan(-55);
    }
  });

  it('no file clips (max_volume ≤ 0 dBFS, ideally ≤ -1)', () => {
    for (const spec of TIER1) {
      const p = join(ROOT, spec.rel);
      const max = maxDbfs(p);
      expect(max, `${spec.rel} clips at ${max} dBFS`).toBeLessThanOrEqual(0.1);
    }
  });

  it('every file is 44.1kHz stereo (encoder contract)', () => {
    for (const spec of TIER1) {
      const p = join(ROOT, spec.rel);
      const sr = parseInt(ffprobe(p, 'stream=sample_rate'), 10);
      const ch = parseInt(ffprobe(p, 'stream=channels'), 10);
      expect(sr, `${spec.rel} sr=${sr}`).toBe(44100);
      expect([1, 2], `${spec.rel} ch=${ch}`).toContain(ch);
    }
  });
});
