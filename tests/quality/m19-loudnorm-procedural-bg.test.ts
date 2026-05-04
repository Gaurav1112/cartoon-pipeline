// M19 (audit-v14): two highest-leverage fixes from the v14 16-expert
// panel — the audio Fleischman recommendation (retarget loudnorm to
// YouTube Kids spec I=-16 LUFS) and the visual Miyazaki/Eggleston
// recommendation (force procedural SVG everywhere — kill the
// stock-photo plates that mismatch the SVG character style).

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('M19 audio: -16 LUFS YouTube Kids loudness target', () => {
  const mixerSrc = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'src', 'audio', 'audio-mixer.ts'),
    'utf8',
  );

  it('loudnorm I target is -16 LUFS (was -14)', () => {
    expect(mixerSrc).toContain('loudnorm=I=-16:LRA=11:TP=-1.5');
  });

  it('alimiter limit tightened to 0.891 (≈ -1.0 dBFS sample-domain ceiling)', () => {
    expect(mixerSrc).toContain('alimiter=level_in=1:level_out=1:limit=0.891');
  });

  it('no stale -14 LUFS pin remains', () => {
    expect(mixerSrc).not.toMatch(/loudnorm=I=-14/);
  });
});

describe('M19 visual: procedural SVG backgrounds (no stock photos)', () => {
  const bgSrc = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'src', 'scenes', 'BackgroundRenderer.tsx'),
    'utf8',
  );

  it('STOCK_BG_BY_LOCATION map is empty (force procedural SVG)', () => {
    // The declaration line + literal empty object together prove no
    // location maps to a stock plate.
    expect(bgSrc).toMatch(/STOCK_BG_BY_LOCATION:\s*Partial<Record<LocationType,\s*string>>\s*=\s*\{\s*\}/);
  });

  it('STOCK_BG_BY_LOCATION_TIME map is empty', () => {
    expect(bgSrc).toMatch(/STOCK_BG_BY_LOCATION_TIME:\s*Record<string,\s*string>\s*=\s*\{\s*\}/);
  });

  it('no JPG paths remain in the stock maps (avoid silent style-mismatch regressions)', () => {
    // The cartoonify filter SVG block doesn't reference jpg paths;
    // any future refactor that re-introduces a `.jpg` mapping would
    // resurface the Miyazaki/Eggleston gap. Constrain to the
    // STOCK_BG declaration window only.
    const declStart = bgSrc.indexOf('const STOCK_BG_BY_LOCATION');
    const declEnd = bgSrc.indexOf('};', declStart);
    const window = bgSrc.slice(declStart, declEnd);
    expect(window).not.toMatch(/\.jpg/);
  });
});
