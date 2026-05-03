import * as path from 'path';
import * as fs from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { SupportedLanguage, RenderResult, CartoonEpisode, DialogueLine } from '../types';
import { LANGUAGES } from '../types';
import { generateFullEpisode } from './episode-generator';
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

  // 1. Generate full episode data
  console.log('[render] Generating episode data...');
  const fullEpisode = await generateFullEpisode(episodeNumber);
  const { episode } = fullEpisode;

  // Save episode script
  await fs.writeFile(
    path.join(episodeDir, 'episode-script.json'),
    JSON.stringify(episode, null, 2),
  );

  // 2. Generate audio for all 7 languages (can be parallelized)
  console.log('[render] Generating audio for 7 languages...');
  const audioResults: Record<string, Awaited<ReturnType<typeof generateEpisodeAudio>>> = {};

  // Fill dialogue text into episode scenes before audio generation
  for (const lang of LANGUAGES) {
    const langDir = path.join(episodeDir, 'audio', lang);
    await fs.mkdir(langDir, { recursive: true });

    // Create a copy of episode with resolved dialogues
    const episodeWithDialogue: CartoonEpisode = {
      ...episode,
      scenes: episode.scenes.map((scene, sceneIdx) => ({
        ...scene,
        dialogue: (fullEpisode.dialoguesPerLanguage[lang]?.[sceneIdx] ?? scene.dialogue).map(
          (line: DialogueLine, lineIdx: number) => ({
            ...scene.dialogue[lineIdx],
            text: line.text,
          }),
        ),
      })),
    };

    audioResults[lang] = await generateEpisodeAudio(episodeWithDialogue, lang, langDir);
    console.log(`[render] Audio done: ${lang}`);
  }

  // 3. Render visual track ONCE with Remotion (language-independent)
  console.log('[render] Rendering visual track with Remotion...');
  const visualPath = path.join(episodeDir, 'visual.mp4');

  // Use the first language's audio data for visual sync (mouth cues are similar)
  const primaryAudio = audioResults['hi'] ?? audioResults[LANGUAGES[0]];
  const propsPath = path.join(episodeDir, 'remotion-props.json');
  await fs.writeFile(propsPath, JSON.stringify({
    episode,
    audioData: primaryAudio,
    language: 'hi',
  }));

  await execFileAsync('npx', [
    'remotion', 'render',
    'src/compositions/CartoonEpisode.tsx',
    'CartoonEpisode',
    visualPath,
    '--props', propsPath,
    '--codec', 'h264',
    // QUALITY (Catmull): PNG frames + CRF 18 ≈ visually lossless.
    // Color: BT.709 + yuv420p for cross-platform playback (YT/IG/FB).
    '--image-format', 'png',
    '--crf', '18',
    '--color-space', 'bt709',
    '--pixel-format', 'yuv420p',
  ], { timeout: 600_000 });

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
