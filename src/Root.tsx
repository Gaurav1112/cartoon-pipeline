import React from 'react';
import { Composition } from 'remotion';
import { CartoonEpisode } from './compositions/CartoonEpisode';
import { generateEpisode } from './story/story-engine';
import { selectDialogueSequence } from './dialogues';
import type { CartoonEpisodeProps, CharacterId, MouthCue } from './types';

function buildDefaultProps(): CartoonEpisodeProps {
  const episode = generateEpisode(1, 1);

  // Fill ALL scenes with English dialogue (full episode, not trimmed)
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
      masterAudioPath: '',
      totalDurationMs: 0,
      wordTimestamps: [],
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
      <Composition
        id="CartoonEpisode"
        component={CartoonEpisode as React.FC}
        durationInFrames={defaultProps.episode.totalDurationFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
