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
 * Default post-line gap in milliseconds. Audio mixer (`cartoon-audio.ts`)
 * advances its timeline by `actualDurationMs + postGap` per line, so the
 * VIDEO timeline must do the same or A/V will drift. Keep this in sync
 * with `cartoon-audio.ts:244` (the line `const postGap = ... ?? 200;`).
 */
export const DEFAULT_POST_GAP_MS = 200;

/**
 * Convert a postGapMs value (number | undefined) to frames at FPS=30.
 * Reads `DEFAULT_POST_GAP_MS` when missing — matches the audio pipeline.
 */
export function postGapFrames(postGapMs: number | undefined): number {
  const ms = typeof postGapMs === 'number' ? postGapMs : DEFAULT_POST_GAP_MS;
  return Math.round((ms * FPS) / 1000);
}

/**
 * Sum all dialogue durations for a scene's dialogue array.
 * Respects explicit numeric dur overrides AND postGapMs gaps (the same
 * gap the audio pipeline inserts after each line). Without including
 * postGap here, video composition length < audio total = lip-sync drift +
 * truncated final lines.
 */
export function calcSceneDur(
  dialogue: Pick<ViralDialogueLine, 'text' | 'dur' | 'postGapMs'>[],
): number {
  return dialogue.reduce((sum, line) => {
    const frames = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
    return sum + frames + postGapFrames(line.postGapMs);
  }, 0);
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
    if (typeof scene.dur === 'number') return sum + scene.dur * FPS;
    return sum + calcSceneDur(scene.dialogue);
  }, 0);
  return scenesTotal + MORAL_CARD_FRAMES + OUTRO_FRAMES;
}
