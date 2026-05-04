// M12 audit-v10-debate (Astley): "The moral's wording changes every
// scene — 'दिमाग सबसे बड़ा,' 'अक्ल से,' 'अक्ल = ताकत' — preschoolers won't
// connect them; pick ONE phrase and repeat it verbatim." We pick
// "दिमाग सबसे बड़ा" (mind is biggest) as the canonical phrase.
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

const MORAL_PHRASE = 'दिमाग सबसे बड़ा';

function allDialogueText(): string[] {
  const out: string[] = [];
  for (const scene of LION_RABBIT_SCENES) {
    for (const line of scene.dialogue ?? []) {
      out.push((line as any).text ?? '');
      const overlay = (line as any).textOverlay;
      if (overlay) out.push(overlay);
    }
  }
  return out;
}

describe('M12 unified moral phrase (audit-v10-debate Astley)', () => {
  it('"दिमाग सबसे बड़ा" appears in at least 3 distinct scenes', () => {
    const scenesContaining = LION_RABBIT_SCENES.filter((scene) =>
      (scene.dialogue ?? []).some((line: any) =>
        ((line.text ?? '') + ' ' + (line.textOverlay ?? '')).includes(
          MORAL_PHRASE,
        ),
      ),
    );
    expect(scenesContaining.length).toBeGreaterThanOrEqual(3);
  });

  it('the unified phrase appears at least 4 times verbatim total', () => {
    const all = allDialogueText().join('\n');
    const occurrences = all.split(MORAL_PHRASE).length - 1;
    expect(occurrences).toBeGreaterThanOrEqual(4);
  });

  it('older variant "अक्ल = ताकत" no longer appears (replaced by unified phrase)', () => {
    const all = allDialogueText().join('\n');
    expect(all).not.toMatch(/अक्ल\s*=\s*ताकत/);
  });
});
