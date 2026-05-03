import { describe, it, expect } from 'vitest';
import { planAmbienceLayers } from '../../src/audio/cartoon-audio';
import type { EpisodeScene } from '../../src/types';

// Miyazaki gap: per-scene ambience override (cave vs forest mid-episode)
// was being silently dropped. The audio pipeline used a single global
// ambience layer keyed off `episode.scenes[0].location`.
//
// Contract: planAmbienceLayers must emit one ambience layer per
// consecutive scene-location segment, anchored at that segment's
// startMs. An episode with ≥2 distinct locations therefore produces
// ≥2 ambience layers in the plan.

function mkScene(idx: number, location: EpisodeScene['location']): EpisodeScene {
  return {
    sceneIndex: idx,
    actName: `act${idx}`,
    location,
    timeOfDay: 'day',
    weather: 'clear',
    mood: 'peaceful',
    characters: [],
    dialogue: [],
    sfxKeywords: [],
    cameraMovement: { type: 'static', intensity: 0 },
    durationFrames: 360,
  };
}

describe('Miyazaki ambience wired per-scene (location override honoured)', () => {
  it('episode with 1 distinct location yields 1 ambience layer', () => {
    const scenes = [mkScene(0, 'forest'), mkScene(1, 'forest')];
    const layers = planAmbienceLayers(scenes, [0, 12_000]);
    expect(layers.length).toBe(1);
    expect(layers[0].type).toBe('ambience');
    expect(layers[0].startMs).toBe(0);
    expect(layers[0].filePath).toContain('forest');
  });

  it('episode with 2 distinct locations yields 2 ambience layers (per-scene override honoured)', () => {
    const scenes = [mkScene(0, 'forest'), mkScene(1, 'cave')];
    const layers = planAmbienceLayers(scenes, [0, 12_000]);
    expect(layers.length).toBeGreaterThanOrEqual(2);
    const paths = layers.map((l) => l.filePath).join('|');
    expect(paths).toMatch(/forest/);
    expect(paths).toMatch(/cave/);
    // Second ambience must start at the second scene's startMs.
    const caveLayer = layers.find((l) => l.filePath.includes('cave'));
    expect(caveLayer!.startMs).toBe(12_000);
  });

  it('consecutive same-location scenes share a single layer (no redundant overlap)', () => {
    const scenes = [
      mkScene(0, 'forest'),
      mkScene(1, 'forest'),
      mkScene(2, 'cave'),
      mkScene(3, 'cave'),
      mkScene(4, 'forest'),
    ];
    const layers = planAmbienceLayers(scenes, [0, 12_000, 24_000, 36_000, 48_000]);
    // 3 segments: forest, cave, forest
    expect(layers.length).toBe(3);
    expect(layers[0].filePath).toContain('forest');
    expect(layers[0].startMs).toBe(0);
    expect(layers[1].filePath).toContain('cave');
    expect(layers[1].startMs).toBe(24_000);
    expect(layers[2].filePath).toContain('forest');
    expect(layers[2].startMs).toBe(48_000);
  });

  it('every emitted layer carries the ambience volumeDb from AMBIENCE_MAP', () => {
    const scenes = [mkScene(0, 'palace'), mkScene(1, 'market')];
    const layers = planAmbienceLayers(scenes, [0, 10_000]);
    for (const l of layers) {
      expect(l.type).toBe('ambience');
      // Ambience is intentionally low — never louder than -16 dB.
      expect(l.volumeDb).toBeLessThanOrEqual(-16);
    }
  });
});
