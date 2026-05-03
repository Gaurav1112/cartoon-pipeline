import type { SupportedLanguage, CharacterId } from '../types';
import type { DialogueLine, DialogueBank, DialogueQuery, DialogueSelection } from './types';
import { HINDI_BANK } from './hindi';
import { TELUGU_BANK } from './telugu';
import { TAMIL_BANK } from './tamil';
import { KANNADA_BANK } from './kannada';
import { MARATHI_BANK } from './marathi';
import { BENGALI_BANK } from './bengali';
import { ENGLISH_BANK } from './english';

// ─── Deterministic PRNG ───────────────────────────────────────────────────
// Single source of truth: src/utils/seeded-rng.ts.
import { mulberry32 } from '../utils/seeded-rng';

// ─── Banks ────────────────────────────────────────────────────────────────

const BANKS: Record<SupportedLanguage, DialogueBank> = {
  hi: HINDI_BANK,
  te: TELUGU_BANK,
  ta: TAMIL_BANK,
  kn: KANNADA_BANK,
  mr: MARATHI_BANK,
  bn: BENGALI_BANK,
  en: ENGLISH_BANK,
};

export function getDialogueBank(language: SupportedLanguage): DialogueBank {
  return BANKS[language];
}

// ─── Filtering ────────────────────────────────────────────────────────────

function filterLines(lines: DialogueLine[], query: DialogueQuery): DialogueLine[] {
  let filtered = lines.filter(
    (l) => l.character === query.character && l.context === query.context,
  );

  if (query.emotion && filtered.length > 3) {
    const emotionFiltered = filtered.filter((l) => l.emotion === query.emotion);
    if (emotionFiltered.length > 0) filtered = emotionFiltered;
  }

  if (query.tags && query.tags.length > 0 && filtered.length > 3) {
    const tagFiltered = filtered.filter((l) =>
      query.tags!.some((t) => l.tags.includes(t)),
    );
    if (tagFiltered.length > 0) filtered = tagFiltered;
  }

  return filtered;
}

// ─── Selection ────────────────────────────────────────────────────────────

export function selectDialogue(
  query: DialogueQuery,
  language: SupportedLanguage,
  seed: number,
): DialogueSelection {
  const bank = BANKS[language];
  const matches = filterLines(bank.lines, query);

  if (matches.length === 0) {
    // Fallback: any line from this character
    const fallback = bank.lines.filter((l) => l.character === query.character);
    const rng = mulberry32(seed);
    const idx = Math.floor(rng() * fallback.length);
    return {
      line: fallback[idx] ?? bank.lines[0],
      alternatives: fallback.slice(0, 3),
    };
  }

  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * matches.length);
  const selected = matches[idx];
  const alternatives = matches.filter((_, i) => i !== idx).slice(0, 3);

  return { line: selected, alternatives };
}

export function selectDialogueSequence(
  queries: DialogueQuery[],
  language: SupportedLanguage,
  seed: number,
): DialogueLine[] {
  const rng = mulberry32(seed);
  const usedIds = new Set<string>();

  return queries.map((query) => {
    const bank = BANKS[language];
    let matches = filterLines(bank.lines, query);

    // Avoid repeating same line in a sequence
    const fresh = matches.filter((m) => !usedIds.has(m.id));
    if (fresh.length > 0) matches = fresh;

    const idx = Math.floor(rng() * matches.length);
    const selected = matches[idx] ?? bank.lines.filter(l => l.character === query.character)[0] ?? bank.lines[0];
    usedIds.add(selected.id);
    return selected;
  });
}
