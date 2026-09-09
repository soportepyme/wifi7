import fs from 'fs';
import path from 'path';
import decode from 'audio-decode';
import ffprobeStatic from 'ffprobe-static';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function inspectWifi7Song() {
  const audioPath = path.resolve('input/Wi-Fi 7 Ya.mp3');
  const audioBuffer = fs.readFileSync(audioPath);
  const audioData = await decode(audioBuffer);

  const durationSec = audioData.duration;
  console.log(`Audio exact duration: ${durationSec}s`);

  const { stdout } = await execFileAsync(ffprobeStatic.path, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    audioPath
  ]);
  console.log(`ffprobe exact duration: ${stdout.trim()}s`);

  const channel = audioData.channelData[0];
  const sampleRate = audioData.sampleRate;
  const windowMs = 100; // 100ms windows
  const windowSize = Math.round((windowMs / 1000) * sampleRate);
  const totalWindows = Math.min(Math.floor(channel.length / windowSize), 300); // first 30s

  const energies = [];
  for (let i = 0; i < totalWindows; i++) {
    let sum = 0;
    const start = i * windowSize;
    for (let j = 0; j < windowSize; j++) {
      const val = channel[start + j];
      sum += val * val;
    }
    const rms = Math.sqrt(sum / windowSize);
    energies.push({ sec: (i * 0.1).toFixed(1), rms: rms.toFixed(4) });
  }

  console.log('Energy profile first 20 seconds:');
  for (let i = 0; i < 200; i += 5) {
    const chunk = energies.slice(i, i + 5);
    console.log(`t=${(i*0.1).toFixed(1)}s - ${chunk.map(c => c.rms).join(', ')}`);
  }
}

inspectWifi7Song().catch(console.error);
