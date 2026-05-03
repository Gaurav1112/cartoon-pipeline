// Per-character ElevenLabs voice IDs.
//
// Multilingual v2 model handles all 7 supported languages with the SAME voice ID,
// preserving character identity across language tracks. This is the premium
// alternative to edge-tts's per-language voice swap (which loses identity).
//
// Voice IDs are public ElevenLabs library voices (free tier accessible).
// Each character gets a voice that fits their archetype:

import type { CharacterId } from '../types';

interface ElevenLabsVoiceProfile {
  voiceId: string;
  name: string;       // human-readable, for logs
  archetype: string;  // why this voice fits this character
}

export const ELEVENLABS_VOICE_BY_CHARACTER: Record<CharacterId, ElevenLabsVoiceProfile> = {
  // Wise old guru — warm storyteller
  guruji: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    archetype: 'warm captivating storyteller, middle-aged male',
  },
  // Heroic young protagonist — confident, energetic
  arjun: {
    voiceId: 'IKne3meq5aSn9XLyUdCD',
    name: 'Charlie',
    archetype: 'deep confident energetic young male',
  },
  // Chubby kid sidekick — playful, bright
  bablu: {
    voiceId: 'TX3LPaxmHKxFdv7VOQHJ',
    name: 'Liam',
    archetype: 'energetic young male, social-media youthful',
  },
  // Smart girl — bright, engaged
  meera: {
    voiceId: 'cgSgspJ2msm6clMCkdW9',
    name: 'Jessica',
    archetype: 'playful bright warm young female',
  },
  // Mother figure — reassuring
  amma: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    archetype: 'mature reassuring confident female',
  },
  // Villain — dominant, firm
  kaaliya: {
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    archetype: 'dominant firm middle-aged male',
  },
  // Royal — wise mature balance
  raja: {
    voiceId: 'pqHfZKP75CvOlQylNhV4',
    name: 'Bill',
    archetype: 'wise mature balanced old male',
  },
  // Dog companion (rare speech, mostly bark SFX) — husky character voice
  moti: {
    voiceId: 'N2lVS1w4EtoT3dr4eOWO',
    name: 'Callum',
    archetype: 'husky trickster character voice',
  },
};

// Per-emotion voice setting overrides — small variations only, to keep
// character identity stable while allowing emotional range.
export const EMOTION_VOICE_OVERRIDES: Record<string, { stability?: number; style?: number }> = {
  happy:      { stability: 0.50, style: 0.45 },
  sad:        { stability: 0.65, style: 0.30 },
  angry:      { stability: 0.40, style: 0.60 },
  surprised:  { stability: 0.45, style: 0.55 },
  scared:     { stability: 0.50, style: 0.50 },
  determined: { stability: 0.55, style: 0.50 },
  thinking:   { stability: 0.65, style: 0.25 },
  neutral:    { stability: 0.55, style: 0.35 },
};

export function getElevenLabsVoice(characterId: CharacterId): ElevenLabsVoiceProfile {
  const v = ELEVENLABS_VOICE_BY_CHARACTER[characterId];
  if (!v) {
    // Unknown character → safe fallback to George (storyteller).
    return ELEVENLABS_VOICE_BY_CHARACTER.guruji;
  }
  return v;
}
