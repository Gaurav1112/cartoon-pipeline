#!/usr/bin/env node
// Procedural SFX + ambience generator (Burtt 3/10 → real signature sounds).
// Synthesizes every SFXKey + every AmbienceLocation as a deterministic ffmpeg
// graph. Pure math, no Math.random, no external assets, $0.
//
// Output: 22 SFX MP3s + 11 ambience MP3s in public/audio/{sfx,ambience}/.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', 'public', 'audio');

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

function run(args) {
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`ffmpeg failed:\n${r.stderr}`);
  }
}

function gen(outRel, filter, mapLabel = '[out]') {
  const out = resolve(ROOT, outRel);
  ensureDir(dirname(out));
  if (existsSync(out) && statSync(out).size > 4_000) {
    return; // already generated
  }
  // Try mp3 direct; fallback to WAV→mp3 if libmp3lame psymodel chokes.
  const baseArgs = [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-filter_complex',
    filter,
    '-map',
    mapLabel,
  ];
  try {
    run([...baseArgs, '-c:a', 'libmp3lame', '-q:a', '4', out]);
  } catch (e) {
    const wav = out.replace(/\.mp3$/, '.wav');
    run([...baseArgs, '-c:a', 'pcm_s16le', '-ar', '44100', wav]);
    run([
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      wav,
      '-c:a',
      'libmp3lame',
      '-q:a',
      '4',
      out,
    ]);
  }
  console.log(`generated ${outRel} (${statSync(out).size} bytes)`);
}

// ─────────────────────────────────────────────────────────────────────
// SFX synthesis recipes — each is a one-shot signature sound.
// ─────────────────────────────────────────────────────────────────────

// Lion roar: low saw + lowpass + tremolo + 2s envelope.
function lionRoar() {
  return (
    `aevalsrc=exprs=0.7*sin(2*PI*90*t)+0.3*sin(2*PI*180*t):d=2.0:s=44100[s0];` +
    `[s0]lowpass=f=600,vibrato=f=4:d=0.4,` +
    `afade=t=in:st=0:d=0.05,afade=t=out:st=1.6:d=0.4,` +
    `volume=1.5,aformat=channel_layouts=stereo[out]`
  );
}
// Rabbit hop: short 220Hz pulse, quick decay.
function rabbitHop() {
  return (
    `sine=frequency=220:duration=0.18:sample_rate=44100,` +
    `afade=t=in:st=0:d=0.01,afade=t=out:st=0.05:d=0.13,` +
    `aformat=channel_layouts=stereo[out]`
  );
}
// Dramatic sting: low brass-like minor chord 1s.
function dramaticSting() {
  return (
    `sine=frequency=130.81:duration=1.0[a0];` + // C3
    `sine=frequency=155.56:duration=1.0[a1];` + // Eb3
    `sine=frequency=196.00:duration=1.0[a2];` + // G3
    `[a0][a1][a2]amix=inputs=3:duration=longest:normalize=0,` +
    `lowpass=f=900,afade=t=in:st=0:d=0.02,afade=t=out:st=0.7:d=0.3,` +
    `volume=1.4,aformat=channel_layouts=stereo[out]`
  );
}
// Shock sting: high stab + noise.
function shockSting() {
  return (
    `sine=frequency=880:duration=0.35[a0];` +
    `anoisesrc=duration=0.35:color=white:amplitude=0.3[a1];` +
    `[a0][a1]amix=inputs=2:duration=longest:normalize=0,` +
    `highpass=f=600,afade=t=out:st=0.1:d=0.25,` +
    `volume=1.3,aformat=channel_layouts=stereo[out]`
  );
}
// Victory fanfare: ascending arpeggio C-E-G-C 1.4s.
function victoryFanfare() {
  return (
    `sine=frequency=261.63:duration=0.3[a0];` +
    `sine=frequency=329.63:duration=0.3,adelay=300|300[a1];` +
    `sine=frequency=392.00:duration=0.3,adelay=600|600[a2];` +
    `sine=frequency=523.25:duration=0.6,adelay=900|900[a3];` +
    `[a0][a1][a2][a3]amix=inputs=4:duration=longest:normalize=0,` +
    `lowpass=f=2000,afade=t=out:st=1.2:d=0.2,` +
    `volume=1.4,aformat=channel_layouts=stereo[out]`
  );
}
// Suspense build: rising sine 100→500Hz over 3s.
function suspenseBuild() {
  return (
    `aevalsrc=exprs=sin(2*PI*(100+133*t)*t):d=3.0:s=44100,` +
    `lowpass=f=900,afade=t=in:st=0:d=0.5,afade=t=out:st=2.5:d=0.5,` +
    `volume=1.0,aformat=channel_layouts=stereo[out]`
  );
}
// Reveal sting: descending bell tone.
function revealSting() {
  return (
    `sine=frequency=880:duration=0.6[a0];` +
    `sine=frequency=659:duration=0.6,adelay=200|200[a1];` +
    `[a0][a1]amix=inputs=2:duration=longest:normalize=0,` +
    `highpass=f=400,afade=t=out:st=0.5:d=0.3,` +
    `volume=1.2,aformat=channel_layouts=stereo[out]`
  );
}
// Happy chime: arpeggio bells.
function happyChime() {
  return (
    `sine=frequency=523.25:duration=0.4[a0];` +
    `sine=frequency=659.25:duration=0.4,adelay=150|150[a1];` +
    `sine=frequency=783.99:duration=0.5,adelay=300|300[a2];` +
    `[a0][a1][a2]amix=inputs=3:duration=longest:normalize=0,` +
    `afade=t=out:st=0.7:d=0.2,volume=1.3,aformat=channel_layouts=stereo[out]`
  );
}
// Mystery tone: wavering 220Hz with vibrato.
function mysteryTone() {
  return (
    `sine=frequency=220:duration=2.0:sample_rate=44100,vibrato=f=3:d=0.6,` +
    `lowpass=f=800,afade=t=in:st=0:d=0.3,afade=t=out:st=1.5:d=0.5,` +
    `volume=1.0,aformat=channel_layouts=stereo[out]`
  );
}
// Heartbeat: two low pulses.
function heartbeat() {
  return (
    `sine=frequency=60:duration=0.15[a0];` +
    `sine=frequency=60:duration=0.15,adelay=300|300[a1];` +
    `[a0][a1]amix=inputs=2:duration=longest:normalize=0,` +
    `afade=t=out:st=0.4:d=0.1,volume=1.6,aformat=channel_layouts=stereo[out]`
  );
}
// Applause: filtered noise burst 2s.
function applause() {
  return (
    `anoisesrc=duration=2.0:color=pink:amplitude=0.4,` +
    `bandpass=f=2000:width_type=h:w=1500,` +
    `afade=t=in:st=0:d=0.1,afade=t=out:st=1.5:d=0.5,` +
    `volume=1.2,aformat=channel_layouts=stereo[out]`
  );
}
// Crowd gasp: noise swell.
function crowdGasp() {
  return (
    `anoisesrc=duration=0.8:color=pink:amplitude=0.4,` +
    `bandpass=f=600:width_type=h:w=400,` +
    `afade=t=in:st=0:d=0.15,afade=t=out:st=0.5:d=0.3,` +
    `volume=1.3,aformat=channel_layouts=stereo[out]`
  );
}
// Record scratch: high freq sweep down + noise.
function recordScratch() {
  return (
    `aevalsrc=exprs=sin(2*PI*(2000-1500*t)*t):d=0.6:s=44100,` +
    `bandpass=f=1500:width_type=h:w=1500,` +
    `afade=t=out:st=0.4:d=0.2,volume=1.2,aformat=channel_layouts=stereo[out]`
  );
}
// Water splash: noise burst lowpass.
function waterSplash() {
  return (
    `anoisesrc=duration=0.5:color=white:amplitude=0.5,` +
    `lowpass=f=2500,bandpass=f=1200:width_type=h:w=1500,` +
    `afade=t=in:st=0:d=0.01,afade=t=out:st=0.2:d=0.3,` +
    `volume=1.3,aformat=channel_layouts=stereo[out]`
  );
}
// Rimshot: snare + thud combo.
function rimshot() {
  return (
    `anoisesrc=duration=0.2:color=white:amplitude=0.5[a0];` +
    `sine=frequency=180:duration=0.2[a1];` +
    `[a0][a1]amix=inputs=2:duration=longest:normalize=0,` +
    `afade=t=out:st=0.05:d=0.15,volume=1.5,aformat=channel_layouts=stereo[out]`
  );
}
// Boing: pitch-bending sine.
function boing() {
  return (
    `aevalsrc=exprs=sin(2*PI*(120+200*sin(8*t))*t):d=0.5:s=44100,` +
    `lowpass=f=1200,afade=t=out:st=0.3:d=0.2,` +
    `volume=1.4,aformat=channel_layouts=stereo[out]`
  );
}
// Cartoon run: rapid alternating clicks (square-wave-ish via abs(sin)).
function cartoonRun() {
  return (
    `aevalsrc=exprs=0.5*sin(2*PI*8*t)*sin(2*PI*200*t):d=1.5:s=44100,` +
    `bandpass=f=400:width_type=h:w=600,` +
    `volume=1.2,aformat=channel_layouts=stereo[out]`
  );
}
// Giggle: pulse train at varying freqs.
function giggle() {
  return (
    `aevalsrc=exprs=0.5*sin(2*PI*(400+100*sin(15*t))*t)*(0.5+0.5*sin(20*t)):d=0.8:s=44100,` +
    `bandpass=f=600:width_type=h:w=800,` +
    `afade=t=out:st=0.5:d=0.3,volume=1.0,aformat=channel_layouts=stereo[out]`
  );
}
// Pond splash: short watery droplet.
function pondSplash() {
  return (
    `anoisesrc=duration=0.3:color=pink:amplitude=0.4,` +
    `bandpass=f=1500:width_type=h:w=1000,` +
    `afade=t=out:st=0.1:d=0.2,volume=1.0,aformat=channel_layouts=stereo[out]`
  );
}
// Birds chirp: rapid sine sweeps (loop bed).
function birdsChirp() {
  return (
    `aevalsrc=exprs=sin(2*PI*(2500+800*sin(12*t))*t)*(0.4+0.4*sin(7*t)):d=8.0:s=44100,` +
    `highpass=f=1500,bandpass=f=3000:width_type=h:w=2000,` +
    `volume=0.8,aformat=channel_layouts=stereo[out]`
  );
}
// Gentle breeze: filtered noise (loop bed).
function gentleBreeze() {
  return (
    `anoisesrc=duration=10.0:color=pink:amplitude=0.3,` +
    `lowpass=f=600,bandpass=f=300:width_type=h:w=400,` +
    `volume=0.7,aformat=channel_layouts=stereo[out]`
  );
}

const SFX_RECIPES = {
  'sfx/animals/lion_roar.mp3': lionRoar,
  'sfx/animals/rabbit_hop.mp3': rabbitHop,
  'sfx/drama/dramatic_sting.mp3': dramaticSting,
  'sfx/drama/shock_sting.mp3': shockSting,
  'sfx/drama/victory_fanfare.mp3': victoryFanfare,
  'sfx/drama/suspense_build.mp3': suspenseBuild,
  'sfx/drama/reveal_sting.mp3': revealSting,
  'sfx/drama/happy_chime.mp3': happyChime,
  'sfx/drama/mystery_tone.mp3': mysteryTone,
  'sfx/drama/heartbeat.mp3': heartbeat,
  'sfx/drama/applause.mp3': applause,
  'sfx/drama/crowd_gasp.mp3': crowdGasp,
  'sfx/comedy/record_scratch.mp3': recordScratch,
  'sfx/nature/water_splash.mp3': waterSplash,
  'sfx/comedy/rimshot.mp3': rimshot,
  'sfx/comedy/boing.mp3': boing,
  'sfx/comedy/cartoon_run.mp3': cartoonRun,
  'sfx/comedy/giggle.mp3': giggle,
  'sfx/nature/pond_splash.mp3': pondSplash,
  'sfx/nature/birds_chirp.mp3': birdsChirp,
  'sfx/nature/gentle_breeze.mp3': gentleBreeze,
};

// ─────────────────────────────────────────────────────────────────────
// Ambience beds — 30s loops, layered atmospheric noise.
// ─────────────────────────────────────────────────────────────────────
function ambience(layers) {
  // layers: array of filter source strings (each must produce an `[out]` label).
  // Mix all into one. Each layer is composed inline.
  const labels = [];
  const segs = [];
  layers.forEach((layer, i) => {
    segs.push(`${layer.src}[L${i}]`);
    labels.push(`[L${i}]`);
  });
  segs.push(
    `${labels.join('')}amix=inputs=${layers.length}:duration=longest:normalize=0,` +
      `aformat=channel_layouts=stereo,volume=0.8[out]`,
  );
  return segs.join(';');
}

const ambienceForest = () =>
  ambience([
    {
      src:
        `anoisesrc=duration=30:color=pink:amplitude=0.3,lowpass=f=400,volume=0.5`,
    },
    {
      src:
        `aevalsrc=exprs=sin(2*PI*(2500+800*sin(11*t))*t)*(0.3+0.3*sin(6.3*t)):d=30:s=44100,` +
        `highpass=f=1500,volume=0.3`,
    },
  ]);
const ambienceVillage = () =>
  ambience([
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.25,lowpass=f=800,volume=0.5` },
    {
      src:
        `aevalsrc=exprs=0.3*sin(2*PI*(280+30*sin(0.7*t))*t):d=30:s=44100,` +
        `bandpass=f=600:width_type=h:w=600,volume=0.4`,
    },
  ]);
const ambiencePalace = () =>
  ambience([
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.18,lowpass=f=300,volume=0.4` },
    {
      src:
        `sine=frequency=220:duration=30:sample_rate=44100,vibrato=f=0.5:d=0.3,volume=0.2`,
    },
  ]);
const ambienceRiver = () =>
  ambience([
    {
      src:
        `anoisesrc=duration=30:color=white:amplitude=0.5,bandpass=f=1500:width_type=h:w=2500,volume=0.6`,
    },
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.3,lowpass=f=400,volume=0.3` },
  ]);
const ambienceMarket = () =>
  ambience([
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.4,bandpass=f=1000:width_type=h:w=1500,volume=0.6` },
    {
      src:
        `aevalsrc=exprs=0.3*sin(2*PI*(440+50*sin(2*t))*t)*(0.5+0.5*sin(0.9*t)):d=30:s=44100,volume=0.3`,
    },
  ]);
const ambienceTemple = () =>
  ambience([
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.15,lowpass=f=200,volume=0.4` },
    {
      src:
        `sine=frequency=110:duration=30:sample_rate=44100,vibrato=f=0.3:d=0.2,volume=0.25`,
    },
    {
      src:
        `sine=frequency=220:duration=30:sample_rate=44100,vibrato=f=0.5:d=0.3,volume=0.15`,
    },
  ]);
const ambienceCave = () =>
  ambience([
    { src: `anoisesrc=duration=30:color=brown:amplitude=0.4,lowpass=f=300,volume=0.6` },
    {
      src:
        `aevalsrc=exprs=0.2*sin(2*PI*(80+10*sin(0.5*t))*t):d=30:s=44100,volume=0.3`,
    },
  ]);
const ambienceMountain = () =>
  ambience([
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.35,lowpass=f=500,volume=0.6` },
    {
      src:
        `aevalsrc=exprs=0.3*sin(2*PI*(180+40*sin(0.4*t))*t):d=30:s=44100,bandpass=f=300:width_type=h:w=400,volume=0.3`,
    },
  ]);
const ambienceGarden = () =>
  ambience([
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.25,lowpass=f=600,volume=0.4` },
    {
      src:
        `aevalsrc=exprs=sin(2*PI*(3000+1000*sin(13*t))*t)*(0.3+0.3*sin(8.5*t)):d=30:s=44100,highpass=f=2000,volume=0.25`,
    },
    {
      src:
        `aevalsrc=exprs=0.2*sin(2*PI*(180+15*sin(2.5*t))*t):d=30:s=44100,volume=0.2`,
    },
  ]);
const ambienceBeach = () =>
  ambience([
    {
      src:
        `anoisesrc=duration=30:color=white:amplitude=0.5,lowpass=f=1200,` +
        `aevalsrc=exprs=0.5+0.5*sin(2*PI*0.15*t):d=30:s=44100[mod];` +
        `[1:a]asplit=1[m1]`,
    },
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.3,lowpass=f=400,volume=0.4` },
  ]);
// (Beach simplified — drop the modulation, just layered noise.)
const ambienceBeachSimple = () =>
  ambience([
    { src: `anoisesrc=duration=30:color=white:amplitude=0.5,lowpass=f=1200,volume=0.5` },
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.3,lowpass=f=400,volume=0.4` },
  ]);
const ambienceDesert = () =>
  ambience([
    { src: `anoisesrc=duration=30:color=pink:amplitude=0.4,lowpass=f=400,volume=0.6` },
    {
      src:
        `aevalsrc=exprs=0.2*sin(2*PI*(200+30*sin(0.3*t))*t):d=30:s=44100,bandpass=f=300:width_type=h:w=300,volume=0.3`,
    },
  ]);

const AMBIENCE_RECIPES = {
  'ambience/forest.mp3': ambienceForest,
  'ambience/village.mp3': ambienceVillage,
  'ambience/palace.mp3': ambiencePalace,
  'ambience/river.mp3': ambienceRiver,
  'ambience/market.mp3': ambienceMarket,
  'ambience/temple.mp3': ambienceTemple,
  'ambience/cave.mp3': ambienceCave,
  'ambience/mountain.mp3': ambienceMountain,
  'ambience/garden.mp3': ambienceGarden,
  'ambience/beach.mp3': ambienceBeachSimple,
  'ambience/desert.mp3': ambienceDesert,
};

let count = 0;
for (const [rel, recipe] of Object.entries(SFX_RECIPES)) {
  gen(rel, recipe());
  count++;
}
for (const [rel, recipe] of Object.entries(AMBIENCE_RECIPES)) {
  gen(rel, recipe());
  count++;
}
console.log(`procedural SFX + ambience generation complete (${count} files)`);
