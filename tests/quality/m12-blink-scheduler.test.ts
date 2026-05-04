// M12 audit-v10-debate (Glen Keane): "1.5 points of life before lunch."
// Every character must blink. We add a deterministic blink scheduler:
// each character closes their eyelids briefly every ~3 seconds (90
// frames at 30fps), with a tiny per-character offset to avoid sync.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '../../src/characters/CharacterRenderer.tsx'),
  'utf8',
);

describe('M12 blink scheduler (audit-v10-debate Keane)', () => {
  it('CharacterRenderer references a blink concept', () => {
    expect(SRC).toMatch(/blink/i);
  });

  it('blink uses frame-based deterministic logic (modulo on frame)', () => {
    // Look for a frame-modulo or interpolate pattern that closes eyelids.
    expect(SRC).toMatch(/frame\s*%\s*\d+|blinkPhase|isBlinking/);
  });

  it('blink interval is between 60 and 180 frames (2-6 seconds)', () => {
    // Extract the modulus value following frame %
    const match = SRC.match(/(?:blink[\s\S]{0,100}?)frame[^%]*%\s*(\d+)/i);
    expect(match).not.toBeNull();
    if (match) {
      const interval = parseInt(match[1], 10);
      expect(interval).toBeGreaterThanOrEqual(60);
      expect(interval).toBeLessThanOrEqual(180);
    }
  });
});
