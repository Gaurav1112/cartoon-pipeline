// M22 (audit-v14 rhythm interrupts): Overlay component that auto-injects
// micro-pattern-interrupts (vignette pulses) every 3 seconds to fill gaps
// between explicit dialogue.patternInterrupt events. Ensures modern
// retention rhythm (24+ interrupts per 73s video) without being jarring.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { computeRhythmInterrupts, type RhythmInterrupt } from './rhythm-schedule';

interface RhythmInterruptProps {
  /** Total video duration in frames */
  totalFrames: number;
  /** Frame numbers where explicit dialogue.patternInterrupt exists */
  explicitInterruptFrames: number[];
}

export const RhythmInterruptOverlay: React.FC<RhythmInterruptProps> = ({
  totalFrames,
  explicitInterruptFrames,
}) => {
  const frame = useCurrentFrame();
  
  // Compute the full interrupt schedule (memoized in production via React)
  const schedule = React.useMemo(
    () => computeRhythmInterrupts(totalFrames, explicitInterruptFrames),
    [totalFrames, explicitInterruptFrames]
  );
  
  // Find active auto-interrupts at current frame
  const activeAutoInterrupts = schedule.filter(
    interrupt =>
      !interrupt.isExplicit &&
      frame >= interrupt.frame &&
      frame < interrupt.frame + interrupt.durationFrames
  );
  
  // No active auto-interrupt, render nothing
  if (activeAutoInterrupts.length === 0) {
    return null;
  }
  
  // Render vignette pulse for each active auto-interrupt
  return (
    <>
      {activeAutoInterrupts.map((interrupt) => {
        const localFrame = frame - interrupt.frame;
        
        // Pulse opacity: 0 → maxOpacity → 0 over durationFrames
        // Triangle wave for symmetric pulse
        const progress = localFrame / interrupt.durationFrames;
        const opacity = interpolate(
          progress,
          [0, 0.5, 1],
          [0, interrupt.maxOpacity, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        return (
          <AbsoluteFill
            key={`rhythm-${interrupt.frame}`}
            style={{
              // Vignette effect: radial gradient from transparent center to dark edges
              background: `radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, ${opacity}) 100%)`,
              pointerEvents: 'none',
              zIndex: 450, // Above scene content, below subtitles
            }}
          />
        );
      })}
    </>
  );
};
