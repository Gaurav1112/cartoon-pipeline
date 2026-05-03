import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import type { SupportedLanguage } from '../types';

const NEXT_EPISODE_TEASERS: Record<SupportedLanguage, string[]> = {
  hi: [
    'अगली कहानी जल्दी आ रही है!',
    'कल — कौवा और चालाक लोमड़ी 🦊',
    'मत भूलो: कल "बंदर और मगरमच्छ"!',
  ],
  te: ['తదుపరి కథ త్వరలో వస్తోంది!', 'రేపు — కాకి మరియు తెలివైన నక్క 🦊', 'రేపు: కోతి మరియు మొసలి!'],
  ta: ['அடுத்த கதை விரைவில் வருகிறது!', 'நாளை — காகமும் தந்திர நரியும் 🦊', 'நாளை: குரங்கும் முதலையும்!'],
  kn: ['ಮುಂದಿನ ಕಥೆ ಶೀಘ್ರದಲ್ಲೇ!', 'ನಾಳೆ — ಕಾಗೆ ಮತ್ತು ನರಿ 🦊', 'ನಾಳೆ: ಕಪಿ ಮತ್ತು ಮೊಸಳೆ!'],
  mr: ['पुढची गोष्ट लवकरच!', 'उद्या — कावळा आणि चतुर कोल्हा 🦊', 'उद्या: माकड आणि मगर!'],
  bn: ['পরের গল্প শীঘ্রই!', 'কাল — কাক ও চতুর শিয়াল 🦊', 'কাল: বানর ও কুমির!'],
  en: ['Next story coming soon!', 'Tomorrow — Crow & the Cunning Fox 🦊', 'Tomorrow: Monkey & Crocodile!'],
};

/** Deterministic teaser pick — same input always yields same teaser. */
export function pickTeaser(language: SupportedLanguage, episodeNumber: number): string {
  const list = NEXT_EPISODE_TEASERS[language] ?? NEXT_EPISODE_TEASERS.en;
  return list[episodeNumber % list.length];
}

interface OutroSequenceProps {
  language?: SupportedLanguage;
  episodeNumber?: number;
}

export const OutroSequence: React.FC<OutroSequenceProps> = ({ language = 'en', episodeNumber = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const buttonScale = spring({ frame: frame - 30, fps, config: { damping: 10 } });
  const bellRotate = interpolate(frame, [60, 90, 120, 150], [0, 15, -15, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Stars */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = ((i * 97) % 1920);
        const y = ((i * 53) % 500);
        const twinkle = interpolate(frame, [i * 5, i * 5 + 15, i * 5 + 30], [0.3, 1, 0.3], {
          extrapolateLeft: 'clamp', extrapolateRight: 'extend',
        });
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y,
            width: 4, height: 4, borderRadius: '50%',
            background: '#FFD700', opacity: twinkle,
          }} />
        );
      })}

      {/* Subscribe button */}
      <div style={{
        position: 'absolute', top: '35%', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          background: '#FF0000', borderRadius: 12,
          padding: '20px 60px',
          transform: `scale(${Math.max(0, buttonScale)})`,
          boxShadow: '0 6px 20px rgba(255,0,0,0.4)',
        }}>
          <span style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontSize: 48, color: 'white', fontWeight: 'bold',
          }}>
            SUBSCRIBE
          </span>
        </div>

        {/* Bell icon */}
        <div style={{
          marginTop: 30, fontSize: 64,
          transform: `rotate(${bellRotate}deg)`,
        }}>
          🔔
        </div>

        {/* Next episode text */}
        <p style={{
          fontFamily: "'Noto Sans', sans-serif",
          fontSize: 28, color: 'rgba(255,255,255,0.8)',
          marginTop: 40,
          opacity: interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          {pickTeaser(language, episodeNumber)}
        </p>
      </div>

      {/* Logo */}
      <div style={{
        position: 'absolute', bottom: 60, width: '100%',
        display: 'flex', justifyContent: 'center',
        opacity: 0.6,
      }}>
        <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 32, color: '#FFD700' }}>
          Katha Keeda
        </span>
      </div>
    </AbsoluteFill>
  );
};
