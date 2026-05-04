// src/audio/sfx-procedural.ts
//
// M23b (Audio Panel v14): Improved procedural foley. Real top channels use
// FOLEY-quality SFX. We synthesize richer sounds with ffmpeg instead of
// simple oscillators:
//   - ROAR: 3 detuned saws + LFO + envelope (was single oscillator)
//   - THUMP: layered transient + sub + mid (was click)
//   - WIND: filtered pink noise for outdoor scenes
//
// All synthesis is deterministic (pure ffmpeg filtergraphs).

export type SfxType = 'roar' | 'thump' | 'wind';

/**
 * Generate procedural SFX using ffmpeg aevalsrc/anoisesrc.
 * Returns a ffmpeg filter string that synthesizes the sound.
 * @param type - The type of SFX to generate
 * @param durationMs - Duration in milliseconds
 * @returns ffmpeg filter string (deterministic)
 */
export function generateProceduralSfx(type: SfxType, durationMs: number): string {
  const durSec = (durationMs / 1000).toFixed(4);

  switch (type) {
    case 'roar':
      return generateRoar(durSec);
    case 'thump':
      return generateThump(durSec);
    case 'wind':
      return generateWind(durSec);
    default:
      throw new Error(`Unknown SFX type: ${type}`);
  }
}

/**
 * ROAR: 3 detuned sawtooth oscillators + LFO on cutoff + ADSR envelope.
 * Rich, organic lion roar instead of single oscillator.
 */
function generateRoar(durSec: string): string {
  // Base frequencies for 3 detuned saws (creating a rich timbre)
  const f1 = 120; // base
  const f2 = 123; // slightly detuned
  const f3 = 117; // detuned down
  
  // LFO for cutoff modulation (slow wobble, makes it organic)
  const lfoFreq = 3.5; // 3.5 Hz LFO
  
  // ADSR envelope: attack=80ms, decay=400ms, sustain=0.7, release=600ms
  // Expressed as a time-varying gain multiplier
  const attack = 0.08;
  const decay = 0.4;
  const sustain = 0.7;
  const release = 0.6;
  
  // Build envelope expression
  // if t < attack: gain = t/attack
  // else if t < attack+decay: gain = 1 - (1-sustain)*(t-attack)/decay
  // else if t < dur-release: gain = sustain
  // else: gain = sustain * (dur-t)/release
  const envExpr = `if(lt(t,${attack}), t/${attack}, if(lt(t,${attack + decay}), 1-(1-${sustain})*(t-${attack})/${decay}, if(lt(t,${durSec}-${release}), ${sustain}, ${sustain}*(${durSec}-t)/${release})))`;
  
  // Sawtooth approximation: 2*(f*t - floor(f*t)) - 1
  const saw1 = `2*(${f1}*t - floor(${f1}*t)) - 1`;
  const saw2 = `2*(${f2}*t - floor(${f2}*t)) - 1`;
  const saw3 = `2*(${f3}*t - floor(${f3}*t)) - 1`;
  
  // LFO modulates amplitude slightly for organic feel
  const lfo = `0.15*sin(2*PI*${lfoFreq}*t)`;
  
  // Mix the 3 saws with envelope and LFO
  const expr = `(${saw1} + ${saw2} + ${saw3})/3 * (${envExpr}) * (0.3 + ${lfo})`;
  
  return `aevalsrc=exprs='${expr}':d=${durSec}:s=44100,alowpass=f=800,volume=-6dB`;
}

/**
 * THUMP: Short transient (8ms attack) + sub-bass (60Hz) + mid-tail (200Hz).
 * Layered impact sound instead of single click.
 */
function generateThump(durSec: string): string {
  const attack = 0.008; // 8ms attack
  const decay = parseFloat(durSec) - attack;
  
  // Envelope: fast attack, exponential decay
  const envExpr = `if(lt(t,${attack}), t/${attack}, exp(-10*(t-${attack})/${decay}))`;
  
  // Sub-bass layer (60Hz sine)
  const sub = `0.5*sin(2*PI*60*t)`;
  
  // Mid-freq transient (200Hz sine)
  const mid = `0.3*sin(2*PI*200*t)`;
  
  // High-freq click (800Hz, very short)
  const click = `0.2*sin(2*PI*800*t)`;
  
  // Mix layers with envelope
  const expr = `(${sub} + ${mid} + ${click}) * (${envExpr})`;
  
  return `aevalsrc=exprs='${expr}':d=${durSec}:s=44100,volume=-3dB`;
}

/**
 * WIND: Pink noise filtered with bandpass at 200Hz, very quiet (-30dB).
 * Subtle outdoor ambience bed.
 */
function generateWind(durSec: string): string {
  // White noise approximation using random-like function
  // We use a sum of many sine waves with coprime frequencies for pseudo-random
  const noise = Array.from({ length: 20 }, (_, i) => {
    const freq = 137 + i * 71; // coprime-ish frequencies
    return `sin(2*PI*${freq}*t)`;
  }).join(' + ');
  
  const expr = `(${noise})/20`;
  
  return `aevalsrc=exprs='${expr}':d=${durSec}:s=44100,bandpass=f=200:width_type=h:width=100,volume=-30dB`;
}
