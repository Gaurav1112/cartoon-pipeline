import { describe, it, expect } from 'vitest';
import { poseModifierByEmotion } from '../../src/characters/animation-life';
import type { EmotionType } from '../../src/types';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

/**
 * Genndy Tartakovsky gap (M3.5) — silhouette readability.
 *
 * True silhouette analysis would require rendering frames and analyzing
 * the resulting alpha mask. That's out of scope at $0. Instead this
 * test enforces a CONTRACT on the data structures that makes silhouette
 * readability mathematically guaranteed at thumbnail size:
 *
 *   1. Every distinct EmotionType pair produces poseModifier triples
 *      that differ by Euclidean distance ≥ 5 (no two emotions produce
 *      visually identical silhouettes at YouTube thumbnail size).
 *   2. Any scene with ≥2 speaking characters spreads them across at
 *      least 2 distinct vertical thirds (640/960/1280) so silhouettes
 *      don't stack.
 *   3. Shorts-eligible scenes (shortsCutScene OR any line with
 *      shortsFlag) park the primary speaker on a third (640 or 1280) —
 *      the strong rule from M3.4 applies here because vertical-format
 *      thumbnails crop the center column most.
 */

const ALL_EMOTIONS: EmotionType[] = [
  'neutral', 'happy', 'sad', 'angry', 'scared',
  'surprised', 'thinking', 'determined',
];

const X_BY_POS: Record<'left' | 'center' | 'right', number> = {
  left: 640, center: 960, right: 1280,
};
const THIRD_X = new Set([640, 1280]);

function dist(
  a: { tiltDeg: number; hipShiftPx: number; armRaisePx: number },
  b: { tiltDeg: number; hipShiftPx: number; armRaisePx: number },
): number {
  const dt = a.tiltDeg - b.tiltDeg;
  const dh = a.hipShiftPx - b.hipShiftPx;
  const dr = a.armRaisePx - b.armRaisePx;
  return Math.sqrt(dt * dt + dh * dh + dr * dr);
}

describe('Tartakovsky silhouette readability (M3.5)', () => {
  it('every emotion pair has poseModifier Euclidean distance ≥ 5', () => {
    const offenders: string[] = [];
    for (let i = 0; i < ALL_EMOTIONS.length; i++) {
      for (let j = i + 1; j < ALL_EMOTIONS.length; j++) {
        const a = poseModifierByEmotion(ALL_EMOTIONS[i]);
        const b = poseModifierByEmotion(ALL_EMOTIONS[j]);
        const d = dist(a, b);
        if (d < 5) {
          offenders.push(
            `${ALL_EMOTIONS[i]} ↔ ${ALL_EMOTIONS[j]} = ${d.toFixed(2)}`,
          );
        }
      }
    }
    expect(offenders, `Silhouette collisions:\n  ${offenders.join('\n  ')}`).toEqual([]);
  });

  it('multi-speaker scenes spread speakers across ≥ 2 distinct vertical thirds', () => {
    for (const scene of LION_RABBIT_SCENES) {
      const speakers = new Set(scene.dialogue.map((l) => l.char));
      if (speakers.size < 2) continue;
      const xs = new Set<number>();
      for (const id of speakers) {
        const c = scene.chars.find((cc) => cc.id === id);
        if (c) xs.add(X_BY_POS[c.pos]);
      }
      expect(xs.size, `scene ${scene.id} has ${speakers.size} speakers stacked at one x`).toBeGreaterThanOrEqual(2);
    }
  });

  it('Shorts-eligible scenes park the primary speaker on a third (640 or 1280)', () => {
    for (const scene of LION_RABBIT_SCENES) {
      const isShorts =
        scene.shortsCutScene === true ||
        scene.dialogue.some((l) => l.shortsFlag === true);
      if (!isShorts) continue;

      // Primary speaker = highest line count; ties resolved by first
      // appearance (deterministic).
      const counts = new Map<string, number>();
      for (const line of scene.dialogue) {
        counts.set(line.char, (counts.get(line.char) ?? 0) + 1);
      }
      let primary = scene.dialogue[0]?.char;
      let best = 0;
      const seen = new Set<string>();
      for (const line of scene.dialogue) {
        if (seen.has(line.char)) continue;
        seen.add(line.char);
        const c = counts.get(line.char) ?? 0;
        if (c > best) {
          best = c;
          primary = line.char;
        }
      }
      const speakerChar = scene.chars.find((c) => c.id === primary);
      const x = speakerChar ? X_BY_POS[speakerChar.pos] : -1;
      expect(THIRD_X.has(x), `Shorts scene "${scene.id}" primary speaker at x=${x} (must be 640 or 1280)`).toBe(true);
    }
  });
});
