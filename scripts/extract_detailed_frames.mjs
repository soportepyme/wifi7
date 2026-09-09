import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

async function extractDetailedFrames() {
  const inputDir = path.resolve('input');
  const outFramesDir = path.resolve('scratch/video_detailed_frames');
  fs.mkdirSync(outFramesDir, { recursive: true });

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
    const videoName = path.parse(file).name.replace(/\s+/g, '_');
    const vFramesDir = path.join(outFramesDir, videoName);
    fs.mkdirSync(vFramesDir, { recursive: true });

    const inputPath = path.join(inputDir, file);
    // Extract 2 frames per second
    await execFileAsync(ffmpegStatic, [
      '-y',
      '-i', inputPath,
      '-vf', 'fps=2',
      '-q:v', '3',
      path.join(vFramesDir, 'frame_%03d.jpg')
    ]);
  }
  console.log('Detailed frames extracted (2 fps).');
}

extractDetailedFrames().catch(console.error);
