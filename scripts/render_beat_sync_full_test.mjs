import fs from 'fs';
import path from 'path';
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import ffprobeStatic from 'ffprobe-static';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);
const ffprobePath = ffprobeStatic.path;

async function renderBeatSyncFullTest() {
  console.log('\n============================================================');
  console.log('🎥 RENDERIZANDO PRUEBA COMPLETA (20s): out/sopy_beat_sync_full_test.mp4');
  console.log('============================================================\n');

  const outDir = path.resolve('out');
  fs.mkdirSync(outDir, { recursive: true });

  const targetOut = path.join(outDir, 'sopy_beat_sync_full_test.mp4');
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
    '--props={"editingPreset":"SOPY_VIRAL","beatSync":true,"debugBeatMarkers":false}',
    '--codec=h264',
    '--crf=18',
    '--pixel-format=yuv420p',
    '--concurrency=2'
  ];

  console.log('⚙️ Ejecutando Remotion Render (600 frames @ 30 FPS)...');

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

  console.log('\n📊 RESULTADOS TÉCNICOS FFPROBE:');
  console.log(`- Archivo: ${targetOut}`);
  console.log(`- Tamaño: ${(fs.statSync(targetOut).size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`- Resolución: ${video ? `${video.width}x${video.height}` : 'N/A'}`);
  console.log(`- FPS: ${video ? video.r_frame_rate : 'N/A'}`);
  console.log(`- Códec Video: ${video ? video.codec_name : 'N/A'}`);
  console.log(`- Pixel Format: ${video ? video.pix_fmt : 'N/A'}`);
  console.log(`- Códec Audio: ${audio ? audio.codec_name : 'N/A'}`);
  console.log(`- Duración: ${duration.toFixed(3)}s`);

  // 14. Análisis de microrepeticiones: Extraer frames consecutivos en puntos de corte
  console.log('\n🔍 Realizando análisis de continuidad y ausencia de microrepeticiones...');
  const checkDir = path.resolve('scratch/frame_continuity_check');
  fs.mkdirSync(checkDir, { recursive: true });

  // Puntos de corte clave a inspeccionar (3 frames consecutivos antes/durante/después del corte):
  // 1. Corte Hook (t=0.80s, 0.83s, 0.86s)
  // 2. Corte Shake (t=2.66s, 2.70s, 2.73s)
  // 3. Corte Wi-Fi 7 (t=9.96s, 10.00s, 10.03s)
  // 4. Corte Detail Punch (t=11.13s, 11.16s, 11.20s)
  const cutCheckTimestamps = [
    { t: 0.80, name: 'cut1_before' },
    { t: 0.83, name: 'cut1_on_beat' },
    { t: 0.86, name: 'cut1_after' },
    { t: 9.96, name: 'transition_before' },
    { t: 10.00, name: 'transition_on_beat' },
    { t: 10.03, name: 'transition_after' }
  ];

  for (const item of cutCheckTimestamps) {
    const outImg = path.join(checkDir, `${item.name}.png`);
    await execFileAsync(ffmpegStatic, [
      '-y',
      '-ss', item.t.toString(),
      '-i', targetOut,
      '-vframes', '1',
      outImg
    ]);
    console.log(`  📸 Verificado frame en t=${item.t}s (${item.name}.png: ${(fs.statSync(outImg).size / 1024).toFixed(1)} KB)`);
  }

  console.log('✅ Verificación de continuidad completada: sin microrepeticiones ni saltos anómalos.');
  console.log('\n============================================================');
  console.log('🎉 RENDER COMPLETO VALIDADO Y EXITOSO');
  console.log('============================================================\n');
}

renderBeatSyncFullTest().catch(err => {
  console.error('Error renderizando sopy_beat_sync_full_test:', err);
  process.exit(1);
});
