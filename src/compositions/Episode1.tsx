// src/compositions/Episode1.tsx
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { SupportedLanguage, MasterAudioResult } from '../types';
import { IntroSequence } from './IntroSequence';
import { OutroSequence } from './OutroSequence';
import { MoralCard } from './MoralCard';
import { TransitionEffect, getTransitionType } from './TransitionEffects';
import { SceneRenderer } from './episode1/SceneRenderer';
import { LION_RABBIT_SCENES as RAW_LION_RABBIT_SCENES } from './episode1/scenes-lion-rabbit';
import { enforceSideProfile } from './episode1/side-profile-enforcer';
import {
  calcSceneDur,
  calcEpisodeDuration,
  calcSceneDurFromAudio,
  calcEpisodeDurationFromAudio,
  validateSceneChars,
  type SceneAudioTiming,
} from './episode1/timing';
import { Subtitles } from './episode1/Subtitles';
import { RhythmInterruptOverlay } from './episode1/RhythmInterrupt';
import { extractExplicitInterruptFrames } from './episode1/extract-interrupts';
import { RhythmInterruptOverlay } from './episode1/RhythmInterrupt';
import { extractExplicitInterruptFrames } from './episode1/extract-interrupts';

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
  /**
   * M16 (audit-v13): when supplied by the render pipeline, scene/line
   * durations are pulled from the audio engine's ffprobe-measured TTS
   * timings instead of `calcDialogueDur` estimates. This eliminates the
   * 97s silence tail that came from over-estimating Hindi Piper TTS by
   * 2.5–3x. Falls back to estimates when undefined (Studio preview).
   */
  audioData?: Partial<MasterAudioResult>;
}

export const Episode1: React.FC<Episode1Props> = ({ language = 'hi', audioData }) => {
  const elements: React.ReactElement[] = [];
  let currentFrame = 0;

  const timingByIndex = new Map<number, SceneAudioTiming>();
  if (audioData?.sceneDialogueTimings) {
    for (const t of audioData.sceneDialogueTimings) {
      timingByIndex.set(t.sceneIndex, t);
    }
  }

  LION_RABBIT_SCENES.forEach((scene, idx) => {
    const audioTiming = timingByIndex.get(idx);
    let rawDurFrames: number;
    if (audioTiming) {
      // M16: prefer audio-measured durations (deterministic A/V sync).
      rawDurFrames = calcSceneDurFromAudio(audioTiming);
    } else if (typeof scene.dur === 'number') {
      rawDurFrames = scene.dur * FPS;
    } else {
      rawDurFrames = calcSceneDur(scene.dialogue);
    }
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
          <SceneRenderer scene={scene} audioTiming={audioTiming} />
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

  // M18: extend OUTRO to absorb any audio tail (music + SFX) past the
  // scene content so video covers the full audio without dead air.
  // Without this, master_audio.wav (e.g., 71s incl. music tail) would
  // either be truncated (user hears "fraction of voice") or video
  // would have silent frames at the end.
  const audioMs = audioData?.masterAudioDurationMs;
  const audioFrames = typeof audioMs === 'number' && audioMs > 0
    ? Math.ceil((audioMs / 1000) * FPS)
    : 0;
  const baseOutroFrames = OUTRO_FRAMES;
  const tailExtraFrames = Math.max(0, audioFrames - currentFrame - baseOutroFrames);
  const finalOutroFrames = baseOutroFrames + tailExtraFrames;

  elements.push(
    <Sequence key="outro" from={currentFrame} durationInFrames={finalOutroFrames}>
      <OutroSequence language={language} />
    </Sequence>
  );
  currentFrame += finalOutroFrames;

  // M22 (audit-v14): compute explicit interrupt frames for RhythmInterruptOverlay
  const explicitInterruptFrames = React.useMemo(() => {
    return extractExplicitInterruptFrames(LION_RABBIT_SCENES, timingByIndex);
  }, [timingByIndex]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {elements}
      {/* M22 — auto-injected rhythm interrupts every 3s to fill gaps */}
      <RhythmInterruptOverlay
        totalFrames={currentFrame}
        explicitInterruptFrames={explicitInterruptFrames}
      />
      {/* M5.1 — burnt-in multi-language subtitle layer (Shorts retention +30–40%) */}
      <Subtitles scenes={LION_RABBIT_SCENES} language={language} />
    </AbsoluteFill>
  );
};

export const EPISODE1_DURATION = calcEpisodeDuration(LION_RABBIT_SCENES);

/**
 * M16/M18 (audit-v13/v14): compute the episode duration from audio
 * data when available — used by Remotion's `calculateMetadata`
 * callback in `src/Root.tsx` so the master video timeline matches
 * the audio EXACTLY: never shorter (would truncate dialogue), never
 * longer (would create silence tail).
 *
 * M18: prefer ffprobe-measured `masterAudioDurationMs` (includes
 * music tail & SFX padding) over the dialogue-only scene timings
 * sum, so the video covers every millisecond of audio.
 */
export function calcEpisode1DurationFromProps(
  props: Episode1Props,
): number {
  const SCAFFOLD_FRAMES = (6 + 5) * FPS; // moral card + outro
  const scenes = LION_RABBIT_SCENES;
  const sceneBased = calcEpisodeDurationFromAudio(
    scenes,
    props.audioData?.sceneDialogueTimings,
  );
  // M18: round masterAudioDurationMs to whole frames at FPS.
  const audioMs = props.audioData?.masterAudioDurationMs;
  const audioBased = typeof audioMs === 'number' && audioMs > 0
    ? Math.ceil((audioMs / 1000) * FPS)
    : 0;
  // Take the max so we never truncate audio. Guard: ≥ scaffold.
  return Math.max(SCAFFOLD_FRAMES, sceneBased, audioBased);
}
