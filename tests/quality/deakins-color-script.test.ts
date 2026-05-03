// tests/quality/deakins-color-script.test.ts
//
// M4.1 — Roger Deakins gap. Pin the per-mood color script so future
// edits can't flatten the lighting back to neutral by accident.

import { describe, it, expect } from 'vitest';
import {
  COLOR_SCRIPT_BY_MOOD,
  applyColorBeat,
  resolveMood,
  type Mood,
} from '../../src/color/color-script';

const ALL_MOODS: Mood[] = ['peaceful', 'tense', 'climax', 'triumph', 'moral', 'neutral'];

describe('Deakins per-beat color script', () => {
  it('every Mood has a ColorBeat entry with the required fields', () => {
    for (const m of ALL_MOODS) {
      const b = COLOR_SCRIPT_BY_MOOD[m];
      expect(b, `missing color beat for mood: ${m}`).toBeDefined();
      expect(typeof b.keyTintHex).toBe('string');
      expect(b.keyTintHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(b.fillTintHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(typeof b.exposureEv).toBe('number');
      expect(typeof b.saturationMul).toBe('number');
      expect(typeof b.keyDirectionDeg).toBe('number');
    }
  });

  it('peaceful, tense, climax produce distinct keyTintHex and exposureEv', () => {
    const moods: Mood[] = ['peaceful', 'tense', 'climax'];
    const tints = new Set(moods.map((m) => COLOR_SCRIPT_BY_MOOD[m].keyTintHex));
    const evs = new Set(moods.map((m) => COLOR_SCRIPT_BY_MOOD[m].exposureEv));
    expect(tints.size).toBe(3);
    expect(evs.size).toBe(3);
  });

  it('all numeric ranges stay in spec', () => {
    for (const m of ALL_MOODS) {
      const b = COLOR_SCRIPT_BY_MOOD[m];
      expect(b.exposureEv).toBeGreaterThanOrEqual(-1);
      expect(b.exposureEv).toBeLessThanOrEqual(1);
      expect(b.saturationMul).toBeGreaterThanOrEqual(0.5);
      expect(b.saturationMul).toBeLessThanOrEqual(1.5);
      expect(b.keyDirectionDeg).toBeGreaterThanOrEqual(0);
      expect(b.keyDirectionDeg).toBeLessThan(360);
    }
  });

  it('applyColorBeat is pure (same input → identical output, key order included)', () => {
    const beat = COLOR_SCRIPT_BY_MOOD.climax;
    const a = applyColorBeat(beat);
    const b = applyColorBeat(beat);
    expect(a).toEqual(b);
    // Stable key ordering — important for any future snapshot diffing.
    expect(Object.keys(a)).toEqual(Object.keys(b));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('applyColorBeat returns a CSS filter chain with brightness/saturate/hue-rotate', () => {
    const css = applyColorBeat(COLOR_SCRIPT_BY_MOOD.peaceful);
    expect(typeof css.filter).toBe('string');
    expect(css.filter as string).toMatch(/brightness\(/);
    expect(css.filter as string).toMatch(/saturate\(/);
    expect(css.filter as string).toMatch(/hue-rotate\(/);
    // CSS variables for child SVGs.
    expect((css as Record<string, string>)['--key-tint']).toBe('#FFE9C2');
    expect((css as Record<string, string>)['--fill-tint']).toBe('#9FB8CF');
  });

  it('resolveMood maps SceneMood and falls back to neutral', () => {
    expect(resolveMood(undefined)).toBe('neutral');
    expect(resolveMood('peaceful')).toBe('peaceful');
    expect(resolveMood('hook')).toBe('tense');
    expect(resolveMood('reveal')).toBe('climax');
    expect(resolveMood('moral')).toBe('moral');
    expect(resolveMood('comedy')).toBe('triumph');
    expect(resolveMood('xxxx')).toBe('neutral');
  });

  it('SceneRenderer wires applyColorBeat into scene wrapper', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../src/compositions/episode1/SceneRenderer.tsx'),
      'utf8',
    );
    expect(src).toMatch(/applyColorBeat/);
    expect(src).toMatch(/COLOR_SCRIPT_BY_MOOD/);
  });
});
