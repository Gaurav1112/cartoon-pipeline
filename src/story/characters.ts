import type { CharacterId, CharacterProfile, AnimalSkin, AnimalSkinConfig, CharacterArchetype } from '../types';

export const CHARACTERS: Record<CharacterId, CharacterProfile> = {
  arjun: {
    id: 'arjun',
    name: 'Arjun',
    archetype: 'hero_child',
    description: 'Brave boy, orange outfit, confident pose. Natural leader who stands up for friends.',
    colors: { primary: '#FF8C00', secondary: '#FFD700', accent: '#8B4513', skin: '#D2A679' },
    voiceProfile: { pitchShift: 3, speedFactor: 1.1, eqProfile: 'none', volume: 0.85 },
  },
  meera: {
    id: 'meera',
    name: 'Meera',
    archetype: 'smart_girl',
    description: 'Clever girl, blue outfit, book in hand. Solves problems with wit and knowledge.',
    colors: { primary: '#4169E1', secondary: '#87CEEB', accent: '#FFD700', skin: '#C8A882' },
    voiceProfile: { pitchShift: 2, speedFactor: 1.15, eqProfile: 'none', volume: 0.8 },
  },
  bablu: {
    id: 'bablu',
    name: 'Bablu',
    archetype: 'comic_sidekick',
    description: 'Round, always eating, comic relief. Stumbles into trouble but has a good heart.',
    colors: { primary: '#32CD32', secondary: '#ADFF2F', accent: '#FF6347', skin: '#D2B48C' },
    voiceProfile: { pitchShift: 5, speedFactor: 1.3, eqProfile: 'nasal', volume: 0.9 },
  },
  guruji: {
    id: 'guruji',
    name: 'Guruji',
    archetype: 'wise_elder',
    description: 'White beard, staff, calm demeanor. Dispenses wisdom through parables and proverbs.',
    colors: { primary: '#F5F5DC', secondary: '#DAA520', accent: '#8B0000', skin: '#C4A37A' },
    voiceProfile: { pitchShift: -2, speedFactor: 0.85, eqProfile: 'warm', volume: 0.75 },
  },
  kaaliya: {
    id: 'kaaliya',
    name: 'Kaaliya',
    archetype: 'villain',
    description: 'Dark outfit, sharp features, menacing. Cunning antagonist who learns lessons the hard way.',
    colors: { primary: '#2F0040', secondary: '#8B008B', accent: '#FF0000', skin: '#B89A6B' },
    voiceProfile: { pitchShift: -4, speedFactor: 0.9, eqProfile: 'reverb', volume: 0.85 },
  },
  amma: {
    id: 'amma',
    name: 'Amma',
    archetype: 'mother',
    description: 'Sari, warm smile, gentle. The emotional anchor who cares for everyone.',
    colors: { primary: '#FF69B4', secondary: '#FFB6C1', accent: '#FFD700', skin: '#C8A882' },
    voiceProfile: { pitchShift: -1, speedFactor: 0.95, eqProfile: 'warm', volume: 0.7 },
  },
  raja: {
    id: 'raja',
    name: 'Raja',
    archetype: 'king',
    description: 'Crown, royal robes, commanding. Authority figure who must make fair decisions.',
    colors: { primary: '#FFD700', secondary: '#B22222', accent: '#FFFFFF', skin: '#C4A37A' },
    voiceProfile: { pitchShift: 0, speedFactor: 1.0, eqProfile: 'none', volume: 0.85 },
  },
  moti: {
    id: 'moti',
    name: 'Moti',
    archetype: 'animal',
    description: 'Animal companion base rig. Changes appearance based on story via skins.',
    colors: { primary: '#A0522D', secondary: '#DEB887', accent: '#000000', skin: '#D2B48C' },
    voiceProfile: { pitchShift: 4, speedFactor: 1.2, eqProfile: 'nasal', volume: 0.8 },
  },
};

export const ANIMAL_SKINS: Record<AnimalSkin, AnimalSkinConfig> = {
  fox: {
    id: 'fox', name: 'Fox',
    bodyColor: '#D2691E', headShape: 'pointed', earType: 'pointed',
    tailType: 'bushy', specialFeatures: ['white_chest', 'black_paws'], scale: 0.9,
  },
  crow: {
    id: 'crow', name: 'Crow',
    bodyColor: '#1C1C1C', headShape: 'round', earType: 'none',
    tailType: 'short', specialFeatures: ['beak', 'wings'], scale: 0.7,
  },
  lion: {
    id: 'lion', name: 'Lion',
    bodyColor: '#DAA520', headShape: 'wide', earType: 'round',
    tailType: 'long', specialFeatures: ['mane', 'big_paws'], scale: 1.3,
  },
  rabbit: {
    id: 'rabbit', name: 'Rabbit',
    bodyColor: '#F5F5DC', headShape: 'round', earType: 'long',
    tailType: 'short', specialFeatures: ['big_eyes', 'buck_teeth'], scale: 0.6,
  },
  turtle: {
    id: 'turtle', name: 'Turtle',
    bodyColor: '#556B2F', headShape: 'round', earType: 'none',
    tailType: 'short', specialFeatures: ['shell', 'slow_blink'], scale: 0.5,
  },
  monkey: {
    id: 'monkey', name: 'Monkey',
    bodyColor: '#8B4513', headShape: 'round', earType: 'round',
    tailType: 'long', specialFeatures: ['curled_tail', 'expressive_face'], scale: 0.8,
  },
  elephant: {
    id: 'elephant', name: 'Elephant',
    bodyColor: '#808080', headShape: 'wide', earType: 'round',
    tailType: 'thin', specialFeatures: ['trunk', 'tusks', 'big_ears'], scale: 1.5,
  },
  mouse: {
    id: 'mouse', name: 'Mouse',
    bodyColor: '#A9A9A9', headShape: 'pointed', earType: 'round',
    tailType: 'thin', specialFeatures: ['whiskers', 'tiny_eyes'], scale: 0.3,
  },
  snake: {
    id: 'snake', name: 'Snake',
    bodyColor: '#006400', headShape: 'pointed', earType: 'none',
    tailType: 'none', specialFeatures: ['forked_tongue', 'scales', 'no_limbs'], scale: 0.8,
  },
  deer: {
    id: 'deer', name: 'Deer',
    bodyColor: '#CD853F', headShape: 'long', earType: 'pointed',
    tailType: 'short', specialFeatures: ['antlers', 'white_spots'], scale: 1.0,
  },
};

export const CHARACTER_IDS: CharacterId[] = [
  'arjun', 'meera', 'bablu', 'guruji', 'kaaliya', 'amma', 'raja', 'moti',
];

export const ARCHETYPE_TO_CHARACTER: Record<CharacterArchetype, CharacterId> = {
  hero_child: 'arjun',
  smart_girl: 'meera',
  comic_sidekick: 'bablu',
  wise_elder: 'guruji',
  villain: 'kaaliya',
  mother: 'amma',
  king: 'raja',
  animal: 'moti',
};

export function getCharacter(id: CharacterId): CharacterProfile {
  return CHARACTERS[id];
}

export function getCharacterByArchetype(archetype: CharacterArchetype): CharacterProfile {
  return CHARACTERS[ARCHETYPE_TO_CHARACTER[archetype]];
}

export function getAnimalSkin(skin: AnimalSkin): AnimalSkinConfig {
  return ANIMAL_SKINS[skin];
}
