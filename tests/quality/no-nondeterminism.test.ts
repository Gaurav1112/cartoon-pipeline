import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

const ROOT = path.resolve(__dirname, '../..');

/**
 * Hard rule: src/ code that runs at render time must be deterministic.
 *
 * - Math.random() is BANNED everywhere in src/
 * - Date.now() / new Date() / performance.now() are BANNED in any render-effecting
 *   code path (compositions, story, dialogues, scenes, characters, audio, music).
 *   They remain allowed in pipeline/ orchestration files for performance logging,
 *   but ONLY behind explicit allowlist comments.
 */

function grep(pattern: string, dir: string): string {
  try {
    return execSync(`grep -RnE "${pattern}" ${dir} || true`, { cwd: ROOT })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

describe('no-nondeterminism contract', () => {
  it('src/ contains zero Math.random() calls', () => {
    const hits = grep('Math\\.random\\(', 'src');
    expect(hits, `Math.random found:\n${hits}`).toBe('');
  });

  it('render-effecting modules contain no Date.now() / performance.now() / new Date()', () => {
    const dirs = [
      'src/compositions',
      'src/characters',
      'src/scenes',
      'src/story',
      'src/dialogues',
      'src/audio',
      'src/utils',
    ];
    for (const d of dirs) {
      const hits = grep('(Date\\.now\\(|performance\\.now\\(|new Date\\()', d);
      expect(hits, `Non-determinism in ${d}:\n${hits}`).toBe('');
    }
  });
});
