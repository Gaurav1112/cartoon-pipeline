// src/characters/animation-life.ts
// Pure functions for character "life" — Glen Keane breath/dart/weight,
// John Lasseter squash/stretch/anticipation/arcs.
// All deterministic (no Math.random, no Date.now). Same input = same output.

/**
 * Landing squash: when a walk-cycle foot strikes the ground, the body
 * compresses vertically (squash) and stretches horizontally for a few
 * frames (Lasseter "weight" principle). Returns {squashY, stretchX}
 * multipliers around 1.0.
 *
 * walkPhase ∈ [0,1) — fractional position in the 24-frame cycle.
 * Strikes happen at phase=0 and phase=0.5 (left then right foot).
 */
export function landingSquash(walkPhase: number): { squashY: number; stretchX: number } {
  // Distance to nearest strike point (0 or 0.5), wrapped to [0, 0.5].
  const distA = Math.abs(walkPhase);
  const distB = Math.abs(walkPhase - 0.5);
  const distC = Math.abs(walkPhase - 1.0); // for phases near 1 wrapping to 0
  const dist = Math.min(distA, distB, distC);
  // Squash window: only within first ~0.08 of phase from strike (≈2 frames).
  const STRIKE_WINDOW = 0.08;
  if (dist > STRIKE_WINDOW) return { squashY: 1.0, stretchX: 1.0 };
  // Linear ease: full squash at strike, fades back to neutral by window edge.
  const intensity = 1 - dist / STRIKE_WINDOW;
  return {
    squashY: 1 - 0.05 * intensity, // up to 5% vertical squash
    stretchX: 1 + 0.03 * intensity, // up to 3% horizontal stretch
  };
}

/**
 * Exponentially-damped sinusoid for tail/scarf trailing motion (Lasseter
 * "follow-through"). Decays after a pose change so the appendage doesn't
 * oscillate forever.
 *
 * framesSincePose: how many frames since the character changed pose.
 * baseFreq: oscillation frequency (radians per frame).
 * amplitudePx: peak amplitude in pixels at framesSincePose=0.
 * dampingHalfLife: frames to halve amplitude.
 */
export function tailDamping(
  framesSincePose: number,
  baseFreq: number,
  amplitudePx: number,
  dampingHalfLife: number,
): number {
  if (framesSincePose < 0) framesSincePose = 0;
  const decay = Math.pow(0.5, framesSincePose / Math.max(1, dampingHalfLife));
  return amplitudePx * decay * Math.sin(baseFreq * framesSincePose);
}

/**
 * Eye dart: sporadic micro-saccades that make eyes feel alive
 * (Keane "the windows of the soul"). Returns {dx, dy} pupil offset
 * in pixels. Most of the time returns (0,0). Triggers a 6-frame dart
 * approximately every ~120-180 frames depending on seed.
 *
 * frame: current frame.
 * seed: stable per-character integer (we use charCodeAt sums upstream).
 */
export function eyeDart(frame: number, seed: number): { dx: number; dy: number } {
  // Cycle length unique per seed: 90 + (seed % 90) frames
  const cycleLen = 90 + (Math.abs(seed) % 90);
  const phase = ((frame % cycleLen) + cycleLen) % cycleLen;
  // Dart window: 6 frames, starting at phase = cycleLen - 6
  const DART_LEN = 6;
  if (phase < cycleLen - DART_LEN) return { dx: 0, dy: 0 };
  const local = phase - (cycleLen - DART_LEN); // 0..DART_LEN-1
  // Choose direction deterministically from seed
  const dirAngle = ((seed * 31) % 360) * (Math.PI / 180);
  const peak = 2.0; // px
  // Triangle envelope: rise to peak at midpoint, back to 0
  const env = 1 - Math.abs(local - (DART_LEN - 1) / 2) / ((DART_LEN - 1) / 2);
  return {
    dx: Math.cos(dirAngle) * peak * env,
    dy: Math.sin(dirAngle) * peak * env,
  };
}

/**
 * Anticipation crouch: before a big action (jump, charge, throw), the
 * character compresses slightly opposite to the action direction
 * (Lasseter principle). Returns scale multiplier 1.0 = neutral.
 *
 * framesUntilPose: how many frames until the action pose triggers.
 * Negative or large values = no anticipation.
 */
export function anticipationCrouch(framesUntilPose: number): number {
  if (framesUntilPose < 0 || framesUntilPose > 8) return 1.0;
  // Build crouch over 8 frames, peak compression at framesUntilPose=2.
  const t = framesUntilPose; // 0..8
  // Bell curve centered at t=2
  const env = Math.exp(-Math.pow(t - 2, 2) / 4);
  return 1.0 - 0.06 * env; // up to 6% crouch
}
