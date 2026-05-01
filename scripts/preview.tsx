#!/usr/bin/env tsx
/**
 * Generate a preview MP4 for Episode 1.
 * This renders the visual track only (no TTS audio needed).
 */
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { generateEpisode } from '../src/story/story-engine';
import { selectDialogueSequence } from '../src/dialogues';
import type { MasterAudioResult, CharacterId, MouthCue } from '../src/types';

async function main() {
  const lang = 'en';
  console.log('\n🎬 Generating Episode 1 preview...\n');

  // 1. Generate episode
  const episode = generateEpisode(1, 1);
  console.log(`  Story: "${episode.title}"`);
  console.log(`  Type: ${episode.storyType}`);
  console.log(`  Characters: ${episode.characters.join(', ')}`);
  console.log(`  Scenes: ${episode.scenes.length}`);
  console.log(`  Moral: "${episode.moral.moralText}"`);

  // 2. Fill in dialogue from English bank
  for (const scene of episode.scenes) {
    const queries = scene.dialogue.map((line) => ({
      character: line.characterId,
      emotion: line.emotion,
      context: line.context,
    }));
    const resolved = selectDialogueSequence(queries, lang, episode.seed + scene.sceneIndex);
    scene.dialogue = resolved.map((sel, i) => ({
      ...scene.dialogue[i],
      text: sel.text,
    }));
  }

  // 3. Create mock audio data (no real TTS for preview)
  const mouthCuesPerCharacter: Record<string, MouthCue[]> = {};
  for (const charId of episode.characters) {
    mouthCuesPerCharacter[charId] = [];
  }

  const audioData: MasterAudioResult = {
    masterAudioPath: 'about:blank', // No audio for visual preview
    totalDurationMs: (episode.totalDurationFrames / 30) * 1000,
    wordTimestamps: [],
    mouthCuesPerCharacter: mouthCuesPerCharacter as Record<CharacterId, MouthCue[]>,
    sfxTriggers: [],
  };

  // 4. Trim episode to 30 seconds for quick preview
  const previewScenes = episode.scenes.slice(0, 3);
  for (const scene of previewScenes) {
    scene.durationFrames = Math.min(scene.durationFrames, 180); // Max 6s per scene
  }
  const previewEpisode = {
    ...episode,
    scenes: previewScenes,
    totalDurationFrames: 450 + previewScenes.reduce((s, sc) => s + sc.durationFrames, 0) + 300 + 300,
  };

  const totalFrames = previewEpisode.totalDurationFrames;
  console.log(`\n  Preview: ${totalFrames} frames (${(totalFrames / 30).toFixed(1)}s)`);

  // 5. Bundle and render
  console.log('\n  Bundling Remotion project...');
  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, '../src/index.ts'),
    onProgress: (p) => {
      if (p === 100) console.log('  Bundle complete.');
    },
  });

  const inputProps = {
    episode: previewEpisode,
    audioData,
    language: lang,
  };

  console.log('  Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'Preview',
    inputProps,
  });

  const outputPath = path.resolve(__dirname, '../output/preview-episode-1.mp4');
  console.log(`  Rendering to ${outputPath}...`);

  await renderMedia({
    composition: { ...composition, durationInFrames: totalFrames },
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 20 === 0) {
        process.stdout.write(`\r  Rendering: ${Math.round(progress * 100)}%`);
      }
    },
  });

  console.log(`\n\n✅ Preview rendered: ${outputPath}`);
  console.log(`   Duration: ${(totalFrames / 30).toFixed(1)} seconds`);
  console.log(`   Story: "${episode.title}"`);
  console.log(`   Moral: "${episode.moral.moralText}"\n`);
}

main().catch((err) => {
  console.error('❌ Preview failed:', err);
  process.exit(1);
});
