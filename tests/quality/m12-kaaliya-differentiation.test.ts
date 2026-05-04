// M12 audit-v10-debate (Miyazaki/Docter): Kaaliya's 'scar' is in extras
// but never rendered. Make it visible. Also add asymmetric ear-notch
// so the silhouette differentiates from Raja immediately.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '../../src/characters/CharacterRenderer.tsx'),
  'utf8',
);

describe('M12 Kaaliya visual differentiation (audit-v10-debate Miyazaki)', () => {
  it('renders a scar SVG path when characterId === kaaliya', () => {
    expect(SRC).toMatch(/Kaaliya scar/i);
    expect(SRC).toMatch(/characterId === 'kaaliya'[\s\S]{0,500}d=`M[^`]*scar|scar[\s\S]{0,200}characterId === 'kaaliya'/i);
  });

  it('renders asymmetric ear-notch / torn-mane silhouette mark', () => {
    expect(SRC).toMatch(/Kaaliya (ear-notch|torn|mane-tear|notch)/i);
  });
});
