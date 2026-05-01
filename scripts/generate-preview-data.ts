#!/usr/bin/env tsx
/**
 * Step 1: Generate episode data and write props JSON for Remotion.
 */
import * as fs from 'fs';
import * as path from 'path';
import { generateEpisode } from '../src/story/story-engine';
import { selectDialogueSequence } from '../src/dialogues';
import type { MasterAudioResult, CharacterId, MouthCue, CartoonEpisodeProps } from '../src/types';

const lang = 'en';
console.log('\n🎬 Generating Episode 1 preview data...\n');

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
  masterAudioPath: '',
  totalDurationMs: (episode.totalDurationFrames / 30) * 1000,
  wordTimestamps: [],
  mouthCuesPerCharacter: mouthCuesPerCharacter as Record<CharacterId, MouthCue[]>,
  sfxTriggers: [],
};

// 4. Trim to 30s preview (intro + 3 short scenes + moral + outro)
const previewScenes = episode.scenes.slice(0, 3);
for (const scene of previewScenes) {
  scene.durationFrames = Math.min(scene.durationFrames, 180); // 6s max per scene
}

const previewEpisode = {
  ...episode,
  scenes: previewScenes,
  totalDurationFrames: 450 + previewScenes.reduce((s, sc) => s + sc.durationFrames, 0) + 300 + 300,
};

const props: CartoonEpisodeProps = {
  episode: previewEpisode,
  audioData,
  language: lang,
};

// 5. Write props
const outputDir = path.resolve(__dirname, '../output');
fs.mkdirSync(outputDir, { recursive: true });
const propsPath = path.join(outputDir, 'preview-props.json');
fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));

console.log(`\n  Total frames: ${previewEpisode.totalDurationFrames} (${(previewEpisode.totalDurationFrames / 30).toFixed(1)}s)`);
console.log(`  Props written: ${propsPath}`);

// Print scene summary
console.log('\n  Scene breakdown:');
console.log('  ─────────────────────────────────────');
console.log('  0:00 - 0:15  Intro (Guru Sishya logo)');
let t = 15;
for (const scene of previewScenes) {
  const dur = scene.durationFrames / 30;
  const dialogueSummary = scene.dialogue.map(d => `${d.characterId}: "${d.text.slice(0, 40)}..."`).join('\n                 ');
  console.log(`  ${t.toFixed(0).padStart(4)}s - ${(t+dur).toFixed(0).padStart(4)}s  Scene ${scene.sceneIndex + 1}: ${scene.location} (${scene.mood})`);
  if (dialogueSummary) console.log(`                 ${dialogueSummary}`);
  t += dur;
}
console.log(`  ${t.toFixed(0).padStart(4)}s - ${(t+10).toFixed(0).padStart(4)}s  Moral Card: "${episode.moral.moralText}"`);
console.log(`  ${(t+10).toFixed(0).padStart(4)}s - ${(t+20).toFixed(0).padStart(4)}s  Outro (Subscribe CTA)`);
console.log('  ─────────────────────────────────────\n');
