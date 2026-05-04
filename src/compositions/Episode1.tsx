// src/compositions/Episode1.tsx
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { SupportedLanguage } from '../types';
import { IntroSequence } from './IntroSequence';
import { OutroSequence } from './OutroSequence';
import { MoralCard } from './MoralCard';
import { TransitionEffect, getTransitionType } from './TransitionEffects';
import { SceneRenderer } from './episode1/SceneRenderer';
import { LION_RABBIT_SCENES as RAW_LION_RABBIT_SCENES } from './episode1/scenes-lion-rabbit';
import { enforceSideProfile } from './episode1/side-profile-enforcer';
import { calcSceneDur, calcEpisodeDuration, validateSceneChars } from './episode1/timing';
import { Subtitles } from './episode1/Subtitles';

const FPS = 30;
// FIX(minor): use even number so Math.floor(TRANSITION_FRAMES/2) is symmetric
// (odd 15 → floor=7 overlap before, 8 overlap after; even 16 → symmetric 8/8)
const TRANSITION_FRAMES = 16;
const MORAL_CARD_FRAMES = 6 * FPS;
const OUTRO_FRAMES = 5 * FPS;

// M8 (Peppa side-profile): force two-character scenes to face each other so
// the meeting of profiles reads as "they are talking" without dialogue.
// Author-set flips win; this is a fill-in-the-gaps pass.
const LION_RABBIT_SCENES = enforceSideProfile(RAW_LION_RABBIT_SCENES);

/**
 * Language-localised moral text for Episode 1 (Lion & Rabbit).
 * These are culturally adapted lines, NOT machine translations.
 */
const MORAL_TEXT: Record<SupportedLanguage, string> = {
  hi: 'अक्ल बड़ी या भैंस? — दिमाग से हर मुश्किल हल हो सकती है।',
  te: 'తెలివి బలం కంటే గొప్పది — మెదడుతో ప్రతి సమస్యను పరిష్కరించవచ్చు.',
  ta: 'அறிவு வலிமையை விட சக்திவாய்ந்தது — மூளையால் எந்த இடரையும் தீர்க்கலாம்.',
  kn: 'ಬುದ್ಧಿ ಬಲಕ್ಕಿಂತ ದೊಡ್ಡದು — ಯೋಚನೆಯಿಂದ ಯಾವ ಕಷ್ಟವನ್ನೂ ಪರಿಹರಿಸಬಹುದು.',
  mr: 'बुद्धी हे सर्वात मोठे बळ — डोक्याने प्रत्येक अडचण सुटू शकते.',
  bn: 'বুদ্ধি শক্তির চেয়ে বড় — মাথা খাটালে সব সমস্যার সমাধান হয়।',
  en: 'Wit beats brawn every time — a clever mind can solve any problem.',
};

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
    const rawDurFrames = typeof scene.dur === 'number'
      ? scene.dur * FPS
      : calcSceneDur(scene.dialogue);
    // Remotion throws if durationInFrames is 0 (e.g. scene with no dialogue and dur:'auto')
    const sceneDurFrames = Math.max(1, rawDurFrames);

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
      <MoralCard
        moral={{
          id: 'ep01-lion-rabbit',
          moralText: MORAL_TEXT[language],
          category: 'wisdom',
          relatedConflicts: ['cleverness-01', 'ego-vs-wit-01'],
        }}
        language={language}
      />
    </Sequence>
  );
  currentFrame += MORAL_CARD_FRAMES;

  elements.push(
    <Sequence key="outro" from={currentFrame} durationInFrames={OUTRO_FRAMES}>
      <OutroSequence language={language} />
    </Sequence>
  );
  currentFrame += OUTRO_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {elements}
      {/* M5.1 — burnt-in multi-language subtitle layer (Shorts retention +30–40%) */}
      <Subtitles scenes={LION_RABBIT_SCENES} language={language} />
    </AbsoluteFill>
  );
};

export const EPISODE1_DURATION = calcEpisodeDuration(LION_RABBIT_SCENES);
