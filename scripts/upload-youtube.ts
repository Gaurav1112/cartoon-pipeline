#!/usr/bin/env tsx
// Usage: npm run upload -- 42
import * as fs from 'fs/promises';
import * as path from 'path';
import { google } from 'googleapis';
import type { SupportedLanguage, ChannelConfig, MetadataFile, EpisodeRegistry } from '../src/types';
import { LANGUAGES } from '../src/types';

async function getAuthClient(language: SupportedLanguage) {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env[`YOUTUBE_REFRESH_TOKEN_${language.toUpperCase()}`];

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(`Missing YouTube credentials for language: ${language}`);
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

async function uploadToChannel(
  language: SupportedLanguage,
  videoPath: string,
  metadata: MetadataFile,
  channelConfig: ChannelConfig,
): Promise<string> {
  const auth = await getAuthClient(language);
  const youtube = google.youtube({ version: 'v3', auth });

  console.log(`  Uploading ${language}: "${metadata.title}"`);

  // Upload video
  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title.slice(0, 100), // YouTube title limit
        description: metadata.description.slice(0, 5000),
        tags: metadata.tags.slice(0, 30),
        categoryId: '1', // Film & Animation (better algorithmic placement)
        defaultLanguage: language === 'en' ? 'en' : language,
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false, // Family entertainment, not child-directed
      },
    },
    media: {
      body: (await import('fs')).createReadStream(videoPath),
    },
  });

  const videoId = res.data.id!;
  console.log(`  ✅ Uploaded: https://youtube.com/watch?v=${videoId}`);

  // Comment pinning removed — saves 50 quota units per video
  // and automated pinned comments are spam-flagged by YouTube

  return videoId;
}

async function main() {
  const episodeNumber = parseInt(process.argv[2], 10);

  if (isNaN(episodeNumber) || episodeNumber < 1) {
    console.error('Usage: npm run upload -- <episode_number>');
    process.exit(1);
  }

  console.log(`\n📤 Uploading episode ${episodeNumber} to all 7 channels...\n`);

  // Load channel configs
  const channelsData = await fs.readFile('config/channels.json', 'utf-8');
  const channels: ChannelConfig[] = JSON.parse(channelsData);

  // Load registry
  const registryPath = 'config/episode-registry.json';
  const registryData = await fs.readFile(registryPath, 'utf-8');
  const registry: EpisodeRegistry = JSON.parse(registryData);

  const episodeDir = path.join('output', `episode-${episodeNumber}`);
  let uploaded = 0;

  for (const lang of LANGUAGES) {
    const channel = channels.find((c) => c.language === lang);
    if (!channel) {
      console.log(`⚠️ No channel config for ${lang}, skipping`);
      continue;
    }

    const videoPath = path.join(episodeDir, `episode-${episodeNumber}-${lang}.mp4`);
    const metadataPath = path.join(episodeDir, `metadata-${lang}.json`);

    try {
      await fs.access(videoPath);
      const metadata: MetadataFile = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

      const videoId = await uploadToChannel(lang, videoPath, metadata, channel);

      // Update registry
      if (registry.episodes[episodeNumber]) {
        if (!registry.episodes[episodeNumber].languages[lang]) {
          registry.episodes[episodeNumber].languages[lang] = { rendered: true, uploaded: false };
        }
        registry.episodes[episodeNumber].languages[lang]!.uploaded = true;
        registry.episodes[episodeNumber].languages[lang]!.videoId = videoId;
      }

      uploaded++;
    } catch (error) {
      console.error(`❌ Failed to upload ${lang}:`, error);
    }
  }

  // Update registry
  if (uploaded === LANGUAGES.length) {
    registry.episodes[episodeNumber].uploadedAt = new Date().toISOString();
    registry.lastUploaded = Math.max(registry.lastUploaded, episodeNumber);
  }
  await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));

  console.log(`\n🏁 Upload complete: ${uploaded}/${LANGUAGES.length} channels.`);
}

main();
