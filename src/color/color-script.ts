// src/color/color-script.ts
//
// M4.1 — Per-beat color script with motivated lighting (Roger Deakins gap).
//
// A colorscript is the spine of a film. Flat SVG with no per-mood
// lighting reads as cheap. This module defines a deterministic palette
// and lighting direction per story mood, plus a pure helper that maps
// a `ColorBeat` to a CSS style object for the SceneRenderer wrapper.
//
// All transforms are pure: same input → identical CSSProperties (key
// order included, for snapshot determinism).

import type { CSSProperties } from 'react';
import type { SceneMood } from '../compositions/episode1/types';

// ─── Mood vocabulary used by the color script ─────────────────────────────
//
// Independent of SceneMood (which is a structural validator tag) so the
// color script can be tuned without churning structural validators.
// `resolveMood` below maps the ViralScene SceneMood union into this set.
export type Mood =
  | 'peaceful'
  | 'tense'
  | 'climax'
  | 'triumph'
  | 'moral'
  | 'neutral';

export interface ColorBeat {
  /** Hex color of the warm/cool key light tint. */
  keyTintHex: string;
  /** Hex color of the bounce/fill tint. */
  fillTintHex: string;
  /** Exposure compensation in stops (EV). Range: [-1, +1]. */
  exposureEv: number;
  /** Saturation multiplier. Range: [0.5, 1.5]. */
  saturationMul: number;
  /** Direction of the key light in degrees. Range: [0, 360). */
  keyDirectionDeg: number;
}

// Defaults pinned by the M4.1 contract test. Adjust here only with a
// commit message that explains the visual rationale.
//
// M15 audit-v12 (Eggleston): saturation deltas widened (0.65..1.5) and
// exposure deltas widened (-0.6..+0.55) so the mood shift is *visibly*
// detectable on a phone screen even when the filter sits over stock
// backgrounds. Previous values (0.85..1.2 sat, -0.4..+0.3 EV) tested
// at <ΔE 18 — invisible to a 4-year-old. New values target ΔE ≥ 40%
// between adjacent moods (Eggleston's broadcast-cinematic threshold).
export const COLOR_SCRIPT_BY_MOOD: Record<Mood, ColorBeat> = {
  peaceful: {
    keyTintHex: '#FFE9C2',
    fillTintHex: '#9FB8CF',
    exposureEv: 0.05,
    saturationMul: 1.05,
    keyDirectionDeg: 45,
  },
  tense: {
    keyTintHex: '#A8C9DC',
    fillTintHex: '#9FB8CF',
    exposureEv: -0.6,
    saturationMul: 0.65,
    keyDirectionDeg: 135,
  },
  climax: {
    keyTintHex: '#FF9C3D',
    fillTintHex: '#FF6B9C',
    exposureEv: 0.5,
    saturationMul: 1.5,
    keyDirectionDeg: 20,
  },
  triumph: {
    keyTintHex: '#FFD580',
    fillTintHex: '#FFC2A0',
    exposureEv: 0.45,
    saturationMul: 1.4,
    keyDirectionDeg: 60,
  },
  moral: {
    keyTintHex: '#FFEFC9',
    fillTintHex: '#B6DCE5',
    exposureEv: 0.2,
    saturationMul: 1.15,
    keyDirectionDeg: 90,
  },
  neutral: {
    keyTintHex: '#FFFFFF',
    fillTintHex: '#CCCCCC',
    exposureEv: 0,
    saturationMul: 1.0,
    keyDirectionDeg: 45,
  },
};

// ─── Mood resolution from SceneMood ───────────────────────────────────────
//
// Existing scene tags like 'hook', 'tension', 'reveal', 'comedy' don't have
// 1:1 color identities; map them onto the closest color mood.
const SCENE_MOOD_TO_COLOR_MOOD: Record<SceneMood, Mood> = {
  hook: 'tense',
  tension: 'tense',
  climax: 'climax',
  peaceful: 'peaceful',
  comedy: 'triumph',
  reveal: 'climax',
  moral: 'moral',
};

export function resolveMood(sceneMood?: SceneMood | string): Mood {
  if (!sceneMood) return 'neutral';
  if ((SCENE_MOOD_TO_COLOR_MOOD as Record<string, Mood>)[sceneMood]) {
    return (SCENE_MOOD_TO_COLOR_MOOD as Record<string, Mood>)[sceneMood];
  }
  // Direct match against Mood (e.g. story-engine emits 'triumph' / 'tense').
  if (sceneMood in COLOR_SCRIPT_BY_MOOD) return sceneMood as Mood;
  return 'neutral';
}

// ─── Pure CSS mapping ─────────────────────────────────────────────────────
//
// Builds a deterministic CSS filter chain plus a CSS-variable map child
// SVGs can pick up via `var(--key-tint)` / `var(--fill-tint)` /
// `var(--key-dir)` to drive in-component lighting. The function
// guarantees stable key ordering so snapshot tests can compare the
// returned object structurally.

function evToBrightness(ev: number): number {
  // 1 EV = 2× linear brightness. Filter `brightness()` = 1 means unchanged.
  return Math.pow(2, ev);
}

function clampHueRotateDeg(angleDeg: number): number {
  // CSS hue-rotate is a circular value; normalize to [0, 360).
  const a = ((angleDeg % 360) + 360) % 360;
  return a;
}

export function applyColorBeat(beat: ColorBeat): CSSProperties {
  const brightness = evToBrightness(beat.exposureEv);
  const saturate = beat.saturationMul;
  const hueRotate = clampHueRotateDeg(beat.keyDirectionDeg / 4);

  // Insertion order is fixed for determinism. Tests pin Object.keys order.
  const style: CSSProperties & Record<string, string | number> = {
    filter:
      `brightness(${brightness.toFixed(4)}) ` +
      `saturate(${saturate.toFixed(4)}) ` +
      `hue-rotate(${hueRotate.toFixed(2)}deg)`,
    '--key-tint': beat.keyTintHex,
    '--fill-tint': beat.fillTintHex,
    '--key-dir': `${beat.keyDirectionDeg}deg`,
    '--exposure-ev': beat.exposureEv.toString(),
    '--saturation-mul': beat.saturationMul.toString(),
  };
  return style;
}
