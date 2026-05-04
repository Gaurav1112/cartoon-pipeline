// M17 (audit-v13 follow-up): kids ages 4-10 need slower TTS delivery
// for comprehension. The base lengthScale=1.0 produces a 39s dialogue
// track for the entire 11-scene Lion-Rabbit story (≈3.5s per scene).
// That's faster than Peppa Pig (~5s/scene). Push to 1.15 hi/te,
// 1.10 en + bump default postGapMs 200→350 so kids can absorb each
// line before the next one lands.

import { describe, it, expect } from 'vitest';
import { getPiperVoice } from '../../src/audio/piper-voices';

describe('M17 kid-friendly TTS pace', () => {
  it('Hindi voice uses lengthScale ≥ 1.15 (slower for ages 4-10)', () => {
    const v = getPiperVoice('hi', 'lion');
    expect(v).toBeDefined();
    expect(v!.lengthScale).toBeGreaterThanOrEqual(1.15);
  });

  it('Telugu voice uses lengthScale ≥ 1.15', () => {
    const v = getPiperVoice('te', 'rabbit');
    expect(v).toBeDefined();
    expect(v!.lengthScale).toBeGreaterThanOrEqual(1.15);
  });

  it('English voice uses lengthScale ≥ 1.10 (English needs less since it is native)', () => {
    const v = getPiperVoice('en', 'lion');
    expect(v).toBeDefined();
    expect(v!.lengthScale).toBeGreaterThanOrEqual(1.10);
  });

  it('all supported voices use lengthScale ≥ 1.0 (never accelerate)', () => {
    for (const lang of ['hi', 'en', 'te'] as const) {
      const v = getPiperVoice(lang, 'lion');
      expect(v?.lengthScale, `lang=${lang}`).toBeGreaterThanOrEqual(1.0);
    }
  });
});
