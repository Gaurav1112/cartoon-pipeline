// src/audio/character-signatures.ts
//
// M7 — Peppa/Bheem creature-voice signature layer.
//
// Each character gets a tiny non-melodic vocal "thumbprint" (a snort,
// a hum, a yip) that fires ~250ms BEFORE their first line in every
// scene. Different from the Zimmer leitmotif (which is a musical
// stinger fired only on first line of the EPISODE). The two layers
// stack: motif = brand theme, signature = creature voice.
//
// All sounds are deterministic — synthesized in scripts/generate-sfx.mjs
// and committed under public/audio/sfx/characters/.

import type { CharacterId } from '../types';
import path from 'node:path';

export interface CharacterSignatureEntry {
  /** Path under public/audio (e.g. "sfx/characters/arjun_whistle.mp3"). */
  sfxFile: string;
  /** Short description for catalog/debug logs. */
  description: string;
}

export const CHARACTER_SIGNATURE_SFX: Record<CharacterId, CharacterSignatureEntry> = {
  arjun:   { sfxFile: 'sfx/characters/arjun_whistle.mp3',  description: 'cheery upward whistle (smart hero boy)' },
  meera:   { sfxFile: 'sfx/characters/meera_coo.mp3',      description: 'gentle dove-coo (kind sister)' },
  bablu:   { sfxFile: 'sfx/characters/bablu_snort.mp3',    description: 'comedic snort + thud (clumsy bull)' },
  guruji:  { sfxFile: 'sfx/characters/guruji_hum.mp3',     description: 'warm bell-hum (wise sage)' },
  kaaliya: { sfxFile: 'sfx/characters/kaaliya_cackle.mp3', description: 'low villain cackle' },
  amma:    { sfxFile: 'sfx/characters/amma_chime.mp3',     description: 'soft motherly chime pair' },
  raja:    { sfxFile: 'sfx/characters/raja_grunt.mp3',     description: 'regal lion grunt' },
  moti:    { sfxFile: 'sfx/characters/moti_yip.mp3',       description: 'bright dog yip' },
};

/** Lead-in: signature fires this many ms BEFORE the dialogue line. */
export const SIGNATURE_LEAD_MS = 250;
/** Mix volume — well under dialogue, audible enough to register. */
export const SIGNATURE_VOLUME_DB = -14;
/** Ducked further during overlapping dialogue. */
export const SIGNATURE_DUCKED_DB = -22;

export interface SignatureSchedulingScene {
  sceneIndex: number;
  dialogue: { characterId: CharacterId; startMs: number; durationMs: number }[];
}

export interface PlannedSignatureLayer {
  type: 'sfx';
  filePath: string;
  startMs: number;
  volumeDb: number;
  duckDuringDialogue: true;
  duckedVolumeDb: number;
  /** For debug/inspection. */
  characterId: CharacterId;
  sceneIndex: number;
}

/**
 * Plan one signature SFX layer per (scene, character first-appearance).
 * Deterministic: ordering follows scene index, then dialogue index.
 */
export function planCharacterSignatureLayers(
  scenes: SignatureSchedulingScene[],
): PlannedSignatureLayer[] {
  const layers: PlannedSignatureLayer[] = [];
  for (const scene of scenes) {
    const seenInScene = new Set<CharacterId>();
    for (const line of scene.dialogue) {
      if (seenInScene.has(line.characterId)) continue;
      seenInScene.add(line.characterId);
      const entry = CHARACTER_SIGNATURE_SFX[line.characterId];
      if (!entry) continue;
      layers.push({
        type: 'sfx',
        filePath: path.join('public', 'audio', entry.sfxFile),
        startMs: Math.max(0, line.startMs - SIGNATURE_LEAD_MS),
        volumeDb: SIGNATURE_VOLUME_DB,
        duckDuringDialogue: true,
        duckedVolumeDb: SIGNATURE_DUCKED_DB,
        characterId: line.characterId,
        sceneIndex: scene.sceneIndex,
      });
    }
  }
  return layers;
}
