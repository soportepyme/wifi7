import fs from 'fs';
import path from 'path';
import { execFile, exec } from 'child_process';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);
const inputDir = path.resolve('input');

export async function createTestVideo(filename, durationSec = 3, color = 'blue') {
  const filePath = path.join(inputDir, filename);
  await execFileAsync(ffmpegPath, [
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=${color}:s=1080x1920:r=30`,
    '-t', String(durationSec),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    filePath
  ]);
}

export async function createTestAudio(filename, durationSec = 5) {
  const filePath = path.join(inputDir, filename);
  await execFileAsync(ffmpegPath, [
    '-y',
    '-f', 'lavfi',
    '-i', 'sine=frequency=440:sample_rate=44100',
    '-t', String(durationSec),
    '-c:a', 'libmp3lame',
    filePath
  ]);
}

export function cleanInputDir() {
  if (fs.existsSync(inputDir)) {
    const files = fs.readdirSync(inputDir);
    for (const f of files) {
      fs.rmSync(path.join(inputDir, f), { force: true });
    }
  }
}

async function runCommand(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    return { code: 0, stdout, stderr };
  } catch (err) {
    return { code: err.code || 1, stdout: err.stdout || '', stderr: err.stderr || err.message };
  }
}

async function main() {
  console.log('🧪 Ejecutando suite de pruebas automatizadas...\n');

  // Test 1: 0 MP4 files
  console.log('--- Test 1: Sin videos MP4 ---');
  cleanInputDir();
  await createTestAudio('test.mp3', 3);
  let res = await runCommand('node scripts/prepare-reel.mjs');
  console.log(`Exit code: ${res.code}`);
  if (res.stderr.includes('No se encontraron videos MP4')) {
    console.log('✅ Test 1 pasado: Detectó correctamente la ausencia de MP4s.\n');
  } else {
    console.error('❌ Test 1 falló:', res);
  }

  // Test 2: 0 MP3 files
  console.log('--- Test 2: Sin archivo MP3 ---');
  cleanInputDir();
  await createTestVideo('01.mp4', 3);
  res = await runCommand('node scripts/prepare-reel.mjs');
  console.log(`Exit code: ${res.code}`);
  if (res.stderr.includes('No se encontró ningún archivo MP3')) {
    console.log('✅ Test 2 pasado: Detectó correctamente la ausencia de MP3.\n');
  } else {
    console.error('❌ Test 2 falló:', res);
  }

  // Test 3: Multiple MP3 files (>1)
  console.log('--- Test 3: Múltiples archivos MP3 ---');
  cleanInputDir();
  await createTestVideo('01.mp4', 3);
  await createTestAudio('audio1.mp3', 3);
  await createTestAudio('audio2.mp3', 3);
  res = await runCommand('node scripts/prepare-reel.mjs');
  console.log(`Exit code: ${res.code}`);
  if (res.stderr.includes('Se encontraron 2 archivos MP3')) {
    console.log('✅ Test 3 pasado: Detectó correctamente exceso de MP3s.\n');
  } else {
    console.error('❌ Test 3 falló:', res);
  }

  // Test 4: Total video duration < audio duration
  console.log('--- Test 4: Duración de videos menor que el audio ---');
  cleanInputDir();
  await createTestVideo('01.mp4', 2);
  await createTestAudio('Historia del WiFi.mp3', 6);
  res = await runCommand('node scripts/prepare-reel.mjs');
  console.log(`Exit code: ${res.code}`);
  if (res.stderr.includes('Duración insuficiente de video') && res.stderr.includes('Hacen falta')) {
    console.log('✅ Test 4 pasado: Detectó correctamente duración insuficiente y reportó faltantes.\n');
  } else {
    console.error('❌ Test 4 falló:', res);
  }

  // Test 5: Complex numerical filenames and sufficient duration
  console.log('--- Test 5: Nombres desordenados (1_video, 2_ok, 03_1, 3_2_ok, 08_final) ---');
  cleanInputDir();
  await createTestVideo('08_final.mp4', 2, 'red');
  await createTestVideo('2_ok.mp4', 2, 'green');
  await createTestVideo('03_1.mp4', 2, 'yellow');
  await createTestVideo('1_video.mp4', 2, 'blue');
  await createTestVideo('3_2_ok.mp4', 2, 'purple');
  await createTestAudio('Historia del WiFi.mp3', 5);

  res = await runCommand('node scripts/prepare-reel.mjs');
  console.log(`Exit code: ${res.code}`);
  console.log(res.stdout);
  if (res.code === 0 && res.stdout.includes('1. 1_video.mp4') && res.stdout.includes('2. 2_ok.mp4') && res.stdout.includes('3. 03_1.mp4') && res.stdout.includes('4. 3_2_ok.mp4') && res.stdout.includes('5. 08_final.mp4')) {
    console.log('✅ Test 5 pasado: Ordenamiento numérico y preparación exitosa.\n');
  } else {
    console.error('❌ Test 5 falló:', res);
  }

  // Test 6: Full reel render & verification
  console.log('--- Test 6: npm run reel (Renderizado y Verificación ffprobe) ---');
  res = await runCommand('node scripts/render-reel.mjs');
  console.log(`Exit code: ${res.code}`);
  console.log(res.stdout);
  if (res.code === 0 && res.stdout.includes('REEL GENERADO Y VERIFICADO EXITOSAMENTE')) {
    console.log('✅ Test 6 pasado: Renderizado completo y verificación de ffprobe exitosa.\n');
  } else {
    console.error('❌ Test 6 falló:', res);
  }
}

main().catch(console.error);
