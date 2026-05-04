// tests/quality/m21-story-complication.test.ts
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES as scenes } from '../../src/compositions/episode1/scenes-lion-rabbit';

/**
 * M21: Story Complication at Climax (v14 audit-Story panel 7.40/10).
 *
 * REQUIREMENT: "Climax lacks jeopardy — Kaaliya peers into well, sees
 * reflection, and just immediately jumps. There's no complication, no
 * almost-failure beat. Real top story films give one ALMOST moment where
 * the hero's plan nearly fails."
 *
 * IMPLEMENTATION:
 * - After kaaliya looks into the well and sees his reflection, ADD a new
 *   beat where kaaliya hesitates and laughs/sneers at his own reflection
 *   ("यह तो मैं हूँ!" — "this is just me!"). The trick is failing.
 * - Then arjun must weaponize the catchphrase that's been seeded earlier
 *   ("जंगल MERA!" — "the jungle is MINE!") by SHOUTING it from off-screen,
 *   making kaaliya hear his "rival" and turn enraged.
 * - Kaaliya then roars "तू मेरा शिकार बनेगा!" ("you will be my prey!") and jumps.
 *
 * BEAT SEQUENCE:
 * - well-trick (existing — setup)
 * - NEW: well-laugh — kaaliya laughs at reflection ("यह तो मैं हूँ!")
 * - NEW: well-bait — arjun off-screen weaponizes "जंगल MERA!"
 * - NEW: well-rage — kaaliya enraged "तू मेरा शिकार बनेगा!" then jumps
 * - catharsis-breath (existing)
 */
describe('M21: Story Complication at Climax', () => {
  it('catchphrase "जंगल MERA" appears at least TWICE (seed + payoff)', () => {
    const allDialogue = scenes.flatMap((s) =>
      s.dialogue.flatMap((d) => [d.text, d.textOverlay].filter(Boolean))
    );
    const catchphraseMatches = allDialogue.filter((text) =>
      text && (text.includes('जंगल') && text.includes('मेरा'))
    );
    expect(
      catchphraseMatches.length,
      `Expected "जंगल मेरा" to appear at least 2x (seed earlier, payoff at climax), found ${catchphraseMatches.length}`
    ).toBeGreaterThanOrEqual(2);
  });

  it('scene sequence: well-trick → well-laugh → well-bait → well-rage → catharsis', () => {
    const sceneIds = scenes.map((s) => s.id);
    const wellTrickIdx = sceneIds.indexOf('well-trick');
    const wellLaughIdx = sceneIds.indexOf('well-laugh');
    const wellBaitIdx = sceneIds.indexOf('well-bait');
    const wellRageIdx = sceneIds.indexOf('well-rage');
    const catharsisIdx = sceneIds.indexOf('catharsis-breath');

    expect(wellTrickIdx, 'well-trick scene must exist').toBeGreaterThanOrEqual(0);
    expect(wellLaughIdx, 'well-laugh scene (complication) must exist').toBeGreaterThanOrEqual(0);
    expect(wellBaitIdx, 'well-bait scene (catchphrase weaponized) must exist').toBeGreaterThanOrEqual(0);
    expect(wellRageIdx, 'well-rage scene (Kaaliya enraged) must exist').toBeGreaterThanOrEqual(0);
    expect(catharsisIdx, 'catharsis-breath scene must exist').toBeGreaterThanOrEqual(0);

    expect(wellTrickIdx < wellLaughIdx, 'well-trick must come before well-laugh').toBe(true);
    expect(wellLaughIdx < wellBaitIdx, 'well-laugh must come before well-bait').toBe(true);
    expect(wellBaitIdx < wellRageIdx, 'well-bait must come before well-rage').toBe(true);
    expect(wellRageIdx < catharsisIdx, 'well-rage must come before catharsis-breath').toBe(true);
  });

  it('well-laugh: dialogue contains self-recognition ("मैं हूँ")', () => {
    const wellLaugh = scenes.find((s) => s.id === 'well-laugh');
    expect(wellLaugh, 'well-laugh scene must exist').toBeDefined();
    const allText = wellLaugh!.dialogue.flatMap((d) => [d.text, d.textOverlay].filter(Boolean));
    const hasRecognition = allText.some((text) => text && text.includes('मैं हूँ'));
    expect(hasRecognition, 'well-laugh must show Kaaliya recognizing his reflection ("मैं हूँ")').toBe(true);
  });

  it('well-rage: dialogue contains "शिकार" (prey) — confirms rage callback', () => {
    const wellRage = scenes.find((s) => s.id === 'well-rage');
    expect(wellRage, 'well-rage scene must exist').toBeDefined();
    const allText = wellRage!.dialogue.flatMap((d) => [d.text, d.textOverlay].filter(Boolean));
    const hasPreyThreat = allText.some((text) => text && text.includes('शिकार'));
    expect(hasPreyThreat, 'well-rage must contain prey threat ("शिकार")').toBe(true);
  });

  it('well-bait: textOverlay contains catchphrase ("MERA" or "जंगल")', () => {
    const wellBait = scenes.find((s) => s.id === 'well-bait');
    expect(wellBait, 'well-bait scene must exist').toBeDefined();
    const overlays = wellBait!.dialogue.map((d) => d.textOverlay).filter(Boolean);
    const hasCatchphrase = overlays.some(
      (text) => text && (text.includes('MERA') || text.includes('जंगल'))
    );
    expect(hasCatchphrase, 'well-bait must weaponize catchphrase via textOverlay').toBe(true);
  });

  it('total climax complication span is 150–220 frames (5–7.3s — not bloating runtime)', () => {
    const wellLaugh = scenes.find((s) => s.id === 'well-laugh');
    const wellBait = scenes.find((s) => s.id === 'well-bait');
    const wellRage = scenes.find((s) => s.id === 'well-rage');

    expect(wellLaugh, 'well-laugh must exist').toBeDefined();
    expect(wellBait, 'well-bait must exist').toBeDefined();
    expect(wellRage, 'well-rage must exist').toBeDefined();

    // Calculate total frames from dialogue durations
    const getLaughFrames = () => {
      if (wellLaugh!.dur === 'auto') {
        return wellLaugh!.dialogue.reduce((sum, d) => {
          const dur = d.dur === 'auto' ? 60 : d.dur; // rough auto estimate
          return sum + dur;
        }, 0);
      }
      return wellLaugh!.dur * 30; // sec to frames
    };

    const getBaitFrames = () => {
      if (wellBait!.dur === 'auto') {
        return wellBait!.dialogue.reduce((sum, d) => {
          const dur = d.dur === 'auto' ? 45 : d.dur;
          return sum + dur;
        }, 0);
      }
      return wellBait!.dur * 30;
    };

    const getRageFrames = () => {
      if (wellRage!.dur === 'auto') {
        return wellRage!.dialogue.reduce((sum, d) => {
          const dur = d.dur === 'auto' ? 75 : d.dur;
          return sum + dur;
        }, 0);
      }
      return wellRage!.dur * 30;
    };

    const totalFrames = getLaughFrames() + getBaitFrames() + getRageFrames();
    expect(totalFrames, 'Climax complication should be 150–220 frames').toBeGreaterThanOrEqual(150);
    expect(totalFrames, 'Climax complication should be 150–220 frames').toBeLessThanOrEqual(220);
  });

  it('well-laugh uses patternInterrupt "shake" to amplify complication', () => {
    const wellLaugh = scenes.find((s) => s.id === 'well-laugh');
    expect(wellLaugh, 'well-laugh scene must exist').toBeDefined();
    const hasShake = wellLaugh!.dialogue.some((d) => d.patternInterrupt === 'shake');
    expect(hasShake, 'well-laugh should use "shake" patternInterrupt').toBe(true);
  });

  it('well-rage has high heroMomentScore (≥0.9) — marks climax peak', () => {
    const wellRage = scenes.find((s) => s.id === 'well-rage');
    expect(wellRage, 'well-rage scene must exist').toBeDefined();
    const maxHeroScore = Math.max(
      ...wellRage!.dialogue.map((d) => d.heroMomentScore ?? 0)
    );
    expect(maxHeroScore, 'well-rage should have heroMomentScore ≥ 0.9').toBeGreaterThanOrEqual(0.9);
  });
});
