// src/compositions/effects/MotionSmear.tsx
// Tartakovsky impact-frame smear: 2-frame elongated trail behind a fast
// motion (zoom punch / character lunge). Pure SVG/CSS, deterministic,
// no Math.random. Rendered as a screen-blend overlay during the
// patternInterrupt window so it reads as a "lightning flash" of motion.

import React from 'react';
import { useCurrentFrame } from 'remotion';

interface MotionSmearProps {
  /** Frame at which the smear begins (full duration = 2 frames). */
  startFrame: number;
  /** Direction in degrees (0 = right, 90 = down). */
  angleDeg: number;
  /** Length in pixels at peak. */
  lengthPx?: number;
  /** Color (defaults to white screen-blend flash). */
  color?: string;
  /** Origin point in viewport coords (0..1). */
  origin?: { x: number; y: number };
}

export const MotionSmear: React.FC<MotionSmearProps> = ({
  startFrame,
  angleDeg,
  lengthPx = 280,
  color = 'rgba(255,255,255,0.55)',
  origin = { x: 0.5, y: 0.5 },
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  // 2-frame window: rise frame 0, peak frame 1, gone frame 2+.
  if (local < 0 || local > 1) return null;
  const opacity = local === 0 ? 0.85 : 1.0;
  const length = lengthPx * (local === 0 ? 0.7 : 1.0);
  const angleRad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(angleRad) * length;
  const dy = Math.sin(angleRad) * length;
  const ox = origin.x * 1920;
  const oy = origin.y * 1080;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="smear-grad"
            x1={ox}
            y1={oy}
            x2={ox + dx}
            y2={oy + dy}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect
          x={ox - 60}
          y={oy - 30}
          width={length + 120}
          height="60"
          fill="url(#smear-grad)"
          transform={`rotate(${angleDeg}, ${ox}, ${oy})`}
        />
      </svg>
    </div>
  );
};
