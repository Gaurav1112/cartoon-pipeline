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
      // M17 (audit-v13): kid-friendly pace. English is native to Piper's
      // Amy voice and only needs a small slowdown for clarity.
      return { modelBasename: 'en_US-amy-medium', lengthScale: 1.10 };
    case 'hi':
      return {
        modelBasename: isFemale(characterId)
          ? 'hi_IN-priyamvada-medium'
          : 'hi_IN-pratham-medium',
        // M17: Hindi Piper TTS is naturally fast; kids 4-10 need 1.15x for
        // comprehension. Pinned by m17-kid-friendly-pace.test.ts.
        lengthScale: 1.15,
      };
    case 'te':
      return {
        modelBasename: isFemale(characterId)
          ? 'te_IN-maya-medium'
          : 'te_IN-venkatesh-medium',
        lengthScale: 1.15,
      };
    default:
      return undefined;
  }
}
