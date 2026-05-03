import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { generateEpisode } from '../../src/story/story-engine';
import { selectDialogueSequence } from '../../src/dialogues';
import type { DialogueQuery } from '../../src/dialogues/types';

// Catmull gap M1.5 — the single most important guard against
// "we shipped a different cut than we tested".
//
// Without a hash pin, a future "harmless" refactor of story-engine or
// the dialogue selector could silently change the rendered episode
// while every other test stays green. This test:
//
//   1. Calls the deterministic generators twice and asserts byte-for-byte
//      equality of the canonical-stringified result.
//   2. Pins a SHA-256 of the canonical stringification to a known value.
//
// If the hash assertion fails, that is the deliberate signal: either
// (a) you broke determinism (FIX it — do not weaken the test), or
// (b) you intentionally changed story output. In case (b), update the
// hash here in the same commit that introduced the change. Reviewers
// then know exactly which commit shifted the cut.

// ─── Canonical (deterministic key-order) JSON ─────────────────────────────
function canonicalStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalStringify).join(',') + ']';
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return (
    '{' +
    keys.map((k) => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') +
    '}'
  );
}

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

describe('Catmull determinism contract — byte-stable across runs', () => {
  // generateEpisode(topicId, episodeNumber) derives its seed as
  // topicId * 10000 + episodeNumber, so (1, 42) yields seed=10042.
  // That seed is the pinned identity of THIS golden episode.
  describe('generateEpisode(1, 42)', () => {
    it('produces identical output on repeated calls (canonical equality)', () => {
      const a = generateEpisode(1, 42);
      const b = generateEpisode(1, 42);
      expect(canonicalStringify(a)).toBe(canonicalStringify(b));
    });

    it('seed matches the (topicId, episodeNumber) derivation', () => {
      expect(generateEpisode(1, 42).seed).toBe(10042);
    });

    it('canonical SHA-256 is pinned (deliberate-change-only)', () => {
      const ep = generateEpisode(1, 42);
      const hash = sha256(canonicalStringify(ep));
      // To intentionally rotate this hash: run the generator, paste the
      // new digest, and explain the rationale in the commit message.
      expect(hash).toBe(
        // M4.2 re-pin: heroMomentScore field added to DialogueLine and
        // seeded by context (HERO_SCORE_BY_CONTEXT). Story narrative,
        // characters, beats unchanged — only an additive metadata field
        // for the cut planner.
        'b53f3678b529679dfe848d304ed3a90bb0ddff7704eaf1473fedf6f98fc00f55',
      );
    });
  });

  describe("selectDialogueSequence(seed=42, language='en')", () => {
    const queries: DialogueQuery[] = [
      { character: 'arjun', context: 'greeting' },
      { character: 'priya', context: 'conflict' },
      { character: 'guruji', context: 'moral' },
      { character: 'bablu', context: 'reaction' },
      { character: 'arjun', context: 'resolution' },
    ];

    it('returns identical sequence on repeated calls (canonical equality)', () => {
      const a = selectDialogueSequence(queries, 'en', 42);
      const b = selectDialogueSequence(queries, 'en', 42);
      expect(canonicalStringify(a)).toBe(canonicalStringify(b));
    });

    it('canonical SHA-256 of {character, emotion, text}[] is pinned', () => {
      const seq = selectDialogueSequence(queries, 'en', 42);
      const minimal = seq.map((l) => ({
        character: l.character,
        emotion: l.emotion,
        text: l.text,
      }));
      const hash = sha256(canonicalStringify(minimal));
      expect(hash).toBe(
        '1c4f903f004c39d8f9db53c5173093c7cc3a46d70b2274e5c4e6c51e97a1ff90',
      );
    });
  });
});
