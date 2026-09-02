import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const execFileAsync = promisify(execFile);
const ffprobePath = ffprobeStatic.path;

const sourceDir = path.resolve('media');
const publicMediaDir = path.resolve('public/media');
const outputDir = path.resolve('public/media-cfr');

fs.mkdirSync(publicMediaDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const files = [
  '1_ok.mp4',
  '2_ok.mp4',
  '03_1.mp4',
  '3_2_ok.mp4',
  '5_ok.mp4',
  '6_1ok1.mp4',
  '08_ok.mp4',
  '9_ok.mp4'
];

async function convertAll() {
  console.log('Starting conversion of 8 MP4 files to 24 FPS CFR...');
  for (const file of files) {
    const src = path.join(sourceDir, file);
    const publicMediaSrc = path.join(publicMediaDir, file);
    if (fs.existsSync(src) && !fs.existsSync(publicMediaSrc)) {
      fs.copyFileSync(src, publicMediaSrc);
    }
    const dst = path.join(outputDir, file);
    console.log(`Converting ${file} -> ${dst}`);

    const args = [
      '-y',
      '-i', src,
      '-r', '24',
      '-c:v', 'libx264',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-movflags', '+faststart',
      dst
    ];

    await execFileAsync(ffmpegPath, args);
    console.log(`Done: ${file}`);
  }

  console.log('All files converted to CFR 24 FPS in public/media-cfr/');

  // Verify converted files with ffprobe
  for (const file of files) {
    const dst = path.join(outputDir, file);
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,codec_name',
      '-of', 'json',
      dst
    ]);
    console.log(`${file} stats:`, stdout.trim());
  }
}

convertAll().catch(console.error);
