// src/compositions/episode1/SFXLayer.tsx
import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { SFXKey } from './types';

/**
 * Maps SFXKey values to existing sfx files in the SFX database.
 */
const SFX_MAP: Record<SFXKey, { file: string; volume: number }> = {
  roar:          { file: 'sfx/animals/lion_roar.mp3',      volume: 0.8 },
  rabbit_hop:    { file: 'sfx/animals/rabbit_hop.mp3',     volume: 0.4 },
  dramatic:      { file: 'sfx/drama/dramatic_sting.mp3',   volume: 0.7 },
  shock:         { file: 'sfx/drama/shock_sting.mp3',      volume: 0.6 },
  record_scratch:{ file: 'sfx/comedy/record_scratch.mp3',  volume: 0.6 },
  victory:       { file: 'sfx/drama/victory_fanfare.mp3',  volume: 0.7 },
  suspense:      { file: 'sfx/drama/suspense_build.mp3',   volume: 0.4 },
  splash:        { file: 'sfx/nature/water_splash.mp3',    volume: 0.7 },
  rimshot:       { file: 'sfx/comedy/rimshot.mp3',         volume: 0.5 },
  boing:         { file: 'sfx/comedy/boing.mp3',           volume: 0.6 },
  reveal:        { file: 'sfx/drama/reveal_sting.mp3',     volume: 0.6 },
  happy_moment:  { file: 'sfx/drama/happy_chime.mp3',      volume: 0.5 },
  giggle:        { file: 'sfx/comedy/giggle.mp3',          volume: 0.4 },
  gasp:          { file: 'sfx/drama/crowd_gasp.mp3',       volume: 0.5 },
};

interface SFXLayerProps {
  sfxKey: SFXKey;
  startFrame: number;
  /** Duration in frames. SFX plays for this many frames then stops. */
  durationFrames: number;
}

/**
 * Wraps Remotion's <Audio> in a <Sequence> to play an SFX at a precise frame.
 */
export const SFXLayer: React.FC<SFXLayerProps> = ({ sfxKey, startFrame, durationFrames }) => {
  const sfx = SFX_MAP[sfxKey];
  if (!sfx) return null;

  return (
    <Sequence from={startFrame} durationInFrames={durationFrames}>
      <Audio
        src={staticFile(sfx.file)}
        volume={sfx.volume}
      />
    </Sequence>
  );
};
