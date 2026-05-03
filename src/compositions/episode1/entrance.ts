// src/compositions/episode1/entrance.ts
//
// Frame-0 hook contract (MrBeast/Bird):
//   - The first character on screen must already be visible on frame 0
//     so the very first frame the viewer sees has a face on it.
//   - Subsequent characters can stagger in for life and depth.
//
// Implementation:
//   - charIndex 0  → scale starts at 0.9, settles to 1.0 by ~frame 12.
//   - charIndex ≥1 → vanilla Remotion spring with stagger of 6 frames per index.
//
// Fully deterministic — no time/Math.random; pure function of (frame, fps, idx).

import { spring } from 'remotion';

interface Args {
  frame: number;
  fps: number;
  charIndex: number;
}

const DAMPING = 14;
const STIFFNESS = 120;
const MASS = 0.45;
const STAGGER_FRAMES = 6;

/** Smooth ease-out from 0.9 to 1.0 over ~12 frames. Pure, no randomness. */
function leadEase(frame: number): number {
  if (frame <= 0) return 0.9;
  if (frame >= 12) return 1.0;
  const t = frame / 12;
  // cubic ease-out
  return 0.9 + (1 - Math.pow(1 - t, 3)) * 0.1;
}

export function firstCharEntranceScale({ frame, fps, charIndex }: Args): number {
  if (charIndex === 0) {
    return leadEase(frame);
  }
  return spring({
    frame: frame - charIndex * STAGGER_FRAMES,
    fps,
    config: { damping: DAMPING, stiffness: STIFFNESS, mass: MASS },
  });
}
