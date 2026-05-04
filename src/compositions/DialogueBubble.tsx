import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import type { CharacterId } from '../types';
import { TextOverlay } from './episode1/TextOverlay';

interface DialogueBubbleProps {
  text: string;
  characterId: CharacterId;
  position: 'left' | 'center' | 'right';
  startFrame: number;
  durationFrames: number;
  /** Optional bold on-screen text shown simultaneously. For muted viewers. */
  textOverlay?: string;
}

const BUBBLE_COLORS: Record<CharacterId, { bg: string; border: string; text: string }> = {
  arjun: { bg: '#FFF8E7', border: '#FF8C00', text: '#333' },
  meera: { bg: '#E8F4FF', border: '#4169E1', text: '#333' },
  bablu: { bg: '#F0FFF0', border: '#32CD32', text: '#333' },
  guruji: { bg: '#FFF5EE', border: '#DAA520', text: '#333' },
  kaaliya: { bg: '#2F0040', border: '#8B008B', text: '#FFF' },
  amma: { bg: '#FFF0F5', border: '#FF69B4', text: '#333' },
  raja: { bg: '#FFFFF0', border: '#FFD700', text: '#333' },
  moti: { bg: '#FFF5E6', border: '#A0522D', text: '#333' },
};

const POSITIONS = {
  left: { x: '15%', tailDir: 'left' as const },
  center: { x: '35%', tailDir: 'center' as const },
  right: { x: '55%', tailDir: 'right' as const },
};

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({
  text,
  characterId,
  position,
  startFrame,
  durationFrames,
  textOverlay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  // FIX(minor): use >= to avoid rendering one extra frame past end
  if (relativeFrame < 0 || relativeFrame >= durationFrames) return null;
  // Don't render an empty container during the typewriter pre-roll —
  // otherwise a stray bubble shell flashes for 1-2 frames.
  if (text.length === 0) return null;

  const colors = BUBBLE_COLORS[characterId];
  const pos = POSITIONS[position];

  // Appear/disappear — gentle for kids, not snappy
  const appearScale = spring({ frame: relativeFrame, fps, config: { damping: 15, stiffness: 80 } });
  // Guard: if durationFrames < 20 the fade range collapses — keep it valid
  const fadeBubbleStart = Math.max(0, durationFrames - 20);
  const disappearOpacity = interpolate(
    relativeFrame,
    fadeBubbleStart === durationFrames ? [0, 1] : [fadeBubbleStart, durationFrames],
    fadeBubbleStart === durationFrames ? [1, 1] : [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Kid-friendly typewriter: ~8 chars/second (not 15)
  // Kids read slower, and many are pre-readers watching with parents
  // Guard against empty text or zero-length range (would cause interpolate to throw)
  const typewriterDuration = Math.max(1, Math.min(durationFrames * 0.5, text.length * 4)); // 4 frames per char = ~8 chars/sec
  // Typewriter kicks off at relativeFrame=2 (was 10) so the bubble never
  // renders empty long enough to read as a stray UI artifact in the corner.
  const charsToShow = Math.floor(
    interpolate(relativeFrame, [2, 2 + typewriterDuration], [0, text.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  // Wait for the first character before painting the shell.
  if (charsToShow === 0) return null;
  const displayText = text.slice(0, charsToShow);

  return (
    <div style={{
      position: 'absolute',
      left: pos.x,
      top: '8%',
      maxWidth: '35%',
      transform: `scale(${Math.max(0, appearScale)})`,
      opacity: disappearOpacity,
      transformOrigin: 'bottom center',
      zIndex: 100,
    }}>
      {/* Bubble */}
      <div style={{
        background: colors.bg,
        border: `3px solid ${colors.border}`,
        borderRadius: 20,
        padding: '16px 24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        position: 'relative',
      }}>
        <p style={{
          fontFamily: "'Noto Sans', sans-serif",
          fontSize: 28,
          color: colors.text,
          margin: 0,
          lineHeight: 1.4,
        }}>
          {displayText}
          {charsToShow < text.length && (
            <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>|</span>
          )}
        </p>

        {/* Tail */}
        <svg
          width="30" height="20"
          viewBox="0 0 30 20"
          style={{
            position: 'absolute',
            bottom: -18,
            left: pos.tailDir === 'left' ? '20%' : pos.tailDir === 'right' ? '70%' : '45%',
          }}
        >
          <polygon points="0,0 30,0 15,20" fill={colors.bg} stroke={colors.border} strokeWidth="3" />
          <line x1="2" y1="0" x2="28" y2="0" stroke={colors.bg} strokeWidth="5" />
        </svg>
      </div>
      {textOverlay && (
        <TextOverlay
          text={textOverlay}
          startFrame={startFrame}
          durationFrames={durationFrames}
          position="bottom"
        />
      )}
    </div>
  );
};
