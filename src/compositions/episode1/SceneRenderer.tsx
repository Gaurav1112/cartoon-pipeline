// src/compositions/episode1/SceneRenderer.tsx
import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence,
} from 'remotion';
import { BackgroundRenderer } from '../../scenes/BackgroundRenderer';
import { CharacterRenderer } from '../../characters/CharacterRenderer';
import { DialogueBubble } from '../DialogueBubble';
import { SFXLayer } from './SFXLayer';
import { calcDialogueDur } from './timing';
import { firstCharEntranceScale } from './entrance';
import type { ViralScene } from './types';

// FIX(perf): removed module-level FPS=30 constant; use fps from useVideoConfig()
// so the component is correct at any frame rate.

// Rule of thirds — Kubrick / Deakins composition contract.
// 1920x1080 thirds: x = 640, 960, 1280. y stays roughly on the lower third.
// (Previous values 350/860/1370 were arbitrary and broke classical composition.)
const CHAR_POSITIONS: Record<'left' | 'center' | 'right', { x: number; y: number }> = {
  left:   { x: 640,  y: 480 },
  center: { x: 960,  y: 460 },
  right:  { x: 1280, y: 480 },
};

interface SceneRendererProps {
  scene: ViralScene;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene duration ────────────────────────────────────────────────
  // FIX: use fps from useVideoConfig() instead of hardcoded FPS=30
  const sceneDurFrames = typeof scene.dur === 'number'
    ? scene.dur * fps
    : scene.dialogue.reduce(
        (s, l) => s + (l.dur === 'auto' ? calcDialogueDur(l.text) : l.dur),
        0
      );

  const progress = Math.min(1, frame / Math.max(1, sceneDurFrames));
  const intensity = scene.camI;
  let translateX = 0, translateY = 0, zoom = 1;

  // ── Camera ────────────────────────────────────────────────────────
  switch (scene.cam) {
    case 'pan_left':
      translateX = interpolate(progress, [0.1, 0.9], [0, -30 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'pan_right':
      translateX = interpolate(progress, [0.1, 0.9], [0, 30 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'zoom_in':
      zoom = interpolate(progress, [0.1, 0.9], [1, 1 + 0.12 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'zoom_out':
      zoom = interpolate(progress, [0.1, 0.9], [1 + 0.1 * intensity, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'drift':
      translateX = Math.sin(progress * Math.PI) * 14 * intensity;
      translateY = Math.cos(progress * Math.PI) * 7 * intensity;
      break;
    case 'shake': {
      const shakeAmp = 8 * intensity * Math.exp(-progress * 3);
      translateX = Math.sin(frame * 2.1) * shakeAmp;
      translateY = Math.cos(frame * 3.7) * shakeAmp * 0.6;
      break;
    }
    default: break;
  }

  // ── Dialogue line start frames ────────────────────────────────────
  // FIX(perf): computed once outside the map to avoid recalculating on every
  // render frame for each dialogue line.
  const lineStarts: number[] = [];
  let cursor = 0;
  for (const line of scene.dialogue) {
    lineStarts.push(cursor);
    cursor += line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
  }

  // ── Active zoom_punch scale for scene-level content wrapper ──────
  // FIX(critical): zoom_punch previously rendered a transparent AbsoluteFill
  // with a scale transform, which had no visual effect because it contained
  // no content. The zoom must be applied to the camera/content wrapper div.
  let zoomPunchScale = 1;
  for (let idx = 0; idx < scene.dialogue.length; idx++) {
    const line = scene.dialogue[idx];
    if (line.patternInterrupt === 'zoom_punch') {
      const lineStart = lineStarts[idx] ?? 0;
      // Tartakovsky: 6-frame zoom_punch = 2-frame peak hold + 4-frame ease-out.
      // Held emphasis lands the moment instead of flicking past it.
      if (frame >= lineStart && frame < lineStart + 6) {
        const local = frame - lineStart;
        zoomPunchScale = local < 2
          ? 1.18
          : interpolate(local, [2, 6], [1.18, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
        break; // only one zoom_punch active at a time
      }
    }
  }

  // ── Collect per-line pattern interrupt state (outside JSX for clarity) ──
  // These need to be outside the camera div so they are NOT affected by
  // camera zoom/pan/shake transforms.
  const patternOverlays: React.ReactElement[] = [];
  for (let idx = 0; idx < scene.dialogue.length; idx++) {
    const line = scene.dialogue[idx];
    const startFrame = lineStarts[idx] ?? 0;

    if (line.patternInterrupt === 'cut_to_black') {
      // cut_to_black: inside camera div is fine — it covers everything.
      // But moved here for consistency. The Sequence handles its own timing.
      patternOverlays.push(
        <Sequence key={`ctb-${idx}`} from={startFrame} durationInFrames={6}>
          <AbsoluteFill style={{ background: '#000', zIndex: 500 }} />
        </Sequence>
      );
    } else if (line.patternInterrupt === 'freeze_frame' && frame >= startFrame && frame < startFrame + 12) {
      // FIX(critical): freeze_frame was silently unhandled. Now renders a brief
      // white vignette flash outside the camera div so it covers the whole frame
      // at full size unaffected by camera zoom. True frame-freezing requires
      // Remotion's <Freeze> component — see unresolved issues in comments.
      patternOverlays.push(
        <AbsoluteFill key={`ff-${idx}`} style={{
          boxShadow: 'inset 0 0 0 8px rgba(255,255,255,0.85)',
          zIndex: 400,
          pointerEvents: 'none',
        }} />
      );
    } else if (line.patternInterrupt === 'shake' && frame >= startFrame && frame < startFrame + 8) {
      // FIX(critical): shake patternInterrupt was silently unhandled. Now an
      // AbsoluteFill with a translate transform creates the visual shake.
      // Placed outside the camera div to avoid compounding with camera transforms.
      const relF = frame - startFrame;
      const sx = Math.sin(relF * 2.3) * 10 * Math.exp(-relF * 0.4);
      const sy = Math.cos(relF * 3.5) * 5 * Math.exp(-relF * 0.4);
      patternOverlays.push(
        <AbsoluteFill key={`shake-${idx}`} style={{
          transform: `translate(${sx}px, ${sy}px)`,
          zIndex: 350,
          pointerEvents: 'none',
        }} />
      );
    }

  }

  return (
    <AbsoluteFill>
      {/* FIX(critical): zoom_punch scale is now composed into the camera
          transform so it actually affects scene content visuals. */}
      <div style={{
        transform: `translate(${translateX}px, ${translateY}px) scale(${zoom * zoomPunchScale})`,
        transformOrigin: 'center center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
      }}>
        {/* Background */}
        <BackgroundRenderer
          locationType={scene.bg}
          timeOfDay={scene.time}
          parallaxOffset={translateX}
        />

        {/* Characters — frame-0 hook for charIndex 0 (lead visible immediately),
            staggered spring entrances for supporting characters. */}
        {scene.chars.map((char, i) => {
          const entranceScale = firstCharEntranceScale({ frame, fps, charIndex: i });
          return (
            <div
              key={`${char.id}-${i}`}
              style={{ transform: `scale(${entranceScale})`, transformOrigin: 'center bottom' }}
            >
              <CharacterRenderer
                characterId={char.id}
                pose={char.pose}
                expression={char.expr}
                mouthShape="B"
                position={CHAR_POSITIONS[char.pos]}
                scale={2.0}
                flipX={char.flip ?? false}
                timeOfDay={scene.time}
              />
            </div>
          );
        })}

        {/* Dialogue bubbles + SFX per line (inside camera div for proper positioning) */}
        {scene.dialogue.map((line, idx) => {
          const startFrame = lineStarts[idx] ?? 0;
          const durFrames = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
          const speakerPos = scene.chars.find(c => c.id === line.char)?.pos ?? 'center';

          return (
            <React.Fragment key={`${line.char}-${idx}`}>
              <DialogueBubble
                text={line.text}
                characterId={line.char}
                position={speakerPos}
                startFrame={startFrame}
                durationFrames={durFrames}
                textOverlay={line.textOverlay}
              />

              {line.sfxKey && (
                <SFXLayer
                  sfxKey={line.sfxKey}
                  startFrame={startFrame}
                  durationFrames={Math.min(durFrames, 45)}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Ambient SFX for entire scene */}
        {scene.ambientSfx && (
          <SFXLayer
            sfxKey={scene.ambientSfx}
            startFrame={0}
            durationFrames={sceneDurFrames}
          />
        )}
      </div>

      {/* Pattern interrupt overlays — rendered OUTSIDE camera div so they are
          not affected by camera zoom/pan/shake transforms. */}
      {patternOverlays}
    </AbsoluteFill>
  );
};
