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
        // WHY: Specific visceral threat ("you are my food today") > vague menace.
        // "आज तुम मेरा खाना हो!" sets immediate life-or-death stakes in 3s.
        text: 'आज तुम मेरा खाना हो!',
        // MrBeast hook ≤90 frames (3s) — TikTok max-completion sweet spot.
        // Auto would be 129 fr (4.3s); explicit clamp keeps the hook punchy.
        dur: 90,
        sfxKey: 'roar',
        // WHY: Outcome paradox ("a rabbit defeated this lion") triggers "how??"
        // instantly — it's the curiosity gap AND the hook in one textOverlay.
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
      // WHY pose:'point' — rabbit pointing off-screen signals agency + plan.
      // calm 'determined' expression under death-threat IS the scroll-stopper.
      { id: 'arjun', pos: 'center', pose: 'point', expr: 'determined' },
    ],
    cam: 'zoom_in',
    camI: 0.8,
    shortsCutScene: true,
    dialogue: [
      {
        char: 'arjun',
        // WHY: "एक मिनट" is casual, bored. A rabbit saying "one minute" to a
        // lion who wants to eat it inverts the power dynamic — the scroll-stopper
        // is the audacity, not a polite request ("रुकिए" was just asking permission).
        text: 'एक मिनट, शेर जी।',
        dur: 'auto',
        sfxKey: 'record_scratch',
        // WHY: Remove outcome spoiler — "जिसे खरगोश ने हराया" killed all suspense
        // at second 5. "पर कैसे??" mirrors the viewer's exact thought, making them
        // feel understood and keeping them watching to find the answer.
        textOverlay: '🐰 एक छोटा खरगोश... पर कैसे??',
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
    // WHY 3s: 5s of static branding after a charged 8s hook creates a drop-off
    // cliff. 3s is sufficient for logo recognition. Subscribe CTA goes in victory.
    dur: 3,
    chars: [],
    cam: 'static',
    camI: 0,
    dialogue: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // SETUP: 13–25s — Death lottery. Bablu's best joke FIRST.
  // ─────────────────────────────────────────────────────────────────
  // REWRITE (2026-05-02 frame analysis):
  //   Bablu: "रोज़ एक जानवर?!" → extended with self-aware escape punchline.
  //          "मैं तो भागूँ!" adds the comedian's relief-fantasy beat that
  //          the original line was missing. The gasp lands, then the absurd
  //          self-preservation confession delivers the laugh.
  //   Guruji: unchanged — "शेर को रोज़ भोजन चाहिए" already states stakes.
  //   Meera: unchanged — sets up the volunteer scene correctly.
  //   textOverlay on Guruji's line: updated to match stronger framing.
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
        // BEFORE: "रोज़ एक जानवर?!" — gasp with no punchline. Comedy dies.
        // AFTER: gasp + escape-fantasy confession. Two beats = full joke arc.
        // "मैं तो भागूँ!" is the relatable self-preservation punchline that
        // gets the laugh AFTER the shock lands.
        text: 'रोज़ एक जानवर?! मैं तो भागूँ!',
        dur: 'auto',
        sfxKey: 'giggle',
        textOverlay: '😱 रोज़ एक जानवर!',
        shortsFlag: true,
      },
      {
        char: 'guruji',
        // Stakes clarified: "रोज़ भोजन चाहिए" — the ongoing, daily threat.
        text: 'हाँ, शेर को रोज़ भोजन चाहिए।',
        dur: 'auto',
        textOverlay: '☠️ रोज़ एक की बलि',
        // MrBeast 8-sec rule: setup runs 525 fr — needs a visual punch
        // mid-scene to reset attention before retention cliff.
        patternInterrupt: 'freeze_frame',
      },
      {
        char: 'meera',
        // Meera's line seeds the volunteer scene: collective decision = no escape.
        // WHY: "बारी" (one's turn) is the word that makes a child's stomach drop.
        // "तय किया" is past-tense bureaucratic; "हर रोज़ एक की बारी" is present,
        // inevitable, personal — the lottery coming for YOU.
        text: 'इसीलिए हर रोज़ एक की बारी।',
        dur: 'auto',
        textOverlay: '🎲 लॉटरी में नाम आएगा...',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // RABBIT VOLUNTEERS: 25–40s — Underdog hero moment.
  // ─────────────────────────────────────────────────────────────────
  // REWRITE (2026-05-02 frame analysis):
  //   Arjun 1: unchanged — "मैं जाऊँगा आज।" is the hero declaration.
  //   Bablu 1: unchanged — reaction to the declaration.
  //   Meera:   NEW LINE. She was present in chars but silent — silence
  //            reads as indifference. "अर्जुन... ख़याल रखना।" gives her
  //            a role, adds emotional weight, and creates the contrast
  //            that makes Arjun's confident reply land harder.
  //   Arjun 2: unchanged — "दिमाग बड़ा है।" is the moral thesis. The
  //            freeze_frame on this line works correctly as-is.
  //   Bablu 2: unchanged — perfect comedy callback.
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
        char: 'meera',
        // NEW: emotional concern beat. Meera was in chars but had no dialogue.
        // Her silence read as indifference. This brief worried line gives her
        // a role and creates emotional stakes before Arjun's confident reply.
        text: 'सोचो, फिर बोलो — अर्जुन, ख़याल रखना।',
        dur: 'auto',
        textOverlay: '💙 मीरा की चिंता',
      },
      {
        char: 'arjun',
        // The moral thesis. freeze_frame locks this in. Keep concise.
        // WHY "सबसे": Bablu just said "बहुत छोटा" — Arjun flips the adjective.
        // "सबसे" (above all) is the complete, quotable, absolute claim.
        // "बड़ा है" (fragment) vs "सबसे बड़ा है" (complete sentence that answers directly).
        text: 'दिमाग सबसे बड़ा है।',
        dur: 'auto',
        sfxKey: 'reveal',
        textOverlay: '🧠 > 💪',
        patternInterrupt: 'freeze_frame',
        shortsFlag: true,
        // Miyazaki "ma": after the thesis hits, hold 500ms of silence
        // before the next line. The lesson needs air to land.
        postGapMs: 500,
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
  // ─────────────────────────────────────────────────────────────────
  // REWRITE (2026-05-02 frame analysis):
  //   Guruji:  KEPT — perfect slow-walk comedy narration.
  //   Kaaliya: STRENGTHENED — "मैं खाऊँगा!" adds the immediate death
  //            threat that was missing. Peak menace maximises contrast
  //            with Arjun's matter-of-fact reply on the next line.
  //   Arjun:   THE CRITICAL FIX. "दूसरे शेर ने रोका।" (3 words) was the
  //            episode's most important setup line delivered flat.
  //            New: calm apology + specific detail = 3x longer delivery.
  //            "माफ़ करना... रास्ते में दूसरे शेर ने रोका।" sounds like
  //            Arjun is reporting a traffic delay. His total calm against
  //            Kaaliya's fury IS the comedy. The contrast lands the joke.
  //   Kaaliya: "क्या?! दूसरा शेर?!" KEPT — perfect shocked reaction.
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
        // BEFORE: "देर से क्यों आए?!" — anger without lethal edge.
        // AFTER: anger + immediate death threat. "मैं खाऊँगा!" makes the
        // danger visceral and peaks menace — the contrast with Arjun's
        // breezy next line becomes comedic gold.
        // WHY: "आए" is honorific plural — a lion doesn't address its lunch
        // respectfully. "इतनी देर क्यों लगाई?!" is informal outrage-Hindi,
        // "लगाई" = took/caused a delay. Maximises anger-to-calm contrast with
        // Arjun's apology on the next line. Roar SFX + shake patternInterrupt
        // carry the lethal threat without the dialogue needing to spell it out.
        text: 'इतनी देर क्यों लगाई?!',
        dur: 'auto',
        sfxKey: 'roar',
        textOverlay: '🦁 गुस्से में शेर!',
        patternInterrupt: 'shake',
        shortsFlag: true,
      },
      {
        char: 'arjun',
        // BEFORE: "दूसरे शेर ने रोका।" — 3 words, the twist delivered flat.
        //         This is the setup for the well-trick and it was invisible.
        // AFTER: calm apology + specific location detail. Arjun sounds like
        //        he's describing a minor inconvenience. His nonchalance while
        //        a furious lion threatens to eat him IS the comedy. The longer
        //        delivery gives Kaaliya — and the viewer — time to process the
        //        absurdity before the "क्या?!" reaction hits.
        text: 'माफ़ करना... रास्ते में दूसरे शेर ने रोका।',
        dur: 'auto',
        sfxKey: 'suspense',
        textOverlay: '🤯 दूसरा शेर??',
        patternInterrupt: 'freeze_frame',
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
        // WHY: Active voice mirrors Arjun's cadence. Passive "दिमाग से जीत होती है"
        // reads like a blackboard caption. "ताकत से नहीं — अक्ल से।" is what
        // someone says AFTER watching something happen. The dash creates a beat.
        text: 'ताकत से नहीं — अक्ल से।',
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
        // Miyazaki "ma" + MrBeast 8-sec rule converge: freeze on the moral
        // thesis lets the lesson land AND breaks the retention cliff.
        // 600ms post-line silence = the lesson hits a beat of stillness.
        patternInterrupt: 'freeze_frame',
        postGapMs: 600,
      },
      {
        char: 'bablu',
        text: 'मेरे पास अक्ल नहीं गुरुजी!',
        dur: 'auto',
        sfxKey: 'rimshot',
        textOverlay: '😭 बेचारा बब्लू',
        shortsFlag: true,
        // Comedy beat lands harder with a freeze on the punchline.
        patternInterrupt: 'freeze_frame',
      },
      {
        char: 'guruji',
        text: 'पढ़ाई करो बेटा। धैर्य ही विजय है।',
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
        // WHY "आज नहीं बचोगे!": echoes the hook's "आज तुम मेरा खाना हो!" — both
        // start with "आज", creating a bookend that rewards rewatchers. Correct
        // Hindi stress (आज at front = emphasis on TODAY, not on escaping).
        text: 'आज नहीं बचोगे!',
        dur: 'auto',
        sfxKey: 'roar',
        textOverlay: '🦁 याद है ये शेर? शुरू से देखो!',
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
