import type { CartoonEpisode, Storyboard, StoryboardScene, WordTimestamp } from '../types';

const FPS = 30;

export function generateStoryboard(
  episode: CartoonEpisode,
  _audioTimestamps: WordTimestamp[],
): Storyboard {
  const introFrames = 5 * FPS;    // 5s intro (matches CartoonEpisode.tsx)
  const moralFrames = 8 * FPS;    // 8s moral card
  const outroFrames = 6 * FPS;    // 6s outro

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
