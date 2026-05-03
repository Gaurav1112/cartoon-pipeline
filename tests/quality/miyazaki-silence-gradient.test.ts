import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SCENE_TAIL_MS,
  calcSceneDur,
  calcDialogueDur,
  calcEpisodeDuration,
  postGapFrames,
  sceneTailFrames,
} from '../../src/compositions/episode1/timing';
import type { ViralScene } from '../../src/compositions/episode1/types';

// Miyazaki "ma" gap M2.4 — scene-to-scene boundaries had no extra silence;
// only one scene out of eleven (the moral) had any tail breath. Cuts felt
// hurried. Default 300ms tail at every scene boundary, overridable per
// scene with `sceneTailMs`.

describe('M2.4 Miyazaki silence-gradient — default scene tail', () => {
  const FPS = 30;

  it('DEFAULT_SCENE_TAIL_MS === 300', () => {
    expect(DEFAULT_SCENE_TAIL_MS).toBe(300);
  });

  it('sceneTailFrames(undefined) returns floor(300ms * 30 / 1000) = 9 frames', () => {
    expect(sceneTailFrames(undefined)).toBe(9);
  });

  it('sceneTailFrames honors explicit override (500ms = 15 frames)', () => {
    expect(sceneTailFrames(500)).toBe(15);
  });

  it('sceneTailFrames(0) is exactly 0 (explicit "no tail" is allowed)', () => {
    expect(sceneTailFrames(0)).toBe(0);
  });

  it('calcSceneDur(scene) includes the default tail when sceneTailMs unset', () => {
    const scene: ViralScene = {
      id: 'tail-default',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
      cam: 'static',
      camI: 0.3,
      dialogue: [{ char: 'arjun', text: 'hello', dur: 100 }],
    };
    // 100 frames + postGap(default 200ms = 6fr) + tail(300ms = 9fr) = 115
    expect(calcSceneDur(scene)).toBe(100 + 6 + 9);
  });

  it('calcSceneDur(scene) honors explicit sceneTailMs override (500ms not default)', () => {
    const scene: ViralScene = {
      id: 'tail-override',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
      cam: 'static',
      camI: 0.3,
      dialogue: [{ char: 'arjun', text: 'x', dur: 100 }],
      sceneTailMs: 500,
    };
    // 100 + postGap(6) + tail(15) = 121
    expect(calcSceneDur(scene)).toBe(100 + 6 + 15);
  });

  it('calcSceneDur(dialogue[]) — legacy array form does NOT add tail', () => {
    // Backward compatibility: passing a bare dialogue array reflects only
    // the line-level math (the caller is asserting per-line content).
    const lines = [{ text: 'x', dur: 100 }];
    expect(calcSceneDur(lines)).toBe(100 + 6); // no tail
  });

  it('calcSceneDur(scene with sceneTailMs:0) excludes the tail entirely', () => {
    const scene: ViralScene = {
      id: 'no-tail',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
      cam: 'static',
      camI: 0.3,
      dialogue: [{ char: 'arjun', text: 'x', dur: 100 }],
      sceneTailMs: 0,
    };
    expect(calcSceneDur(scene)).toBe(100 + 6);
  });

  it('calcEpisodeDuration adds one tail per scene', () => {
    const scenes: ViralScene[] = [
      {
        id: 's1', bg: 'forest', time: 'day', dur: 'auto',
        chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
        cam: 'static', camI: 0,
        dialogue: [{ char: 'arjun', text: 'a', dur: 100 }],
      },
      {
        id: 's2', bg: 'forest', time: 'day', dur: 'auto',
        chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
        cam: 'static', camI: 0,
        dialogue: [{ char: 'arjun', text: 'b', dur: 200 }],
      },
    ];
    // 100+6+9 + 200+6+9 + (180+150 overhead) = 115 + 215 + 330 = 660
    expect(calcEpisodeDuration(scenes)).toBe(660);
  });

  it('postGapFrames is unchanged: still 6 for default 200ms', () => {
    // Sanity — M2.4 must not touch the per-line postGap math.
    expect(postGapFrames(undefined)).toBe(6);
  });
});
