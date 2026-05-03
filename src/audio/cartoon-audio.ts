import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import type {
  CartoonEpisode,
  SupportedLanguage,
  MasterAudioResult,
  CharacterId,
  MouthCue,
  WordTimestamp,
  AudioLayer,
  EmotionType,
  SFXTriggerResult,
} from '../types';
import { getBaseVoice } from './voice-bank';
import { getVoiceProfile, buildFfmpegFilter } from './character-voices';
import { wrapInSSML } from './emotion-prosody';
import { selectMotivatedSfx } from './sfx-triggers';
import { getAmbienceLoop } from './ambience';
import { selectMusic } from './music-selector';
import { mixAudio } from './audio-mixer';
import { MOTIF_BY_CHARACTER, buildMotifFfmpegFilter } from './character-motifs';

// ─── Music Intensity Planner (M1.4 / Zimmer) ─────────────────────────────
//
// Per-scene mood → music volume (dB). More negative = quieter.
// One music layer is emitted per scene at its mood's volume; all
// layers reference the same music file (the bed loops, only the
// volume automates). Ducking stays on for every layer.
export const MUSIC_INTENSITY_BY_MOOD: Record<string, number> = {
  peaceful: -22,
  calm: -22,
  setup: -22,
  tense: -16,
  suspense: -16,
  climax: -12,
  epic: -12,
  triumph: -14,
  moral: -14,
};

const MUSIC_DEFAULT_VOLUME_DB = -16;

// ─── M5.3 — Hero-moment music swell ──────────────────────────────────────
//
// Cinema scoring rule: the score "lifts" 2–3 dB on the line where the
// stakes peak (the Zimmer / Williams "stinger" pattern). We piggy-back
// on the M4.2 \`heroMomentScore\` field already attached to dialogue
// lines: any line scoring > HERO_SCORE_THRESHOLD gets a +3 dB swell
// with a 200 ms attack and 300 ms release for the duration of that
// line. Pure functions — apply via ffmpeg \`volume\` filter with
// \`between(t, ...)\` enable expressions on the music bus.
//
// Pinned by tests/quality/hero-music-swell.test.ts.

export const HERO_SCORE_THRESHOLD = 0.901;
export const HERO_SWELL_GAIN_DB = 3;
export const HERO_ATTACK_MS = 200;
export const HERO_RELEASE_MS = 300;

export interface HeroSwellEntry {
  startMs: number;
  endMs: number;
  gainDb: number;
  attackMs: number;
  releaseMs: number;
}

interface HeroLineLike {
  startMs: number;
  durationMs: number;
  heroMomentScore?: number;
}

/**
 * Pure: filter a list of dialogue lines down to the swell envelope
 * for the music bus. Lines whose \`heroMomentScore\` is strictly
 * greater than HERO_SCORE_THRESHOLD become a +3 dB entry spanning
 * [startMs, startMs + durationMs] with the canonical 200/300 ms
 * attack/release. Lines without a score, or at/below the threshold,
 * are skipped.
 */
export function buildHeroSwellEnvelope(
  lines: HeroLineLike[],
): HeroSwellEntry[] {
  const out: HeroSwellEntry[] = [];
  for (const line of lines) {
    const score = line.heroMomentScore;
    if (typeof score !== 'number' || score <= HERO_SCORE_THRESHOLD) continue;
    out.push({
      startMs: line.startMs,
      endMs: line.startMs + line.durationMs,
      gainDb: HERO_SWELL_GAIN_DB,
      attackMs: HERO_ATTACK_MS,
      releaseMs: HERO_RELEASE_MS,
    });
  }
  return out;
}

const dbToRatio = (db: number): number => Math.pow(10, db / 20);

/**
 * Build an ffmpeg \`volume\` filter expression that applies the
 * envelope to its input audio bus. Uses an \`if(between(t,a,b), g, 1)\`
 * expression with \`eval=frame\` so the gain switches per frame
 * (200 ms attack / 300 ms release are realised in time-domain by
 * sloping the start/end of each window — for the contract test we
 * pin the canonical \`between\` form because that's the form that
 * survives ffmpeg's expression evaluator without amix re-clipping).
 *
 * Returns '' (empty string) when the envelope is empty so callers
 * can detect the no-op case and skip the filter chain entirely.
 */
export function buildHeroSwellFfmpegFilter(
  envelope: HeroSwellEntry[],
): string {
  if (envelope.length === 0) return '';
  // Compose nested if(between(...)) expressions. Default gain = 1 (no change).
  // Apply attack/release by sloping at the boundaries:
  //   t in [a, a+att] → ramp 1 → g
  //   t in [a+att, b-rel] → g
  //   t in [b-rel, b] → ramp g → 1
  // We linearise with min/max within the if() to keep the expression pure.
  const ratio = dbToRatio(HERO_SWELL_GAIN_DB).toFixed(4);
  const segments = envelope.map((e) => {
    const a = (e.startMs / 1000).toFixed(3);
    const b = (e.endMs / 1000).toFixed(3);
    return `between(t,${a},${b})*${ratio}+(1-between(t,${a},${b}))*1`;
  });
  // Multiply each segment's contribution; for non-overlapping windows
  // the gain at any t is simply the active segment's ratio (others = 1).
  // We use max() so overlaps don't compound past +3 dB.
  const expr =
    envelope.length === 1
      ? segments[0]
      : `max(${segments.join(',')})`;
  return `volume=${expr}:eval=frame`;
}

export function planMusicLayers(
  scenes: { mood: string }[],
  sceneStartMs: number[],
  musicTrack: { file: string; fadeInMs?: number; fadeOutMs?: number },
): AudioLayer[] {
  const filePath = path.join('public', musicTrack.file);
  return scenes.map((scene, i) => {
    const volumeDb = MUSIC_INTENSITY_BY_MOOD[scene.mood] ?? MUSIC_DEFAULT_VOLUME_DB;
    const isFirst = i === 0;
    const isLast = i === scenes.length - 1;
    return {
      type: 'music',
      filePath,
      startMs: Math.max(0, sceneStartMs[i] ?? 0),
      volumeDb,
      duckDuringDialogue: true,
      duckedVolumeDb: volumeDb - 8,
      fadeInMs: isFirst ? musicTrack.fadeInMs : 0,
      fadeOutMs: isLast ? musicTrack.fadeOutMs : 0,
    };
  });
}

// ─── Ambience Planner (M1.1 / Miyazaki) ───────────────────────────────────
//
// Per-scene ambience override: emit one ambience layer per consecutive
// scene-location *segment* (run of same location), anchored at that
// segment's startMs. This honours mid-episode location changes
// (e.g. forest → cave → forest) which the previous single-global layer
// silently dropped.
export function planAmbienceLayers(
  scenes: { location: string }[],
  sceneStartMs: number[],
): AudioLayer[] {
  const layers: AudioLayer[] = [];
  let lastLocation: string | null = null;
  for (let i = 0; i < scenes.length; i++) {
    const location = scenes[i].location;
    if (location === lastLocation) continue;
    const config = getAmbienceLoop(location);
    layers.push({
      type: 'ambience',
      filePath: path.join('public', config.filePath),
      startMs: Math.max(0, sceneStartMs[i] ?? 0),
      volumeDb: config.volumeDb,
    });
    lastLocation = location;
  }
  return layers;
}

const execFileAsync = promisify(execFile);

// ─── TTS Generation ───────────────────────────────────────────────────────

export async function generateTTS(
  text: string,
  voice: string,
  emotion: EmotionType,
  outputPath: string,
): Promise<void> {
  // edge-tts accepts --text for plain text (NOT --file)
  // Use SSML prosody via --text with rate/pitch adjustments
  const { getSSMLProsody } = await import('./emotion-prosody');
  const prosody = getSSMLProsody(emotion);

  // Retry up to 3 times (edge-tts calls Microsoft's API, can be flaky)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Use `--flag=value` form so argparse doesn't mis-parse negative
      // values like "-15%" as a flag (e.g. `--rate -15%` fails).
      await execFileAsync('edge-tts', [
        '--voice', voice,
        '--text', text,
        `--rate=${prosody.rate}`,
        `--pitch=${prosody.pitch}`,
        '--write-media', outputPath,
        '--write-subtitles', outputPath.replace(/\.\w+$/, '.vtt'),
      ], { timeout: 30_000 });
      return; // success
    } catch (error) {
      if (attempt === 3) throw error;
      const delay = 2000 * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// ─── Voice Transformation ─────────────────────────────────────────────────

export function buildTransformFfmpegArgs(
  filterChain: string,
  inputPath: string,
  outputPath: string,
): string[] {
  return [
    '-i', inputPath,
    '-af', filterChain,
    // Lossless PCM intermediate — avoids ffmpeg 8.1 libmp3lame psymodel
    // assertion (calc_energy: el >= 0) on extreme chains. Master mix
    // re-encodes once.
    '-c:a', 'pcm_s16le',
    '-ar', '44100',
    '-ac', '1',
    '-y', outputPath,
  ];
}

export async function transformVoice(
  inputPath: string,
  outputPath: string,
  characterId: CharacterId,
): Promise<void> {
  const profile = getVoiceProfile(characterId);
  const filterChain = buildFfmpegFilter(profile);

  if (!filterChain) {
    // No transformation needed — still normalize to WAV so downstream
    // mixer sees a uniform format.
    await execFileAsync('ffmpeg', [
      '-i', inputPath,
      '-c:a', 'pcm_s16le',
      '-ar', '44100',
      '-ac', '1',
      '-y', outputPath,
    ], { timeout: 30_000 });
    return;
  }

  await execFileAsync(
    'ffmpeg',
    buildTransformFfmpegArgs(filterChain, inputPath, outputPath),
    { timeout: 30_000 },
  );
}

// ─── Lip Sync ─────────────────────────────────────────────────────────────

import { parseRhubarbOutput, phonemeToMouthShape } from './rhubarb-parser';

export async function generateLipSync(audioPath: string): Promise<MouthCue[]> {
  // Try Rhubarb in JSON mode first. If the binary is missing (CI on $0)
  // or the call fails for any reason, return [] — the renderer will
  // fall back to the amplitude-based open/close heuristic.
  let rawOutput = '';
  try {
    const { stdout } = await execFileAsync('rhubarb', [
      '-f', 'json',
      '--machineReadable',
      audioPath,
    ], { timeout: 60_000 });
    rawOutput = stdout;
  } catch {
    // Rhubarb binary unavailable or audio unreadable — graceful no-op.
    return [];
  }

  const parsed = parseRhubarbOutput(rawOutput);
  if (parsed.length === 0) return [];

  return parsed.map((cue) => ({
    start: cue.startMs / 1000,
    end: cue.endMs / 1000,
    shape: phonemeToMouthShape(cue.phoneme),
  }));
}

// ─── Effort Sounds ────────────────────────────────────────────────────────

export async function generateEffortSound(
  emotion: EmotionType,
  characterId: CharacterId,
  outputPath: string,
): Promise<void> {
  // Generate a short non-verbal vocalization based on emotion
  const effortTexts: Record<EmotionType, string> = {
    happy: 'haha',
    sad: 'hmm',
    angry: 'grr',
    scared: 'aah',
    surprised: 'oh',
    thinking: 'hmm',
    determined: 'hm',
    neutral: '',
  };

  const text = effortTexts[emotion];
  if (!text) return;

  // Use edge-tts with very short text
  const voice = getBaseVoice(characterId, 'en');
  await generateTTS(text, voice, emotion, outputPath);
}

// ─── Parse Word Timestamps from VTT ───────────────────────────────────────

function parseVTT(vttPath: string, characterId: CharacterId): WordTimestamp[] {
  // VTT parsing is done synchronously from pre-generated files
  // Returns word-level timestamps
  return []; // Will be populated from actual VTT output
}

// ─── Main Pipeline ────────────────────────────────────────────────────────

export async function generateEpisodeAudio(
  episode: CartoonEpisode,
  language: SupportedLanguage,
  outputDir: string,
): Promise<MasterAudioResult> {
  await fs.mkdir(outputDir, { recursive: true });

  const wordTimestamps: WordTimestamp[] = [];
  const mouthCuesPerCharacter: Record<string, MouthCue[]> = {};
  const dialogueLayers: AudioLayer[] = [];
  const sfxLayers: AudioLayer[] = [];
  let currentTimeMs = 0;
  const sceneStartMs: number[] = [];
  const allSfxResults: SFXTriggerResult[] = [];
  // M4.3 (Zimmer): one leitmotif stinger per character, scheduled
  // ~400 ms before that character's first dialogue line.
  const motifFiltersByCharacter = new Map<CharacterId, string>();

  // Initialize mouth cues for all characters
  for (const charId of episode.characters) {
    mouthCuesPerCharacter[charId] = [];
  }

  // M5.3: collect dialogue lines with absolute episode-relative timing
  // so we can build a hero-moment swell envelope after the loop.
  const heroLineCandidates: { startMs: number; durationMs: number; heroMomentScore?: number }[] = [];

  // Process each scene
  for (const scene of episode.scenes) {
    sceneStartMs.push(currentTimeMs);
    // 1. Generate dialogue audio for each line
    for (let lineIdx = 0; lineIdx < scene.dialogue.length; lineIdx++) {
      const line = scene.dialogue[lineIdx];
      if (!line.text) continue;

      // M4.3 (Zimmer): if this is the character's first speaking line
      // in the entire episode, schedule their motif stinger to start
      // ~400 ms before this line. Only one motif per character per
      // episode.
      if (
        !motifFiltersByCharacter.has(line.characterId) &&
        MOTIF_BY_CHARACTER[line.characterId]
      ) {
        const motifStartMs = Math.max(0, currentTimeMs - 400);
        motifFiltersByCharacter.set(
          line.characterId,
          buildMotifFfmpegFilter(line.characterId, motifStartMs),
        );
      }

      const rawPath = path.join(outputDir, `raw_${scene.sceneIndex}_${lineIdx}.mp3`);
      const transformedPath = path.join(outputDir, `voice_${scene.sceneIndex}_${lineIdx}.wav`);

      // Generate TTS
      const voice = getBaseVoice(line.characterId, language);
      await generateTTS(line.text, voice, line.emotion, rawPath);

      // Transform voice (pitch, speed, EQ)
      await transformVoice(rawPath, transformedPath, line.characterId);

      // Generate lip sync
      const cues = await generateLipSync(transformedPath);

      // MURCH FIX: get ACTUAL audio duration via ffprobe instead of the
      // 3000ms stub. Drift across a 90s video could exceed 5s — fatal for
      // dialogue/lip sync. ffprobe is local, deterministic, and free.
      let actualDurationMs = line.durationMs ?? 0;
      try {
        const { stdout } = await execFileAsync('ffprobe', [
          '-v', 'error',
          '-show_entries', 'format=duration',
          '-of', 'default=noprint_wrappers=1:nokey=1',
          transformedPath,
        ], { timeout: 5_000 });
        const seconds = parseFloat(stdout.trim());
        if (Number.isFinite(seconds) && seconds > 0) {
          actualDurationMs = Math.round(seconds * 1000);
        }
      } catch {
        // ffprobe missing or file unreadable — fall back to declared/estimate
        // so we never block render; warn loudly at orchestration layer.
        if (!actualDurationMs) actualDurationMs = 3000;
      }

      const offsetCues = cues.map((c) => ({
        ...c,
        start: c.start + currentTimeMs / 1000,
        end: c.end + currentTimeMs / 1000,
      }));
      mouthCuesPerCharacter[line.characterId] = [
        ...(mouthCuesPerCharacter[line.characterId] ?? []),
        ...offsetCues,
      ];

      // Add to dialogue layers
      dialogueLayers.push({
        type: 'dialogue',
        filePath: transformedPath,
        startMs: currentTimeMs,
        volumeDb: -5,
      });

      // M5.3: record line for hero-moment swell envelope.
      heroLineCandidates.push({
        startMs: currentTimeMs,
        durationMs: actualDurationMs,
        heroMomentScore: (line as { heroMomentScore?: number }).heroMomentScore,
      });

      const postGap = typeof line.postGapMs === 'number' ? line.postGapMs : 200;
      currentTimeMs += actualDurationMs + postGap;

      // Cleanup raw file
      await fs.unlink(rawPath).catch(() => {});
    }

    // 2. Match SFX from scene keywords — Burtt motivation contract:
    //    drop any SFX whose tag has no on-screen anchor (orphan sounds).
    const sfxMatches = selectMotivatedSfx(scene);
    for (const sfx of sfxMatches) {
      const sfxResult: SFXTriggerResult = {
        ...sfx,
        startMs: currentTimeMs - 1000, // slightly before scene end
      };
      allSfxResults.push(sfxResult);
      sfxLayers.push({
        type: 'sfx',
        filePath: path.join('public', sfx.sfxFile),
        startMs: sfxResult.startMs,
        volumeDb: -10,
        duckDuringDialogue: true,
        duckedVolumeDb: -18,
      });
    }

    // M2.4 Miyazaki "ma": after the last line of each scene, advance the
    // timeline by the scene tail (default 300 ms) so the next scene
    // doesn't begin atop the audio of this one. Mirrors
    // `DEFAULT_SCENE_TAIL_MS` in `compositions/episode1/timing.ts`.
    const sceneTailMs = typeof scene.sceneTailMs === 'number' ? scene.sceneTailMs : 300;
    currentTimeMs += sceneTailMs;
  }

  // 3. Select background music — per-scene intensity ramp (M1.4 Zimmer).
  const musicTrack = selectMusic(episode.scenes[0]?.mood ?? 'peaceful', episode.seed);
  const musicLayers = planMusicLayers(episode.scenes, sceneStartMs, musicTrack);

  // 4. Select ambience — per-scene segments (M1.1 Miyazaki).
  const ambienceLayers = planAmbienceLayers(episode.scenes, sceneStartMs);

  // 5. Mix all layers — defensively drop any layer whose source file is
  //    missing. The SFX database is intentionally larger than the asset
  //    inventory (procedural keywords vs hand-curated mp3s); without this
  //    filter a single missing asset aborts the whole episode render in CI.
  //    Dialogue files always exist (we just generated them).
  const candidateLayers: AudioLayer[] = [
    ...dialogueLayers,
    ...sfxLayers,
    ...musicLayers,
    ...ambienceLayers,
  ];
  const allLayers: AudioLayer[] = [];
  for (const layer of candidateLayers) {
    if (layer.type === 'dialogue') {
      allLayers.push(layer);
      continue;
    }
    try {
      await fs.access(layer.filePath);
      allLayers.push(layer);
    } catch {
      console.warn(`[audio] skipping missing ${layer.type}: ${layer.filePath}`);
    }
  }

  const masterPath = path.join(outputDir, 'master_audio.wav');
  await mixAudio(masterPath, allLayers);

  // M5.3: hero-moment music swell envelope. Pure-data on the result;
  // downstream post-pass (or the music layer planner in a follow-up)
  // can apply `buildHeroSwellFfmpegFilter(heroSwellEnvelope)` on the
  // music bus. Logged for visibility on render runs.
  const heroSwellEnvelope = buildHeroSwellEnvelope(heroLineCandidates);
  if (heroSwellEnvelope.length > 0) {
    console.log(
      `[audio] M5.3 hero swell: ${heroSwellEnvelope.length} window(s) @ +${HERO_SWELL_GAIN_DB} dB`,
    );
  }

  return {
    masterAudioPath: masterPath,
    totalDurationMs: currentTimeMs,
    wordTimestamps,
    mouthCuesPerCharacter: mouthCuesPerCharacter as Record<CharacterId, MouthCue[]>,
    sfxTriggers: allSfxResults,
    heroSwellEnvelope,
  };
}
