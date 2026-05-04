// tests/quality/m14-render-episode1.test.ts
//
// M14 RED tests: production renderEpisode pipeline must render the
// hand-crafted Episode1 composition (162.3s, all M12/M13 work), not the
// generic CartoonEpisode (~78s engine stub).
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { buildLionRabbitEpisode } from '../../src/pipeline/lion-rabbit-episode';

describe('M14: render pipeline targets Episode1 (the real Lion-Rabbit)', () => {
  const renderEpisodeSrc = fs.readFileSync(
    path.join(__dirname, '../../src/pipeline/render-episode.ts'),
    'utf-8',
  );

  it('passes the "Episode1" composition id (not "CartoonEpisode") to remotion render', () => {
    const remotionRenderArgs = renderEpisodeSrc.match(/'remotion',\s*'render'[^]*?\]/);
    expect(remotionRenderArgs, 'remotion render arg block must exist').toBeTruthy();
    const args = remotionRenderArgs![0];
    expect(args).toContain("'Episode1'");
    expect(args).not.toContain("'CartoonEpisode'");
  });

  it('uses buildLionRabbitEpisode (not generateFullEpisode) for the audio data', () => {
    expect(renderEpisodeSrc).toContain('buildLionRabbitEpisode');
  });

  it('builds a CartoonEpisode-shaped object with the full 162.3s frame count', () => {
    const ep = buildLionRabbitEpisode();
    // 11 hand-crafted scenes
    expect(ep.scenes.length).toBe(11);
    // 162.3s = 4869 frames at 30 fps
    expect(ep.totalDurationFrames).toBeGreaterThanOrEqual(4800);
    expect(ep.totalDurationFrames).toBeLessThanOrEqual(4950);
  });

  it('preserves Hindi dialogue text from the hand-crafted scenes', () => {
    const ep = buildLionRabbitEpisode();
    const allText = ep.scenes.flatMap((s) => s.dialogue.map((l) => l.text)).join(' ');
    // canonical M12 unified moral phrase
    expect(allText).toContain('दिमाग सबसे बड़ा');
    // hook line
    expect(allText).toContain('आज तुम मेरा खाना हो');
  });

  it('declares both Kaaliya (villain lion) and Arjun (hero rabbit) as characters', () => {
    const ep = buildLionRabbitEpisode();
    expect(ep.characters).toContain('kaaliya');
    expect(ep.characters).toContain('arjun');
  });
});
