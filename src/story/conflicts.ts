import type { ConflictTemplate } from '../types';

export const CONFLICTS: ConflictTemplate[] = [
  // ─── Greed ──────────────────────────────────────────
  { id: 'greed-01', description: 'A character finds treasure and refuses to share with friends', requiredArchetypes: ['hero_child', 'villain'], difficulty: 'easy', category: 'greed' },
  { id: 'greed-02', description: 'A merchant cheats customers by using false weights', requiredArchetypes: ['villain', 'wise_elder'], difficulty: 'medium', category: 'greed' },
  { id: 'greed-03', description: 'Someone hoards food during a famine while others starve', requiredArchetypes: ['villain', 'mother'], difficulty: 'hard', category: 'greed' },
  { id: 'greed-04', description: 'A king demands excessive taxes from poor villagers', requiredArchetypes: ['king', 'hero_child'], difficulty: 'hard', category: 'greed' },
  { id: 'greed-05', description: 'An animal steals food from all others in the forest', requiredArchetypes: ['animal', 'wise_elder'], difficulty: 'easy', category: 'greed' },

  // ─── Jealousy ───────────────────────────────────────
  { id: 'jealousy-01', description: 'A friend becomes jealous of another\'s talent and tries to sabotage them', requiredArchetypes: ['hero_child', 'comic_sidekick'], difficulty: 'medium', category: 'jealousy' },
  { id: 'jealousy-02', description: 'A crow envies the peacock\'s beauty and tries to imitate it', requiredArchetypes: ['animal', 'wise_elder'], difficulty: 'easy', category: 'jealousy' },
  { id: 'jealousy-03', description: 'A sibling is jealous of praise given to the other', requiredArchetypes: ['hero_child', 'smart_girl'], difficulty: 'medium', category: 'jealousy' },
  { id: 'jealousy-04', description: 'A courtier is jealous of the king\'s new advisor', requiredArchetypes: ['villain', 'king'], difficulty: 'hard', category: 'jealousy' },
  { id: 'jealousy-05', description: 'A village potter envies the fame of a neighbouring craftsman', requiredArchetypes: ['villain', 'hero_child'], difficulty: 'medium', category: 'jealousy' },

  // ─── Laziness ───────────────────────────────────────
  { id: 'lazy-01', description: 'A student avoids studying and fails when tested by the guru', requiredArchetypes: ['comic_sidekick', 'wise_elder'], difficulty: 'easy', category: 'laziness' },
  { id: 'lazy-02', description: 'A farmer refuses to plough and expects harvest by magic', requiredArchetypes: ['comic_sidekick', 'mother'], difficulty: 'easy', category: 'laziness' },
  { id: 'lazy-03', description: 'Everyone waits for someone else to bell the cat', requiredArchetypes: ['animal', 'hero_child'], difficulty: 'medium', category: 'laziness' },
  { id: 'lazy-04', description: 'A prince refuses royal duties and just wants to play', requiredArchetypes: ['king', 'wise_elder'], difficulty: 'medium', category: 'laziness' },
  { id: 'lazy-05', description: 'A watchman sleeps on duty and a thief sneaks in', requiredArchetypes: ['comic_sidekick', 'villain'], difficulty: 'medium', category: 'laziness' },

  // ─── Dishonesty ─────────────────────────────────────
  { id: 'dishonest-01', description: 'A woodcutter lies about losing a golden axe in the river', requiredArchetypes: ['hero_child', 'wise_elder'], difficulty: 'easy', category: 'dishonesty' },
  { id: 'dishonest-02', description: 'A boy who cried wolf — false alarms erode trust', requiredArchetypes: ['comic_sidekick', 'hero_child'], difficulty: 'easy', category: 'dishonesty' },
  { id: 'dishonest-03', description: 'A trader sells fake medicine claiming it cures everything', requiredArchetypes: ['villain', 'smart_girl'], difficulty: 'hard', category: 'dishonesty' },
  { id: 'dishonest-04', description: 'Someone takes credit for another person\'s work', requiredArchetypes: ['villain', 'hero_child'], difficulty: 'medium', category: 'dishonesty' },
  { id: 'dishonest-05', description: 'A fox tricks a crow into dropping cheese by flattery', requiredArchetypes: ['animal', 'animal'], difficulty: 'easy', category: 'dishonesty' },

  // ─── Pride ──────────────────────────────────────────
  { id: 'pride-01', description: 'A strong warrior mocks weaker creatures and is humbled', requiredArchetypes: ['villain', 'animal'], difficulty: 'medium', category: 'pride' },
  { id: 'pride-02', description: 'A hare boasts about speed and loses to a tortoise', requiredArchetypes: ['animal', 'animal'], difficulty: 'easy', category: 'pride' },
  { id: 'pride-03', description: 'A king thinks he is invincible and ignores wise counsel', requiredArchetypes: ['king', 'wise_elder'], difficulty: 'hard', category: 'pride' },
  { id: 'pride-04', description: 'A scholar ridicules common folk and is taught a lesson', requiredArchetypes: ['villain', 'hero_child'], difficulty: 'medium', category: 'pride' },
  { id: 'pride-05', description: 'A beautiful peacock refuses to shelter others from rain', requiredArchetypes: ['animal', 'mother'], difficulty: 'easy', category: 'pride' },

  // ─── Fear ───────────────────────────────────────────
  { id: 'fear-01', description: 'Children are too scared to enter a dark cave where a friend is trapped', requiredArchetypes: ['hero_child', 'comic_sidekick'], difficulty: 'medium', category: 'fear' },
  { id: 'fear-02', description: 'A village lives in fear of a supposed ghost that turns out harmless', requiredArchetypes: ['hero_child', 'wise_elder'], difficulty: 'easy', category: 'fear' },
  { id: 'fear-03', description: 'A mouse is terrified of a cat but must pass to get food', requiredArchetypes: ['animal', 'smart_girl'], difficulty: 'medium', category: 'fear' },
  { id: 'fear-04', description: 'A young warrior freezes before battle from fear', requiredArchetypes: ['hero_child', 'wise_elder'], difficulty: 'hard', category: 'fear' },
  { id: 'fear-05', description: 'Animals panic at a mysterious sound that is just a falling fruit', requiredArchetypes: ['animal', 'wise_elder'], difficulty: 'easy', category: 'fear' },

  // ─── Ignorance ──────────────────────────────────────
  { id: 'ignorance-01', description: 'Villagers destroy a helpful snake thinking all snakes are dangerous', requiredArchetypes: ['hero_child', 'wise_elder'], difficulty: 'medium', category: 'ignorance' },
  { id: 'ignorance-02', description: 'A man carries salt on a donkey through a river without protecting it', requiredArchetypes: ['comic_sidekick', 'smart_girl'], difficulty: 'easy', category: 'ignorance' },
  { id: 'ignorance-03', description: 'Blind men each touch one part of an elephant and argue', requiredArchetypes: ['wise_elder', 'comic_sidekick'], difficulty: 'easy', category: 'ignorance' },
  { id: 'ignorance-04', description: 'A frog in a well thinks the well is the entire world', requiredArchetypes: ['animal', 'hero_child'], difficulty: 'easy', category: 'ignorance' },
  { id: 'ignorance-05', description: 'People reject a new idea without understanding it', requiredArchetypes: ['smart_girl', 'villain'], difficulty: 'medium', category: 'ignorance' },

  // ─── Cruelty ────────────────────────────────────────
  { id: 'cruelty-01', description: 'A bully torments smaller animals in the forest', requiredArchetypes: ['villain', 'hero_child'], difficulty: 'medium', category: 'cruelty' },
  { id: 'cruelty-02', description: 'A cruel master overworks his servants without food', requiredArchetypes: ['villain', 'mother'], difficulty: 'hard', category: 'cruelty' },
  { id: 'cruelty-03', description: 'Children throw stones at a bird\'s nest', requiredArchetypes: ['hero_child', 'wise_elder'], difficulty: 'easy', category: 'cruelty' },
  { id: 'cruelty-04', description: 'A hunter sets traps in the forest harming innocent animals', requiredArchetypes: ['villain', 'animal'], difficulty: 'medium', category: 'cruelty' },
  { id: 'cruelty-05', description: 'Someone mocks a disabled person and is taught empathy', requiredArchetypes: ['villain', 'wise_elder'], difficulty: 'medium', category: 'cruelty' },

  // ─── Impatience ─────────────────────────────────────
  { id: 'impatience-01', description: 'A farmer pulls seedlings to make them grow faster and kills them', requiredArchetypes: ['comic_sidekick', 'wise_elder'], difficulty: 'easy', category: 'impatience' },
  { id: 'impatience-02', description: 'A child wants the fruit before the tree has grown', requiredArchetypes: ['hero_child', 'mother'], difficulty: 'easy', category: 'impatience' },
  { id: 'impatience-03', description: 'A soldier charges ahead without a plan and falls into a trap', requiredArchetypes: ['hero_child', 'villain'], difficulty: 'medium', category: 'impatience' },
  { id: 'impatience-04', description: 'An alchemist abandons an experiment one day before success', requiredArchetypes: ['smart_girl', 'wise_elder'], difficulty: 'medium', category: 'impatience' },
  { id: 'impatience-05', description: 'A caterpillar tries to fly before becoming a butterfly', requiredArchetypes: ['animal', 'wise_elder'], difficulty: 'easy', category: 'impatience' },

  // ─── Betrayal ───────────────────────────────────────
  { id: 'betrayal-01', description: 'A trusted friend reveals a secret to the enemy', requiredArchetypes: ['villain', 'hero_child'], difficulty: 'hard', category: 'betrayal' },
  { id: 'betrayal-02', description: 'A crocodile pretends friendship to eat the monkey', requiredArchetypes: ['animal', 'animal'], difficulty: 'medium', category: 'betrayal' },
  { id: 'betrayal-03', description: 'An advisor secretly plots against the king', requiredArchetypes: ['villain', 'king'], difficulty: 'hard', category: 'betrayal' },
  { id: 'betrayal-04', description: 'A rescued snake bites the person who saved it', requiredArchetypes: ['animal', 'hero_child'], difficulty: 'medium', category: 'betrayal' },
  { id: 'betrayal-05', description: 'Business partners cheat each other behind the scenes', requiredArchetypes: ['villain', 'smart_girl'], difficulty: 'hard', category: 'betrayal' },
];

export function getConflictsByCategory(category: string): ConflictTemplate[] {
  return CONFLICTS.filter((c) => c.category === category);
}

export function getConflictById(id: string): ConflictTemplate | undefined {
  return CONFLICTS.find((c) => c.id === id);
}
