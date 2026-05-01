#!/usr/bin/env tsx
// Usage: npm run render:batch -- --limit 3
import * as fs from 'fs/promises';
import * as path from 'path';
import { renderEpisode } from '../src/pipeline/render-episode';
import type { EpisodeRegistry } from '../src/types';

async function main() {
  const limitArg = process.argv.indexOf('--limit');
  const limit = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : 3;

  console.log(`\n🎬 Batch rendering up to ${limit} episodes...\n`);

  // Load episode registry
  const registryPath = path.join('config', 'episode-registry.json');
  let registry: EpisodeRegistry;
  try {
    const data = await fs.readFile(registryPath, 'utf-8');
    registry = JSON.parse(data);
  } catch {
    registry = { episodes: {}, lastRendered: 0, lastUploaded: 0 };
  }

  const startEpisode = registry.lastRendered + 1;
  let rendered = 0;

  for (let ep = startEpisode; ep < startEpisode + limit; ep++) {
    try {
      console.log(`\n--- Episode ${ep} (${rendered + 1}/${limit}) ---`);
      const result = await renderEpisode(ep, 'output');

      // Update registry
      registry.episodes[ep] = {
        episodeNumber: ep,
        renderedAt: new Date().toISOString(),
        languages: {},
      };
      for (const lang of Object.keys(result.videos)) {
        registry.episodes[ep].languages[lang as keyof typeof result.videos] = {
          rendered: true,
          uploaded: false,
        };
      }
      registry.lastRendered = ep;

      // Save registry after each episode
      await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));

      rendered++;
      console.log(`✅ Episode ${ep} done (${(result.duration / 1000).toFixed(1)}s)`);
    } catch (error) {
      console.error(`❌ Episode ${ep} failed:`, error);
      break;
    }
  }

  console.log(`\n🏁 Batch complete: ${rendered}/${limit} episodes rendered.`);
}

main();
