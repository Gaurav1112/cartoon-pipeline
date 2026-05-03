import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { selectShortsScenes, SHORTS_MAX_FRAMES } from '../../src/compositions/ShortsEpisode';
import { calcDialogueDur, calcSceneDur } from '../../src/compositions/episode1/timing';

// MrBeast retention contract — pinned hard so future edits cannot regress
// the four levers that drive YT-Shorts / TikTok / IG-Reels CTR & completion.

describe('viral retention contracts', () => {
  it('Shorts selection always ≤ 60s (1800 frames)', () => {
    const { totalFrames } = selectShortsScenes(LION_RABBIT_SCENES);
    expect(totalFrames).toBeLessThanOrEqual(SHORTS_MAX_FRAMES);
    expect(totalFrames).toBeGreaterThan(0);
  });

  it('Shorts selection includes the hook AND a payoff/victory beat', () => {
    const { scenes } = selectShortsScenes(LION_RABBIT_SCENES);
    const ids = scenes.map((s) => s.id);
    expect(ids[0]).toBe('hook');
    // Either well-trick (the trick payoff) or victory (the win) must remain
    // — without the payoff, retention collapses.
    expect(ids.some((id) => id === 'well-trick' || id === 'victory')).toBe(true);
  });

  it('opening hook line ≤ 90 frames (TikTok 3s sweet spot)', () => {
    const hook = LION_RABBIT_SCENES.find((s) => s.id === 'hook');
    expect(hook).toBeDefined();
    const first = hook!.dialogue[0];
    const dur = first.dur === 'auto' ? calcDialogueDur(first.text) : first.dur;
    expect(dur).toBeLessThanOrEqual(90);
  });

  it('no scene runs > 240 frames without a patternInterrupt (MrBeast 8-second rule)', () => {
    for (const scene of LION_RABBIT_SCENES) {
      let runFrames = 0;
      let interruptSeen = false;
      const lineDurs: number[] = [];
      for (const line of scene.dialogue) {
        const d = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
        lineDurs.push(d);
        runFrames += d;
        if (line.patternInterrupt) {
          interruptSeen = true;
          runFrames = 0;
        }
      }
      // Allow scenes <=240 to have no interrupt; only flag scenes that go
      // longer than 240 with NONE.
      const total = calcSceneDur(scene.dialogue);
      if (total > 240 && !interruptSeen) {
        throw new Error(
          `Scene "${scene.id}" runs ${total} frames with no patternInterrupt — adds retention cliff.`,
        );
      }
      expect(
        runFrames,
        `Scene "${scene.id}" trailing run after last interrupt = ${runFrames} fr (>240)`,
      ).toBeLessThanOrEqual(240);
    }
  });

  it('hook scene first dialogue carries a thumbnail-grade textOverlay (emoji + ≥5 chars)', () => {
    const hook = LION_RABBIT_SCENES.find((s) => s.id === 'hook')!;
    const first = hook.dialogue[0];
    expect(first.textOverlay).toBeDefined();
    expect(first.textOverlay!.length).toBeGreaterThanOrEqual(5);
    // Must contain at least one emoji codepoint (rough check: >0x1F300).
    const hasEmoji = [...first.textOverlay!].some((ch) => (ch.codePointAt(0) ?? 0) > 0x1f300);
    expect(hasEmoji).toBe(true);
  });
});
