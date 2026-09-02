import fs from 'fs';
import path from 'path';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import ffprobeStatic from 'ffprobe-static';

const execFileAsync = promisify(execFile);
const ffprobePath = ffprobeStatic.path;

const outDir = path.resolve('out');
const manifestJsonPath = path.resolve('public/generated/manifest.json');

async function renderReel() {
  console.log('\n============================================================');
  console.log('🎥 INICIANDO RENDERIZADO Y VERIFICACIÓN (RENDER-REEL)');
  console.log('============================================================\n');

  // 1. Check manifest exists
  if (!fs.existsSync(manifestJsonPath)) {
    console.error('❌ ERROR: No se encontró el manifiesto "public/generated/manifest.json".');
    console.error('   Por favor ejecuta "npm run prepare" antes de renderizar.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf-8'));
  const outputFileName = manifest.outputFileName || 'reel-final.mp4';
  const finalFilePath = path.join(outDir, outputFileName);
  const tempFileName = `.tmp-${Date.now()}-${outputFileName}`;
  const tempFilePath = path.join(outDir, tempFileName);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`🎬 Composición: VideoPrincipal`);
  console.log(`⏱️ Cuadros totales: ${manifest.durationInFrames} (@ ${manifest.fps} FPS)`);
  console.log(`📁 Archivo temporal: ${tempFileName}`);
  console.log(`🎯 Archivo final destino: ${outputFileName}\n`);

  // 2. Execute Remotion render using the node CLI runner
  const remotionCliPath = path.resolve('node_modules/@remotion/cli/remotion-cli.js');
  const renderArgs = [
    remotionCliPath,
    'render',
    'src/index.ts',
    'VideoPrincipal',
    tempFilePath,
    '--codec=h264',
    '--crf=18',
    '--pixel-format=yuv420p',
    '--concurrency=1'
  ];

  console.log('⚙️ Ejecutando renderizado con Remotion...');
  
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
        reject(new Error(`El render de Remotion finalizó con código de salida ${code}`));
      }
    });
  });

  if (!fs.existsSync(tempFilePath)) {
    console.error('❌ ERROR: El archivo temporal renderizado no fue encontrado.');
    process.exit(1);
  }

  console.log('\n🔍 Verificando especificaciones técnicas con ffprobe...');

  // 3. Inspect rendered file with ffprobe
  const { stdout: probeStdout } = await execFileAsync(ffprobePath, [
    '-v', 'error',
    '-show_streams',
    '-show_format',
    '-of', 'json',
    tempFilePath
  ]);

  const probeData = JSON.parse(probeStdout);
  const videoStreams = probeData.streams.filter(s => s.codec_type === 'video');
  const audioStreams = probeData.streams.filter(s => s.codec_type === 'audio');
  const format = probeData.format || {};

  const renderedDuration = parseFloat(format.duration || (videoStreams[0] && videoStreams[0].duration) || 0);

  // Verification checks:
  const errors = [];

  // Check video stream
  if (videoStreams.length === 0) {
    errors.push('No se encontró ninguna pista de video en el archivo renderizado.');
  } else {
    const v = videoStreams[0];
    if (v.width !== 1080 || v.height !== 1920) {
      errors.push(`Resolución incorrecta: se esperaba 1080x1920, se obtuvo ${v.width}x${v.height}`);
    }

    if (v.codec_name !== 'h264') {
      errors.push(`Códec de video incorrecto: se esperaba h264, se obtuvo ${v.codec_name}`);
    }

    if (v.pix_fmt !== 'yuv420p' && v.pix_fmt !== 'yuvj420p') {
      errors.push(`Pixel format incorrecto: se esperaba yuv420p, se obtuvo ${v.pix_fmt}`);
    }

    const rFrameRate = v.r_frame_rate || v.avg_frame_rate;
    if (rFrameRate !== '24/1' && rFrameRate !== '24') {
      errors.push(`Tasa de cuadros incorrecta: se esperaba 24 FPS constante (24/1), se obtuvo ${rFrameRate}`);
    }
  }

  // Check audio stream (exact single AAC audio stream)
  if (audioStreams.length === 0) {
    errors.push('No se encontró pista de audio general en el render.');
  } else if (audioStreams.length > 1) {
    errors.push(`Se detectaron ${audioStreams.length} pistas de audio (debe haber exactamente 1 pista de audio AAC).`);
  } else {
    const a = audioStreams[0];
    if (a.codec_name !== 'aac') {
      errors.push(`Códec de audio incorrecto: se esperaba aac, se obtuvo ${a.codec_name}`);
    }
  }

  // Check duration match with MP3
  const expectedAudioDuration = manifest.audioDuration;
  const durationDiff = Math.abs(renderedDuration - expectedAudioDuration);
  // Allow tolerance of up to 1-2 frames (~0.1s)
  if (durationDiff > 0.3) {
    errors.push(`La duración del Reel (${renderedDuration.toFixed(2)}s) difiere significativamente de la música (${expectedAudioDuration.toFixed(2)}s).`);
  }

  if (errors.length > 0) {
    console.error('\n❌ ERROR: La verificación técnica del Reel falló:');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n⚠️ El archivo anterior no fue modificado ni eliminado.');
    if (fs.existsSync(tempFilePath)) {
      fs.rmSync(tempFilePath, { force: true });
    }
    process.exit(1);
  }

  console.log('✅ Verificación técnica superada con éxito.');

  // 4. Safely replace previous render only after verification passes
  if (fs.existsSync(finalFilePath)) {
    fs.rmSync(finalFilePath, { force: true });
  }
  fs.renameSync(tempFilePath, finalFilePath);

  // 5. Final output summary
  console.log('\n============================================================');
  console.log('🎉 REEL GENERADO Y VERIFICADO EXITOSAMENTE');
  console.log('============================================================');
  console.log(`📹 Cantidad de videos utilizados: ${manifest.videos.length}`);
  console.log('📋 Orden de los videos:');
  manifest.videos.forEach((v, i) => {
    console.log(`   ${i + 1}. ${v.originalName} (${v.durationInFrames} cuadros / ${(v.durationInFrames / 24).toFixed(2)}s)`);
  });
  console.log(`🎵 Duración de la música: ${manifest.audioDuration.toFixed(2)}s (${manifest.durationInFrames} cuadros @ ${manifest.fps} FPS)`);
  console.log(`🎬 Duración del Reel: ${renderedDuration.toFixed(2)}s`);
  console.log(`📁 Ruta completa del MP4 terminado:\n   ${path.resolve(finalFilePath)}`);
  console.log('============================================================\n');
}

// Run if called directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/render-reel.mjs')) {
  renderReel().catch(err => {
    console.error('❌ Error fatal durante el renderizado:', err);
    process.exit(1);
  });
}

export { renderReel };
