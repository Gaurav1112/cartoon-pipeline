import type { StoryTemplate } from '../../types';

export const RIDDLE_CLASSIC: StoryTemplate = {
  id: 'riddle-classic',
  type: 'riddle',
  acts: [
    {
      name: 'setup',
      scenes: 2,
      purpose: 'Introduce the riddle master and the challenge context',
      mood: 'mysterious',
      requiredArchetypes: ['wise_elder', 'hero_child'],
    },
    {
      name: 'riddle_rounds',
      scenes: 4,
      purpose: 'Present 3 riddles with 3 options each, characters discuss',
      mood: 'playful',
      requiredArchetypes: ['hero_child', 'smart_girl', 'comic_sidekick'],
    },
    {
      name: 'reveal',
      scenes: 2,
      purpose: 'Answers revealed, winner declared, moral about thinking',
      mood: 'celebratory',
      requiredArchetypes: ['wise_elder'],
    },
  ],
  requiredCharacters: ['hero_child', 'smart_girl', 'wise_elder'],
  settingType: 'school',
  moralCategory: 'wisdom',
};

export const RIDDLE_CONTEST: StoryTemplate = {
  id: 'riddle-contest',
  type: 'riddle',
  acts: [
    {
      name: 'challenge',
      scenes: 2,
      purpose: 'Villain challenges hero to a riddle contest with stakes',
      mood: 'tense',
      requiredArchetypes: ['villain', 'hero_child'],
    },
    {
      name: 'riddle_battle',
      scenes: 4,
      purpose: 'Back-and-forth riddles, wit vs cunning, audience reacts',
      mood: 'exciting',
      requiredArchetypes: ['hero_child', 'villain', 'comic_sidekick'],
    },
    {
      name: 'outcome',
      scenes: 2,
      purpose: 'Final riddle decides it, smart solution wins, lesson learned',
      mood: 'triumphant',
      requiredArchetypes: ['smart_girl', 'wise_elder'],
    },
  ],
  requiredCharacters: ['hero_child', 'villain', 'smart_girl'],
  settingType: 'palace',
  moralCategory: 'wisdom',
};

export const RIDDLE_TEMPLATES = [RIDDLE_CLASSIC, RIDDLE_CONTEST];
