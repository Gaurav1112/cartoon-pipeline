import React from 'react';
import { AbsoluteFill, Sequence, Audio, useCurrentFrame, interpolate } from 'remotion';
import type { CartoonEpisodeProps } from '../types';
import { IntroSequence } from './IntroSequence';
import { OutroSequence } from './OutroSequence';
import { SceneRenderer } from './SceneRenderer';
import { MoralCard } from './MoralCard';
import { TransitionEffect, getTransitionType } from './TransitionEffects';

export const FPS = 30;
export const INTRO_FRAMES = 5 * FPS;    // 5 seconds — branded but quick
export const MORAL_FRAMES = 8 * FPS;    // 8 seconds — time to absorb the lesson
export const OUTRO_FRAMES = 6 * FPS;    // 6 seconds — subscribe CTA

// Uses the real TransitionEffect component (was dead code before — now wired in)

export const CartoonEpisode: React.FC<CartoonEpisodeProps> = ({
  episode,
  audioData,
  language,
}) => {
  const TRANSITION_FRAMES = 30; // 1.0s transition — gentle for kids, not jarring
  let currentFrame = INTRO_FRAMES;

  // Build scene sequence with transitions
  const sceneElements: React.ReactElement[] = [];

  episode.scenes.forEach((scene, idx) => {
    const from = currentFrame;
    const duration = scene.durationFrames;

    // Scene content
    sceneElements.push(
      <Sequence key={`scene-${idx}`} from={from} durationInFrames={duration}>
        <SceneRenderer
          scene={scene}
          mouthCues={audioData.mouthCuesPerCharacter}
          startFrame={from}
        />
      </Sequence>,
    );

    currentFrame += duration;

    // Real transitions (was dead code — now wired to TransitionEffects.tsx)
    if (idx < episode.scenes.length - 1) {
      sceneElements.push(
        <Sequence key={`trans-${idx}`} from={currentFrame - 8} durationInFrames={TRANSITION_FRAMES}>
          <TransitionEffect type={getTransitionType(idx)} durationFrames={TRANSITION_FRAMES} />
        </Sequence>,
      );
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* 3s Cold Open Intro */}
      <Sequence from={0} durationInFrames={INTRO_FRAMES}>
        <IntroSequence language={language} />
      </Sequence>

      {/* Episode scenes with transitions */}
      {sceneElements}

      {/* Moral card */}
      <Sequence from={currentFrame} durationInFrames={MORAL_FRAMES}>
        <MoralCard moral={episode.moral} />
      </Sequence>

      {/* Outro */}
      <Sequence from={currentFrame + MORAL_FRAMES} durationInFrames={OUTRO_FRAMES}>
        <OutroSequence />
      </Sequence>

      {/* Master audio track */}
      {audioData.masterAudioPath ? <Audio src={audioData.masterAudioPath} /> : null}
    </AbsoluteFill>
  );
};
