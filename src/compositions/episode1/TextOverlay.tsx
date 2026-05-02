// src/compositions/episode1/TextOverlay.tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface TextOverlayProps {
  text: string;
  startFrame: number;
  durationFrames: number;
  /** Position: 'top' for hooks, 'bottom' for commentary, 'center' for reveals */
  position?: 'top' | 'center' | 'bottom';
}

/**
 * Full-width bold text overlay for muted viewers (92% of Indian YouTube audience).
 * Appears with a quick spring pop. Disappears with fast fade.
 * No background box — text shadow for readability on any background.
 */
export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  startFrame,
  durationFrames,
  position = 'top',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relFrame = frame - startFrame;

  // FIX(minor): use >= to avoid rendering one extra frame past end
  if (relFrame < 0 || relFrame >= durationFrames) return null;

  const enterScale = spring({
    frame: relFrame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.4 },
  });

  // Guard: if durationFrames is very short the fade range must not collapse to a zero-width interval
  const fadeStart = Math.max(0, durationFrames - 12);
  const exitOpacity = interpolate(
    relFrame,
    fadeStart === durationFrames ? [0, 1] : [fadeStart, durationFrames],
    fadeStart === durationFrames ? [1, 1] : [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const POSITIONS = {
    top: '8%',
    center: '45%',
    bottom: '78%',
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 200 }}>
      <div style={{
        position: 'absolute',
        top: POSITIONS[position],
        left: '50%',
        transform: `translateX(-50%) scale(${Math.max(0, enterScale)})`,
        opacity: exitOpacity,
        textAlign: 'center',
        width: '90%',
      }}>
        <p style={{
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          fontSize: 52,
          fontWeight: 900,
          color: '#FFFFFF',
          margin: 0,
          lineHeight: 1.2,
          textShadow: [
            '0 0 8px rgba(0,0,0,0.9)',
            '3px 3px 0 #000',
            '-3px -3px 0 #000',
            '3px -3px 0 #000',
            '-3px 3px 0 #000',
          ].join(', '),
          letterSpacing: '0.02em',
        }}>
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};
