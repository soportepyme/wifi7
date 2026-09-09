import fs from 'fs';
import path from 'path';
import decode from 'audio-decode';
import ffprobeStatic from 'ffprobe-static';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function analyzeAudio() {
  const audioPath = path.resolve('input/Tu red también debería hacerlo.mp3');
  const audioBuffer = fs.readFileSync(audioPath);
  const audioData = await decode(audioBuffer);

  const durationSec = audioData.duration;
  console.log(`Audio exact duration: ${durationSec}s`);
  console.log(`At 30 FPS: ${durationSec * 30} frames -> Math.round: ${Math.round(durationSec * 30)}, Math.ceil: ${Math.ceil(durationSec * 30)}`);

  const { stdout } = await execFileAsync(ffprobeStatic.path, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    audioPath
  ]);
  console.log(`ffprobe exact duration: ${stdout.trim()}s`);

  // Detect energy envelope
  const channel = audioData.channelData[0];
  const sampleRate = audioData.sampleRate;
  const windowMs = 50; // 50ms windows
  const windowSize = Math.round((windowMs / 1000) * sampleRate);
  const totalWindows = Math.floor(channel.length / windowSize);

  const energy = [];
  for (let i = 0; i < totalWindows; i++) {
    let sum = 0;
    const start = i * windowSize;
    for (let j = 0; j < windowSize; j++) {
      const val = channel[start + j];
      sum += val * val;
    }
    const rms = Math.sqrt(sum / windowSize);
    energy.push({
      time: parseFloat((i * (windowMs / 1000)).toFixed(2)),
      rms: parseFloat(rms.toFixed(4))
    });
  }

  // Find significant energy changes / beats
  console.log('Audio analysis complete.');
}

analyzeAudio().catch(console.error);
