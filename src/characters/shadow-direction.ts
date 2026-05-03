// src/characters/shadow-direction.ts
// Deakins: shadow direction is the second-most-important storytelling
// vector after key-light direction. We compute it from timeOfDay so the
// frame always reads as "lit by the world", not "floating in CSS".

import type { TimeOfDay } from '../types';

export interface ShadowDirection {
  /** Horizontal pixel offset of shadow center (negative = west of character). */
  offsetX: number;
  /** Shadow length multiplier (1.0 = neutral). */
  lengthMul: number;
  /** Shadow opacity (0..1). */
  opacity: number;
  /** Shadow color (sRGB hex / rgba). Tinted complementary to keylight. */
  color: string;
}

/**
 * Pure: same TimeOfDay always returns the same ShadowDirection.
 * No randomness, no wall-clock, no IO.
 *
 * Mapping rationale:
 *   - dawn:  light low from east → long shadow toward west, warm-tinted soft.
 *   - day:   light high overhead → short shadow beneath, neutral cool.
 *   - dusk:  light low from west → long shadow toward east, cool-tinted soft.
 *   - night: ambient bounce only → tiny shadow, deep blue tint, low opacity.
 */
export function shadowForTime(time: TimeOfDay): ShadowDirection {
  switch (time) {
    case 'dawn':
      return { offsetX: -14, lengthMul: 1.6, opacity: 0.22, color: 'rgba(40,30,55,0.22)' };
    case 'day':
      return { offsetX: 0, lengthMul: 0.85, opacity: 0.28, color: 'rgba(20,30,40,0.28)' };
    case 'dusk':
      return { offsetX: 14, lengthMul: 1.6, opacity: 0.22, color: 'rgba(45,25,40,0.22)' };
    case 'night':
      return { offsetX: 4, lengthMul: 0.6, opacity: 0.14, color: 'rgba(10,15,40,0.14)' };
    default:
      return { offsetX: 0, lengthMul: 1.0, opacity: 0.18, color: 'rgba(0,0,0,0.18)' };
  }
}
