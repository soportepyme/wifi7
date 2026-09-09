import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

// Detect scene changes in videos using ffmpeg select='gt(scene,0.2)'
async function detectScenes() {
  const inputDir = path.resolve('input');
  const files = [
    'video1.mp4',
    'video2.mp4',
    'video3.mp4',
    'video4.mp4',
    'video 5.mp4',
    'video6.mp4',
    'video7.mp4',
    'video8.mp4'
  ];

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    try {
      const { stderr } = await execFileAsync(ffmpegStatic, [
        '-i', inputPath,
        '-filter_complex', 'select=gt(scene\\,0.2),metadata=print:file=-',
        '-f', 'null',
        '-'
      ]);
      console.log(`=== Scenes in ${file} ===`);
      const lines = stderr.split('\n').filter(l => l.includes('pts_time') || l.includes('scene_score'));
      console.log(lines.slice(0, 10).join('\n') || 'No major cut within video');
    } catch (e) {
      console.log(`Error on ${file}:`, e.message);
    }
  }
}

detectScenes().catch(console.error);
