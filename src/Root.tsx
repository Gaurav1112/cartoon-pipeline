import React from 'react';
import { Composition } from 'remotion';
import { CartoonEpisode } from './compositions/CartoonEpisode';
import { Episode1, EPISODE1_DURATION, calcEpisode1DurationFromProps } from './compositions/Episode1';
import {
  ShortsEpisode, calcShortsDuration,
  SHORTS_FPS, SHORTS_WIDTH, SHORTS_HEIGHT,
} from './compositions/ShortsEpisode';
import { generateEpisode } from './story/story-engine';
import { selectDialogueSequence } from './dialogues';
import type { CartoonEpisodeProps, CharacterId, MouthCue } from './types';

// Default props for the generic composition
function buildDefaultProps(): CartoonEpisodeProps {
  const episode = generateEpisode(1, 1);
  for (const scene of episode.scenes) {
    const queries = scene.dialogue.map((l) => ({
      character: l.characterId,
      emotion: l.emotion,
      context: l.context,
    }));
    const resolved = selectDialogueSequence(queries, 'en', episode.seed + scene.sceneIndex);
    scene.dialogue = resolved.map((sel, i) => ({ ...scene.dialogue[i], text: sel.text }));
  }
  const mouthCuesPerCharacter: Record<string, MouthCue[]> = {};
  for (const c of episode.characters) mouthCuesPerCharacter[c] = [];
  return {
    episode,
    audioData: {
      masterAudioPath: '', totalDurationMs: 0, wordTimestamps: [],
      mouthCuesPerCharacter: mouthCuesPerCharacter as Record<CharacterId, MouthCue[]>,
      sfxTriggers: [],
    },
    language: 'en',
  };
}

const defaultProps = buildDefaultProps();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Episode 1: Hand-crafted Lion-Rabbit. M16 (audit-v13): use
          calculateMetadata so durationInFrames is derived from the
          audio engine's ffprobe-measured TTS timings (passed via
          --props from render-episode.ts). Without this, the master
          timeline overshoots the audio by ~98s and produces dead air. */}
      <Composition
        id="Episode1"
        component={Episode1 as React.FC}
        durationInFrames={EPISODE1_DURATION}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ language: 'hi' as const }}
        calculateMetadata={async ({ props }) => {
          const dur = calcEpisode1DurationFromProps(props as Parameters<typeof calcEpisode1DurationFromProps>[0]);
          return { durationInFrames: dur };
        }}
      />

      {/* Generic engine-driven episodes */}
      <Composition
        id="CartoonEpisode"
        component={CartoonEpisode as React.FC}
        durationInFrames={defaultProps.episode.totalDurationFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />

      {/* Shorts (9:16) — for IG Reels, YT Shorts, FB Reels */}
      <Composition
        id="ShortsEpisode"
        component={ShortsEpisode as React.FC}
        durationInFrames={calcShortsDuration()}
        fps={SHORTS_FPS}
        width={SHORTS_WIDTH}
        height={SHORTS_HEIGHT}
        defaultProps={{ language: 'hi' as const }}
      />
    </>
  );
};
