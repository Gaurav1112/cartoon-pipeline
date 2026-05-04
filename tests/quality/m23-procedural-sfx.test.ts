// tests/quality/m23-procedural-sfx.test.ts
//
// M23b: Procedural SFX generation tests

import { describe, it, expect } from 'vitest';
import { generateProceduralSfx } from '../../src/audio/sfx-procedural';

describe('M23b — Procedural SFX synthesis', () => {
  it('generates roar filter string', () => {
    const filter = generateProceduralSfx('roar', 800);
    expect(filter).toContain('aevalsrc');
    expect(filter).toContain('d=0.8000');
    expect(filter).toBeTruthy();
  });

  it('generates thump filter string', () => {
    const filter = generateProceduralSfx('thump', 150);
    expect(filter).toContain('aevalsrc');
    expect(filter).toContain('d=0.1500');
    expect(filter).toBeTruthy();
  });

  it('generates wind filter string', () => {
    const filter = generateProceduralSfx('wind', 3000);
    expect(filter).toContain('aevalsrc');
    expect(filter).toContain('bandpass');
    expect(filter).toContain('volume=-30dB');
  });

  it('is deterministic', () => {
    const f1 = generateProceduralSfx('roar', 900);
    const f2 = generateProceduralSfx('roar', 900);
    expect(f1).toBe(f2);
  });
});
