export type { SupportedLanguage, CharacterId, EmotionType, SceneContext } from '../types';

export interface DialogueLine {
  id: string;
  text: string;
  character: import('../types').CharacterId;
  emotion: import('../types').EmotionType;
  context: import('../types').SceneContext;
  tags: string[];
}

export interface DialogueBank {
  language: import('../types').SupportedLanguage;
  lines: DialogueLine[];
}

export interface DialogueQuery {
  character: import('../types').CharacterId;
  emotion?: import('../types').EmotionType;
  context: import('../types').SceneContext;
  tags?: string[];
}

export interface DialogueSelection {
  line: DialogueLine;
  alternatives: DialogueLine[];
}
