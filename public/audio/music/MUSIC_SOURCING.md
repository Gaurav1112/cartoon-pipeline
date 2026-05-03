# 🎵 Background Music — CC0 Sourcing Checklist

These tracks are referenced by `src/audio/music-selector.ts`. The repo currently
ships **silent 30s placeholders** so renders never fail. To go from 1/10 to 10/10
audio, replace each placeholder with a real CC0-licensed track from the
sources below. **Do not commit anything that is not CC0 / Public Domain / a
license that allows commercial use without attribution requirements that would
break automated 7-channel uploads.**

## Required tracks (10)

| Mood        | File symlink (do not rename)   | Style hint                                     |
|-------------|--------------------------------|-----------------------------------------------|
| happy       | `happy_playful.mp3`            | 120 BPM, major key, ukulele/glock              |
| sad         | `sad_gentle.mp3`               | 72 BPM, minor key, solo piano/strings          |
| tense       | `tense_suspense.mp3`           | 90 BPM, drone + low brass pulses               |
| mysterious  | `mysterious_ambient.mp3`       | 80 BPM, sparse marimba, sub-bass               |
| heroic      | `heroic_triumphant.mp3`        | 130 BPM, taiko + brass swells                  |
| peaceful    | `peaceful_calm.mp3`            | 65 BPM, sitar/flute pad, very low motion       |
| scary       | `scary_dark.mp3`               | 70 BPM, cluster strings, breathy drone         |
| comedic     | `comedic_fun.mp3`              | 140 BPM, plucked staccato, kazoo accents       |
| romantic    | `romantic_warm.mp3`            | 85 BPM, harp + soft pad                        |
| epic        | `epic_grand.mp3`               | 110 BPM, orchestral hits + choir oohs          |

## How to replace a placeholder

```bash
# 1. Download a CC0 track from one of the sources below.
# 2. Re-encode to mono/stereo MP3 -14 LUFS (matches our master loudnorm).
ffmpeg -i original.wav -af loudnorm=I=-14:LRA=11:TP=-1.5 -b:a 192k happy_real.mp3
# 3. Drop into public/audio/music/ and replace the symlink target.
rm public/audio/music/happy_playful.mp3
mv happy_real.mp3 public/audio/music/happy_playful.mp3
# 4. Append to LICENSE.md (filename, source URL, license).
```

## $0 sources (verified safe-for-monetization, 2024+)

1. **Pixabay Music** — https://pixabay.com/music/ — CC0 / Pixabay License (commercial OK, no attribution required)
2. **YouTube Audio Library** — https://www.youtube.com/audiolibrary — Filter to "No attribution" tracks
3. **FreePD** — https://freepd.com/ — Public Domain
4. **Free Music Archive — Public Domain only** — https://freemusicarchive.org/ — Filter strictly to "Public Domain"
5. **Incompetech (Kevin MacLeod)** — https://incompetech.com/ — CC-BY 4.0 (attribution **IS** required → only use if you commit attribution to channel description for ALL 7 channels)
6. **Bensound — Free tier** — Free tier requires attribution; the **Pro tier** is paid → SKIP unless paying.

## Indian/Raga-specific (Rahman lens)

Pixabay search terms that surface usable CC0 Indian music:
- "tabla", "sitar", "raga", "indian classical", "bansuri flute"
- Filter: License = "Pixabay License", Sort by Editor's Choice

## DO NOT use

- ❌ Spotify rips, YouTube rips, "free MP3" download sites without explicit license
- ❌ Any track marked "Royalty Free" without checking the actual license text
- ❌ Epidemic Sound, Artlist, MusicBed (subscription-required, breaks $0 rule)
- ❌ AI-generated music if YouTube Aug-2024 policy applies (case-by-case)

## Verification before commit

```bash
# Make sure every required filename resolves to a non-empty audio file:
for f in happy_playful sad_gentle tense_suspense mysterious_ambient \
         heroic_triumphant peaceful_calm scary_dark comedic_fun \
         romantic_warm epic_grand; do
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 \
    "public/audio/music/${f}.mp3" || echo "MISSING: ${f}"
done
```
