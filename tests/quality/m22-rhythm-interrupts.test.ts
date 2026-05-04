// M22 (audit-v14 pattern interrupt rhythm): modern retention requires
// micro-interrupts every 3 seconds (90 frames @ 30 FPS). Existing
// dialogue.patternInterrupt fires only on marked lines (~6-8 per
// episode). This test validates that RhythmInterrupt auto-injects
// subtle vignette pulses in every 90-frame window lacking an explicit
// interrupt, ensuring 24+ total interrupts for a 73-second video.

import { describe, it, expect } from 'vitest';
import {
  computeRhythmInterrupts,
  type RhythmInterrupt,
} from '../../src/compositions/episode1/rhythm-schedule';

describe('M22 rhythm interrupts every 3s', () => {
  const FPS = 30;
  const WINDOW_FRAMES = 90; // 3 seconds at 30 FPS

  describe('computeRhythmInterrupts', () => {
    it('computes auto-interrupts for all empty 90-frame windows', () => {
      const totalFrames = 2190; // 73 seconds
      const explicitInterrupts: number[] = []; // no explicit interrupts
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      // 73s / 3s = ~24 windows, expect 24 auto-interrupts
      expect(interrupts.length).toBeGreaterThanOrEqual(24);
      
      // Each interrupt should be auto-injected (not explicit)
      interrupts.forEach(interrupt => {
        expect(interrupt.isExplicit).toBe(false);
      });
    });

    it('skips windows that already have explicit interrupts', () => {
      const totalFrames = 450; // 5 windows (15 seconds)
      // Explicit interrupt in window 1 (frame 100)
      const explicitInterrupts: number[] = [100];
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      // Expect 5 total interrupts: 1 explicit + 4 auto
      expect(interrupts.length).toBe(5);
      
      // Frame 100 should be marked as explicit
      const explicitOne = interrupts.find(i => i.frame === 100);
      expect(explicitOne?.isExplicit).toBe(true);
      
      // Other frames should be auto-injected
      const autoOnes = interrupts.filter(i => !i.isExplicit);
      expect(autoOnes.length).toBe(4);
    });

    it('ensures at least one interrupt per 90-frame window', () => {
      const totalFrames = 2190; // 73 seconds
      const explicitInterrupts: number[] = [52, 165, 253, 343, 517]; // some explicit
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      // Check each 90-frame window has at least one interrupt
      const numWindows = Math.ceil(totalFrames / WINDOW_FRAMES);
      for (let w = 0; w < numWindows; w++) {
        const windowStart = w * WINDOW_FRAMES;
        const windowEnd = Math.min((w + 1) * WINDOW_FRAMES, totalFrames);
        
        const interruptsInWindow = interrupts.filter(
          i => i.frame >= windowStart && i.frame < windowEnd
        );
        
        expect(interruptsInWindow.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('produces deterministic results for same input', () => {
      const totalFrames = 900;
      const explicitInterrupts: number[] = [100, 300];
      
      const run1 = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      const run2 = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      expect(run1).toEqual(run2);
    });

    it('places auto-interrupts at deterministic positions (mid-window)', () => {
      const totalFrames = 270; // 3 windows
      const explicitInterrupts: number[] = [];
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      // For window w, auto-interrupt should be at w*90 + 45 (mid-window)
      expect(interrupts.some(i => i.frame === 45)).toBe(true);  // window 0
      expect(interrupts.some(i => i.frame === 135)).toBe(true); // window 1
      expect(interrupts.some(i => i.frame === 225)).toBe(true); // window 2
    });

    it('returns interrupts sorted by frame number', () => {
      const totalFrames = 900;
      const explicitInterrupts: number[] = [500, 100, 300]; // unsorted
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      for (let i = 1; i < interrupts.length; i++) {
        expect(interrupts[i].frame).toBeGreaterThan(interrupts[i - 1].frame);
      }
    });
  });

  describe('RhythmInterrupt safety constraints', () => {
    it('validates max opacity is kid-safe (≤ 0.20, M25: amplified to 0.15)', () => {
      const totalFrames = 900;
      const explicitInterrupts: number[] = [];
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      // M25: updated from 0.10 to 0.15 (audit: stop whispering, shout)
      // Still under kid-safe ceiling of 0.20
      interrupts.forEach(interrupt => {
        expect(interrupt.maxOpacity).toBeLessThanOrEqual(0.20);
      });
    });

    it('validates max duration is subtle (≤ 4 frames)', () => {
      const totalFrames = 900;
      const explicitInterrupts: number[] = [];
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      interrupts.forEach(interrupt => {
        expect(interrupt.durationFrames).toBeLessThanOrEqual(4);
      });
    });

    it('ensures no full-screen white flash (epilepsy risk)', () => {
      const totalFrames = 900;
      const explicitInterrupts: number[] = [];
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      // All auto-interrupts should use vignette effect, not flash
      interrupts.filter(i => !i.isExplicit).forEach(interrupt => {
        expect(interrupt.effectType).toBe('vignette_pulse');
      });
    });
  });

  describe('Episode 1 integration (73 seconds)', () => {
    it('guarantees ≥24 total pattern interrupts for 73-second video', () => {
      const EPISODE_FRAMES = 2190; // 73s * 30fps
      // Approximate explicit interrupts from scenes-lion-rabbit.ts
      // (grep shows ~15 patternInterrupt declarations)
      const APPROX_EXPLICIT = 15;
      const mockExplicitFrames = Array.from(
        { length: APPROX_EXPLICIT },
        (_, i) => Math.floor((i * EPISODE_FRAMES) / APPROX_EXPLICIT)
      );
      
      const interrupts = computeRhythmInterrupts(EPISODE_FRAMES, mockExplicitFrames);
      
      // 73s / 3s = ~24.3 windows → expect ≥24 interrupts
      expect(interrupts.length).toBeGreaterThanOrEqual(24);
    });
  });

  describe('Edge cases', () => {
    it('handles single window (< 90 frames)', () => {
      const totalFrames = 60;
      const explicitInterrupts: number[] = [];
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      expect(interrupts.length).toBe(1);
    });

    it('handles exact multiple of window size', () => {
      const totalFrames = 270; // exactly 3 windows
      const explicitInterrupts: number[] = [];
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      expect(interrupts.length).toBe(3);
    });

    it('handles explicit interrupt at window boundary', () => {
      const totalFrames = 270;
      const explicitInterrupts: number[] = [0, 90, 180]; // all at boundaries
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      // Should use explicit interrupts, no auto-inject
      expect(interrupts.length).toBe(3);
      expect(interrupts.every(i => i.isExplicit)).toBe(true);
    });

    it('handles multiple explicit interrupts in same window', () => {
      const totalFrames = 180;
      const explicitInterrupts: number[] = [10, 20, 30]; // all in first window
      
      const interrupts = computeRhythmInterrupts(totalFrames, explicitInterrupts);
      
      // First window has multiple explicit, second needs auto
      const window0 = interrupts.filter(i => i.frame < 90);
      const window1 = interrupts.filter(i => i.frame >= 90 && i.frame < 180);
      
      expect(window0.length).toBeGreaterThanOrEqual(1);
      expect(window1.length).toBeGreaterThanOrEqual(1);
    });
  });
});
