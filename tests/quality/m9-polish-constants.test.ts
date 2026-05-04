import { describe, it, expect } from 'vitest';
import { EMOTION_BLEND_FRAMES } from '../../src/compositions/episode1/timing.ts';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('M9 polish constants — animation smoothness + audio mix breath', () => {
  it('EMOTION_BLEND_FRAMES is at least 10 (kills pose-snap jank between dialogue lines)', () => {
    expect(EMOTION_BLEND_FRAMES).toBeGreaterThanOrEqual(10);
  });

  it('audio-mixer sidechaincompress uses ratio 2 (soft duck so music breathes under VO)', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/audio/audio-mixer.ts'),
      'utf8',
    );
    expect(src).toMatch(/sidechaincompress=threshold=\$\{[^}]+\}:ratio=2:/);
    expect(src).not.toMatch(/sidechaincompress=[^[]*:ratio=8:/);
  });
});
