import type { CharacterId, EmotionType, VoiceProfile } from '../types';

// M11 audit-v10 (Andrea Romano): "Vibrato on every line makes every
// character sound nervous." Restrict to emotions where a tremor is
// genuinely motivated — fear, rage, shock. Neutral / happy / thinking
// lines play flat so dialogue reads as confident, not anxious.
const VIBRATO_EMOTIONS: ReadonlySet<EmotionType> = new Set<EmotionType>([
  'scared',
  'angry',
  'surprised',
]);

/**
 * Voice profiles tuned for kid-friendly cartoon voices.
 *
 * Changes from v1 (based on Audio Expert review):
 * - Bablu: pitch +5→+3, speed 1.3→1.1 (was chipmunk at 1.68x effective)
 * - Guruji: speed 0.85→0.88, volume 0.75→0.80 (was too slow & quiet)
 * - Kaaliya: pitch -4→-5, speed 0.9→0.93 (deeper villain, fixed reverb)
 * - Amma: volume 0.70→0.82 (was inaudible)
 * - Raja: pitch 0→-1, volume 0.85→0.87 (needs authority)
 * - Moti: pitch +4→+6, speed 1.2→1.15 (more distinctly animal)
 * - Arjun: pitch +3→+4 (needs more child quality)
 */
const VOICE_PROFILES: Record<CharacterId, VoiceProfile> = {
  arjun:  { pitchShift: 4,  speedFactor: 1.05, eqProfile: 'none',   volume: 0.85 },
  meera:  { pitchShift: 1,  speedFactor: 1.0,  eqProfile: 'none',   volume: 0.82 },
  bablu:  { pitchShift: 3,  speedFactor: 1.1,  eqProfile: 'nasal',  volume: 0.88 },
  guruji: { pitchShift: -3, speedFactor: 0.88, eqProfile: 'warm',   volume: 0.80 },
  kaaliya:{ pitchShift: -5, speedFactor: 0.93, eqProfile: 'reverb', volume: 0.85 },
  amma:   { pitchShift: -2, speedFactor: 0.92, eqProfile: 'warm',   volume: 0.82 },
  raja:   { pitchShift: -1, speedFactor: 0.95, eqProfile: 'none',   volume: 0.87 },
  moti:   { pitchShift: 6,  speedFactor: 1.15, eqProfile: 'nasal',  volume: 0.80 },
};

export function getVoiceProfile(characterId: CharacterId): VoiceProfile {
  return VOICE_PROFILES[characterId];
}

/**
 * Build an ffmpeg filter chain for voice transformation.
 *
 * CRITICAL FIX: asetrate changes BOTH pitch AND speed. We compensate
 * for the unwanted speed change before applying the desired speed.
 *
 * Math: asetrate_factor = 2^(pitchShift/12)
 *       asetrate speeds up by asetrate_factor
 *       corrected_atempo = desired_speed / asetrate_factor
 */
export function buildFfmpegFilter(
  profile: VoiceProfile,
  emotion?: EmotionType,
): string {
  const filters: string[] = [];
  const SAMPLE_RATE = 44100;

  // Step 1: Pitch shift via asetrate + aresample
  let pitchFactor = 1.0;
  if (profile.pitchShift !== 0) {
    pitchFactor = Math.pow(2, profile.pitchShift / 12);
    const newRate = Math.round(SAMPLE_RATE * pitchFactor);
    filters.push(`asetrate=${newRate}`);
    filters.push(`aresample=${SAMPLE_RATE}`);
  }

  // Step 2: Speed = compensate for asetrate's speed change + apply desired speed
  // asetrate already changed speed by pitchFactor, so:
  //   corrected = desiredSpeed / pitchFactor
  const correctedSpeed = profile.speedFactor / pitchFactor;

  if (Math.abs(correctedSpeed - 1.0) > 0.001) {
    let speed = correctedSpeed;
    while (speed > 2.0) {
      filters.push('atempo=2.0');
      speed /= 2.0;
    }
    while (speed < 0.5) {
      filters.push('atempo=0.5');
      speed *= 2.0;
    }
    filters.push(`atempo=${speed.toFixed(4)}`);
  }

  // Step 3: Highpass to remove rumble
  filters.push('highpass=f=100:poles=2');

  // Step 4: EQ profiles
  switch (profile.eqProfile) {
    case 'nasal':
      filters.push('equalizer=f=1500:t=q:w=1.0:g=8');
      filters.push('equalizer=f=2500:t=q:w=1.5:g=5');
      filters.push('equalizer=f=500:t=q:w=1.0:g=-3');
      break;
    case 'warm':
      filters.push('equalizer=f=300:t=q:w=1.5:g=5');
      filters.push('equalizer=f=200:t=q:w=1.0:g=3');
      filters.push('equalizer=f=5000:t=q:w=2.0:g=-3');
      break;
    case 'reverb':
      filters.push('equalizer=f=300:t=q:w=1.5:g=3');
      filters.push('equalizer=f=6500:t=q:w=2.0:g=3');
      filters.push('aecho=0.8:0.85:80|120:0.3|0.15');
      break;
    case 'none':
      break;
  }

  // Step 5: Compressor for cartoon punch
  filters.push('acompressor=threshold=-20dB:ratio=4:attack=5:release=50:makeup=3dB');

  // Step 6: Vibrato — gated by emotion (M11 audit-v10 Romano).
  // Only fear/rage/shock get the tremor; everything else stays flat.
  if (emotion && VIBRATO_EMOTIONS.has(emotion)) {
    filters.push('vibrato=f=5:d=0.1');
  }

  // Step 7: Volume
  if (profile.volume !== 1.0) {
    filters.push(`volume=${profile.volume.toFixed(2)}`);
  }

  return filters.join(',');
}
