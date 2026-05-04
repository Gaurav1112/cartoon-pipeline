// src/compositions/episode1/scene-chopper.ts
/**
 * M24: Scene Chopper — boost cut frequency from 16 to 26+ cuts per 76s episode.
 *
 * PROBLEM: Average shot length 4.8s. Kids' content needs 2.5-3.0s rhythm
 * (Bheem/Peppa tier). Long scenes hold single camera for 5-8s → attention drop.
 *
 * SOLUTION: Auto-split scenes >65 frames (2.16s @ 30fps) into 2-3 sub-shots
 * that alternate camera angles. SAME audio, SAME dialogue, but visual cycles
 * through different camera intensities/compositions for pattern interrupt.
 *
 * CONSTRAINTS:
 * - Pure function: deterministic schedule per (sceneId, durFrames, baseCam, baseCamI)
 * - Use only existing CameraType values from types.ts
 * - Backwards compatible: scenes ≤65 frames return 1 sub-shot (no chop)
 * - Doesn't break patternInterrupt or RhythmInterrupt overlays
 */

import type { CameraType } from './types';

export interface SubShot {
  /** Frame index where this sub-shot starts (inclusive) */
  startFrame: number;
  /** Frame index where this sub-shot ends (exclusive) */
  endFrame: number;
  /** Camera type for this sub-shot */
  cam: CameraType;
  /** Camera intensity 0-1 for this sub-shot */
  camI: number;
}

/**
 * Pure function: chop a scene into sub-shots with alternating camera angles.
 *
 * @param sceneId - Scene identifier for deterministic seeding
 * @param durFrames - Total scene duration in frames
 * @param baseCam - Original camera type from scene definition
 * @param baseCamI - Original camera intensity from scene definition
 * @returns Array of sub-shots covering [0, durFrames)
 */
export function chopScene(
  sceneId: string,
  durFrames: number,
  baseCam: CameraType,
  baseCamI: number,
): SubShot[] {
  // SHORT SCENE: no chop needed
  if (durFrames <= 65) {
    return [{
      startFrame: 0,
      endFrame: durFrames,
      cam: baseCam,
      camI: baseCamI,
    }];
  }

  // LONG SCENE: split into chunks of ~65 frames each (2.16s for more frequent cuts)
  const chunkSize = 65;
  const numChunks = Math.ceil(durFrames / chunkSize);
  const subShots: SubShot[] = [];

  // Deterministic pseudo-random seed from sceneId
  const seed = hashSceneId(sceneId);

  for (let i = 0; i < numChunks; i++) {
    const startFrame = i * chunkSize;
    const endFrame = Math.min((i + 1) * chunkSize, durFrames);

    // Alternate camera variants deterministically
    const { cam, camI } = selectCameraVariant(i, baseCam, baseCamI, seed);

    subShots.push({
      startFrame,
      endFrame,
      cam,
      camI,
    });
  }

  return subShots;
}

/**
 * Simple string hash to integer for deterministic seeding.
 * Uses Java's String.hashCode() algorithm for stability.
 */
function hashSceneId(sceneId: string): number {
  let hash = 0;
  for (let i = 0; i < sceneId.length; i++) {
    const char = sceneId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Select camera type and intensity for chunk[i] based on base camera
 * and deterministic alternation schedule.
 *
 * STRATEGY:
 * - If baseCam is already dynamic (zoom_in, pan_*, drift), alternate
 *   with close_up and wide for visual variety.
 * - If baseCam is compositional (close_up, wide), alternate between them.
 * - If baseCam is static, cycle through close_up → wide → static.
 * - Vary camI by ±0.1-0.2 per chunk for emotional rhythm.
 */
function selectCameraVariant(
  chunkIndex: number,
  baseCam: CameraType,
  baseCamI: number,
  seed: number,
): { cam: CameraType; camI: number } {
  // Deterministic alternation patterns based on baseCam type
  const dynamicCams: CameraType[] = ['zoom_in', 'pan_left', 'pan_right', 'zoom_out', 'drift', 'shake'];
  const compositionalCams: CameraType[] = ['close_up', 'wide'];

  let cam: CameraType;
  let camI: number;

  if (baseCam === 'close_up' || baseCam === 'wide') {
    // Compositional cameras: alternate close_up ↔ wide
    const variants: CameraType[] = ['close_up', 'wide'];
    const offset = (seed + chunkIndex) % variants.length;
    cam = variants[offset];
    
    // Vary intensity: close_up gets higher, wide gets lower
    camI = cam === 'close_up'
      ? Math.min(1.0, baseCamI + 0.15)
      : Math.max(0.3, baseCamI - 0.15);
  } else if (dynamicCams.includes(baseCam)) {
    // Dynamic cameras: cycle base → close_up → wide → base
    const variants: CameraType[] = [baseCam, 'close_up', 'wide'];
    const offset = (seed + chunkIndex) % variants.length;
    cam = variants[offset];
    
    // Vary intensity slightly
    const intensityOffsets = [0, 0.1, -0.1];
    const intensityOffset = intensityOffsets[(seed + chunkIndex) % intensityOffsets.length];
    camI = Math.max(0.2, Math.min(1.0, baseCamI + intensityOffset));
  } else {
    // Static or other: cycle static → close_up → wide
    const variants: CameraType[] = ['static', 'close_up', 'wide'];
    const offset = (seed + chunkIndex) % variants.length;
    cam = variants[offset];
    
    // Vary intensity
    const intensityVariants = [baseCamI, baseCamI + 0.2, baseCamI - 0.1];
    camI = Math.max(0.2, Math.min(1.0, intensityVariants[(seed + chunkIndex) % intensityVariants.length]));
  }

  return { cam, camI };
}
