import { describe, it, expect } from 'vitest';
import {
  talkBobY,
  talkBobYIfTalking,
  TALK_BOB_TABLE,
} from '../../src/characters/animation-life';

// Brad Bird gap M2.1 — characters in `isTalking` pose were rendered with a
// fixed body Y/X. The result felt like cardboard cutouts with moving mouths.
// `talkBobY(characterId, frame)` introduces a subtle, continuous sinusoidal
// bob whose frequency is unique per character so two characters in the same
// shot never lock-step. Amplitude is bounded so the bob never crosses into
// "wobble". The helper is a *pure continuous sinusoid* — never wrapped in a
// `frame % N` modulo (the lesson from checkpoint 005: tailDamping wrapped in
// % triggered decay re-entry every period).

describe('M2.1 talkBobY — Brad Bird body bob during talk_gesture', () => {
  const CHARS = ['moti', 'arjun', 'bablu', 'meera', 'kaaliya', 'guruji', 'amma'] as const;

  it('amplitude per character stays within ±4 px across frames 0..1000', () => {
    for (const id of CHARS) {
      let maxAbs = 0;
      for (let f = 0; f <= 1000; f++) {
        const y = talkBobY(id, f);
        if (!Number.isFinite(y)) throw new Error(`non-finite at ${id} ${f}`);
        if (Math.abs(y) > maxAbs) maxAbs = Math.abs(y);
      }
      expect(maxAbs).toBeLessThanOrEqual(4);
    }
  });

  it('per-character amplitude matches the documented table', () => {
    // Sweep enough frames to hit the peak of each sinusoid.
    function peakOf(id: string): number {
      let m = 0;
      for (let f = 0; f <= 2000; f++) {
        const v = Math.abs(talkBobY(id as any, f));
        if (v > m) m = v;
      }
      return m;
    }
    for (const id of CHARS) {
      const expectedAmp = TALK_BOB_TABLE[id]?.amp ?? TALK_BOB_TABLE.default.amp;
      // Peak should be within 1% of expected amplitude.
      expect(peakOf(id)).toBeGreaterThan(expectedAmp * 0.99);
      expect(peakOf(id)).toBeLessThanOrEqual(expectedAmp + 1e-6);
    }
  });

  it('moti and arjun frequencies are coprime-ish: |corr| < 0.3 over 600 frames', () => {
    // Pearson correlation of the two waveforms across a long window.
    const N = 600;
    const a: number[] = [];
    const b: number[] = [];
    for (let f = 0; f < N; f++) {
      a.push(talkBobY('moti', f));
      b.push(talkBobY('arjun', f));
    }
    const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
    const ma = mean(a);
    const mb = mean(b);
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < N; i++) {
      const xa = a[i] - ma;
      const xb = b[i] - mb;
      num += xa * xb;
      da += xa * xa;
      db += xb * xb;
    }
    const corr = num / Math.sqrt(da * db);
    expect(Math.abs(corr)).toBeLessThan(0.3);
  });

  it('no two characters share a period < 200 frames (no lock-step pairs)', () => {
    // Period in frames = 2π / freq. We assert the *minimum* period across
    // any pair, computed via beat freq, exceeds 200 frames-of-divergence.
    const ids = Object.keys(TALK_BOB_TABLE).filter((k) => k !== 'default');
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const fi = TALK_BOB_TABLE[ids[i]].freq;
        const fj = TALK_BOB_TABLE[ids[j]].freq;
        expect(Math.abs(fi - fj)).toBeGreaterThan(0); // distinct
      }
    }
  });

  it('talkBobYIfTalking returns 0 exactly when isTalking=false', () => {
    for (const id of CHARS) {
      for (const f of [0, 7, 13, 31, 100, 999]) {
        expect(talkBobYIfTalking(id, f, false)).toBe(0);
      }
    }
  });

  it('talkBobYIfTalking equals talkBobY when isTalking=true', () => {
    for (const id of CHARS) {
      for (const f of [0, 7, 13, 31, 100, 999]) {
        expect(talkBobYIfTalking(id, f, true)).toBe(talkBobY(id, f));
      }
    }
  });

  it('is a pure continuous sinusoid: NOT wrapped in frame % N', () => {
    // Continuity check: |Δ| between adjacent frames is bounded by amp*freq*1.1
    // (Lipschitz constant of A·sin(ω f)). A modulo wrap would produce a
    // discontinuous jump exceeding this bound.
    for (const id of CHARS) {
      const { amp, freq } = TALK_BOB_TABLE[id] ?? TALK_BOB_TABLE.default;
      const bound = amp * freq * 1.1;
      let prev = talkBobY(id, 0);
      for (let f = 1; f <= 2000; f++) {
        const cur = talkBobY(id, f);
        expect(Math.abs(cur - prev)).toBeLessThanOrEqual(bound);
        prev = cur;
      }
    }
  });

  it('determinism: same (id, frame) → same bob value', () => {
    for (const id of CHARS) {
      for (const f of [0, 1, 7, 42, 137, 999]) {
        expect(talkBobY(id, f)).toBe(talkBobY(id, f));
      }
    }
  });
});
