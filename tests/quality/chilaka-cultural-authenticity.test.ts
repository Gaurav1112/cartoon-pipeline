// tests/quality/chilaka-cultural-authenticity.test.ts
//
// M4.5 — Rajiv Chilaka gap. Pure regression contract. Pin the
// existing cultural cues in Episode 1 so a future "harmless"
// dialogue rewrite can't strip the Indian-family identity out by
// accident. This test only asserts what's TRUE today; raise the bar
// in a separate commit, never lower it.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

function readSrc(rel: string): string {
  return readFileSync(resolve(__dirname, '../..', rel), 'utf8');
}

// Devanagari Unicode block: U+0900–U+097F.
const DEVANAGARI = /[\u0900-\u097F]/;
// Honorifics / address terms — Hindi/Devanagari and romanizations.
const HONORIFIC_PATTERNS: RegExp[] = [
  /गुरुजी/g,
  /जी/g,            // suffix honorific (शेर जी, etc.)
  /भाई/g,
  /दीदी/g,
  /अम्मा/g,
  /पिता/g,
  /-ji\b/g,
  /\bbhai\b/gi,
];

// Indian setting cues: village, forest, well, river, etc.
const SETTING_CUES: RegExp[] = [
  /जंगल/, /कुआं/, /कुएँ/, /कुएं/, /गाँव/, /गांव/, /नदी/, /खेत/, /मंदिर/,
];

describe('Chilaka — Indian-family cultural authenticity', () => {
  // Concatenate all dialogue + textOverlay strings across episode 1.
  const allText = LION_RABBIT_SCENES
    .flatMap((s) => s.dialogue.map((d) => `${d.text} ${d.textOverlay ?? ''}`))
    .join(' ');

  it('episode 1 contains at least 5 honorific terms across all scenes', () => {
    let count = 0;
    for (const re of HONORIFIC_PATTERNS) {
      const matches = allText.match(re);
      if (matches) count += matches.length;
    }
    // Currently 7 (गुरुजी×2 + जी×4 + भाई×1). Pin floor at 5.
    expect(count).toBeGreaterThanOrEqual(5);
  });

  it('at least one scene references a culturally Indian setting cue', () => {
    const hits = SETTING_CUES.some((re) => re.test(allText));
    expect(hits).toBe(true);
  });

  it('episode title contains at least one Devanagari word', () => {
    const intro = readSrc('src/compositions/IntroSequence.tsx');
    // SHOW_NAME hi entry — pin Devanagari presence.
    expect(intro).toMatch(DEVANAGARI);
    expect(intro).toMatch(/कथा/);
  });

  it('moral phrase contains at least one Devanagari word', () => {
    const ep1 = readSrc('src/compositions/Episode1.tsx');
    expect(ep1).toMatch(DEVANAGARI);
    // The MORAL_TEXT.hi entry must remain Devanagari (अक्ल / दिमाग).
    expect(ep1).toMatch(/अक्ल|दिमाग/);
  });

  it('is pure / deterministic (same data → same outcome)', () => {
    const text1 = LION_RABBIT_SCENES.flatMap((s) =>
      s.dialogue.map((d) => d.text),
    ).join(' ');
    const text2 = LION_RABBIT_SCENES.flatMap((s) =>
      s.dialogue.map((d) => d.text),
    ).join(' ');
    expect(text1).toBe(text2);
  });
});
