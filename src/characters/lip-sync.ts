import type { MouthShape, MouthShapeParams, MouthCue } from '../types';
import { amplitudeToMouthShape } from '../audio/rhubarb-parser';

/**
 * Map Rhubarb lip-sync cue letters (A–H) to SVG mouth shape parameters.
 *
 * A = open wide       (ah, open vowels)
 * B = closed          (m, b, p — lips together)
 * C = half-open       (eh, short vowels)
 * D = wide open       (aa — wide smile)
 * E = narrow          (ee — tight)
 * F = teeth visible   (f, v — upper teeth on lower lip)
 * G = round           (oo — round lips)
 * H = tight/closed    (rest position, l sound)
 */
export const MOUTH_SHAPES: Record<MouthShape, MouthShapeParams> = {
  A: { width: 20, height: 16, shape: 'ellipse', teethVisible: false, openness: 0.9 },
  B: { width: 16, height: 1, shape: 'line', teethVisible: false, openness: 0.0 },
  C: { width: 16, height: 8, shape: 'ellipse', teethVisible: false, openness: 0.5 },
  D: { width: 24, height: 14, shape: 'ellipse', teethVisible: true, openness: 0.8 },
  E: { width: 12, height: 6, shape: 'ellipse', teethVisible: false, openness: 0.3 },
  F: { width: 16, height: 4, shape: 'line', teethVisible: true, openness: 0.2 },
  G: { width: 12, height: 12, shape: 'circle', teethVisible: false, openness: 0.6 },
  H: { width: 10, height: 2, shape: 'line', teethVisible: false, openness: 0.1 },
};

export function getMouthShape(cue: MouthShape): MouthShapeParams {
  return MOUTH_SHAPES[cue];
}

/**
 * Interpolate between two mouth shapes for smoother animation.
 */
export function interpolateMouth(
  from: MouthShapeParams,
  to: MouthShapeParams,
  progress: number, // 0–1
): MouthShapeParams {
  const lerp = (a: number, b: number) => a + (b - a) * progress;
  return {
    width: lerp(from.width, to.width),
    height: lerp(from.height, to.height),
    shape: progress < 0.5 ? from.shape : to.shape,
    teethVisible: progress < 0.5 ? from.teethVisible : to.teethVisible,
    openness: lerp(from.openness, to.openness),
  };
}

/**
 * M5.2 — pick a mouth shape at a given timestamp from a list of
 * Rhubarb-derived cues. If no cue covers the time (or `cues` is empty,
 * meaning Rhubarb wasn't available), fall back to an amplitude-based
 * open/close heuristic. `fallbackAmp` defaults to 0 (closed).
 *
 * Pure function — no DOM, no Remotion hooks. Safe for unit tests.
 */
export function selectMouthShapeAtTime(
  cues: MouthCue[] | undefined,
  timeSec: number,
  fallbackAmp = 0,
): MouthShape {
  if (cues && cues.length > 0) {
    const hit = cues.find((c) => timeSec >= c.start && timeSec < c.end);
    if (hit) return hit.shape;
  }
  return amplitudeToMouthShape(fallbackAmp);
}
