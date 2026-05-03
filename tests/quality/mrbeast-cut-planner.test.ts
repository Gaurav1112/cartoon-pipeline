// tests/quality/mrbeast-cut-planner.test.ts
//
// M4.2 — MrBeast cut variants. Pin: 15s/30s/60s/full plans assembled
// from heroMomentScore tags, each respecting its duration cap and
// staying inside the episode timeline.

import { describe, it, expect } from 'vitest';
import { generateEpisode } from '../../src/story/story-engine';
import { planCuts, type CutPlan, type CutPlanName } from '../../src/cuts/cut-planner';

const FPS = 30;
const REQUIRED: CutPlanName[] = ['15s-teaser', '30s-hero', '60s-trailer', 'full'];

function totalFrames(plan: CutPlan): number {
  return plan.frameRanges.reduce((s, [a, b]) => s + (b - a + 1), 0);
}

describe('MrBeast cut planner', () => {
  const episode = generateEpisode(1, 42);
  const plans = planCuts(episode);

  it('returns the four named plans in order', () => {
    expect(plans.map((p) => p.name)).toEqual(REQUIRED);
  });

  it('each plan has at least one non-empty frame range inside the episode', () => {
    for (const plan of plans) {
      expect(plan.frameRanges.length).toBeGreaterThanOrEqual(1);
      for (const [start, end] of plan.frameRanges) {
        expect(start).toBeGreaterThanOrEqual(0);
        expect(end).toBeLessThan(episode.totalDurationFrames);
        expect(end).toBeGreaterThanOrEqual(start);
      }
    }
  });

  it('15s/30s/60s respect duration caps within 30-frame tolerance', () => {
    const map = Object.fromEntries(plans.map((p) => [p.name, p]));
    expect(totalFrames(map['15s-teaser'])).toBeLessThanOrEqual(15 * FPS + 30);
    expect(totalFrames(map['30s-hero'])).toBeLessThanOrEqual(30 * FPS + 30);
    expect(totalFrames(map['60s-trailer'])).toBeLessThanOrEqual(60 * FPS + 30);
  });

  it('full cut spans the entire episode', () => {
    const full = plans.find((p) => p.name === 'full')!;
    expect(full.frameRanges).toHaveLength(1);
    expect(full.frameRanges[0][0]).toBe(0);
    expect(full.frameRanges[0][1]).toBe(episode.totalDurationFrames - 1);
  });

  it('the 15s teaser places the hero beat in the first 30% of the cut', () => {
    const teaser = plans.find((p) => p.name === '15s-teaser')!;
    const [start, end] = teaser.frameRanges[0];
    const span = end - start + 1;

    // Re-derive the top hero frame the same way the planner does so we
    // can assert its position inside the cut window.
    const INTRO = 150;
    let cursor = INTRO;
    let topFrame = -1;
    let topScore = -1;
    for (const sc of episode.scenes) {
      const dur = Math.max(1, sc.durationFrames);
      const n = sc.dialogue.length;
      for (let i = 0; i < n; i++) {
        const score = sc.dialogue[i].heroMomentScore ?? 0;
        const frame = cursor + Math.floor(((i + 0.5) / Math.max(1, n)) * dur);
        if (score > topScore) {
          topScore = score;
          topFrame = frame;
        }
      }
      cursor += dur;
    }

    expect(topScore).toBeGreaterThan(0);
    expect(topFrame).toBeGreaterThanOrEqual(start);
    expect(topFrame).toBeLessThanOrEqual(end);
    const pos = (topFrame - start) / span;
    expect(pos).toBeLessThanOrEqual(0.3);
  });

  it('is pure / deterministic', () => {
    const a = planCuts(episode);
    const b = planCuts(episode);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
