// src/compositions/episode1/side-profile-enforcer.ts
//
// M8 — Peppa-Pig "side-profile" staging rule.
//
// Children parse meaning from the silhouette long before they parse
// language. When two characters share a frame, they must FACE EACH
// OTHER — the meeting of profiles is what reads as "they are talking."
// Without this, both characters end up facing camera and the scene
// reads as two solo portraits glued together.
//
// Convention (assets are drawn facing right by default):
//   - pos='left'   → flip = false (faces right toward center)
//   - pos='right'  → flip = true  (faces left  toward center)
//   - pos='center' → flip is set so the center character looks at
//                    the OTHER character if there is exactly one
//                    other char; otherwise leave undefined.
//
// Author overrides win — if a scene already declares `flip`, we keep it.
// Only fills missing values.

import type { ViralScene, ViralSceneChar } from './types';

function inferFlip(
  char: ViralSceneChar,
  others: ViralSceneChar[],
): boolean | undefined {
  if (char.flip !== undefined) return char.flip;
  // Solo scene → no enforcement (asset's default facing is fine).
  if (others.length === 0) return undefined;
  if (char.pos === 'left') return false;
  if (char.pos === 'right') return true;
  // Center: face the partner if exactly one other char on a side.
  const lefts = others.filter((c) => c.pos === 'left').length;
  const rights = others.filter((c) => c.pos === 'right').length;
  if (lefts > 0 && rights === 0) return true;   // look left
  if (rights > 0 && lefts === 0) return false;  // look right
  // Both sides occupied → ambiguous, leave default.
  return undefined;
}

export function enforceSideProfile(scenes: ViralScene[]): ViralScene[] {
  return scenes.map((scene) => ({
    ...scene,
    chars: scene.chars.map((char, i, arr) => {
      const others = arr.filter((_, j) => j !== i);
      const flip = inferFlip(char, others);
      return flip === undefined ? char : { ...char, flip };
    }),
  }));
}
