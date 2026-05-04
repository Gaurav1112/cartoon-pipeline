// M22 (audit-v14): Helper to extract explicit pattern interrupt frame
// numbers from scene data for use with RhythmInterruptOverlay.

import type { ViralScene } from './types';
import { calcDialogueDur, type SceneAudioTiming } from './timing';

const FPS = 30;

/**
 * Computes frame numbers where explicit dialogue.patternInterrupt exists.
 * Used to tell RhythmInterruptOverlay which windows already have interrupts.
 * 
 * @param scenes - Array of viral scenes
 * @param audioTimings - Optional audio timings map (sceneIndex → timing)
 * @returns Array of frame numbers with explicit interrupts
 */
export function extractExplicitInterruptFrames(
  scenes: ViralScene[],
  audioTimings?: Map<number, SceneAudioTiming>,
): number[] {
  const explicitFrames: number[] = [];
  let currentFrame = 0;

  for (let sceneIdx = 0; sceneIdx < scenes.length; sceneIdx++) {
    const scene = scenes[sceneIdx];
    const audioTiming = audioTimings?.get(sceneIdx);

    // Skip intro scene (no dialogue interrupts)
    if (scene.id === 'intro') {
      // Intro is fixed duration (4 seconds)
      currentFrame += 4 * FPS;
      continue;
    }

    // Track line offsets within scene
    let lineOffsetFrames = 0;

    for (let lineIdx = 0; lineIdx < scene.dialogue.length; lineIdx++) {
      const line = scene.dialogue[lineIdx];

      // If line has explicit pattern interrupt, record its frame
      if (line.patternInterrupt && line.patternInterrupt !== 'none') {
        explicitFrames.push(currentFrame + lineOffsetFrames);
      }

      // Calculate line duration
      let lineDur: number;
      if (audioTiming) {
        // Use audio-measured duration
        const lineMs = audioTiming.lineDurationsMs[lineIdx] ?? 0;
        const gapMs = audioTiming.postGapsMs[lineIdx] ?? 0;
        lineDur = Math.ceil(((lineMs + gapMs) / 1000) * FPS);
      } else {
        // Use text-length estimate
        lineDur = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
      }

      lineOffsetFrames += lineDur;
    }

    // Advance to next scene
    let sceneDurFrames: number;
    if (audioTiming) {
      // Sum all line durations + gaps + tail
      const totalLineMs = audioTiming.lineDurationsMs.reduce((s, d) => s + d, 0);
      const totalGapMs = audioTiming.postGapsMs.reduce((s, g) => s + g, 0);
      const tailMs = audioTiming.sceneTailMs;
      sceneDurFrames = Math.ceil(((totalLineMs + totalGapMs + tailMs) / 1000) * FPS);
    } else if (typeof scene.dur === 'number') {
      sceneDurFrames = scene.dur * FPS;
    } else {
      sceneDurFrames = lineOffsetFrames;
    }

    currentFrame += sceneDurFrames;
  }

  return explicitFrames;
}
