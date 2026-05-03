import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { calcEpisodeDuration } from '../../src/compositions/episode1/timing';

// Pete Docter (Pixar) catharsis gap (M3.2): a story that jumps from the
// climax payoff straight to celebration robs the audience of the
// "exhausted-relieved breath" — the beat where survivors register that
// they actually made it. Without it, the moral feels grafted on. Add
// ONE quiet scene between well-trick and victory: 1 line, mood
// 'peaceful', long postGap. Audience exhales here.
describe('Docter catharsis beat (M3.2) — regroup between climax and moral', () => {
  const wellIdx = LION_RABBIT_SCENES.findIndex((s) => s.id === 'well-trick');
  const moralIdx = LION_RABBIT_SCENES.findIndex((s) => s.id === 'moral');

  it('well-trick and moral scenes both exist and are correctly ordered', () => {
    expect(wellIdx).toBeGreaterThanOrEqual(0);
    expect(moralIdx).toBeGreaterThan(wellIdx);
  });

  it('a peaceful single-line catharsis scene exists between climax and moral', () => {
    const between = LION_RABBIT_SCENES.slice(wellIdx + 1, moralIdx);
    const catharsis = between.find(
      (s) => s.mood === 'peaceful' && s.dialogue.length === 1,
    );
    expect(catharsis, 'no peaceful single-line scene between well-trick and moral').toBeDefined();
  });

  it('catharsis line uses a long postGap (≥ 500 ms — the breath)', () => {
    const between = LION_RABBIT_SCENES.slice(wellIdx + 1, moralIdx);
    const catharsis = between.find(
      (s) => s.mood === 'peaceful' && s.dialogue.length === 1,
    )!;
    const line = catharsis.dialogue[0];
    expect(line.postGapMs).toBeDefined();
    expect(line.postGapMs!).toBeGreaterThanOrEqual(500);
  });

  it('total episode duration still respects the 4950-frame cap', () => {
    expect(calcEpisodeDuration(LION_RABBIT_SCENES)).toBeLessThanOrEqual(4950);
  });
});
