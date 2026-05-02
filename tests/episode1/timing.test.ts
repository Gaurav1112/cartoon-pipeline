// tests/episode1/timing.test.ts
import { describe, it, expect } from 'vitest';
import { calcDialogueDur, calcSceneDur, validateSceneChars } from '../../src/compositions/episode1/timing';
import type { ViralScene } from '../../src/compositions/episode1/types';

describe('calcDialogueDur', () => {
  it('returns minimum 55 frames for very short text', () => {
    expect(calcDialogueDur('हाँ')).toBeGreaterThanOrEqual(55);
  });

  it('returns proportionally more frames for longer text', () => {
    const short = calcDialogueDur('हाँ');
    const long = calcDialogueDur('मुझे माफ़ करना शेर जी, रास्ते में एक और शेर ने रोक लिया था।');
    expect(long).toBeGreaterThan(short);
  });

  it('long text (~50 chars) gets at least 200 frames', () => {
    expect(calcDialogueDur('मुझे माफ़ करना शेर जी, रास्ते में एक और शेर ने रोक लिया था।')).toBeGreaterThanOrEqual(200);
  });

  it('never returns fractional frames', () => {
    expect(Number.isInteger(calcDialogueDur('खरगोश'))).toBe(true);
  });

  it('short text (under 10 chars) returns at most 120 frames', () => {
    expect(calcDialogueDur('क्या?!')).toBeLessThanOrEqual(120);
  });
});

describe('calcSceneDur', () => {
  it('sums all dialogue durations in a scene', () => {
    const lines = [
      { char: 'guruji' as const, text: 'आओ', dur: 'auto' as const },
      { char: 'arjun' as const, text: 'हाँ गुरुजी', dur: 'auto' as const },
    ];
    const result = calcSceneDur(lines);
    expect(result).toBeGreaterThan(calcDialogueDur('आओ'));
  });

  it('respects explicit dur numbers over auto', () => {
    const lines = [
      { char: 'arjun' as const, text: 'hello', dur: 999 },
    ];
    expect(calcSceneDur(lines)).toBe(999);
  });
});

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
});
