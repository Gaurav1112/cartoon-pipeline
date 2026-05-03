// tests/episode1/timing.test.ts
import { describe, it, expect } from 'vitest';
import { calcDialogueDur, calcSceneDur, validateSceneChars, calcEpisodeDuration } from '../../src/compositions/episode1/timing';
import type { ViralScene } from '../../src/compositions/episode1/types';

// ─── calcDialogueDur ──────────────────────────────────────────────────────────

// Pacing contract (Bird/MrBeast retention, post-overhaul):
//   MIN_LINE_FRAMES   = 42 frames (~1.4s)  — snappy delivery floor
//   REACTION_GAP      = 9  frames (~0.3s)  — viewer micro-pause
//   FRAMES_PER_CHAR   = 6                  — unchanged

describe('calcDialogueDur', () => {
  it('returns minimum 42 frames for very short text', () => {
    expect(calcDialogueDur('हाँ')).toBeGreaterThanOrEqual(42);
  });

  it('returns proportionally more frames for longer text', () => {
    const short = calcDialogueDur('हाँ');
    const long = calcDialogueDur('मुझे माफ़ करना शेर जी, रास्ते में एक और शेर ने रोक लिया था।');
    expect(long).toBeGreaterThan(short);
  });

  it('long text (~50 chars) gets at least 180 frames', () => {
    expect(calcDialogueDur('मुझे माफ़ करना शेर जी, रास्ते में एक और शेर ने रोक लिया था।')).toBeGreaterThanOrEqual(180);
  });

  it('never returns fractional frames', () => {
    expect(Number.isInteger(calcDialogueDur('खरगोश'))).toBe(true);
  });

  it('short text (under 10 chars) returns at most 90 frames', () => {
    expect(calcDialogueDur('क्या?!')).toBeLessThanOrEqual(90);
  });

  it('empty string returns the floor (MIN_LINE_FRAMES = 42)', () => {
    // raw = 0 * 6 + 9 = 9, below 42 → floor kicks in
    expect(calcDialogueDur('')).toBe(42);
  });

  it('never returns a negative number for any input', () => {
    expect(calcDialogueDur('')).toBeGreaterThanOrEqual(0);
    expect(calcDialogueDur('अ')).toBeGreaterThanOrEqual(0);
  });

  it('returns an integer for every sample text', () => {
    const samples = ['', 'हाँ', 'क्या?!', 'खरगोश', 'बचोगे नहीं आज!', 'अक्ल से सब हल होता है।'];
    for (const s of samples) {
      expect(Number.isInteger(calcDialogueDur(s))).toBe(true);
    }
  });

  it('exact arithmetic: text.length * 6 + 9, floored at 42', () => {
    // 'हाँ' has 3 chars → raw = 3*6 + 9 = 27 → below 42 → result = 42
    expect(calcDialogueDur('हाँ')).toBe(42);

    // 10-char text: raw = 10*6 + 9 = 69 → above 42 → result = 69
    const tenChar = 'abcdefghij';
    expect(calcDialogueDur(tenChar)).toBe(69);
  });

  it('text whose raw value just exceeds the floor is returned as raw', () => {
    // len=7: raw = 7*6+9 = 51 → above 42 → result = 51
    expect(calcDialogueDur('abcdefg')).toBe(51);
  });

  it('is monotonically non-decreasing as text grows', () => {
    const results: number[] = [];
    for (let len = 0; len <= 30; len++) {
      results.push(calcDialogueDur('a'.repeat(len)));
    }
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeGreaterThanOrEqual(results[i - 1]);
    }
  });
});

// ─── calcSceneDur ─────────────────────────────────────────────────────────────

describe('calcSceneDur', () => {
  // calcSceneDur now includes default postGap (200ms = 6 frames @30fps) per
  // line so video & audio timelines stay in sync. Tests below use the
  // POST_GAP constant explicitly so the contract is visible.
  const POST_GAP = 6; // DEFAULT_POST_GAP_MS=200 × FPS=30 / 1000 = 6 frames

  it('sums all dialogue durations in a scene', () => {
    const lines = [
      { char: 'guruji' as const, text: 'आओ', dur: 'auto' as const },
      { char: 'arjun' as const, text: 'हाँ गुरुजी', dur: 'auto' as const },
    ];
    const result = calcSceneDur(lines);
    expect(result).toBeGreaterThan(calcDialogueDur('आओ'));
  });

  it('respects explicit dur numbers over auto (plus default postGap)', () => {
    const lines = [
      { char: 'arjun' as const, text: 'hello', dur: 999 },
    ];
    expect(calcSceneDur(lines)).toBe(999 + POST_GAP);
  });

  // ── NEW ──────────────────────────────────────────────────────────────────

  it('returns 0 for an empty dialogue array', () => {
    expect(calcSceneDur([])).toBe(0);
  });

  it('returns exact sum of explicit dur values + per-line postGap', () => {
    const lines = [
      { text: 'a', dur: 100 },
      { text: 'b', dur: 200 },
      { text: 'c', dur: 50 },
    ];
    expect(calcSceneDur(lines)).toBe(350 + 3 * POST_GAP);
  });

  it('mixes auto and explicit dur correctly (with postGap on each)', () => {
    const autoFrames = calcDialogueDur('hello');
    const lines = [
      { text: 'hello', dur: 'auto' as const },
      { text: 'ignored text', dur: 300 },
    ];
    expect(calcSceneDur(lines)).toBe(autoFrames + 300 + 2 * POST_GAP);
  });

  it('single auto line equals calcDialogueDur + one postGap', () => {
    const text = 'दिमाग से जीत होती है।';
    const lines = [{ text, dur: 'auto' as const }];
    expect(calcSceneDur(lines)).toBe(calcDialogueDur(text) + POST_GAP);
  });

  it('explicit dur of 0 still adds default postGap (audio waits regardless)', () => {
    const lines = [{ text: 'anything', dur: 0 }];
    expect(calcSceneDur(lines)).toBe(POST_GAP);
  });

  it('honors explicit postGapMs override on a line', () => {
    // 500ms = 15 frames; replaces the default 6.
    const lines = [{ text: 'x', dur: 100, postGapMs: 500 }];
    expect(calcSceneDur(lines)).toBe(100 + 15);
  });

  it('result is always a non-negative integer when all durs are non-negative', () => {
    const lines = [
      { text: 'हाँ', dur: 'auto' as const },
      { text: 'नमस्ते', dur: 'auto' as const },
    ];
    const result = calcSceneDur(lines);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result)).toBe(true);
  });
});

// ─── validateSceneChars ───────────────────────────────────────────────────────

describe('validateSceneChars', () => {
  it('does not throw when all dialogue speakers are in chars array', () => {
    const scene: ViralScene = {
      id: 'test',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
      cam: 'static',
      camI: 0.3,
      dialogue: [{ char: 'arjun', text: 'हाँ', dur: 'auto' }],
    };
    expect(() => validateSceneChars(scene)).not.toThrow();
  });

  it('throws when a dialogue speaker is not in chars array', () => {
    const scene: ViralScene = {
      id: 'test-phantom',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
      cam: 'static',
      camI: 0.3,
      dialogue: [
        { char: 'arjun', text: 'हाँ', dur: 'auto' },
        { char: 'bablu', text: 'phantom line!', dur: 'auto' },
      ],
    };
    expect(() => validateSceneChars(scene)).toThrow(/phantom/i);
  });

  it('throws with the phantom character id in the message', () => {
    const scene: ViralScene = {
      id: 'test',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [],
      cam: 'static',
      camI: 0,
      dialogue: [{ char: 'meera', text: 'ghost', dur: 'auto' }],
    };
    expect(() => validateSceneChars(scene)).toThrow('meera');
  });

  // ── NEW ──────────────────────────────────────────────────────────────────

  it('does not throw when both chars and dialogue are empty', () => {
    const scene: ViralScene = {
      id: 'empty-scene',
      bg: 'garden',
      time: 'day',
      dur: 5,
      chars: [],
      cam: 'static',
      camI: 0,
      dialogue: [],
    };
    expect(() => validateSceneChars(scene)).not.toThrow();
  });

  it('does not throw when chars array has characters but dialogue is empty', () => {
    const scene: ViralScene = {
      id: 'silent-scene',
      bg: 'forest',
      time: 'dusk',
      dur: 'auto',
      chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'neutral' }],
      cam: 'static',
      camI: 0.2,
      dialogue: [],
    };
    expect(() => validateSceneChars(scene)).not.toThrow();
  });

  it('error message contains the scene id', () => {
    const scene: ViralScene = {
      id: 'my-special-scene-id',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [],
      cam: 'static',
      camI: 0,
      dialogue: [{ char: 'bablu', text: 'phantom', dur: 'auto' }],
    };
    expect(() => validateSceneChars(scene)).toThrow('my-special-scene-id');
  });

  it('throws on the FIRST phantom character encountered', () => {
    const scene: ViralScene = {
      id: 'multi-phantom',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [],
      cam: 'static',
      camI: 0,
      dialogue: [
        { char: 'bablu', text: 'first phantom', dur: 'auto' },
        { char: 'meera', text: 'second phantom', dur: 'auto' },
      ],
    };
    // Should throw mentioning bablu (first phantom), not meera
    expect(() => validateSceneChars(scene)).toThrow('bablu');
  });

  it('does not throw when multiple chars are present and all speak', () => {
    const scene: ViralScene = {
      id: 'multi-char',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [
        { id: 'arjun', pos: 'left', pose: 'idle_stand', expr: 'happy' },
        { id: 'bablu', pos: 'right', pose: 'idle_stand', expr: 'happy' },
      ],
      cam: 'static',
      camI: 0.3,
      dialogue: [
        { char: 'arjun', text: 'नमस्ते', dur: 'auto' },
        { char: 'bablu', text: 'हाँ भाई', dur: 'auto' },
        { char: 'arjun', text: 'चलो', dur: 'auto' },
      ],
    };
    expect(() => validateSceneChars(scene)).not.toThrow();
  });

  it('throws when the only character in dialogue is absent from chars', () => {
    const scene: ViralScene = {
      id: 'solo-phantom',
      bg: 'forest',
      time: 'day',
      dur: 'auto',
      chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
      cam: 'static',
      camI: 0,
      dialogue: [{ char: 'kaaliya', text: 'बचोगे नहीं!', dur: 'auto' }],
    };
    expect(() => validateSceneChars(scene)).toThrow('kaaliya');
  });
});

// ─── calcEpisodeDuration — ZERO coverage before, fully tested now ─────────────

describe('calcEpisodeDuration', () => {
  const FPS = 30;
  const MORAL_CARD_FRAMES = 6 * FPS; // 180
  const OUTRO_FRAMES = 5 * FPS;      // 150
  const OVERHEAD = MORAL_CARD_FRAMES + OUTRO_FRAMES; // 330

  it('returns OVERHEAD (330 frames) for an empty scene array', () => {
    expect(calcEpisodeDuration([])).toBe(OVERHEAD);
  });

  it('includes moral card (6s) + outro (5s) = 330 frames of overhead', () => {
    // A single scene with explicit dur=0 should give exactly 330 frames
    const scenes: ViralScene[] = [
      {
        id: 'zero',
        bg: 'forest',
        time: 'day',
        dur: 0,          // 0 * 30 = 0 frames
        chars: [],
        cam: 'static',
        camI: 0,
        dialogue: [],
      },
    ];
    expect(calcEpisodeDuration(scenes)).toBe(OVERHEAD);
  });

  it('correctly converts numeric dur (seconds) to frames via * 30', () => {
    const scenes: ViralScene[] = [
      {
        id: 'five-second',
        bg: 'forest',
        time: 'day',
        dur: 5,           // 5s * 30fps = 150 frames
        chars: [],
        cam: 'static',
        camI: 0,
        dialogue: [],
      },
    ];
    expect(calcEpisodeDuration(scenes)).toBe(5 * FPS + OVERHEAD);
  });

  it('uses calcSceneDur for auto-dur scenes', () => {
    const text = 'abcdefghij'; // 10 chars → calcDialogueDur = 10*6+18 = 78
    const expectedLineFrames = calcDialogueDur(text); // 78
    const scenes: ViralScene[] = [
      {
        id: 'auto-scene',
        bg: 'forest',
        time: 'day',
        dur: 'auto',
        chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
        cam: 'static',
        camI: 0,
        dialogue: [{ char: 'arjun', text, dur: 'auto' }],
      },
    ];
    expect(calcEpisodeDuration(scenes)).toBe(expectedLineFrames + 6 + OVERHEAD);
  });

  it('sums multiple scenes of mixed dur types', () => {
    const scenes: ViralScene[] = [
      {
        id: 'numeric',
        bg: 'forest',
        time: 'day',
        dur: 10,          // 300 frames
        chars: [],
        cam: 'static',
        camI: 0,
        dialogue: [],
      },
      {
        id: 'explicit-line',
        bg: 'garden',
        time: 'day',
        dur: 'auto',
        chars: [{ id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'happy' }],
        cam: 'static',
        camI: 0,
        dialogue: [{ char: 'arjun', text: 'hello', dur: 200 }],
      },
    ];
    expect(calcEpisodeDuration(scenes)).toBe(300 + 200 + 6 + OVERHEAD);
  });

  it('result is always >= OVERHEAD (330 frames)', () => {
    expect(calcEpisodeDuration([])).toBeGreaterThanOrEqual(OVERHEAD);
  });

  it('result is a positive integer', () => {
    const result = calcEpisodeDuration([]);
    expect(result).toBeGreaterThan(0);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('auto scene with empty dialogue contributes 0 scene frames', () => {
    const scenes: ViralScene[] = [
      {
        id: 'empty-auto',
        bg: 'garden',
        time: 'day',
        dur: 'auto',
        chars: [],
        cam: 'static',
        camI: 0,
        dialogue: [],
      },
    ];
    // calcSceneDur([]) = 0, so total = 0 + OVERHEAD
    expect(calcEpisodeDuration(scenes)).toBe(OVERHEAD);
  });
});
