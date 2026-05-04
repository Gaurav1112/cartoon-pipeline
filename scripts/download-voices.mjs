#!/usr/bin/env node
// Idempotent piper voice downloader. Skips files that already exist.
// Voices are NOT committed (305MB total) — this script is the deterministic
// way to materialize them on a fresh checkout.

import { createWriteStream, existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';

const BASE = 'https://huggingface.co/rhasspy/piper-voices/resolve/main';
const OUT_DIR = join(process.cwd(), 'public/voices/piper');

const VOICES = [
  'en/en_US/amy/medium/en_US-amy-medium.onnx',
  'en/en_US/amy/medium/en_US-amy-medium.onnx.json',
  'hi/hi_IN/pratham/medium/hi_IN-pratham-medium.onnx',
  'hi/hi_IN/pratham/medium/hi_IN-pratham-medium.onnx.json',
  'hi/hi_IN/priyamvada/medium/hi_IN-priyamvada-medium.onnx',
  'hi/hi_IN/priyamvada/medium/hi_IN-priyamvada-medium.onnx.json',
  'te/te_IN/maya/medium/te_IN-maya-medium.onnx',
  'te/te_IN/maya/medium/te_IN-maya-medium.onnx.json',
  'te/te_IN/venkatesh/medium/te_IN-venkatesh-medium.onnx',
  'te/te_IN/venkatesh/medium/te_IN-venkatesh-medium.onnx.json',
];

await mkdir(OUT_DIR, { recursive: true });

let downloaded = 0;
let skipped = 0;
for (const rel of VOICES) {
  const basename = rel.split('/').pop();
  const dest = join(OUT_DIR, basename);
  if (existsSync(dest)) {
    skipped++;
    continue;
  }
  const url = `${BASE}/${rel}`;
  process.stdout.write(`↓ ${basename} ... `);
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    console.error(`FAIL ${res.status}`);
    process.exit(1);
  }
  await mkdir(dirname(dest), { recursive: true });
  await pipeline(res.body, createWriteStream(dest));
  console.log('ok');
  downloaded++;
}

console.log(`done. downloaded=${downloaded} skipped=${skipped}`);
