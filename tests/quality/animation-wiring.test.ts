import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Phase L review — corrected after harsh review caught two visual regressions:
// (1) tailDamping wrapped in `frame % N` re-triggers a decay envelope every
//     N frames, producing visible 2-second twitch.
// (2) Both moti tail + arjun scarf shared the same period → lock-step.
//
// Correct shipping policy:
// - Tail/scarf use CONTINUOUS sinusoids with PER-CHARACTER coprime-ish
//   frequencies (organic, no twitch, no lock-step).
// - tailDamping + anticipationCrouch remain in animation-life.ts as pure
//   primitives, gated behind future pose-change-tracking infra. They are
//   NOT imported into the renderer — that prevents accidental re-wiring.
describe('Animation life: shipping wiring (Keane + Lasseter, harsh-review-corrected)', () => {
  const renderer = readFileSync(
    resolve(__dirname, '../../src/characters/CharacterRenderer.tsx'),
    'utf8'
  );
  const motiPath =
    renderer.match(/Moti tail[\s\S]*?<\/path>\s*\)\;?\s*\}\)\(\)\}/) ??
    renderer.match(/Moti tail[\s\S]*?\/>\s*\)\;?\s*\}\)\(\)\}/);
  const arjunPath =
    renderer.match(/Arjun scarf[\s\S]*?<\/path>\s*\)\;?\s*\}\)\(\)\}/) ??
    renderer.match(/Arjun scarf[\s\S]*?\/>\s*\)\;?\s*\}\)\(\)\}/);

  it('moti tail block found', () => {
    expect(motiPath, 'moti tail JSX block not located').not.toBeNull();
  });

  it('arjun scarf block found', () => {
    expect(arjunPath, 'arjun scarf JSX block not located').not.toBeNull();
  });

  it('moti tail uses a SECONDARY harmonic (not single sin) — organic motion', () => {
    const block = motiPath![0];
    // Count Math.sin calls in the moti tail block — must be ≥2 (primary + harmonic).
    const sinCount = (block.match(/Math\.sin/g) ?? []).length;
    expect(sinCount).toBeGreaterThanOrEqual(2);
  });

  it('arjun scarf uses a SECONDARY harmonic too', () => {
    const block = arjunPath![0];
    const sinCount = (block.match(/Math\.sin/g) ?? []).length;
    expect(sinCount).toBeGreaterThanOrEqual(2);
  });

  it('moti and arjun frequencies are DISTINCT (no lock-step)', () => {
    // Pull the leading frequency multipliers — moti uses 0.092, arjun 0.057.
    // The point: NEITHER frequency may equal the other.
    const motiBlock = motiPath![0];
    const arjunBlock = arjunPath![0];
    const motiFreqs = [...motiBlock.matchAll(/frame\s*\*\s*([0-9.]+)/g)].map((m) => m[1]);
    const arjunFreqs = [...arjunBlock.matchAll(/frame\s*\*\s*([0-9.]+)/g)].map((m) => m[1]);
    expect(motiFreqs.length, 'moti has no frame-driven frequencies').toBeGreaterThan(0);
    expect(arjunFreqs.length, 'arjun has no frame-driven frequencies').toBeGreaterThan(0);
    for (const m of motiFreqs) {
      for (const a of arjunFreqs) {
        expect(m, `moti freq ${m} == arjun freq ${a} (lock-step risk)`).not.toBe(a);
      }
    }
  });

  it('does NOT import tailDamping or anticipationCrouch (avoid wrong wiring)', () => {
    // These primitives need real pose-change tracking. Importing them
    // signals readiness; we are NOT ready, so the import line must omit them.
    const importLine = renderer.match(/import\s+\{([^}]*)\}\s+from\s+'\.\/animation-life'/);
    expect(importLine, 'animation-life import not found').not.toBeNull();
    const imports = importLine![1];
    expect(imports).not.toMatch(/\btailDamping\b/);
    expect(imports).not.toMatch(/\banticipationCrouch\b/);
  });

  it('still imports landingSquash + eyeDart (these have no state need)', () => {
    expect(renderer).toMatch(/import\s+\{[^}]*landingSquash[^}]*\}\s+from\s+'\.\/animation-life'/);
    expect(renderer).toMatch(/import\s+\{[^}]*eyeDart[^}]*\}\s+from\s+'\.\/animation-life'/);
  });

  it('uses asymmetric L/R pupil drift in render (Keane: never stereo-locked)', () => {
    expect(renderer).toMatch(/pupilDriftXL/);
    expect(renderer).toMatch(/pupilDriftXR/);
  });

  it('squashY multiplies into transform but antiScale does NOT (anticipation gated)', () => {
    expect(renderer).toMatch(/squashY/);
    expect(renderer).not.toMatch(/antiScale/);
  });
});
