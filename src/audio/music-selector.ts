import type { MusicTrack } from '../types';

const MUSIC_TRACKS: Record<string, MusicTrack> = {
  happy: {
    file: 'audio/music/happy_playful.mp3',
    mood: 'happy',
    bpm: 120,
    loopable: true,
    fadeInMs: 1000,
    fadeOutMs: 2000,
  },
  sad: {
    file: 'audio/music/sad_gentle.mp3',
    mood: 'sad',
    bpm: 72,
    loopable: true,
    fadeInMs: 2000,
    fadeOutMs: 3000,
  },
  tense: {
    file: 'audio/music/tense_suspense.mp3',
    mood: 'tense',
    bpm: 90,
    loopable: true,
    fadeInMs: 500,
    fadeOutMs: 1500,
  },
  mysterious: {
    file: 'audio/music/mysterious_ambient.mp3',
    mood: 'mysterious',
    bpm: 80,
    loopable: true,
    fadeInMs: 2000,
    fadeOutMs: 2000,
  },
  heroic: {
    file: 'audio/music/heroic_triumphant.mp3',
    mood: 'heroic',
    bpm: 130,
    loopable: true,
    fadeInMs: 500,
    fadeOutMs: 2000,
  },
  peaceful: {
    file: 'audio/music/peaceful_calm.mp3',
    mood: 'peaceful',
    bpm: 65,
    loopable: true,
    fadeInMs: 3000,
    fadeOutMs: 3000,
  },
  scary: {
    file: 'audio/music/scary_dark.mp3',
    mood: 'scary',
    bpm: 70,
    loopable: true,
    fadeInMs: 1000,
    fadeOutMs: 2000,
  },
  comedic: {
    file: 'audio/music/comedic_fun.mp3',
    mood: 'comedic',
    bpm: 140,
    loopable: true,
    fadeInMs: 500,
    fadeOutMs: 1000,
  },
  romantic: {
    file: 'audio/music/romantic_warm.mp3',
    mood: 'romantic',
    bpm: 85,
    loopable: true,
    fadeInMs: 2000,
    fadeOutMs: 3000,
  },
  epic: {
    file: 'audio/music/epic_grand.mp3',
    mood: 'epic',
    bpm: 110,
    loopable: true,
    fadeInMs: 1000,
    fadeOutMs: 3000,
  },
};

// Map scene moods to music moods
const MOOD_MAPPING: Record<string, string> = {
  warm: 'happy',
  tense: 'tense',
  hopeful: 'peaceful',
  intense: 'tense',
  peaceful: 'peaceful',
  exciting: 'heroic',
  adventurous: 'heroic',
  triumphant: 'epic',
  mysterious: 'mysterious',
  playful: 'comedic',
  celebratory: 'happy',
  suspenseful: 'tense',
  whimsical: 'comedic',
  mischievous: 'comedic',
  comedic: 'comedic',
  clever: 'mysterious',
  joyful: 'happy',
  worried: 'sad',
  emotional: 'sad',
  determined: 'heroic',
  sacred: 'peaceful',
  heroic: 'heroic',
  eerie: 'scary',
  scary: 'scary',
};

export function selectMusic(mood: string, _seed: number): MusicTrack {
  const musicMood = MOOD_MAPPING[mood] ?? 'peaceful';
  return MUSIC_TRACKS[musicMood] ?? MUSIC_TRACKS['peaceful'];
}

export { MUSIC_TRACKS, MOOD_MAPPING };
