import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Tartakovsky impact-frame contract: smear must trigger on zoom_punch +
// shake interrupts, must be deterministic (no Math.random), must be
// bounded to 2 frames so it reads as "lightning of motion".

describe('MotionSmear (Tartakovsky)', () => {
  const src = readFileSync(
    resolve(__dirname, '..', '..', 'src', 'compositions', 'effects', 'MotionSmear.tsx'),
    'utf8',
  );

  it('exists as a rendered effect component', () => {
    expect(src).toMatch(/export const MotionSmear/);
  });

  it('is bounded to a 2-frame window (no longer than impact)', () => {
    expect(src).toMatch(/local < 0 \|\| local > 1/);
  });

  it('uses screen-blend mode for additive flash', () => {
    expect(src).toMatch(/mixBlendMode:\s*'screen'/);
  });

  it('contains no Math.random (determinism)', () => {
    // Strip comments before checking — comment can mention "no Math.random".
    const stripped = src.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(stripped).not.toMatch(/Math\.random/);
  });

  it('is wired into SceneRenderer for zoom_punch + shake', () => {
    const sceneSrc = readFileSync(
      resolve(__dirname, '..', '..', 'src', 'compositions', 'episode1', 'SceneRenderer.tsx'),
      'utf8',
    );
    expect(sceneSrc).toMatch(/import.*MotionSmear/);
    expect(sceneSrc).toMatch(/zoom_punch.*shake|shake.*zoom_punch/);
    expect(sceneSrc).toMatch(/<MotionSmear/);
  });
});
