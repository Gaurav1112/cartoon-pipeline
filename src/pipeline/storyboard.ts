import type { CartoonEpisode, Storyboard, StoryboardScene, WordTimestamp } from '../types';

const FPS = 30;

export function generateStoryboard(
  episode: CartoonEpisode,
  _audioTimestamps: WordTimestamp[],
): Storyboard {
  const introFrames = 15 * FPS;   // 15s intro
  const moralFrames = 10 * FPS;   // 10s moral card
  const outroFrames = 10 * FPS;   // 10s outro

  let currentFrame = introFrames;
  const scenes: StoryboardScene[] = [];

  for (const scene of episode.scenes) {
    scenes.push({
      sceneIndex: scene.sceneIndex,
      startFrame: currentFrame,
      durationFrames: scene.durationFrames,
      characters: scene.characters,
      cameraMovement: scene.cameraMovement,
    });
    currentFrame += scene.durationFrames;
  }

  const totalFrames = currentFrame + moralFrames + outroFrames;
  const totalDurationMs = (totalFrames / FPS) * 1000;

  return { scenes, totalFrames, totalDurationMs };
}
