import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import type { SupportedLanguage } from '../types';

const SHOW_NAME: Record<SupportedLanguage, string> = {
  hi: 'कथा कीड़ा',
  te: 'కథా కీడా',
  ta: 'கதை பூச்சி',
  kn: 'ಕಥಾ ಕೀಡಾ',
  mr: 'कथा किडा',
  bn: 'কথা কীড়া',
  en: 'Katha Keeda',
};

interface IntroSequenceProps {
  language?: SupportedLanguage;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ language = 'en' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 5-second intro: gentle bounce-in for kids
  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 120, mass: 0.6 } });
  const titleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Soft glow instead of harsh white flash (photosensitivity safe for kids)
  const bgFlash = interpolate(frame, [0, 20, 50], [0.4, 0.2, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 50%, #FF4500 100%)',
      }}
    >
      {/* Soft golden glow on entry — safe for kids (no harsh white flash) */}
      <AbsoluteFill
        style={{
          backgroundColor: '#FFD700',
          opacity: bgFlash,
          zIndex: 10,
        }}
      />

      {/* Logo + Title — centered, fast slam */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${Math.max(0, logoScale)})`,
          zIndex: 5,
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 120,
            color: 'white',
            textShadow: '6px 6px 0px rgba(0,0,0,0.4), 0 0 60px rgba(255,200,0,0.5)',
            margin: 0,
            letterSpacing: -2,
            opacity: titleOpacity,
          }}
        >
          {SHOW_NAME[language]}
        </h1>

        {/* Decorative underline */}
        <div
          style={{
            width: interpolate(frame, [20, 50], [0, 400], { extrapolateRight: 'clamp' }),
            height: 4,
            background: 'white',
            borderRadius: 2,
            marginTop: 10,
            opacity: titleOpacity,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
