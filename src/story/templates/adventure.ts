import type { StoryTemplate } from '../../types';

export const ADVENTURE_QUEST: StoryTemplate = {
  id: 'adventure-quest',
  type: 'adventure',
  acts: [
    {
      name: 'call',
      scenes: 2,
      purpose: 'Ordinary world disrupted, hero receives a call to adventure',
      mood: 'exciting',
      requiredArchetypes: ['hero_child'],
    },
    {
      name: 'journey',
      scenes: 4,
      purpose: 'Travel through challenges, meet allies, gather clues',
      mood: 'adventurous',
      requiredArchetypes: ['hero_child', 'comic_sidekick', 'smart_girl'],
    },
    {
      name: 'trial',
      scenes: 2,
      purpose: 'Major test, face the villain or obstacle, hero must prove themselves',
      mood: 'intense',
      requiredArchetypes: ['hero_child', 'villain'],
    },
    {
      name: 'return',
      scenes: 2,
      purpose: 'Hero returns changed, shares wisdom, celebrates victory',
      mood: 'triumphant',
      requiredArchetypes: ['hero_child', 'wise_elder'],
    },
  ],
  requiredCharacters: ['hero_child', 'comic_sidekick', 'villain'],
  settingType: 'mountain',
  moralCategory: 'courage',
};

export const ADVENTURE_RESCUE: StoryTemplate = {
  id: 'adventure-rescue',
  type: 'adventure',
  acts: [
    {
      name: 'crisis',
      scenes: 2,
      purpose: 'Someone is captured or lost, urgency established',
      mood: 'tense',
      requiredArchetypes: ['hero_child', 'mother'],
    },
    {
      name: 'preparation',
      scenes: 3,
      purpose: 'Gather team, make a plan, set off on rescue',
      mood: 'determined',
      requiredArchetypes: ['hero_child', 'smart_girl', 'comic_sidekick'],
    },
    {
      name: 'infiltration',
      scenes: 3,
      purpose: 'Sneak in, overcome traps, confront villain',
      mood: 'suspenseful',
      requiredArchetypes: ['hero_child', 'villain'],
    },
    {
      name: 'escape',
      scenes: 2,
      purpose: 'Daring escape, reunited, villain learns lesson',
      mood: 'triumphant',
      requiredArchetypes: ['hero_child'],
    },
  ],
  requiredCharacters: ['hero_child', 'smart_girl', 'villain'],
  settingType: 'cave',
  moralCategory: 'teamwork',
};

export const ADVENTURE_TEMPLATES = [ADVENTURE_QUEST, ADVENTURE_RESCUE];
