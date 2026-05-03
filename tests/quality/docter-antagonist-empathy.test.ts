import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

// Pete Docter empathic-arc gap (M3.3): the antagonist must register the
// defeat on-screen before disappearing. Kaaliya falling into the well
// without a single beat of "what just happened?!" robs the audience of
// the empathic acknowledgement Docter calls "the look of recognition".
//
// Contract:
//   - The well-trick scene contains a final Kaaliya line.
//   - That line carries a defeat-recognition emotion.
//   - It is the LAST line of the scene — defeat has no rebuttal.
describe('Docter antagonist empathy (M3.3) — Kaaliya defeat recognition', () => {
  const wellTrick = LION_RABBIT_SCENES.find((s) => s.id === 'well-trick');

  it('well-trick scene exists', () => {
    expect(wellTrick).toBeDefined();
  });

  it('contains a Kaaliya line with a defeat-recognition emotion', () => {
    const defeatEmotions = new Set(['surprised', 'sad', 'scared']);
    const kaaliyaLines = wellTrick!.dialogue.filter((l) => l.char === 'kaaliya');
    expect(kaaliyaLines.length).toBeGreaterThan(0);
    const hasDefeat = kaaliyaLines.some(
      (l) => l.emotion !== undefined && defeatEmotions.has(l.emotion),
    );
    expect(hasDefeat).toBe(true);
  });

  it('the defeat line is the LAST line of the scene (no rebuttal)', () => {
    const last = wellTrick!.dialogue[wellTrick!.dialogue.length - 1];
    expect(last.char).toBe('kaaliya');
    expect(['surprised', 'sad', 'scared']).toContain(last.emotion);
  });
});
