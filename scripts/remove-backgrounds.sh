#!/bin/bash
# Remove white backgrounds from AI-generated character PNGs
# Requires: pip install rembg
cd /Users/racit/PersonalProject/cartoon-pipeline
for dir in public/characters/*/; do
  echo "Processing $dir..."
  for f in "$dir"*.png; do
    [ -f "$f" ] || continue
    rembg i "$f" "${f%.png}_transparent.png"
    mv "${f%.png}_transparent.png" "$f"
  done
done
echo "Done!"
