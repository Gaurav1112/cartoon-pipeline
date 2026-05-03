// src/compositions/episode1/timing.ts
import type { ViralDialogueLine, ViralScene } from './types';

const FPS = 30;
/**
 * Frames per Hindi character at natural speech rate.
 * ~6 frames/char = ~5 chars/sec = normal conversational Hindi.
 */
// Pacing contract (Brad Bird snappiness + MrBeast retention):
// We want lines to feel propulsive without clipping audio. 42 frames (~1.4s)
// is the floor for any line; the per-char rate keeps long lines proportional.
// REACTION_GAP=9 (~0.3s) gives viewers a beat to process before the next line.
const FRAMES_PER_CHAR = 6;
const MIN_LINE_FRAMES = 42;
const REACTION_GAP_FRAMES = 9;

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
 * M3.1 (Docter): cross-fade window in frames at the start of every
 * non-zero dialogue line. ~200 ms at 30 fps. SceneRenderer uses this
 * to lerp `poseModifierByEmotion(prevEmotion)` → `…(currEmotion)` so
 * the silhouette doesn't snap.
 */
export const EMOTION_BLEND_FRAMES = 6;

/**
 * M3.1 helper — pure. Identifies which dialogue line is active at
 * `frame` and how far through the entry cross-fade we are.
 *
 *   { lineIndex, blendT }
 *     - lineIndex: index into `scene.dialogue` of the active line.
 *     - blendT ∈ [0, 1]: 1 = fully on this line; <1 = inside the
 *       EMOTION_BLEND_FRAMES window cross-fading from the previous
 *       line's emotion. blendT is forced to 1 for line 0 (no prior).
 *
 * Line starts come from per-line `dur` (resolving 'auto' via
 * calcDialogueDur). If the cumulative sum is 0 (e.g. tests with all
 * `dur: 0`), fall back to an even split of `totalSceneFrames` across
 * the line count so the helper still produces a stable arc.
 */
export function activeLineAtFrame(
  scene: Pick<ViralScene, 'dialogue'>,
  frame: number,
  totalSceneFrames: number,
): { lineIndex: number; blendT: number } {
  const dialogue = scene.dialogue;
  const n = dialogue.length;
  if (n === 0) return { lineIndex: 0, blendT: 1 };

  // Cumulative line starts from per-line dur.
  const starts: number[] = [];
  let cursor = 0;
  for (const line of dialogue) {
    starts.push(cursor);
    cursor += line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
  }
  const cumulative = cursor;

  // Even-split fallback when no per-line dur info is available.
  if (cumulative <= 0) {
    const span = Math.max(0, totalSceneFrames) / n;
    for (let i = 0; i < n; i++) starts[i] = Math.round(i * span);
  }

  // Find largest i with starts[i] <= frame. n is small (≤ ~10) so the
  // linear scan is cheaper than binary search and stays branch-predictable.
  let lineIndex = 0;
  for (let i = 0; i < n; i++) {
    if (starts[i] <= frame) lineIndex = i;
    else break;
  }

  if (lineIndex === 0) return { lineIndex, blendT: 1 };

  const localFrame = frame - starts[lineIndex];
  if (localFrame >= EMOTION_BLEND_FRAMES) return { lineIndex, blendT: 1 };
  if (localFrame <= 0) return { lineIndex, blendT: 0 };
  return { lineIndex, blendT: localFrame / EMOTION_BLEND_FRAMES };
}

/**
 * Default post-line gap in milliseconds. Audio mixer (`cartoon-audio.ts`)
 * advances its timeline by `actualDurationMs + postGap` per line, so the
 * VIDEO timeline must do the same or A/V will drift. Keep this in sync
 * with `cartoon-audio.ts:244` (the line `const postGap = ... ?? 200;`).
 */
export const DEFAULT_POST_GAP_MS = 200;

/**
 * Default scene-boundary tail silence in milliseconds (Miyazaki "ma" gap
 * M2.4). Applied automatically after the last line of every scene (in
 * both video duration math and the audio pipeline) unless the scene
 * declares an explicit `sceneTailMs` override (use 0 to opt out).
 *
 * Keep this in sync with the mirror constant in `cartoon-audio.ts`
 * (`scene.sceneTailMs ?? 300`).
 */
export const DEFAULT_SCENE_TAIL_MS = 300;

/**
 * Convert a sceneTailMs value (number | undefined) to frames at FPS=30.
 * Reads `DEFAULT_SCENE_TAIL_MS` when missing. `0` is honored verbatim
 * (explicit opt-out).
 */
export function sceneTailFrames(sceneTailMs: number | undefined): number {
  const ms = typeof sceneTailMs === 'number' ? sceneTailMs : DEFAULT_SCENE_TAIL_MS;
  return Math.round((ms * FPS) / 1000);
}

/**
 * Convert a postGapMs value (number | undefined) to frames at FPS=30.
 * Reads `DEFAULT_POST_GAP_MS` when missing — matches the audio pipeline.
 */
export function postGapFrames(postGapMs: number | undefined): number {
  const ms = typeof postGapMs === 'number' ? postGapMs : DEFAULT_POST_GAP_MS;
  return Math.round((ms * FPS) / 1000);
}

/**
 * Sum dialogue durations for a scene.
 *
 * Two call signatures:
 *   - calcSceneDur(dialogueArray) — legacy form. Sums per-line dur +
 *     per-line postGap. Does NOT add a scene tail (the caller has only
 *     supplied line-level data).
 *   - calcSceneDur(scene)        — full-scene form (M2.4). Adds the
 *     scene-tail silence (`scene.sceneTailMs ?? DEFAULT_SCENE_TAIL_MS`)
 *     after the line sum so video duration matches the audio pipeline.
 */
export function calcSceneDur(
  input:
    | Pick<ViralDialogueLine, 'text' | 'dur' | 'postGapMs'>[]
    | Pick<ViralScene, 'dialogue' | 'sceneTailMs'>,
): number {
  const dialogue = Array.isArray(input) ? input : input.dialogue;
  const baseFrames = dialogue.reduce((sum, line) => {
    const frames = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
    return sum + frames + postGapFrames(line.postGapMs);
  }, 0);
  if (Array.isArray(input)) return baseFrames;
  return baseFrames + sceneTailFrames(input.sceneTailMs);
}

/**
 * Validate that every dialogue speaker exists in scene.chars.
 * Throws a descriptive error if a phantom character is found.
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
 *
 * Transitions in Episode1.tsx use a half-overlap pattern: each 16-frame
 * TransitionEffect starts 8 frames before the scene boundary (`from =
 * currentFrame - 8`). This means transitions are fully contained within
 * adjacent scene extents and do NOT add to the total frame count.
 * Only the moral card and outro extend the timeline beyond the scenes.
 */
export function calcEpisodeDuration(scenes: ViralScene[]): number {
  const MORAL_CARD_FRAMES = 6 * FPS;
  const OUTRO_FRAMES = 5 * FPS;
  const scenesTotal = scenes.reduce((sum, scene) => {
    const tail = sceneTailFrames(scene.sceneTailMs);
    if (typeof scene.dur === 'number') return sum + scene.dur * FPS + tail;
    // M2.4: tail is owned by calcEpisodeDuration's per-scene loop (not
    // double-added inside calcSceneDur(dialogueArray)).
    return sum + calcSceneDur(scene.dialogue) + tail;
  }, 0);
  return scenesTotal + MORAL_CARD_FRAMES + OUTRO_FRAMES;
}
