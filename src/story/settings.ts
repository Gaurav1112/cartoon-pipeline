import type { LocationSetting, LocationType } from '../types';

export const LOCATIONS: LocationSetting[] = [
  { id: 'forest', name: 'Dense Forest', description: 'Tall trees, dappled sunlight, winding path', ambienceType: 'forest', defaultProps: ['tree', 'bush', 'mushroom', 'butterfly'], mood: 'mysterious' },
  { id: 'village', name: 'Village Square', description: 'Mud huts, well, banyan tree, dusty road', ambienceType: 'village', defaultProps: ['hut', 'well', 'cart', 'pot'], mood: 'warm' },
  { id: 'palace', name: 'Royal Palace', description: 'Grand columns, red carpet, golden throne', ambienceType: 'palace', defaultProps: ['pillar', 'throne', 'chandelier', 'guard'], mood: 'grand' },
  { id: 'river', name: 'River Bank', description: 'Flowing river, sandy bank, stepping stones', ambienceType: 'river', defaultProps: ['boat', 'reed', 'fish', 'rock'], mood: 'peaceful' },
  { id: 'market', name: 'Busy Market', description: 'Colorful stalls, vendors, piled goods', ambienceType: 'market', defaultProps: ['stall', 'basket', 'cloth', 'fruit'], mood: 'lively' },
  { id: 'temple', name: 'Ancient Temple', description: 'Carved pillars, oil lamps, bell tower', ambienceType: 'temple', defaultProps: ['lamp', 'bell', 'flower', 'statue'], mood: 'sacred' },
  { id: 'school', name: 'Gurukul School', description: 'Open-air classroom under a tree, slate boards', ambienceType: 'village', defaultProps: ['mat', 'slate', 'book', 'chalk'], mood: 'studious' },
  { id: 'cave', name: 'Dark Cave', description: 'Rocky entrance, dripping water, glowing crystals', ambienceType: 'cave', defaultProps: ['stalactite', 'crystal', 'bat', 'torch'], mood: 'scary' },
  { id: 'mountain', name: 'Mountain Peak', description: 'Rocky summit, clouds below, eagles soaring', ambienceType: 'mountain', defaultProps: ['rock', 'cloud', 'eagle', 'flag'], mood: 'epic' },
  { id: 'garden', name: 'Palace Garden', description: 'Manicured hedges, fountains, flower beds', ambienceType: 'garden', defaultProps: ['fountain', 'hedge', 'flower', 'bench'], mood: 'romantic' },
  { id: 'beach', name: 'Sandy Beach', description: 'Golden sand, rolling waves, coconut palms', ambienceType: 'beach', defaultProps: ['palm', 'shell', 'crab', 'boat'], mood: 'relaxed' },
  { id: 'desert', name: 'Sandy Desert', description: 'Vast dunes, scorching sun, lone cactus', ambienceType: 'desert', defaultProps: ['dune', 'cactus', 'camel', 'mirage'], mood: 'harsh' },
  { id: 'farm', name: 'Green Farm', description: 'Crop fields, scarecrow, wooden fence', ambienceType: 'village', defaultProps: ['fence', 'scarecrow', 'crop', 'cow'], mood: 'pastoral' },
  { id: 'bridge', name: 'Stone Bridge', description: 'Arched stone bridge over a gorge', ambienceType: 'river', defaultProps: ['arch', 'rail', 'moss', 'stone'], mood: 'tense' },
  { id: 'waterfall', name: 'Majestic Waterfall', description: 'Cascading water, rainbow mist, mossy rocks', ambienceType: 'river', defaultProps: ['waterfall', 'mist', 'moss', 'pool'], mood: 'awe' },
  { id: 'fort', name: 'Ancient Fort', description: 'Tall ramparts, watchtower, iron gate', ambienceType: 'palace', defaultProps: ['wall', 'tower', 'gate', 'cannon'], mood: 'heroic' },
  { id: 'library', name: 'Royal Library', description: 'Stacked scrolls, candlelight, wooden shelves', ambienceType: 'palace', defaultProps: ['scroll', 'candle', 'shelf', 'globe'], mood: 'studious' },
  { id: 'kitchen', name: 'Village Kitchen', description: 'Clay stove, brass pots, spice jars', ambienceType: 'village', defaultProps: ['stove', 'pot', 'spice', 'ladle'], mood: 'warm' },
  { id: 'courtyard', name: 'Palace Courtyard', description: 'Open courtyard, central fountain, arched corridors', ambienceType: 'palace', defaultProps: ['fountain', 'arch', 'guard', 'banner'], mood: 'grand' },
  { id: 'pond', name: 'Lotus Pond', description: 'Still water, lotus flowers, dragonflies', ambienceType: 'garden', defaultProps: ['lotus', 'lily_pad', 'dragonfly', 'frog'], mood: 'peaceful' },
  { id: 'road', name: 'Dusty Road', description: 'Winding dirt path between fields', ambienceType: 'village', defaultProps: ['milestone', 'tree', 'cart_track', 'bird'], mood: 'adventurous' },
  { id: 'hilltop', name: 'Windy Hilltop', description: 'Grassy hill, panoramic view, lone tree', ambienceType: 'mountain', defaultProps: ['grass', 'rock', 'tree', 'bird'], mood: 'reflective' },
  { id: 'harbor', name: 'Trading Harbor', description: 'Wooden docks, anchored ships, crates', ambienceType: 'beach', defaultProps: ['dock', 'ship', 'crate', 'rope'], mood: 'busy' },
  { id: 'ruins', name: 'Forgotten Ruins', description: 'Crumbling walls, overgrown vines, broken statues', ambienceType: 'cave', defaultProps: ['broken_pillar', 'vine', 'statue', 'rubble'], mood: 'mysterious' },
  { id: 'treehouse', name: 'Treehouse Hideout', description: 'Wooden platform in a banyan tree, rope ladder', ambienceType: 'forest', defaultProps: ['platform', 'ladder', 'lantern', 'leaf'], mood: 'playful' },
  { id: 'well', name: 'Village Well', description: 'Stone well, wooden bucket, pulley', ambienceType: 'village', defaultProps: ['well', 'bucket', 'rope', 'stone'], mood: 'communal' },
  { id: 'battlefield', name: 'Open Battlefield', description: 'Trampled ground, scattered flags, dust clouds', ambienceType: 'desert', defaultProps: ['flag', 'spear', 'shield', 'dust'], mood: 'intense' },
  { id: 'shrine', name: 'Forest Shrine', description: 'Small stone shrine, garlands, incense', ambienceType: 'temple', defaultProps: ['shrine', 'garland', 'incense', 'offering'], mood: 'sacred' },
  { id: 'swamp', name: 'Murky Swamp', description: 'Stagnant water, twisted trees, fog', ambienceType: 'cave', defaultProps: ['mud', 'dead_tree', 'fog', 'insect'], mood: 'eerie' },
  { id: 'meadow', name: 'Flower Meadow', description: 'Open field with wildflowers, gentle breeze', ambienceType: 'garden', defaultProps: ['wildflower', 'grass', 'butterfly', 'stream'], mood: 'joyful' },
];

export function getLocation(id: LocationType): LocationSetting {
  return LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0];
}

export function getLocationsByMood(mood: string): LocationSetting[] {
  return LOCATIONS.filter((l) => l.mood === mood);
}
