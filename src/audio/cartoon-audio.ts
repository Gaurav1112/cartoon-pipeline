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
import { matchSFX } from './sfx-triggers';
import { getAmbienceLoop } from './ambience';
import { selectMusic } from './music-selector';
import { mixAudio } from './audio-mixer';

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
      await execFileAsync('edge-tts', [
        '--voice', voice,
        '--text', text,
        '--rate', prosody.rate,
        '--pitch', prosody.pitch,
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

export async function transformVoice(
  inputPath: string,
  outputPath: string,
  characterId: CharacterId,
): Promise<void> {
  const profile = getVoiceProfile(characterId);
  const filterChain = buildFfmpegFilter(profile);

  if (!filterChain) {
    // No transformation needed, just copy
    await fs.copyFile(inputPath, outputPath);
    return;
  }

  await execFileAsync('ffmpeg', [
    '-i', inputPath,
    '-af', filterChain,
    '-y', outputPath,
  ], { timeout: 30_000 });
}

// ─── Lip Sync ─────────────────────────────────────────────────────────────

export async function generateLipSync(audioPath: string): Promise<MouthCue[]> {
  try {
    const { stdout } = await execFileAsync('rhubarb', [
      '-f', 'json',
      '--machineReadable',
      audioPath,
    ], { timeout: 60_000 });

    const data = JSON.parse(stdout);
    return (data.mouthCues ?? []).map((cue: { start: number; end: number; value: string }) => ({
      start: cue.start,
      end: cue.end,
      shape: cue.value as MouthCue['shape'],
    }));
  } catch {
    // Fallback: generate basic mouth cues from audio duration
    return [{ start: 0, end: 1, shape: 'B' as const }];
  }
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
  const allSfxResults: SFXTriggerResult[] = [];

  // Initialize mouth cues for all characters
  for (const charId of episode.characters) {
    mouthCuesPerCharacter[charId] = [];
  }

  // Process each scene
  for (const scene of episode.scenes) {
    // 1. Generate dialogue audio for each line
    for (let lineIdx = 0; lineIdx < scene.dialogue.length; lineIdx++) {
      const line = scene.dialogue[lineIdx];
      if (!line.text) continue;

      const rawPath = path.join(outputDir, `raw_${scene.sceneIndex}_${lineIdx}.mp3`);
      const transformedPath = path.join(outputDir, `voice_${scene.sceneIndex}_${lineIdx}.mp3`);

      // Generate TTS
      const voice = getBaseVoice(line.characterId, language);
      await generateTTS(line.text, voice, line.emotion, rawPath);

      // Transform voice (pitch, speed, EQ)
      await transformVoice(rawPath, transformedPath, line.characterId);

      // Generate lip sync
      const cues = await generateLipSync(transformedPath);
      const offsetCues = cues.map((c) => ({
        ...c,
        start: c.start + currentTimeMs / 1000,
        end: c.end + currentTimeMs / 1000,
      }));
      mouthCuesPerCharacter[line.characterId] = [
        ...(mouthCuesPerCharacter[line.characterId] ?? []),
        ...offsetCues,
      ];

      // Estimate duration (will be replaced by actual audio duration)
      const estimatedDurationMs = line.durationMs ?? 3000;

      // Add to dialogue layers
      dialogueLayers.push({
        type: 'dialogue',
        filePath: transformedPath,
        startMs: currentTimeMs,
        volumeDb: -5,
      });

      currentTimeMs += estimatedDurationMs + 200; // 200ms gap between lines

      // Cleanup raw file
      await fs.unlink(rawPath).catch(() => {});
    }

    // 2. Match SFX from scene keywords
    const sfxMatches = matchSFX('', scene.sfxKeywords);
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
  }

  // 3. Select background music
  const musicTrack = selectMusic(episode.scenes[0]?.mood ?? 'peaceful', episode.seed);
  const musicLayer: AudioLayer = {
    type: 'music',
    filePath: path.join('public', musicTrack.file),
    startMs: 0,
    volumeDb: -16,
    duckDuringDialogue: true,
    duckedVolumeDb: -24,
    fadeInMs: musicTrack.fadeInMs,
    fadeOutMs: musicTrack.fadeOutMs,
  };

  // 4. Select ambience
  const primaryLocation = episode.scenes[0]?.location ?? 'forest';
  const ambienceConfig = getAmbienceLoop(primaryLocation);
  const ambienceLayer: AudioLayer = {
    type: 'ambience',
    filePath: path.join('public', ambienceConfig.filePath),
    startMs: 0,
    volumeDb: ambienceConfig.volumeDb,
  };

  // 5. Mix all layers
  const allLayers: AudioLayer[] = [
    ...dialogueLayers,
    ...sfxLayers,
    musicLayer,
    ambienceLayer,
  ];

  const masterPath = path.join(outputDir, 'master_audio.mp3');
  await mixAudio(masterPath, allLayers);

  return {
    masterAudioPath: masterPath,
    totalDurationMs: currentTimeMs,
    wordTimestamps,
    mouthCuesPerCharacter: mouthCuesPerCharacter as Record<CharacterId, MouthCue[]>,
    sfxTriggers: allSfxResults,
  };
}
