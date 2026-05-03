import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { CHARACTERS } from '../../src/story/characters';

// Chilaka anchor: every recurring character should "say their thing"
// at least once per episode in the source language (Hindi). That's how
// kids learn a character — Pikachu / "Khaana!" / "Bazinga".

describe('catchphrase deployment (Chilaka)', () => {
  // Chars that appear in the lion-rabbit episode dialogue.
  const speakingChars = new Set<string>();
  for (const scene of LION_RABBIT_SCENES) {
    for (const line of scene.dialogue) speakingChars.add(line.char);
  }

  it('every speaking character with a Hindi catchphrase deploys it (≥1 line ≥80% match)', () => {
    const allText = LION_RABBIT_SCENES.flatMap((s) =>
      s.dialogue.map((d) => d.text),
    ).join(' \n ');
    const failures: string[] = [];
    for (const charId of speakingChars) {
      const ch = CHARACTERS[charId as keyof typeof CHARACTERS];
      if (!ch?.catchphrase?.hi) continue;
      const phrase = ch.catchphrase.hi;
      // Strip terminal punctuation and check substring match — "है।" vs "है!"
      // should both count.
      const stripped = phrase.replace(/[।!?.\s]+$/u, '').trim();
      if (!allText.includes(stripped)) {
        failures.push(`${charId}: expected "${stripped}" in episode`);
      }
    }
    if (failures.length) {
      throw new Error(
        `Catchphrases missing — ${failures.join('; ')}.\n` +
          `Add the phrase (or trivial variant) to at least one dialogue line.`,
      );
    }
  });
});
