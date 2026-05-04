// tests/quality/m24-scene-chopper.test.ts
/**
 * M24: Scene Chopper — boost cut frequency from 16 to 26+ cuts in 76s episode.
 *
 * CONTEXT: v15 audit feedback: "average shot length 4.8s, needs 2.5-3.0s
 * like Bheem/Peppa". Auto-split long scenes (>75 frames = 2.5s) into
 * alternating-camera sub-shots WITHOUT changing dialogue or story.
 *
 * REQUIREMENTS:
 * - chopScene() is a pure function: (sceneId, durFrames, baseCam) => SubShot[]
 * - For scenes ≤75 frames: return 1 sub-shot (no chop)
 * - For scenes >75 frames: return N=ceil(durFrames/75) sub-shots
 * - Each sub-shot alternates camera: wide → close_up → wide OR close_up → wide → close_up
 * - Sub-shots are deterministic (snapshot-tested)
 * - Scenes with shortsCutScene=true are NOT chopped (already short)
 * - Total episode cut count increases from 16 to ≥26
 */

import { chopScene, type SubShot } from '../../src/compositions/episode1/scene-chopper';

describe('M24: Scene Chopper', () => {
  describe('chopScene() pure function', () => {
    test('short scene (≤75 frames) returns 1 sub-shot unchanged', () => {
      const result = chopScene('hook-terror', 30, 'close_up', 1.0);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        startFrame: 0,
        endFrame: 30,
        cam: 'close_up',
        camI: 1.0,
      });
    });

    test('short scene at threshold (75 frames) returns 1 sub-shot', () => {
      const result = chopScene('threshold-scene', 75, 'wide', 0.5);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        startFrame: 0,
        endFrame: 75,
        cam: 'wide',
        camI: 0.5,
      });
    });

    test('scene >75 frames gets chopped into multiple sub-shots', () => {
      // 150 frames = 2 chunks of 75 each
      const result = chopScene('intro', 150, 'wide', 0.5);
      expect(result.length).toBeGreaterThanOrEqual(2);
      
      // Check continuity: end of chunk[i] = start of chunk[i+1]
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].endFrame).toBe(result[i + 1].startFrame);
      }
      
      // Last chunk ends at scene duration
      expect(result[result.length - 1].endFrame).toBe(150);
    });

    test('long scene (300 frames = 10s) returns ≥4 sub-shots', () => {
      // 300 frames = ceil(300/75) = 4 chunks
      const result = chopScene('intro', 300, 'wide', 0.5);
      expect(result.length).toBeGreaterThanOrEqual(4);
      expect(result[0].startFrame).toBe(0);
      expect(result[result.length - 1].endFrame).toBe(300);
    });

    test('sub-shots alternate camera types', () => {
      const result = chopScene('volunteer', 225, 'zoom_in', 0.6);
      expect(result.length).toBeGreaterThanOrEqual(3);
      
      // Camera should alternate between variants
      const cams = result.map(s => s.cam);
      // Should not all be the same
      const uniqueCams = new Set(cams);
      expect(uniqueCams.size).toBeGreaterThan(1);
      
      // Should use only valid camera types
      for (const shot of result) {
        expect(['static', 'pan_left', 'pan_right', 'zoom_in', 'zoom_out', 
                'drift', 'shake', 'close_up', 'wide']).toContain(shot.cam);
      }
    });

    test('sub-shots have varying camI intensity', () => {
      const result = chopScene('volunteer', 225, 'zoom_in', 0.6);
      expect(result.length).toBeGreaterThanOrEqual(3);
      
      // At least some variation in intensity across sub-shots
      const intensities = result.map(s => s.camI);
      const uniqueIntensities = new Set(intensities);
      expect(uniqueIntensities.size).toBeGreaterThan(1);
      
      // All intensities should be in valid range [0, 1]
      for (const shot of result) {
        expect(shot.camI).toBeGreaterThanOrEqual(0);
        expect(shot.camI).toBeLessThanOrEqual(1);
      }
    });

    test('determinism: same inputs produce same sub-shots', () => {
      const result1 = chopScene('setup', 200, 'pan_right', 0.75);
      const result2 = chopScene('setup', 200, 'pan_right', 0.75);
      expect(result1).toEqual(result2);
    });

    test('determinism: different sceneId produces different schedule', () => {
      const result1 = chopScene('setup', 200, 'pan_right', 0.75);
      const result2 = chopScene('volunteer', 200, 'pan_right', 0.75);
      
      // Same duration, but different scenes should have different schedules
      expect(result1).not.toEqual(result2);
    });
  });

  describe('Episode-level cut count validation', () => {
    test('episode should have ≥26 visual cuts across all scenes', async () => {
      // Import scenes and simulate chopping
      const { LION_RABBIT_SCENES } = await import('../../src/compositions/episode1/scenes-lion-rabbit');
      const FPS = 30;
      
      let totalCutCount = 0;
      
      for (const scene of LION_RABBIT_SCENES) {
        // Skip scenes marked for shorts (already short, no chop)
        if (scene.shortsCutScene) {
          totalCutCount += 1; // Count the scene itself as 1 cut
          continue;
        }
        
        // Calculate scene duration
        let durFrames = 0;
        if (typeof scene.dur === 'number') {
          durFrames = scene.dur * FPS;
        } else {
          // Auto: estimate from dialogue
          for (const line of scene.dialogue) {
            if (typeof line.dur === 'number') {
              durFrames += line.dur;
            } else {
              // Rough estimate: 50 frames per auto line
              durFrames += 50;
            }
          }
        }
        
        const subShots = chopScene(scene.id, durFrames, scene.cam, scene.camI);
        totalCutCount += subShots.length;
      }
      
      expect(totalCutCount).toBeGreaterThanOrEqual(26);
    });
  });

  describe('Snapshot tests for deterministic scheduling', () => {
    test('snapshot: intro scene (long) sub-shot schedule', () => {
      const result = chopScene('intro', 300, 'wide', 0.5);
      expect(result).toMatchSnapshot();
    });

    test('snapshot: volunteer scene sub-shot schedule', () => {
      const result = chopScene('volunteer', 250, 'zoom_in', 0.6);
      expect(result).toMatchSnapshot();
    });

    test('snapshot: setup scene sub-shot schedule', () => {
      const result = chopScene('setup', 180, 'static', 0.4);
      expect(result).toMatchSnapshot();
    });
  });
});
