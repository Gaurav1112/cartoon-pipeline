// M11 audit-v10 (Andrea Romano): "Vibrato on every line makes every
// character sound nervous. Save it for fear/tense beats." Gate vibrato
// to scared / surprised / angry — neutral and happy lines play flat.
import { describe, it, expect } from 'vitest';
import { buildFfmpegFilter, getVoiceProfile } from '../../src/audio/character-voices';

describe('M11 vibrato gating (audit-v10 Romano)', () => {
  const profile = getVoiceProfile('arjun');

  it('happy emotion: NO vibrato', () => {
    const chain = buildFfmpegFilter(profile, 'happy');
    expect(chain).not.toMatch(/vibrato/);
  });

  it('neutral emotion: NO vibrato', () => {
    const chain = buildFfmpegFilter(profile, 'neutral');
    expect(chain).not.toMatch(/vibrato/);
  });

  it('scared emotion: vibrato applied', () => {
    const chain = buildFfmpegFilter(profile, 'scared');
    expect(chain).toMatch(/vibrato=f=5:d=0\.1/);
  });

  it('angry emotion: vibrato applied (rage tremor)', () => {
    const chain = buildFfmpegFilter(profile, 'angry');
    expect(chain).toMatch(/vibrato/);
  });

  it('surprised emotion: vibrato applied', () => {
    const chain = buildFfmpegFilter(profile, 'surprised');
    expect(chain).toMatch(/vibrato/);
  });

  it('omitting emotion still works (back-compat default = no vibrato)', () => {
    const chain = buildFfmpegFilter(profile);
    expect(chain).not.toMatch(/vibrato/);
  });
});
