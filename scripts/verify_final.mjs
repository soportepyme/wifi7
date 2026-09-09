import ffprobeStatic from 'ffprobe-static';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

async function verifyFinal() {
  const filePath = path.resolve('out/sopy_wifi7_reel.mp4');
  const { stdout } = await execFileAsync(ffprobeStatic.path, [
    '-v', 'error',
    '-show_entries', 'format=duration,size,bit_rate',
    '-show_streams',
    '-of', 'json',
    filePath
  ]);
  const data = JSON.parse(stdout);
  console.log('=== VERIFICACIÓN FINAL TÉCNICA (ffprobe) ===');
  console.log(`📁 Archivo: ${filePath}`);
  console.log(`⏱️ Duración: ${parseFloat(data.format.duration).toFixed(3)}s`);
  console.log(`📦 Tamaño: ${(data.format.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🚀 Bitrate: ${(data.format.bit_rate / 1000).toFixed(0)} kbps`);
  data.streams.forEach((s, i) => {
    console.log(`Stream #${i}: type=${s.codec_type} | codec=${s.codec_name} | res=${s.width}x${s.height} | fps=${s.r_frame_rate} (avg: ${s.avg_frame_rate}) | frames=${s.nb_frames} | pix_fmt=${s.pix_fmt || 'N/A'} | audio_sr=${s.sample_rate || 'N/A'} | ch=${s.channels || 'N/A'}`);
  });
}

verifyFinal().catch(console.error);
