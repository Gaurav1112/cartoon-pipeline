import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';

interface RiddleSceneProps {
  question: string;
  options: [string, string, string];
  correctIndex: number;
  thinkingTimeSec: number;
}

export const RiddleScene: React.FC<RiddleSceneProps> = ({
  question,
  options,
  correctIndex,
  thinkingTimeSec,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const thinkingFrames = thinkingTimeSec * fps;

  // Phase: question → thinking → reveal
  const isThinking = frame > 30 && frame < 30 + thinkingFrames;
  const isRevealing = frame >= 30 + thinkingFrames;

  const questionScale = spring({ frame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    }}>
      {/* Question */}
      <div style={{
        position: 'absolute', top: '10%', width: '100%',
        display: 'flex', justifyContent: 'center',
        transform: `scale(${Math.max(0, questionScale)})`,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 20, padding: '30px 50px',
          maxWidth: '70%', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <span style={{ fontSize: 24, color: '#2193b0', fontWeight: 'bold' }}>🤔 RIDDLE TIME!</span>
          <p style={{
            fontFamily: "'Noto Sans', sans-serif",
            fontSize: 38, color: '#333', marginTop: 15,
          }}>
            {question}
          </p>
        </div>
      </div>

      {/* Options */}
      <div style={{
        position: 'absolute', top: '45%', width: '100%',
        display: 'flex', justifyContent: 'center', gap: 40,
      }}>
        {options.map((option, idx) => {
          const cardDelay = 45 + idx * 15;
          const cardScale = spring({ frame: frame - cardDelay, fps, config: { damping: 10 } });
          const isCorrect = idx === correctIndex;
          const revealed = isRevealing;

          return (
            <div key={idx} style={{
              width: 300, padding: '30px 20px',
              background: revealed
                ? isCorrect ? '#4CAF50' : '#EF5350'
                : 'white',
              borderRadius: 16,
              border: `3px solid ${revealed ? (isCorrect ? '#388E3C' : '#C62828') : '#ddd'}`,
              textAlign: 'center',
              transform: `scale(${Math.max(0, cardScale)}) ${revealed && isCorrect ? 'translateY(-10px)' : ''}`,
              boxShadow: revealed && isCorrect
                ? '0 12px 40px rgba(76,175,80,0.4)'
                : '0 4px 16px rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
            }}>
              <span style={{
                fontSize: 28, fontWeight: 'bold',
                color: revealed ? 'white' : '#555',
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <p style={{
                fontFamily: "'Noto Sans', sans-serif",
                fontSize: 24,
                color: revealed ? 'white' : '#333',
                marginTop: 10,
              }}>
                {option}
              </p>
              {revealed && isCorrect && (
                <span style={{ fontSize: 40, marginTop: 10, display: 'block' }}>✅</span>
              )}
              {revealed && !isCorrect && (
                <span style={{ fontSize: 40, marginTop: 10, display: 'block' }}>❌</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Timer */}
      {isThinking && (
        <div style={{
          position: 'absolute', bottom: '10%', width: '100%',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 'bold', color: '#2193b0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            {Math.ceil(thinkingTimeSec - (frame - 30) / fps)}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
