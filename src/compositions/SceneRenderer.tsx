import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import type { EpisodeScene, CharacterId, MouthCue } from '../types';
import { BackgroundRenderer } from '../scenes/BackgroundRenderer';
import { CharacterRenderer } from '../characters/CharacterRenderer';
import { AICharacterRenderer } from '../characters/AICharacterRenderer';
import { DialogueBubble } from './DialogueBubble';

// Set to true once AI-generated PNG frames are available in public/characters/
// When false, falls back to the original SVG CharacterRenderer
const USE_AI_CHARACTERS = false;

const ActiveCharacterRenderer = USE_AI_CHARACTERS ? AICharacterRenderer : CharacterRenderer;

interface SceneRendererProps {
  scene: EpisodeScene;
  mouthCues: Record<CharacterId, MouthCue[]>;
  startFrame: number;
}

const CHARACTER_POSITIONS = {
  left: { x: 250, y: 500 },
  center: { x: 860, y: 480 },
  right: { x: 1450, y: 500 },
};

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  scene,
  mouthCues,
  startFrame,
}) => {
  const frame = useCurrentFrame();

  // Camera movement
  const { type: camType, intensity } = scene.cameraMovement;
  let translateX = 0;
  let translateY = 0;
  let zoom = 1;

  const progress = frame / scene.durationFrames;

  // Kid-friendly camera: GENTLE movements, nothing jarring
  // Slower than adult content — kids need visual stability
  switch (camType) {
    case 'pan_left':
      translateX = interpolate(progress, [0.1, 0.9], [0, -30 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'pan_right':
      translateX = interpolate(progress, [0.1, 0.9], [0, 30 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'zoom_in':
      zoom = interpolate(progress, [0.1, 0.9], [1, 1 + 0.08 * intensity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'zoom_out':
      zoom = interpolate(progress, [0.1, 0.9], [1 + 0.06 * intensity, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      break;
    case 'drift':
      // Very gentle drift — like a lullaby camera
      translateX = Math.sin(progress * Math.PI) * 12 * intensity;
      translateY = Math.cos(progress * Math.PI) * 6 * intensity;
      break;
  }

  // Determine current mouth shape from cues
  const currentTimeSec = (startFrame + frame) / 30;
  function getCurrentMouthShape(charId: CharacterId) {
    const cues = mouthCues[charId] ?? [];
    const current = cues.find((c) => currentTimeSec >= c.start && currentTimeSec < c.end);
    return current?.shape ?? 'B';
  }

  // Kid-friendly dialogue timing:
  // Each line gets 4-5 seconds on screen + 1.5s pause before next speaker
  // This is MUCH slower than adult content — kids need time to absorb
  const FRAMES_PER_LINE = 135;     // 4.5 seconds per dialogue line
  const PAUSE_BETWEEN = 45;        // 1.5 seconds between speakers
  const dialogueFramesPerLine = FRAMES_PER_LINE + PAUSE_BETWEEN; // 6s total per line slot

  return (
    <AbsoluteFill>
      <div style={{
        transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
        transformOrigin: 'center center',
        width: '100%', height: '100%',
      }}>
        {/* Background */}
        <BackgroundRenderer
          locationType={scene.location}
          timeOfDay={scene.timeOfDay}
          parallaxOffset={translateX}
        />

        {/* Characters */}
        {scene.characters.map((char) => (
          <ActiveCharacterRenderer
            key={char.characterId}
            characterId={char.characterId}
            pose={char.pose}
            expression={char.expression}
            mouthShape={getCurrentMouthShape(char.characterId)}
            position={CHARACTER_POSITIONS[char.position]}
            scale={1.8}
            flipX={char.flipX}
          />
        ))}

        {/* Dialogue bubbles */}
        {scene.dialogue.map((line, idx) => (
          <DialogueBubble
            key={idx}
            text={line.text}
            characterId={line.characterId}
            position={
              scene.characters.find((c) => c.characterId === line.characterId)?.position ?? 'center'
            }
            startFrame={idx * dialogueFramesPerLine + 15}
            durationFrames={FRAMES_PER_LINE}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
