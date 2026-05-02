// src/compositions/episode1/types.ts
import type { CharacterId, LocationType, TimeOfDay } from '../../types';

/** All valid SFX keys mapped to existing sfx-triggers.ts entries */
export type SFXKey =
  | 'roar'          // sfx/animals/lion_roar.mp3
  | 'rabbit_hop'    // sfx/animals/rabbit_hop.mp3
  | 'dramatic'      // sfx/drama/dramatic_sting.mp3
  | 'shock'         // sfx/drama/shock_sting.mp3
  | 'record_scratch'// sfx/comedy/record_scratch.mp3
  | 'victory'       // sfx/drama/victory_fanfare.mp3
  | 'suspense'      // sfx/drama/suspense_build.mp3
  | 'splash'        // sfx/nature/water_splash.mp3
  | 'rimshot'       // sfx/comedy/rimshot.mp3
  | 'boing'         // sfx/comedy/boing.mp3
  | 'reveal'        // sfx/drama/reveal_sting.mp3
  | 'happy_moment'  // sfx/drama/happy_chime.mp3
  | 'giggle'        // sfx/comedy/giggle.mp3
  | 'gasp';         // sfx/drama/crowd_gasp.mp3

export type PatternInterruptType =
  | 'freeze_frame'   // camera freeze + zoom punch on this line's start
  | 'zoom_punch'     // fast zoom in 4 frames then hold
  | 'cut_to_black'   // 6-frame black flash
  | 'shake'          // 8-frame camera shake
  | 'none';

export type CameraType =
  | 'static'
  | 'pan_left'
  | 'pan_right'
  | 'zoom_in'
  | 'zoom_out'
  | 'drift'
  | 'shake';

export interface ViralDialogueLine {
  char: CharacterId;
  text: string;
  /** 'auto' = use calcDialogueDur(text). Number = explicit frame override. */
  dur: 'auto' | number;
  sfxKey?: SFXKey;
  /** Bold on-screen text shown simultaneously with this dialogue line */
  textOverlay?: string;
  patternInterrupt?: PatternInterruptType;
  /** Include this line's scene in the 60s Shorts cut */
  shortsFlag?: boolean;
}

export interface ViralSceneChar {
  id: CharacterId;
  pos: 'left' | 'center' | 'right';
  pose: import('../../types').Pose;
  expr: import('../../types').EmotionType;
  flip?: boolean;
}

export interface ViralScene {
  id: string;
  bg: LocationType;
  time: TimeOfDay;
  /** Total scene duration in seconds (auto-calculated from dialogue if 'auto') */
  dur: 'auto' | number;
  chars: ViralSceneChar[];
  cam: CameraType;
  /** Camera intensity 0–1. Maps to emotional stakes: low=0.2, mid=0.5, high=0.8, peak=1.0 */
  camI: number;
  dialogue: ViralDialogueLine[];
  /** Ambient SFX to play throughout the scene */
  ambientSfx?: SFXKey;
  /** If true, this entire scene is included in the Shorts cut */
  shortsCutScene?: boolean;
}
