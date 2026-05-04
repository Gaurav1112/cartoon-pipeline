import * as path from 'path';
import * as fs from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { SupportedLanguage, RenderResult, CartoonEpisode } from '../types';
import { LANGUAGES } from '../types';
import { buildLionRabbitEpisode } from './lion-rabbit-episode';
import { generateEpisodeAudio } from '../audio/cartoon-audio';
import { generateMetadata } from './metadata-generator';
import { muxVideoAudio } from '../audio/audio-mixer';

const execFileAsync = promisify(execFile);

/**
 * Render a complete episode: generate audio for all 7 languages,
 * render visual track ONCE with Remotion, then ffmpeg mux 7 audio tracks.
 *
 * KEY OPTIMIZATION: 1 render = 7 videos
 */
export async function renderEpisode(
  episodeNumber: number,
  outputDir: string,
): Promise<RenderResult> {
  const startTime = Date.now();
  const episodeDir = path.join(outputDir, `episode-${episodeNumber}`);
  await fs.mkdir(episodeDir, { recursive: true });

  console.log(`[render] Starting episode ${episodeNumber}...`);

  // 1. Build the hand-crafted Lion-Rabbit episode (M14: was generateFullEpisode)
  console.log('[render] Building Lion-Rabbit episode (Episode1)...');
  const episode: CartoonEpisode = buildLionRabbitEpisode();

  // Save episode script
  await fs.writeFile(
    path.join(episodeDir, 'episode-script.json'),
    JSON.stringify(episode, null, 2),
  );

  // 2. Generate audio for Hindi (M14 Hindi-first).
  // The hand-crafted dialogue in scenes-lion-rabbit.ts is currently
  // Hindi-only. Generating with non-Hindi voices (Tamil, Telugu, etc.)
  // against Hindi script causes Edge-TTS NoAudioReceived errors. So we
  // generate Hindi once, then duplicate the file path into the other
  // language slots — deterministic, identical audio everywhere — until
  // dedicated per-language dialogue lands.
  console.log('[render] Generating Hindi audio (other langs reuse Hindi until translated)...');
  const audioResults: Record<string, Awaited<ReturnType<typeof generateEpisodeAudio>>> = {};

  const hiDir = path.join(episodeDir, 'audio', 'hi');
  await fs.mkdir(hiDir, { recursive: true });
  const hiAudio = await generateEpisodeAudio(episode, 'hi', hiDir);
  console.log('[render] Audio done: hi');

  for (const lang of LANGUAGES) {
    audioResults[lang] = hiAudio;
  }

  // 3. Render visual track ONCE with Remotion (language-independent)
  console.log('[render] Rendering visual track with Remotion...');
  const visualPath = path.join(episodeDir, 'visual.mp4');

  // Use the first language's audio data for visual sync (mouth cues are similar).
  // Strip masterAudioPath: the visual render is silent — per-language audio
  // is muxed in step 4. Including it would force Remotion to fetch from the
  // dev server (public/ root) where output/*.wav is NOT served, causing 404.
  const primaryAudio = audioResults['hi'] ?? audioResults[LANGUAGES[0]];
  const propsPath = path.join(episodeDir, 'remotion-props.json');
  // Episode1 only consumes `language`; it pulls scenes from
  // LION_RABBIT_SCENES directly. Keep the full props blob for future use
  // by other compositions, but Episode1 will ignore extra keys.
  await fs.writeFile(propsPath, JSON.stringify({
    episode,
    audioData: { ...primaryAudio, masterAudioPath: '' },
    language: 'hi',
  }));

  await execFileAsync('npx', [
    'remotion', 'render',
    'src/index.ts',
    'Episode1',
    visualPath,
    '--props', propsPath,
    '--codec', 'h264',
    // QUALITY (Catmull): PNG frames + CRF 18 ≈ visually lossless.
    // Color: BT.709 + yuv420p for cross-platform playback (YT/IG/FB).
    '--image-format', 'png',
    '--crf', '18',
    '--color-space', 'bt709',
    '--pixel-format', 'yuv420p',
  ], { timeout: 50 * 60_000 });

  console.log('[render] Visual track rendered.');

  // 4. Mux visual + each audio track = 7 MP4s
  console.log('[render] Muxing 7 language versions...');
  const videos: Record<string, string> = {};
  const metadata: Record<string, ReturnType<typeof generateMetadata>> = {};

  for (const lang of LANGUAGES) {
    const audio = audioResults[lang];
    const finalPath = path.join(episodeDir, `episode-${episodeNumber}-${lang}.mp4`);

    await muxVideoAudio(visualPath, audio.masterAudioPath, finalPath);
    videos[lang] = finalPath;

    // Generate metadata
    metadata[lang] = generateMetadata(episode, lang, episodeNumber);
    await fs.writeFile(
      path.join(episodeDir, `metadata-${lang}.json`),
      JSON.stringify(metadata[lang], null, 2),
    );

    console.log(`[render] Muxed: ${lang}`);
  }

  const duration = Date.now() - startTime;
  console.log(`[render] Episode ${episodeNumber} complete in ${(duration / 1000).toFixed(1)}s`);

  return {
    episodeNumber,
    outputDir: episodeDir,
    videos: videos as Record<SupportedLanguage, string>,
    metadata: metadata as Record<SupportedLanguage, ReturnType<typeof generateMetadata>>,
    duration,
  };
}
