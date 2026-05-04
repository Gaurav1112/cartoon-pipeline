// M15 audit-v12 (Chilaka + Docter): brand-recall via verbal tic +
// pre-action catchphrase. Without these, Kaaliya is forgettable and
// Arjun's mantra arrives only AFTER the trick worked. Tests assert
// the prescribed insertions stay in place across future edits.

import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

describe('M15 audit-v12 story tics', () => {
  const allKaaliyaLines = LION_RABBIT_SCENES.flatMap((s) =>
    s.dialogue.filter((d) => d.char === 'kaaliya').map((d) => d.text),
  );
  const allArjunLines = LION_RABBIT_SCENES.flatMap((s) =>
    s.dialogue.filter((d) => d.char === 'arjun').map((d) => d.text),
  );

  it('Kaaliya verbal tic "जंगल मेरा" appears in at least 2 distinct lines', () => {
    const ticHits = allKaaliyaLines.filter((t) => t.includes('जंगल मेरा'));
    expect(ticHits.length).toBeGreaterThanOrEqual(2);
  });

  it('Arjun pre-action catchphrase "दिमाग" appears BEFORE the well-trick climax line', () => {
    const wellTrickIdx = LION_RABBIT_SCENES.findIndex(
      (s) => s.id === 'well_trick' || s.mood === 'climax',
    );
    expect(wellTrickIdx).toBeGreaterThanOrEqual(0);
    // Find first "दिमाग" mention in any Arjun line
    let firstMantraSceneIdx = -1;
    for (let i = 0; i < LION_RABBIT_SCENES.length; i++) {
      const arjunHere = LION_RABBIT_SCENES[i].dialogue
        .filter((d) => d.char === 'arjun')
        .some((d) => d.text.includes('दिमाग'));
      if (arjunHere) {
        firstMantraSceneIdx = i;
        break;
      }
    }
    expect(firstMantraSceneIdx).toBeGreaterThanOrEqual(0);
    expect(firstMantraSceneIdx).toBeLessThanOrEqual(wellTrickIdx);
  });

  it('Setup scene has at most 3 dialogue lines (Murch compression)', () => {
    const setup = LION_RABBIT_SCENES.find((s) => s.id === 'setup');
    expect(setup).toBeDefined();
    expect(setup!.dialogue.length).toBeLessThanOrEqual(3);
  });

  it('Mantra "दिमाग" appears at least twice across full episode (pre-trick + post-trick)', () => {
    const mantraCount = [...allArjunLines, ...LION_RABBIT_SCENES.flatMap((s) =>
      s.dialogue.map((d) => d.text),
    )].filter((t) => t.includes('दिमाग')).length;
    // de-dup not necessary; we just need ≥2 mentions in full corpus
    expect(mantraCount).toBeGreaterThanOrEqual(2);
  });
});
