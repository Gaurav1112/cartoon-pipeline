# Cartoon Pipeline — Project Rules

## Architecture
Fully automated cartoon YouTube channel pipeline.
- 7 Indian languages: Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, English
- 7 YouTube channels (one per language)
- Content: Panchatantra moral stories + animated riddles
- Visual: Anime-lite (Chhota Bheem style) SVG character rigs in Remotion
- Audio: edge-tts + ffmpeg pitch shifting (10 character voices per language, $0 cost)
- Upload: YouTube Data API v3, auto-scheduled Mon/Wed/Fri 6:15 PM IST

## Key Optimization
Render visual track ONCE → ffmpeg mux 7 audio tracks. 1 render = 7 videos.

## Constraints
1. **$0/month operating cost** — all free tools
2. **Deterministic** — same seed = same episode, always. No Math.random(), no LLM
3. **No manual intervention** — everything automated after initial setup
4. **Cultural authenticity** — each language has its own slang/dialogue bank, NOT translations

## Tech Stack
- Remotion 4.0, React 19, TypeScript
- edge-tts (free TTS, 7 Indian language voices)
- ffmpeg (voice transformation, audio mixing)
- Rhubarb (lip sync)
- YouTube Data API v3

## Characters (8 main + 10 animal skins)
Arjun (hero), Meera (smart girl), Bablu (comic), Guruji (wise elder),
Kaaliya (villain), Amma (mother), Raja (king), Moti (animal base rig)

## Commands
```bash
npm run render:episode -- 42          # Render episode 42 (all 7 languages)
npm run render:batch -- --limit 3     # Render next 3 episodes
npm run upload -- 42                  # Upload episode 42 to all 7 channels
npm run dashboard                     # Pipeline status
```
