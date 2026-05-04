// src/compositions/ShortsEpisode.tsx
//
// 9:16 vertical Shorts composition (1080×1920) capped at ≤60s (1800 frames).
// Reuses scene data marked shortsCutScene/shortsFlag in scenes-lion-rabbit so
// the Shorts cut is automatically derived from the long-form episode.
//
// Monetization rationale: a single edit produces both long-form (16:9) and
// Shorts (9:16) revenue surfaces from one render pipeline.

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { SupportedLanguage } from '../types';
import { SceneRenderer } from './episode1/SceneRenderer';
import { LION_RABBIT_SCENES as RAW_LION_RABBIT_SCENES } from './episode1/scenes-lion-rabbit';
import { enforceSideProfile } from './episode1/side-profile-enforcer';
const LION_RABBIT_SCENES = enforceSideProfile(RAW_LION_RABBIT_SCENES);
import { calcSceneDur } from './episode1/timing';

export const SHORTS_FPS = 30;
export const SHORTS_WIDTH = 1080;
export const SHORTS_HEIGHT = 1920;
export const SHORTS_MAX_FRAMES = 60 * SHORTS_FPS; // 1800

/**
 * Pure helper: given the episode scene list, return the scenes flagged for
 * Shorts in source order, then truncate so the total never exceeds the
 * platform-imposed 60-second cap.
 */
export function selectShortsScenes(scenes: typeof LION_RABBIT_SCENES) {
  const result: typeof LION_RABBIT_SCENES = [];
  let totalFrames = 0;
  for (const scene of scenes) {
    if (!scene.shortsCutScene) continue;
    const dur = typeof scene.dur === 'number'
      ? scene.dur * SHORTS_FPS
      : calcSceneDur(scene.dialogue);
    if (totalFrames + dur > SHORTS_MAX_FRAMES) break;
    result.push(scene);
    totalFrames += dur;
  }
  return { scenes: result, totalFrames };
}

export function calcShortsDuration(): number {
  const { totalFrames } = selectShortsScenes(LION_RABBIT_SCENES);
  // Always render at least 1 frame; clamp to platform max.
  return Math.min(SHORTS_MAX_FRAMES, Math.max(1, totalFrames));
}

interface ShortsEpisodeProps {
  language?: SupportedLanguage;
}

export const ShortsEpisode: React.FC<ShortsEpisodeProps> = ({ language: _language = 'hi' }) => {
  const { scenes } = selectShortsScenes(LION_RABBIT_SCENES);
  const elements: React.ReactElement[] = [];
  let cursor = 0;

  for (const scene of scenes) {
    const dur = typeof scene.dur === 'number' ? scene.dur * SHORTS_FPS : calcSceneDur(scene.dialogue);
    elements.push(
      <Sequence key={scene.id} from={cursor} durationInFrames={dur}>
        {/*
          Source SceneRenderer was authored at 1920×1080. We center-crop into a
          1080×1920 viewport by scaling the 1920-wide content to fit 1920 vertical
          (zoom 1.78×) and translating to keep characters in the safe centre.
        */}
        <AbsoluteFill style={{
          background: '#000',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 1920,
            height: 1080,
            transform: 'translate(-50%, -50%) scale(1.78)',
            transformOrigin: 'center center',
          }}>
            <SceneRenderer scene={scene} />
          </div>
        </AbsoluteFill>
      </Sequence>
    );
    cursor += dur;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {elements}
    </AbsoluteFill>
  );
};
