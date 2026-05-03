// src/audio/character-motifs.ts
//
// M4.3 — Hans Zimmer gap. $0-procedural per-character leitmotif
// stingers. Each motif is a short, distinct interval set in semitones
// from C4; ffmpeg `aevalsrc` synthesizes the sine/triangle tones at
// render time so we never ship binary stingers.
//
// One motif per character per episode max. Scheduled ~400 ms before
// the character's first line so it reads as anticipation, not echo.
// Volume is -22 dB — under the dialogue bed, like a thumbprint.

import type { CharacterId } from '../types';

export interface Motif {
  /** Semitone offsets from C4 (MIDI 60). +12 = octave up. */
  intervals: number[];
  /** Per-note durations in milliseconds, same length as intervals. */
  durationsMs: number[];
  waveform: 'sine' | 'triangle';
}

// ─── Per-character leitmotifs ─────────────────────────────────────────────
//
// Distinct interval sets per character (no two share intervals[]). Each
// motif is 3–6 notes. Designed to be subliminal yet recognizable on
// repeat episodes.
export const MOTIF_BY_CHARACTER: Record<CharacterId, Motif> = {
  // Loyal dog: triumphant fourth, all even — confident, bouncy.
  moti: {
    intervals: [0, 4, 7, 12], // C4 E4 G4 C5
    durationsMs: [200, 200, 200, 200],
    waveform: 'sine',
  },
  // Hero boy: rising fifth into a held landing — "step up" feel.
  arjun: {
    intervals: [-5, 0, 4], // G3 C4 E4
    durationsMs: [250, 200, 300],
    waveform: 'triangle',
  },
  // Timid: low, falling minor — hesitation.
  bablu: {
    intervals: [-3, -3, -5], // A3 A3 G3
    durationsMs: [150, 150, 150],
    waveform: 'sine',
  },
  // Villain: tritone "diabolus in musica" — F#3 C3 F#3.
  kaaliya: {
    intervals: [-6, -12, -6], // F#3 C3 F#3
    durationsMs: [300, 400, 200],
    waveform: 'sine',
  },
  // Smart girl: open second + rising third — curious.
  meera: {
    intervals: [0, 2, 5], // C4 D4 F4
    durationsMs: [180, 220, 280],
    waveform: 'triangle',
  },
  // King: regal stepwise major — broad announcement.
  raja: {
    intervals: [0, 7, 11, 12], // C4 G4 B4 C5
    durationsMs: [250, 250, 200, 350],
    waveform: 'triangle',
  },
  // Wise elder: low, slow, settled — descending warm tone.
  guruji: {
    intervals: [-7, -3, 0], // F3 A3 C4
    durationsMs: [320, 280, 360],
    waveform: 'sine',
  },
  // Mother: lullaby-shaped descending sixth/third — comforting.
  amma: {
    intervals: [9, 5, 0], // A4 F4 C4
    durationsMs: [220, 220, 320],
    waveform: 'sine',
  },
};

// ─── Pitch math ───────────────────────────────────────────────────────────

/** MIDI note number for C4 in our convention. 261.63 Hz baseline. */
const C4_MIDI = 60;
const C4_HZ = 261.6256;

function semitonesToHz(semis: number): number {
  return C4_HZ * Math.pow(2, semis / 12);
}

// ─── ffmpeg filter builder ────────────────────────────────────────────────
//
// Returns an `aevalsrc=...` filter chain that synthesizes the motif at
// `startMs` on a silent bed and ends after the motif's total duration.
// Volume baked into the filter at -22 dB (≈ 0.0794 linear).
//
// Pure: same characterId + startMs → same string.

const MOTIF_GAIN_DB = -22;
const MOTIF_GAIN_LINEAR = Math.pow(10, MOTIF_GAIN_DB / 20);

function evalForWaveform(
  freqHz: number,
  waveform: 'sine' | 'triangle',
  gain: number,
): string {
  // ffmpeg aevalsrc time variable is `t`. Build a tone as a function of t.
  // sin(2π·f·t) for sine; triangle synthesized with arcsin(sin(...)) for
  // a clean, non-band-limited shape (good enough for sub-audible stingers).
  const w = `2*PI*${freqHz.toFixed(4)}*t`;
  if (waveform === 'sine') {
    return `(${gain.toFixed(6)}*sin(${w}))`;
  }
  // 2/π · arcsin(sin(2πft)) ≈ triangle wave normalized to [-1, 1]
  return `(${gain.toFixed(6)}*(2/PI)*asin(sin(${w})))`;
}

export function buildMotifFfmpegFilter(
  characterId: CharacterId,
  startMs: number,
): string {
  const motif = MOTIF_BY_CHARACTER[characterId];
  const totalDurMs = motif.durationsMs.reduce((s, d) => s + d, 0);
  const totalDurS = totalDurMs / 1000;
  const startS = Math.max(0, startMs) / 1000;

  // Build a per-note expression with `between(t-start, n0, n1)` gating.
  let elapsed = 0;
  const noteExprs: string[] = [];
  for (let i = 0; i < motif.intervals.length; i++) {
    const noteStart = elapsed / 1000;
    const noteEnd = (elapsed + motif.durationsMs[i]) / 1000;
    const freq = semitonesToHz(motif.intervals[i]);
    const tone = evalForWaveform(freq, motif.waveform, MOTIF_GAIN_LINEAR);
    // Gate the tone with `between(t, noteStart, noteEnd)`.
    noteExprs.push(
      `between(t,${noteStart.toFixed(4)},${noteEnd.toFixed(4)})*${tone}`,
    );
    elapsed += motif.durationsMs[i];
  }

  // The whole motif is silenced before startMs; aevalsrc duration matches
  // motif length. Use `adelay` to position on the master timeline at startMs.
  // Encode startMs explicitly in the filter string for traceability and
  // determinism (and because the test contract pins it).
  const sumExpr = noteExprs.join('+');
  const aev = `aevalsrc=exprs='${sumExpr}':d=${totalDurS.toFixed(4)}`;
  // Use adelay if startMs > 0 so callers can splice motifs at offsets.
  const delayMs = Math.round(startS * 1000);
  const delay =
    delayMs > 0
      ? `,adelay=${delayMs}|${delayMs}`
      : '';
  // Tag the filter with a comment-like trailer so traces include startMs.
  return `${aev}${delay}[motif_${characterId}_${delayMs}]`;
}

void C4_MIDI; // exported for future use; kept for documentation.
