// Piper TTS adapter — local, free, fully deterministic.
//
// Determinism contract:
//   1. Run piper with --noise-scale 0 --noise-w-scale 0 → bit-identical bytes
//      for the same (text, model). Verified locally.
//   2. Cache key = sha256(text + modelBasename + lengthScale).
//   3. Output WAV is decoded directly to the requested outputPath via ffmpeg
//      (re-encode to MP3) so the rest of the pipeline keeps its MP3 contract.
//   4. Atomic write: tmp → rename. Half-written cache cannot poison the repo.
//   5. Cache miss + missing voice file → throws actionable error pointing to
//      `npm run voices:download`.
//
// Why noise-scale=0 (not the natural default of 0.667):
//   The cache makes ElevenLabs deterministic AFTER first call. But the very
//   first render must also be reproducible across machines (CI vs local) so
//   that a teammate / cloud build reproduces the same audio without the
//   committed cache. Zero-noise piper guarantees that.

import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const CACHE_DIR = path.resolve(process.cwd(), 'audio-cache/piper');
const VOICES_DIR = path.resolve(process.cwd(), 'public/voices/piper');

export interface PiperRequest {
  text: string;
  modelBasename: string; // e.g. "hi_IN-pratham-medium"
  lengthScale?: number; // pacing; default 1.0
}

const PIPER_BIN = process.env.PIPER_BIN || 'piper';

function hashRequest(req: PiperRequest): string {
  const canonical = JSON.stringify({
    text: req.text,
    modelBasename: req.modelBasename,
    lengthScale: req.lengthScale ?? 1.0,
    noiseScale: 0,
    noiseWScale: 0,
  });
  return createHash('sha256').update(canonical).digest('hex');
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function runPiper(args: string[], stdin: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(PIPER_BIN, args, { stdio: ['pipe', 'inherit', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`[piper] exit ${code}: ${stderr.slice(-400)}`));
    });
    proc.stdin.write(stdin);
    proc.stdin.end();
  });
}

function runFfmpegWavToMp3(wavPath: string, mp3Path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-i', wavPath, '-codec:a', 'libmp3lame', '-q:a', '2', mp3Path],
      { stdio: ['ignore', 'inherit', 'pipe'] },
    );
    let stderr = '';
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`[ffmpeg wav→mp3] exit ${code}: ${stderr}`));
    });
  });
}

export async function generatePiperTTS(req: PiperRequest, outputPath: string): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const key = hashRequest(req);
  const cachedMp3 = path.join(CACHE_DIR, `${key}.mp3`);

  if (await exists(cachedMp3)) {
    await fs.copyFile(cachedMp3, outputPath);
    const vtt = outputPath.replace(/\.\w+$/, '.vtt');
    if (!(await exists(vtt))) await fs.writeFile(vtt, 'WEBVTT\n\n');
    return;
  }

  const modelPath = path.join(VOICES_DIR, `${req.modelBasename}.onnx`);
  if (!(await exists(modelPath))) {
    throw new Error(
      `[piper] voice missing: ${req.modelBasename}.onnx\n` +
        `  expected at: ${modelPath}\n` +
        `  fix: run \`npm run voices:download\``,
    );
  }

  const tmpWav = path.join(CACHE_DIR, `tmp_${key}.wav`);
  const tmpMp3 = path.join(CACHE_DIR, `tmp_${key}.mp3`);

  await runPiper(
    [
      '--model',
      modelPath,
      '--output_file',
      tmpWav,
      '--noise-scale',
      '0',
      '--noise-w-scale',
      '0',
      '--length-scale',
      String(req.lengthScale ?? 1.0),
    ],
    req.text,
  );

  if (!(await exists(tmpWav))) {
    throw new Error(`[piper] no wav produced for: ${req.text.slice(0, 60)}`);
  }

  await runFfmpegWavToMp3(tmpWav, tmpMp3);
  await fs.rename(tmpMp3, cachedMp3);
  await fs.unlink(tmpWav).catch(() => {});

  await fs.copyFile(cachedMp3, outputPath);
  const vtt = outputPath.replace(/\.\w+$/, '.vtt');
  if (!(await exists(vtt))) await fs.writeFile(vtt, 'WEBVTT\n\n');
}
