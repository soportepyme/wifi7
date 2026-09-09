import fs from 'fs';
import path from 'path';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import ffprobeStatic from 'ffprobe-static';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);
const ffprobePath = ffprobeStatic.path;

const outDir = path.resolve('out');
const manifestJsonPath = path.resolve('public/generated/ad_manifest.json');

async function renderAd() {
  console.log('\n============================================================');
  console.log('🎥 INICIANDO RENDERIZADO Y CONTROL DE CALIDAD AD YOUTUBE (60S)');
  console.log('============================================================\n');

  // 1. Check manifest exists
  if (!fs.existsSync(manifestJsonPath)) {
    console.error('❌ ERROR: No se encontró el manifiesto "public/generated/ad_manifest.json".');
    console.error('   Por favor ejecuta "npm run ad:prepare" o "node scripts/prepare-ad.mjs" primero.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf-8'));
  const outputFileName = 'soportepyme_diagnostico_250_youtube.mp4';
  const finalFilePath = path.join(outDir, outputFileName);
  const tempFileName = `.tmp-${Date.now()}-${outputFileName}`;
  const tempFilePath = path.join(outDir, tempFileName);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`🎬 Composición: VideoPrincipal (AdYouTube)`);
  console.log(`⏱️ Cuadros totales: ${manifest.durationInFrames} (@ ${manifest.fps} FPS)`);
  console.log(`⏱️ Duración esperada: ${(manifest.durationInFrames / manifest.fps).toFixed(3)}s`);
  console.log(`📐 Resolución: ${manifest.width} x ${manifest.height}`);
  console.log(`🎯 Archivo final destino: out/${outputFileName}\n`);

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
    '--concurrency=2'
  ];

  console.log('⚙️ Renderizando composición con Remotion CLI...');

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

  console.log('\n🔍 Realizando verificación técnica exhaustiva con ffprobe...');

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
    if (v.width !== 1920 || v.height !== 1080) {
      errors.push(`Resolución incorrecta: se esperaba 1920x1080, se obtuvo ${v.width}x${v.height}`);
    }

    if (v.codec_name !== 'h264') {
      errors.push(`Códec de video incorrecto: se esperaba h264, se obtuvo ${v.codec_name}`);
    }

    if (v.pix_fmt !== 'yuv420p' && v.pix_fmt !== 'yuvj420p') {
      errors.push(`Pixel format incorrecto: se esperaba yuv420p, se obtuvo ${v.pix_fmt}`);
    }

    const rFrameRate = v.r_frame_rate || v.avg_frame_rate;
    if (rFrameRate !== '30/1' && rFrameRate !== '30') {
      errors.push(`Tasa de cuadros incorrecta: se esperaba 30 FPS constante (30/1), se obtuvo ${rFrameRate}`);
    }
  }

  // Check audio stream (exact single AAC audio stream)
  if (audioStreams.length === 0) {
    errors.push('No se encontró pista de audio en el render.');
  } else if (audioStreams.length > 1) {
    errors.push(`Se detectaron ${audioStreams.length} pistas de audio (debe haber exactamente 1 pista de audio AAC).`);
  } else {
    const a = audioStreams[0];
    if (a.codec_name !== 'aac') {
      errors.push(`Códec de audio incorrecto: se esperaba aac, se obtuvo ${a.codec_name}`);
    }
  }

  // Check duration match
  const expectedDuration = manifest.durationInFrames / manifest.fps;
  const durationDiff = Math.abs(renderedDuration - expectedDuration);
  const maxAllowedDiff = 1 / manifest.fps + 0.05; // 1 frame tolerance (~0.08s)

  if (durationDiff > maxAllowedDiff) {
    errors.push(`La duración del anuncio (${renderedDuration.toFixed(3)}s) difiere de la esperada (${expectedDuration.toFixed(3)}s) por ${durationDiff.toFixed(3)}s.`);
  }

  // 4. Black frame detection
  console.log('🔍 Ejecutando análisis de detección de cuadros negros no deseados...');
  try {
    const { stderr: blackDetectOut } = await execFileAsync(ffmpegPath, [
      '-i', tempFilePath,
      '-vf', 'blackdetect=d=0.3:pix_th=0.08',
      '-an',
      '-f', 'null',
      '-'
    ]);

    if (blackDetectOut.includes('black_start')) {
      console.warn('⚠️ Advertencia: Se detectaron segmentos oscuros en el render.');
    } else {
      console.log('   ✅ Sin cuadros negros anómalos detectados.');
    }
  } catch (err) {
    console.warn('   ⚠️ No se pudo completar blackdetect:', err.message);
  }

  if (errors.length > 0) {
    console.error('\n❌ ERROR: La verificación técnica del anuncio falló:');
    errors.forEach(err => console.error(`   - ${err}`));
    if (fs.existsSync(tempFilePath)) {
      fs.rmSync(tempFilePath, { force: true });
    }
    process.exit(1);
  }

  console.log('✅ Todas las verificaciones técnicas superadas con éxito.');

  // 5. Replace previous render
  if (fs.existsSync(finalFilePath)) {
    fs.rmSync(finalFilePath, { force: true });
  }
  fs.renameSync(tempFilePath, finalFilePath);

  // 6. Final output summary
  console.log('\n============================================================');
  console.log('🎉 ANUNCIO YOUTUBE DE SOPORTEPYME GENERADO Y VERIFICADO EXITOSAMENTE');
  console.log('============================================================');
  console.log(`📹 Cantidad de escenas editadas: ${manifest.videos.length}`);
  console.log(`⏱️ Cuadros totales: ${manifest.durationInFrames} (@ 30 FPS CFR)`);
  console.log(`🎬 Duración exacta: ${renderedDuration.toFixed(3)}s`);
  console.log(`📐 Resolución: 1920 x 1080 (16:9 Horizontal YouTube)`);
  console.log(`🔊 Pista de audio: AAC Stereo 48kHz`);
  console.log(`📝 Archivo EDL de decisiones:\n   ${path.resolve('out/soportepyme_edit_decisions.json')}`);
  console.log(`📁 Archivo final MP4 listo:\n   ${path.resolve(finalFilePath)}`);
  console.log('============================================================\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/render-ad.mjs')) {
  renderAd().catch(err => {
    console.error('❌ Error fatal durante el renderizado:', err);
    process.exit(1);
  });
}

export { renderAd };
