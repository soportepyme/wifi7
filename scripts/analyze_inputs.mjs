import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffprobeStatic from 'ffprobe-static';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);
const ffprobePath = ffprobeStatic.path;

async function analyze() {
  const inputDir = path.resolve('input');
  const files = fs.readdirSync(inputDir);
  console.log('Files in input:', files);

  for (const f of files) {
    if (f.startsWith('.')) continue;
    const p = path.join(inputDir, f);
    try {
      const { stdout } = await execFileAsync(ffprobePath, [
        '-v', 'error',
        '-show_entries', 'format=duration,size,bit_rate',
        '-show_streams',
        '-of', 'json',
        p
      ]);
      const info = JSON.parse(stdout);
      console.log('--------------------------------------------------');
      console.log(`File: ${f}`);
      console.log(`Duration: ${info.format?.duration} s`);
      if (info.streams) {
        info.streams.forEach((s, idx) => {
          console.log(` Stream #${idx}: type=${s.codec_type}, codec=${s.codec_name}, ` +
            `res=${s.width}x${s.height}, fps=${s.r_frame_rate || s.avg_frame_rate}, frames=${s.nb_frames}`);
        });
      }
    } catch (err) {
      console.error(`Error probing ${f}:`, err.message);
    }
  }
}

analyze();
