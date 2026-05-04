// M16 (audit-v13 Lievsay/Pookutty A/V sync fix): the visual track's
// `calcDialogueDur` over-estimates Hindi Piper TTS by 2.5–3x, leaving
// a 97s silence tail at the end of episode-1-hi.mp4. This file pins
// the new contract: when audio data is supplied, video durations are
// derived from ffprobe-measured TTS timings, NOT text-length.

import { describe, it, expect } from 'vitest';
import {
  calcSceneDurFromAudio,
  calcEpisodeDurationFromAudio,
  lineStartFramesFromAudio,
  calcEpisodeDuration,
  type SceneAudioTiming,
} from '../../src/compositions/episode1/timing';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import { calcEpisode1DurationFromProps } from '../../src/compositions/Episode1';

describe('M16 A/V sync from audio data', () => {
  const FPS = 30;

  it('calcSceneDurFromAudio returns the sum of measured line durations + post-gaps + scene tail (in frames)', () => {
    const t: SceneAudioTiming = {
      sceneIndex: 0,
      lineDurationsMs: [1500, 2000], // 45 + 60 frames
      postGapsMs: [200, 300],         // 6 + 9 frames
      sceneTailMs: 300,               // 9 frames
    };
    // 45 + 6 + 60 + 9 + 9 = 129 frames
    expect(calcSceneDurFromAudio(t)).toBe(129);
  });

  it('lineStartFramesFromAudio gives cumulative starts in frames', () => {
    const t: SceneAudioTiming = {
      sceneIndex: 0,
      lineDurationsMs: [1500, 2000, 1000],
      postGapsMs: [200, 300, 0],
      sceneTailMs: 0,
    };
    // line 0 starts at 0
    // line 1 starts at 45 + 6 = 51
    // line 2 starts at 51 + 60 + 9 = 120
    expect(lineStartFramesFromAudio(t)).toEqual([0, 51, 120]);
  });

  it('calcEpisodeDurationFromAudio uses measured timings when supplied (preferred path)', () => {
    const timings: SceneAudioTiming[] = LION_RABBIT_SCENES.map((_, i) => ({
      sceneIndex: i,
      lineDurationsMs: [1500],
      postGapsMs: [200],
      sceneTailMs: 300,
    }));
    // 45 + 6 + 9 = 60 fr per scene, x N scenes, + 11s scaffold (330 fr)
    const expected = LION_RABBIT_SCENES.length * 60 + 330;
    expect(calcEpisodeDurationFromAudio(LION_RABBIT_SCENES, timings)).toBe(expected);
  });

  it('calcEpisodeDurationFromAudio falls back to estimator when timings undefined', () => {
    expect(calcEpisodeDurationFromAudio(LION_RABBIT_SCENES, undefined)).toBe(
      calcEpisodeDuration(LION_RABBIT_SCENES),
    );
  });

  it('calcEpisode1DurationFromProps returns audio-aligned duration (preventing the 97s silence tail)', () => {
    // Simulate the actual measured behaviour: each line ~1.6s, post-gap 200ms
    const timings: SceneAudioTiming[] = LION_RABBIT_SCENES.map((scene, i) => ({
      sceneIndex: i,
      lineDurationsMs: scene.dialogue.map(() => 1600),
      postGapsMs: scene.dialogue.map(() => 200),
      sceneTailMs: 300,
    }));
    const dur = calcEpisode1DurationFromProps({
      audioData: { sceneDialogueTimings: timings } as Partial<import('../../src/types').MasterAudioResult>,
    });
    // Should produce a number SIGNIFICANTLY less than 4950 (estimator's
    // 165s) — proving the silence tail no longer drives the timeline.
    expect(dur).toBeLessThan(4500);
    expect(dur).toBeGreaterThan(60 * FPS); // still a real episode (>60s)
  });

  it('calcEpisode1DurationFromProps falls back to estimator without audioData (Studio preview parity)', () => {
    const dur = calcEpisode1DurationFromProps({});
    expect(dur).toBe(calcEpisodeDuration(LION_RABBIT_SCENES));
  });
});
