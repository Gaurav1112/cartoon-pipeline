import { execFile } from 'child_process';
import { promisify } from 'util';
import type { AudioLayer } from '../types';

const execFileAsync = promisify(execFile);

const dbToRatio = (db: number): number => Math.pow(10, db / 20);

/**
 * Sidechain compressor threshold (linear amplitude) used for ducking
 * music / SFX under dialogue.
 *
 * Calibration source: measured peak amplitude of edge-tts
 * `hi-IN-MadhurNeural` at default rate/pitch on a representative
 * dialogue line, 2026-05. Peak ≈ 0.025 linear; threshold = 0.6 * peak
 * lands at the average dialogue body, ducking the music whenever
 * Madhur is actually speaking (not on the noise floor).
 *
 * For other voices, derive a per-episode threshold via
 * {@link calibrateDuckThreshold} on the measured TTS peak and pass it
 * to {@link buildMixCommand}.
 */
export const DUCK_THRESHOLD = 0.015;

/**
 * Map a measured linear peak amplitude to a sidechain threshold.
 * Returns 0.6 * peak, clamped to [0.005, 0.05]:
 *   - lower bound 0.005 prevents over-triggering on near-silent input
 *   - upper bound 0.05 prevents the duck from never engaging
 */
export function calibrateDuckThreshold(measuredPeakLinear: number): number {
  const raw = measuredPeakLinear * 0.6;
  return Math.max(0.005, Math.min(0.05, raw));
}

/**
 * Build ffmpeg command for multi-layer audio mixing.
 *
 * FIXES from expert review:
 * 1. amix normalize=0 (prevents auto-division by N inputs)
 * 2. Fade-out uses reverse-fade trick (always fades at end, no duration needed)
 * 3. Sidechain compression for ducking music/SFX during dialogue
 * 4. Brick-wall alimiter after loudnorm (M1.2)
 * 5. Calibratable duck threshold (M1.3)
 */
export function buildMixCommand(
  outputPath: string,
  layers: AudioLayer[],
  duckThreshold: number = DUCK_THRESHOLD,
): string[] {
  if (layers.length === 0) return [];

  const args: string[] = [];
  const filterParts: string[] = [];

  // Classify layers
  const dialogueIndices: number[] = [];
  const duckableIndices: number[] = [];
  const staticIndices: number[] = [];

  layers.forEach((layer, i) => {
    args.push('-i', layer.filePath);
    if (layer.type === 'dialogue') {
      dialogueIndices.push(i);
    } else if (layer.duckDuringDialogue) {
      duckableIndices.push(i);
    } else {
      staticIndices.push(i);
    }
  });

  // Step 1: Process each input (delay, volume, fades)
  layers.forEach((layer, i) => {
    const parts: string[] = [];

    if (layer.startMs > 0) {
      parts.push(`adelay=${Math.max(0, layer.startMs)}|${Math.max(0, layer.startMs)}`);
    }

    parts.push(`volume=${dbToRatio(layer.volumeDb).toFixed(4)}`);

    if (layer.fadeInMs && layer.fadeInMs > 0) {
      parts.push(`afade=t=in:d=${(layer.fadeInMs / 1000).toFixed(2)}`);
    }

    // FIX: Fade-out using reverse-fade trick (always fades at END, no duration probe needed)
    if (layer.fadeOutMs && layer.fadeOutMs > 0) {
      const fadeSec = (layer.fadeOutMs / 1000).toFixed(2);
      parts.push(`areverse,afade=t=in:d=${fadeSec},areverse`);
    }

    filterParts.push(`[${i}:a]${parts.join(',')}[p${i}]`);
  });

  // Step 2: Build final mix labels
  const finalLabels: string[] = [];

  // Create dialogue bus
  if (dialogueIndices.length > 0) {
    if (dialogueIndices.length === 1) {
      filterParts.push(`[p${dialogueIndices[0]}]acopy[dbus]`);
    } else {
      const dLabels = dialogueIndices.map((i) => `[p${i}]`).join('');
      // FIX: normalize=0 prevents division by N
      filterParts.push(
        `${dLabels}amix=inputs=${dialogueIndices.length}:duration=longest:dropout_transition=0:normalize=0[dbus]`,
      );
    }

    // Step 3: Sidechain ducking
    if (duckableIndices.length > 0) {
      const totalCopies = duckableIndices.length + 1;
      const splitLabels = ['[dbus_out]', ...duckableIndices.map((_, j) => `[dkey${j}]`)];
      filterParts.push(`[dbus]asplit=${totalCopies}${splitLabels.join('')}`);

      duckableIndices.forEach((layerIdx, j) => {
        filterParts.push(
          `[p${layerIdx}][dkey${j}]sidechaincompress=threshold=${duckThreshold}:ratio=8:attack=10:release=250[dk${layerIdx}]`,
        );
        finalLabels.push(`[dk${layerIdx}]`);
      });
      finalLabels.unshift('[dbus_out]');
    } else {
      finalLabels.push('[dbus]');
    }
  } else {
    duckableIndices.forEach((i) => finalLabels.push(`[p${i}]`));
  }

  staticIndices.forEach((i) => finalLabels.push(`[p${i}]`));

  // Step 4: Final mix with loudness normalization + brick-wall limiter
  // (M1.2 Beck) — alimiter sits AFTER loudnorm because loudnorm's
  // true-peak ceiling is a slow EBU gain stage, not a sample-domain
  // limiter. SFX stacking can transiently exceed loudnorm's TP=-1.5
  // before it adapts; alimiter at limit=0.95 (~-0.45 dBFS) clamps the
  // peaks deterministically.
  const masterTail =
    'loudnorm=I=-14:LRA=11:TP=-1.5,' +
    'alimiter=level_in=1:level_out=1:limit=0.95:attack=5:release=50' +
    '[out]';
  if (finalLabels.length === 1) {
    filterParts.push(`${finalLabels[0]}${masterTail}`);
  } else {
    // FIX: normalize=0 on final amix too
    filterParts.push(
      `${finalLabels.join('')}amix=inputs=${finalLabels.length}:duration=longest:dropout_transition=3:normalize=0,` +
      masterTail,
    );
  }

  args.push('-filter_complex', filterParts.join(';'));
  args.push('-map', '[out]');
  args.push('-ac', '2');
  args.push('-ar', '44100');
  // Catmull/Murch P0: master mix output as lossless PCM/WAV.
  // ffmpeg 8.1's libmp3lame psymodel asserts on extreme filter chains
  // (loudnorm + amix of 70+ inputs has hit `calc_energy: el >= 0`).
  // The downstream muxVideoAudio re-encodes to AAC for the final MP4.
  args.push('-c:a', 'pcm_s16le');
  args.push('-y', outputPath);

  return args;
}

export async function mixAudio(outputPath: string, layers: AudioLayer[]): Promise<void> {
  if (layers.length === 0) {
    throw new Error('No audio layers provided for mixing');
  }

  const args = buildMixCommand(outputPath, layers);
  await execFileAsync('ffmpeg', args, { timeout: 300_000 });
}

/**
 * Mux video + audio into final MP4 (no re-encode of video track).
 * This is the key optimization: render visual ONCE, mux 7 audio tracks.
 */
export function buildMuxCommand(
  videoPath: string,
  audioPath: string,
  outputPath: string,
): string[] {
  return [
    '-i', videoPath,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    '-y', outputPath,
  ];
}

export async function muxVideoAudio(
  videoPath: string,
  audioPath: string,
  outputPath: string,
): Promise<void> {
  const args = buildMuxCommand(videoPath, audioPath, outputPath);
  await execFileAsync('ffmpeg', args, { timeout: 600_000 });
}
