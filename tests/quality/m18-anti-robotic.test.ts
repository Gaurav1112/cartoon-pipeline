// M18 (audit-v14): user feedback "audio is robotic + only fraction of
// voice heard". Two fixes:
//   1) Revert lengthScale 1.15→1.05 (over-stretch revealed Piper's
//      prosody artefacts → robotic). Inter-line gap is the primary
//      kid-friendly pacing knob, not voice stretch.
//   2) Video duration covers FULL master_audio.wav so no dialogue is
//      truncated by the mux step.

import { describe, it, expect } from 'vitest';
import { getPiperVoice } from '../../src/audio/piper-voices';
import { calcEpisode1DurationFromProps } from '../../src/compositions/Episode1';
import type { MasterAudioResult } from '../../src/types';

describe('M18 anti-robotic Piper pacing', () => {
  it.each(['hi', 'te', 'en'] as const)(
    '%s voice lengthScale is in the natural range [1.0, 1.10]',
    (lang) => {
      const v = getPiperVoice(lang, 'lion');
      expect(v).toBeDefined();
      expect(v!.lengthScale).toBeGreaterThanOrEqual(1.0);
      expect(v!.lengthScale).toBeLessThanOrEqual(1.10);
    },
  );
});

describe('M18 video covers full audio (no truncation)', () => {
  const FPS = 30;

  it('calcEpisode1DurationFromProps uses masterAudioDurationMs when it exceeds scene timings', () => {
    const audioData: Partial<MasterAudioResult> = {
      sceneDialogueTimings: [
        { sceneIndex: 0, lineDurationsMs: [1000], postGapsMs: [200], sceneTailMs: 300 },
      ],
      masterAudioDurationMs: 71_500, // music tail extends past dialogue
    };
    const dur = calcEpisode1DurationFromProps({ audioData: audioData as MasterAudioResult });
    // Must cover the FULL 71.5s of audio: 71.5 * 30 = 2145 frames.
    expect(dur).toBeGreaterThanOrEqual(Math.ceil(71.5 * FPS));
  });

  it('falls back to scene-timings when masterAudioDurationMs is absent', () => {
    const audioData: Partial<MasterAudioResult> = {
      sceneDialogueTimings: [
        { sceneIndex: 0, lineDurationsMs: [1000], postGapsMs: [200], sceneTailMs: 300 },
      ],
    };
    const dur = calcEpisode1DurationFromProps({ audioData: audioData as MasterAudioResult });
    expect(dur).toBeGreaterThan(0);
  });

  it('takes the max of scene-timings and audio duration (never truncates)', () => {
    // Scene timings imply a long video, master audio is short → keep
    // scene-timings (some compositions might want longer than audio
    // for fade-out reasons).
    const audioData: Partial<MasterAudioResult> = {
      sceneDialogueTimings: Array.from({ length: 11 }, (_, i) => ({
        sceneIndex: i,
        lineDurationsMs: [3000, 3000, 3000],
        postGapsMs: [500, 500, 500],
        sceneTailMs: 300,
      })),
      masterAudioDurationMs: 5000, // tiny audio
    };
    const dur = calcEpisode1DurationFromProps({ audioData: audioData as MasterAudioResult });
    expect(dur).toBeGreaterThan(Math.ceil(5 * FPS));
  });
});
