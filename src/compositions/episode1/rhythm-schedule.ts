// M22 (audit-v14 rhythm interrupts): Pure function computing auto-injected
// micro-interrupts to ensure at least one pattern interrupt per 90-frame
// window (3 seconds @ 30 FPS). Gaps in explicit dialogue interrupts are
// filled with deterministic vignette pulses to maintain engagement rhythm.

export interface RhythmInterrupt {
  frame: number;
  isExplicit: boolean;
  effectType: 'vignette_pulse' | 'explicit';
  maxOpacity: number;
  durationFrames: number;
}

const WINDOW_FRAMES = 90; // 3 seconds at 30 FPS
const AUTO_INTERRUPT_FRAME_OFFSET = 45; // mid-window (deterministic)
const AUTO_INTERRUPT_DURATION = 3; // 3 frames (100ms @ 30fps)
const AUTO_INTERRUPT_MAX_OPACITY = 0.15; // M25: 0.06→0.15 (audit: stop whispering, shout)

/**
 * Computes the full schedule of pattern interrupts (explicit + auto-injected)
 * ensuring every 90-frame window has at least one interrupt.
 * 
 * @param totalFrames - Total video duration in frames
 * @param explicitInterrupts - Frame numbers where dialogue.patternInterrupt exists
 * @returns Sorted array of all interrupts (explicit + auto)
 */
export function computeRhythmInterrupts(
  totalFrames: number,
  explicitInterrupts: number[],
): RhythmInterrupt[] {
  const interrupts: RhythmInterrupt[] = [];
  const numWindows = Math.ceil(totalFrames / WINDOW_FRAMES);
  
  // Mark explicit interrupts
  const explicitSet = new Set(explicitInterrupts);
  for (const frame of explicitInterrupts) {
    interrupts.push({
      frame,
      isExplicit: true,
      effectType: 'explicit',
      maxOpacity: 1.0, // explicit interrupts use their own logic
      durationFrames: 6, // typical explicit duration
    });
  }
  
  // For each window, ensure at least one interrupt
  for (let w = 0; w < numWindows; w++) {
    const windowStart = w * WINDOW_FRAMES;
    const windowEnd = Math.min((w + 1) * WINDOW_FRAMES, totalFrames);
    
    // Check if this window has any explicit interrupt
    const hasExplicit = explicitInterrupts.some(
      f => f >= windowStart && f < windowEnd
    );
    
    // If no explicit, inject auto-interrupt at mid-window
    if (!hasExplicit) {
      let autoFrame = windowStart + AUTO_INTERRUPT_FRAME_OFFSET;
      
      // For partial windows (last window), clamp to stay within bounds
      if (autoFrame >= totalFrames) {
        // Place at window start + half the actual window size
        const actualWindowSize = windowEnd - windowStart;
        autoFrame = windowStart + Math.floor(actualWindowSize / 2);
      }
      
      // Only inject if we have at least 1 frame in the window
      if (autoFrame < totalFrames && windowEnd > windowStart) {
        interrupts.push({
          frame: autoFrame,
          isExplicit: false,
          effectType: 'vignette_pulse',
          maxOpacity: AUTO_INTERRUPT_MAX_OPACITY,
          durationFrames: AUTO_INTERRUPT_DURATION,
        });
      }
    }
  }
  
  // Sort by frame number for deterministic ordering
  return interrupts.sort((a, b) => a.frame - b.frame);
}
