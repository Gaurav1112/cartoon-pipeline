// M5.5 — Title card Devanagari (and Indic) font-weight pin.
//
// The title card / IntroSequence renders the show name in 7 scripts.
// Without explicit font weight + family pin, browsers/Remotion
// substitute Latin-fallback fonts that mis-render Indic conjuncts
// (e.g. "कथा कीड़ा" rendering with broken half-forms in Hindi).
//
// This contract:
//   1. \`TITLE_FONT_BY_LANG\` exposes a deterministic per-language
//      { fontFamily, fontWeight } pin used by IntroSequence.
//   2. Every Indic script has a Noto Sans <Script> fallback in the
//      family stack.
//   3. Every weight is 700 (bold) so the title card reads on the
//      orange/gold gradient even at low YouTube bitrates.
//   4. The Indic fonts are loaded via @remotion/google-fonts at
//      module import time — verified by a static source grep.

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  TITLE_FONT_BY_LANG,
  TITLE_INDIC_LANGS,
} from '../../src/compositions/IntroSequence';
import type { SupportedLanguage } from '../../src/types';

const ALL_LANGS: SupportedLanguage[] = ['hi', 'te', 'ta', 'kn', 'mr', 'bn', 'en'];

const SCRIPT_FONT_BY_LANG: Record<SupportedLanguage, RegExp> = {
  hi: /Noto Sans Devanagari/,
  mr: /Noto Sans Devanagari/,
  ta: /Noto Sans Tamil/,
  te: /Noto Sans Telugu/,
  kn: /Noto Sans Kannada/,
  bn: /Noto Sans Bengali/,
  en: /Noto Sans|Baloo 2/,
};

describe('M5.5 — title card Indic font-weight pin', () => {
  it('exposes a font pin for every supported language', () => {
    for (const lang of ALL_LANGS) {
      const cfg = TITLE_FONT_BY_LANG[lang];
      expect(cfg, `no title font for ${lang}`).toBeDefined();
      expect(typeof cfg.fontFamily).toBe('string');
      expect(cfg.fontFamily.length).toBeGreaterThan(0);
    }
  });

  it('every language pins fontWeight = 700 (bold)', () => {
    for (const lang of ALL_LANGS) {
      expect(TITLE_FONT_BY_LANG[lang].fontWeight).toBe(700);
    }
  });

  it('every Indic language references its Noto Sans script family', () => {
    for (const lang of TITLE_INDIC_LANGS) {
      const cfg = TITLE_FONT_BY_LANG[lang];
      expect(cfg.fontFamily, `${lang} family stack`).toMatch(SCRIPT_FONT_BY_LANG[lang]);
    }
  });

  it('TITLE_INDIC_LANGS covers all 6 Indic scripts in the channel', () => {
    expect([...TITLE_INDIC_LANGS].sort()).toEqual(
      ['hi', 'mr', 'ta', 'te', 'kn', 'bn'].sort(),
    );
  });

  it('IntroSequence loads Indic fonts via @remotion/google-fonts at import', () => {
    // Static guard: changing the font loader is a deliberate act and
    // should be visible in the diff. We grep for the loadFont calls.
    const src = fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'src', 'compositions', 'IntroSequence.tsx'),
      'utf8',
    );
    expect(src).toMatch(/@remotion\/google-fonts\/NotoSansDevanagari/);
    expect(src).toMatch(/@remotion\/google-fonts\/NotoSansTamil/);
    expect(src).toMatch(/@remotion\/google-fonts\/NotoSansTelugu/);
    expect(src).toMatch(/@remotion\/google-fonts\/NotoSansKannada/);
    expect(src).toMatch(/@remotion\/google-fonts\/NotoSansBengali/);
    // loadFont (or an alias from `loadFont as ...`) must be invoked so
    // the fonts are actually fetched, not just type-imported.
    expect(src).toMatch(/loadFont\b/);
    expect(src).toMatch(/weights:\s*\['700'\]/);
  });

  it('IntroSequence h1 references TITLE_FONT_BY_LANG for fontFamily + fontWeight', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'src', 'compositions', 'IntroSequence.tsx'),
      'utf8',
    );
    // The h1 style must read the per-language pin (no hardcoded family).
    expect(src).toMatch(/TITLE_FONT_BY_LANG\[\s*language\s*\]/);
  });
});
