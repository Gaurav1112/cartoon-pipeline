#!/usr/bin/env bash
# Generates 30s silent CC0 placeholder MP3s for music slots.
# Real CC0 tracks should replace these per public/audio/music/MUSIC_SOURCING.md.
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)/public/audio/music"
mkdir -p "$DIR"

SLOTS=(
  happy_playful sad_gentle tense_suspense mysterious_ambient
  heroic_triumphant peaceful_calm scary_dark comedic_fun
  romantic_warm epic_grand
)

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg required to generate music placeholders" >&2
  exit 1
fi

for slot in "${SLOTS[@]}"; do
  out="$DIR/$slot.mp3"
  if [ -f "$out" ] && [ "$(wc -c < "$out")" -gt 1024 ]; then
    continue
  fi
  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i anullsrc=r=44100:cl=stereo -t 30 \
    -codec:a libmp3lame -b:a 128k "$out"
  echo "generated $out"
done
