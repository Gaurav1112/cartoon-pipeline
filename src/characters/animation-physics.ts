// src/characters/animation-physics.ts
// Mass-aware ground-contact squash & stretch (Glen Keane gap M2.2).
// Pure deterministic math — no Math.random, no time, no global state.
//
// WIRING NOTE: this helper is currently NOT consumed by CharacterRenderer.
// The pose data path does not yet expose vertical velocity per character.
// When the M3 jump/impact wiring lands, the renderer should:
//   1. Read `verticalVelocity` from the (TBD) physics layer.
//   2. Multiply the existing `stretchX` by `groundContactSquash(v, mass).sx`
//      and `squashY` by `.sy` — taking care NOT to compose with
//      landingSquash() (which is foot-strike, walk-cycle phase based) on
//      the same frame to avoid double-stacking.
// Until then this file ships pure + tested so the wiring PR is a one-liner.

/**
 * Ground-contact squash/stretch.
 *
 * Returns multiplicative scale factors {sx, sy} around 1.0 that respect
 * volume preservation (sx * sy * sz ≈ 1 with sz = 1).
 *
 * - At |verticalVelocity| < 0.5: returns the identity {1, 1} (rest).
 * - On downward impact (v < 0): vertical squash sy ∈ [0.7, 1.0).
 *   Magnitude proportional to impact speed, scaled by 1/√mass so heavier
 *   characters squash less (Keane "weight" principle).
 * - On upward launch (v > 0, anticipation): vertical stretch sy > 1.
 *   sx = 1/sy in both cases for volume preservation.
 *
 * @param verticalVelocity world-space vertical velocity in arbitrary units;
 *   negative = downward (impact), positive = upward (launch). The constants
 *   are tuned so |v| ≈ 5 reads as a "hard" impact.
 * @param mass character mass in arbitrary units (default 1.0). Heavier mass
 *   reduces effective impact via 1/√mass.
 */
export function groundContactSquash(
  verticalVelocity: number,
  mass: number = 1.0,
): { sx: number; sy: number } {
  if (Math.abs(verticalVelocity) < 0.5) return { sx: 1, sy: 1 };

  const safeMass = mass > 0 ? mass : 1.0;
  const massScale = 1 / Math.sqrt(safeMass);

  if (verticalVelocity < 0) {
    // Impact: squash. Tuned so v=-5, mass=1 yields sy=0.7 (clamp floor).
    const impact = -verticalVelocity * massScale;
    const raw = 1 - 0.15 * impact;
    const sy = Math.min(1.0, Math.max(0.7, raw));
    return { sx: 1 / sy, sy };
  }

  // Launch: stretch (anticipation rebound). 5% per unit of upward v.
  const launch = verticalVelocity * massScale;
  const sy = 1 + 0.05 * launch;
  return { sx: 1 / sy, sy };
}
