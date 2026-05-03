import { describe, it, expect } from 'vitest';
import {
  planMusicLayers,
  MUSIC_INTENSITY_BY_MOOD,
} from '../../src/audio/cartoon-audio';
import type { EpisodeScene } from '../../src/types';

// Zimmer gap M1.4 — a single static -16 dB music layer for the whole
// episode flattens dynamic range. Calm hook and climactic well-trick
// sound the same. Zimmer scored this 3/10.
//
// Contract:
//   1. MUSIC_INTENSITY_BY_MOOD is exported and orders moods correctly:
//      peaceful (quietest) < setup < triumph < tense < climax (loudest).
//   2. planMusicLayers emits ONE music layer per scene at the mood's
//      volumeDb, anchored at sceneStartMs.
//   3. Mixed-mood episodes plan ≥2 distinct music volumeDb values.
//   4. Ducking stays on for every music layer.
//   5. All layers point at the same musicTrack file (the bed loops;
//      only the volume is automated).

function mkScene(idx: number, mood: string, location = 'forest'): EpisodeScene {
  return {
    sceneIndex: idx,
    actName: `act${idx}`,
    location: location as EpisodeScene['location'],
    timeOfDay: 'day',
    weather: 'clear',
    mood,
    characters: [],
    dialogue: [],
    sfxKeywords: [],
    cameraMovement: { type: 'static', intensity: 0 },
    durationFrames: 360,
  };
}

describe('Zimmer music intensity ramp (M1.4)', () => {
  describe('MUSIC_INTENSITY_BY_MOOD table', () => {
    it('peaceful is quieter than climax (negative dB ordering)', () => {
      expect(MUSIC_INTENSITY_BY_MOOD['peaceful']).toBeLessThan(
        MUSIC_INTENSITY_BY_MOOD['climax'],
      );
    });

    it('calm/setup are quietest (-22 dB), climax/epic loudest (-12 dB)', () => {
      expect(MUSIC_INTENSITY_BY_MOOD['peaceful']).toBe(-22);
      expect(MUSIC_INTENSITY_BY_MOOD['calm']).toBe(-22);
      expect(MUSIC_INTENSITY_BY_MOOD['setup']).toBe(-22);
      expect(MUSIC_INTENSITY_BY_MOOD['tense']).toBe(-16);
      expect(MUSIC_INTENSITY_BY_MOOD['suspense']).toBe(-16);
      expect(MUSIC_INTENSITY_BY_MOOD['climax']).toBe(-12);
      expect(MUSIC_INTENSITY_BY_MOOD['epic']).toBe(-12);
      expect(MUSIC_INTENSITY_BY_MOOD['triumph']).toBe(-14);
      expect(MUSIC_INTENSITY_BY_MOOD['moral']).toBe(-14);
    });
  });

  describe('planMusicLayers', () => {
    const track = {
      file: 'audio/music/peaceful.mp3',
      fadeInMs: 1000,
      fadeOutMs: 2000,
    };

    it('emits one music layer per scene', () => {
      const scenes = [
        mkScene(0, 'peaceful'),
        mkScene(1, 'tense'),
        mkScene(2, 'climax'),
      ];
      const layers = planMusicLayers(scenes, [0, 12_000, 24_000], track);
      expect(layers.length).toBe(3);
      expect(layers.every((l) => l.type === 'music')).toBe(true);
    });

    it('mixed-mood episode produces ≥2 distinct music volumeDb values', () => {
      const scenes = [
        mkScene(0, 'peaceful'),
        mkScene(1, 'tense'),
        mkScene(2, 'climax'),
        mkScene(3, 'triumph'),
      ];
      const layers = planMusicLayers(scenes, [0, 1, 2, 3], track);
      const distinct = new Set(layers.map((l) => l.volumeDb));
      expect(distinct.size).toBeGreaterThanOrEqual(2);
    });

    it('layer volumeDb matches MUSIC_INTENSITY_BY_MOOD per scene', () => {
      const scenes = [mkScene(0, 'peaceful'), mkScene(1, 'climax')];
      const layers = planMusicLayers(scenes, [0, 10_000], track);
      expect(layers[0].volumeDb).toBe(MUSIC_INTENSITY_BY_MOOD['peaceful']);
      expect(layers[1].volumeDb).toBe(MUSIC_INTENSITY_BY_MOOD['climax']);
    });

    it('startMs anchors to each scene start (not always 0)', () => {
      const scenes = [mkScene(0, 'peaceful'), mkScene(1, 'climax')];
      const layers = planMusicLayers(scenes, [0, 10_000], track);
      expect(layers[0].startMs).toBe(0);
      expect(layers[1].startMs).toBe(10_000);
    });

    it('every layer keeps duckDuringDialogue=true', () => {
      const scenes = [mkScene(0, 'peaceful'), mkScene(1, 'climax')];
      const layers = planMusicLayers(scenes, [0, 10_000], track);
      for (const l of layers) expect(l.duckDuringDialogue).toBe(true);
    });

    it('all layers reference the same music file (bed loops, only volume automates)', () => {
      const scenes = [
        mkScene(0, 'peaceful'),
        mkScene(1, 'tense'),
        mkScene(2, 'climax'),
      ];
      const layers = planMusicLayers(scenes, [0, 1, 2], track);
      const distinctFiles = new Set(layers.map((l) => l.filePath));
      expect(distinctFiles.size).toBe(1);
    });

    it('unknown mood falls back to default -16 dB (no NaN, no crash)', () => {
      const layers = planMusicLayers([mkScene(0, 'banana_mood')], [0], track);
      expect(layers[0].volumeDb).toBe(-16);
    });

    it('only the FIRST layer carries fadeIn (no per-scene re-fade); only LAST carries fadeOut', () => {
      const scenes = [
        mkScene(0, 'peaceful'),
        mkScene(1, 'tense'),
        mkScene(2, 'climax'),
      ];
      const layers = planMusicLayers(scenes, [0, 1, 2], track);
      expect(layers[0].fadeInMs).toBe(1000);
      expect(layers[1].fadeInMs ?? 0).toBe(0);
      expect(layers[2].fadeInMs ?? 0).toBe(0);
      expect(layers[0].fadeOutMs ?? 0).toBe(0);
      expect(layers[1].fadeOutMs ?? 0).toBe(0);
      expect(layers[2].fadeOutMs).toBe(2000);
    });
  });
});
