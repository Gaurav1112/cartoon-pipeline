#!/usr/bin/env bash
# Procedural Indian-classical-flavored music generator.
# Replaces silent placeholders with raga-based ambient beds (drone + bansuri-
# like melody + tabla rhythm). Deterministic, $0, no external assets.
# See scripts/generate-music.mjs for raga selection + synthesis details.
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)/public/audio/music"
mkdir -p "$DIR"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg required to generate music tracks" >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "node required to generate music tracks" >&2
  exit 1
fi

node "$(cd "$(dirname "$0")" && pwd)/generate-music.mjs"
node "$(cd "$(dirname "$0")" && pwd)/generate-sfx.mjs"
