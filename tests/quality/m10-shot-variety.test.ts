import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import type { CameraType } from '../../src/compositions/episode1/types';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('M10 — close-up shot + camera variety (visual panel finding #5)', () => {
  it('CameraType union includes close_up and wide', () => {
    const typesSrc = readFileSync(
      resolve(process.cwd(), 'src/compositions/episode1/types.ts'),
      'utf8',
    );
    expect(typesSrc).toMatch(/'close_up'/);
    expect(typesSrc).toMatch(/'wide'/);
  });

  it('SceneRenderer handles close_up and wide cases', () => {
    const rendererSrc = readFileSync(
      resolve(process.cwd(), 'src/compositions/episode1/SceneRenderer.tsx'),
      'utf8',
    );
    expect(rendererSrc).toMatch(/case 'close_up'/);
    expect(rendererSrc).toMatch(/case 'wide'/);
  });

  it('episode uses at least one close_up shot (hook or payoff)', () => {
    const cams = LION_RABBIT_SCENES.map((s) => s.cam as CameraType);
    expect(cams).toContain('close_up');
  });

  it('episode has shot variety: at least 4 distinct camera types in use', () => {
    const distinct = new Set(LION_RABBIT_SCENES.map((s) => s.cam));
    expect(distinct.size).toBeGreaterThanOrEqual(4);
  });
});
