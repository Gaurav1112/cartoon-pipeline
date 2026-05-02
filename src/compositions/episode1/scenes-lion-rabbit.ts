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
    ambientSfx: 'breeze',       // Forest dusk ambience under the hook
    shortsCutScene: true,
    dialogue: [
      {
        char: 'kaaliya',
        // WHY: "आज तुम मेरा खाना हो!" shifts the threat from abstract
        // ("you won't escape") to visceral and specific — the viewer
        // instantly understands: this rabbit is about to be eaten RIGHT NOW.
        // Specific stakes land harder than vague menace on a 3-second hook.
        text: 'आज तुम मेरा खाना हो!',
        dur: 'auto',
        sfxKey: 'roar',
        // WHY: "इस शेर को एक खरगोश ने मात दी" replaces a vague genre label
        // with a specific outcome paradox. It creates an immediate "how??"
        // reaction — the textOverlay itself IS the curiosity gap opener.
        textOverlay: '🦁 इस शेर को एक खरगोश ने मात दी',
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
      // WHY expr change: 'determined' over 'surprised'. The rabbit already
      // knows his plan — he is not confused, he is calm. That calm in the
      // face of a lion threatening to eat him is the scroll-stopper.
      // pose changed to 'point' to signal agency: he is pointing at something
      // off-screen (the well, though the viewer doesn't know that yet).
      { id: 'arjun', pos: 'center', pose: 'point', expr: 'determined' },
    ],
    cam: 'zoom_in',
    camI: 0.8,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'arjun',
        // WHY: "मेरे पास एक राज़ है, शेर जी।" is audacious, not polite.
        // It withholds the information (what secret?) while communicating
        // power — the rabbit has leverage the lion doesn't know about.
        // The original "रुकिए" was a request; this is a negotiation opening.
        text: 'मेरे पास एक राज़ है, शेर जी।',
        dur: 'auto',
        sfxKey: 'record_scratch',
        // WHY: Remove the outcome spoiler. "जिसे खरगोश ने हराया" told the
        // viewer the rabbit wins — killing all suspense at second 5.
        // "पर कैसे??" withholds the answer and ASKS the question the viewer
        // is already thinking, making them feel understood and keeping them watching.
        textOverlay: '🐰 एक छोटा खरगोश... पर कैसे??',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // INTRO: 8–11s — Branding AFTER hook. Not before.
  // WHY 3s not 5s: 5 seconds of static branding after a charged 8s hook
  // creates a momentum cliff. Shorts analytics show drop-off spikes at
  // any energy decrease. 3 seconds is enough for logo recognition without
  // breaking the dopamine chain built in 0–8s. Subscribe overlay in the
  // victory scene handles the CTA without requiring a long intro card.
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'intro',
    bg: 'garden',
    time: 'day',
    dur: 3,
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
      { id: 'guruji', pos: 'center', pose: 'talk_gesture', expr: 'neutral' },
      { id: 'bablu', pos: 'right', pose: 'surprised', expr: 'scared', flip: true },
      { id: 'meera', pos: 'left', pose: 'talk_gesture', expr: 'thinking' },
    ],
    cam: 'drift',
    camI: 0.4,
    ambientSfx: 'suspense',
    dialogue: [
      {
        char: 'bablu',
        text: 'रोज़ एक जानवर?!',
        dur: 'auto',
        sfxKey: 'gasp',          // Bablu is terrified (expr: scared) — gasp, not giggle
        textOverlay: '😱 रोज़ एक जानवर!',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        text: 'हाँ, शेर को रोज़ भोजन चाहिए।',
        dur: 'auto',
        sfxKey: 'suspense',
        textOverlay: '☠️ रोज़ एक की बलि',
      },
      {
        char: 'meera',
        text: 'सबने मिलकर तय किया।',
        dur: 'auto',
        sfxKey: 'mystery',       // Meera's foreshadowing line — mystery sting
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
    camI: 0.7,
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
        sfxKey: 'reveal',        // Brain-over-brawn reveal moment — reveal sting
        textOverlay: '🧠 > 💪',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
      },
      {
        char: 'bablu',
        text: 'गुरुजी बचाओ इसे!',
        dur: 'auto',
        sfxKey: 'rimshot',
        textOverlay: '😂 बब्लू की दुआ!',
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
        sfxKey: 'cartoon_run',   // Deliberate slow walk comedy — cartoon_run fits the plodding humor
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
        sfxKey: 'suspense',     // Big twist reveal — suspense sting before Kaaliya's shock
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
      { id: 'kaaliya', pos: 'right', pose: 'angry', expr: 'angry', flip: true },
      { id: 'guruji', pos: 'center', pose: 'idle_stand', expr: 'surprised' },
    ],
    cam: 'zoom_in',
    camI: 0.9,
    ambientSfx: 'pond',         // Water ambience sets the physical reality of the well
    shortsCutScene: true,
    dialogue: [
      // FIX (CRITICAL): "कुएँ में है" gave Kaaliya no reason to believe it.
      // Ego-trap needs (a) WHERE the rival lives and (b) HOW BIG — two beats
      // that prime the jealousy BEFORE "मुझसे बड़ा?!" can land. Without the
      // size-brag the lion has no reason to react. Split into two short lines.
      {
        char: 'arjun',
        text: 'वो शेर उस कुएँ में है।',
        dur: 'auto',
        sfxKey: 'suspense',
        textOverlay: '🕳️ उस कुएँ में...',
        shortsFlag: true,
      },
      {
        char: 'arjun',
        text: 'बड़ा भी, खतरनाक भी!',
        dur: 'auto',
        sfxKey: 'suspense',
        textOverlay: '😱 तुमसे भी बड़ा?!',
        // No shortsFlag: size-brag is context for the ego-trap, not a Shorts highlight
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
        text: '...',
        dur: 30,
        sfxKey: 'heartbeat',
        textOverlay: '💓 ...',
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
      // FIX: Post-splash silent beat (~1.4s). The SPLASH is the biggest
      // payoff of the episode. Cutting immediately to victory music robs
      // viewers of the processing beat. Arjun stares at the well — stillness
      // after chaos is classic comedy timing (the "takes a moment" beat).
      {
        char: 'arjun',
        text: '...',
        dur: 36,
        textOverlay: '🐰 ...',
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
    camI: 0.7,
    ambientSfx: 'birds',        // Forest birds enhance the post-victory celebration
    dialogue: [
      {
        char: 'bablu',
        text: 'भाई! कमाल कर दिया!',
        dur: 'auto',
        sfxKey: 'victory',
        textOverlay: '🎉 GALAXY BRAIN 🧠',
        shortsFlag: true,
      },
      // FIX: Bablu's emotional arc callback. He said "गुरुजी बचाओ इसे!" when
      // Arjun volunteered. Now he confesses how scared he was — this completes
      // his arc (terrified sidekick → relieved witness) and rewards viewers who
      // paid attention to that earlier line. Keeps the burst energy going.
      {
        char: 'bablu',
        text: 'मैं डरा था! सच में!',
        dur: 'auto',
        sfxKey: 'giggle',
        textOverlay: '😅 बब्लू था डरा हुआ!',
        // No shortsFlag: callback arc pays off for full-episode viewers; Shorts
        // already has enough energy from Bablu's first burst line
      },
      {
        char: 'meera',
        // FIX: "दिमाग से जीत होती है" is the academic passive voice. This
        // punched-up version uses active construction ("दिमाग हो तो") that
        // mirrors Arjun's imperative cadence — same char count, more punch.
        text: 'दिमाग हो तो ताकत क्यों चाहिए?',
        dur: 'auto',
        sfxKey: 'applause',
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
    camI: 0.6,
    dialogue: [
      {
        char: 'guruji',
        // FIX: "क्या सीखा बच्चों?" is an abrupt cold cut from victory energy.
        // "अब बताओ — क्या सीखा?" starts with the connective "अब" (now/having
        // seen that) which anchors the lesson to the story just witnessed,
        // turning the scene break into a natural rhetorical follow-through.
        text: 'अब बताओ — क्या सीखा?',
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
        // FIX: "फिर से देखो!" is a generic CTA. "याद है ये शेर? 🦁" explicitly
        // echoes the opening frame — creates the loop recognition that triggers
        // the rewatch. Viewer's brain connects END → START consciously.
        textOverlay: '🦁 याद है ये शेर? शुरू से देखो!',
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
