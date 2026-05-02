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
import type { ViralScene } from './types';

const FPS = 30;

const CHAR_POSITIONS: Record<'left' | 'center' | 'right', { x: number; y: number }> = {
  left:   { x: 350,  y: 480 },
  center: { x: 860,  y: 460 },
  right:  { x: 1370, y: 480 },
};

interface SceneRendererProps {
  scene: ViralScene;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene duration ────────────────────────────────────────────────
  const sceneDurFrames = typeof scene.dur === 'number'
    ? scene.dur * FPS
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
  const lineStarts: number[] = [];
  let cursor = 0;
  for (const line of scene.dialogue) {
    lineStarts.push(cursor);
    cursor += line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
  }

  return (
    <AbsoluteFill>
      <div style={{
        transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
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

        {/* Characters — staggered spring entrances */}
        {scene.chars.map((char, i) => {
          const entranceScale = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 14, stiffness: 120, mass: 0.45 },
          });
          return (
            <div
              key={`${char.id}-${i}`}
              style={{ transform: `scale(${Math.max(0, entranceScale)})`, transformOrigin: 'center bottom' }}
            >
              <CharacterRenderer
                characterId={char.id}
                pose={char.pose}
                expression={char.expr}
                mouthShape="B"
                position={CHAR_POSITIONS[char.pos]}
                scale={2.0}
                flipX={char.flip ?? false}
              />
            </div>
          );
        })}

        {/* Dialogue bubbles + SFX per line */}
        {scene.dialogue.map((line, idx) => {
          const startFrame = lineStarts[idx];
          const durFrames = line.dur === 'auto' ? calcDialogueDur(line.text) : line.dur;
          const speakerPos = scene.chars.find(c => c.id === line.char)?.pos ?? 'center';

          return (
            <React.Fragment key={idx}>
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

              {/* Pattern interrupt: cut_to_black */}
              {line.patternInterrupt === 'cut_to_black' && (
                <Sequence from={startFrame} durationInFrames={6}>
                  <AbsoluteFill style={{ background: '#000', zIndex: 500 }} />
                </Sequence>
              )}

              {/* Pattern interrupt: zoom_punch (fast zoom snap on line start) */}
              {line.patternInterrupt === 'zoom_punch' && frame >= startFrame && frame < startFrame + 4 && (
                <AbsoluteFill style={{
                  transform: `scale(${interpolate(frame - startFrame, [0, 4], [1.15, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                  transformOrigin: 'center center',
                  background: 'transparent',
                  zIndex: 300,
                  pointerEvents: 'none',
                }} />
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
    </AbsoluteFill>
  );
};
