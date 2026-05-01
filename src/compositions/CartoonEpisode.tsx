import React from 'react';
import { AbsoluteFill, Sequence, Audio, useCurrentFrame, interpolate } from 'remotion';
import type { CartoonEpisodeProps } from '../types';
import { IntroSequence } from './IntroSequence';
import { OutroSequence } from './OutroSequence';
import { SceneRenderer } from './SceneRenderer';
import { MoralCard } from './MoralCard';

export const FPS = 30;
export const INTRO_FRAMES = 5 * FPS;    // 5 seconds — branded but quick
export const MORAL_FRAMES = 8 * FPS;    // 8 seconds — time to absorb the lesson
export const OUTRO_FRAMES = 6 * FPS;    // 6 seconds — subscribe CTA

// Scene-to-scene transition overlay
const SceneTransition: React.FC<{ type: number }> = ({ type }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity =
    progress < 0.5
      ? interpolate(progress, [0, 0.5], [0, 1])
      : interpolate(progress, [0.5, 1], [1, 0]);

  const colors = ['#1a1a2e', '#FF8C00', '#2E1760', '#0f3460', '#4A0E3C'];
  const bg = colors[type % colors.length];

  return (
    <AbsoluteFill
      style={{ backgroundColor: bg, opacity, zIndex: 200 }}
    />
  );
};

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

    // Transition between scenes (not after last scene)
    if (idx < episode.scenes.length - 1) {
      sceneElements.push(
        <Sequence key={`trans-${idx}`} from={currentFrame - 8} durationInFrames={TRANSITION_FRAMES}>
          <SceneTransition type={idx} />
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
