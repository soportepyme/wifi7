import fs from 'fs';
import path from 'path';

const raw = JSON.parse(fs.readFileSync('src/captions/whisper_raw.json', 'utf-8'));
console.log('Transcription text:', raw.text);
console.log('\nAll chunks:');
raw.chunks.forEach((chunk, i) => {
  console.log(`${i.toString().padStart(2, ' ')}: [${chunk.timestamp[0].toFixed(2)}s - ${chunk.timestamp[1]?.toFixed(2)}s] "${chunk.text}"`);
});
