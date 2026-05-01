import type { CharacterId, CharacterProfile, AnimalSkin, AnimalSkinConfig, CharacterArchetype } from '../types';

export const CHARACTERS: Record<CharacterId, CharacterProfile> = {
  arjun: {
    id: 'arjun',
    name: 'Arjun',
    archetype: 'hero_child',
    description: 'Brave boy, orange outfit, confident pose. Natural leader who stands up for friends.',
    colors: { primary: '#E07B38', secondary: '#F2C94C', accent: '#6B4226', skin: '#C99B6D' },
    voiceProfile: { pitchShift: 3, speedFactor: 1.1, eqProfile: 'none', volume: 0.85 },
  },
  meera: {
    id: 'meera',
    name: 'Meera',
    archetype: 'smart_girl',
    description: 'Clever girl, blue outfit, book in hand. Solves problems with wit and knowledge.',
    colors: { primary: '#3B6BA5', secondary: '#7EB8D8', accent: '#C4943A', skin: '#C49A78' },
    voiceProfile: { pitchShift: 2, speedFactor: 1.15, eqProfile: 'none', volume: 0.8 },
  },
  bablu: {
    id: 'bablu',
    name: 'Bablu',
    archetype: 'comic_sidekick',
    description: 'Round, always eating, comic relief. Stumbles into trouble but has a good heart.',
    colors: { primary: '#6BAF5A', secondary: '#A8D86E', accent: '#8B4513', skin: '#C4A07A' },
    voiceProfile: { pitchShift: 5, speedFactor: 1.3, eqProfile: 'nasal', volume: 0.9 },
  },
  guruji: {
    id: 'guruji',
    name: 'Guruji',
    archetype: 'wise_elder',
    description: 'White beard, staff, calm demeanor. Dispenses wisdom through parables and proverbs.',
    colors: { primary: '#EDE4D0', secondary: '#C4943A', accent: '#5C1A2D', skin: '#BA956A' },
    voiceProfile: { pitchShift: -2, speedFactor: 0.85, eqProfile: 'warm', volume: 0.75 },
  },
  kaaliya: {
    id: 'kaaliya',
    name: 'Kaaliya',
    archetype: 'villain',
    description: 'Dark outfit, sharp features, menacing. Cunning antagonist who learns lessons the hard way.',
    colors: { primary: '#1E0A2E', secondary: '#6B3A7D', accent: '#9B6BAF', skin: '#B08E66' },
    voiceProfile: { pitchShift: -4, speedFactor: 0.9, eqProfile: 'reverb', volume: 0.85 },
  },
  amma: {
    id: 'amma',
    name: 'Amma',
    archetype: 'mother',
    description: 'Sari, warm smile, gentle. The emotional anchor who cares for everyone.',
    colors: { primary: '#C75B7A', secondary: '#E8A87C', accent: '#C4943A', skin: '#C49A78' },
    voiceProfile: { pitchShift: -1, speedFactor: 0.95, eqProfile: 'warm', volume: 0.7 },
  },
  raja: {
    id: 'raja',
    name: 'Raja',
    archetype: 'king',
    description: 'Crown, royal robes, commanding. Authority figure who must make fair decisions.',
    colors: { primary: '#8B2942', secondary: '#D4A843', accent: '#E8C876', skin: '#BA956A' },
    voiceProfile: { pitchShift: 0, speedFactor: 1.0, eqProfile: 'none', volume: 0.85 },
  },
  moti: {
    id: 'moti',
    name: 'Moti',
    archetype: 'animal',
    description: 'Animal companion base rig. Changes appearance based on story via skins.',
    colors: { primary: '#8B6240', secondary: '#D4B896', accent: '#5C3D28', skin: '#A87B5A' },
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
