import type { StoryTemplate } from '../../types';

export const FOLKTALE_ANIMAL: StoryTemplate = {
  id: 'folktale-animal',
  type: 'folktale',
  acts: [
    {
      name: 'once_upon',
      scenes: 2,
      purpose: 'Set the scene in nature, introduce animal characters',
      mood: 'whimsical',
      requiredArchetypes: ['animal'],
    },
    {
      name: 'complication',
      scenes: 4,
      purpose: 'Animals face a dilemma, alliances form, trickery occurs',
      mood: 'playful',
      requiredArchetypes: ['animal', 'wise_elder'],
    },
    {
      name: 'lesson',
      scenes: 2,
      purpose: 'The clever animal wins, narrator delivers the moral',
      mood: 'warm',
      requiredArchetypes: ['wise_elder'],
    },
  ],
  requiredCharacters: ['animal', 'wise_elder'],
  settingType: 'forest',
  moralCategory: 'wisdom',
};

export const FOLKTALE_CLEVER_HERO: StoryTemplate = {
  id: 'folktale-clever-hero',
  type: 'folktale',
  acts: [
    {
      name: 'problem',
      scenes: 2,
      purpose: 'King or village faces an impossible problem',
      mood: 'worried',
      requiredArchetypes: ['king', 'hero_child'],
    },
    {
      name: 'wit',
      scenes: 4,
      purpose: 'Clever hero uses wit to solve the problem step by step',
      mood: 'clever',
      requiredArchetypes: ['smart_girl', 'hero_child'],
    },
    {
      name: 'reward',
      scenes: 2,
      purpose: 'Hero rewarded, wisdom celebrated, villain humbled',
      mood: 'joyful',
      requiredArchetypes: ['king', 'wise_elder'],
    },
  ],
  requiredCharacters: ['hero_child', 'king', 'smart_girl'],
  settingType: 'palace',
  moralCategory: 'wisdom',
};

export const FOLKTALE_TRICKSTER: StoryTemplate = {
  id: 'folktale-trickster',
  type: 'folktale',
  acts: [
    {
      name: 'status_quo',
      scenes: 2,
      purpose: 'Establish the powerful and the powerless',
      mood: 'tense',
      requiredArchetypes: ['villain', 'hero_child'],
    },
    {
      name: 'trick',
      scenes: 3,
      purpose: 'Trickster outsmarts the powerful through cleverness',
      mood: 'mischievous',
      requiredArchetypes: ['hero_child', 'comic_sidekick'],
    },
    {
      name: 'tables_turned',
      scenes: 2,
      purpose: 'Power dynamics reversed, justice served with humor',
      mood: 'comedic',
      requiredArchetypes: ['wise_elder'],
    },
  ],
  requiredCharacters: ['hero_child', 'villain', 'comic_sidekick'],
  settingType: 'market',
  moralCategory: 'courage',
};

export const FOLKTALE_TEMPLATES = [FOLKTALE_ANIMAL, FOLKTALE_CLEVER_HERO, FOLKTALE_TRICKSTER];
