#!/usr/bin/env tsx
// Usage: npm run dashboard
import * as fs from 'fs/promises';
import type { EpisodeRegistry, PublishQueue } from '../src/types';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function c(color: keyof typeof COLORS, text: string): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

async function main() {
  console.log(c('bold', '\n  🎬 GURU SISHYA — Pipeline Dashboard\n'));
  console.log(c('dim', '  ' + '═'.repeat(50)));

  // Load registry
  let registry: EpisodeRegistry;
  try {
    const data = await fs.readFile('config/episode-registry.json', 'utf-8');
    registry = JSON.parse(data);
  } catch {
    registry = { episodes: {}, lastRendered: 0, lastUploaded: 0 };
  }

  // Load queue
  let queue: PublishQueue;
  try {
    const data = await fs.readFile('config/publish-queue.json', 'utf-8');
    queue = JSON.parse(data);
  } catch {
    queue = { queue: [], schedule: { days: [], time: '', timezone: '' } };
  }

  const episodes = Object.values(registry.episodes);
  const totalRendered = episodes.filter((e) => e.renderedAt).length;
  const totalUploaded = episodes.filter((e) => e.uploadedAt).length;
  const pendingUpload = totalRendered - totalUploaded;

  // ─── Summary ──────────────────────────────────────
  console.log(`\n  ${c('cyan', '📊 Summary')}`);
  console.log(`  Total episodes rendered:  ${c('green', String(totalRendered))}`);
  console.log(`  Total episodes uploaded:  ${c('green', String(totalUploaded))}`);
  console.log(`  Pending upload:           ${pendingUpload > 0 ? c('yellow', String(pendingUpload)) : c('green', '0')}`);
  console.log(`  Last rendered:            Episode ${c('bold', String(registry.lastRendered))}`);
  console.log(`  Last uploaded:            Episode ${c('bold', String(registry.lastUploaded))}`);

  // ─── Per-language breakdown ───────────────────────
  console.log(`\n  ${c('cyan', '🌐 Per-Language Status')}`);
  const langs = ['hi', 'te', 'ta', 'kn', 'mr', 'bn', 'en'] as const;
  const langNames: Record<string, string> = {
    hi: 'Hindi   ', te: 'Telugu  ', ta: 'Tamil   ',
    kn: 'Kannada ', mr: 'Marathi ', bn: 'Bengali ', en: 'English ',
  };

  for (const lang of langs) {
    let rendered = 0;
    let uploaded = 0;
    for (const ep of episodes) {
      if (ep.languages[lang]?.rendered) rendered++;
      if (ep.languages[lang]?.uploaded) uploaded++;
    }
    const status = uploaded === rendered && rendered > 0
      ? c('green', '✓ synced')
      : rendered > uploaded
        ? c('yellow', `${rendered - uploaded} pending`)
        : c('dim', 'no data');
    console.log(`  ${langNames[lang]} | Rendered: ${rendered} | Uploaded: ${uploaded} | ${status}`);
  }

  // ─── Recent activity ──────────────────────────────
  console.log(`\n  ${c('cyan', '📋 Recent Activity (last 5)')}`);
  const recent = episodes.slice(-5).reverse();
  if (recent.length === 0) {
    console.log(`  ${c('dim', 'No episodes yet')}`);
  } else {
    for (const ep of recent) {
      const status = ep.uploadedAt
        ? c('green', '✓ uploaded')
        : ep.renderedAt
          ? c('yellow', '⏳ pending upload')
          : c('red', '✗ not rendered');
      console.log(`  Episode ${String(ep.episodeNumber).padStart(3)} | ${status} | ${ep.renderedAt?.split('T')[0] ?? 'n/a'}`);
    }
  }

  // ─── Publish queue ────────────────────────────────
  console.log(`\n  ${c('cyan', '📅 Publish Queue')}`);
  console.log(`  Schedule: ${queue.schedule.days.join(', ')} at ${queue.schedule.time} ${queue.schedule.timezone}`);
  const pendingQueue = queue.queue.filter((e) => e.status === 'pending');
  if (pendingQueue.length === 0) {
    console.log(`  ${c('dim', 'Queue empty — will auto-schedule next episode')}`);
  } else {
    for (const entry of pendingQueue.slice(0, 5)) {
      console.log(`  Episode ${entry.episodeNumber} | ${entry.scheduledDate} | ${entry.status}`);
    }
  }

  console.log(`\n  ${c('dim', '═'.repeat(50))}\n`);
}

main();
