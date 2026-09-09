import fs from 'fs';
import path from 'path';
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import ffprobeStatic from 'ffprobe-static';

const execFileAsync = promisify(execFile);
const ffprobePath = ffprobeStatic.path;

async function renderViralTest() {
  console.log('\n============================================================');
  console.log('🎥 RENDERIZANDO PRUEBA SOPY_VIRAL: out/sopy_viral_test.mp4');
  console.log('============================================================\n');

  const outDir = path.resolve('out');
  fs.mkdirSync(outDir, { recursive: true });

  const targetOut = path.join(outDir, 'sopy_viral_test.mp4');
  if (fs.existsSync(targetOut)) {
    fs.rmSync(targetOut, { force: true });
  }

  const remotionCliPath = path.resolve('node_modules/@remotion/cli/remotion-cli.js');
  const renderArgs = [
    remotionCliPath,
    'render',
    'src/index.ts',
    'SopyWifi7Reel',
    targetOut,
    '--props={"editingPreset":"SOPY_VIRAL"}',
    '--codec=h264',
    '--crf=18',
    '--pixel-format=yuv420p',
    '--concurrency=2'
  ];

  console.log('⚙️ Ejecutando Remotion Render...');

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, renderArgs, {
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Remotion render falló con código ${code}`));
      }
    });
  });

  console.log('\n🔍 Analizando archivo renderizado con ffprobe...');

  const { stdout } = await execFileAsync(ffprobePath, [
    '-v', 'error',
    '-show_streams',
    '-show_format',
    '-of', 'json',
    targetOut
  ]);

  const probeData = JSON.parse(stdout);
  const video = probeData.streams.find(s => s.codec_type === 'video');
  const audio = probeData.streams.find(s => s.codec_type === 'audio');
  const duration = parseFloat(probeData.format.duration || video.duration || 0);

  console.log('\n📊 RESULTADOS FFPROBE:');
  console.log(`- Archivo: ${targetOut}`);
  console.log(`- Tamaño: ${(fs.statSync(targetOut).size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`- Resolución: ${video ? `${video.width}x${video.height}` : 'N/A'}`);
  console.log(`- FPS: ${video ? video.r_frame_rate : 'N/A'}`);
  console.log(`- Códec Video: ${video ? video.codec_name : 'N/A'}`);
  console.log(`- Pixel Format: ${video ? video.pix_fmt : 'N/A'}`);
  console.log(`- Códec Audio: ${audio ? audio.codec_name : 'N/A'}`);
  console.log(`- Duración: ${duration.toFixed(3)}s`);

  console.log('\n✅ Prueba de render completada exitosamente.');
}

renderViralTest().catch(err => {
  console.error('Error renderizando sopy_viral_test:', err);
  process.exit(1);
});
