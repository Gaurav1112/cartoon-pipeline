// src/compositions/episode1/SFXLayer.tsx
import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { SFXKey } from './types';

/**
 * Maps SFXKey values to existing sfx files in the SFX database.
 */
const SFX_MAP: Record<SFXKey, { file: string; volume: number }> = {
  // Animals — lion roar pulled down to sit -12 dB below dialogue level
  roar:          { file: 'sfx/animals/lion_roar.mp3',        volume: 0.35 },
  rabbit_hop:    { file: 'sfx/animals/rabbit_hop.mp3',       volume: 0.3  },
  // Drama stings — punchy but not overpowering
  dramatic:      { file: 'sfx/drama/dramatic_sting.mp3',     volume: 0.4  },
  shock:         { file: 'sfx/drama/shock_sting.mp3',        volume: 0.35 },
  victory:       { file: 'sfx/drama/victory_fanfare.mp3',    volume: 0.4  },
  suspense:      { file: 'sfx/drama/suspense_build.mp3',     volume: 0.25 },
  reveal:        { file: 'sfx/drama/reveal_sting.mp3',       volume: 0.35 },
  happy_moment:  { file: 'sfx/drama/happy_chime.mp3',        volume: 0.3  },
  mystery:       { file: 'sfx/drama/mystery_tone.mp3',       volume: 0.25 },
  heartbeat:     { file: 'sfx/drama/heartbeat.mp3',          volume: 0.25 },
  applause:      { file: 'sfx/drama/applause.mp3',           volume: 0.3  },
  gasp:          { file: 'sfx/drama/crowd_gasp.mp3',         volume: 0.3  },
  // Comedy — kept slightly hotter since they're one-shot punches
  record_scratch:{ file: 'sfx/comedy/record_scratch.mp3',    volume: 0.4  },
  splash:        { file: 'sfx/nature/water_splash.mp3',      volume: 0.30 },
  rimshot:       { file: 'sfx/comedy/rimshot.mp3',           volume: 0.35 },
  boing:         { file: 'sfx/comedy/boing.mp3',             volume: 0.4  },
  cartoon_run:   { file: 'sfx/comedy/cartoon_run.mp3',       volume: 0.35 },
  giggle:        { file: 'sfx/comedy/giggle.mp3',            volume: 0.3  },
  // Nature ambients — low and underscore-level
  pond:          { file: 'sfx/nature/pond_splash.mp3',       volume: 0.18 },
  birds:         { file: 'sfx/nature/birds_chirp.mp3',       volume: 0.18 },
  breeze:        { file: 'sfx/nature/gentle_breeze.mp3',     volume: 0.15 },
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
