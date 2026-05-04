// ─── Cartoon Pipeline — Master Type Definitions ───────────────────────────

// ─── Language & Identity ──────────────────────────────────────────────────

export type SupportedLanguage = 'hi' | 'te' | 'ta' | 'kn' | 'mr' | 'bn' | 'en';

export const LANGUAGES: SupportedLanguage[] = ['hi', 'te', 'ta', 'kn', 'mr', 'bn', 'en'];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  mr: 'Marathi',
  bn: 'Bengali',
  en: 'English',
};

export type CharacterId =
  | 'arjun'
  | 'meera'
  | 'bablu'
  | 'guruji'
  | 'kaaliya'
  | 'amma'
  | 'raja'
  | 'moti';

export type CharacterArchetype =
  | 'hero_child'
  | 'smart_girl'
  | 'comic_sidekick'
  | 'wise_elder'
  | 'villain'
  | 'mother'
  | 'king'
  | 'animal';

export type AnimalSkin =
  | 'fox'
  | 'crow'
  | 'lion'
  | 'rabbit'
  | 'turtle'
  | 'monkey'
  | 'elephant'
  | 'mouse'
  | 'snake'
  | 'deer';

// ─── Emotion, Pose, Mouth ─────────────────────────────────────────────────

export type EmotionType =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'scared'
  | 'surprised'
  | 'thinking'
  | 'determined';

export type Pose =
  | 'idle_stand'
  | 'idle_sit'
  | 'walk_cycle'
  | 'talk_gesture'
  | 'point'
  | 'surprised'
  | 'sad'
  | 'angry'
  | 'laugh'
  | 'think'
  | 'wave'
  | 'celebrate';

/** Rhubarb lip-sync mouth shapes A–H */
export type MouthShape = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

// ─── Locations ────────────────────────────────────────────────────────────

export type LocationType =
  | 'forest'
  | 'village'
  | 'palace'
  | 'river'
  | 'market'
  | 'temple'
  | 'school'
  | 'cave'
  | 'mountain'
  | 'garden'
  | 'beach'
  | 'desert'
  | 'farm'
  | 'bridge'
  | 'waterfall'
  | 'fort'
  | 'library'
  | 'kitchen'
  | 'courtyard'
  | 'pond'
  | 'road'
  | 'hilltop'
  | 'harbor'
  | 'ruins'
  | 'treehouse'
  | 'well'
  | 'battlefield'
  | 'shrine'
  | 'swamp'
  | 'meadow';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type Weather = 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy';

// ─── Story Templates ──────────────────────────────────────────────────────

export type StoryType = 'moral' | 'adventure' | 'riddle' | 'folktale';

export interface ActTemplate {
  name: string;
  scenes: number;
  purpose: string;
  mood: string;
  requiredArchetypes?: CharacterArchetype[];
}

export interface StoryTemplate {
  id: string;
  type: StoryType;
  acts: ActTemplate[];
  requiredCharacters: CharacterArchetype[];
  settingType: LocationType;
  moralCategory: string;
}

// ─── Scene Context ────────────────────────────────────────────────────────

export type SceneContext =
  | 'greeting'
  | 'conflict'
  | 'resolution'
  | 'moral'
  | 'reaction'
  | 'narration'
  | 'riddle_question'
  | 'riddle_answer'
  | 'celebration'
  | 'threat'
  | 'comfort'
  | 'challenge'
  | 'discovery'
  | 'farewell'
  | 'introduction';

// ─── Episode & Scenes ─────────────────────────────────────────────────────

export interface DialogueLine {
  characterId: CharacterId;
  text: string;
  emotion: EmotionType;
  context: SceneContext;
  durationMs?: number;
  /**
   * Override post-line silence (ms). Default 200.
   * Murch L-cut: small (80-120) for tight overlap.
   * Miyazaki "ma": large (400-700) for moral landings.
   */
  postGapMs?: number;
  /**
   * M4.2 (MrBeast cut planner): 0..1 score for how "stinger-worthy"
   * this line is. The cut planner uses these to assemble 15s/30s/60s
   * variant plans without re-rendering. Default 0 = filler.
   */
  heroMomentScore?: number;
}

export interface EpisodeScene {
  sceneIndex: number;
  actName: string;
  location: LocationType;
  timeOfDay: TimeOfDay;
  weather: Weather;
  mood: string;
  characters: SceneCharacter[];
  dialogue: DialogueLine[];
  sfxKeywords: string[];
  cameraMovement: CameraMovement;
  durationFrames: number;
  /** Optional Miyazaki "ma" override (M2.4). Default 300 ms tail silence
   * after the last line of the scene. Use 0 for hard cut, 500+ for landings. */
  sceneTailMs?: number;
}

export interface SceneCharacter {
  characterId: CharacterId;
  position: 'left' | 'center' | 'right';
  pose: Pose;
  expression: EmotionType;
  animalSkin?: AnimalSkin;
  flipX?: boolean;
}

export interface CameraMovement {
  type: 'static' | 'pan_left' | 'pan_right' | 'zoom_in' | 'zoom_out' | 'drift';
  intensity: number; // 0–1
}

export interface CartoonEpisode {
  seed: number;
  topicId: number;
  episodeNumber: number;
  title: string;
  storyType: StoryType;
  seriesName: string;
  characters: CharacterId[];
  scenes: EpisodeScene[];
  moral: MoralTemplate;
  totalDurationFrames: number;
}

// ─── Character Profiles ───────────────────────────────────────────────────

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  archetype: CharacterArchetype;
  description: string;
  colors: { primary: string; secondary: string; accent: string; skin: string };
  voiceProfile: VoiceProfile;
  /** Per-language signature catchphrase. Repeated across episodes — kid-appeal anchor. */
  catchphrase?: Partial<Record<SupportedLanguage, string>>;
}

export interface AnimalSkinConfig {
  id: AnimalSkin;
  name: string;
  bodyColor: string;
  headShape: 'round' | 'pointed' | 'wide' | 'long';
  earType: 'pointed' | 'round' | 'long' | 'none';
  tailType: 'long' | 'short' | 'bushy' | 'thin' | 'none';
  specialFeatures: string[];
  scale: number;
}

// ─── Voice & Audio ────────────────────────────────────────────────────────

export interface VoiceProfile {
  pitchShift: number;   // semitones
  speedFactor: number;
  eqProfile: 'none' | 'nasal' | 'warm' | 'reverb';
  volume: number;       // 0–1
}

export interface CharacterVoice {
  characterId: CharacterId;
  language: SupportedLanguage;
  baseVoice: string;      // edge-tts voice name
  profile: VoiceProfile;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  format: 'mp3' | 'wav';
}

export interface MouthCue {
  start: number;  // seconds
  end: number;
  shape: MouthShape;
}

export interface WordTimestamp {
  word: string;
  start: number;  // seconds
  end: number;
  characterId: CharacterId;
}

export interface AudioLayer {
  type: 'dialogue' | 'sfx' | 'music' | 'ambience';
  filePath: string;
  startMs: number;
  volumeDb: number;
  duckDuringDialogue?: boolean;
  duckedVolumeDb?: number;
  fadeInMs?: number;
  fadeOutMs?: number;
}

export interface MasterAudioResult {
  masterAudioPath: string;
  totalDurationMs: number;
  wordTimestamps: WordTimestamp[];
  mouthCuesPerCharacter: Record<CharacterId, MouthCue[]>;
  sfxTriggers: SFXTriggerResult[];
  /** M5.3 — beat-aligned hero-moment swell envelope (optional). */
  heroSwellEnvelope?: { startMs: number; endMs: number; gainDb: number; attackMs: number; releaseMs: number }[];
  /**
   * M16 (audit-v13 Lievsay/Pookutty A/V sync fix): per-scene per-line
   * actual TTS durations measured by ffprobe at audio render time.
   * Visual track reads these to set `Sequence.durationInFrames` so video
   * length matches audio length exactly — eliminates the 97s silence
   * tail that came from `calcDialogueDur` over-estimating Hindi TTS by
   * 2.5–3x. Optional: callers without audioData fall back to estimates.
   */
  sceneDialogueTimings?: Array<{
    sceneIndex: number;
    lineDurationsMs: number[];
    postGapsMs: number[];
    sceneTailMs: number;
  }>;
}

// ─── SFX & Music ──────────────────────────────────────────────────────────

export interface SFXTrigger {
  keyword: string;
  sfxFile: string;
  category: string;
  defaultVolume: number;
}

export interface SFXTriggerResult {
  sfxFile: string;
  trigger: string;
  volume: number;
  timing: 'before' | 'during' | 'after';
  startMs: number;
}

export interface AmbienceLoop {
  locationType: LocationType;
  filePath: string;
  description: string;
  volumeDb: number;
}

export interface MusicTrack {
  file: string;
  mood: string;
  bpm: number;
  loopable: boolean;
  fadeInMs: number;
  fadeOutMs: number;
}

// ─── Conflicts & Morals ───────────────────────────────────────────────────

export interface ConflictTemplate {
  id: string;
  description: string;
  requiredArchetypes: CharacterArchetype[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface MoralTemplate {
  id: string;
  moralText: string;
  category: string;
  relatedConflicts: string[];
}

// ─── Location / Setting ───────────────────────────────────────────────────

export interface LocationSetting {
  id: LocationType;
  name: string;
  description: string;
  ambienceType: string;
  defaultProps: string[];
  mood: string;
}

// ─── Story Bank ───────────────────────────────────────────────────────────

export interface StoryBankEntry {
  id: string;
  title: string;
  summary: string;
  characters: string[];
  setting: string;
  moral: string;
  acts: { name: string; summary: string }[];
}

// ─── Poses & Expressions (rendering data) ─────────────────────────────────

export interface PoseData {
  leftArm: { angle: number; x: number; y: number };
  rightArm: { angle: number; x: number; y: number };
  leftLeg: { angle: number; x: number; y: number };
  rightLeg: { angle: number; x: number; y: number };
  bodyTilt: number;
  headTilt: number;
}

export interface ExpressionData {
  eyeShape: 'normal' | 'wide' | 'narrow' | 'closed' | 'squint';
  eyebrowAngle: number;    // degrees, negative = frown
  mouthDefault: MouthShape;
  pupilSize: number;       // 0–1
}

export interface MouthShapeParams {
  width: number;
  height: number;
  shape: 'ellipse' | 'line' | 'circle';
  teethVisible: boolean;
  openness: number; // 0–1
}

// ─── Remotion Composition Props ───────────────────────────────────────────

export interface CartoonEpisodeProps {
  episode: CartoonEpisode;
  audioData: MasterAudioResult;
  language: SupportedLanguage;
}

export interface SceneRendererProps {
  scene: EpisodeScene;
  mouthCues: Record<CharacterId, MouthCue[]>;
  startFrame: number;
}

// ─── Storyboard ───────────────────────────────────────────────────────────

export interface Storyboard {
  scenes: StoryboardScene[];
  totalFrames: number;
  totalDurationMs: number;
}

export interface StoryboardScene {
  sceneIndex: number;
  startFrame: number;
  durationFrames: number;
  characters: SceneCharacter[];
  cameraMovement: CameraMovement;
}

// ─── Metadata & Distribution ──────────────────────────────────────────────

export interface MetadataFile {
  title: string;
  description: string;
  tags: string[];
  playlistTitle: string;
  language: SupportedLanguage;
  episodeNumber: number;
  thumbnailFrame?: number;
}

export interface ChannelConfig {
  language: SupportedLanguage;
  channelId: string;
  name: string;
  playlistPrefix: string;
}

export interface PublishQueueEntry {
  episodeNumber: number;
  scheduledDate: string; // ISO 8601
  languages: SupportedLanguage[];
  status: 'pending' | 'uploading' | 'published' | 'failed';
}

export interface EpisodeRegistryEntry {
  episodeNumber: number;
  renderedAt?: string;
  uploadedAt?: string;
  languages: Partial<Record<SupportedLanguage, {
    rendered: boolean;
    uploaded: boolean;
    videoId?: string;
  }>>;
}

export interface EpisodeRegistry {
  episodes: Record<number, EpisodeRegistryEntry>;
  lastRendered: number;
  lastUploaded: number;
}

export interface PublishQueue {
  queue: PublishQueueEntry[];
  schedule: {
    days: string[];
    time: string;
    timezone: string;
  };
}

// ─── Full Episode Data (pipeline output) ──────────────────────────────────

export interface FullEpisodeData {
  episode: CartoonEpisode;
  dialoguesPerLanguage: Record<SupportedLanguage, DialogueLine[][]>;
  storyboard: Storyboard;
}

export interface RenderResult {
  episodeNumber: number;
  outputDir: string;
  videos: Record<SupportedLanguage, string>;   // language → mp4 path
  metadata: Record<SupportedLanguage, MetadataFile>;
  duration: number; // total render time in ms
}
