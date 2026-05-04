// M20: Hook Redesign — rabbit terror first, not title card
import { describe, it, expect } from 'vitest';
import { LION_RABBIT_SCENES } from '../../src/compositions/episode1/scenes-lion-rabbit';

describe('M20: Hook Redesign — in-medias-res visceral opening', () => {
  it('Hook scene 0 must have arjun (rabbit) as first visible character, not kaaliya', () => {
    const hookScene = LION_RABBIT_SCENES[0];
    expect(hookScene.id).toMatch(/hook/i);
    expect(hookScene.chars.length).toBeGreaterThan(0);
    expect(hookScene.chars[0].id).toBe('arjun');
  });

  it('First scene (terror stinger) must be visual-only OR dialogue ≤ 35 frames', () => {
    const terrorScene = LION_RABBIT_SCENES[0];
    expect(terrorScene.id).toMatch(/hook.*terror/i);
    
    if (terrorScene.dialogue.length > 0) {
      const firstLine = terrorScene.dialogue[0];
      if (typeof firstLine.dur === 'number') {
        expect(firstLine.dur).toBeLessThanOrEqual(35);
      }
      // Empty text is OK for visual-only stinger
      if (firstLine.text === '') {
        expect(firstLine.textOverlay).toBeDefined();
      }
    }
  });

  it('Hook total span (terror + villain + title) must be ≤ 120 frames (~4s)', () => {
    // Find hook-related scenes (terror, villain, title)
    const hookScenes = LION_RABBIT_SCENES.filter(s => s.id.startsWith('hook'));
    expect(hookScenes.length).toBeGreaterThanOrEqual(3);
    
    // Calculate total frames (simplified: sum explicit dur values)
    let totalFrames = 0;
    hookScenes.forEach(scene => {
      scene.dialogue.forEach(line => {
        if (typeof line.dur === 'number') {
          totalFrames += line.dur;
        } else {
          // Estimate 'auto' at 60 frames max (conservative)
          totalFrames += 60;
        }
      });
    });
    
    expect(totalFrames).toBeLessThanOrEqual(120);
  });

  it('Villain threat scene must come AFTER terror reaction (order check)', () => {
    const terrorIdx = LION_RABBIT_SCENES.findIndex(s => s.id.match(/hook.*terror/i));
    const villainIdx = LION_RABBIT_SCENES.findIndex(s => s.id.match(/hook.*villain/i));
    
    expect(terrorIdx).toBeGreaterThanOrEqual(0);
    expect(villainIdx).toBeGreaterThan(terrorIdx);
  });

  it('Title card scene must have textOverlay matching /शेर.*खरगोश/', () => {
    const titleScene = LION_RABBIT_SCENES.find(s => s.id.match(/hook.*title/i));
    expect(titleScene).toBeDefined();
    expect(titleScene!.dialogue.length).toBeGreaterThan(0);
    
    const hasCorrectOverlay = titleScene!.dialogue.some(line => 
      line.textOverlay && /शेर.*खरगोश/.test(line.textOverlay)
    );
    expect(hasCorrectOverlay).toBe(true);
  });

  it('Terror scene must use scared or shocked expression for rabbit', () => {
    const terrorScene = LION_RABBIT_SCENES[0];
    expect(terrorScene.id).toMatch(/hook.*terror/i);
    
    const rabbitChar = terrorScene.chars.find(c => c.id === 'arjun');
    expect(rabbitChar).toBeDefined();
    expect(['scared', 'surprised']).toContain(rabbitChar!.expr);
  });

  it('Terror scene should have close_up camera for visceral impact', () => {
    const terrorScene = LION_RABBIT_SCENES[0];
    expect(terrorScene.cam).toBe('close_up');
    expect(terrorScene.camI).toBeGreaterThanOrEqual(0.8);
  });

  it('Determinism: scene structure must be reproducible', () => {
    // Snapshot the first 4 scenes (hook variants + curiosity gap)
    const hookStructure = LION_RABBIT_SCENES.slice(0, 4).map(s => ({
      id: s.id,
      charIds: s.chars.map(c => c.id),
      dialogueCount: s.dialogue.length,
      cam: s.cam,
    }));

    // This should be stable across runs (no random elements)
    expect(hookStructure).toMatchInlineSnapshot(`
      [
        {
          "cam": "close_up",
          "charIds": [
            "arjun",
          ],
          "dialogueCount": 1,
          "id": "hook-terror",
        },
        {
          "cam": "close_up",
          "charIds": [
            "kaaliya",
          ],
          "dialogueCount": 1,
          "id": "hook-villain",
        },
        {
          "cam": "static",
          "charIds": [],
          "dialogueCount": 1,
          "id": "hook-title",
        },
        {
          "cam": "zoom_in",
          "charIds": [
            "arjun",
          ],
          "dialogueCount": 1,
          "id": "curiosity-gap",
        },
      ]
    `);
  });
});
