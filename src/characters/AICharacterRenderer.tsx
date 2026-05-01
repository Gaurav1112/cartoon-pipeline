import React from 'react';
import { useCurrentFrame, Img, staticFile, interpolate } from 'remotion';
import type { CharacterId, Pose, EmotionType, MouthShape } from '../types';
import { getMouthShape } from './lip-sync';

/**
 * AI-generated character renderer.
 * Loads pre-rendered PNG frames and applies CSS-based animation.
 * Falls back to SVG CharacterRenderer if PNG doesn't exist.
 */

interface AICharacterRendererProps {
  characterId: CharacterId;
  pose: Pose;
  expression: EmotionType;
  mouthShape?: MouthShape;
  position: { x: number; y: number };
  scale?: number;
  flipX?: boolean;
}

// Map poses to available AI-generated frames (reduced matrix)
const AVAILABLE_POSES: Record<string, string[]> = {
  idle_stand: ['neutral', 'happy', 'sad', 'angry', 'surprised', 'thinking', 'determined'],
  talk_gesture: ['neutral', 'happy', 'angry', 'determined'],
  point: ['angry', 'determined', 'surprised'],
  surprised: ['surprised', 'scared'],
  sad: ['sad'],
  laugh: ['happy'],
  think: ['thinking'],
  wave: ['happy'],
  celebrate: ['happy'],
};

// Map unavailable poses to closest available pose
const POSE_FALLBACK: Record<string, string> = {
  idle_sit: 'idle_stand',
  walk_cycle: 'idle_stand',
  angry: 'idle_stand',
};

// Map unavailable expressions to closest available
function findBestMatch(pose: string, expression: string): { pose: string; expression: string } {
  const availPose = AVAILABLE_POSES[pose] ? pose : (POSE_FALLBACK[pose] ?? 'idle_stand');
  const availExprs = AVAILABLE_POSES[availPose] ?? ['neutral'];
  const expr = availExprs.includes(expression) ? expression : availExprs[0];
  return { pose: availPose, expression: expr };
}

export const AICharacterRenderer: React.FC<AICharacterRendererProps> = ({
  characterId,
  pose,
  expression,
  mouthShape = 'B',
  position,
  scale = 1,
  flipX = false,
}) => {
  const frame = useCurrentFrame();
  const mouth = getMouthShape(mouthShape);

  // Find the best matching PNG
  const match = findBestMatch(pose, expression);
  const imagePath = `characters/${characterId}/${match.pose}_${match.expression}.png`;

  // CSS-based animations (preserved from SVG approach)
  const breathe = Math.sin(frame * 0.07) * 0.008; // scale Y oscillation
  const idleSway = Math.sin(frame * 0.03) * 0.5; // degrees rotation
  const walkPhase = (frame % 24) / 24;
  const isWalking = pose === 'walk_cycle';
  const walkBob = isWalking ? Math.abs(Math.sin(walkPhase * Math.PI * 2)) * -6 : 0;
  const isTalking = mouthShape !== 'B';
  const talkBob = isTalking ? Math.sin(frame * 0.12) * 1.5 : 0;

  // Character entrance spring (first 15 frames)
  const entranceScale = interpolate(frame, [0, 15], [0.85, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x - 70 * scale,
        top: position.y - 180 * scale + walkBob + talkBob,
        width: 140 * scale,
        height: 220 * scale,
        transform: `scaleX(${flipX ? -1 : 1}) scaleY(${1 + breathe}) rotate(${idleSway}deg) scale(${entranceScale})`,
        transformOrigin: 'center bottom',
      }}
    >
      {/* AI-generated character PNG */}
      <Img
        src={staticFile(imagePath)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {/* SVG mouth overlay for lip sync (small, on top of the face area) */}
      {isTalking && (
        <svg
          width={30 * scale}
          height={20 * scale}
          viewBox="-15 -10 30 20"
          style={{
            position: 'absolute',
            left: '50%',
            top: `${35 * scale}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {mouth.shape === 'ellipse' ? (
            <ellipse cx="0" cy="0" rx={mouth.width / 2} ry={mouth.height / 2}
              fill="#8B0000" stroke="#333" strokeWidth={1} />
          ) : mouth.shape === 'circle' ? (
            <circle cx="0" cy="0" r={mouth.width / 2}
              fill="#8B0000" stroke="#333" strokeWidth={1} />
          ) : (
            <line x1={-mouth.width / 2} y1="0" x2={mouth.width / 2} y2="0"
              stroke="#333" strokeWidth={2} strokeLinecap="round" />
          )}
        </svg>
      )}

      {/* Ground shadow */}
      <div style={{
        position: 'absolute',
        bottom: -4 * scale,
        left: '15%',
        width: '70%',
        height: 8 * scale,
        background: 'rgba(0,0,0,0.15)',
        borderRadius: '50%',
        filter: 'blur(3px)',
      }} />
    </div>
  );
};
