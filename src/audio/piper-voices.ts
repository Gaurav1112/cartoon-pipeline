// Piper voice mapping per (language, characterId).
//
// Piper covers en, hi, te. ta/bn/mr/gu are NOT in the piper voice set yet —
// they fall back to edge-tts (Microsoft's Indian Azure voices, which are
// actually decent for those languages).
//
// Per-character distinctness within a language comes from gender split
// (male/female piper voice) PLUS the existing transformVoice() pitch/speed/EQ
// pass which runs downstream on every line.

import type { CharacterId } from '../types/cartoon-types.js';

const FEMALE_CHARACTERS: ReadonlySet<string> = new Set(['meera', 'amma']);

function isFemale(characterId?: CharacterId): boolean {
  if (!characterId) return false;
  return FEMALE_CHARACTERS.has(characterId);
}

export interface PiperVoiceChoice {
  modelBasename: string;
  lengthScale: number;
}

const PIPER_LANGS: ReadonlySet<string> = new Set(['en', 'hi', 'te']);

export function piperSupports(language: string): boolean {
  return PIPER_LANGS.has(language);
}

export function getPiperVoice(
  language: string,
  characterId?: CharacterId,
): PiperVoiceChoice | undefined {
  switch (language) {
    case 'en':
      // M17/M18: kid-friendly pace. EN Amy is already paced for kids;
      // 1.05 slows just enough for clarity without robotic stretching.
      return { modelBasename: 'en_US-amy-medium', lengthScale: 1.05 };
    case 'hi':
      return {
        modelBasename: isFemale(characterId)
          ? 'hi_IN-priyamvada-medium'
          : 'hi_IN-pratham-medium',
        // M18: 1.15 sounded robotic / over-stretched (Piper Hindi has
        // limited prosody — too much stretch reveals the artefacts).
        // 1.05 + 400ms inter-line gaps gives kid-friendly pace WITHOUT
        // the "robotic" complaint. Pinned by m17/m18 tests.
        lengthScale: 1.05,
      };
    case 'te':
      return {
        modelBasename: isFemale(characterId)
          ? 'te_IN-maya-medium'
          : 'te_IN-venkatesh-medium',
        lengthScale: 1.05,
      };
    default:
      return undefined;
  }
}
