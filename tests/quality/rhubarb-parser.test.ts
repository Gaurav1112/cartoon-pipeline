// M5.2 — Rhubarb lip-sync parser contract.
//
// Rhubarb (https://github.com/DanielSWolf/rhubarb-lip-sync) is the
// only free, deterministic, offline lip-sync option available on $0.
// It emits 9 mouth-shape phonemes (A–H + X for rest/closed). This
// test pins the JSON/VTT parser AND the phoneme→MouthShape mapping
// so that future refactors cannot silently drop a phoneme.
import { describe, it, expect } from 'vitest';
import {
  parseRhubarbOutput,
  parseRhubarbJson,
  parseRhubarbVtt,
  phonemeToMouthShape,
  amplitudeToMouthShape,
  PHONEMES,
} from '../../src/audio/rhubarb-parser';
import type { MouthShape } from '../../src/types';

describe('M5.2 — Rhubarb lip-sync parser', () => {
  it('exports the canonical 9-phoneme set (A–H + X)', () => {
    expect([...PHONEMES].sort()).toEqual(
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'].sort(),
    );
  });

  it('maps every Rhubarb phoneme deterministically to a MouthShape', () => {
    // Pin the full mapping. Changing this is a *deliberate* mouth-shape
    // change and must be re-pinned in the same commit.
    const expected: Record<string, MouthShape> = {
      A: 'A', // open closed lips (m, b, p) — Rhubarb-A is "closed"
      B: 'B', // closed-relaxed (slight open: t, d, n, k, g)
      C: 'C', // half-open (eh / ae)
      D: 'D', // wide-open (aa)
      E: 'E', // round-mid (ow / oh)
      F: 'F', // round-tight (oo / w)
      G: 'F', // f, v — teeth on lip; we collapse to F (closest visible-teeth shape)
      H: 'A', // l, r — open-tongue-up; collapse to A (open)
      X: 'B', // rest / closed — neutral idle
    };
    for (const ph of PHONEMES) {
      expect(phonemeToMouthShape(ph), `phoneme ${ph}`).toBe(expected[ph]);
    }
  });

  it('parseRhubarbJson handles canonical Rhubarb JSON output', () => {
    const json = JSON.stringify({
      metadata: { soundFile: 'x.wav', duration: 1.5 },
      mouthCues: [
        { start: 0.0, end: 0.2, value: 'X' },
        { start: 0.2, end: 0.45, value: 'B' },
        { start: 0.45, end: 0.7, value: 'D' },
      ],
    });
    const cues = parseRhubarbJson(json);
    expect(cues).toHaveLength(3);
    expect(cues[0]).toEqual({ phoneme: 'X', startMs: 0, endMs: 200 });
    expect(cues[2]).toEqual({ phoneme: 'D', startMs: 450, endMs: 700 });
  });

  it('parseRhubarbVtt handles WebVTT cue blocks', () => {
    const vtt = [
      'WEBVTT',
      '',
      '00:00:00.000 --> 00:00:00.200',
      'X',
      '',
      '00:00:00.200 --> 00:00:00.450',
      'B',
      '',
      '00:00:00.450 --> 00:00:00.700',
      'D',
      '',
    ].join('\n');
    const cues = parseRhubarbVtt(vtt);
    expect(cues).toHaveLength(3);
    expect(cues[0]).toEqual({ phoneme: 'X', startMs: 0, endMs: 200 });
    expect(cues[1]).toEqual({ phoneme: 'B', startMs: 200, endMs: 450 });
    expect(cues[2]).toEqual({ phoneme: 'D', startMs: 450, endMs: 700 });
  });

  it('parseRhubarbOutput auto-detects JSON vs VTT', () => {
    const json = JSON.stringify({ mouthCues: [{ start: 0, end: 0.1, value: 'A' }] });
    const vtt = 'WEBVTT\n\n00:00:00.000 --> 00:00:00.100\nA\n';
    expect(parseRhubarbOutput(json)).toEqual([
      { phoneme: 'A', startMs: 0, endMs: 100 },
    ]);
    expect(parseRhubarbOutput(vtt)).toEqual([
      { phoneme: 'A', startMs: 0, endMs: 100 },
    ]);
  });

  it('parser gracefully no-ops on empty / malformed input (CI without Rhubarb)', () => {
    // CI environment without rhubarb installed must NOT crash the
    // pipeline — return [] and let the renderer fall back to the
    // amplitude heuristic.
    expect(parseRhubarbOutput('')).toEqual([]);
    expect(parseRhubarbOutput('  \n\n  ')).toEqual([]);
    expect(parseRhubarbOutput('{not json}')).toEqual([]);
    expect(parseRhubarbOutput('not vtt either')).toEqual([]);
    // Valid JSON shape but no mouthCues
    expect(parseRhubarbOutput('{"metadata":{}}')).toEqual([]);
    // Phonemes outside A–H + X are dropped (defensive)
    const weird = JSON.stringify({ mouthCues: [{ start: 0, end: 1, value: 'Z' }] });
    expect(parseRhubarbOutput(weird)).toEqual([]);
  });

  it('amplitudeToMouthShape maps amplitude → open/closed deterministically', () => {
    // Pure fallback when no Rhubarb data is available. Pin all band edges.
    expect(amplitudeToMouthShape(0)).toBe('B');     // silent → closed
    expect(amplitudeToMouthShape(0.05)).toBe('B');  // floor noise → closed
    expect(amplitudeToMouthShape(0.15)).toBe('C');  // soft → half-open
    expect(amplitudeToMouthShape(0.35)).toBe('A');  // mid → open
    expect(amplitudeToMouthShape(0.7)).toBe('D');   // loud → wide-open
    expect(amplitudeToMouthShape(1)).toBe('D');     // peak → wide-open
  });
});
