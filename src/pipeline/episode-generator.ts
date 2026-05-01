import type { FullEpisodeData, SupportedLanguage, DialogueLine } from '../types';
import { LANGUAGES } from '../types';
import { generateEpisode } from '../story/story-engine';
import { selectDialogueSequence } from '../dialogues';
import { generateStoryboard } from './storyboard';

export async function generateFullEpisode(episodeNumber: number): Promise<FullEpisodeData> {
  // Topic ID cycles through 1-100 for variety
  const topicId = ((episodeNumber - 1) % 100) + 1;

  // 1. Generate base episode (language-independent)
  const episode = generateEpisode(topicId, episodeNumber);

  // 2. Resolve dialogues for each language
  const dialoguesPerLanguage = {} as Record<SupportedLanguage, DialogueLine[][]>;

  for (const lang of LANGUAGES) {
    const sceneDialogues: DialogueLine[][] = [];

    for (const scene of episode.scenes) {
      const queries = scene.dialogue.map((line) => ({
        character: line.characterId,
        emotion: line.emotion,
        context: line.context,
      }));

      const resolved = selectDialogueSequence(queries, lang, episode.seed + scene.sceneIndex);
      const dialogueLines: DialogueLine[] = resolved.map((sel, i) => ({
        characterId: scene.dialogue[i].characterId,
        text: sel.text,
        emotion: scene.dialogue[i].emotion,
        context: scene.dialogue[i].context,
      }));

      sceneDialogues.push(dialogueLines);
    }

    dialoguesPerLanguage[lang] = sceneDialogues;
  }

  // 3. Generate storyboard (timing + layout)
  const storyboard = generateStoryboard(episode, []);

  return { episode, dialoguesPerLanguage, storyboard };
}
