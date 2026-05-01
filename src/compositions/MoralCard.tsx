import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import type { MoralTemplate } from '../types';

interface MoralCardProps {
  moral: MoralTemplate;
}

const CATEGORY_ICONS: Record<string, string> = {
  wisdom: '📚', kindness: '💝', honesty: '⭐', courage: '🦁',
  patience: '🐢', teamwork: '🤝', respect: '🙏', perseverance: '💪',
  gratitude: '🌻',
};

export const MoralCard: React.FC<MoralCardProps> = ({ moral }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const textOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const iconBounce = spring({ frame: frame - 20, fps, config: { damping: 8 } });
  const icon = CATEGORY_ICONS[moral.category] ?? '✨';

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%',
        transform: `scale(${Math.max(0, cardScale)})`,
      }}>
        {/* Decorative frame */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 30,
          padding: '60px 80px',
          border: '3px solid rgba(255,255,255,0.3)',
          maxWidth: '70%',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          {/* Icon */}
          <div style={{
            fontSize: 80, marginBottom: 30,
            transform: `scale(${Math.max(0, iconBounce)})`,
          }}>
            {icon}
          </div>

          {/* "Moral of the story" header */}
          <h2 style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontSize: 36, color: '#FFD700',
            marginBottom: 20, opacity: textOpacity,
          }}>
            Moral of the Story
          </h2>

          {/* Moral text */}
          <p style={{
            fontFamily: "'Noto Serif', serif",
            fontSize: 42, color: 'white',
            lineHeight: 1.5, opacity: textOpacity,
            fontStyle: 'italic',
          }}>
            &ldquo;{moral.moralText}&rdquo;
          </p>

          {/* Category badge */}
          <div style={{
            marginTop: 30, display: 'inline-block',
            background: 'rgba(255,215,0,0.2)',
            borderRadius: 20, padding: '8px 24px',
            border: '1px solid rgba(255,215,0,0.4)',
            opacity: textOpacity,
          }}>
            <span style={{
              fontFamily: "'Noto Sans', sans-serif",
              fontSize: 20, color: '#FFD700',
              textTransform: 'uppercase', letterSpacing: 2,
            }}>
              {moral.category}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
