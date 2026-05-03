import { describe, it, expect } from 'vitest';
import { activeLineAtFrame, EMOTION_BLEND_FRAMES } from '../../src/compositions/episode1/timing';
import type { ViralScene } from '../../src/compositions/episode1/types';

// Pete Docter gap (M3.1): a scene with multi-line dialogue must show an
// internal emotional arc — the speaker's emotion at the start, middle,
// and end of the scene must reflect each line's `emotion`, not just
// the first line frozen for the whole scene.
//
// Contract:
//   - `activeLineAtFrame(scene, frame, totalSceneFrames)` is a pure helper
//     returning { lineIndex, blendT }.
//   - lineIndex points to the dialogue line that owns the current frame.
//   - blendT ∈ [0, 1]: 1 = fully on the active line; <1 = inside the
//     EMOTION_BLEND_FRAMES cross-fade window at the start of a line.
//   - At the start of line 0, blendT = 1 (no previous line to blend from).
//   - At a non-zero line boundary, blendT ramps from 0 → 1 across the
//     EMOTION_BLEND_FRAMES window so SceneRenderer can lerp pose
//     modifiers (the wiring that finally consumes poseModifierByEmotion).

const baseScene = (dialogue: ViralScene['dialogue']): ViralScene => ({
  id: 'arc-test',
  bg: 'forest',
  time: 'day',
  dur: 'auto',
  chars: [{ id: 'bablu', pos: 'center', pose: 'idle_stand', expr: 'scared' }],
  cam: 'static',
  camI: 0.2,
  dialogue,
});

describe('Docter emotion micro-arc (M3.1) — activeLineAtFrame helper', () => {
  // Equal-length lines (60 frames each) makes math trivial in the test.
  const scene = baseScene([
    { char: 'bablu', text: 'aaaaaa', dur: 60, emotion: 'scared' },
    { char: 'bablu', text: 'bbbbbb', dur: 60, emotion: 'thinking' },
    { char: 'bablu', text: 'cccccc', dur: 60, emotion: 'determined' },
  ]);
  const total = 180;

  it('frame 0 → line 0 ("scared")', () => {
    const r = activeLineAtFrame(scene, 0, total);
    expect(r.lineIndex).toBe(0);
    expect(scene.dialogue[r.lineIndex].emotion).toBe('scared');
  });

  it('mid scene → line 1 ("thinking")', () => {
    // Pick a frame well inside line 1 (past the blend window).
    const r = activeLineAtFrame(scene, 90, total);
    expect(r.lineIndex).toBe(1);
    expect(scene.dialogue[r.lineIndex].emotion).toBe('thinking');
  });

  it('late scene → line 2 ("determined")', () => {
    const r = activeLineAtFrame(scene, 170, total);
    expect(r.lineIndex).toBe(2);
    expect(scene.dialogue[r.lineIndex].emotion).toBe('determined');
  });

  it('blendT = 1 in the middle of a line (no cross-fade)', () => {
    const r = activeLineAtFrame(scene, 30, total);
    expect(r.blendT).toBe(1);
  });

  it('blendT = 1 at frame 0 (no previous line to blend from)', () => {
    const r = activeLineAtFrame(scene, 0, total);
    expect(r.lineIndex).toBe(0);
    expect(r.blendT).toBe(1);
  });

  it('blendT is non-binary (0 < t < 1) inside a non-zero line boundary window', () => {
    // Boundary into line 1 begins at frame 60. EMOTION_BLEND_FRAMES = 6
    // (≈200 ms at 30fps). Frame 62 is mid-blend → 0 < blendT < 1.
    const r = activeLineAtFrame(scene, 62, total);
    expect(r.lineIndex).toBe(1);
    expect(r.blendT).toBeGreaterThan(0);
    expect(r.blendT).toBeLessThan(1);
  });

  it('blendT reaches 1 once past the blend window', () => {
    // EMOTION_BLEND_FRAMES is exported so the test stays in sync with impl.
    const r = activeLineAtFrame(scene, 60 + EMOTION_BLEND_FRAMES, total);
    expect(r.lineIndex).toBe(1);
    expect(r.blendT).toBe(1);
  });

  it('falls back to even split when dialogue durs are missing/zero', () => {
    const evenScene = baseScene([
      { char: 'bablu', text: '', dur: 0, emotion: 'scared' },
      { char: 'bablu', text: '', dur: 0, emotion: 'thinking' },
      { char: 'bablu', text: '', dur: 0, emotion: 'determined' },
    ]);
    // Even split: 0..60 line 0, 60..120 line 1, 120..180 line 2.
    expect(activeLineAtFrame(evenScene, 10, 180).lineIndex).toBe(0);
    expect(activeLineAtFrame(evenScene, 90, 180).lineIndex).toBe(1);
    expect(activeLineAtFrame(evenScene, 170, 180).lineIndex).toBe(2);
  });

  it('clamps to the last line for frames past the scene end', () => {
    const r = activeLineAtFrame(scene, 9999, total);
    expect(r.lineIndex).toBe(2);
    expect(r.blendT).toBe(1);
  });

  it('handles a single-line scene (always lineIndex 0, blendT 1)', () => {
    const single = baseScene([
      { char: 'bablu', text: 'only', dur: 60, emotion: 'happy' },
    ]);
    const r = activeLineAtFrame(single, 30, 60);
    expect(r.lineIndex).toBe(0);
    expect(r.blendT).toBe(1);
  });
});
