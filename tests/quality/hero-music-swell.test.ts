// M5.3 — Beat-aligned music swell at hero moments.
//
// Cinema scoring rule: the score "lifts" 2–3 dB on the line where the
// stakes peak (the Zimmer / Williams "stinger" pattern). We piggy-back
// on the M4.2 \`heroMomentScore\` field already attached to dialogue
// lines: any line scoring > 0.9 gets a +3 dB swell with a 200 ms
// attack and 300 ms release for the duration of that line.
import { describe, it, expect } from 'vitest';
import {
  buildHeroSwellEnvelope,
  HERO_SCORE_THRESHOLD,
  HERO_SWELL_GAIN_DB,
  HERO_ATTACK_MS,
  HERO_RELEASE_MS,
  buildHeroSwellFfmpegFilter,
} from '../../src/audio/cartoon-audio';

interface FakeLine {
  startMs: number;
  durationMs: number;
  heroMomentScore?: number;
}

describe('M5.3 — beat-aligned hero-moment music swell', () => {
  it('exports the canonical pin: threshold > 0.9, +3 dB, 200 ms / 300 ms', () => {
    expect(HERO_SCORE_THRESHOLD).toBeGreaterThan(0.9);
    expect(HERO_SCORE_THRESHOLD).toBeLessThanOrEqual(0.91); // tight pin
    expect(HERO_SWELL_GAIN_DB).toBe(3);
    expect(HERO_ATTACK_MS).toBe(200);
    expect(HERO_RELEASE_MS).toBe(300);
  });

  it('returns one swell entry for one heroMomentScore=0.95 line', () => {
    const lines: FakeLine[] = [
      { startMs: 1000, durationMs: 2000, heroMomentScore: 0.95 },
    ];
    const envelope = buildHeroSwellEnvelope(lines);
    expect(envelope).toHaveLength(1);
    expect(envelope[0]).toEqual({
      startMs: 1000,
      endMs: 3000,
      gainDb: 3,
      attackMs: 200,
      releaseMs: 300,
    });
  });

  it('skips lines below the threshold', () => {
    const lines: FakeLine[] = [
      { startMs: 0, durationMs: 1000, heroMomentScore: 0.5 },
      { startMs: 1000, durationMs: 1000, heroMomentScore: 0.9 },   // exactly at edge — excluded
      { startMs: 2000, durationMs: 1000, heroMomentScore: 0.91 },  // > 0.9 — included
      { startMs: 3000, durationMs: 1000 },                         // no score
    ];
    const envelope = buildHeroSwellEnvelope(lines);
    expect(envelope).toHaveLength(1);
    expect(envelope[0].startMs).toBe(2000);
    expect(envelope[0].endMs).toBe(3000);
  });

  it('produces multiple swells for multiple hero lines', () => {
    const lines: FakeLine[] = [
      { startMs: 0,    durationMs: 500, heroMomentScore: 0.95 },
      { startMs: 1000, durationMs: 800, heroMomentScore: 1.0  },
      { startMs: 2500, durationMs: 600, heroMomentScore: 0.92 },
    ];
    const envelope = buildHeroSwellEnvelope(lines);
    expect(envelope).toHaveLength(3);
    expect(envelope.map((e) => e.startMs)).toEqual([0, 1000, 2500]);
  });

  it('returns [] for empty input', () => {
    expect(buildHeroSwellEnvelope([])).toEqual([]);
  });

  it('builds a deterministic ffmpeg volume filter expression', () => {
    const env = [
      { startMs: 1000, endMs: 3000, gainDb: 3, attackMs: 200, releaseMs: 300 },
    ];
    const filter = buildHeroSwellFfmpegFilter(env);
    // Format: volume='if(between(t,a,b),gain,1)':eval=frame
    // It must use the \`between(t,...)\` enable-style expression on the
    // music bus. We assert key fragments to keep the test resilient
    // to whitespace tweaks.
    expect(filter).toContain('volume=');
    expect(filter).toContain('between(t,');
    // 1.0s start, 3.0s end
    expect(filter).toContain('1.000');
    expect(filter).toContain('3.000');
    // gain ratio for +3 dB ≈ 1.4125
    expect(filter).toMatch(/1\.41\d+/);
  });

  it('empty envelope produces no-op filter', () => {
    expect(buildHeroSwellFfmpegFilter([])).toBe('');
  });
});
