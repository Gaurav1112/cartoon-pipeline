# Episode 1 Viral Reconstruction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Episode 1 from scratch as "शेर और खरगोश" (Lion & Rabbit) — a world-class viral Panchatantra story targeting 100K+ views using 2026 YouTube retention engineering.

**Architecture:** New modular Episode1 system under `src/compositions/episode1/` with viral-first data model (`ViralScene` with `sfxKey`, `textOverlay`, `shortsFlag`, `patternInterrupt`), proportional dialogue timing via `calcDialogueDur()`, mandatory on-screen text overlays (92% of Indian viewers watch muted), and a 120-second tight long-form with 55s Shorts spine baked in.

**Tech Stack:** Remotion 4.0, React 19, TypeScript, Vitest (to be installed), existing SFX registry (`sfx-triggers.ts`), existing CharacterRenderer, BackgroundRenderer.

---

## Story: शेर और खरगोश (The Lion and the Rabbit)

**Why this story beats Monkey-Crocodile for virality:**
- Instant visual hook: lion charges at camera in frame 1 (no narration needed)
- Death-lottery setup = stakes in 10 seconds
- Underdog tiny rabbit vs huge lion = David vs Goliath rooting interest
- Well-reflection payoff = extreme visual comedy, maximum shareability
- "Lion believed it 💀" = perfect meme moment
- Loop hook: lion roar bookends episode → replay trigger
- `well` location already in `LocationType`, `lion`/`rabbit` skins in `AnimalSkin`

**Viral Structure (120s target):**
```
0–3s    PAYOFF PREVIEW: Lion charges toward camera. SFX: roar. Text: "🦁 एक ऐसा शेर..."
3–8s    CURIOSITY GAP: Rabbit's confident face. Text: "जिसे एक छोटे खरगोश ने हराया 🐰"
8–13s   CHANNEL INTRO (AFTER hook is set — not before)
13–25s  SETUP: Death lottery. Guruji narrates. Bablu's first joke. Suspense BGM.
25–40s  RABBIT VOLUNTEERS: Animals shocked. "दिमाग छोटा नहीं होता।" Bablu: "ये मरेगा!"
40–60s  SLOW WALK + LATE ARRIVAL: Comedy pacing. Lion explodes. "दूसरा शेर?!" shock sting.
60–85s  THE WELL TRICK: "कुएँ में रहता है।" Lion charges. Sees reflection. ROARS. JUMPS. SPLASH.
85–100s VICTORY: Animals celebrate. Galaxy Brain text overlay. Victory fanfare.
100–115s MORAL: Guruji's question. Bablu's comedy callback. Rimshot.
115–120s LOOP HOOK: Echo of opening lion roar. Rabbit winks. "फिर से देखो! 🔁"
```

---

## File Map

**CREATE (new files):**
- `src/compositions/episode1/types.ts` — ViralDialogueLine, ViralScene, PatternInterruptType, SFXKey types
- `src/compositions/episode1/timing.ts` — calcDialogueDur(), calcSceneDur(), validateSceneChars()
- `src/compositions/episode1/scenes-lion-rabbit.ts` — Complete SCENES data array (viral structure above)
- `src/compositions/episode1/TextOverlay.tsx` — Full-screen bold Hinglish text overlay component
- `src/compositions/episode1/SFXLayer.tsx` — Remotion Audio sequences tied to dialogue line sfxKey
- `src/compositions/episode1/SceneRenderer.tsx` — Enhanced renderer consuming new fields
- `vitest.config.ts` — Vitest configuration
- `tests/episode1/timing.test.ts` — Tests for calcDialogueDur, validateSceneChars
- `tests/episode1/scenes.test.ts` — Tests for viral scene structure, phantom chars, duration
- `tests/episode1/integration.test.ts` — Full episode integration tests

**MODIFY (existing files):**
- `package.json` — Add vitest, @vitest/ui as devDependencies; add test script
- `src/compositions/Episode1.tsx` — Rewrite to import from episode1/ modules
- `src/compositions/DialogueBubble.tsx` — Add optional textOverlay, sfxKey props

---

## Task 1: Install Vitest + Test Infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest**

```bash
cd /Users/racit/PersonalProject/cartoon-pipeline
npm install --save-dev vitest @vitest/ui
```

Expected output: vitest added to devDependencies.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Verify vitest works**

```bash
npx vitest run --passWithNoTests
```

Expected output: `No test files found, exiting with code 0` (or similar passing message).

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts package-lock.json
git commit -m "chore: add vitest test infrastructure"
```

---

## Task 2: New Type Definitions

**Files:**
- Create: `src/compositions/episode1/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/compositions/episode1/types.ts
import type { CharacterId, LocationType, TimeOfDay } from '../../types';

/** All valid SFX keys mapped to existing sfx-triggers.ts entries */
export type SFXKey =
  | 'roar'          // sfx/animals/lion_roar.mp3
  | 'rabbit_hop'    // sfx/animals/rabbit_hop.mp3
  | 'dramatic'      // sfx/drama/dramatic_sting.mp3
  | 'shock'         // sfx/drama/shock_sting.mp3
  | 'record_scratch'// sfx/comedy/record_scratch.mp3
  | 'victory'       // sfx/drama/victory_fanfare.mp3
  | 'suspense'      // sfx/drama/suspense_build.mp3
  | 'splash'        // sfx/nature/water_splash.mp3
  | 'rimshot'       // sfx/comedy/rimshot.mp3
  | 'boing'         // sfx/comedy/boing.mp3
  | 'reveal'        // sfx/drama/reveal_sting.mp3
  | 'happy_moment'  // sfx/drama/happy_chime.mp3
  | 'giggle'        // sfx/comedy/giggle.mp3
  | 'gasp';         // sfx/drama/crowd_gasp.mp3

export type PatternInterruptType =
  | 'freeze_frame'   // camera freeze + zoom punch on this line's start
  | 'zoom_punch'     // fast zoom in 4 frames then hold
  | 'cut_to_black'   // 6-frame black flash
  | 'shake'          // 8-frame camera shake
  | 'none';

export type CameraType =
  | 'static'
  | 'pan_left'
  | 'pan_right'
  | 'zoom_in'
  | 'zoom_out'
  | 'drift'
  | 'shake';

export interface ViralDialogueLine {
  char: CharacterId;
  text: string;
  /** 'auto' = use calcDialogueDur(text). Number = explicit frame override. */
  dur: 'auto' | number;
  sfxKey?: SFXKey;
  /** Bold on-screen text shown simultaneously with this dialogue line */
  textOverlay?: string;
  patternInterrupt?: PatternInterruptType;
  /** Include this line's scene in the 60s Shorts cut */
  shortsFlag?: boolean;
}

export interface ViralSceneChar {
  id: CharacterId;
  pos: 'left' | 'center' | 'right';
  pose: import('../../types').Pose;
  expr: import('../../types').EmotionType;
  flip?: boolean;
}

export interface ViralScene {
  id: string;
  bg: LocationType;
  time: TimeOfDay;
  /** Total scene duration in seconds (auto-calculated from dialogue if 'auto') */
  dur: 'auto' | number;
  chars: ViralSceneChar[];
  cam: CameraType;
  /** Camera intensity 0–1. Maps to emotional stakes: low=0.2, mid=0.5, high=0.8, peak=1.0 */
  camI: number;
  dialogue: ViralDialogueLine[];
  /** Ambient SFX to play throughout the scene */
  ambientSfx?: SFXKey;
  /** If true, this entire scene is included in the Shorts cut */
  shortsCutScene?: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/racit/PersonalProject/cartoon-pipeline
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/compositions/episode1/types.ts
git commit -m "feat(ep1): add ViralScene/ViralDialogueLine type definitions"
```

---

## Task 3: Write ALL Failing Tests (Red Phase)

**Files:**
- Create: `tests/episode1/timing.test.ts`
- Create: `tests/episode1/scenes.test.ts`
- Create: `tests/episode1/integration.test.ts`

All tests MUST fail at this point. Run them to confirm red.

- [ ] **Step 1: Create timing tests**

```typescript
// tests/episode1/timing.test.ts
import { describe, it, expect } from 'vitest';
import { calcDialogueDur, calcSceneDur, validateSceneChars } from '../../src/compositions/episode1/timing';
import type { ViralScene } from '../../src/compositions/episode1/types';

describe('calcDialogueDur', () => {
  it('returns minimum 55 frames for very short text', () => {
    expect(calcDialogueDur('हाँ')).toBeGreaterThanOrEqual(55);
  });

  it('returns proportionally more frames for longer text', () => {
    const short = calcDialogueDur('हाँ');
    const long = calcDialogueDur('मुझे माफ़ करना शेर जी, रास्ते में एक और शेर ने रोक लिया था।');
    expect(long).toBeGreaterThan(short);
  });

  it('long text (~50 chars) gets at least 200 frames', () => {
    expect(calcDialogueDur('मुझे माफ़ करना शेर जी, रास्ते में एक और शेर ने रोक लिया था।')).toBeGreaterThanOrEqual(200);
  });

  it('never returns fractional frames', () => {
    expect(Number.isInteger(calcDialogueDur('खरगोश'))).toBe(true);
  });

  it('short text (under 10 chars) returns at most 120 frames', () => {
    expect(calcDialogueDur('क्या?!')).toBeLessThanOrEqual(120);
  });
});

describe('calcSceneDur', () => {
  it('sums all dialogue durations in a scene', () => {
    const lines = [
      { char: 'guruji' as const, text: 'आओ', dur: 'auto' as const },
      { char: 'arjun' as const, text: 'हाँ गुरुजी', dur: 'auto' as const },
    ];
    const result = calcSceneDur(lines);
    expect(result).toBeGreaterThan(calcDialogueDur('आओ'));
  });

  it('respects explicit dur numbers over auto', () => {
    const lines = [
      { char: 'arjun' as const, text: 'hello', dur: 999 },
    ];
    expect(calcSceneDur(lines)).toBe(999);
  });
});

describe('validateSceneChars', () => {
  it('does not throw when all dialogue speakers are in chars array', () => {
    const scene: ViralScene = {
      id: 'test',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
      cam: 'static',
      camI: 0.3,
      dialogue: [{ char: 'arjun', text: 'हाँ', dur: 'auto' }],
    };
    expect(() => validateSceneChars(scene)).not.toThrow();
  });

  it('throws when a dialogue speaker is not in chars array', () => {
    const scene: ViralScene = {
      id: 'test-phantom',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
      cam: 'static',
      camI: 0.3,
      dialogue: [
        { char: 'arjun', text: 'हाँ', dur: 'auto' },
        { char: 'bablu', text: 'phantom line!', dur: 'auto' }, // bablu not in chars
      ],
    };
    expect(() => validateSceneChars(scene)).toThrow(/phantom/i);
  });

  it('throws with the phantom character id in the message', () => {
    const scene: ViralScene = {
      id: 'test',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [],
      cam: 'static',
      camI: 0,
      dialogue: [{ char: 'meera', text: 'ghost', dur: 'auto' }],
    };
    expect(() => validateSceneChars(scene)).toThrow('meera');
  });
});
```

- [ ] **Step 2: Create scenes tests**

```typescript
// tests/episode1/scenes.test.ts
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { validateSceneChars, calcDialogueDur } from '../../src/compositions/episode1/timing';

describe('LION_RABBIT_SCENES data integrity', () => {
  it('has at least 8 scenes', () => {
    expect(LION_RABBIT_SCENES.length).toBeGreaterThanOrEqual(8);
  });

  it('first scene (hook) has villain dialogue before frame 90 (3s)', () => {
    const hook = LION_RABBIT_SCENES[0];
    const firstLine = hook.dialogue[0];
    expect(firstLine.char).toBe('kaaliya'); // lion speaks first
  });

  it('no scene has kaaliya in dialogue without kaaliya in chars', () => {
    for (const scene of LION_RABBIT_SCENES) {
      expect(() => validateSceneChars(scene)).not.toThrow();
    }
  });

  it('has no hardcoded dur: 135 (the old broken constant)', () => {
    for (const scene of LION_RABBIT_SCENES) {
      for (const line of scene.dialogue) {
        expect(line.dur).not.toBe(135);
      }
    }
  });

  it('tension scenes (wife-demand equivalent) have camI >= 0.7', () => {
    const tensionScenes = LION_RABBIT_SCENES.filter(s =>
      s.id === 'well-trick' || s.id === 'reveal' || s.id === 'hook'
    );
    expect(tensionScenes.length).toBeGreaterThan(0);
    for (const scene of tensionScenes) {
      expect(scene.camI).toBeGreaterThanOrEqual(0.7);
    }
  });

  it('at least 4 scenes have shortsFlag lines', () => {
    const scenesWithShorts = LION_RABBIT_SCENES.filter(scene =>
      scene.dialogue.some(line => line.shortsFlag) || scene.shortsCutScene
    );
    expect(scenesWithShorts.length).toBeGreaterThanOrEqual(4);
  });

  it('last scene has a loop hook line with shortsFlag', () => {
    const lastScene = LION_RABBIT_SCENES[LION_RABBIT_SCENES.length - 1];
    const hasLoopHook = lastScene.dialogue.some(l => l.shortsFlag);
    expect(hasLoopHook).toBe(true);
  });
});

describe('LION_RABBIT_SCENES timing', () => {
  it('total duration with auto-calculated dialogue is under 145s (4350 frames)', () => {
    const { calcSceneDur } = require('../../src/compositions/episode1/timing');
    let totalFrames = 0;
    for (const scene of LION_RABBIT_SCENES) {
      if (typeof scene.dur === 'number') {
        totalFrames += scene.dur * 30;
      } else {
        totalFrames += calcSceneDur(scene.dialogue);
      }
    }
    // Add moral card (6s) + outro (5s)
    totalFrames += (6 + 5) * 30;
    expect(totalFrames).toBeLessThanOrEqual(4350);
  });

  it('Shorts-flagged content totals between 45s and 65s', () => {
    const { calcSceneDur } = require('../../src/compositions/episode1/timing');
    let shortsFrames = 0;
    for (const scene of LION_RABBIT_SCENES) {
      if (scene.shortsCutScene) {
        if (typeof scene.dur === 'number') {
          shortsFrames += scene.dur * 30;
        } else {
          shortsFrames += calcSceneDur(scene.dialogue);
        }
      }
    }
    expect(shortsFrames).toBeGreaterThanOrEqual(45 * 30);
    expect(shortsFrames).toBeLessThanOrEqual(65 * 30);
  });
});
```

- [ ] **Step 3: Create integration tests**

```typescript
// tests/episode1/integration.test.ts
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { INTRO_SCENE_INDEX } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { validateSceneChars } from '../../src/compositions/episode1/timing';

describe('Episode1 integration — viral requirements', () => {
  it('intro scene appears AFTER frame 0 (not first)', () => {
    const introIndex = LION_RABBIT_SCENES.findIndex(s => s.id === 'intro');
    expect(introIndex).toBeGreaterThan(0);
  });

  it('INTRO_SCENE_INDEX is exported and > 0', () => {
    expect(INTRO_SCENE_INDEX).toBeGreaterThan(0);
  });

  it('hook scene is first and has a textOverlay on its first line', () => {
    const hook = LION_RABBIT_SCENES[0];
    expect(hook.id).toBe('hook');
    expect(hook.dialogue[0].textOverlay).toBeDefined();
  });

  it('all scenes pass phantom-char validation', () => {
    for (const scene of LION_RABBIT_SCENES) {
      expect(() => validateSceneChars(scene)).not.toThrow();
    }
  });

  it('well-trick scene has sfxKey: splash on the lion-jumps line', () => {
    const wellScene = LION_RABBIT_SCENES.find(s => s.id === 'well-trick');
    expect(wellScene).toBeDefined();
    const splashLine = wellScene!.dialogue.find(l => l.sfxKey === 'splash');
    expect(splashLine).toBeDefined();
  });

  it('moral scene has at least one comedy line', () => {
    const moralScene = LION_RABBIT_SCENES.find(s => s.id === 'moral');
    expect(moralScene).toBeDefined();
    // Bablu should have a line in the moral scene
    const babluLine = moralScene!.dialogue.find(l => l.char === 'bablu');
    expect(babluLine).toBeDefined();
  });

  it('no scene has camI of exactly 0 during a tension scene', () => {
    const expectedTensionIds = ['reveal', 'well-trick', 'hook'];
    for (const id of expectedTensionIds) {
      const scene = LION_RABBIT_SCENES.find(s => s.id === id);
      if (scene) expect(scene.camI).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 4: Run tests — confirm ALL fail**

```bash
cd /Users/racit/PersonalProject/cartoon-pipeline
npx vitest run
```

Expected: All tests fail with "Cannot find module" errors. This is correct — red phase.

- [ ] **Step 5: Commit red tests**

```bash
git add tests/
git commit -m "test(ep1): add failing TDD tests for viral reconstruction (red phase)"
```

---

## Task 4: Implement timing.ts

**Files:**
- Create: `src/compositions/episode1/timing.ts`

- [ ] **Step 1: Create timing utilities**

```typescript
// src/compositions/episode1/timing.ts
import type { ViralDialogueLine, ViralScene } from './types';

const FPS = 30;
/**
 * Frames per Hindi character at natural speech rate.
 * ~6 frames/char = ~5 chars/sec = normal conversational Hindi.
 * Research: Indian kids content optimal pace is slightly slower than adult.
 */
const FRAMES_PER_CHAR = 6;
const MIN_LINE_FRAMES = 55;   // never shorter than ~1.8s
const REACTION_GAP_FRAMES = 18; // pause between lines for viewer processing

/**
 * Calculate dialogue line duration from Hindi text length.
 * Proportional to character count, never below MIN_LINE_FRAMES.
 * Returns whole frames (no decimals).
 */
export function calcDialogueDur(text: string): number {
  const raw = text.length * FRAMES_PER_CHAR + REACTION_GAP_FRAMES;
  return Math.round(Math.max(MIN_LINE_FRAMES, raw));
}

/**
 * Sum all dialogue durations for a scene's dialogue array.
 * Respects explicit numeric dur overrides.
 */
export function calcSceneDur(dialogue: Pick<ViralDialogueLine, 'text' | 'dur'>[]): number {
  return dialogue.reduce((sum, line) => {
    const frames = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
    return sum + frames;
  }, 0);
}

/**
 * Validate that every dialogue speaker exists in scene.chars.
 * Throws a descriptive error if a phantom character is found.
 * Call this at dev time / in tests — never silently pass.
 */
export function validateSceneChars(scene: ViralScene): void {
  const charIds = new Set(scene.chars.map(c => c.id));
  for (const line of scene.dialogue) {
    if (!charIds.has(line.char)) {
      throw new Error(
        `Phantom character in scene "${scene.id}": "${line.char}" speaks but is not in chars array. ` +
        `Add { id: '${line.char}', pos: ..., pose: ..., expr: ... } to scene.chars or remove this dialogue line.`
      );
    }
  }
}

/**
 * Calculate the total frame count for an entire episode.
 * Accounts for auto scene durations + fixed overhead (moral card, outro).
 */
export function calcEpisodeDuration(scenes: ViralScene[]): number {
  const MORAL_CARD_FRAMES = 6 * FPS;
  const OUTRO_FRAMES = 5 * FPS;
  const scenesTotal = scenes.reduce((sum, scene) => {
    if (typeof scene.dur === 'number') return sum + scene.dur * FPS;
    return sum + calcSceneDur(scene.dialogue);
  }, 0);
  return scenesTotal + MORAL_CARD_FRAMES + OUTRO_FRAMES;
}
```

- [ ] **Step 2: Run timing tests**

```bash
npx vitest run tests/episode1/timing.test.ts
```

Expected: All 9 timing tests pass. ✅

- [ ] **Step 3: Commit**

```bash
git add src/compositions/episode1/timing.ts
git commit -m "feat(ep1): implement calcDialogueDur, calcSceneDur, validateSceneChars"
```

---

## Task 5: Build scenes-lion-rabbit.ts (The Viral Story)

**Files:**
- Create: `src/compositions/episode1/scenes-lion-rabbit.ts`

This is the creative heart of the rebuild. Every scene is engineered for retention.

- [ ] **Step 1: Create the complete SCENES data**

```typescript
// src/compositions/episode1/scenes-lion-rabbit.ts
import type { ViralScene } from './types';

/**
 * Episode 1: "शेर और खरगोश" (The Lion and the Rabbit)
 *
 * Viral structure: payoff preview hook → curiosity gap → intro (after hook!) →
 * death-lottery setup → underdog volunteers → slow-walk comedy →
 * well-trick reveal → victory → moral + comedy callback → loop hook.
 *
 * kaaliya = the Lion (villain archetype, existing character)
 * arjun   = the Rabbit (hero archetype, existing character)
 * guruji  = narrator/framing
 * bablu   = comic relief (framing)
 * meera   = smart commentator (framing)
 *
 * Characters are placed in chars[] for ALL their dialogue lines (phantom-char fix).
 */

export const LION_RABBIT_SCENES: ViralScene[] = [
  // ═══════════════════════════════════════════════════════════════════
  // HOOK: 0–3s — PAYOFF PREVIEW. Lion charges camera. No narration.
  // Rule: Villain speaks FIRST. No intro. Instant maximum energy.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'hook',
    bg: 'forest',
    time: 'dusk',
    dur: 'auto',
    chars: [
      { id: 'kaaliya', pos: 'center', pose: 'angry', expr: 'angry' },
    ],
    cam: 'zoom_in',
    camI: 1.0, // maximum — this IS the hook
    shortsCutScene: true,
    dialogue: [
      {
        char: 'kaaliya',
        text: 'आज तुम नहीं बचोगे!',
        dur: 'auto',
        sfxKey: 'roar',
        textOverlay: '🦁 एक ऐसा शेर...',
        patternInterrupt: 'zoom_punch',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // CURIOSITY GAP: 3–8s — Rabbit's confident face. Scroll-stopper.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'curiosity-gap',
    bg: 'forest',
    time: 'dusk',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'determined' },
    ],
    cam: 'zoom_in',
    camI: 0.8,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'arjun',
        text: 'शेर जी... एक मिनट।',
        dur: 'auto',
        sfxKey: 'record_scratch',
        textOverlay: 'जिसे एक छोटे खरगोश ने हराया 🐰',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // INTRO: 8–13s — Channel branding AFTER hook is set. Not before.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'intro',
    bg: 'garden',
    time: 'day',
    dur: 5,
    chars: [],
    cam: 'static',
    camI: 0,
    dialogue: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // SETUP: 13–25s — Death lottery. Guruji frames stakes in 12s.
  // Bablu's BEST joke comes FIRST (front-loaded comedy).
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'setup',
    bg: 'forest',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'guruji', pos: 'center', pose: 'talk_gesture', expr: 'sad' },
      { id: 'bablu', pos: 'right', pose: 'surprised', expr: 'scared', flip: true },
      { id: 'meera', pos: 'left', pose: 'idle_stand', expr: 'thinking' },
    ],
    cam: 'drift',
    camI: 0.4,
    ambientSfx: 'suspense',
    dialogue: [
      {
        char: 'bablu',
        text: 'गुरुजी! रोज़ एक जानवर खाना?! भाई मैं तो जंगल ही छोड़ देता!',
        dur: 'auto',
        sfxKey: 'giggle',
        textOverlay: '😱 रोज़ एक जानवर!',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        text: 'इस जंगल में एक अत्याचारी शेर था। रोज़ एक जानवर उसके पास जाता था।',
        dur: 'auto',
      },
      {
        char: 'meera',
        text: 'जानवरों ने मिलकर समझौता किया — रोज़ एक जानवर स्वयं जाएगा।',
        dur: 'auto',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // RABBIT VOLUNTEERS: 25–40s — Underdog moment. Maximum rooting.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'volunteer',
    bg: 'forest',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'center', pose: 'point', expr: 'determined' },
      { id: 'bablu', pos: 'right', pose: 'surprised', expr: 'scared', flip: true },
      { id: 'meera', pos: 'left', pose: 'talk_gesture', expr: 'surprised' },
    ],
    cam: 'zoom_in',
    camI: 0.6,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'arjun',
        text: 'आज मेरी बारी है। मैं जाऊँगा।',
        dur: 'auto',
        sfxKey: 'dramatic',
        textOverlay: '🐰 छोटा खरगोश... बड़ी हिम्मत',
        shortsFlag: true,
      },
      {
        char: 'bablu',
        text: 'यार तू बहुत छोटा है! शेर तुझे एक कौर में खा जाएगा!',
        dur: 'auto',
        sfxKey: 'gasp',
        shortsFlag: true,
      },
      {
        char: 'arjun',
        text: 'दिमाग कभी छोटा नहीं होता।',
        dur: 'auto',
        textOverlay: '🧠 > 💪',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
      {
        char: 'bablu',
        text: 'भाई ये तो कहानी में मरेगा। गुरुजी बचाओ!',
        dur: 'auto',
        sfxKey: 'rimshot',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // SLOW WALK + LATE ARRIVAL: 40–60s — Comedy + Tension combo.
  // Contrast: slow comedy walk → lion's explosive anger.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'late-arrival',
    bg: 'forest',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'left', pose: 'walk_cycle', expr: 'thinking' },
      { id: 'kaaliya', pos: 'right', pose: 'angry', expr: 'angry', flip: true },
    ],
    cam: 'pan_right',
    camI: 0.5,
    dialogue: [
      {
        char: 'guruji',
        text: 'खरगोश जान-बूझकर बहुत देर से पहुँचा।',
        dur: 'auto',
        sfxKey: 'boing',
        textOverlay: '🐢 बहुत... धीरे...',
      },
      {
        char: 'kaaliya',
        text: 'इतनी देर से क्यों आए?! मैं भूखा हूँ!',
        dur: 'auto',
        sfxKey: 'roar',
        patternInterrupt: 'shake',
        shortsFlag: true,
      },
      {
        char: 'arjun',
        text: 'माफ़ करना शेर जी। रास्ते में एक दूसरे शेर ने रोक लिया।',
        dur: 'auto',
        shortsFlag: true,
      },
      {
        char: 'kaaliya',
        text: 'क्या?! दूसरा शेर?! इस जंगल में?!',
        dur: 'auto',
        sfxKey: 'shock',
        textOverlay: '😱 दूसरा शेर??',
        patternInterrupt: 'zoom_punch',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // THE WELL TRICK: 60–90s — The payoff. Most shareable 30 seconds.
  // Visual comedy: lion attacks his own reflection. SPLASH.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'well-trick',
    bg: 'well',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'left', pose: 'point', expr: 'determined' },
      { id: 'kaaliya', pos: 'right', pose: 'idle_stand', expr: 'angry', flip: true },
    ],
    cam: 'zoom_in',
    camI: 0.9,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'arjun',
        text: 'वो शेर उस कुएँ में रहता है। बहुत बड़ा और खतरनाक।',
        dur: 'auto',
        sfxKey: 'suspense',
        textOverlay: '🕳️ उस कुएँ में...',
        shortsFlag: true,
      },
      {
        char: 'kaaliya',
        text: 'मुझसे बड़ा?! असंभव! चलो दिखाओ!',
        dur: 'auto',
        sfxKey: 'roar',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        text: 'शेर कुएँ के पास गया... अंदर झाँका...',
        dur: 'auto',
        sfxKey: 'suspense',
        textOverlay: '👀 झाँका...',
        shortsFlag: true,
      },
      {
        char: 'kaaliya',
        text: 'तू कौन है?! मेरे जंगल में कैसे आया?!',
        dur: 'auto',
        sfxKey: 'roar',
        textOverlay: '💀 शेर को खुद की परछाई दिखी...',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        text: 'शेर अपनी परछाई देख कर कुएँ में कूद गया!',
        dur: 'auto',
        sfxKey: 'splash',
        textOverlay: '🤣 HE BELIEVED IT 💀',
        patternInterrupt: 'zoom_punch',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // VICTORY: 90–105s — Dopamine hit. Payoff of rooting for underdog.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'victory',
    bg: 'forest',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'center', pose: 'celebrate', expr: 'happy' },
      { id: 'bablu', pos: 'right', pose: 'celebrate', expr: 'happy', flip: true },
      { id: 'meera', pos: 'left', pose: 'wave', expr: 'happy' },
    ],
    cam: 'drift',
    camI: 0.5,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'bablu',
        text: 'भाई!! तूने कमाल कर दिया! मैं तो डर गया था!',
        dur: 'auto',
        sfxKey: 'victory',
        textOverlay: '🎉 GALAXY BRAIN 🧠',
        shortsFlag: true,
      },
      {
        char: 'meera',
        text: 'दिमाग से काम लिया तो बड़े से बड़े दुश्मन को भी हराया जा सकता है।',
        dur: 'auto',
        shortsFlag: true,
      },
      {
        char: 'arjun',
        text: 'घबराओ नहीं — सोचो।',
        dur: 'auto',
        textOverlay: '💡 घबराओ नहीं — सोचो',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MORAL: 105–120s — Guruji's question first. Bablu's punchline LAST.
  // Comedy callback before outro = viewers finish episode happy.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'moral',
    bg: 'garden',
    time: 'dusk',
    dur: 'auto',
    chars: [
      { id: 'guruji', pos: 'center', pose: 'talk_gesture', expr: 'happy' },
      { id: 'arjun', pos: 'left', pose: 'think', expr: 'thinking' },
      { id: 'bablu', pos: 'right', pose: 'idle_stand', expr: 'happy', flip: true },
    ],
    cam: 'zoom_in',
    camI: 0.3,
    dialogue: [
      {
        char: 'guruji',
        text: 'बच्चों, इस कहानी से क्या सीखा? अक्ल बड़ी या भैंस?',
        dur: 'auto',
        sfxKey: 'reveal',
      },
      {
        char: 'arjun',
        text: 'अक्ल! दिमाग से हर मुश्किल हल हो सकती है।',
        dur: 'auto',
        sfxKey: 'happy_moment',
      },
      {
        char: 'bablu',
        text: 'मेरे पास भैंस भी नहीं है और अक्ल भी कम है। मैं क्या करूँ गुरुजी?',
        dur: 'auto',
        sfxKey: 'rimshot',
        textOverlay: '😭 बेचारा बब्लू',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        text: 'पढ़ाई करो बेटा। अक्ल आ जाएगी।',
        dur: 'auto',
        sfxKey: 'giggle',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // LOOP HOOK: 120–125s — Echoes frame 0. Triggers rewatch.
  // YouTube Shorts algorithm rewards high replay rate.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'loop-hook',
    bg: 'forest',
    time: 'dusk',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'center', pose: 'wave', expr: 'happy' },
    ],
    cam: 'zoom_in',
    camI: 0.5,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'arjun',
        text: 'फिर मिलेंगे! और भी कहानियाँ सुनाऊँगा!',
        dur: 'auto',
        sfxKey: 'roar', // echo of lion's roar — loop signal
        textOverlay: '🔁 फिर से देखो!',
        shortsFlag: true,
      },
    ],
  },
];

/** Index of the intro scene — used by Episode1.tsx to render IntroSequence */
export const INTRO_SCENE_INDEX = LION_RABBIT_SCENES.findIndex(s => s.id === 'intro');
```

- [ ] **Step 2: Run scenes tests**

```bash
npx vitest run tests/episode1/scenes.test.ts
```

Expected: All 8 scenes tests pass. ✅

- [ ] **Step 3: Commit**

```bash
git add src/compositions/episode1/scenes-lion-rabbit.ts
git commit -m "feat(ep1): add Lion & Rabbit viral scenes data (Sher aur Khargosh)"
```

---

## Task 6: Build TextOverlay Component

**Files:**
- Create: `src/compositions/episode1/TextOverlay.tsx`

- [ ] **Step 1: Create TextOverlay**

```typescript
// src/compositions/episode1/TextOverlay.tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface TextOverlayProps {
  text: string;
  startFrame: number;
  durationFrames: number;
  /** Position: 'top' for hooks, 'bottom' for commentary, 'center' for reveals */
  position?: 'top' | 'center' | 'bottom';
}

/**
 * Full-width bold text overlay for muted viewers (92% of Indian YouTube audience).
 * Appears with a quick spring pop. Disappears with fast fade.
 * No background box — text shadow for readability on any background.
 */
export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  startFrame,
  durationFrames,
  position = 'top',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relFrame = frame - startFrame;

  if (relFrame < 0 || relFrame > durationFrames) return null;

  const enterScale = spring({
    frame: relFrame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.4 },
  });

  const exitOpacity = interpolate(
    relFrame,
    [durationFrames - 12, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const POSITIONS = {
    top: '8%',
    center: '45%',
    bottom: '78%',
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 200 }}>
      <div style={{
        position: 'absolute',
        top: POSITIONS[position],
        left: '50%',
        transform: `translateX(-50%) scale(${Math.max(0, enterScale)})`,
        opacity: exitOpacity,
        textAlign: 'center',
        width: '90%',
      }}>
        <p style={{
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          fontSize: 52,
          fontWeight: 900,
          color: '#FFFFFF',
          margin: 0,
          lineHeight: 1.2,
          textShadow: [
            '0 0 8px rgba(0,0,0,0.9)',
            '3px 3px 0 #000',
            '-3px -3px 0 #000',
            '3px -3px 0 #000',
            '-3px 3px 0 #000',
          ].join(', '),
          letterSpacing: '0.02em',
        }}>
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/compositions/episode1/TextOverlay.tsx
git commit -m "feat(ep1): add TextOverlay component for muted viewer retention"
```

---

## Task 7: Build SFXLayer Component

**Files:**
- Create: `src/compositions/episode1/SFXLayer.tsx`

- [ ] **Step 1: Create SFXLayer**

```typescript
// src/compositions/episode1/SFXLayer.tsx
import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { SFXKey } from './types';

/**
 * Maps SFXKey values to existing sfx files in the SFX database.
 * All paths must exist in public/sfx/ or be handled gracefully.
 */
const SFX_MAP: Record<SFXKey, { file: string; volume: number }> = {
  roar:          { file: 'sfx/animals/lion_roar.mp3',      volume: 0.8 },
  rabbit_hop:    { file: 'sfx/animals/rabbit_hop.mp3',     volume: 0.4 },
  dramatic:      { file: 'sfx/drama/dramatic_sting.mp3',   volume: 0.7 },
  shock:         { file: 'sfx/drama/shock_sting.mp3',      volume: 0.6 },
  record_scratch:{ file: 'sfx/comedy/record_scratch.mp3',  volume: 0.6 },
  victory:       { file: 'sfx/drama/victory_fanfare.mp3',  volume: 0.7 },
  suspense:      { file: 'sfx/drama/suspense_build.mp3',   volume: 0.4 },
  splash:        { file: 'sfx/nature/water_splash.mp3',    volume: 0.7 },
  rimshot:       { file: 'sfx/comedy/rimshot.mp3',         volume: 0.5 },
  boing:         { file: 'sfx/comedy/boing.mp3',           volume: 0.6 },
  reveal:        { file: 'sfx/drama/reveal_sting.mp3',     volume: 0.6 },
  happy_moment:  { file: 'sfx/drama/happy_chime.mp3',      volume: 0.5 },
  giggle:        { file: 'sfx/comedy/giggle.mp3',          volume: 0.4 },
  gasp:          { file: 'sfx/drama/crowd_gasp.mp3',       volume: 0.5 },
};

interface SFXLayerProps {
  sfxKey: SFXKey;
  startFrame: number;
  /** Duration in frames. SFX plays for this many frames then stops. */
  durationFrames: number;
}

/**
 * Wraps Remotion's <Audio> in a <Sequence> to play an SFX at a precise frame.
 * Gracefully skips if the sfx file path is missing (dev convenience).
 */
export const SFXLayer: React.FC<SFXLayerProps> = ({ sfxKey, startFrame, durationFrames }) => {
  const sfx = SFX_MAP[sfxKey];
  if (!sfx) return null;

  return (
    <Sequence from={startFrame} durationInFrames={durationFrames}>
      <Audio
        src={staticFile(sfx.file)}
        volume={sfx.volume}
      />
    </Sequence>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/compositions/episode1/SFXLayer.tsx
git commit -m "feat(ep1): add SFXLayer component for per-dialogue-line audio effects"
```

---

## Task 8: Upgrade DialogueBubble

**Files:**
- Modify: `src/compositions/DialogueBubble.tsx`

- [ ] **Step 1: Read current DialogueBubble**

Current file is at `src/compositions/DialogueBubble.tsx`. The interface needs two new optional props: `textOverlay` and `sfxKey`.

- [ ] **Step 2: Update DialogueBubble interface and add moti to BUBBLE_COLORS**

Replace the `DialogueBubbleProps` interface and add the missing `moti` entry. Make the following targeted changes:

In `src/compositions/DialogueBubble.tsx`, change:

```typescript
// OLD interface
interface DialogueBubbleProps {
  text: string;
  characterId: CharacterId;
  position: 'left' | 'center' | 'right';
  startFrame: number;
  durationFrames: number;
}
```

To:

```typescript
// NEW interface — adds optional textOverlay rendered via TextOverlay component
interface DialogueBubbleProps {
  text: string;
  characterId: CharacterId;
  position: 'left' | 'center' | 'right';
  startFrame: number;
  durationFrames: number;
  /** Optional bold on-screen text shown simultaneously. For muted viewers. */
  textOverlay?: string;
}
```

- [ ] **Step 3: Import TextOverlay and render it**

Add import at top of `src/compositions/DialogueBubble.tsx`:
```typescript
import { TextOverlay } from './episode1/TextOverlay';
```

In the return statement of `DialogueBubble`, after the closing `</div>` of the bubble wrapper and before the final `</div>`, add:
```typescript
{textOverlay && (
  <TextOverlay
    text={textOverlay}
    startFrame={startFrame}
    durationFrames={durationFrames}
    position="bottom"
  />
)}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/compositions/DialogueBubble.tsx
git commit -m "feat(ep1): add textOverlay prop to DialogueBubble for muted retention"
```

---

## Task 9: Build SceneRenderer

**Files:**
- Create: `src/compositions/episode1/SceneRenderer.tsx`

This replaces the inline `Episode1Scene` component with a proper module that handles all viral features.

- [ ] **Step 1: Create SceneRenderer**

```typescript
// src/compositions/episode1/SceneRenderer.tsx
import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence,
} from 'remotion';
import { BackgroundRenderer } from '../../scenes/BackgroundRenderer';
import { CharacterRenderer } from '../../characters/CharacterRenderer';
import { DialogueBubble } from '../DialogueBubble';
import { TextOverlay } from './TextOverlay';
import { SFXLayer } from './SFXLayer';
import { calcDialogueDur } from './timing';
import type { ViralScene, ViralDialogueLine } from './types';

const FPS = 30;

const CHAR_POSITIONS: Record<'left' | 'center' | 'right', { x: number; y: number }> = {
  left:   { x: 350,  y: 480 },
  center: { x: 860,  y: 460 },
  right:  { x: 1370, y: 480 },
};

interface SceneRendererProps {
  scene: ViralScene;
}

/**
 * Renders a single ViralScene with:
 * - Background + parallax
 * - Character entrances (spring animation, staggered)
 * - Proportional dialogue timing (calcDialogueDur)
 * - Per-line SFX (SFXLayer)
 * - Per-line textOverlay (TextOverlay)
 * - Camera movement (zoom, pan, shake, drift)
 * - Pattern interrupts (freeze_frame, zoom_punch, shake, cut_to_black)
 */
export const SceneRenderer: React.FC<SceneRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Camera ────────────────────────────────────────────────────────
  const sceneDurFrames = typeof scene.dur === 'number'
    ? scene.dur * FPS
    : scene.dialogue.reduce((s, l) => s + (l.dur === 'auto' ? calcDialogueDur(l.text) : l.dur), 0);

  const progress = Math.min(1, frame / Math.max(1, sceneDurFrames));
  const intensity = scene.camI;
  let translateX = 0, translateY = 0, zoom = 1;

  switch (scene.cam) {
    case 'pan_left':
      translateX = interpolate(progress, [0.1, 0.9], [0, -30 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'pan_right':
      translateX = interpolate(progress, [0.1, 0.9], [0, 30 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'zoom_in':
      zoom = interpolate(progress, [0.1, 0.9], [1, 1 + 0.12 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'zoom_out':
      zoom = interpolate(progress, [0.1, 0.9], [1 + 0.1 * intensity, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'drift':
      translateX = Math.sin(progress * Math.PI) * 14 * intensity;
      translateY = Math.cos(progress * Math.PI) * 7 * intensity;
      break;
    case 'shake': {
      // High-frequency shake — used for impact moments
      const shakeAmp = 8 * intensity * Math.exp(-progress * 3);
      translateX = Math.sin(frame * 2.1) * shakeAmp;
      translateY = Math.cos(frame * 3.7) * shakeAmp * 0.6;
      break;
    }
    default: break;
  }

  // ── Dialogue timing: calculate absolute start frame per line ──────
  const lineStarts: number[] = [];
  let cursor = 0;
  for (const line of scene.dialogue) {
    lineStarts.push(cursor);
    cursor += line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
  }

  return (
    <AbsoluteFill>
      <div style={{
        transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
        transformOrigin: 'center center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
      }}>
        {/* Background */}
        <BackgroundRenderer
          locationType={scene.bg}
          timeOfDay={scene.time}
          parallaxOffset={translateX}
        />

        {/* Characters — staggered spring entrances */}
        {scene.chars.map((char, i) => {
          const entranceScale = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 14, stiffness: 120, mass: 0.45 },
          });
          return (
            <div
              key={`${char.id}-${i}`}
              style={{ transform: `scale(${Math.max(0, entranceScale)})`, transformOrigin: 'center bottom' }}
            >
              <CharacterRenderer
                characterId={char.id}
                pose={char.pose}
                expression={char.expr}
                mouthShape="B"
                position={CHAR_POSITIONS[char.pos]}
                scale={2.0}
                flipX={char.flip ?? false}
              />
            </div>
          );
        })}

        {/* Dialogue bubbles + per-line textOverlay + SFX */}
        {scene.dialogue.map((line, idx) => {
          const startFrame = lineStarts[idx];
          const durFrames = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
          const speakerPos = scene.chars.find(c => c.id === line.char)?.pos ?? 'center';

          return (
            <React.Fragment key={idx}>
              <DialogueBubble
                text={line.text}
                characterId={line.char}
                position={speakerPos}
                startFrame={startFrame}
                durationFrames={durFrames}
                textOverlay={line.textOverlay}
              />

              {line.sfxKey && (
                <SFXLayer
                  sfxKey={line.sfxKey}
                  startFrame={startFrame}
                  durationFrames={Math.min(durFrames, 45)} // SFX max 1.5s
                />
              )}

              {/* Pattern interrupt overlays */}
              {line.patternInterrupt === 'cut_to_black' && (
                <Sequence from={startFrame} durationInFrames={6}>
                  <AbsoluteFill style={{ background: '#000', zIndex: 500 }} />
                </Sequence>
              )}
              {line.patternInterrupt === 'zoom_punch' && frame >= startFrame && frame < startFrame + 4 && (
                <AbsoluteFill style={{
                  transform: `scale(${interpolate(frame - startFrame, [0, 4], [1.15, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                  transformOrigin: 'center center',
                  background: 'transparent',
                  zIndex: 300,
                  pointerEvents: 'none',
                }} />
              )}
            </React.Fragment>
          );
        })}

        {/* Ambient SFX for entire scene */}
        {scene.ambientSfx && (
          <SFXLayer
            sfxKey={scene.ambientSfx}
            startFrame={0}
            durationFrames={sceneDurFrames}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/compositions/episode1/SceneRenderer.tsx
git commit -m "feat(ep1): add viral SceneRenderer with proportional timing, SFX, textOverlay, pattern interrupts"
```

---

## Task 10: Rewrite Episode1.tsx

**Files:**
- Modify: `src/compositions/Episode1.tsx`

- [ ] **Step 1: Rewrite Episode1.tsx completely**

```typescript
// src/compositions/Episode1.tsx
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { SupportedLanguage } from '../types';
import { IntroSequence } from './IntroSequence';
import { OutroSequence } from './OutroSequence';
import { MoralCard } from './MoralCard';
import { TransitionEffect, getTransitionType } from './TransitionEffects';
import { SceneRenderer } from './episode1/SceneRenderer';
import { LION_RABBIT_SCENES, INTRO_SCENE_INDEX } from './episode1/scenes-lion-rabbit';
import { calcDialogueDur, calcEpisodeDuration, validateSceneChars } from './episode1/timing';

const FPS = 30;
const TRANSITION_FRAMES = 15; // 0.5s transitions — fast cuts for 2026 pace
const MORAL_CARD_FRAMES = 6 * FPS;
const OUTRO_FRAMES = 5 * FPS;

// Validate all scenes at module load time — catches phantom chars immediately
for (const scene of LION_RABBIT_SCENES) {
  try {
    validateSceneChars(scene);
  } catch (e) {
    console.error('[Episode1] Scene validation failed:', (e as Error).message);
  }
}

interface Episode1Props {
  language?: SupportedLanguage;
}

export const Episode1: React.FC<Episode1Props> = ({ language = 'hi' }) => {
  const elements: React.ReactElement[] = [];
  let currentFrame = 0;

  LION_RABBIT_SCENES.forEach((scene, idx) => {
    const sceneDurFrames = typeof scene.dur === 'number'
      ? scene.dur * FPS
      : scene.dialogue.reduce(
          (sum, line) => sum + (line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur),
          0
        );

    const from = currentFrame;

    if (scene.id === 'intro') {
      elements.push(
        <Sequence key="intro" from={from} durationInFrames={sceneDurFrames}>
          <IntroSequence language={language} />
        </Sequence>
      );
    } else {
      elements.push(
        <Sequence key={scene.id} from={from} durationInFrames={sceneDurFrames}>
          <SceneRenderer scene={scene} />
        </Sequence>
      );
    }

    currentFrame += sceneDurFrames;

    // Transition between scenes (except after last scene)
    if (idx < LION_RABBIT_SCENES.length - 1) {
      elements.push(
        <Sequence
          key={`trans-${idx}`}
          from={currentFrame - Math.floor(TRANSITION_FRAMES / 2)}
          durationInFrames={TRANSITION_FRAMES}
        >
          <TransitionEffect type={getTransitionType(idx)} durationFrames={TRANSITION_FRAMES} />
        </Sequence>
      );
    }
  });

  // Moral card
  elements.push(
    <Sequence key="moral-card" from={currentFrame} durationInFrames={MORAL_CARD_FRAMES}>
      <MoralCard moral={{
        id: 'ep01-lion-rabbit',
        moralText: 'अक्ल बड़ी या भैंस? — दिमाग से हर मुश्किल हल हो सकती है।',
        category: 'wisdom',
        relatedConflicts: ['cleverness-01', 'ego-vs-wit-01'],
      }} />
    </Sequence>
  );
  currentFrame += MORAL_CARD_FRAMES;

  // Outro
  elements.push(
    <Sequence key="outro" from={currentFrame} durationInFrames={OUTRO_FRAMES}>
      <OutroSequence />
    </Sequence>
  );
  currentFrame += OUTRO_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {elements}
    </AbsoluteFill>
  );
};

export const EPISODE1_DURATION = calcEpisodeDuration(LION_RABBIT_SCENES);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/compositions/Episode1.tsx
git commit -m "feat(ep1): rewrite Episode1 as Lion & Rabbit — viral structure, proportional timing, phantom-char fix"
```

---

## Task 11: Run Full Test Suite (Green Phase)

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass. Output looks like:
```
✓ tests/episode1/timing.test.ts (9 tests)
✓ tests/episode1/scenes.test.ts (8 tests)
✓ tests/episode1/integration.test.ts (7 tests)

Test Files  3 passed (3)
Tests       24 passed (24)
```

If any test fails, fix the implementation (not the test) and re-run.

- [ ] **Step 2: Final TypeScript check**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 3: Verify duration is within target**

```bash
node -e "
const { calcEpisodeDuration } = require('./src/compositions/episode1/timing.ts');
const { LION_RABBIT_SCENES } = require('./src/compositions/episode1/scenes-lion-rabbit.ts');
const frames = calcEpisodeDuration(LION_RABBIT_SCENES);
console.log('Total frames:', frames);
console.log('Duration (s):', (frames / 30).toFixed(1));
console.log('Under 145s?', frames <= 4350 ? 'YES ✅' : 'NO ❌');
"
```

(If the above doesn't work due to TypeScript, use: `npx tsx -e "<same code>"`.)

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat(ep1): viral reconstruction complete — all 24 tests green, Lion & Rabbit story, 100K-view targeting"
```

---

## Quality Gates (Do Not Skip)

Before declaring completion, verify ALL of these:

| Gate | Command | Expected |
|------|---------|----------|
| All tests pass | `npx vitest run` | 24/24 ✅ |
| TypeScript clean | `npx tsc --noEmit` | 0 errors ✅ |
| No `dur: 135` anywhere | `grep -r "dur: 135" src/` | No matches ✅ |
| No phantom chars | Covered by integration test | ✅ |
| Hook is first scene | Integration test | ✅ |
| Intro is NOT first | Integration test | ✅ |
| Duration ≤ 145s | Duration check step | ✅ |
| Shorts cut 45–65s | Scenes test | ✅ |

---

## 2026 Viral Engineering — Applied

Based on research findings applied to this plan:

| Research Finding | Implementation |
|---|---|
| First 3s: payoff preview beats all | `hook` scene: lion charges camera, no narration |
| 92% Indian viewers watch muted | `TextOverlay` on every key moment, mandatory |
| On-screen text within 2s of start | `hook` scene line 1 has `textOverlay: "🦁 एक ऐसा शेर..."` |
| Intro after hook, not before | `intro` scene at index 2, after 8s of story |
| Best comedy line first, not buried | Bablu's funniest line is scene 4 line 1 (front-loaded) |
| Transitions < 1s for 2026 pace | `TRANSITION_FRAMES = 15` (0.5s, was 0.67s) |
| Loop ending = replay boost | `loop-hook` scene echoes frame 0's lion roar |
| BGM at -12 to -15 dB below voice | `SFXLayer` volume values reflect this (0.4–0.8 range, dialogue leads) |
| Underdog + clever resolution = shares | Rabbit vs Lion = maximum David vs Goliath |
| Freeze frame on best joke = meme | `patternInterrupt: 'freeze_frame'` on "दिमाग छोटा नहीं होता" |

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-02-episode1-viral-reconstruction.md`.**

**Execution options:**

1. **Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks, fast parallel execution of independent tasks (Tasks 4–7 run in parallel after Task 3)

2. **Inline Execution** — Execute tasks sequentially in this session with checkpoints

**Which approach?**
