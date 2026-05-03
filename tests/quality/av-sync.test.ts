import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';
import {
  calcEpisodeDuration,
  calcDialogueDur,
  DEFAULT_POST_GAP_MS,
} from '../../src/compositions/episode1/timing';

// Phase L harsh-review fix: calcSceneDur was ignoring postGapMs while
// the audio pipeline was advancing its timeline by it — A/V drift bug.
// This test simulates the audio timeline directly from the scene data and
// asserts that the VIDEO duration covers the full audio. If anyone ever
// re-introduces the drift, this test goes red.
describe('A/V sync: video duration covers audio timeline (no drift)', () => {
  const FPS = 30;

  // Reproduce cartoon-audio.ts:177-245 timeline math exactly.
  function simulatedAudioTotalMs(): number {
    let currentTimeMs = 0;
    for (const scene of LION_RABBIT_SCENES) {
      for (const line of scene.dialogue ?? []) {
        const lineFrames = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
        const lineMs = (lineFrames * 1000) / FPS;
        const postGap =
          typeof line.postGapMs === 'number' ? line.postGapMs : DEFAULT_POST_GAP_MS;
        currentTimeMs += lineMs + postGap;
      }
    }
    return currentTimeMs;
  }

  it('video composition duration ≥ simulated audio duration (NO truncation)', () => {
    const audioMs = simulatedAudioTotalMs();
    const videoFrames = calcEpisodeDuration(LION_RABBIT_SCENES);
    const videoMs = (videoFrames * 1000) / FPS;
    // Video has overhead (moral card 6s + outro 5s = 11s) that audio doesn't.
    // So video MUST be ≥ audio.
    expect(videoMs).toBeGreaterThanOrEqual(audioMs);
  });

  it('video duration ≥ audio + 11s overhead (no truncation, room to spare)', () => {
    // Note: the actual audio per line is measured at render time via
    // ffprobe, so we simulate using the same calcDialogueDur the video
    // uses. The contract is "video covers audio", not byte-equality.
    const audioMs = simulatedAudioTotalMs();
    const videoFrames = calcEpisodeDuration(LION_RABBIT_SCENES);
    const overheadMs = 11_000; // 6s moral card + 5s outro
    const videoMs = (videoFrames * 1000) / FPS;
    expect(videoMs).toBeGreaterThanOrEqual(audioMs + overheadMs - 100);
  });

  it('DEFAULT_POST_GAP_MS matches the audio pipeline default (200ms)', () => {
    // If this constant ever drifts from cartoon-audio.ts:244 the contract
    // breaks silently. Pin it here.
    expect(DEFAULT_POST_GAP_MS).toBe(200);
  });
});
