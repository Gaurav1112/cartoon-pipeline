import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  calcShortsDuration, SHORTS_FPS, SHORTS_WIDTH, SHORTS_HEIGHT, SHORTS_MAX_FRAMES,
  selectShortsScenes,
} from '../../src/compositions/ShortsEpisode';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { CHARACTERS } from '../../src/story/characters';
import { LANGUAGES } from '../../src/types';
import { pickTeaser } from '../../src/compositions/OutroSequence';

const ROOT = path.resolve(__dirname, '../..');

describe('monetization compliance', () => {
  it('Shorts composition is strictly ≤60 seconds (1800 frames @ 30fps)', () => {
    expect(SHORTS_FPS).toBe(30);
    expect(SHORTS_WIDTH).toBe(1080);
    expect(SHORTS_HEIGHT).toBe(1920);
    expect(SHORTS_MAX_FRAMES).toBe(60 * 30);
    const dur = calcShortsDuration();
    expect(dur).toBeLessThanOrEqual(SHORTS_MAX_FRAMES);
    expect(dur).toBeGreaterThan(0);
  });

  it('Shorts selects only flagged scenes from the source episode', () => {
    const { scenes } = selectShortsScenes(LION_RABBIT_SCENES);
    expect(scenes.length).toBeGreaterThan(0);
    for (const s of scenes) expect(s.shortsCutScene).toBe(true);
  });

  it('every character has a catchphrase for every supported language', () => {
    for (const id of Object.keys(CHARACTERS)) {
      const c = CHARACTERS[id as keyof typeof CHARACTERS];
      expect(c.catchphrase, `${id} missing catchphrase`).toBeTruthy();
      for (const lang of LANGUAGES) {
        expect(c.catchphrase?.[lang], `${id} missing ${lang} catchphrase`).toBeTruthy();
      }
    }
  });

  it('teaser pick is deterministic per (language, episode) pair', () => {
    expect(pickTeaser('hi', 1)).toBe(pickTeaser('hi', 1));
    expect(pickTeaser('en', 5)).toBe(pickTeaser('en', 5));
  });

  it('all referenced background music files exist on disk', () => {
    const required = [
      'happy_playful', 'sad_gentle', 'tense_suspense', 'mysterious_ambient',
      'heroic_triumphant', 'peaceful_calm', 'scary_dark', 'comedic_fun',
      'romantic_warm', 'epic_grand',
    ];
    for (const f of required) {
      const p = path.join(ROOT, 'public/audio/music', `${f}.mp3`);
      expect(fs.existsSync(p), `missing music: ${f}.mp3`).toBe(true);
      expect(fs.statSync(p).size).toBeGreaterThan(1000);
    }
  });

  it('audio LICENSE.md exists and lists every music file', () => {
    const license = fs.readFileSync(path.join(ROOT, 'public/audio/LICENSE.md'), 'utf-8');
    expect(license.length).toBeGreaterThan(200);
    const required = [
      'happy_playful', 'sad_gentle', 'tense_suspense', 'mysterious_ambient',
      'heroic_triumphant', 'peaceful_calm', 'scary_dark', 'comedic_fun',
      'romantic_warm', 'epic_grand',
    ];
    for (const f of required) {
      expect(license, `LICENSE.md missing entry for ${f}`).toContain(f);
    }
    expect(license).toMatch(/CC0|Public Domain/);
  });

  it('episode renderer uses high-quality flags (PNG + CRF 18 + bt709 + yuv420p)', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'src/pipeline/render-episode.ts'), 'utf-8',
    );
    expect(src).toContain("'png'");
    expect(src).toContain("'--crf'");
    expect(src).toMatch(/'18'/);
    expect(src).toContain('bt709');
    expect(src).toContain('yuv420p');
    expect(src).not.toMatch(/'jpeg'/);
  });
});
