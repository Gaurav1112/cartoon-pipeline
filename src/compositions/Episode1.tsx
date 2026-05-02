// src/compositions/Episode1.tsx
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { SupportedLanguage } from '../types';
import { IntroSequence } from './IntroSequence';
import { OutroSequence } from './OutroSequence';
import { MoralCard } from './MoralCard';
import { TransitionEffect, getTransitionType } from './TransitionEffects';
import { SceneRenderer } from './episode1/SceneRenderer';
import { LION_RABBIT_SCENES } from './episode1/scenes-lion-rabbit';
import { calcDialogueDur, calcEpisodeDuration, validateSceneChars } from './episode1/timing';

const FPS = 30;
const TRANSITION_FRAMES = 15;
const MORAL_CARD_FRAMES = 6 * FPS;
const OUTRO_FRAMES = 5 * FPS;

// Validate all scenes at module load time — catches phantom chars immediately
for (const scene of LION_RABBIT_SCENES) {
  try {
    validateSceneChars(scene);
  } catch (e) {
    console.error('[Episode1] Scene validation failed:', (e as Error).message);
  }
}

interface Episode1Props {
  language?: SupportedLanguage;
}

export const Episode1: React.FC<Episode1Props> = ({ language = 'hi' }) => {
  const elements: React.ReactElement[] = [];
  let currentFrame = 0;

  LION_RABBIT_SCENES.forEach((scene, idx) => {
    const sceneDurFrames = typeof scene.dur === 'number'
      ? scene.dur * FPS
      : scene.dialogue.reduce(
          (sum, line) => sum + (line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur),
          0
        );

    const from = currentFrame;

    if (scene.id === 'intro') {
      elements.push(
        <Sequence key="intro" from={from} durationInFrames={sceneDurFrames}>
          <IntroSequence language={language} />
        </Sequence>
      );
    } else {
      elements.push(
        <Sequence key={scene.id} from={from} durationInFrames={sceneDurFrames}>
          <SceneRenderer scene={scene} />
        </Sequence>
      );
    }

    currentFrame += sceneDurFrames;

    if (idx < LION_RABBIT_SCENES.length - 1) {
      elements.push(
        <Sequence
          key={`trans-${idx}`}
          from={currentFrame - Math.floor(TRANSITION_FRAMES / 2)}
          durationInFrames={TRANSITION_FRAMES}
        >
          <TransitionEffect type={getTransitionType(idx)} durationFrames={TRANSITION_FRAMES} />
        </Sequence>
      );
    }
  });

  elements.push(
    <Sequence key="moral-card" from={currentFrame} durationInFrames={MORAL_CARD_FRAMES}>
      <MoralCard moral={{
        id: 'ep01-lion-rabbit',
        moralText: 'अक्ल बड़ी या भैंस? — दिमाग से हर मुश्किल हल हो सकती है।',
        category: 'wisdom',
        relatedConflicts: ['cleverness-01', 'ego-vs-wit-01'],
      }} />
    </Sequence>
  );
  currentFrame += MORAL_CARD_FRAMES;

  elements.push(
    <Sequence key="outro" from={currentFrame} durationInFrames={OUTRO_FRAMES}>
      <OutroSequence />
    </Sequence>
  );
  currentFrame += OUTRO_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {elements}
    </AbsoluteFill>
  );
};

export const EPISODE1_DURATION = calcEpisodeDuration(LION_RABBIT_SCENES);
