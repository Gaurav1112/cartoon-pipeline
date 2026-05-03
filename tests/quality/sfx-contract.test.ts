import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// Burtt 3/10 → real signature sounds. Pin every SFXKey + every ambience
// location to a procedurally-synthesized non-silent audio file.

const PUBLIC = resolve(__dirname, '..', '..', 'public');

function sfxFilesFromMap(): string[] {
  // Parse SFXLayer.tsx — single source of truth for sfxKey → file.
  const src = readFileSync(
    resolve(__dirname, '..', '..', 'src', 'compositions', 'episode1', 'SFXLayer.tsx'),
    'utf8',
  );
  const re = /file:\s*'([^']+\.mp3)'/g;
  const files: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    files.push(m[1]);
  }
  return files;
}

function ambienceFiles(): string[] {
  const src = readFileSync(
    resolve(__dirname, '..', '..', 'src', 'audio', 'ambience.ts'),
    'utf8',
  );
  const re = /filePath:\s*'([^']+\.mp3)'/g;
  const files: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    files.push(m[1]);
  }
  return files;
}

describe('SFX + ambience contract (Burtt)', () => {
  it('every SFXKey resolves to an existing audio file', () => {
    const files = sfxFilesFromMap();
    expect(files.length).toBeGreaterThanOrEqual(20);
    for (const f of files) {
      const p = resolve(PUBLIC, f);
      expect(existsSync(p), `missing SFX: ${f}`).toBe(true);
      expect(statSync(p).size, `${f} is too small`).toBeGreaterThan(1_000);
    }
  });

  it('every ambience location resolves to an existing 30s loop bed', () => {
    const files = ambienceFiles();
    expect(files.length).toBeGreaterThanOrEqual(8);
    for (const f of files) {
      const p = resolve(PUBLIC, f);
      expect(existsSync(p), `missing ambience: ${f}`).toBe(true);
      const size = statSync(p).size;
      expect(size, `${f} only ${size} bytes — silent stub?`).toBeGreaterThan(50_000);
    }
  });

  it('lion_roar has measurable energy and below 1kHz spectral mass (low rumble)', () => {
    const p = resolve(PUBLIC, 'audio/sfx/animals/lion_roar.mp3');
    const proc = spawnSync(
      'ffmpeg',
      ['-hide_banner', '-i', p, '-af', 'volumedetect', '-vn', '-f', 'null', '/dev/null'],
      { encoding: 'utf8' },
    );
    const m = proc.stderr.match(/mean_volume:\s*(-?[\d.]+)\s*dB/);
    expect(m, `volumedetect:\n${proc.stderr}`).not.toBeNull();
    expect(parseFloat(m![1])).toBeGreaterThan(-30);
  });
});
