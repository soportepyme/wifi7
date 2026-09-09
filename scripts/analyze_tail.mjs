import fs from 'fs';
import path from 'path';
import decode from 'audio-decode';

async function analyzeTail() {
  const audioPath = path.resolve('input/Tu red también debería hacerlo.mp3');
  const buffer = fs.readFileSync(audioPath);
  const audio = await decode(buffer);

  const sampleRate = audio.sampleRate;
  const channel = audio.channelData[0];
  const totalSec = channel.length / sampleRate;
  console.log(`Sample rate: ${sampleRate}, Total samples: ${channel.length}, Total duration: ${totalSec.toFixed(3)}s`);

  // Analyze 35s to end in 100ms chunks
  const startSec = 35.0;
  const stepSec = 0.1;
  const stepSamples = Math.round(stepSec * sampleRate);
  const startSample = Math.round(startSec * sampleRate);

  console.log('\nRMS energy from 35s to end:');
  for (let s = startSample; s < channel.length; s += stepSamples) {
    const t = s / sampleRate;
    let sum = 0;
    const count = Math.min(stepSamples, channel.length - s);
    for (let i = 0; i < count; i++) {
      const v = channel[s + i];
      sum += v * v;
    }
    const rms = Math.sqrt(sum / count);
    const bar = '#'.repeat(Math.min(50, Math.round(rms * 100)));
    console.log(`${t.toFixed(2)}s: ${rms.toFixed(4)} | ${bar}`);
  }
}

analyzeTail().catch(console.error);
