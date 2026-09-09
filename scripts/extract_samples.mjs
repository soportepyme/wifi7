import path from 'path';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function extractSampleFrames() {
  const outDir = path.resolve('scratch/sample_frames');
  fs.mkdirSync(outDir, { recursive: true });

  const inputs = [
    { file: 'input/escena1.mp4', prefix: 'escena1' },
    { file: 'input/escena2.mp4', prefix: 'escena2' }
  ];

  for (const item of inputs) {
    const inputPath = path.resolve(item.file);
    for (let t = 1; t <= 9; t += 2) {
      const outPath = path.join(outDir, `${item.prefix}_${t}s.jpg`);
      await execFileAsync(ffmpegStatic, [
        '-y',
        '-ss', t.toString(),
        '-i', inputPath,
        '-vframes', '1',
        '-q:v', '2',
        outPath
      ]);
      console.log(`Extracted: ${outPath}`);
    }
  }
}

extractSampleFrames().catch(console.error);
