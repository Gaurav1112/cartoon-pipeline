interface SFXEntry {
  keyword: string;
  sfxFile: string;
  category: string;
  defaultVolume: number;
}

export interface SFXMatch {
  sfxFile: string;
  trigger: string;
  volume: number;
  timing: 'before' | 'during' | 'after';
}

const SFX_DATABASE: SFXEntry[] = [
  // ─── Nature (25) ────────────────────────────────────
  { keyword: 'wind', sfxFile: 'sfx/nature/wind.mp3', category: 'nature', defaultVolume: 0.4 },
  { keyword: 'rain', sfxFile: 'sfx/nature/rain.mp3', category: 'nature', defaultVolume: 0.5 },
  { keyword: 'thunder', sfxFile: 'sfx/nature/thunder.mp3', category: 'nature', defaultVolume: 0.7 },
  { keyword: 'river', sfxFile: 'sfx/nature/river_flow.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'birds', sfxFile: 'sfx/nature/birds_chirp.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'crickets', sfxFile: 'sfx/nature/crickets.mp3', category: 'nature', defaultVolume: 0.2 },
  { keyword: 'fire', sfxFile: 'sfx/nature/fire_crackle.mp3', category: 'nature', defaultVolume: 0.4 },
  { keyword: 'waterfall', sfxFile: 'sfx/nature/waterfall.mp3', category: 'nature', defaultVolume: 0.5 },
  { keyword: 'ocean', sfxFile: 'sfx/nature/ocean_waves.mp3', category: 'nature', defaultVolume: 0.4 },
  { keyword: 'leaves', sfxFile: 'sfx/nature/rustling_leaves.mp3', category: 'nature', defaultVolume: 0.2 },
  { keyword: 'earthquake', sfxFile: 'sfx/nature/earthquake_rumble.mp3', category: 'nature', defaultVolume: 0.8 },
  { keyword: 'storm', sfxFile: 'sfx/nature/storm.mp3', category: 'nature', defaultVolume: 0.7 },
  { keyword: 'drip', sfxFile: 'sfx/nature/water_drip.mp3', category: 'nature', defaultVolume: 0.2 },
  { keyword: 'sunrise', sfxFile: 'sfx/nature/morning_ambience.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'night', sfxFile: 'sfx/nature/night_ambience.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'frog', sfxFile: 'sfx/nature/frog_ribbit.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'bee', sfxFile: 'sfx/nature/bee_buzz.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'tree', sfxFile: 'sfx/nature/tree_creak.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'splash', sfxFile: 'sfx/nature/water_splash.mp3', category: 'nature', defaultVolume: 0.6 },
  { keyword: 'breeze', sfxFile: 'sfx/nature/gentle_breeze.mp3', category: 'nature', defaultVolume: 0.2 },
  { keyword: 'flood', sfxFile: 'sfx/nature/flood_rush.mp3', category: 'nature', defaultVolume: 0.7 },
  { keyword: 'cave', sfxFile: 'sfx/nature/cave_echo.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'sand', sfxFile: 'sfx/nature/sand_wind.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'snow', sfxFile: 'sfx/nature/snow_crunch.mp3', category: 'nature', defaultVolume: 0.3 },
  { keyword: 'pond', sfxFile: 'sfx/nature/pond_splash.mp3', category: 'nature', defaultVolume: 0.3 },

  // ─── Actions (30) ───────────────────────────────────
  { keyword: 'footsteps', sfxFile: 'sfx/actions/footsteps_dirt.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'running', sfxFile: 'sfx/actions/running.mp3', category: 'actions', defaultVolume: 0.5 },
  { keyword: 'door', sfxFile: 'sfx/actions/door_open.mp3', category: 'actions', defaultVolume: 0.5 },
  { keyword: 'knock', sfxFile: 'sfx/actions/door_knock.mp3', category: 'actions', defaultVolume: 0.6 },
  { keyword: 'crash', sfxFile: 'sfx/actions/crash.mp3', category: 'actions', defaultVolume: 0.8 },
  { keyword: 'break', sfxFile: 'sfx/actions/glass_break.mp3', category: 'actions', defaultVolume: 0.7 },
  { keyword: 'sword', sfxFile: 'sfx/actions/sword_clang.mp3', category: 'actions', defaultVolume: 0.7 },
  { keyword: 'bow', sfxFile: 'sfx/actions/bow_release.mp3', category: 'actions', defaultVolume: 0.5 },
  { keyword: 'arrow', sfxFile: 'sfx/actions/arrow_whoosh.mp3', category: 'actions', defaultVolume: 0.5 },
  { keyword: 'throw', sfxFile: 'sfx/actions/throw_whoosh.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'catch', sfxFile: 'sfx/actions/catch_grab.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'climb', sfxFile: 'sfx/actions/climbing.mp3', category: 'actions', defaultVolume: 0.3 },
  { keyword: 'jump', sfxFile: 'sfx/actions/jump_land.mp3', category: 'actions', defaultVolume: 0.5 },
  { keyword: 'fall', sfxFile: 'sfx/actions/fall_thud.mp3', category: 'actions', defaultVolume: 0.6 },
  { keyword: 'eat', sfxFile: 'sfx/actions/eating_crunch.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'drink', sfxFile: 'sfx/actions/drinking_gulp.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'write', sfxFile: 'sfx/actions/writing_scratch.mp3', category: 'actions', defaultVolume: 0.2 },
  { keyword: 'dig', sfxFile: 'sfx/actions/digging.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'hammer', sfxFile: 'sfx/actions/hammer_strike.mp3', category: 'actions', defaultVolume: 0.6 },
  { keyword: 'bell', sfxFile: 'sfx/actions/bell_ring.mp3', category: 'actions', defaultVolume: 0.5 },
  { keyword: 'clap', sfxFile: 'sfx/actions/clap.mp3', category: 'actions', defaultVolume: 0.5 },
  { keyword: 'whistle', sfxFile: 'sfx/actions/whistle.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'drum', sfxFile: 'sfx/actions/drum_beat.mp3', category: 'actions', defaultVolume: 0.5 },
  { keyword: 'rope', sfxFile: 'sfx/actions/rope_pull.mp3', category: 'actions', defaultVolume: 0.3 },
  { keyword: 'net', sfxFile: 'sfx/actions/net_throw.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'lock', sfxFile: 'sfx/actions/lock_click.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'pot', sfxFile: 'sfx/actions/pot_clang.mp3', category: 'actions', defaultVolume: 0.5 },
  { keyword: 'cooking', sfxFile: 'sfx/actions/cooking_sizzle.mp3', category: 'actions', defaultVolume: 0.4 },
  { keyword: 'sweep', sfxFile: 'sfx/actions/sweeping.mp3', category: 'actions', defaultVolume: 0.3 },
  { keyword: 'cart', sfxFile: 'sfx/actions/cart_wheels.mp3', category: 'actions', defaultVolume: 0.4 },

  // ─── Animals (25) ───────────────────────────────────
  { keyword: 'roar', sfxFile: 'sfx/animals/lion_roar.mp3', category: 'animals', defaultVolume: 0.8 },
  { keyword: 'bark', sfxFile: 'sfx/animals/dog_bark.mp3', category: 'animals', defaultVolume: 0.5 },
  { keyword: 'neigh', sfxFile: 'sfx/animals/horse_neigh.mp3', category: 'animals', defaultVolume: 0.6 },
  { keyword: 'elephant', sfxFile: 'sfx/animals/elephant_trumpet.mp3', category: 'animals', defaultVolume: 0.8 },
  { keyword: 'monkey', sfxFile: 'sfx/animals/monkey_chatter.mp3', category: 'animals', defaultVolume: 0.5 },
  { keyword: 'snake', sfxFile: 'sfx/animals/snake_hiss.mp3', category: 'animals', defaultVolume: 0.4 },
  { keyword: 'crow', sfxFile: 'sfx/animals/crow_caw.mp3', category: 'animals', defaultVolume: 0.5 },
  { keyword: 'parrot', sfxFile: 'sfx/animals/parrot_squawk.mp3', category: 'animals', defaultVolume: 0.5 },
  { keyword: 'owl', sfxFile: 'sfx/animals/owl_hoot.mp3', category: 'animals', defaultVolume: 0.4 },
  { keyword: 'cow', sfxFile: 'sfx/animals/cow_moo.mp3', category: 'animals', defaultVolume: 0.4 },
  { keyword: 'cat', sfxFile: 'sfx/animals/cat_meow.mp3', category: 'animals', defaultVolume: 0.4 },
  { keyword: 'wolf', sfxFile: 'sfx/animals/wolf_howl.mp3', category: 'animals', defaultVolume: 0.7 },
  { keyword: 'deer', sfxFile: 'sfx/animals/deer_call.mp3', category: 'animals', defaultVolume: 0.4 },
  { keyword: 'peacock', sfxFile: 'sfx/animals/peacock_call.mp3', category: 'animals', defaultVolume: 0.5 },
  { keyword: 'tiger', sfxFile: 'sfx/animals/tiger_growl.mp3', category: 'animals', defaultVolume: 0.7 },
  { keyword: 'donkey', sfxFile: 'sfx/animals/donkey_bray.mp3', category: 'animals', defaultVolume: 0.6 },
  { keyword: 'mouse', sfxFile: 'sfx/animals/mouse_squeak.mp3', category: 'animals', defaultVolume: 0.3 },
  { keyword: 'turtle', sfxFile: 'sfx/animals/turtle_slow.mp3', category: 'animals', defaultVolume: 0.2 },
  { keyword: 'fish', sfxFile: 'sfx/animals/fish_splash.mp3', category: 'animals', defaultVolume: 0.3 },
  { keyword: 'fox', sfxFile: 'sfx/animals/fox_bark.mp3', category: 'animals', defaultVolume: 0.4 },
  { keyword: 'rabbit', sfxFile: 'sfx/animals/rabbit_hop.mp3', category: 'animals', defaultVolume: 0.3 },
  { keyword: 'goat', sfxFile: 'sfx/animals/goat_bleat.mp3', category: 'animals', defaultVolume: 0.4 },
  { keyword: 'hen', sfxFile: 'sfx/animals/hen_cluck.mp3', category: 'animals', defaultVolume: 0.3 },
  { keyword: 'eagle', sfxFile: 'sfx/animals/eagle_screech.mp3', category: 'animals', defaultVolume: 0.5 },
  { keyword: 'insect', sfxFile: 'sfx/animals/insect_buzz.mp3', category: 'animals', defaultVolume: 0.2 },

  // ─── Comedy (20) ────────────────────────────────────
  { keyword: 'boing', sfxFile: 'sfx/comedy/boing.mp3', category: 'comedy', defaultVolume: 0.6 },
  { keyword: 'slide_whistle', sfxFile: 'sfx/comedy/slide_whistle.mp3', category: 'comedy', defaultVolume: 0.5 },
  { keyword: 'record_scratch', sfxFile: 'sfx/comedy/record_scratch.mp3', category: 'comedy', defaultVolume: 0.6 },
  { keyword: 'bonk', sfxFile: 'sfx/comedy/bonk.mp3', category: 'comedy', defaultVolume: 0.7 },
  { keyword: 'slip', sfxFile: 'sfx/comedy/slip_slide.mp3', category: 'comedy', defaultVolume: 0.5 },
  { keyword: 'splat', sfxFile: 'sfx/comedy/splat.mp3', category: 'comedy', defaultVolume: 0.6 },
  { keyword: 'trombone', sfxFile: 'sfx/comedy/sad_trombone.mp3', category: 'comedy', defaultVolume: 0.5 },
  { keyword: 'rimshot', sfxFile: 'sfx/comedy/rimshot.mp3', category: 'comedy', defaultVolume: 0.5 },
  { keyword: 'gulp', sfxFile: 'sfx/comedy/gulp.mp3', category: 'comedy', defaultVolume: 0.5 },
  { keyword: 'burp', sfxFile: 'sfx/comedy/burp.mp3', category: 'comedy', defaultVolume: 0.4 },
  { keyword: 'sneeze', sfxFile: 'sfx/comedy/sneeze.mp3', category: 'comedy', defaultVolume: 0.5 },
  { keyword: 'giggle', sfxFile: 'sfx/comedy/giggle.mp3', category: 'comedy', defaultVolume: 0.4 },
  { keyword: 'chomp', sfxFile: 'sfx/comedy/chomping.mp3', category: 'comedy', defaultVolume: 0.5 },
  { keyword: 'wobble', sfxFile: 'sfx/comedy/wobble.mp3', category: 'comedy', defaultVolume: 0.4 },
  { keyword: 'honk', sfxFile: 'sfx/comedy/horn_honk.mp3', category: 'comedy', defaultVolume: 0.5 },
  { keyword: 'pop', sfxFile: 'sfx/comedy/pop.mp3', category: 'comedy', defaultVolume: 0.4 },
  { keyword: 'squish', sfxFile: 'sfx/comedy/squish.mp3', category: 'comedy', defaultVolume: 0.4 },
  { keyword: 'spring', sfxFile: 'sfx/comedy/spring_boing.mp3', category: 'comedy', defaultVolume: 0.5 },
  { keyword: 'kazoo', sfxFile: 'sfx/comedy/kazoo.mp3', category: 'comedy', defaultVolume: 0.4 },
  { keyword: 'cartoon_run', sfxFile: 'sfx/comedy/cartoon_run.mp3', category: 'comedy', defaultVolume: 0.5 },

  // ─── Drama (25) ─────────────────────────────────────
  { keyword: 'dramatic', sfxFile: 'sfx/drama/dramatic_sting.mp3', category: 'drama', defaultVolume: 0.7 },
  { keyword: 'suspense', sfxFile: 'sfx/drama/suspense_build.mp3', category: 'drama', defaultVolume: 0.5 },
  { keyword: 'heartbeat', sfxFile: 'sfx/drama/heartbeat.mp3', category: 'drama', defaultVolume: 0.4 },
  { keyword: 'reveal', sfxFile: 'sfx/drama/reveal_sting.mp3', category: 'drama', defaultVolume: 0.6 },
  { keyword: 'tension', sfxFile: 'sfx/drama/tension_drone.mp3', category: 'drama', defaultVolume: 0.4 },
  { keyword: 'victory', sfxFile: 'sfx/drama/victory_fanfare.mp3', category: 'drama', defaultVolume: 0.7 },
  { keyword: 'defeat', sfxFile: 'sfx/drama/defeat_sting.mp3', category: 'drama', defaultVolume: 0.5 },
  { keyword: 'magic', sfxFile: 'sfx/drama/magic_sparkle.mp3', category: 'drama', defaultVolume: 0.5 },
  { keyword: 'mystery', sfxFile: 'sfx/drama/mystery_tone.mp3', category: 'drama', defaultVolume: 0.4 },
  { keyword: 'danger', sfxFile: 'sfx/drama/danger_alarm.mp3', category: 'drama', defaultVolume: 0.6 },
  { keyword: 'chase', sfxFile: 'sfx/drama/chase_music_hit.mp3', category: 'drama', defaultVolume: 0.5 },
  { keyword: 'shock', sfxFile: 'sfx/drama/shock_sting.mp3', category: 'drama', defaultVolume: 0.6 },
  { keyword: 'sad_moment', sfxFile: 'sfx/drama/sad_piano.mp3', category: 'drama', defaultVolume: 0.4 },
  { keyword: 'happy_moment', sfxFile: 'sfx/drama/happy_chime.mp3', category: 'drama', defaultVolume: 0.5 },
  { keyword: 'wise', sfxFile: 'sfx/drama/wisdom_tone.mp3', category: 'drama', defaultVolume: 0.4 },
  { keyword: 'transformation', sfxFile: 'sfx/drama/transform.mp3', category: 'drama', defaultVolume: 0.6 },
  { keyword: 'epic', sfxFile: 'sfx/drama/epic_hit.mp3', category: 'drama', defaultVolume: 0.7 },
  { keyword: 'countdown', sfxFile: 'sfx/drama/countdown_tick.mp3', category: 'drama', defaultVolume: 0.5 },
  { keyword: 'gasp', sfxFile: 'sfx/drama/crowd_gasp.mp3', category: 'drama', defaultVolume: 0.5 },
  { keyword: 'applause', sfxFile: 'sfx/drama/applause.mp3', category: 'drama', defaultVolume: 0.5 },
  { keyword: 'laughter', sfxFile: 'sfx/drama/crowd_laugh.mp3', category: 'drama', defaultVolume: 0.4 },
  { keyword: 'crying', sfxFile: 'sfx/drama/crying.mp3', category: 'drama', defaultVolume: 0.4 },
  { keyword: 'nightmare', sfxFile: 'sfx/drama/nightmare_tone.mp3', category: 'drama', defaultVolume: 0.5 },
  { keyword: 'dream', sfxFile: 'sfx/drama/dream_harp.mp3', category: 'drama', defaultVolume: 0.4 },
  { keyword: 'flashback', sfxFile: 'sfx/drama/flashback_whoosh.mp3', category: 'drama', defaultVolume: 0.5 },

  // ─── UI / Transitions (25) ──────────────────────────
  { keyword: 'whoosh', sfxFile: 'sfx/ui/whoosh.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'sparkle', sfxFile: 'sfx/ui/sparkle.mp3', category: 'ui', defaultVolume: 0.4 },
  { keyword: 'ding', sfxFile: 'sfx/ui/ding.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'chime', sfxFile: 'sfx/ui/chime.mp3', category: 'ui', defaultVolume: 0.4 },
  { keyword: 'swipe', sfxFile: 'sfx/ui/swipe.mp3', category: 'ui', defaultVolume: 0.4 },
  { keyword: 'click', sfxFile: 'sfx/ui/click.mp3', category: 'ui', defaultVolume: 0.3 },
  { keyword: 'notification', sfxFile: 'sfx/ui/notification.mp3', category: 'ui', defaultVolume: 0.4 },
  { keyword: 'transition', sfxFile: 'sfx/ui/scene_transition.mp3', category: 'ui', defaultVolume: 0.4 },
  { keyword: 'intro', sfxFile: 'sfx/ui/intro_jingle.mp3', category: 'ui', defaultVolume: 0.6 },
  { keyword: 'outro', sfxFile: 'sfx/ui/outro_jingle.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'correct', sfxFile: 'sfx/ui/correct_ding.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'wrong', sfxFile: 'sfx/ui/wrong_buzzer.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'timer', sfxFile: 'sfx/ui/timer_tick.mp3', category: 'ui', defaultVolume: 0.4 },
  { keyword: 'star', sfxFile: 'sfx/ui/star_collect.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'level_up', sfxFile: 'sfx/ui/level_up.mp3', category: 'ui', defaultVolume: 0.6 },
  { keyword: 'subscribe', sfxFile: 'sfx/ui/subscribe_bell.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'page_turn', sfxFile: 'sfx/ui/page_turn.mp3', category: 'ui', defaultVolume: 0.3 },
  { keyword: 'scroll_open', sfxFile: 'sfx/ui/scroll_unroll.mp3', category: 'ui', defaultVolume: 0.4 },
  { keyword: 'title_card', sfxFile: 'sfx/ui/title_swoosh.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'moral_reveal', sfxFile: 'sfx/ui/moral_chime.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'riddle_reveal', sfxFile: 'sfx/ui/riddle_reveal.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'option_select', sfxFile: 'sfx/ui/option_click.mp3', category: 'ui', defaultVolume: 0.4 },
  { keyword: 'thinking_clock', sfxFile: 'sfx/ui/thinking_clock.mp3', category: 'ui', defaultVolume: 0.4 },
  { keyword: 'stamp', sfxFile: 'sfx/ui/stamp_thud.mp3', category: 'ui', defaultVolume: 0.5 },
  { keyword: 'badge', sfxFile: 'sfx/ui/badge_earn.mp3', category: 'ui', defaultVolume: 0.5 },
];

export function matchSFX(text: string, sceneKeywords: string[]): SFXMatch[] {
  const allKeywords = [...sceneKeywords, ...text.toLowerCase().split(/\s+/)];
  const matches: SFXMatch[] = [];
  const used = new Set<string>();

  for (const entry of SFX_DATABASE) {
    if (used.has(entry.sfxFile)) continue;

    const found = allKeywords.some(
      (kw) => kw.includes(entry.keyword) || entry.keyword.includes(kw),
    );

    if (found) {
      matches.push({
        sfxFile: entry.sfxFile,
        trigger: entry.keyword,
        volume: entry.defaultVolume,
        timing: entry.category === 'drama' ? 'before' : 'during',
      });
      used.add(entry.sfxFile);
    }
  }

  return matches.slice(0, 5); // Max 5 SFX per scene to avoid clutter
}

export { SFX_DATABASE };
