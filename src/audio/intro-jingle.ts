import type { AudioLayer } from '../types';

export const INTRO_JINGLE_SFX_FILE = 'sfx/intro/jingle.mp3';
export const INTRO_JINGLE_VOLUME_DB = -6;

/**
 * M9 — Peppa/Bheem-style cold-open branding moment.
 *
 * Schedules the 3s intro jingle at the absolute start of every episode
 * (startMs=0) so the very first sound a viewer hears is the show's
 * sonic logo. Without this, the timeline opens silent until the first
 * dialogue line, which is a YouTube retention cliff for ages 4-10.
 *
 * Pure function — deterministic by construction. The jingle is a
 * fixed asset, the start time is hard-locked to zero, and ducking is
 * off because dialogue does not begin until the title card resolves.
 */
export function planIntroJingleLayer(): AudioLayer[] {
  return [
    {
      type: 'sfx',
      filePath: `public/audio/${INTRO_JINGLE_SFX_FILE}`,
      startMs: 0,
      volumeDb: INTRO_JINGLE_VOLUME_DB,
      duckDuringDialogue: false,
    },
  ];
}
