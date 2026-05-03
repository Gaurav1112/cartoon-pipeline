// src/cuts/cut-planner.ts
//
// M4.2 — MrBeast cut planner. Plans 15s/30s/60s/full variants from a
// CartoonEpisode using per-line heroMomentScore tags. NO render side
// effects: each plan is just frame ranges that downstream tooling can
// pass to remotion render --frames=start-end.
//
// Pure / deterministic: same episode → same CutPlan[] sequence.

import type { CartoonEpisode, EpisodeScene, DialogueLine } from '../types';

export type CutPlanName = '15s-teaser' | '30s-hero' | '60s-trailer' | 'full';

export interface CutPlan {
  name: CutPlanName;
  /** Inclusive [start, end] frame ranges, in episode timeline frames. */
  frameRanges: Array<[number, number]>;
}

const FPS = 30;
const FR_15S = 15 * FPS; // 450
const FR_30S = 30 * FPS; // 900
const FR_60S = 60 * FPS; // 1800

// Episode prologue (intro) frame count — story-engine prepends 150 fr
// (5s) of intro before scene 0. Mirror that constant here so frame
// ranges line up with the full episode timeline.
const INTRO_FRAMES = 150;

interface ScoredLine {
  /** Frame offset of this line on the episode timeline. */
  frame: number;
  score: number;
  sceneIndex: number;
  lineIndex: number;
}

function collectScoredLines(scenes: EpisodeScene[]): ScoredLine[] {
  const lines: ScoredLine[] = [];
  let cursor = INTRO_FRAMES;
  for (const scene of scenes) {
    const dur = Math.max(1, scene.durationFrames);
    const n = scene.dialogue.length;
    for (let i = 0; i < n; i++) {
      const d: DialogueLine = scene.dialogue[i];
      const score = typeof d.heroMomentScore === 'number' ? d.heroMomentScore : 0;
      // Place each line at (i + 0.5)/n through the scene — even spacing
      // is sufficient for a planner that doesn't render audio itself.
      const frame = cursor + Math.floor(((i + 0.5) / Math.max(1, n)) * dur);
      lines.push({ frame, score, sceneIndex: scene.sceneIndex, lineIndex: i });
    }
    cursor += dur;
  }
  return lines;
}

/**
 * Build a teaser-style range around a hero line. Padding is asymmetric
 * (more after than before) so the hero beat lands inside the first 30%
 * of the cut — viewers see the punch immediately, not after wind-up.
 */
function teaserRange(
  heroFrame: number,
  totalFrames: number,
  cap: number,
  preFrames = 90,
  postFrames = 360,
): [number, number] {
  // Try to keep [start, start+cap] entirely inside the timeline.
  let start = Math.max(0, heroFrame - preFrames);
  let end = start + cap - 1;
  if (end >= totalFrames) {
    end = totalFrames - 1;
    start = Math.max(0, end - cap + 1);
  }
  // Re-tighten so we don't exceed the requested duration.
  if (end - start + 1 > cap) end = start + cap - 1;
  void postFrames; // postFrames is implicit via cap-preFrames.
  return [start, end];
}

/**
 * Pack N hero lines into one cut by emitting a small range per line
 * (each ~150 fr / 5 s) and capping the total assembled duration at
 * `cap`. Crossfade markers are implicit in the gap between ranges.
 */
function packHeroRanges(
  heroFrames: number[],
  totalFrames: number,
  cap: number,
): Array<[number, number]> {
  const PER_HERO = 150; // 5s window per hero
  const PRE = 45;
  const ranges: Array<[number, number]> = [];
  let used = 0;
  // Sort by frame ascending so the cut plays in chronological order.
  const sorted = [...heroFrames].sort((a, b) => a - b);
  for (const f of sorted) {
    if (used >= cap) break;
    const remaining = cap - used;
    const window = Math.min(PER_HERO, remaining);
    let start = Math.max(0, f - PRE);
    let end = start + window - 1;
    if (end >= totalFrames) {
      end = totalFrames - 1;
      start = Math.max(0, end - window + 1);
    }
    ranges.push([start, end]);
    used += end - start + 1;
  }
  return ranges;
}

export function planCuts(episode: CartoonEpisode): CutPlan[] {
  const total = Math.max(1, episode.totalDurationFrames);
  const scored = collectScoredLines(episode.scenes);

  // Highest-score lines first; tie-break by earliest frame for determinism.
  const ranked = [...scored].sort(
    (a, b) => b.score - a.score || a.frame - b.frame,
  );

  const heroes = ranked.filter((l) => l.score > 0.0);
  const top1 = heroes[0]?.frame ?? Math.floor(total / 2);
  const top2 = heroes.slice(0, 2).map((l) => l.frame);
  const top4PlusMoral = (() => {
    const moral = scored.find(
      (l) =>
        episode.scenes[l.sceneIndex]?.dialogue[l.lineIndex]?.context === 'moral',
    );
    const top4 = ranked.slice(0, 4).map((l) => l.frame);
    if (moral && !top4.includes(moral.frame)) top4.push(moral.frame);
    return top4;
  })();

  // 15s teaser: top hero ± padding, capped at 450 fr. Pre-pad small so
  // the hero beat falls in the first 30% of the cut.
  const teaser15: [number, number] = teaserRange(top1, total, FR_15S);

  // 30s hero: top 2 hero lines glued, ≤ 900 fr.
  const hero30 = packHeroRanges(top2.length ? top2 : [top1], total, FR_30S);

  // 60s trailer: top 4 hero lines + moral, ≤ 1800 fr.
  const trailer60 = packHeroRanges(
    top4PlusMoral.length ? top4PlusMoral : [top1],
    total,
    FR_60S,
  );

  // Full cut.
  const full: [number, number] = [0, total - 1];

  return [
    { name: '15s-teaser', frameRanges: [teaser15] },
    { name: '30s-hero', frameRanges: hero30 },
    { name: '60s-trailer', frameRanges: trailer60 },
    { name: 'full', frameRanges: [full] },
  ];
}
