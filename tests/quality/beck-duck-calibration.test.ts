import { describe, it, expect } from 'vitest';
import {
  buildMixCommand,
  calibrateDuckThreshold,
  DUCK_THRESHOLD,
} from '../../src/audio/audio-mixer';
import type { AudioLayer } from '../../src/types';

// Beck gap M1.3 — sidechaincompress threshold was hardcoded to 0.015
// (a magic number). edge-tts voice loudness varies materially across
// voices and languages, so the duck depth was inconsistent in
// practice (sometimes barely audible, sometimes a 12 dB hole).
//
// Contract:
//   1. DUCK_THRESHOLD is exported and documented (calibration source).
//   2. calibrateDuckThreshold(peak) returns 0.6 * peak, clamped to
//      [0.005, 0.05].
//   3. buildMixCommand accepts an optional duckThreshold and the
//      filter graph reflects the passed-in value.
//   4. The default still equals DUCK_THRESHOLD (no behavioural drift).

function ducked(): AudioLayer[] {
  return [
    { type: 'dialogue', filePath: '/x/d.wav', startMs: 0, volumeDb: -5 },
    { type: 'music', filePath: '/x/m.wav', startMs: 0, volumeDb: -16, duckDuringDialogue: true },
  ];
}

function getGraph(cmd: string[]): string {
  const i = cmd.indexOf('-filter_complex');
  return cmd[i + 1];
}

describe('Beck sidechain threshold calibration (M1.3)', () => {
  it('DUCK_THRESHOLD default matches measured edge-tts hi-IN-MadhurNeural baseline', () => {
    expect(DUCK_THRESHOLD).toBe(0.015);
  });

  describe('calibrateDuckThreshold', () => {
    it('returns 0.6 * peak in the common range', () => {
      expect(calibrateDuckThreshold(0.025)).toBeCloseTo(0.015, 6);
      expect(calibrateDuckThreshold(0.05)).toBeCloseTo(0.03, 6);
    });

    it('clamps below 0.005 (silence floor — would over-trigger)', () => {
      expect(calibrateDuckThreshold(0)).toBe(0.005);
      expect(calibrateDuckThreshold(0.001)).toBe(0.005);
      expect(calibrateDuckThreshold(-0.5)).toBe(0.005);
    });

    it('clamps above 0.05 (loud-peak ceiling — would never duck)', () => {
      expect(calibrateDuckThreshold(0.1)).toBe(0.05);
      expect(calibrateDuckThreshold(1.0)).toBe(0.05);
    });

    it('exact boundary values are included', () => {
      expect(calibrateDuckThreshold(0.005 / 0.6)).toBeCloseTo(0.005, 6);
      expect(calibrateDuckThreshold(0.05 / 0.6)).toBeCloseTo(0.05, 6);
    });
  });

  describe('buildMixCommand respects duckThreshold parameter', () => {
    it('default graph uses DUCK_THRESHOLD', () => {
      const graph = getGraph(buildMixCommand('/x/out.wav', ducked()));
      expect(graph).toContain(`sidechaincompress=threshold=${DUCK_THRESHOLD}`);
    });

    it('custom threshold flows into the filter graph verbatim', () => {
      const graph = getGraph(buildMixCommand('/x/out.wav', ducked(), 0.027));
      expect(graph).toContain('sidechaincompress=threshold=0.027');
      expect(graph).not.toContain('threshold=0.015');
    });

    it('a calibrated threshold from a measured peak flows through end-to-end', () => {
      const measuredPeak = 0.04;
      const t = calibrateDuckThreshold(measuredPeak);
      const graph = getGraph(buildMixCommand('/x/out.wav', ducked(), t));
      expect(graph).toContain(`sidechaincompress=threshold=${t}`);
    });
  });
});
