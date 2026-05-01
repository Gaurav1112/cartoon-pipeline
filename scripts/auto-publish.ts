#!/usr/bin/env tsx
// Scheduled publishing — only runs on Mon/Wed/Fri
import * as fs from 'fs/promises';
import type { PublishQueue, EpisodeRegistry } from '../src/types';

async function main() {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).toLowerCase();

  // Load publish queue
  const queueData = await fs.readFile('config/publish-queue.json', 'utf-8');
  const queue: PublishQueue = JSON.parse(queueData);

  // Check if today is a publish day
  if (!queue.schedule.days.includes(day)) {
    console.log(`📅 Today is ${day} — not a publish day. Skipping.`);
    return;
  }

  console.log(`\n📤 Auto-publish running on ${day}...\n`);

  // Find episodes scheduled for today
  const today = now.toISOString().split('T')[0];
  const todayEpisodes = queue.queue.filter(
    (entry) => entry.scheduledDate.startsWith(today) && entry.status === 'pending',
  );

  if (todayEpisodes.length === 0) {
    console.log('No episodes scheduled for today.');

    // Auto-schedule next unuploaded episode
    const registryData = await fs.readFile('config/episode-registry.json', 'utf-8');
    const registry: EpisodeRegistry = JSON.parse(registryData);
    const nextEpisode = registry.lastUploaded + 1;

    if (registry.episodes[nextEpisode]?.renderedAt) {
      console.log(`Auto-scheduling episode ${nextEpisode} for upload...`);
      // Trigger upload via the upload script
      const { execSync } = await import('child_process');
      execSync(`npx tsx scripts/upload-youtube.ts ${nextEpisode}`, { stdio: 'inherit' });
    } else {
      console.log(`Episode ${nextEpisode} not yet rendered. Nothing to publish.`);
    }
    return;
  }

  // Upload each scheduled episode
  for (const entry of todayEpisodes) {
    console.log(`Publishing episode ${entry.episodeNumber}...`);
    entry.status = 'uploading';
    await fs.writeFile('config/publish-queue.json', JSON.stringify(queue, null, 2));

    try {
      const { execSync } = await import('child_process');
      execSync(`npx tsx scripts/upload-youtube.ts ${entry.episodeNumber}`, { stdio: 'inherit' });
      entry.status = 'published';
    } catch {
      entry.status = 'failed';
      console.error(`❌ Failed to publish episode ${entry.episodeNumber}`);
    }

    await fs.writeFile('config/publish-queue.json', JSON.stringify(queue, null, 2));
  }

  // Cleanup: delete artifacts older than 3 days
  const { execSync } = await import('child_process');
  try {
    execSync('find output -maxdepth 1 -type d -mtime +3 -exec rm -rf {} +', { stdio: 'pipe' });
    console.log('🗑️ Cleaned up old artifacts (3-day TTL)');
  } catch {
    // Cleanup is best-effort
  }

  console.log('\n🏁 Auto-publish complete.');
}

main();
