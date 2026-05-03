import React from 'react';
import { useCurrentFrame, Img, staticFile, interpolate } from 'remotion';
import type { CharacterId, Pose, EmotionType, MouthShape } from '../types';
import { getMouthShape } from './lip-sync';
import manifestJson from '../../public/characters/manifest.json';

/**
 * AI-generated character renderer.
 * Loads pre-rendered PNG frames and applies CSS-based animation.
 * Consults manifest.json (auto-generated from disk) to pick the
 * closest available (pose, expression). Falls back to character's
 * canonical PNG (`<id>.png`) when no per-emotion variant exists.
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

type ManifestEntry = { poses: Record<string, string[]>; canonical: string | null };
const MANIFEST = manifestJson as Record<string, ManifestEntry>;

// Ultimate emergency fallback if a character has no asset whatsoever — keeps
// the render unblocked instead of 404-ing. Points to a known-existing PNG.
const EMERGENCY_FALLBACK = 'characters/arjun/arjun.png';

// Map unavailable poses to closest available pose (semantic neighbours)
const POSE_FALLBACK: Record<string, string> = {
  idle_sit: 'idle_stand',
  walk_cycle: 'idle_stand',
  angry: 'point',
  scared: 'surprised',
  cheer: 'celebrate',
  victory: 'celebrate',
};

// Map unavailable expressions to closest available
const EXPR_FALLBACK: Record<string, string[]> = {
  scared: ['surprised', 'sad', 'neutral'],
  joyful: ['happy', 'neutral'],
  furious: ['angry', 'neutral'],
  curious: ['thinking', 'surprised', 'neutral'],
  proud: ['determined', 'happy', 'neutral'],
  tired: ['sad', 'neutral'],
};

// Resolve to an actual on-disk asset path, given what the manifest declares.
// Returns the relative path (under public/) that should be passed to staticFile.
export function resolveAssetPath(characterId: string, pose: string, expression: string): string {
  const entry = MANIFEST[characterId];
  if (!entry || (Object.keys(entry.poses).length === 0 && !entry.canonical)) {
    // No manifest data: try canonical naming convention, but if nothing,
    // we'd 404. Caller should treat empty entry as emergency.
    if (!entry) return EMERGENCY_FALLBACK;
  }

  // 1) try exact (pose, expression)
  if (entry.poses[pose]?.includes(expression)) {
    return `characters/${characterId}/${pose}_${expression}.png`;
  }
  // 2) try fallback poses for the same expression
  const fallbackPose = POSE_FALLBACK[pose];
  if (fallbackPose && entry.poses[fallbackPose]?.includes(expression)) {
    return `characters/${characterId}/${fallbackPose}_${expression}.png`;
  }
  // 3) try same pose with fallback expressions
  const exprAlts = EXPR_FALLBACK[expression] ?? ['neutral', 'happy'];
  for (const e of exprAlts) {
    if (entry.poses[pose]?.includes(e)) {
      return `characters/${characterId}/${pose}_${e}.png`;
    }
  }
  // 4) try idle_stand with the requested expression
  if (entry.poses['idle_stand']?.includes(expression)) {
    return `characters/${characterId}/idle_stand_${expression}.png`;
  }
  // 5) any first available pose+expr in the manifest
  for (const [p, exprs] of Object.entries(entry.poses)) {
    if (exprs.length) {
      return `characters/${characterId}/${p}_${exprs[0]}.png`;
    }
  }
  // 6) canonical
  if (entry.canonical) {
    return `characters/${characterId}/${entry.canonical}.png`;
  }
  return `characters/${characterId}/${characterId}.png`;
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

  // Find the best matching PNG via manifest lookup
  const imagePath = resolveAssetPath(characterId, pose, expression);

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
        left: position.x - 110 * scale,
        top: position.y - 320 * scale + walkBob + talkBob,
        width: 220 * scale,
        height: 320 * scale,
        transform: `scaleX(${flipX ? -1 : 1}) scaleY(${1 + breathe}) rotate(${idleSway}deg) scale(${entranceScale})`,
        transformOrigin: 'center bottom',
      }}
    >
      {/* AI-generated character PNG. objectPosition:bottom anchors feet to
          the bottom of the bbox so position.y is the actual ground line. */}
      <Img
        src={staticFile(imagePath)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center bottom',
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

      {/* Ground shadow — wide ellipse directly under feet */}
      <div style={{
        position: 'absolute',
        bottom: -8 * scale,
        left: '12%',
        width: '76%',
        height: 16 * scale,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0) 80%)',
        borderRadius: '50%',
        filter: 'blur(4px)',
      }} />
    </div>
  );
};
