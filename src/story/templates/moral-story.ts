import type { StoryTemplate } from '../../types';

export const MORAL_STORY: StoryTemplate = {
  id: 'moral-classic',
  type: 'moral',
  acts: [
    {
      name: 'setup',
      scenes: 2,
      purpose: 'Introduce characters, establish the world and relationships',
      mood: 'warm',
      requiredArchetypes: ['hero_child', 'comic_sidekick'],
    },
    {
      name: 'conflict',
      scenes: 3,
      purpose: 'Problem arises, naive first attempt fails, stakes escalate',
      mood: 'tense',
      requiredArchetypes: ['villain'],
    },
    {
      name: 'rising',
      scenes: 3,
      purpose: 'Mentor insight, characters grow, real solution emerges',
      mood: 'hopeful',
      requiredArchetypes: ['wise_elder'],
    },
    {
      name: 'climax',
      scenes: 2,
      purpose: 'Dramatic confrontation, solution applied, turning point',
      mood: 'intense',
      requiredArchetypes: ['hero_child', 'villain'],
    },
    {
      name: 'resolution',
      scenes: 2,
      purpose: 'Moral delivered, characters reflect, harmony restored',
      mood: 'peaceful',
      requiredArchetypes: ['wise_elder'],
    },
  ],
  requiredCharacters: ['hero_child', 'wise_elder', 'villain'],
  settingType: 'forest',
  moralCategory: 'wisdom',
};

export const MORAL_STORY_FAMILY: StoryTemplate = {
  id: 'moral-family',
  type: 'moral',
  acts: [
    {
      name: 'setup',
      scenes: 2,
      purpose: 'Family life, normal day, warmth established',
      mood: 'warm',
      requiredArchetypes: ['hero_child', 'mother'],
    },
    {
      name: 'conflict',
      scenes: 3,
      purpose: 'Domestic problem, misunderstanding or outside threat',
      mood: 'tense',
      requiredArchetypes: ['hero_child'],
    },
    {
      name: 'rising',
      scenes: 2,
      purpose: 'Mother\'s wisdom or community help guides the way',
      mood: 'hopeful',
      requiredArchetypes: ['mother', 'wise_elder'],
    },
    {
      name: 'climax',
      scenes: 2,
      purpose: 'Heart-to-heart moment, emotional breakthrough',
      mood: 'emotional',
      requiredArchetypes: ['hero_child', 'mother'],
    },
    {
      name: 'resolution',
      scenes: 2,
      purpose: 'Family united, lesson learned, closing warmth',
      mood: 'peaceful',
    },
  ],
  requiredCharacters: ['hero_child', 'mother', 'wise_elder'],
  settingType: 'village',
  moralCategory: 'kindness',
};

export const MORAL_TEMPLATES = [MORAL_STORY, MORAL_STORY_FAMILY];
