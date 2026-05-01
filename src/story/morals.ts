import type { MoralTemplate } from '../types';

export const MORALS: MoralTemplate[] = [
  // ─── Wisdom ─────────────────────────────────────────
  { id: 'wisdom-01', moralText: 'True wisdom lies in knowing how much you don\'t know.', category: 'wisdom', relatedConflicts: ['ignorance-03', 'pride-04'] },
  { id: 'wisdom-02', moralText: 'Think before you act; haste makes waste.', category: 'wisdom', relatedConflicts: ['impatience-01', 'impatience-03'] },
  { id: 'wisdom-03', moralText: 'Learn from every experience, good or bad.', category: 'wisdom', relatedConflicts: ['ignorance-01', 'fear-02'] },
  { id: 'wisdom-04', moralText: 'A wise person listens more than they speak.', category: 'wisdom', relatedConflicts: ['pride-03', 'pride-04'] },
  { id: 'wisdom-05', moralText: 'Do not judge a book by its cover.', category: 'wisdom', relatedConflicts: ['ignorance-05', 'pride-01'] },
  { id: 'wisdom-06', moralText: 'Even the smallest creature has something to teach.', category: 'wisdom', relatedConflicts: ['pride-01', 'cruelty-01'] },
  { id: 'wisdom-07', moralText: 'Knowledge without humility is like a lamp without oil.', category: 'wisdom', relatedConflicts: ['pride-04', 'ignorance-04'] },
  { id: 'wisdom-08', moralText: 'The greatest teacher is experience itself.', category: 'wisdom', relatedConflicts: ['ignorance-02', 'lazy-01'] },
  { id: 'wisdom-09', moralText: 'Still water runs deep.', category: 'wisdom', relatedConflicts: ['pride-02', 'pride-05'] },
  { id: 'wisdom-10', moralText: 'It is better to light a candle than curse the darkness.', category: 'wisdom', relatedConflicts: ['fear-01', 'fear-04'] },

  // ─── Kindness ───────────────────────────────────────
  { id: 'kindness-01', moralText: 'A kind word costs nothing but means everything.', category: 'kindness', relatedConflicts: ['cruelty-05', 'cruelty-03'] },
  { id: 'kindness-02', moralText: 'Help others without expecting anything in return.', category: 'kindness', relatedConflicts: ['greed-01', 'greed-03'] },
  { id: 'kindness-03', moralText: 'Even your enemy deserves compassion.', category: 'kindness', relatedConflicts: ['cruelty-01', 'cruelty-04'] },
  { id: 'kindness-04', moralText: 'A small act of kindness can change someone\'s life.', category: 'kindness', relatedConflicts: ['cruelty-02', 'cruelty-05'] },
  { id: 'kindness-05', moralText: 'The greatest strength is a gentle heart.', category: 'kindness', relatedConflicts: ['pride-01', 'cruelty-01'] },
  { id: 'kindness-06', moralText: 'Share what you have; it multiplies when given.', category: 'kindness', relatedConflicts: ['greed-01', 'greed-05'] },
  { id: 'kindness-07', moralText: 'Treat others the way you wish to be treated.', category: 'kindness', relatedConflicts: ['cruelty-03', 'cruelty-05'] },
  { id: 'kindness-08', moralText: 'A friend in need is a friend indeed.', category: 'kindness', relatedConflicts: ['betrayal-01', 'betrayal-02'] },
  { id: 'kindness-09', moralText: 'Kindness is the language that the deaf can hear and the blind can see.', category: 'kindness', relatedConflicts: ['cruelty-05', 'ignorance-01'] },
  { id: 'kindness-10', moralText: 'No act of kindness, no matter how small, is ever wasted.', category: 'kindness', relatedConflicts: ['greed-03', 'cruelty-02'] },

  // ─── Honesty ────────────────────────────────────────
  { id: 'honesty-01', moralText: 'Honesty is the best policy.', category: 'honesty', relatedConflicts: ['dishonest-01', 'dishonest-02'] },
  { id: 'honesty-02', moralText: 'A lie has short legs — the truth always catches up.', category: 'honesty', relatedConflicts: ['dishonest-02', 'dishonest-03'] },
  { id: 'honesty-03', moralText: 'Trust takes years to build and seconds to break.', category: 'honesty', relatedConflicts: ['betrayal-01', 'dishonest-04'] },
  { id: 'honesty-04', moralText: 'Speak the truth even when your voice shakes.', category: 'honesty', relatedConflicts: ['fear-04', 'dishonest-04'] },
  { id: 'honesty-05', moralText: 'An honest person is respected by all.', category: 'honesty', relatedConflicts: ['dishonest-01', 'dishonest-05'] },
  { id: 'honesty-06', moralText: 'Flattery may win you fans, but only truth wins you friends.', category: 'honesty', relatedConflicts: ['dishonest-05', 'pride-04'] },
  { id: 'honesty-07', moralText: 'Admit your mistakes — it is the first step to learning.', category: 'honesty', relatedConflicts: ['dishonest-04', 'pride-03'] },
  { id: 'honesty-08', moralText: 'Stolen gains never bring true happiness.', category: 'honesty', relatedConflicts: ['greed-02', 'dishonest-03'] },
  { id: 'honesty-09', moralText: 'Character is what you do when no one is watching.', category: 'honesty', relatedConflicts: ['dishonest-01', 'lazy-05'] },
  { id: 'honesty-10', moralText: 'The truth is like a lion — you don\'t have to defend it.', category: 'honesty', relatedConflicts: ['dishonest-02', 'fear-02'] },

  // ─── Courage ────────────────────────────────────────
  { id: 'courage-01', moralText: 'Courage is not the absence of fear but acting despite it.', category: 'courage', relatedConflicts: ['fear-01', 'fear-04'] },
  { id: 'courage-02', moralText: 'Stand up for what is right, even if you stand alone.', category: 'courage', relatedConflicts: ['fear-04', 'cruelty-01'] },
  { id: 'courage-03', moralText: 'A brave heart can overcome any obstacle.', category: 'courage', relatedConflicts: ['fear-01', 'fear-03'] },
  { id: 'courage-04', moralText: 'True bravery is defending the weak.', category: 'courage', relatedConflicts: ['cruelty-01', 'cruelty-04'] },
  { id: 'courage-05', moralText: 'Face your fears and they will shrink.', category: 'courage', relatedConflicts: ['fear-02', 'fear-05'] },
  { id: 'courage-06', moralText: 'It takes courage to say sorry and even more to forgive.', category: 'courage', relatedConflicts: ['betrayal-04', 'pride-03'] },
  { id: 'courage-07', moralText: 'The darkest hour is just before the dawn.', category: 'courage', relatedConflicts: ['fear-01', 'fear-04'] },
  { id: 'courage-08', moralText: 'Doing the right thing is rarely the easy thing.', category: 'courage', relatedConflicts: ['dishonest-04', 'fear-04'] },
  { id: 'courage-09', moralText: 'A single brave voice can inspire thousands.', category: 'courage', relatedConflicts: ['fear-04', 'cruelty-02'] },
  { id: 'courage-10', moralText: 'Bravery without wisdom is recklessness.', category: 'courage', relatedConflicts: ['impatience-03', 'pride-01'] },

  // ─── Patience ───────────────────────────────────────
  { id: 'patience-01', moralText: 'Slow and steady wins the race.', category: 'patience', relatedConflicts: ['pride-02', 'impatience-01'] },
  { id: 'patience-02', moralText: 'Good things come to those who wait.', category: 'patience', relatedConflicts: ['impatience-02', 'impatience-04'] },
  { id: 'patience-03', moralText: 'Rome was not built in a day.', category: 'patience', relatedConflicts: ['impatience-01', 'impatience-05'] },
  { id: 'patience-04', moralText: 'Patience is the companion of wisdom.', category: 'patience', relatedConflicts: ['impatience-03', 'pride-03'] },
  { id: 'patience-05', moralText: 'Drop by drop, water fills the pot.', category: 'patience', relatedConflicts: ['impatience-01', 'lazy-02'] },
  { id: 'patience-06', moralText: 'A tree that bends does not break.', category: 'patience', relatedConflicts: ['pride-01', 'impatience-03'] },
  { id: 'patience-07', moralText: 'Rivers don\'t drink their own water; trees don\'t eat their own fruit — nature teaches patience.', category: 'patience', relatedConflicts: ['greed-01', 'impatience-02'] },
  { id: 'patience-08', moralText: 'Endurance is the crown of success.', category: 'patience', relatedConflicts: ['impatience-04', 'lazy-01'] },
  { id: 'patience-09', moralText: 'The fruit ripens in its own time.', category: 'patience', relatedConflicts: ['impatience-02', 'impatience-05'] },
  { id: 'patience-10', moralText: 'Rushing leads to mistakes; patience leads to mastery.', category: 'patience', relatedConflicts: ['impatience-03', 'impatience-04'] },

  // ─── Teamwork ───────────────────────────────────────
  { id: 'teamwork-01', moralText: 'Together we can move mountains.', category: 'teamwork', relatedConflicts: ['lazy-03', 'fear-01'] },
  { id: 'teamwork-02', moralText: 'Unity is strength; division is weakness.', category: 'teamwork', relatedConflicts: ['jealousy-03', 'betrayal-01'] },
  { id: 'teamwork-03', moralText: 'A single arrow breaks easily; a bundle is unbreakable.', category: 'teamwork', relatedConflicts: ['pride-01', 'jealousy-01'] },
  { id: 'teamwork-04', moralText: 'No one can whistle a symphony — it takes an orchestra.', category: 'teamwork', relatedConflicts: ['pride-04', 'lazy-03'] },
  { id: 'teamwork-05', moralText: 'Many hands make light work.', category: 'teamwork', relatedConflicts: ['lazy-03', 'greed-01'] },
  { id: 'teamwork-06', moralText: 'When spider webs unite, they can tie up a lion.', category: 'teamwork', relatedConflicts: ['fear-03', 'pride-01'] },
  { id: 'teamwork-07', moralText: 'Share the load and the journey becomes easier.', category: 'teamwork', relatedConflicts: ['greed-01', 'lazy-02'] },
  { id: 'teamwork-08', moralText: 'Cooperation builds bridges; competition builds walls.', category: 'teamwork', relatedConflicts: ['jealousy-01', 'jealousy-05'] },
  { id: 'teamwork-09', moralText: 'A team is only as strong as its weakest member.', category: 'teamwork', relatedConflicts: ['cruelty-05', 'pride-04'] },
  { id: 'teamwork-10', moralText: 'Together everyone achieves more.', category: 'teamwork', relatedConflicts: ['lazy-03', 'jealousy-01'] },

  // ─── Respect ────────────────────────────────────────
  { id: 'respect-01', moralText: 'Respect your elders — they have walked the path before you.', category: 'respect', relatedConflicts: ['pride-04', 'ignorance-05'] },
  { id: 'respect-02', moralText: 'Every creature deserves dignity.', category: 'respect', relatedConflicts: ['cruelty-01', 'cruelty-05'] },
  { id: 'respect-03', moralText: 'Respect is earned, not demanded.', category: 'respect', relatedConflicts: ['pride-03', 'cruelty-02'] },
  { id: 'respect-04', moralText: 'Words spoken in anger can wound deeper than any sword.', category: 'respect', relatedConflicts: ['cruelty-05', 'jealousy-01'] },
  { id: 'respect-05', moralText: 'A respectful mind is an open mind.', category: 'respect', relatedConflicts: ['ignorance-05', 'pride-04'] },
  { id: 'respect-06', moralText: 'Value everyone\'s contribution, no matter how small.', category: 'respect', relatedConflicts: ['pride-01', 'cruelty-05'] },
  { id: 'respect-07', moralText: 'Listen to understand, not to reply.', category: 'respect', relatedConflicts: ['pride-04', 'ignorance-03'] },
  { id: 'respect-08', moralText: 'Treat nature with respect and it will provide for you.', category: 'respect', relatedConflicts: ['cruelty-04', 'greed-03'] },
  { id: 'respect-09', moralText: 'A polite tongue is a sign of a noble heart.', category: 'respect', relatedConflicts: ['cruelty-05', 'pride-04'] },
  { id: 'respect-10', moralText: 'Honour comes from lifting others up, not putting them down.', category: 'respect', relatedConflicts: ['cruelty-01', 'jealousy-01'] },

  // ─── Perseverance ───────────────────────────────────
  { id: 'perseverance-01', moralText: 'Try, try again — failure is not the end.', category: 'perseverance', relatedConflicts: ['fear-04', 'lazy-01'] },
  { id: 'perseverance-02', moralText: 'The spider rebuilds its web no matter how many times it is torn.', category: 'perseverance', relatedConflicts: ['impatience-04', 'fear-01'] },
  { id: 'perseverance-03', moralText: 'A diamond is just a piece of coal that never gave up.', category: 'perseverance', relatedConflicts: ['impatience-05', 'lazy-01'] },
  { id: 'perseverance-04', moralText: 'Obstacles are stepping stones, not stumbling blocks.', category: 'perseverance', relatedConflicts: ['fear-01', 'fear-03'] },
  { id: 'perseverance-05', moralText: 'The river cuts through rock not by power but by persistence.', category: 'perseverance', relatedConflicts: ['impatience-01', 'impatience-04'] },
  { id: 'perseverance-06', moralText: 'Fall seven times, stand up eight.', category: 'perseverance', relatedConflicts: ['fear-04', 'lazy-04'] },
  { id: 'perseverance-07', moralText: 'Hard work beats talent when talent doesn\'t work hard.', category: 'perseverance', relatedConflicts: ['lazy-01', 'pride-02'] },
  { id: 'perseverance-08', moralText: 'Success is the sum of small efforts repeated day in and day out.', category: 'perseverance', relatedConflicts: ['lazy-02', 'impatience-01'] },
  { id: 'perseverance-09', moralText: 'An ant can move a mountain one grain at a time.', category: 'perseverance', relatedConflicts: ['impatience-01', 'pride-01'] },
  { id: 'perseverance-10', moralText: 'Winners never quit and quitters never win.', category: 'perseverance', relatedConflicts: ['impatience-04', 'fear-04'] },

  // ─── Gratitude ──────────────────────────────────────
  { id: 'gratitude-01', moralText: 'Count your blessings, not your troubles.', category: 'gratitude', relatedConflicts: ['greed-01', 'jealousy-02'] },
  { id: 'gratitude-02', moralText: 'A grateful heart is a happy heart.', category: 'gratitude', relatedConflicts: ['jealousy-01', 'greed-04'] },
  { id: 'gratitude-03', moralText: 'Never forget those who helped you in times of need.', category: 'gratitude', relatedConflicts: ['betrayal-01', 'betrayal-04'] },
  { id: 'gratitude-04', moralText: 'Gratitude turns what we have into enough.', category: 'gratitude', relatedConflicts: ['greed-01', 'jealousy-03'] },
  { id: 'gratitude-05', moralText: 'Appreciate the little things, for one day you may look back and realise they were the big things.', category: 'gratitude', relatedConflicts: ['greed-05', 'jealousy-05'] },
  { id: 'gratitude-06', moralText: 'Give thanks for even the smallest favour.', category: 'gratitude', relatedConflicts: ['greed-04', 'pride-05'] },
  { id: 'gratitude-07', moralText: 'He who is ungrateful has no foundation for happiness.', category: 'gratitude', relatedConflicts: ['betrayal-04', 'greed-01'] },
  { id: 'gratitude-08', moralText: 'The sun gives without asking for thanks — be like the sun.', category: 'gratitude', relatedConflicts: ['greed-03', 'pride-05'] },
  { id: 'gratitude-09', moralText: 'Say thank you — it brightens someone\'s day more than you know.', category: 'gratitude', relatedConflicts: ['cruelty-05', 'pride-04'] },
  { id: 'gratitude-10', moralText: 'A life lived in gratitude is a life well lived.', category: 'gratitude', relatedConflicts: ['greed-01', 'jealousy-01'] },
];

export function getMoralsByCategory(category: string): MoralTemplate[] {
  return MORALS.filter((m) => m.category === category);
}

export function getMoralById(id: string): MoralTemplate | undefined {
  return MORALS.find((m) => m.id === id);
}
