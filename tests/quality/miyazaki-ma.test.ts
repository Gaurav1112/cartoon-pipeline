import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

// Miyazaki: "ma" — the silence between sounds carries the meaning.
// After a thesis lands, give it air. Before the next line speaks,
// let the audience metabolize. We pin this with explicit postGapMs
// on the moral-card lines.
describe('Miyazaki "ma" (intentional silence on moral)', () => {
  const moralScene = LION_RABBIT_SCENES.find((s) => s.id === 'moral');

  it('moral scene exists', () => {
    expect(moralScene).toBeDefined();
  });

  it('at least one moral line has postGapMs >= 500ms', () => {
    const gaps = (moralScene!.dialogue ?? [])
      .map((d) => d.postGapMs ?? 0)
      .filter((g) => g >= 500);
    expect(gaps.length).toBeGreaterThanOrEqual(1);
  });

  it('moral thesis line ("दिमाग सबसे बड़ा है।") carries a postGap', () => {
    // search globally — the thesis lives in a different scene (slow-walk).
    const allLines = LION_RABBIT_SCENES.flatMap((s) => s.dialogue ?? []);
    const thesis = allLines.find((d) => d.text.includes('दिमाग सबसे बड़ा'));
    expect(thesis).toBeDefined();
    expect(thesis!.postGapMs ?? 0).toBeGreaterThanOrEqual(400);
  });
});
