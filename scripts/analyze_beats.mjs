import fs from 'fs';
import path from 'path';
import decode from 'audio-decode';

async function analyzeBeats() {
  const audioPath = path.resolve('input/Wi-Fi 7 Ya.mp3');
  const buffer = fs.readFileSync(audioPath);
  const audio = await decode(buffer);

  const sampleRate = audio.sampleRate;
  const channel = audio.channelData[0];
  console.log(`Audio sample rate: ${sampleRate}, channels: ${audio.numberOfChannels}, length: ${channel.length}`);

  // Find when sound starts (> 0.01 amplitude)
  let firstSoundSample = 0;
  for (let i = 0; i < channel.length; i++) {
    if (Math.abs(channel[i]) > 0.01) {
      firstSoundSample = i;
      break;
    }
  }
  console.log(`First sound at sample: ${firstSoundSample} (${(firstSoundSample / sampleRate).toFixed(4)}s)`);

  // Let's compute 30fps frame-by-frame energy (each frame is sampleRate/30 samples)
  const frameSamples = Math.round(sampleRate / 30);
  const totalFrames = 600; // 20s
  console.log('\nFrame-by-frame RMS (first 60 frames = 2s):');
  for (let f = 0; f < 60; f++) {
    let sum = 0;
    const start = f * frameSamples;
    for (let s = 0; s < frameSamples; s++) {
      const v = channel[start + s] || 0;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / frameSamples);
    if (f % 5 === 0) {
      console.log(`Frame ${f} (${(f/30).toFixed(2)}s): rms=${rms.toFixed(4)}`);
    }
  }
}

analyzeBeats().catch(console.error);
