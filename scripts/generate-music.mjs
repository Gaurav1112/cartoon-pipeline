#!/usr/bin/env node
// Procedural music generator — deterministic, $0, no external assets.
// Replaces silent placeholders with Indian-classical-flavored ambient beds:
//   • Tanpura drone (Sa + Sa·2 + Pa octave) — the eternal Indian music bed.
//   • Bansuri-like melody (lowpass-filtered sine cycling raga notes).
//   • Tabla rhythm (band-passed noise pulses on BPM grid).
//
// Per-mood raga selection follows Indian classical mood-time tradition.
// Output: 10 × 30s WAV files in public/audio/music/.
// We use WAV (pcm_s16le) instead of MP3 because libmp3lame's psymodel
// asserts on certain pure-tone synthesis signals (ffmpeg 8.1 bug) — WAV
// avoids this entirely and the master mux re-encodes to AAC anyway.
//
// Determinism: every formula is pure math; no Math.random; same input ⇒
// same bytes out. Re-runs are skipped if file exists with correct size.

import { execFileSync } from 'node:child_process';
import { existsSync, statSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'public', 'audio', 'music');
mkdirSync(OUT_DIR, { recursive: true });

// Sa (tonic) base = 220 Hz (A3) — comfortable bansuri register.
const SA = 220;
// Raga note ratios relative to Sa (12-TET approximations of shruti).
const NOTES = {
  S: 1.0,
  r: Math.pow(2, 1 / 12), // komal Re
  R: Math.pow(2, 2 / 12),
  g: Math.pow(2, 3 / 12), // komal Ga
  G: Math.pow(2, 4 / 12),
  M: Math.pow(2, 5 / 12),
  'M+': Math.pow(2, 6 / 12), // tivra Ma
  P: Math.pow(2, 7 / 12),
  d: Math.pow(2, 8 / 12), // komal Dha
  D: Math.pow(2, 9 / 12),
  n: Math.pow(2, 10 / 12), // komal Ni
  N: Math.pow(2, 11 / 12),
  'S^': 2.0, // upper Sa
};

// Raga ascent patterns (aaroh) per traditional mood-time.
const RAGAS = {
  yaman: ['S', 'R', 'G', 'M+', 'P', 'D', 'N', 'S^'], // joy, evening
  bhairavi: ['S', 'r', 'g', 'M', 'P', 'd', 'n', 'S^'], // melancholy, morning
  bhairav: ['S', 'r', 'G', 'M', 'P', 'd', 'N', 'S^'], // solemn power, dawn
  malkauns: ['S', 'g', 'M', 'd', 'n', 'S^'], // deep mystery, midnight
  marwa: ['S', 'r', 'G', 'M+', 'D', 'N', 'S^'], // unsettled, sunset
  khamaj: ['S', 'R', 'G', 'M', 'P', 'D', 'n', 'S^'], // love, late evening
};

// Mood configuration — raga + tempo + dynamics.
const MOODS = {
  happy_playful: { raga: 'yaman', bpm: 120, droneVol: 0.18, melodyVol: 0.22, tablaVol: 0.20 },
  sad_gentle: { raga: 'bhairavi', bpm: 72, droneVol: 0.22, melodyVol: 0.18, tablaVol: 0.0 },
  tense_suspense: { raga: 'marwa', bpm: 90, droneVol: 0.20, melodyVol: 0.15, tablaVol: 0.10 },
  mysterious_ambient: { raga: 'malkauns', bpm: 80, droneVol: 0.24, melodyVol: 0.16, tablaVol: 0.06 },
  heroic_triumphant: { raga: 'bhairav', bpm: 110, droneVol: 0.18, melodyVol: 0.22, tablaVol: 0.24 },
  peaceful_calm: { raga: 'bhairavi', bpm: 65, droneVol: 0.24, melodyVol: 0.16, tablaVol: 0.0 },
  scary_dark: { raga: 'malkauns', bpm: 70, droneVol: 0.22, melodyVol: 0.12, tablaVol: 0.08 },
  comedic_fun: { raga: 'khamaj', bpm: 130, droneVol: 0.16, melodyVol: 0.22, tablaVol: 0.22 },
  romantic_warm: { raga: 'khamaj', bpm: 85, droneVol: 0.22, melodyVol: 0.20, tablaVol: 0.10 },
  epic_grand: { raga: 'bhairav', bpm: 100, droneVol: 0.20, melodyVol: 0.22, tablaVol: 0.26 },
};

const DURATION_S = 30;
const SR = 44100;

// Build melody as a series of sine bursts cycling through raga notes.
// Returns ffmpeg filter graph fragment for a single melody voice.
function buildMelodyFilter(raga, bpm) {
  const noteFrames = Math.max(1, Math.round((60 / bpm) * 2)); // half-note per beat
  const noteDur = noteFrames; // seconds per note (we'll use as seconds)
  const noteSec = (60 / bpm) * 1.0;
  const totalNotes = Math.ceil(DURATION_S / noteSec);
  const pattern = RAGAS[raga];
  // Deterministic walking pattern: index = (i * 3 + (i % 5)) % len — pseudo-random feel,
  // pure function of i, no RNG.
  const segments = [];
  for (let i = 0; i < totalNotes; i++) {
    const idx = (i * 3 + (i % 5)) % pattern.length;
    const freq = SA * NOTES[pattern[idx]];
    const startT = i * noteSec;
    if (startT >= DURATION_S) break;
    const dur = Math.min(noteSec * 0.85, DURATION_S - startT);
    if (dur < 0.15) continue; // skip too-short fragments
    const fadeOutSt = Math.max(0.05, dur - 0.06);
    segments.push(
      `sine=frequency=${freq.toFixed(3)}:duration=${dur.toFixed(3)}:sample_rate=${SR},` +
        `afade=t=in:st=0:d=0.04,afade=t=out:st=${fadeOutSt.toFixed(3)}:d=0.06`,
    );
  }
  return segments;
}

// Build tabla via repeating filtered noise pulses on BPM grid.
function buildTabla(bpm) {
  const beatSec = 60 / bpm;
  const beats = Math.ceil(DURATION_S / beatSec);
  const segs = [];
  for (let i = 0; i < beats; i++) {
    const startT = i * beatSec;
    if (startT >= DURATION_S) break;
    // dha-tin-tin-na 4-beat cycle: alternate freqs ≈ tabla bayan/dayan.
    const phase = i % 4;
    const baseFreq = phase === 0 ? 90 : phase === 2 ? 180 : 140;
    const dur = 0.12;
    segs.push(
      `sine=frequency=${baseFreq}:duration=${dur}:sample_rate=${SR},` +
        `afade=t=in:st=0:d=0.005,afade=t=out:st=0.02:d=0.1`,
    );
  }
  return segs;
}

// Build complete ffmpeg filter_complex graph for a mood.
function buildFilterComplex(cfg) {
  const lines = [];
  // Drone: Sa + 2·Sa + Pa, blended low.
  const droneFreqs = [SA, SA * 2, SA * NOTES['P']];
  droneFreqs.forEach((f, i) => {
    lines.push(
      `sine=frequency=${f.toFixed(3)}:duration=${DURATION_S}:sample_rate=${SR}` +
        `,volume=${(cfg.droneVol / droneFreqs.length).toFixed(3)}[d${i}]`,
    );
  });
  lines.push(`[d0][d1][d2]amix=inputs=3:duration=longest:normalize=0[drone]`);
  // Lowpass + slight reverb-ish allpass for warmth.
  lines.push(`[drone]lowpass=f=1200,aecho=0.6:0.4:60:0.3[droneOut]`);

  // Melody voices (concat the note segments).
  const melSegs = buildMelodyFilter(cfg.raga, cfg.bpm);
  // Build a chain: pad each segment to its slot timing using adelay.
  const noteSec = 60 / cfg.bpm;
  melSegs.forEach((seg, i) => {
    const delayMs = Math.round(i * noteSec * 1000);
    lines.push(`${seg},adelay=${delayMs}|${delayMs}[m${i}]`);
  });
  const melLabels = melSegs.map((_, i) => `[m${i}]`).join('');
  lines.push(
    `${melLabels}amix=inputs=${melSegs.length}:duration=longest:normalize=0,` +
      `lowpass=f=2000,volume=${cfg.melodyVol.toFixed(3)}[melodyOut]`,
  );

  // Tabla — only if volume > 0.
  let lastLabel;
  if (cfg.tablaVol > 0) {
    const tabSegs = buildTabla(cfg.bpm);
    const beatSec = 60 / cfg.bpm;
    tabSegs.forEach((seg, i) => {
      const delayMs = Math.round(i * beatSec * 1000);
      lines.push(`${seg},adelay=${delayMs}|${delayMs}[t${i}]`);
    });
    const tabLabels = tabSegs.map((_, i) => `[t${i}]`).join('');
    lines.push(
      `${tabLabels}amix=inputs=${tabSegs.length}:duration=longest:normalize=0,` +
        `volume=${cfg.tablaVol.toFixed(3)}[tablaOut]`,
    );
    lines.push(
      `[droneOut][melodyOut][tablaOut]amix=inputs=3:duration=longest:normalize=0,` +
        `atrim=duration=${DURATION_S},asetpts=N/SR/TB,` +
        `aformat=channel_layouts=stereo,` +
        `loudnorm=I=-18:LRA=8:TP=-2[out]`,
    );
  } else {
    lines.push(
      `[droneOut][melodyOut]amix=inputs=2:duration=longest:normalize=0,` +
        `atrim=duration=${DURATION_S},asetpts=N/SR/TB,` +
        `aformat=channel_layouts=stereo,` +
        `loudnorm=I=-18:LRA=8:TP=-2[out]`,
    );
  }

  return lines.join(';');
}

function generateMood(name, cfg) {
  const out = join(OUT_DIR, `${name}.mp3`);
  // Skip if already a "real" track (>50KB suggests procedural or real, not silence stub).
  if (existsSync(out) && statSync(out).size > 50_000) {
    process.env.MUSIC_GEN_VERBOSE && console.log(`skip ${name} (exists ${statSync(out).size} bytes)`);
    return;
  }
  const filter = buildFilterComplex(cfg);
  const args = [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-filter_complex',
    filter,
    '-map',
    '[out]',
    '-c:a',
    'libmp3lame',
    '-q:a',
    '4',
    out,
  ];
  try {
    execFileSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(`generated ${name}.mp3 (${statSync(out).size} bytes)`);
  } catch (err) {
    // Fallback: if libmp3lame chokes on the synthesis (psymodel issues),
    // emit a WAV-then-AAC dance — re-encode via PCM intermediate.
    const wavOut = out.replace(/\.mp3$/, '.wav');
    const wavArgs = [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-filter_complex',
      filter,
      '-map',
      '[out]',
      '-c:a',
      'pcm_s16le',
      '-ar',
      String(SR),
      wavOut,
    ];
    execFileSync('ffmpeg', wavArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        wavOut,
        '-c:a',
        'libmp3lame',
        '-q:a',
        '4',
        out,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    console.log(`generated ${name}.mp3 via WAV fallback (${statSync(out).size} bytes)`);
  }
}

for (const [name, cfg] of Object.entries(MOODS)) {
  generateMood(name, cfg);
}
console.log('procedural music generation complete');
