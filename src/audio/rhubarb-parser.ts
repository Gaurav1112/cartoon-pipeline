// src/audio/rhubarb-parser.ts
//
// M5.2 — Rhubarb lip-sync parser.
//
// Rhubarb (https://github.com/DanielSWolf/rhubarb-lip-sync) is the
// only free, deterministic, offline lip-sync option that fits a $0
// budget. It emits 9 mouth-shape phonemes:
//
//   A  closed-relaxed       (m, b, p — lips together, "rest closed")
//   B  closed-slight-open   (k, s, t, d, n — small gap)
//   C  half-open            (eh, ae)
//   D  wide-open            (aa)
//   E  round-mid            (ow, oh)
//   F  round-tight          (oo, w)
//   G  teeth-on-lip         (f, v)   — extended (Rhubarb "extendedShapes":"GH")
//   H  open-tongue-up       (l, r)   — extended
//   X  silence / rest       (idle)
//
// We collapse the 9 phonemes onto our 8-shape mouth atlas (A–H in
// `src/types.ts`) — see `phonemeToMouthShape` for the deliberate
// mapping. This collapse is pinned by tests/quality/rhubarb-parser.test.ts
// and must be re-pinned in the same commit as any change.
//
// Formats supported:
//   - JSON (Rhubarb `--format=json`): top-level `mouthCues: [{start, end, value}]`
//   - WebVTT (Rhubarb `--format=tsv` / `--format=xml` are NOT covered;
//     we accept WebVTT because it's the format edge-tts also emits and
//     because some downstream tools convert Rhubarb tsv → vtt).
//
// The parser MUST gracefully return [] on empty / malformed input so
// that CI environments without Rhubarb installed don't crash the
// render pipeline. The video renderer falls back to
// `amplitudeToMouthShape` when the cue list is empty.

import type { MouthShape } from '../types';

export type RhubarbPhoneme = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'X';

export const PHONEMES: readonly RhubarbPhoneme[] =
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'] as const;

const PHONEME_SET = new Set<string>(PHONEMES);

export interface RhubarbCue {
  phoneme: RhubarbPhoneme;
  /** Start time in milliseconds (audio-local, not episode-absolute) */
  startMs: number;
  /** End time in milliseconds */
  endMs: number;
}

/**
 * Pure mapping: Rhubarb phoneme → MouthShape (A–H).
 *
 * G (teeth-on-lip / f,v) and H (tongue-up / l,r) are Rhubarb-extended
 * shapes that don't have a 1:1 atlas slot. We collapse:
 *   - G → F (closest visible-teeth round shape)
 *   - H → A (open mouth, tongue not modeled in 2D atlas)
 *   - X → B (rest/idle == closed-relaxed in the atlas)
 *
 * A–F map identically because the atlas was originally built from
 * Rhubarb's basic 6-shape set.
 */
export function phonemeToMouthShape(p: RhubarbPhoneme): MouthShape {
  switch (p) {
    case 'A': return 'A';
    case 'B': return 'B';
    case 'C': return 'C';
    case 'D': return 'D';
    case 'E': return 'E';
    case 'F': return 'F';
    case 'G': return 'F';
    case 'H': return 'A';
    case 'X': return 'B';
  }
}

/**
 * Amplitude-based fallback when no Rhubarb data is available.
 * Returns one of {B, C, A, D} based on linear amplitude in [0, 1].
 * Pinned band edges (test contract):
 *   amp < 0.10 → B (closed)
 *   amp < 0.25 → C (half-open)
 *   amp < 0.55 → A (open)
 *   amp ≥ 0.55 → D (wide-open)
 */
export function amplitudeToMouthShape(amp: number): MouthShape {
  if (!Number.isFinite(amp) || amp < 0.10) return 'B';
  if (amp < 0.25) return 'C';
  if (amp < 0.55) return 'A';
  return 'D';
}

/** Parse Rhubarb's `--format=json` output. */
export function parseRhubarbJson(text: string): RhubarbCue[] {
  if (!text || !text.trim()) return [];
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  if (!data || typeof data !== 'object') return [];
  const raw = (data as { mouthCues?: unknown }).mouthCues;
  if (!Array.isArray(raw)) return [];

  const out: RhubarbCue[] = [];
  for (const c of raw) {
    if (!c || typeof c !== 'object') continue;
    const value = (c as { value?: unknown }).value;
    const start = (c as { start?: unknown }).start;
    const end = (c as { end?: unknown }).end;
    if (
      typeof value !== 'string' ||
      typeof start !== 'number' ||
      typeof end !== 'number' ||
      !PHONEME_SET.has(value)
    ) {
      continue;
    }
    out.push({
      phoneme: value as RhubarbPhoneme,
      startMs: Math.round(start * 1000),
      endMs: Math.round(end * 1000),
    });
  }
  return out;
}

/** Parse a WebVTT timestamp like `00:00:01.234` → milliseconds. */
function vttTsToMs(ts: string): number | null {
  // Accepts hh:mm:ss.mmm or mm:ss.mmm
  const m = ts.match(/^(?:(\d+):)?(\d+):(\d+)\.(\d+)$/);
  if (!m) return null;
  const [, hh, mm, ss, ms] = m;
  const h = hh ? parseInt(hh, 10) : 0;
  const total =
    h * 3600_000 +
    parseInt(mm, 10) * 60_000 +
    parseInt(ss, 10) * 1000 +
    parseInt(ms.padEnd(3, '0').slice(0, 3), 10);
  return Number.isFinite(total) ? total : null;
}

/** Parse a WebVTT-formatted lip-sync cue track. */
export function parseRhubarbVtt(text: string): RhubarbCue[] {
  if (!text || !text.trim()) return [];
  if (!/^\s*WEBVTT/i.test(text)) return [];

  const out: RhubarbCue[] = [];
  // Split on blank-line cue boundaries; first block is "WEBVTT" header.
  const blocks = text.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;
    // Skip optional cue identifier line
    let idx = 0;
    if (!lines[idx].includes('-->')) idx++;
    if (idx >= lines.length) continue;
    const arrowLine = lines[idx];
    const arrowMatch = arrowLine.match(/^([\d:.]+)\s*-->\s*([\d:.]+)/);
    if (!arrowMatch) continue;
    const start = vttTsToMs(arrowMatch[1]);
    const end = vttTsToMs(arrowMatch[2]);
    if (start === null || end === null) continue;
    const payload = lines.slice(idx + 1).join(' ').trim();
    if (!PHONEME_SET.has(payload)) continue;
    out.push({
      phoneme: payload as RhubarbPhoneme,
      startMs: start,
      endMs: end,
    });
  }
  return out;
}

/**
 * Auto-detect JSON vs VTT and parse accordingly.
 * Returns [] for empty / malformed / unrecognized input — callers must
 * treat [] as "no Rhubarb data, use the amplitude fallback".
 */
export function parseRhubarbOutput(text: string): RhubarbCue[] {
  if (!text || !text.trim()) return [];
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseRhubarbJson(trimmed);
  }
  if (/^WEBVTT/i.test(trimmed)) {
    return parseRhubarbVtt(trimmed);
  }
  return [];
}
