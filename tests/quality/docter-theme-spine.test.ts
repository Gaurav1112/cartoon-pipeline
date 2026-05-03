import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

// Pete Docter (Pixar): every scene must serve the theme spine.
// The Lion-Rabbit theme is "अक्ल / दिमाग beats बल / ताकत" —
// brain beats brawn. The script must:
//   1. State the thesis explicitly somewhere (moral scene).
//   2. Bookend hook ↔ loop-hook with the same opening word ("आज")
//      so the rewatcher recognizes the loop.
//   3. Never devolve into pure spectacle without a thesis-relevant line.
describe('Docter theme spine: brain beats brawn', () => {
  const allLines = LION_RABBIT_SCENES.flatMap((s) =>
    (s.dialogue ?? []).map((d) => ({ sceneId: s.id, ...d }))
  );

  it('thesis line exists with अक्ल OR दिमाग keyword', () => {
    const thesisHits = allLines.filter(
      (l) => l.text.includes('अक्ल') || l.text.includes('दिमाग')
    );
    expect(thesisHits.length).toBeGreaterThanOrEqual(2);
  });

  it('hook villain line starts with "आज" (bookend opener)', () => {
    const hook = LION_RABBIT_SCENES.find((s) => s.id === 'hook');
    const firstLine = (hook?.dialogue ?? [])[0];
    expect(firstLine).toBeDefined();
    expect(firstLine!.text.startsWith('आज')).toBe(true);
  });

  it('loop-hook villain line also starts with "आज" (closes the bookend)', () => {
    const loop = LION_RABBIT_SCENES.find((s) => s.id === 'loop-hook');
    const firstLine = (loop?.dialogue ?? [])[0];
    expect(firstLine).toBeDefined();
    expect(firstLine!.text.startsWith('आज')).toBe(true);
  });

  it('moral scene contains the explicit thesis statement', () => {
    const moral = LION_RABBIT_SCENES.find((s) => s.id === 'moral');
    const moralText = (moral?.dialogue ?? []).map((d) => d.text).join(' ');
    expect(/अक्ल|दिमाग/.test(moralText)).toBe(true);
  });
});
