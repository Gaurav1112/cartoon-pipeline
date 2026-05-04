// M11 audit-v10 (Walter Murch / craft panel #10): "After the well-trick
// payoff, give the audience 600ms to breathe. Comedy needs the beat."
// The guruji line "शेर कुएँ में कूद गया!" carries heroMomentScore=1.0;
// pin postGapMs:500 so the laugh and SFX land before catharsis cuts in.
// (500ms keeps us within the 4950-frame YouTube cap; defaults to 200.)
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { calcEpisodeDuration } from '../../src/compositions/episode1/timing';

describe('M11 hero-moment silence (audit-v10 Murch)', () => {
  it('well-trick payoff line has postGapMs >= 500', () => {
    const wellTrick = LION_RABBIT_SCENES.find((s) => s.id === 'well-trick');
    expect(wellTrick).toBeDefined();
    const heroLine = wellTrick!.dialogue.find(
      (d: any) => d.heroMomentScore === 1.0,
    );
    expect(heroLine).toBeDefined();
    expect((heroLine as any).postGapMs).toBeGreaterThanOrEqual(500);
  });

  it('episode total still fits the 165s YouTube cap', () => {
    expect(calcEpisodeDuration(LION_RABBIT_SCENES)).toBeLessThanOrEqual(4950);
  });
});
