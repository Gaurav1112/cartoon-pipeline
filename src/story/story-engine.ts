import type {
  CartoonEpisode,
  EpisodeScene,
  SceneCharacter,
  CharacterId,
  CharacterArchetype,
  StoryTemplate,
  MoralTemplate,
  LocationType,
  TimeOfDay,
  Weather,
  CameraMovement,
  Pose,
  EmotionType,
  DialogueLine,
  SceneContext,
  StoryBankEntry,
} from '../types';
import { CHARACTERS, ARCHETYPE_TO_CHARACTER } from './characters';
import { LOCATIONS } from './settings';
import { CONFLICTS } from './conflicts';
import { MORALS } from './morals';
import { MORAL_TEMPLATES } from './templates/moral-story';
import { ADVENTURE_TEMPLATES } from './templates/adventure';
import { RIDDLE_TEMPLATES } from './templates/riddle';
import { FOLKTALE_TEMPLATES } from './templates/folktale';

import panchatantraStories from './story-bank/panchatantra.json';
import aesopStories from './story-bank/aesop.json';
import jatakaStories from './story-bank/jataka.json';
import hitopadeshaStories from './story-bank/hitopadesha.json';
import tenaliRamanStories from './story-bank/tenali-raman.json';
import akbarBirbalStories from './story-bank/akbar-birbal.json';

// ─── Deterministic PRNG ───────────────────────────────────────────────────

export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededPick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function seededShuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function seededIntRange(min: number, max: number, rng: () => number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

// ─── All Templates ────────────────────────────────────────────────────────

const ALL_TEMPLATES: StoryTemplate[] = [
  ...MORAL_TEMPLATES,
  ...ADVENTURE_TEMPLATES,
  ...RIDDLE_TEMPLATES,
  ...FOLKTALE_TEMPLATES,
];

const ALL_STORIES: StoryBankEntry[] = [
  ...(panchatantraStories as StoryBankEntry[]),
  ...(aesopStories as StoryBankEntry[]),
  ...(jatakaStories as StoryBankEntry[]),
  ...(hitopadeshaStories as StoryBankEntry[]),
  ...(tenaliRamanStories as StoryBankEntry[]),
  ...(akbarBirbalStories as StoryBankEntry[]),
];

// ─── Helpers ──────────────────────────────────────────────────────────────

const TIMES_OF_DAY: TimeOfDay[] = ['dawn', 'day', 'day', 'day', 'dusk', 'night'];
const WEATHERS: Weather[] = ['clear', 'clear', 'clear', 'cloudy', 'rainy', 'foggy'];
const CAMERA_TYPES: CameraMovement['type'][] = ['static', 'pan_left', 'pan_right', 'zoom_in', 'zoom_out', 'drift'];
const POSES: Pose[] = ['idle_stand', 'talk_gesture', 'point', 'think', 'wave', 'celebrate'];
const SCENE_CONTEXTS: SceneContext[] = ['greeting', 'conflict', 'resolution', 'moral', 'reaction', 'discovery', 'challenge', 'comfort', 'farewell', 'introduction'];

function moodToContexts(mood: string): SceneContext[] {
  const map: Record<string, SceneContext[]> = {
    warm: ['greeting', 'introduction', 'comfort'],
    tense: ['conflict', 'challenge', 'threat'],
    hopeful: ['discovery', 'comfort', 'reaction'],
    intense: ['conflict', 'challenge', 'threat'],
    peaceful: ['resolution', 'moral', 'farewell'],
    exciting: ['discovery', 'challenge', 'reaction'],
    adventurous: ['discovery', 'challenge', 'introduction'],
    triumphant: ['celebration', 'resolution', 'farewell'],
    mysterious: ['discovery', 'reaction', 'narration'],
    playful: ['reaction', 'riddle_question', 'celebration'],
    celebratory: ['celebration', 'resolution', 'riddle_answer'],
    suspenseful: ['conflict', 'challenge', 'discovery'],
    whimsical: ['introduction', 'greeting', 'reaction'],
    mischievous: ['challenge', 'reaction', 'discovery'],
    comedic: ['celebration', 'reaction', 'resolution'],
    clever: ['discovery', 'riddle_question', 'challenge'],
    joyful: ['celebration', 'resolution', 'farewell'],
    worried: ['conflict', 'reaction', 'comfort'],
    emotional: ['comfort', 'reaction', 'moral'],
    determined: ['challenge', 'conflict', 'discovery'],
    sacred: ['moral', 'narration', 'introduction'],
    heroic: ['challenge', 'conflict', 'resolution'],
  };
  return map[mood] ?? ['narration', 'reaction', 'discovery'];
}

function archetypeToEmotion(archetype: CharacterArchetype, mood: string): EmotionType {
  if (mood === 'tense' || mood === 'intense') {
    if (archetype === 'villain') return 'angry';
    if (archetype === 'hero_child') return 'determined';
    return 'scared';
  }
  if (mood === 'peaceful' || mood === 'warm') return 'happy';
  if (mood === 'mysterious') return 'thinking';
  if (archetype === 'comic_sidekick') return 'surprised';
  return 'neutral';
}

// ─── Story Beat → Dialogue Context Mapping ────────────────────────────────

/** Map story act names to dialogue contexts so dialogue reflects the actual narrative */
function inferContextsFromBeat(beatName: string): SceneContext[] {
  const lower = beatName.toLowerCase();
  const map: Record<string, SceneContext[]> = {
    friendship: ['greeting', 'introduction', 'comfort'],
    bond: ['greeting', 'introduction', 'comfort'],
    welcome: ['greeting', 'introduction'],
    plan: ['discovery', 'challenge'],
    strategy: ['discovery', 'challenge'],
    betrayal: ['conflict', 'threat', 'reaction'],
    plot: ['conflict', 'threat'],
    escape: ['challenge', 'conflict', 'reaction'],
    rescue: ['challenge', 'conflict', 'resolution'],
    trap: ['threat', 'conflict', 'challenge'],
    deception: ['conflict', 'threat', 'discovery'],
    flight: ['challenge', 'conflict'],
    fall: ['reaction', 'conflict'],
    trick: ['discovery', 'challenge', 'reaction'],
    victory: ['celebration', 'resolution'],
    defeat: ['resolution', 'moral'],
    lesson: ['moral', 'resolution', 'farewell'],
    moral: ['moral', 'resolution'],
    wisdom: ['moral', 'narration'],
    exposure: ['discovery', 'reaction', 'resolution'],
    truth: ['discovery', 'resolution', 'moral'],
    greed: ['conflict', 'threat'],
    kindness: ['comfort', 'resolution'],
    courage: ['challenge', 'conflict'],
    fear: ['conflict', 'reaction'],
    curiosity: ['discovery', 'reaction'],
    problem: ['conflict', 'challenge'],
    solution: ['resolution', 'discovery'],
    reward: ['celebration', 'resolution'],
    punishment: ['resolution', 'moral'],
    chase: ['conflict', 'challenge'],
    dispute: ['conflict', 'challenge'],
    judgment: ['resolution', 'moral'],
  };

  // Find first matching key in the beat name
  for (const [key, contexts] of Object.entries(map)) {
    if (lower.includes(key)) return contexts;
  }
  return ['narration', 'reaction']; // fallback
}

// ─── Story-First Helpers ──────────────────────────────────────────────────

/** Score a template against a story for compatibility */
function scoreTemplate(story: StoryBankEntry, template: StoryTemplate): number {
  let score = 0;
  // Act count similarity
  if (story.acts.length === template.acts.length) score += 3;
  else if (Math.abs(story.acts.length - template.acts.length) <= 1) score += 1;
  // Setting match
  if (story.setting === template.settingType) score += 2;
  // Moral category match
  const storyMoralLower = story.moral.toLowerCase();
  if (storyMoralLower.includes(template.moralCategory)) score += 3;
  return score;
}

/** Select the best-fitting template for a story (scored, not random) */
function selectBestTemplate(story: StoryBankEntry, rng: () => number): StoryTemplate {
  const scored = ALL_TEMPLATES.map((t) => ({ template: t, score: scoreTemplate(story, t) }));
  const maxScore = Math.max(...scored.map((s) => s.score));
  const best = scored.filter((s) => s.score === maxScore).map((s) => s.template);
  return seededPick(best, rng); // break ties with PRNG
}

/** Map story characters to character rigs, using animal skins where appropriate */
function assignCharactersFromStory(
  story: StoryBankEntry,
  template: StoryTemplate,
  rng: () => number,
): CharacterId[] {
  const ids: CharacterId[] = [];

  // Always include template-required characters
  for (const arch of template.requiredCharacters) {
    const cid = ARCHETYPE_TO_CHARACTER[arch];
    if (!ids.includes(cid)) ids.push(cid);
  }

  // Add bablu for comedy if not already present
  if (!ids.includes('bablu')) ids.push('bablu');

  // Add guruji for framing scenes if not present
  if (!ids.includes('guruji')) ids.push('guruji');

  return ids;
}

// ─── Main Generator ───────────────────────────────────────────────────────

export function generateEpisode(topicId: number, episodeNumber: number): CartoonEpisode {
  const seed = topicId * 10000 + episodeNumber;
  const rng = mulberry32(seed);

  // 1. STORY-FIRST: Select source story from bank (this drives everything)
  const story = seededPick(ALL_STORIES, rng);

  // 2. Select template that best fits the story (scored, not random)
  const template = selectBestTemplate(story, rng);

  // 3. Assign characters — use story's characters to guide assignment
  const characterIds = assignCharactersFromStory(story, template, rng);

  // 4. Location — use story's setting, not random
  const storyLocation = LOCATIONS.find((l) => l.id === story.setting) ?? seededPick(LOCATIONS, rng);
  const secondaryLocations = seededShuffle(LOCATIONS, rng).slice(0, 3);

  // 5. Select moral — prefer one whose relatedConflicts match available conflicts
  const categoryMorals = MORALS.filter((m) => m.category === template.moralCategory);
  const moral = seededPick(categoryMorals.length > 0 ? categoryMorals : MORALS, rng);

  // 6. Select conflict from CONFLICTS (was dead code — now wired in)
  const relatedConflicts = CONFLICTS.filter((c) =>
    moral.relatedConflicts.includes(c.id),
  );
  const episodeConflict = relatedConflicts.length > 0
    ? seededPick(relatedConflicts, rng)
    : seededPick(CONFLICTS, rng);

  // 7. Generate scenes
  const scenes: EpisodeScene[] = [];
  let sceneIndex = 0;

  for (let actIdx = 0; actIdx < template.acts.length; actIdx++) {
    const act = template.acts[actIdx];
    // Wire story acts into scene generation — story.acts[actIdx] provides the narrative beat
    const storyAct = story.acts[actIdx % story.acts.length];

    for (let s = 0; s < act.scenes; s++) {
      const location: LocationType =
        s === 0
          ? storyLocation.id
          : seededPick([storyLocation, ...secondaryLocations], rng).id;

      const timeOfDay = seededPick(TIMES_OF_DAY, rng);
      const weather = seededPick(WEATHERS, rng);

      // USE storyAct to drive dialogue context — not just template mood
      const storyBeatContexts = inferContextsFromBeat(storyAct.name);
      const moodContexts = moodToContexts(act.mood);
      // Merge: story-specific contexts first, then mood-based fallbacks
      const contexts = [...new Set([...storyBeatContexts, ...moodContexts])];

      // Determine which characters appear in this scene
      const sceneArchetypes = act.requiredArchetypes ?? template.requiredCharacters;
      const sceneCharacterIds = sceneArchetypes.map((a) => ARCHETYPE_TO_CHARACTER[a]);
      // Always add at least 2 characters
      while (sceneCharacterIds.length < 2 && characterIds.length > sceneCharacterIds.length) {
        const extra = seededPick(
          characterIds.filter((c) => !sceneCharacterIds.includes(c)),
          rng,
        );
        sceneCharacterIds.push(extra);
      }

      const positions: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
      const sceneChars: SceneCharacter[] = sceneCharacterIds.map((cid, i) => ({
        characterId: cid,
        position: positions[i % 3],
        pose: seededPick(POSES, rng),
        expression: archetypeToEmotion(CHARACTERS[cid].archetype, act.mood),
        flipX: i % 2 === 1,
      }));

      // Generate dialogue placeholder lines (will be resolved per-language by dialogue bank)
      const lineCount = seededIntRange(2, 5, rng);
      const dialogue: DialogueLine[] = [];
      for (let d = 0; d < lineCount; d++) {
        const speakerId = seededPick(sceneCharacterIds, rng);
        dialogue.push({
          characterId: speakerId,
          text: '', // filled by dialogue engine per language
          emotion: archetypeToEmotion(CHARACTERS[speakerId].archetype, act.mood),
          context: seededPick(contexts, rng),
        });
      }

      const camera: CameraMovement = {
        type: seededPick(CAMERA_TYPES, rng),
        intensity: 0.3 + rng() * 0.5,
      };

      // SFX keywords from location + mood + conflict category
      const sfxKeywords = [
        ...(LOCATIONS.find((l) => l.id === location)?.defaultProps ?? []),
        act.mood,
        episodeConflict.category,
      ];

      // Kid-friendly pacing: ~5s per dialogue line + 3s scene breathing room
      // Kids need 4-5s to absorb each line + 1.5s pause between speakers
      const contentDuration = lineCount * 150 + 90; // frames (5s per line + 3s buffer)
      const clampedDuration = Math.max(360, Math.min(600, contentDuration)); // 12-20s per scene

      scenes.push({
        sceneIndex,
        actName: act.name,
        location,
        timeOfDay,
        weather,
        mood: act.mood,
        characters: sceneChars,
        dialogue,
        sfxKeywords,
        cameraMovement: camera,
        durationFrames: clampedDuration,
      });

      sceneIndex++;
    }
  }

  // Calculate total duration (5s intro + scenes + 8s moral + 6s outro)
  const totalDurationFrames = 150 + scenes.reduce((sum, s) => sum + s.durationFrames, 0) + 240 + 180;

  return {
    seed,
    topicId,
    episodeNumber,
    title: story.title,
    storyType: template.type,
    seriesName: 'Katha Keeda',
    characters: characterIds,
    scenes,
    moral,
    totalDurationFrames,
  };
}

export { ALL_TEMPLATES, ALL_STORIES };
