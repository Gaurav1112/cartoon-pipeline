# Automated Cartoon YouTube Channel Pipeline — Design Spec

**Date:** 2026-05-01
**Status:** Design
**Goal:** Fully automated cartoon channel generating episodes in 7 Indian languages, posting to YouTube, targeting $1,000/month revenue within 18-24 months.

---

## 1. HIGH-LEVEL DESIGN (HLD)

### 1.1 System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    CARTOON PIPELINE                               │
│                                                                  │
│  STORY ENGINE ──► AUDIO ENGINE ──► RENDER ENGINE ──► UPLOAD      │
│  (TypeScript)    (edge-tts+ffmpeg)  (Remotion/React)  (YT API)  │
│                                                                  │
│  Input: episode seed (topic + episode number)                    │
│  Output: 7 language versions uploaded to 7 YouTube channels      │
│  Cost: $0/month | Deterministic: yes | LLM: none               │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Constraints

| Constraint | Requirement |
|-----------|-------------|
| **Cost** | $0/month operating (all free tools) |
| **Deterministic** | Same seed → same episode, always. No Math.random(), no LLM |
| **Languages** | 7: Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, English |
| **Automation** | Zero human intervention after initial setup |
| **Tech stack** | Remotion (React), TypeScript, edge-tts, ffmpeg, Rhubarb, YouTube API |
| **Content** | Mix: moral stories (Panchatantra/folktales) + animated riddles |
| **Visual style** | Anime-lite (Chhota Bheem style) SVG character rigs |
| **Characters** | 8 main characters + animal skins |
| **Audience** | Indian families, NOT flagged "Made for Kids" (higher RPM) |

### 1.3 Data Flow

```
Episode Seed (topic_id + episode_number)
  │
  ├─► Story Engine
  │   ├─ Select story template (moral/adventure/riddle)
  │   ├─ Assign characters from pool
  │   ├─ Generate scene breakdown (8-15 scenes)
  │   ├─ Fill dialogue from 2,507-line dialogue bank per language
  │   └─ Output: EpisodeScript (JSON)
  │
  ├─► Audio Engine (×7 languages, parallel)
  │   ├─ Per-character TTS via edge-tts (language-specific voice)
  │   ├─ Voice transformation via ffmpeg (pitch/speed/EQ per character)
  │   ├─ Rhubarb lip sync → mouth cue JSON
  │   ├─ SFX triggering from scene keywords (150 SFX files)
  │   ├─ Background music selection (mood-based)
  │   ├─ Ambience loops per location
  │   ├─ 4-layer audio mix (dialogue + SFX + music + ambience)
  │   └─ Output: MasterAudio + WordTimestamps + MouthCues per language
  │
  ├─► Render Engine (×7 languages, sequential)
  │   ├─ CartoonComposition.tsx (Remotion)
  │   ├─ SVG character rigs with pose/expression/lip sync
  │   ├─ Background scenes (20-30 locations)
  │   ├─ Camera movements (pan, zoom, drift)
  │   ├─ Scene transitions
  │   ├─ Intro sequence (15s, same every episode)
  │   ├─ Outro sequence (10s, subscribe CTA)
  │   └─ Output: MP4 per language (1080p, 5-10 min)
  │
  ├─► Metadata Engine
  │   ├─ Deterministic title generation per language
  │   ├─ SEO description with keywords
  │   ├─ Tags, hashtags, playlist assignment
  │   ├─ Thumbnail extraction (best frame)
  │   └─ Output: metadata JSON per language
  │
  └─► Upload Engine
      ├─ YouTube Data API v3 (7 channels, 7 languages)
      ├─ Set thumbnail, playlist, metadata
      ├─ Auto-pin comment
      ├─ Schedule publish time
      └─ Delete local files after upload

Total: 1 episode seed → 7 videos (one per language) → 7 YouTube channels
```

### 1.4 Content Strategy

| Day | Content Type | Languages |
|-----|-------------|-----------|
| Mon | Moral Story Part 1 | All 7 |
| Wed | Moral Story Part 2 | All 7 |
| Fri | Riddle Episode | All 7 |

= 3 episodes/week × 7 languages = **21 uploads/week**

### 1.5 Revenue Model

| Channel | Language | Target Monthly Views | RPM | Monthly Revenue |
|---------|----------|---------------------|-----|----------------|
| 1 | Hindi | 2,000,000 | $0.60 | $1,200 |
| 2 | Telugu | 500,000 | $0.50 | $250 |
| 3 | Tamil | 500,000 | $0.50 | $250 |
| 4 | English | 200,000 | $5.00 | $1,000 |
| 5 | Kannada | 200,000 | $0.40 | $80 |
| 6 | Marathi | 200,000 | $0.40 | $80 |
| 7 | Bengali | 200,000 | $0.40 | $80 |
| **Total** | | **3,800,000** | | **$2,940/month** |

Target achievable in 18-24 months with consistent 3/week uploads.

---

## 2. LOW-LEVEL DESIGN (LLD)

### 2.1 Project Structure

```
cartoon-pipeline/
├── src/
│   ├── story/                    # Story Engine
│   │   ├── story-engine.ts       # Main episode generator
│   │   ├── templates/            # Story structure templates
│   │   │   ├── moral-story.ts    # Panchatantra/fable structure
│   │   │   ├── adventure.ts      # Hero's journey structure
│   │   │   ├── riddle.ts         # Riddle episode structure
│   │   │   └── folktale.ts       # Regional folktale adapter
│   │   ├── characters.ts         # 8 character definitions + animal skins
│   │   ├── settings.ts           # 30 location definitions
│   │   ├── conflicts.ts          # 50 conflict/problem templates
│   │   ├── morals.ts             # 100 moral/lesson templates
│   │   └── story-bank/           # 3,000+ public domain stories
│   │       ├── panchatantra.json # 87 stories
│   │       ├── aesop.json        # 725 fables
│   │       ├── jataka.json       # 547 tales
│   │       ├── hitopadesha.json  # 43 stories
│   │       ├── tenali-raman.json # 32 stories
│   │       ├── akbar-birbal.json # 50 stories
│   │       └── regional/         # Per-language folktales
│   │
│   ├── dialogues/                # Dialogue Bank (2,507+ lines)
│   │   ├── types.ts              # DialogueLine, DialogueBank interfaces
│   │   ├── hindi.ts              # 658 lines — street Hindi, Hinglish
│   │   ├── telugu.ts             # 444 lines — Hyderabadi + Andhra
│   │   ├── tamil.ts              # 415 lines — Chennai street Tamil
│   │   ├── kannada.ts            # 361 lines — Bangalore + North KA
│   │   ├── marathi.ts            # 329 lines — Mumbai/Pune Marathi
│   │   ├── bengali.ts            # 300 lines — Kolkata colloquial
│   │   ├── english.ts            # 500 lines — Indian English
│   │   ├── engine.ts             # Deterministic selection (mulberry32)
│   │   └── index.ts              # Public API
│   │
│   ├── audio/                    # Audio Engine
│   │   ├── cartoon-audio.ts      # Main audio pipeline
│   │   ├── voice-bank.ts         # edge-tts voices per language
│   │   ├── character-voices.ts   # 10 character profiles (pitch/speed/EQ)
│   │   ├── emotion-prosody.ts    # Emotion → SSML prosody mapping
│   │   ├── sfx-triggers.ts       # Keyword → SFX mapping (150 sounds)
│   │   ├── ambience.ts           # Location → ambience loops
│   │   ├── music-selector.ts     # Mood → music track mapping
│   │   └── audio-mixer.ts       # 4-layer ffmpeg mix with sidechain
│   │
│   ├── characters/               # Character SVG Rigs
│   │   ├── CharacterRenderer.tsx # Main character React component
│   │   ├── rigs/                 # SVG rig files per character
│   │   │   ├── hero-child.svg    # Body parts as named groups
│   │   │   ├── smart-girl.svg
│   │   │   ├── naughty-sidekick.svg
│   │   │   ├── wise-elder.svg
│   │   │   ├── villain.svg
│   │   │   ├── mother.svg
│   │   │   ├── animal-base.svg   # Shared rig, skinnable
│   │   │   └── king.svg
│   │   ├── skins/                # Animal skins for animal-base rig
│   │   │   ├── fox.ts
│   │   │   ├── crow.ts
│   │   │   ├── lion.ts
│   │   │   ├── rabbit.ts
│   │   │   ├── turtle.ts
│   │   │   ├── monkey.ts
│   │   │   └── elephant.ts
│   │   ├── poses.ts              # 12 poses per character
│   │   ├── expressions.ts        # 8 expressions (happy/sad/angry/...)
│   │   └── lip-sync.ts           # Rhubarb cue → mouth shape
│   │
│   ├── scenes/                   # Scene Backgrounds
│   │   ├── BackgroundRenderer.tsx
│   │   ├── backgrounds/          # 30 location SVGs
│   │   │   ├── forest.svg
│   │   │   ├── village.svg
│   │   │   ├── palace.svg
│   │   │   ├── river.svg
│   │   │   ├── market.svg
│   │   │   └── ... (25 more)
│   │   └── props/                # 50+ scene props
│   │       ├── tree.svg
│   │       ├── pot.svg
│   │       └── ...
│   │
│   ├── compositions/             # Remotion Compositions
│   │   ├── CartoonEpisode.tsx     # Main composition (5-10 min)
│   │   ├── IntroSequence.tsx      # 15s series intro (same every ep)
│   │   ├── OutroSequence.tsx      # 10s subscribe CTA
│   │   ├── SceneRenderer.tsx      # Single scene with characters
│   │   ├── DialogueBubble.tsx     # Speech bubble overlay
│   │   ├── TransitionEffects.tsx  # Scene wipes/fades
│   │   ├── RiddleScene.tsx        # Special: riddle with 3 options
│   │   └── MoralCard.tsx          # End-of-story moral display
│   │
│   ├── pipeline/                 # Orchestration
│   │   ├── episode-generator.ts  # Seed → complete episode data
│   │   ├── render-episode.ts     # Episode data → MP4
│   │   ├── storyboard.ts         # Scene layout + timing
│   │   └── metadata-generator.ts # Title/description/tags per language
│   │
│   └── types.ts                  # All TypeScript interfaces
│
├── scripts/
│   ├── render-episode.ts         # CLI: render single episode
│   ├── batch-render.ts           # CLI: render batch of episodes
│   ├── upload-youtube.ts         # CLI: upload to YouTube
│   ├── auto-publish.ts           # CLI: scheduled publishing
│   └── dashboard.ts              # CLI: pipeline status
│
├── public/
│   ├── audio/
│   │   ├── sfx/                  # 150 sound effect files
│   │   ├── music/                # 10 mood-based music tracks
│   │   ├── ambience/             # 10 location ambience loops
│   │   └── theme/                # Intro/outro theme music
│   └── fonts/                    # Indian language fonts
│
├── .github/
│   └── workflows/
│       ├── render-episodes.yml   # Nightly: render 3 episodes × 7 langs
│       └── auto-publish.yml      # Daily: upload scheduled episodes
│
├── config/
│   ├── channels.json             # 7 YouTube channel configs
│   ├── publish-queue.json        # Episode publish schedule
│   └── episode-registry.json     # Track rendered/uploaded episodes
│
└── content/
    └── stories/                  # 3,000+ story source files
        ├── panchatantra/
        ├── aesop/
        ├── jataka/
        └── regional/
```

### 2.2 Character System

#### 8 Main Characters

| # | Name | Archetype | Voice Profile | Design |
|---|------|-----------|--------------|--------|
| 1 | **Arjun** | Hero child | Pitch +3, Speed 1.1x | Brave boy, orange outfit, confident pose |
| 2 | **Meera** | Smart girl | Pitch +2, Speed 1.15x | Clever girl, blue outfit, book in hand |
| 3 | **Bablu** | Naughty sidekick | Pitch +5, Speed 1.3x, Nasal EQ | Round, always eating, comic relief |
| 4 | **Guruji** | Wise elder | Pitch -2, Speed 0.85x, Warm EQ | White beard, staff, calm demeanor |
| 5 | **Kaaliya** | Villain | Pitch -4, Speed 0.9x, Reverb | Dark outfit, sharp features, menacing |
| 6 | **Amma** | Mother | Pitch -1, Speed 0.95x, Warm EQ | Sari, warm smile, gentle |
| 7 | **Raja** | King/Authority | Pitch 0, Speed 1.0x | Crown, royal robes, commanding |
| 8 | **Moti** | Animal companion | Base rig with skins | Same skeleton, different SVG skins |

#### Animal Skins (for Moti rig)
Fox, Crow, Lion, Rabbit, Turtle, Monkey, Elephant, Mouse, Snake, Deer

#### 12 Poses per Character
idle_stand, idle_sit, walk_cycle, talk_gesture, point, surprised, sad, angry, laugh, think, wave, celebrate

#### 8 Expressions
neutral, happy, sad, angry, scared, surprised, thinking, determined

#### Lip Sync (8 mouth shapes from Rhubarb)
A (open), B (closed), C (half-open), D (wide), E (narrow), F (teeth), G (round), H (tight)

### 2.3 Story Engine

#### Story Templates

```typescript
interface StoryTemplate {
  id: string;
  type: 'moral' | 'adventure' | 'riddle' | 'folktale';
  acts: ActTemplate[];
  requiredCharacters: CharacterArchetype[];
  settingType: LocationType;
  moralCategory: string;
}

// Example: Panchatantra Moral Story
const MORAL_STORY: StoryTemplate = {
  id: 'moral-classic',
  type: 'moral',
  acts: [
    { name: 'setup', scenes: 2, purpose: 'introduce characters + world' },
    { name: 'conflict', scenes: 3, purpose: 'problem arises, naive attempt fails' },
    { name: 'rising', scenes: 3, purpose: 'mentor insight, real solution emerges' },
    { name: 'climax', scenes: 2, purpose: 'solution applied, dramatic moment' },
    { name: 'resolution', scenes: 2, purpose: 'moral delivered, characters reflect' },
  ],
  requiredCharacters: ['hero_child', 'wise_elder', 'villain'],
  settingType: 'forest',
  moralCategory: 'wisdom',
};
```

#### Deterministic Episode Generation

```typescript
function generateEpisode(topicId: number, episodeNumber: number): CartoonEpisode {
  // Seed everything from topic + episode
  const seed = topicId * 10000 + episodeNumber;

  // 1. Select story template
  const template = STORY_TEMPLATES[seed % STORY_TEMPLATES.length];

  // 2. Select source story (if adapting public domain)
  const story = STORY_BANK[seed % STORY_BANK.length];

  // 3. Assign characters
  const characters = assignCharacters(template.requiredCharacters, seed);

  // 4. Select setting/location
  const location = LOCATIONS[seed % LOCATIONS.length];

  // 5. Generate scenes with dialogue references
  const scenes = generateScenes(template, story, characters, location, seed);

  // 6. Select moral
  const moral = MORALS[seed % MORALS.length];

  return { title: story.title, characters, scenes, moral, seed };
}
```

### 2.4 Audio Pipeline

```
Per episode, per language:

1. Split script into per-character lines
2. For each line:
   a. edge-tts generate (language-specific voice)
   b. ffmpeg pitch/speed/EQ transform (character profile)
   c. Rhubarb lip sync → mouth cues
3. Generate effort sounds (gasps, laughs) between lines
4. Trigger SFX from scene keywords
5. Select background music by scene mood
6. Select ambience loops by location
7. 4-layer ffmpeg mix:
   - Dialogue: -3 to -6 dB (loudest)
   - SFX: -8 to -12 dB (ducked during dialogue)
   - Music: -14 to -18 dB (ducked to -24 dB during dialogue)
   - Ambience: -18 to -24 dB
8. Output: master_audio.mp3 + timestamps.json + mouth_cues.json
```

**Cost: $0** — edge-tts (free) + ffmpeg (free) + Rhubarb (free)

### 2.5 Render Engine (Remotion)

```typescript
// CartoonEpisode.tsx — Main Remotion Composition
const CartoonEpisode: React.FC<CartoonEpisodeProps> = ({
  episode,    // EpisodeScript with scenes, characters, dialogue
  audioData,  // MasterAudioResult with timestamps, mouth cues
  language,   // 'hi' | 'ta' | 'te' | 'kn' | 'mr' | 'bn' | 'en'
}) => {
  return (
    <AbsoluteFill>
      {/* 15s Intro */}
      <Sequence from={0} durationInFrames={450}>
        <IntroSequence />
      </Sequence>

      {/* Episode scenes via TransitionSeries */}
      <Sequence from={450}>
        <TransitionSeries>
          {episode.scenes.map((scene, idx) => (
            <SceneRenderer
              key={idx}
              background={scene.location}
              characters={scene.characters}
              mouthCues={audioData.mouthCuesPerCharacter}
              dialogue={scene.dialogue}
              sfxTriggers={audioData.sfxTriggers}
            />
          ))}
        </TransitionSeries>
      </Sequence>

      {/* Moral card (last 10s) */}
      <MoralCard moral={episode.moral} />

      {/* 10s Outro */}
      <OutroSequence />

      {/* Master audio */}
      <Audio src={audioData.masterAudioPath} />
    </AbsoluteFill>
  );
};
```

### 2.6 Upload & Distribution

| Channel | Language | YouTube Account | Playlist Strategy |
|---------|----------|----------------|-------------------|
| 1 | Hindi | guru-sishya-cartoon-hi | Per-series + per-character |
| 2 | Telugu | guru-sishya-cartoon-te | Per-series |
| 3 | Tamil | guru-sishya-cartoon-ta | Per-series |
| 4 | Kannada | guru-sishya-cartoon-kn | Per-series |
| 5 | Marathi | guru-sishya-cartoon-mr | Per-series |
| 6 | Bengali | guru-sishya-cartoon-bn | Per-series |
| 7 | English | guru-sishya-cartoon-en | Per-series + per-moral |

### 2.7 Metadata (Deterministic)

```typescript
function generateCartoonMetadata(
  episode: CartoonEpisode,
  language: SupportedLanguage,
  episodeNumber: number,
): MetadataFile {
  const titleTemplates = TITLE_TEMPLATES[language];
  const seed = hash(episode.title + language + episodeNumber);

  return {
    title: titleTemplates[seed % titleTemplates.length]
      .replace('{story}', episode.title)
      .replace('{character}', episode.characters[0].name),
    description: generateDescription(episode, language),
    tags: getCartoonTags(episode, language),
    playlistTitle: `${episode.seriesName} — ${LANGUAGE_NAMES[language]}`,
  };
}
```

---

## 3. ARCHITECTURE MAP

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GITHUB ACTIONS                              │
│                                                                     │
│  ┌───────────────────────────────────────┐                         │
│  │ NIGHTLY 2 AM IST: Render Pipeline     │                         │
│  │                                       │                         │
│  │  Episode Seed                         │                         │
│  │    │                                  │                         │
│  │    ├─► Story Engine                   │                         │
│  │    │   └─► EpisodeScript.json         │                         │
│  │    │                                  │                         │
│  │    ├─► Audio Engine (×7 parallel)     │                         │
│  │    │   ├─► hindi/master.mp3           │                         │
│  │    │   ├─► telugu/master.mp3          │                         │
│  │    │   ├─► tamil/master.mp3           │                         │
│  │    │   ├─► kannada/master.mp3         │                         │
│  │    │   ├─► marathi/master.mp3         │                         │
│  │    │   ├─► bengali/master.mp3         │                         │
│  │    │   └─► english/master.mp3         │                         │
│  │    │                                  │                         │
│  │    ├─► Remotion Render (×7 sequential)│                         │
│  │    │   └─► 7 × episode.mp4           │                         │
│  │    │                                  │                         │
│  │    └─► Metadata (×7)                  │                         │
│  │        └─► 7 × metadata.json          │                         │
│  └───────────────────────────────────────┘                         │
│                                                                     │
│  ┌───────────────────────────────────────┐                         │
│  │ DAILY UPLOAD SCHEDULE                 │                         │
│  │                                       │                         │
│  │  Mon/Wed/Fri 6:15 PM IST              │                         │
│  │    │                                  │                         │
│  │    ├─► Upload to 7 YouTube channels   │                         │
│  │    ├─► Set thumbnail per channel      │                         │
│  │    ├─► Add to language playlist       │                         │
│  │    ├─► Pin comment (guru-sishya.in)   │                         │
│  │    └─► Delete artifacts (3-day TTL)   │                         │
│  └───────────────────────────────────────┘                         │
│                                                                     │
│  Content Scale:                                                     │
│  3 episodes/week × 7 languages = 21 videos/week                   │
│  52 weeks × 21 = 1,092 videos/year                                │
│  3,000+ stories available = 19+ years of content                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. COST ANALYSIS

| Component | Tool | Cost | Notes |
|-----------|------|------|-------|
| Story generation | TypeScript templates | $0 | Deterministic |
| TTS voices | edge-tts | $0 | Microsoft free API |
| Voice transformation | ffmpeg | $0 | Open source |
| Lip sync | Rhubarb | $0 | Open source |
| SFX library | freesound.org + Pixabay | $0 | Download once |
| Background music | YouTube Audio Library | $0 | Royalty-free |
| Animation rendering | Remotion (OSS) | $0 | Local or GitHub Actions |
| Video upload | YouTube Data API v3 | $0 | Free quota (6 uploads/day) |
| Compute | GitHub Actions free tier | $0 | 2,000 min/month |
| **TOTAL** | | **$0/month** | |

One-time costs:
- Character SVG rigs (commission or DIY): $0-500
- SFX library download: $0
- Font licenses (free Indian fonts): $0

---

## 5. TIMELINE

| Month | Milestone | Output |
|-------|-----------|--------|
| 1 | Story engine + dialogue bank + character design | Templates working, 8 SVG rigs |
| 2 | Audio pipeline + Remotion composition | 1 episode rendering end-to-end |
| 3 | Quality tuning + all 7 languages | 10 test episodes across languages |
| 4 | **Launch** — 3 episodes/week × 7 languages | 21 uploads/week |
| 5-7 | Growth phase, iteration | 1K subs per channel target |
| 8-12 | Monetization approved | First revenue |
| 13-18 | Scale + optimize | $500-1,000/month |
| 18-24 | **Target: $1,000+/month** | Mature channels |

---

## 6. RISKS & MITIGATIONS

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| YouTube "repetitious content" flag | Medium | High | Vary backgrounds, character combos, story structures heavily |
| Low view count | Medium | Medium | SEO optimization, Shorts strategy, cross-promotion |
| edge-tts API changes | Low | High | Fallback: Bark (local, open source) |
| Character art quality too low | Medium | Medium | Commission professional SVGs ($200-500) |
| YouTube API quota exceeded | Low | Medium | Spread uploads across 2 API projects |
| COPPA compliance issues | Low | High | Target 10+ age group, NOT "Made for Kids" |

---

## 7. WHAT TO REUSE FROM VIDEO-PIPELINE

| Component | Reusable? | Notes |
|-----------|----------|-------|
| Remotion rendering | Yes | Same framework, different compositions |
| edge-tts integration | Yes | Same TTS engine, add pitch shifting |
| Rhubarb lip sync | Yes | Already integrated |
| audio-stitcher.ts | Yes | Same concept, add SFX/music mixing |
| upload-youtube.ts | Yes | Same API, different channels |
| auto-publish.ts | Partial | Adapt for 7-channel management |
| metadata-generator.ts | Partial | New templates for cartoon content |
| GitHub Actions workflows | Yes | Same structure, different scripts |
| sfx-triggers.ts | Partial | Expand keyword map for cartoon SFX |

**Estimated code reuse: 40-50%** — the infrastructure exists, content layer is new.
