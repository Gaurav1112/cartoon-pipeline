import type { EmotionType, ExpressionData } from '../types';

export const EXPRESSIONS: Record<EmotionType, ExpressionData> = {
  neutral: {
    eyeShape: 'normal',
    eyebrowAngle: 0,
    mouthDefault: 'B',
    pupilSize: 0.5,
  },
  happy: {
    eyeShape: 'narrow', // squinted from smiling
    eyebrowAngle: 5,
    mouthDefault: 'D', // wide smile
    pupilSize: 0.5,
  },
  sad: {
    eyeShape: 'narrow',
    eyebrowAngle: -15, // slanting up in center
    mouthDefault: 'E', // small frown
    pupilSize: 0.6,
  },
  angry: {
    eyeShape: 'squint',
    eyebrowAngle: -20, // sharp V shape
    mouthDefault: 'F', // teeth gritting
    pupilSize: 0.3,
  },
  scared: {
    eyeShape: 'wide',
    eyebrowAngle: 15, // raised high
    mouthDefault: 'A', // open wide
    pupilSize: 0.2, // tiny pupils
  },
  surprised: {
    eyeShape: 'wide',
    eyebrowAngle: 20, // very raised
    mouthDefault: 'G', // O shape
    pupilSize: 0.7,
  },
  thinking: {
    eyeShape: 'normal',
    eyebrowAngle: -5, // slight furrow
    mouthDefault: 'H', // tight
    pupilSize: 0.4,
  },
  determined: {
    eyeShape: 'squint',
    eyebrowAngle: -10,
    mouthDefault: 'H', // tight/firm
    pupilSize: 0.4,
  },
};

export function getExpression(emotion: EmotionType): ExpressionData {
  return EXPRESSIONS[emotion];
}
