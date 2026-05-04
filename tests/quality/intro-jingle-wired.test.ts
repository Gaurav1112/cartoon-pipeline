import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  INTRO_JINGLE_SFX_FILE,
  INTRO_JINGLE_VOLUME_DB,
  planIntroJingleLayer,
} from '../../src/audio/intro-jingle';

describe('intro jingle wiring (M9 — Peppa/Bheem branding moment)', () => {
  it('exposes the canonical intro jingle path under public/audio', () => {
    expect(INTRO_JINGLE_SFX_FILE).toBe('sfx/intro/jingle.mp3');
    const p = resolve(process.cwd(), 'public', 'audio', INTRO_JINGLE_SFX_FILE);
    expect(existsSync(p), `missing asset: ${p}`).toBe(true);
  });

  it('plans exactly one sfx layer at startMs=0 referencing the jingle', () => {
    const layers = planIntroJingleLayer();
    expect(layers).toHaveLength(1);
    expect(layers[0].type).toBe('sfx');
    expect(layers[0].startMs).toBe(0);
    expect(layers[0].filePath).toMatch(/sfx\/intro\/jingle\.mp3$/);
    expect(layers[0].volumeDb).toBe(INTRO_JINGLE_VOLUME_DB);
  });

  it('intro jingle does not duck during dialogue (it precedes dialogue)', () => {
    const [layer] = planIntroJingleLayer();
    expect(layer.duckDuringDialogue).toBe(false);
  });

  it('uses a deterministic, audible volume between -12 and -3 dB', () => {
    expect(INTRO_JINGLE_VOLUME_DB).toBeGreaterThanOrEqual(-12);
    expect(INTRO_JINGLE_VOLUME_DB).toBeLessThanOrEqual(-3);
  });
});
