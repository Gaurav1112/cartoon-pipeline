import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

// Murch beat coverage + Docter foreshadow tension.
// Group 4 + Group 2 audits flagged: postGapMs only on 2 lines (1.67% of
// dialogue) and no explicit brain-vs-brawn doubt before payoff.
describe('Murch beat coverage + Docter foreshadow', () => {
  const allLines = LION_RABBIT_SCENES.flatMap((s) =>
    (s.dialogue ?? []).map((d) => ({ sceneId: s.id, ...d }))
  );

  it('hook villain line carries a postGap (let the threat land)', () => {
    const hook = LION_RABBIT_SCENES.find((s) => s.id === 'hook')!;
    const villain = hook.dialogue![0];
    expect(villain.postGapMs ?? 0).toBeGreaterThanOrEqual(200);
  });

  it('volunteer scene heroic line carries a postGap', () => {
    const vol = LION_RABBIT_SCENES.find((s) => s.id === 'volunteer')!;
    const arjunLine = vol.dialogue!.find((d) => d.text.includes('मैं जाऊँगा'));
    expect(arjunLine).toBeDefined();
    expect(arjunLine!.postGapMs ?? 0).toBeGreaterThanOrEqual(250);
  });

  it('at least 5 distinct lines carry an explicit postGapMs (systematic, not sparse)', () => {
    const withGap = allLines.filter((l) => typeof l.postGapMs === 'number');
    expect(withGap.length).toBeGreaterThanOrEqual(5);
  });

  it('Docter foreshadow: setup-side scene names brawn as inadequate before payoff', () => {
    // "ताकत से तो हम जीत नहीं सकते" — explicit brain-over-brawn tension
    // before Arjun's volunteer/thesis lines land.
    const foreshadow = allLines.find(
      (l) =>
        l.text.includes('ताकत') &&
        (l.text.includes('नहीं') || l.text.includes('काम'))
    );
    expect(foreshadow, 'no explicit brain-vs-brawn doubt line found before payoff').toBeDefined();
  });

  it('foreshadow appears BEFORE the moral thesis (chronologically correct)', () => {
    const foreshadowIdx = LION_RABBIT_SCENES.findIndex((s) =>
      (s.dialogue ?? []).some((d) => d.text.includes('ताकत') && d.text.includes('नहीं'))
    );
    const moralIdx = LION_RABBIT_SCENES.findIndex((s) => s.id === 'moral');
    expect(foreshadowIdx).toBeGreaterThanOrEqual(0);
    expect(moralIdx).toBeGreaterThan(foreshadowIdx);
  });
});
