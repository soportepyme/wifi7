import fs from 'fs';
import decode from 'audio-decode';
import { pipeline } from '@xenova/transformers';

async function main() {
  console.log('Loading audio file...');
  const audioBuffer = fs.readFileSync('public/diagnostico_wifi.mp3');
  const audioData = await decode(audioBuffer);
  
  const channelData = audioData.channelData;
  const originalSampleRate = audioData.sampleRate;
  const targetSampleRate = 16000;
  console.log(`Audio channels: ${channelData.length}, Sample rate: ${originalSampleRate}Hz, samples per channel: ${channelData[0].length}`);

  let monoChannel;
  if (channelData.length === 1) {
    monoChannel = channelData[0];
  } else {
    const ch0 = channelData[0];
    const ch1 = channelData[1];
    monoChannel = new Float32Array(ch0.length);
    for (let i = 0; i < ch0.length; i++) {
      monoChannel[i] = (ch0[i] + ch1[i]) / 2;
    }
  }

  // Resample to 16000 Hz if needed
  let resampled;
  if (originalSampleRate === targetSampleRate) {
    resampled = monoChannel;
  } else {
    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.round(monoChannel.length / ratio);
    resampled = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const origIndex = i * ratio;
      const low = Math.floor(origIndex);
      const high = Math.min(low + 1, monoChannel.length - 1);
      const weight = origIndex - low;
      resampled[i] = monoChannel[low] * (1 - weight) + monoChannel[high] * weight;
    }
  }

  console.log('Loading Whisper model (Xenova/whisper-base)...');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');

  console.log('Running transcription with word-level timestamps in Spanish...');
  const output = await transcriber(resampled, {
    language: 'spanish',
    task: 'transcribe',
    return_timestamps: 'word',
    chunk_length_s: 30,
    stride_length_s: 5,
  });

  console.log('Transcription output:');
  console.log(JSON.stringify(output, null, 2));

  fs.mkdirSync('src/captions', { recursive: true });
  fs.writeFileSync('src/captions/whisper_raw.json', JSON.stringify(output, null, 2));
  console.log('Saved raw transcription to src/captions/whisper_raw.json');
}

main().catch(console.error);
