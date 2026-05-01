export interface AmbienceConfig {
  locationType: string;
  filePath: string;
  description: string;
  volumeDb: number;
  layers: string[];
}

const AMBIENCE_MAP: Record<string, AmbienceConfig> = {
  forest: {
    locationType: 'forest',
    filePath: 'audio/ambience/forest.mp3',
    description: 'Birds chirping, rustling leaves, distant woodpecker',
    volumeDb: -20,
    layers: ['birds_chirp', 'rustling_leaves', 'light_wind'],
  },
  village: {
    locationType: 'village',
    filePath: 'audio/ambience/village.mp3',
    description: 'Distant voices, dogs barking, temple bells',
    volumeDb: -22,
    layers: ['distant_chatter', 'dog_bark', 'bell_ring'],
  },
  palace: {
    locationType: 'palace',
    filePath: 'audio/ambience/palace.mp3',
    description: 'Echoing halls, fountain, distant footsteps',
    volumeDb: -24,
    layers: ['hall_reverb', 'fountain', 'footsteps_marble'],
  },
  river: {
    locationType: 'river',
    filePath: 'audio/ambience/river.mp3',
    description: 'Flowing water, frogs, gentle breeze',
    volumeDb: -20,
    layers: ['water_flow', 'frog_ribbit', 'breeze'],
  },
  market: {
    locationType: 'market',
    filePath: 'audio/ambience/market.mp3',
    description: 'Crowd chatter, vendors calling, cart wheels',
    volumeDb: -18,
    layers: ['crowd_murmur', 'vendor_calls', 'cart_wheels'],
  },
  temple: {
    locationType: 'temple',
    filePath: 'audio/ambience/temple.mp3',
    description: 'Temple bells, soft chanting, incense crackle',
    volumeDb: -24,
    layers: ['temple_bells', 'chanting', 'fire_crackle'],
  },
  cave: {
    locationType: 'cave',
    filePath: 'audio/ambience/cave.mp3',
    description: 'Dripping water, echo, distant wind',
    volumeDb: -22,
    layers: ['water_drip', 'cave_echo', 'wind_howl'],
  },
  mountain: {
    locationType: 'mountain',
    filePath: 'audio/ambience/mountain.mp3',
    description: 'Strong wind, eagles, distant thunder',
    volumeDb: -20,
    layers: ['strong_wind', 'eagle_cry', 'rumble'],
  },
  garden: {
    locationType: 'garden',
    filePath: 'audio/ambience/garden.mp3',
    description: 'Birds singing, wind chimes, fountain',
    volumeDb: -22,
    layers: ['bird_song', 'wind_chimes', 'fountain'],
  },
  beach: {
    locationType: 'beach',
    filePath: 'audio/ambience/beach.mp3',
    description: 'Ocean waves, seagulls, gentle wind',
    volumeDb: -20,
    layers: ['ocean_waves', 'seagull_calls', 'beach_wind'],
  },
  desert: {
    locationType: 'desert',
    filePath: 'audio/ambience/desert.mp3',
    description: 'Hot wind, sand shifting, distant hawk',
    volumeDb: -22,
    layers: ['desert_wind', 'sand_shift', 'hawk_cry'],
  },
};

export function getAmbienceLoop(locationType: string): AmbienceConfig {
  return AMBIENCE_MAP[locationType] ?? AMBIENCE_MAP['forest'];
}

export { AMBIENCE_MAP };
