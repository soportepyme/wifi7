import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { detect } from '@audio/beat';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

export const MIN_BEAT_CONFIDENCE = 0.35;

/**
 * Calculates RMS energy of a Float32Array slice
 */
function calculateRMS(samples, startIdx, endIdx) {
  const start = Math.max(0, startIdx);
  const end = Math.min(samples.length, endIdx);
  if (start >= end) return 0;

  let sumSquares = 0;
  for (let i = start; i < end; i++) {
    sumSquares += samples[i] * samples[i];
  }
  return Math.sqrt(sumSquares / (end - start));
}

/**
 * Analyzes an MP3/WAV file and generates a BeatMap
 */
export async function analyzeBeats(audioPath, options = {}) {
  const fps = options.fps || 30;
  const sampleRate = options.sampleRate || 44100;

  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  const trackName = path.basename(audioPath);
  const scratchDir = path.resolve('scratch');
  fs.mkdirSync(scratchDir, { recursive: true });

  const tempPcmPath = path.join(scratchDir, `.temp_analysis_${Date.now()}.pcm`);

  try {
    // 1. Convert audio to mono 44100Hz s16le PCM using FFmpeg
    await execFileAsync(ffmpegStatic, [
      '-y',
      '-i', audioPath,
      '-ac', '1',
      '-ar', String(sampleRate),
      '-f', 's16le',
      tempPcmPath
    ]);

    // 2. Read PCM buffer and convert Int16 -> Float32
    const pcmBuffer = fs.readFileSync(tempPcmPath);
    const int16Array = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / 2);
    const float32Samples = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Samples[i] = int16Array[i] / 32768.0;
    }

    // 3. Detect beats with @audio/beat
    const detectResult = detect(float32Samples, { fs: sampleRate });
    const rawBeats = Array.from(detectResult.beats || []);
    const bpm = Math.round(detectResult.bpm * 10) / 10;
    const confidence = Math.round(detectResult.confidence * 100) / 100;

    // 4. Calculate local hit intensity (RMS energy around each beat)
    const windowPreSamples = Math.round(0.10 * sampleRate); // 100ms before
    const windowPostSamples = Math.round(0.18 * sampleRate); // 180ms after

    const beatEnergies = rawBeats.map((time) => {
      const centerIdx = Math.round(time * sampleRate);
      const startIdx = centerIdx - windowPreSamples;
      const endIdx = centerIdx + windowPostSamples;
      return calculateRMS(float32Samples, startIdx, endIdx);
    });

    // 5. Calculate energy distribution percentiles for adaptive thresholding
    const sortedEnergies = [...beatEnergies].sort((a, b) => a - b);
    const minEnergy = sortedEnergies[0] || 0;
    const maxEnergy = sortedEnergies[sortedEnergies.length - 1] || 1;
    const range = maxEnergy - minEnergy || 1;

    const p33Index = Math.floor(sortedEnergies.length * 0.33);
    const p66Index = Math.floor(sortedEnergies.length * 0.66);
    const p33Energy = sortedEnergies[p33Index] || minEnergy + range * 0.33;
    const p66Energy = sortedEnergies[p66Index] || minEnergy + range * 0.66;

    let strongCount = 0;
    let mediumCount = 0;
    let weakCount = 0;

    const beatPoints = rawBeats.map((time, idx) => {
      const energy = beatEnergies[idx];
      const normalizedStrength = Math.round(Math.max(0, Math.min(1, (energy - minEnergy) / range)) * 100) / 100;
      const frame = Math.round(time * fps);

      let level = 'WEAK';
      if (energy >= p66Energy || normalizedStrength >= 0.66) {
        level = 'STRONG';
        strongCount++;
      } else if (energy >= p33Energy || normalizedStrength >= 0.33) {
        level = 'MEDIUM';
        mediumCount++;
      } else {
        level = 'WEAK';
        weakCount++;
      }

      return {
        time: Math.round(time * 1000) / 1000,
        frame,
        strength: normalizedStrength,
        level,
      };
    });

    const isEnabled = confidence >= MIN_BEAT_CONFIDENCE;

    const beatMap = {
      version: 1,
      source: trackName,
      sampleRate,
      fps,
      bpm,
      confidence,
      enabled: isEnabled,
      stats: {
        totalBeats: beatPoints.length,
        strong: strongCount,
        medium: mediumCount,
        weak: weakCount,
      },
      beats: beatPoints,
    };

    // 6. Save beat-map.json in public/generated/
    const publicGenDir = path.resolve('public/generated');
    fs.mkdirSync(publicGenDir, { recursive: true });
    const jsonPath = path.join(publicGenDir, 'beat-map.json');
    fs.writeFileSync(jsonPath, JSON.stringify(beatMap, null, 2));

    // 7. Save generated-beats.ts in src/
    const tsContent = `// AUTO-GENERATED FILE.
// DO NOT EDIT MANUALLY.
// Generated from public/generated/beat-map.json

export interface BeatPoint {
  time: number;
  frame: number;
  strength: number;
  level: 'STRONG' | 'MEDIUM' | 'WEAK';
}

export interface BeatMap {
  version: number;
  source: string;
  sampleRate: number;
  fps: number;
  bpm: number;
  confidence: number;
  enabled: boolean;
  stats: {
    totalBeats: number;
    strong: number;
    medium: number;
    weak: number;
  };
  beats: BeatPoint[];
}

export const BEAT_MAP: BeatMap = ${JSON.stringify(beatMap, null, 2)};
`;
    fs.writeFileSync(path.resolve('src/generated-beats.ts'), tsContent);

    // 8. Display formatted analysis log
    console.log('\n============================================================');
    console.log('🎵 ANALYZING MUSIC (SOPY BEAT SYNC ENGINE)');
    console.log('============================================================');
    console.log(`Track: ${trackName}`);
    console.log(`BPM: ${bpm}`);
    console.log(`Confidence: ${confidence.toFixed(2)}`);
    console.log(`Detected beats: ${beatPoints.length}`);
    console.log(`  - Strong: ${strongCount}`);
    console.log(`  - Medium: ${mediumCount}`);
    console.log(`  - Weak: ${weakCount}`);
    console.log(`Beat Sync: ${isEnabled ? 'ENABLED' : 'FALLBACK (low confidence)'}`);
    console.log(`Beat Map saved to: public/generated/beat-map.json and src/generated-beats.ts`);
    console.log('============================================================\n');

    return beatMap;
  } finally {
    if (fs.existsSync(tempPcmPath)) {
      try {
        fs.unlinkSync(tempPcmPath);
      } catch (e) {
        // ignore cleanup error
      }
    }
  }
}

// CLI entry point
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/analyze-beats.mjs')) {
  let targetAudio = process.argv[2];

  if (!targetAudio) {
    const defaultProcessed = path.resolve('public/generated/wifi7_music_20s.mp3');
    const defaultRaw = path.resolve('input/Wi-Fi 7 Ya.mp3');
    targetAudio = fs.existsSync(defaultProcessed) ? defaultProcessed : defaultRaw;
  }

  analyzeBeats(path.resolve(targetAudio)).catch((err) => {
    console.error('Error analyzing beats:', err);
    process.exit(1);
  });
}
