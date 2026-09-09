import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const execFileAsync = promisify(execFile);

async function checkAudio() {
  const mp3Path = path.resolve('input/Tu red también debería hacerlo.mp3');
  const wavPath = path.resolve('scratch/decoded.wav');
  fs.mkdirSync('scratch', { recursive: true });

  await execFileAsync(ffmpegStatic, [
    '-y',
    '-i', mp3Path,
    '-vn',
    wavPath
  ]);

  const { stdout: wavProbe } = await execFileAsync(ffprobeStatic.path, [
    '-v', 'error',
    '-show_streams',
    '-show_format',
    '-of', 'json',
    wavPath
  ]);
  const wavData = JSON.parse(wavProbe);
  console.log('WAV duration:', wavData.format?.duration);
  console.log('WAV stream:', wavData.streams?.[0]);
}

checkAudio().catch(console.error);
