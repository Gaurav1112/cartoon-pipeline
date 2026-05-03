import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import type { SupportedLanguage } from '../types';

// M5.5 — Pin Indic font weights to 700 with explicit @remotion/google-fonts
// loaders. Without this, Remotion's headless Chromium falls back to a Latin
// font that mis-renders Devanagari / Tamil / Telugu / Kannada / Bengali
// conjuncts, causing broken half-forms and visible tofu glyphs in the title
// card. We load each Indic family at module import time so the font is
// guaranteed available by the first render frame.
import { loadFont as loadDevanagari } from '@remotion/google-fonts/NotoSansDevanagari';
import { loadFont as loadTamil }      from '@remotion/google-fonts/NotoSansTamil';
import { loadFont as loadTelugu }     from '@remotion/google-fonts/NotoSansTelugu';
import { loadFont as loadKannada }    from '@remotion/google-fonts/NotoSansKannada';
import { loadFont as loadBengali }    from '@remotion/google-fonts/NotoSansBengali';
import { loadFont as loadNotoSans }   from '@remotion/google-fonts/NotoSans';

// Eagerly request the 700 weight for every script. loadFont is a no-op
// when called twice with the same args, so this is safe at module scope.
loadDevanagari('normal', { weights: ['700'], subsets: ['devanagari', 'latin'] });
loadTamil    ('normal', { weights: ['700'], subsets: ['tamil',      'latin'] });
loadTelugu   ('normal', { weights: ['700'], subsets: ['telugu',     'latin'] });
loadKannada  ('normal', { weights: ['700'], subsets: ['kannada',    'latin'] });
loadBengali  ('normal', { weights: ['700'], subsets: ['bengali',    'latin'] });
loadNotoSans ('normal', { weights: ['700'], subsets: ['latin'] });

/** All six Indic scripts shipped on this channel. */
export const TITLE_INDIC_LANGS: readonly SupportedLanguage[] =
  ['hi', 'mr', 'ta', 'te', 'kn', 'bn'] as const;

/**
 * Per-language title-card font pin. Weight 700 (bold) for legibility
 * over the orange/gold hook gradient at low YouTube bitrates. Family
 * stack always falls back to a Latin face so digits / punctuation
 * still render if a glyph is missing in the script font.
 */
export const TITLE_FONT_BY_LANG: Record<
  SupportedLanguage,
  { fontFamily: string; fontWeight: number }
> = {
  hi: { fontFamily: "'Noto Sans Devanagari', 'Baloo 2', sans-serif", fontWeight: 700 },
  mr: { fontFamily: "'Noto Sans Devanagari', 'Baloo 2', sans-serif", fontWeight: 700 },
  ta: { fontFamily: "'Noto Sans Tamil', 'Baloo 2', sans-serif",      fontWeight: 700 },
  te: { fontFamily: "'Noto Sans Telugu', 'Baloo 2', sans-serif",     fontWeight: 700 },
  kn: { fontFamily: "'Noto Sans Kannada', 'Baloo 2', sans-serif",    fontWeight: 700 },
  bn: { fontFamily: "'Noto Sans Bengali', 'Baloo 2', sans-serif",    fontWeight: 700 },
  en: { fontFamily: "'Noto Sans', 'Baloo 2', sans-serif",            fontWeight: 700 },
};

/** Universal subtitle on the title card — English transliteration so the
 *  intro reads correctly even when visual track is rendered in Hindi but
 *  muxed with EN/TA/TE/KN/MR/BN audio. Bheem-style: bilingual brand. */
const SHOW_NAME_ROMAN = 'Katha Keeda';

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
      {/* Bheem-style sun-ray burst — radial stripes rotating slowly behind
          the title. Pure SVG, deterministic, no randomness. */}
      <AbsoluteFill style={{ zIndex: 1, opacity: titleOpacity * 0.45 }}>
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="rayFade" cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor="rgba(255,255,200,0.0)" />
              <stop offset="60%"  stopColor="rgba(255,255,200,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,200,0.0)" />
            </radialGradient>
          </defs>
          <g transform={`translate(960 540) rotate(${frame * 0.4})`}>
            {Array.from({ length: 16 }).map((_, i) => (
              <polygon
                key={i}
                points="0,-1100 30,0 -30,0"
                fill="url(#rayFade)"
                transform={`rotate(${(360 / 16) * i})`}
              />
            ))}
          </g>
        </svg>
      </AbsoluteFill>

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
        {/* Title (native script) */}
        <h1
          style={{
            fontFamily: TITLE_FONT_BY_LANG[language].fontFamily,
            fontWeight: TITLE_FONT_BY_LANG[language].fontWeight,
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

        {/* Romanized brand mark — works in every muxed language so even when
            the visual is rendered as Hindi, EN/TA/TE viewers still see the
            channel name they recognise. Chhota-Bheem-style bilingual logo. */}
        {language !== 'en' && (
          <p
            style={{
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 700,
              fontSize: 48,
              color: 'white',
              textShadow: '3px 3px 0 rgba(0,0,0,0.35)',
              margin: '8px 0 0 0',
              letterSpacing: 2,
              opacity: titleOpacity,
            }}
          >
            {SHOW_NAME_ROMAN}
          </p>
        )}

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
