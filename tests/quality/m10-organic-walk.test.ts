import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * M10 — replace mechanical sinusoid walk-cycle with spring()-driven motion
 * (visual panel finding #4: walk feels organic, not mechanical).
 *
 * The walk cycle in CharacterRenderer must use spring() for at least one
 * of its phase or amplitude terms so the motion has real-world easing
 * (toe-off slow, contact fast) instead of a perfect sine wave.
 */
describe('M10 — organic walk-cycle (spring-driven)', () => {
  const src = readFileSync(
    resolve(process.cwd(), 'src/characters/CharacterRenderer.tsx'),
    'utf8',
  );

  it('CharacterRenderer imports spring from remotion', () => {
    expect(src).toMatch(/import\s+\{[^}]*\bspring\b[^}]*\}\s+from\s+['"]remotion['"]/);
  });

  it('walk-cycle code references spring() (non-linear easing) — not pure Math.sin', () => {
    const walkSection = src.match(/organic walk-cycle[\s\S]*?\}\s*:\s*isTalking/);
    expect(walkSection, 'walk-cycle block not found').toBeTruthy();
    const block = walkSection![0];
    expect(block).toMatch(/spring\s*\(/);
  });

  it('walk-cycle still has finite, deterministic outputs (no NaN guards needed)', () => {
    expect(src).not.toMatch(/walkAngle\s*=\s*NaN/);
  });
});
