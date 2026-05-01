import type { SupportedLanguage, CharacterId } from '../types';

interface VoiceEntry {
  male: string;
  female: string;
}

const EDGE_TTS_VOICES: Record<SupportedLanguage, VoiceEntry> = {
  hi: { male: 'hi-IN-MadhurNeural', female: 'hi-IN-SwaraNeural' },
  te: { male: 'te-IN-MohanNeural', female: 'te-IN-ShrutiNeural' },
  ta: { male: 'ta-IN-ValluvarNeural', female: 'ta-IN-PallaviNeural' },
  kn: { male: 'kn-IN-GaganNeural', female: 'kn-IN-SapnaNeural' },
  mr: { male: 'mr-IN-ManoharNeural', female: 'mr-IN-AarohiNeural' },
  bn: { male: 'bn-IN-BashkarNeural', female: 'bn-IN-TanishaaNeural' },
  en: { male: 'en-IN-PrabhatNeural', female: 'en-IN-NeerjaNeural' },
};

const FEMALE_CHARACTERS: CharacterId[] = ['meera', 'amma'];

export function getBaseVoice(characterId: CharacterId, language: SupportedLanguage): string {
  const voices = EDGE_TTS_VOICES[language];
  return FEMALE_CHARACTERS.includes(characterId) ? voices.female : voices.male;
}

export function getAllVoices(): Record<SupportedLanguage, VoiceEntry> {
  return EDGE_TTS_VOICES;
}
