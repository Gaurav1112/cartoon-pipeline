import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export type TransitionType = 'fade' | 'slideLeft' | 'slideRight' | 'wipe' | 'iris';

interface TransitionProps {
  type: TransitionType;
  durationFrames: number;
}

const TRANSITION_TYPES: TransitionType[] = ['fade', 'slideLeft', 'slideRight', 'wipe', 'iris'];

export function getTransitionType(sceneIndex: number): TransitionType {
  return TRANSITION_TYPES[sceneIndex % TRANSITION_TYPES.length];
}

export const TransitionEffect: React.FC<TransitionProps> = ({ type, durationFrames }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  switch (type) {
    case 'fade':
      return (
        <AbsoluteFill style={{
          background: 'black',
          opacity: progress < 0.5
            ? interpolate(progress, [0, 0.5], [0, 1])
            : interpolate(progress, [0.5, 1], [1, 0]),
        }} />
      );

    case 'slideLeft':
      return (
        <AbsoluteFill style={{
          background: '#1a1a2e',
          transform: `translateX(${interpolate(progress, [0, 0.5, 1], [1920, 0, -1920])}px)`,
        }} />
      );

    case 'slideRight':
      return (
        <AbsoluteFill style={{
          background: '#1a1a2e',
          transform: `translateX(${interpolate(progress, [0, 0.5, 1], [-1920, 0, 1920])}px)`,
        }} />
      );

    case 'wipe':
      return (
        <AbsoluteFill style={{
          background: '#FF8C00',
          clipPath: `inset(0 ${(1 - (progress < 0.5 ? progress * 2 : 2 - progress * 2)) * 100}% 0 0)`,
        }} />
      );

    case 'iris': {
      const radius = progress < 0.5
        ? interpolate(progress, [0, 0.5], [0, 120])
        : interpolate(progress, [0.5, 1], [120, 0]);
      return (
        <AbsoluteFill style={{
          background: 'black',
          clipPath: `circle(${radius}% at 50% 50%)`,
        }}>
          <AbsoluteFill style={{ background: 'transparent' }} />
        </AbsoluteFill>
      );
    }

    default:
      return null;
  }
};
