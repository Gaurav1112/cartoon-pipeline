// src/compositions/episode1/scenes-lion-rabbit.ts
import type { ViralScene } from './types';

/**
 * Episode 1: "शेर और खरगोश" (The Lion and the Rabbit)
 *
 * Viral structure engineered for 100K+ views:
 * - payoff preview hook (villain first, no intro)
 * - curiosity gap
 * - intro AFTER hook
 * - death-lottery stakes
 * - underdog volunteers
 * - slow-walk comedy
 * - well-trick payoff (most shareable scene)
 * - victory dopamine hit
 * - moral + comedy callback
 * - loop hook (replay trigger)
 *
 * kaaliya = Lion (villain)
 * arjun   = Rabbit (hero)
 */

export const LION_RABBIT_SCENES: ViralScene[] = [
  // ═══════════════════════════════════════════════════════════════════
  // HOOK: 0–3s — Villain speaks FIRST. No narration. Max energy.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'hook',
    bg: 'forest',
    time: 'dusk',
    dur: 'auto',
    chars: [
      { id: 'kaaliya', pos: 'center', pose: 'angry', expr: 'angry' },
    ],
    cam: 'zoom_in',
    camI: 1.0,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'kaaliya',
        text: 'बचोगे नहीं आज!',
        dur: 'auto',
        sfxKey: 'roar',
        textOverlay: '🦁 एक ऐसा शेर...',
        patternInterrupt: 'zoom_punch',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // CURIOSITY GAP: 3–8s — Rabbit's confident face. Scroll-stopper.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'curiosity-gap',
    bg: 'forest',
    time: 'dusk',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'center', pose: 'idle_stand', expr: 'determined' },
    ],
    cam: 'zoom_in',
    camI: 0.8,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'arjun',
        text: 'शेर जी... रुकिए।',
        dur: 'auto',
        sfxKey: 'record_scratch',
        textOverlay: 'जिसे खरगोश ने हराया 🐰',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // INTRO: 8–13s — Branding AFTER hook. Not before.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'intro',
    bg: 'garden',
    time: 'day',
    dur: 5,
    chars: [],
    cam: 'static',
    camI: 0,
    dialogue: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // SETUP: 13–25s — Death lottery. Bablu's best joke FIRST.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'setup',
    bg: 'forest',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'guruji', pos: 'center', pose: 'talk_gesture', expr: 'sad' },
      { id: 'bablu', pos: 'right', pose: 'surprised', expr: 'scared', flip: true },
      { id: 'meera', pos: 'left', pose: 'idle_stand', expr: 'thinking' },
    ],
    cam: 'drift',
    camI: 0.4,
    ambientSfx: 'suspense',
    dialogue: [
      {
        char: 'bablu',
        text: 'रोज़ एक जानवर?!',
        dur: 'auto',
        sfxKey: 'giggle',
        textOverlay: '😱 रोज़ एक जानवर!',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        text: 'हाँ, शेर को रोज़ भोजन चाहिए।',
        dur: 'auto',
        textOverlay: '☠️ रोज़ एक की बलि',
      },
      {
        char: 'meera',
        text: 'सबने मिलकर तय किया।',
        dur: 'auto',
        textOverlay: '🎲 लॉटरी में नाम आएगा...',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // RABBIT VOLUNTEERS: 25–40s — Underdog hero moment.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'volunteer',
    bg: 'forest',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'center', pose: 'point', expr: 'determined' },
      { id: 'bablu', pos: 'right', pose: 'surprised', expr: 'scared', flip: true },
      { id: 'meera', pos: 'left', pose: 'talk_gesture', expr: 'surprised' },
    ],
    cam: 'zoom_in',
    camI: 0.6,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'arjun',
        text: 'मैं जाऊँगा आज।',
        dur: 'auto',
        sfxKey: 'dramatic',
        textOverlay: '🐰 छोटा खरगोश... बड़ी हिम्मत',
        shortsFlag: true,
      },
      {
        char: 'bablu',
        text: 'पर तू बहुत छोटा है!',
        dur: 'auto',
        sfxKey: 'gasp',
        textOverlay: '😂 इसकी हिम्मत देखो!',
        shortsFlag: true,
      },
      {
        char: 'arjun',
        text: 'दिमाग बड़ा है।',
        dur: 'auto',
        textOverlay: '🧠 > 💪',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
      {
        char: 'bablu',
        text: 'गुरुजी बचाओ इसे!',
        dur: 'auto',
        sfxKey: 'rimshot',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // SLOW WALK + LATE ARRIVAL: 40–60s — Comedy + Tension combo.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'late-arrival',
    bg: 'forest',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'left', pose: 'walk_cycle', expr: 'thinking' },
      { id: 'kaaliya', pos: 'right', pose: 'angry', expr: 'angry', flip: true },
      { id: 'guruji', pos: 'center', pose: 'idle_stand', expr: 'neutral' },
    ],
    cam: 'pan_right',
    camI: 0.75,
    dialogue: [
      {
        char: 'guruji',
        text: 'खरगोश जान-बूझकर देर से आया।',
        dur: 'auto',
        sfxKey: 'boing',
        textOverlay: '🐢 बहुत... धीरे...',
      },
      {
        char: 'kaaliya',
        text: 'देर से क्यों आए?!',
        dur: 'auto',
        sfxKey: 'roar',
        textOverlay: '🦁 गुस्से में शेर!',
        patternInterrupt: 'shake',
        shortsFlag: true,
      },
      {
        char: 'arjun',
        text: 'दूसरे शेर ने रोका।',
        dur: 'auto',
        textOverlay: '🤯 दूसरा शेर??',
        shortsFlag: true,
      },
      {
        char: 'kaaliya',
        text: 'क्या?! दूसरा शेर?!',
        dur: 'auto',
        sfxKey: 'shock',
        textOverlay: '😱 दूसरा शेर??',
        patternInterrupt: 'zoom_punch',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // THE WELL TRICK: 60–90s — The payoff. Most shareable 30 seconds.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'well-trick',
    bg: 'well',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'left', pose: 'point', expr: 'determined' },
      { id: 'kaaliya', pos: 'right', pose: 'idle_stand', expr: 'angry', flip: true },
      { id: 'guruji', pos: 'center', pose: 'idle_stand', expr: 'neutral' },
    ],
    cam: 'zoom_in',
    camI: 0.9,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'arjun',
        text: 'वो शेर कुएँ में है।',
        dur: 'auto',
        sfxKey: 'suspense',
        textOverlay: '🕳️ उस कुएँ में...',
        shortsFlag: true,
      },
      {
        char: 'kaaliya',
        text: 'मुझसे बड़ा?! चलो!',
        dur: 'auto',
        sfxKey: 'roar',
        textOverlay: '🦁 अपनी मौत की तरफ...',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        text: 'शेर ने झाँका...',
        dur: 'auto',
        sfxKey: 'suspense',
        textOverlay: '👀 झाँका...',
        shortsFlag: true,
      },
      {
        char: 'kaaliya',
        text: 'तू कौन है?!',
        dur: 'auto',
        sfxKey: 'roar',
        textOverlay: '💀 खुद की परछाई!',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        text: 'शेर कुएँ में कूद गया!',
        dur: 'auto',
        sfxKey: 'splash',
        textOverlay: '🤣 HE BELIEVED IT 💀',
        patternInterrupt: 'zoom_punch',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // VICTORY: 90–105s — Dopamine hit.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'victory',
    bg: 'forest',
    time: 'day',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'center', pose: 'celebrate', expr: 'happy' },
      { id: 'bablu', pos: 'right', pose: 'celebrate', expr: 'happy', flip: true },
      { id: 'meera', pos: 'left', pose: 'wave', expr: 'happy' },
    ],
    cam: 'drift',
    camI: 0.5,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'bablu',
        text: 'भाई! कमाल कर दिया!',
        dur: 'auto',
        sfxKey: 'victory',
        textOverlay: '🎉 GALAXY BRAIN 🧠',
        shortsFlag: true,
      },
      {
        char: 'meera',
        text: 'दिमाग से जीत होती है।',
        dur: 'auto',
        textOverlay: '💡 Brains > Brawn',
        shortsFlag: true,
      },
      {
        char: 'arjun',
        text: 'घबराओ नहीं — सोचो।',
        dur: 'auto',
        textOverlay: '💡 घबराओ नहीं — सोचो',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MORAL: 105–120s — Guruji's question, Bablu comedy callback last.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'moral',
    bg: 'garden',
    time: 'dusk',
    dur: 'auto',
    chars: [
      { id: 'guruji', pos: 'center', pose: 'talk_gesture', expr: 'happy' },
      { id: 'arjun', pos: 'left', pose: 'think', expr: 'thinking' },
      { id: 'bablu', pos: 'right', pose: 'idle_stand', expr: 'happy', flip: true },
    ],
    cam: 'zoom_in',
    camI: 0.5,
    dialogue: [
      {
        char: 'guruji',
        text: 'क्या सीखा बच्चों?',
        dur: 'auto',
        sfxKey: 'reveal',
        textOverlay: '🎓 आज का पाठ',
      },
      {
        char: 'arjun',
        text: 'अक्ल से सब हल होता है।',
        dur: 'auto',
        sfxKey: 'happy_moment',
        textOverlay: '🧠 अक्ल = ताकत',
      },
      {
        char: 'bablu',
        text: 'मेरे पास अक्ल नहीं गुरुजी!',
        dur: 'auto',
        sfxKey: 'rimshot',
        textOverlay: '😭 बेचारा बब्लू',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        text: 'पढ़ाई करो बेटा।',
        dur: 'auto',
        sfxKey: 'giggle',
        textOverlay: '📚 पढ़ाई करो!',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // LOOP HOOK: 120–125s — Echoes frame 0. Triggers rewatch.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'loop-hook',
    bg: 'forest',
    time: 'dusk',
    dur: 'auto',
    chars: [
      { id: 'arjun', pos: 'center', pose: 'point', expr: 'determined' },
      { id: 'kaaliya', pos: 'right', pose: 'angry', expr: 'angry', flip: true },
    ],
    cam: 'zoom_in',
    camI: 0.8,
    dialogue: [
      {
        char: 'kaaliya',
        text: 'बचोगे नहीं तुम!',
        dur: 'auto',
        sfxKey: 'roar',
        textOverlay: '🦁 शुरू से देखो...',
        patternInterrupt: 'zoom_punch',
        shortsFlag: true,
      },
      {
        char: 'arjun',
        text: 'देखते हैं शेर जी!',
        dur: 'auto',
        sfxKey: 'dramatic',
        textOverlay: '🔁 फिर से देखो!',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
    ],
  },
];

/** Index of the intro scene — used by Episode1.tsx to render IntroSequence.
 *  findIndex returns -1 if not found; guard here so callers get a runtime
 *  error at startup rather than silent wrong-scene rendering. */
const _introIdx = LION_RABBIT_SCENES.findIndex(s => s.id === 'intro');
if (_introIdx === -1) {
  throw new Error('[scenes-lion-rabbit] No scene with id "intro" found in LION_RABBIT_SCENES.');
}
export const INTRO_SCENE_INDEX: number = _introIdx;
