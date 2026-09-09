import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

async function extractFrames() {
  const inputDir = path.resolve('input');
  const outFramesDir = path.resolve('scratch/video_frames');
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
    console.log(`Extracting frames from ${file}...`);
    // Extract 1 frame per second (fps=1)
    await execFileAsync(ffmpegStatic, [
      '-y',
      '-i', inputPath,
      '-vf', 'fps=1',
      '-q:v', '3',
      path.join(vFramesDir, 'frame_%02d.jpg')
    ]);
  }
  console.log('Frames extracted to scratch/video_frames');
}

extractFrames().catch(console.error);
