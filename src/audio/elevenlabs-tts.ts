// ElevenLabs TTS adapter with content-addressed cache for full determinism.
//
// CONTRACT:
//   Same (text, voiceId, modelId, voiceSettings) tuple → bit-identical MP3 forever.
//   First render with new dialogue: hits the ElevenLabs API once, persists bytes to
//   `audio-cache/elevenlabs/<sha256>.mp3` (committed to repo).
//   Every subsequent render (local or CI): reads from cache, never touches network.
//
// This means the repo is self-contained for replay, and CI builds without
// ELEVENLABS_KEY succeed as long as cached bytes are present for every line.

import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

const ELEVENLABS_BASE = 'https://api.elevenlabs.io';
const DEFAULT_MODEL = 'eleven_multilingual_v2';

// Pinned voice settings — any change here invalidates the cache.
// Use semantic, low-variance settings for storytelling.
const DEFAULT_VOICE_SETTINGS = Object.freeze({
  stability: 0.55,
  similarity_boost: 0.85,
  style: 0.35,
  use_speaker_boost: true,
});

const CACHE_DIR = path.resolve(process.cwd(), 'audio-cache/elevenlabs');

export interface ElevenLabsRequest {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: Partial<typeof DEFAULT_VOICE_SETTINGS>;
}

// Stable, deterministic cache key.
// Any byte that influences output (text, voice, model, settings) is hashed in.
export function cacheKey(req: ElevenLabsRequest): string {
  const normalised = JSON.stringify({
    text: req.text,
    voiceId: req.voiceId,
    modelId: req.modelId ?? DEFAULT_MODEL,
    voiceSettings: { ...DEFAULT_VOICE_SETTINGS, ...(req.voiceSettings ?? {}) },
  });
  return crypto.createHash('sha256').update(normalised).digest('hex');
}

export function cachePath(req: ElevenLabsRequest): string {
  return path.join(CACHE_DIR, `${cacheKey(req)}.mp3`);
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// Render MP3 for the request, with cache.
// - If cached: copy cached bytes to `outputPath`. No network.
// - If not cached: require ELEVENLABS_KEY env, hit API, save to cache + outputPath.
// - If not cached AND no key: throw a loud, actionable error.
export async function generateElevenLabsTTS(
  req: ElevenLabsRequest,
  outputPath: string,
): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const cached = cachePath(req);

  if (await fileExists(cached)) {
    await fs.copyFile(cached, outputPath);
    return;
  }

  const apiKey = process.env.ELEVENLABS_KEY;
  if (!apiKey) {
    throw new Error(
      `[elevenlabs] cache miss for sha256=${cacheKey(req).slice(0, 12)}... ` +
        `and ELEVENLABS_KEY is not set. Either:\n` +
        `  (a) export ELEVENLABS_KEY=sk_... and re-run to populate the cache, OR\n` +
        `  (b) commit the missing cache file under audio-cache/elevenlabs/.\n` +
        `Text: ${JSON.stringify(req.text.slice(0, 80))}`,
    );
  }

  const body = {
    text: req.text,
    model_id: req.modelId ?? DEFAULT_MODEL,
    voice_settings: { ...DEFAULT_VOICE_SETTINGS, ...(req.voiceSettings ?? {}) },
  };

  const url = `${ELEVENLABS_BASE}/v1/text-to-speech/${encodeURIComponent(req.voiceId)}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '<no body>');
    throw new Error(
      `[elevenlabs] HTTP ${res.status} ${res.statusText}: ${errText.slice(0, 400)}`,
    );
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) {
    throw new Error(`[elevenlabs] suspiciously small audio response (${buf.length} bytes)`);
  }

  // Atomic write: tmp + rename. Avoids half-written cache poisoning the repo.
  const tmp = `${cached}.tmp`;
  await fs.writeFile(tmp, buf);
  await fs.rename(tmp, cached);
  await fs.copyFile(cached, outputPath);
}

// Convenience: bytes-only API for tests / inspection.
export async function getCachedBytes(req: ElevenLabsRequest): Promise<Buffer | null> {
  const p = cachePath(req);
  if (!(await fileExists(p))) return null;
  return fs.readFile(p);
}

export const ELEVENLABS_DEFAULTS = {
  modelId: DEFAULT_MODEL,
  voiceSettings: DEFAULT_VOICE_SETTINGS,
};
