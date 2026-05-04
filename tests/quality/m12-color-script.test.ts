// M12 audit-v10-debate (Eggleston/Miyazaki/Deakins): "78s of orange-
// orange-orange-purple is not a color script — it's wallpaper." The
// color-script infra (src/color/color-script.ts) was already in place
// keyed off `scene.mood`, but only 2 of 11 scenes declared a mood —
// the other 9 fell back to 'neutral' so the palette never evolved.
// Fix: set a mood on every scene so the existing system actually
// drives palette evolution. Hook=hook (warm), tension=tension (cool),
// climax=climax (cool-saturated), peaceful=peaceful (warm-soft),
// moral=moral (golden).
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { resolveMood, COLOR_SCRIPT_BY_MOOD } from '../../src/color/color-script';

describe('M12 color script (audit-v10-debate Eggleston)', () => {
  it('every scene declares a mood — no fallback to neutral', () => {
    for (const scene of LION_RABBIT_SCENES) {
      expect(scene.mood, `scene ${scene.id} missing mood`).toBeDefined();
    }
  });

  it('episode 1 palette evolves: hook scene resolves warm, tension/climax cool, victory/moral warm-golden', () => {
    const byId = (id: string) => LION_RABBIT_SCENES.find((s) => s.id === id)!;
    // The mood→color mapping: hook is warm-leaning, tension is cool,
    // climax sits in cool-saturated territory, peaceful warm-soft.
    expect(resolveMood(byId('hook').mood)).not.toBe('neutral');
    const wellTrickMood = resolveMood(byId('well-trick').mood);
    expect(['climax', 'tense']).toContain(wellTrickMood);
    expect(resolveMood(byId('victory').mood)).not.toBe('neutral');
  });

  it('at least 3 distinct color-script moods are used across the episode (palette evolution)', () => {
    const colorMoods = new Set(
      LION_RABBIT_SCENES.map((s) => resolveMood(s.mood)),
    );
    colorMoods.delete('neutral');
    expect(colorMoods.size).toBeGreaterThanOrEqual(3);
  });

  it('color-script ColorBeat for each scene has a non-default tint (not all #FFE9C2 orange)', () => {
    const tints = new Set(
      LION_RABBIT_SCENES.map(
        (s) => COLOR_SCRIPT_BY_MOOD[resolveMood(s.mood)].keyTintHex,
      ),
    );
    expect(tints.size).toBeGreaterThanOrEqual(3);
  });
});

