#!/usr/bin/env tsx
// Usage: npm run render:episode -- 42
import { renderEpisode } from '../src/pipeline/render-episode';

async function main() {
  const episodeNumber = parseInt(process.argv[2], 10);

  if (isNaN(episodeNumber) || episodeNumber < 1) {
    console.error('Usage: npm run render:episode -- <episode_number>');
    console.error('Example: npm run render:episode -- 42');
    process.exit(1);
  }

  console.log(`\n🎬 Rendering episode ${episodeNumber}...\n`);

  try {
    const result = await renderEpisode(episodeNumber, 'output');
    console.log(`\n✅ Episode ${episodeNumber} rendered successfully!`);
    console.log(`   Output: ${result.outputDir}`);
    console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);
    console.log(`   Videos: ${Object.keys(result.videos).join(', ')}`);
  } catch (error) {
    console.error(`\n❌ Failed to render episode ${episodeNumber}:`, error);
    process.exit(1);
  }
}

main();
