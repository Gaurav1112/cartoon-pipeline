// src/compositions/episode1/Subtitles.tsx
//
// M5.1 — Burnt-in subtitle layer.
// Shorts research: captions lift completion +30–40%. Renders a
// per-language, font-pinned, safe-area pill at the bottom of the
// frame, in sync with each dialogue line in the scene timeline.
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { ViralScene } from './types';
import type { SupportedLanguage } from '../../types';
import { calcDialogueDur, postGapFrames, sceneTailFrames } from './timing';

const FPS = 30;

export interface SubtitleCue {
  /** Episode-absolute start frame */
  startFrame: number;
  /** Episode-absolute end frame (exclusive) */
  endFrame: number;
  text: string;
  language: SupportedLanguage;
}

/**
 * Per-language subtitle font + weight pin.
 * Bold weight ensures legibility against busy cartoon backgrounds.
 * Each entry references a `@remotion/google-fonts/*` family that is
 * either already used elsewhere in the app (Devanagari) or matches a
 * Noto Sans script family that ships with @remotion/google-fonts.
 */
export const SUBTITLE_FONT_BY_LANG: Record<
  SupportedLanguage,
  { fontFamily: string; fontWeight: number }
> = {
  hi: { fontFamily: "'Noto Sans Devanagari', 'Baloo 2', sans-serif", fontWeight: 700 },
  mr: { fontFamily: "'Noto Sans Devanagari', 'Baloo 2', sans-serif", fontWeight: 700 },
  ta: { fontFamily: "'Noto Sans Tamil', sans-serif",                fontWeight: 700 },
  te: { fontFamily: "'Noto Sans Telugu', sans-serif",               fontWeight: 700 },
  kn: { fontFamily: "'Noto Sans Kannada', sans-serif",              fontWeight: 700 },
  bn: { fontFamily: "'Noto Sans Bengali', sans-serif",              fontWeight: 700 },
  en: { fontFamily: "'Noto Sans', 'Baloo 2', sans-serif",           fontWeight: 700 },
};

/**
 * Pure helper — flatten the scene timeline into an absolute-framed
 * subtitle track. Mirrors the same per-line `dur`/`postGap`/scene-tail
 * accounting that `Episode1.tsx` uses, so cue frames line up exactly
 * with their visual scene Sequence.
 *
 * Honors the per-line transition half-overlap: TRANSITION_FRAMES=16
 * is symmetric (8 before / 8 after). Subtitles ride on top of the
 * camera div, but their *frame extents* belong to the scene that owns
 * the line, not the transition.
 */
export function buildSubtitleTrack(
  scenes: ViralScene[],
  language: SupportedLanguage,
): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  let cursor = 0;

  for (const scene of scenes) {
    const sceneStart = cursor;

    if (scene.dialogue.length === 0) {
      // Scene with no dialogue (e.g. intro) — advance cursor by its dur.
      const sceneDur = typeof scene.dur === 'number'
        ? scene.dur * FPS
        : 0;
      cursor += Math.max(1, sceneDur);
      cursor += sceneTailFrames(scene.sceneTailMs);
      continue;
    }

    let lineCursor = sceneStart;
    for (const line of scene.dialogue) {
      const dur = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
      const gap = postGapFrames(line.postGapMs);
      const start = lineCursor;
      const end = lineCursor + dur; // subtitle visible during the line, hidden during gap
      if (line.text && line.text.length > 0 && end > start) {
        cues.push({
          startFrame: start,
          endFrame: end,
          text: line.text,
          language,
        });
      }
      lineCursor += dur + gap;
    }

    // If the scene declares a fixed dur, the cursor advances by that
    // (matches Episode1's `scene.dur * FPS`). Otherwise sum-of-lines.
    if (typeof scene.dur === 'number') {
      cursor = sceneStart + scene.dur * FPS;
    } else {
      cursor = lineCursor;
    }
    cursor += sceneTailFrames(scene.sceneTailMs);
  }

  return cues;
}

interface SubtitlesProps {
  scenes: ViralScene[];
  language: SupportedLanguage;
}

export const Subtitles: React.FC<SubtitlesProps> = ({ scenes, language }) => {
  const track = React.useMemo(
    () => buildSubtitleTrack(scenes, language),
    [scenes, language],
  );
  const font = SUBTITLE_FONT_BY_LANG[language];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 600 }}>
      {track.map((cue, i) => (
        <Sequence
          key={`sub-${i}`}
          from={cue.startFrame}
          durationInFrames={cue.endFrame - cue.startFrame}
        >
          <SubtitlePill text={cue.text} fontFamily={font.fontFamily} fontWeight={font.fontWeight} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const SubtitlePill: React.FC<{ text: string; fontFamily: string; fontWeight: number }> = ({
  text,
  fontFamily,
  fontWeight,
}) => (
  <div
    style={{
      position: 'absolute',
      // Safe area: ~12% margin from bottom keeps captions above
      // YouTube's UI and within TV title-safe zones.
      bottom: 130,
      left: '8%',
      right: '8%',
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.72)',
        color: '#FFFFFF',
        padding: '14px 32px',
        borderRadius: 36,
        fontFamily,
        fontWeight,
        fontSize: 44,
        lineHeight: 1.25,
        textAlign: 'center',
        WebkitTextStroke: '1.5px #000',
        textShadow:
          '0 0 6px rgba(0,0,0,0.9), 2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000',
        maxWidth: '90%',
      }}
    >
      {text}
    </div>
  </div>
);
