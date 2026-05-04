// src/pipeline/lion-rabbit-episode.ts
//
// M14: Adapter that converts the hand-crafted LION_RABBIT_SCENES (ViralScene
// shape consumed by the Episode1 composition) into a CartoonEpisode-shaped
// object the audio pipeline (`generateEpisodeAudio`) understands.
//
// Why this exists: The render pipeline used to render the generic
// `CartoonEpisode` composition driven by the story engine, which produced a
// shorter (~78s) generic episode. All M12/M13 quality work (Kaaliya scar,
// unified moral, real audio drop, fragment cuts, color script) lives in the
// Episode1 composition and the LION_RABBIT_SCENES module — never reached
// production. This adapter unblocks rendering the actual hand-crafted
// 162.3s Hindi episode.
import { LION_RABBIT_SCENES } from '../compositions/episode1/scenes-lion-rabbit';
import { calcEpisodeDuration } from '../compositions/episode1/timing';
import type {
  CartoonEpisode,
  EpisodeScene,
  DialogueLine,
  SceneCharacter,
  CharacterId,
  EmotionType,
  SceneContext,
  Weather,
  CameraMovement,
  MoralTemplate,
} from '../types';
import type { ViralScene, ViralDialogueLine } from '../compositions/episode1/types';

const FPS = 30;

const UNIFIED_MORAL: MoralTemplate = {
  id: 'wit-beats-brawn',
  moralText: 'दिमाग सबसे बड़ा है।',
  category: 'wisdom',
  relatedConflicts: ['intimidation', 'survival', 'underdog'],
};

function viralLineToDialogue(line: ViralDialogueLine): DialogueLine {
  const emotion: EmotionType = line.emotion ?? 'neutral';
  const durationMs =
    typeof line.dur === 'number' ? Math.round((line.dur * 1000) / FPS) : undefined;
  return {
    characterId: line.char,
    text: line.text,
    emotion,
    context: 'introduction' satisfies SceneContext,
    ...(durationMs !== undefined ? { durationMs } : {}),
    ...(line.postGapMs !== undefined ? { postGapMs: line.postGapMs } : {}),
    ...(line.heroMomentScore !== undefined
      ? { heroMomentScore: line.heroMomentScore }
      : {}),
  };
}

function viralSceneToEpisodeScene(scene: ViralScene, sceneIndex: number): EpisodeScene {
  const characters: SceneCharacter[] = scene.chars.map((c) => ({
    characterId: c.id,
    position: c.pos,
    pose: c.pose,
    expression: c.expr,
    ...(c.flip !== undefined ? { flipX: c.flip } : {}),
  }));

  const cameraMovement: CameraMovement = {
    type: (scene.cam === 'shake' || scene.cam === 'close_up' || scene.cam === 'wide'
      ? 'static'
      : scene.cam) as CameraMovement['type'],
    intensity: scene.camI,
  };

  const sfxKeywords: string[] = [];
  if (scene.ambientSfx) sfxKeywords.push(scene.ambientSfx);
  for (const line of scene.dialogue) {
    if (line.sfxKey) sfxKeywords.push(line.sfxKey);
  }

  const dialogueFrames = scene.dialogue.reduce((sum, l) => {
    if (typeof l.dur === 'number') return sum + l.dur;
    return sum + Math.max(30, Math.round((l.text.length * FPS) / 8));
  }, 0);
  const durationFrames =
    typeof scene.dur === 'number' ? scene.dur * FPS : Math.max(30, dialogueFrames);

  return {
    sceneIndex,
    actName: scene.id,
    location: scene.bg,
    timeOfDay: scene.time,
    weather: 'clear' satisfies Weather,
    mood: scene.mood ?? 'neutral',
    characters,
    dialogue: scene.dialogue.map(viralLineToDialogue),
    sfxKeywords,
    cameraMovement,
    durationFrames,
    ...(scene.sceneTailMs !== undefined ? { sceneTailMs: scene.sceneTailMs } : {}),
  };
}

/**
 * Build a CartoonEpisode-shaped object from the hand-crafted LION_RABBIT_SCENES.
 * Currently Hindi-only (M14). Other languages fall back to Hindi text until
 * dedicated translations land in scenes-lion-rabbit.ts (next milestone).
 */
export function buildLionRabbitEpisode(): CartoonEpisode {
  const scenes = LION_RABBIT_SCENES.map(viralSceneToEpisodeScene);

  const charSet = new Set<CharacterId>();
  for (const s of scenes) {
    for (const c of s.characters) charSet.add(c.characterId);
  }

  return {
    seed: 1,
    topicId: 1,
    episodeNumber: 1,
    title: 'शेर और खरगोश',
    storyType: 'folktale',
    seriesName: 'Panchatantra Tales',
    characters: Array.from(charSet),
    scenes,
    moral: UNIFIED_MORAL,
    totalDurationFrames: calcEpisodeDuration(LION_RABBIT_SCENES),
  };
}
