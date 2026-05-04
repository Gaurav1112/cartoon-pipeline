// tests/quality/m14-kid-pace.test.ts
//
// M14: TTS pacing must be slow enough for kids 4-10 to comprehend
// every Hindi word. Reference: Peppa Pig English ≈ 130 wpm; Chhota
// Bheem Hindi ≈ 140 wpm. We target a kid-comprehensible window for
// all 8 emotions: rate ≤ -15% always (no faster than base), and the
// slowest beats stay ≤ -25% (so children don't lose the thread).
import { describe, it, expect } from 'vitest';
import type { EmotionType } from '../../src/types';
import { getSSMLProsody } from '../../src/audio/emotion-prosody';

const EMOTIONS: EmotionType[] = [
  'neutral',
  'happy',
  'sad',
  'angry',
  'scared',
  'surprised',
  'thinking',
  'determined',
];

function parsePercent(s: string): number {
  const m = s.match(/^(-?\d+)%$/);
  if (!m) throw new Error(`Bad rate: ${s}`);
  return parseInt(m[1], 10);
}

describe('M14: TTS prosody is kid-pace for every emotion', () => {
  it('every emotion rate is at most -15% (never faster than kid baseline)', () => {
    for (const e of EMOTIONS) {
      const r = parsePercent(getSSMLProsody(e).rate);
      expect(r, `emotion ${e} rate=${r}%`).toBeLessThanOrEqual(-15);
    }
  });

  it('every emotion rate is at least -30% (so playback isn\'t painfully slow)', () => {
    for (const e of EMOTIONS) {
      const r = parsePercent(getSSMLProsody(e).rate);
      expect(r, `emotion ${e} rate=${r}%`).toBeGreaterThanOrEqual(-30);
    }
  });

  it('rate spread is no more than 15 percentage points (predictable cadence)', () => {
    const rates = EMOTIONS.map((e) => parsePercent(getSSMLProsody(e).rate));
    const spread = Math.max(...rates) - Math.min(...rates);
    expect(spread).toBeLessThanOrEqual(15);
  });
});
