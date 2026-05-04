import type { EmotionType } from '../types';

interface ProsodyParams {
  rate: string;   // e.g., "-15%" — edge-tts --rate flag
  pitch: string;  // e.g., "+2Hz" — edge-tts --pitch flag
  volume: string; // e.g., "+0%" — edge-tts --volume flag
}

/**
 * Kid-friendly prosody: ALL rates are NEGATIVE (slower than adult default).
 * Research: kids 4-10 need 120-140 WPM, TTS default is ~160 WPM.
 * Hindi with consonant clusters needs even more breathing room.
 * Excitement comes from pitch and volume, NOT speed.
 */
/**
 * M14 (kid-pace tighten): base rate slowed from -15% → -20% so every
 * 4-year-old can follow the dialogue. Fast emotions (angry/scared/surprised)
 * clamped at -15% so even the most heated lines stay parseable. Spread
 * tightened to ≤ 15pp so cadence feels predictable across the episode.
 *
 * Reference: Peppa Pig English ≈ 130 wpm; Chhota Bheem Hindi ≈ 140 wpm.
 */
const PROSODY_MAP: Record<EmotionType, ProsodyParams> = {
  neutral:    { rate: '-20%',  pitch: '+0Hz',   volume: '+0%' },
  happy:      { rate: '-17%',  pitch: '+2Hz',   volume: '+0%' },
  sad:        { rate: '-26%',  pitch: '-2Hz',   volume: '-5%' },
  angry:      { rate: '-15%',  pitch: '+3Hz',   volume: '+10%' },
  scared:     { rate: '-15%',  pitch: '+5Hz',   volume: '+0%' },
  surprised:  { rate: '-15%',  pitch: '+6Hz',   volume: '+5%' },
  thinking:   { rate: '-26%',  pitch: '+0Hz',   volume: '-5%' },
  determined: { rate: '-20%',  pitch: '-2Hz',   volume: '+5%' },
};

export function getSSMLProsody(emotion: EmotionType): ProsodyParams {
  return PROSODY_MAP[emotion];
}

export function wrapInSSML(text: string, emotion: EmotionType, voice: string): string {
  const p = PROSODY_MAP[emotion];
  // Extract language from voice name (e.g., "hi-IN-MadhurNeural" → "hi-IN")
  const langMatch = voice.match(/^([a-z]{2}-[A-Z]{2})/);
  const lang = langMatch ? langMatch[1] : 'en-US';

  return [
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">`,
    `  <voice name="${voice}">`,
    `    <prosody rate="${p.rate}" pitch="${p.pitch}" volume="${p.volume}">`,
    `      ${escapeXml(text)}`,
    '    </prosody>',
    '  </voice>',
    '</speak>',
  ].join('\n');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
