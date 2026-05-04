// src/compositions/episode1/SceneRenderer.tsx
import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence,
} from 'remotion';
import { BackgroundRenderer } from '../../scenes/BackgroundRenderer';
import { CharacterRenderer } from '../../characters/CharacterRenderer';
import { DialogueBubble } from '../DialogueBubble';
import { SFXLayer } from './SFXLayer';
import { calcDialogueDur, activeLineAtFrame, type SceneAudioTiming, lineStartFramesFromAudio, calcSceneDurFromAudio } from './timing';
import { firstCharEntranceScale } from './entrance';
import { MotionSmear } from '../effects/MotionSmear';
import { poseModifierByEmotion } from '../../characters/animation-life';
import { applyColorBeat, COLOR_SCRIPT_BY_MOOD, resolveMood } from '../../color/color-script';
import { chopScene } from './scene-chopper';
import type { ViralScene } from './types';
import type { EmotionType } from '../../types';

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
  /**
   * M16 (audit-v13): when supplied, line offsets and total scene
   * duration use the audio engine's ffprobe-measured timings instead
   * of `calcDialogueDur` estimates.
   */
  audioTiming?: SceneAudioTiming;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, audioTiming }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene duration ────────────────────────────────────────────────
  // M16: prefer audio-measured durations when available; fallback to
  // text-length estimator for Studio preview / tests without audio data.
  const sceneDurFrames = audioTiming
    ? calcSceneDurFromAudio(audioTiming)
    : typeof scene.dur === 'number'
      ? scene.dur * fps
      : scene.dialogue.reduce(
          (s, l) => s + (l.dur === 'auto' ? calcDialogueDur(l.text) : l.dur),
          0
        );

  // ── M24: Scene Chopper ─────────────────────────────────────────────
  const subShots = scene.shortsCutScene
    ? [{ startFrame: 0, endFrame: sceneDurFrames, cam: scene.cam, camI: scene.camI }]
    : chopScene(scene.id, sceneDurFrames, scene.cam, scene.camI);
  
  const activeSubShot = subShots.find(s => frame >= s.startFrame && frame < s.endFrame)
    || subShots[subShots.length - 1];
  
  const activeCam = activeSubShot.cam;
  const activeCamI = activeSubShot.camI;
  const subProgress = Math.min(1, (frame - activeSubShot.startFrame) / Math.max(1, activeSubShot.endFrame - activeSubShot.startFrame));

  const progress = Math.min(1, frame / Math.max(1, sceneDurFrames));
  const intensity = activeCamI;
  let translateX = 0, translateY = 0, zoom = 1;

  // ── Camera ────────────────────────────────────────────────────────
  switch (activeCam) {
    case 'pan_left':
      translateX = interpolate(subProgress, [0.1, 0.9], [0, -30 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'pan_right':
      translateX = interpolate(subProgress, [0.1, 0.9], [0, 30 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'zoom_in':
      zoom = interpolate(subProgress, [0.1, 0.9], [1, 1 + 0.12 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'zoom_out':
      zoom = interpolate(subProgress, [0.1, 0.9], [1 + 0.1 * intensity, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'drift':
      translateX = Math.sin(subProgress * Math.PI) * 14 * intensity;
      translateY = Math.cos(subProgress * Math.PI) * 7 * intensity;
      break;
    case 'shake': {
      const shakeAmp = 8 * intensity * Math.exp(-subProgress * 3);
      translateX = Math.sin(frame * 2.1) * shakeAmp;
      translateY = Math.cos(frame * 3.7) * shakeAmp * 0.6;
      break;
    }
    case 'close_up': {
      // M10 (visual panel #5): emotional close-up. Hold a 1.25-1.5x crop
      // weighted by intensity so the speaker fills the frame. Subtle drift
      // upward keeps it cinematic (not static-zoomed).
      zoom = 1.25 + 0.25 * intensity;
      translateY = interpolate(subProgress, [0, 1], [6, -6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    }
    case 'wide': {
      // M10 (visual panel #5): establishing wide. Slight pull-back below 1
      // so environment + character size relationships read clearly.
      zoom = 1 - 0.08 * intensity;
      translateY = -4 * intensity;
      break;
    }
    default: break;
  }

  // ── Dialogue line start frames ────────────────────────────────────
  // FIX(perf): computed once outside the map to avoid recalculating on every
  // render frame for each dialogue line.
  // M16 (audit-v13): when audioTiming is supplied, use the audio
  // engine's measured starts so zoom_punch / line-active highlighting
  // match the actual TTS timeline (no longer drifts ~2s per line).
  const lineStarts: number[] = audioTiming
    ? lineStartFramesFromAudio(audioTiming)
    : (() => {
        const arr: number[] = [];
        let c = 0;
        for (const line of scene.dialogue) {
          arr.push(c);
          c += line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
        }
        return arr;
      })();

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

    // Tartakovsky impact-frame smear: paired with zoom_punch and shake
    // — 2-frame motion-blur trail across the screen at the impact moment.
    if (line.patternInterrupt === 'zoom_punch' || line.patternInterrupt === 'shake') {
      // Deterministic angle derived from line index (no RNG): cycles
      // through 12 directions for visual variety across scenes.
      const angleDeg = (idx * 47) % 360;
      patternOverlays.push(
        <MotionSmear
          key={`smear-${idx}`}
          startFrame={startFrame}
          angleDeg={angleDeg}
          lengthPx={320}
        />,
      );
    }

  }

  return (
    <AbsoluteFill>
      {/* M4.1 (Deakins): per-mood color script wrapper. Pure visual filter
          + CSS variables for child SVGs. Applied OUTSIDE the camera div so
          camera transforms don't compound with filter rasterization. */}
      <div style={{
        ...applyColorBeat(COLOR_SCRIPT_BY_MOOD[resolveMood(scene.mood)]),
        position: 'absolute',
        inset: 0,
      }}>
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
            staggered spring entrances for supporting characters.
            M3.1 (Docter): the speaking character's expression follows the
            ACTIVE dialogue line's emotion, and a blended poseModifierByEmotion
            cross-fade smooths the boundary. Listening characters keep
            their scene-level expr. */}
        {(() => {
          // M16 (audit-v13): use the unified `lineStarts` array (which
          // honours audioTiming when present) instead of re-computing
          // via `activeLineAtFrame` — the latter would re-derive from
          // text-length estimates and drift away from audio timing.
          let lineIndex = 0;
          for (let i = 0; i < lineStarts.length; i++) {
            if (lineStarts[i] <= frame) lineIndex = i;
            else break;
          }
          const localFrame = lineIndex === 0 ? 0 : frame - lineStarts[lineIndex];
          const blendT = lineIndex === 0
            ? 1
            : localFrame >= 10
              ? 1
              : localFrame <= 0
                ? 0
                : localFrame / 10;
          const active = { lineIndex, blendT };
          const activeLine = scene.dialogue[active.lineIndex];
          const prevLine = active.lineIndex > 0 ? scene.dialogue[active.lineIndex - 1] : undefined;
          const speakerId = activeLine?.char;

          return scene.chars.map((char, i) => {
            const entranceScale = firstCharEntranceScale({ frame, fps, charIndex: i });
            const isSpeaker = char.id === speakerId;

            // Per-line emotion override (Docter M3.1). Default to scene-level expr.
            const currEmotion: EmotionType = (isSpeaker && activeLine?.emotion) || char.expr;
            const prevEmotion: EmotionType =
              (isSpeaker && prevLine?.emotion) || currEmotion;

            // Cross-fade pose modifier across the boundary window.
            const a = poseModifierByEmotion(prevEmotion);
            const b = poseModifierByEmotion(currEmotion);
            const t = active.blendT;
            const tilt = a.tiltDeg + (b.tiltDeg - a.tiltDeg) * t;
            const hip = a.hipShiftPx + (b.hipShiftPx - a.hipShiftPx) * t;
            const arm = a.armRaisePx + (b.armRaisePx - a.armRaisePx) * t;

            return (
              <div
                key={`${char.id}-${i}`}
                style={{ transform: `scale(${entranceScale})`, transformOrigin: 'center bottom' }}
              >
                <div
                  style={{
                    transform: `translate(${hip}px, ${-arm}px) rotate(${tilt}deg)`,
                    transformOrigin: 'center bottom',
                  }}
                >
                  <CharacterRenderer
                    characterId={char.id}
                    pose={char.pose}
                    expression={currEmotion}
                    mouthShape="B"
                    position={CHAR_POSITIONS[char.pos]}
                    scale={2.0}
                    flipX={char.flip ?? false}
                    timeOfDay={scene.time}
                    cam={scene.cam}
                    camI={scene.camI}
                    sceneStartFrame={0}
                  />
                </div>
              </div>
            );
          });
        })()}

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
      </div>
    </AbsoluteFill>
  );
};
