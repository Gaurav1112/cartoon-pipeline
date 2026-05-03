import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

// Kubrick / classical Hollywood: dialogue scenes with two or more
// speakers cannot be a monologue dressed up as a conversation.
// Each named speaker present in `chars` should have a voice if
// they're scripted to be on screen for >1 line; and within any
// 2+ speaker scene, no single character may dominate >3 consecutive lines
// (= shot-reverse-shot grammar).
describe('Kubrick shot-reverse-shot grammar', () => {
  for (const scene of LION_RABBIT_SCENES) {
    const dialogue = scene.dialogue ?? [];
    if (dialogue.length < 2) continue;

    const speakers = new Set(dialogue.map((d) => d.char));
    if (speakers.size < 2) continue;

    it(`scene "${scene.id}": no character monopolizes >3 consecutive lines`, () => {
      let runChar: string | null = null;
      let run = 0;
      let maxRun = 0;
      for (const d of dialogue) {
        if (d.char === runChar) run += 1;
        else {
          runChar = d.char;
          run = 1;
        }
        if (run > maxRun) maxRun = run;
      }
      expect(maxRun, `scene ${scene.id} has a ${maxRun}-line monologue`).toBeLessThanOrEqual(3);
    });

    it(`scene "${scene.id}": every character listed in chars[] who appears in dialogue speaks at least once`, () => {
      // Conservative: only check that any speaker mentioned in dialogue
      // also exists in chars[]. (Reverse direction is too strict — silent
      // listeners are valid blocking.)
      const charIds = new Set((scene.chars ?? []).map((c) => c.id));
      for (const d of dialogue) {
        expect(charIds.has(d.char), `scene ${scene.id}: speaker ${d.char} not in chars[]`).toBe(true);
      }
    });
  }
});
