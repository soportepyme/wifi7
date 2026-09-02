import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const execFileAsync = promisify(execFile);
const ffprobePath = ffprobeStatic.path;

const FPS = 24;
const inputDir = path.resolve('input');
const generatedDir = path.resolve('public/generated');
const outDir = path.resolve('out');
const scriptsDir = path.resolve('scripts');
const manifestTsPath = path.resolve('src/generated-manifest.ts');
const manifestJsonPath = path.resolve('public/generated/manifest.json');

// Ensure base directories exist
[inputDir, generatedDir, outDir, scriptsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Natural numerical sorting for filenames (e.g., 01.mp4, 1_video.mp4, 2_ok.mp4, 03_1.mp4, 3_2_ok.mp4, 08_final.mp4)
 */
export function naturalSort(files) {
  const parse = (name) => {
    const parts = name.split(/(\d+)/);
    return parts.map(part => {
      const num = parseInt(part, 10);
      return isNaN(num) ? part.toLowerCase() : num;
    });
  };

  return [...files].sort((a, b) => {
    const pa = parse(a);
    const pb = parse(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      if (pa[i] === undefined) return -1;
      if (pb[i] === undefined) return 1;
      if (typeof pa[i] === 'number' && typeof pb[i] === 'number') {
        if (pa[i] !== pb[i]) return pa[i] - pb[i];
      } else {
        const cmp = String(pa[i]).localeCompare(String(pb[i]));
        if (cmp !== 0) return cmp;
      }
    }
    return a.localeCompare(b);
  });
}

/**
 * Get exact duration in seconds of a media file via ffprobe
 */
async function getMediaDuration(filePath) {
  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);
    const duration = parseFloat(stdout.trim());
    if (isNaN(duration) || duration <= 0) {
      throw new Error(`Duración inválida (${stdout.trim()})`);
    }
    return duration;
  } catch (error) {
    throw new Error(`Error al analizar la duración de "${path.basename(filePath)}": ${error.message}`);
  }
}

/**
 * Generate a safe output filename based on the input MP3 name
 * Example: "Historia del WiFi.mp3" -> "Historia-del-WiFi-Reel.mp4"
 */
export function generateOutputFileName(mp3FileName) {
  const base = path.parse(mp3FileName).name;
  const cleanBase = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/[^a-zA-Z0-9_-]+/g, '-') // replace spaces & symbols with -
    .replace(/^-+|-+$/g, ''); // trim hyphens
  return `${cleanBase || 'Reel'}-Reel.mp4`;
}

/**
 * Generate a safe internal filename for public/generated/
 */
export function sanitizeFileName(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext);
  const clean = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .toLowerCase();
  return `${clean || 'audio'}${ext}`;
}

async function prepareReel() {
  console.log('\n============================================================');
  console.log('🚀 INICIANDO PREPARACIÓN DE REEL (PREPARE-REEL)');
  console.log('============================================================\n');

  // 1. Read input directory
  const inputEntries = fs.readdirSync(inputDir);
  const mp4Files = inputEntries.filter(f => f.toLowerCase().endsWith('.mp4'));
  const mp3Files = inputEntries.filter(f => f.toLowerCase().endsWith('.mp3'));

  // 2. Validate input files
  if (mp4Files.length === 0) {
    console.error('❌ ERROR: No se encontraron videos MP4 en la carpeta "input/".');
    console.error('   Por favor, coloca al menos un archivo .mp4 en la carpeta "input/".');
    process.exit(1);
  }

  if (mp3Files.length === 0) {
    console.error('❌ ERROR: No se encontró ningún archivo MP3 en la carpeta "input/".');
    console.error('   Se requiere exactamente un archivo .mp3 como pista de audio.');
    process.exit(1);
  }

  if (mp3Files.length > 1) {
    console.error(`❌ ERROR: Se encontraron ${mp3Files.length} archivos MP3 en la carpeta "input/":`);
    mp3Files.forEach(f => console.error(`   - ${f}`));
    console.error('   Debe haber exactamente un solo archivo MP3.');
    process.exit(1);
  }

  const selectedMp3 = mp3Files[0];
  const inputMp3Path = path.join(inputDir, selectedMp3);

  // 3. Sort videos numerically
  const sortedMp4Files = naturalSort(mp4Files);

  console.log('📋 Orden numérico detectado de videos:');
  sortedMp4Files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log(`\n🎵 Archivo MP3 detectado: ${selectedMp3}`);

  // 4. Measure durations
  console.log('\n⏳ Analizando duraciones con ffprobe...');
  const audioDurationSec = await getMediaDuration(inputMp3Path);
  const durationInFrames = Math.ceil(audioDurationSec * FPS);

  console.log(`   Duración del audio: ${audioDurationSec.toFixed(3)}s (${durationInFrames} cuadros a ${FPS} FPS)`);

  const videoDurations = [];
  for (const file of sortedMp4Files) {
    const vPath = path.join(inputDir, file);
    const dur = await getMediaDuration(vPath);
    videoDurations.push(dur);
  }

  const totalVideoSec = videoDurations.reduce((sum, d) => sum + d, 0);
  console.log(`   Duración total de videos disponibles: ${totalVideoSec.toFixed(3)}s`);

  // Check if total video duration is sufficient
  if (totalVideoSec < audioDurationSec) {
    const missingSec = audioDurationSec - totalVideoSec;
    console.error('\n❌ ERROR: Duración insuficiente de video.');
    console.error(`   Duración total de videos: ${totalVideoSec.toFixed(2)}s`);
    console.error(`   Duración del audio requerido: ${audioDurationSec.toFixed(2)}s`);
    console.error(`   Hacen falta ${missingSec.toFixed(2)} segundos adicionales de video para cubrir toda la música.`);
    process.exit(1);
  }

  // 5. Proportional frame distribution across videos
  const clipCount = sortedMp4Files.length;
  const assignedFrames = [];
  const maxAvailableFrames = videoDurations.map(d => Math.floor(d * FPS));

  let assignedSum = 0;
  for (let i = 0; i < clipCount - 1; i++) {
    const proportion = videoDurations[i] / totalVideoSec;
    let frames = Math.floor(durationInFrames * proportion);
    frames = Math.max(1, Math.min(frames, maxAvailableFrames[i]));
    assignedFrames.push(frames);
    assignedSum += frames;
  }

  // Last clip gets the exact remainder to make total equal to durationInFrames
  let lastClipFrames = durationInFrames - assignedSum;
  assignedFrames.push(lastClipFrames);

  // If the last clip exceeds its available frames due to rounding, rebalance with previous clips
  if (assignedFrames[clipCount - 1] > maxAvailableFrames[clipCount - 1]) {
    let excess = assignedFrames[clipCount - 1] - maxAvailableFrames[clipCount - 1];
    assignedFrames[clipCount - 1] = maxAvailableFrames[clipCount - 1];

    for (let i = clipCount - 2; i >= 0 && excess > 0; i--) {
      const room = maxAvailableFrames[i] - assignedFrames[i];
      if (room > 0) {
        const add = Math.min(room, excess);
        assignedFrames[i] += add;
        excess -= add;
      }
    }
  }

  // Double check sum
  const finalFrameSum = assignedFrames.reduce((a, b) => a + b, 0);
  if (finalFrameSum !== durationInFrames) {
    console.error(`❌ Error interno en cálculo de cuadros (${finalFrameSum} != ${durationInFrames})`);
    process.exit(1);
  }

  console.log('\n📊 Distribución de cuadros asignada por video:');
  sortedMp4Files.forEach((file, index) => {
    const frames = assignedFrames[index];
    const sec = (frames / FPS).toFixed(2);
    const origSec = videoDurations[index].toFixed(2);
    console.log(`   ${index + 1}. ${file} -> ${frames} cuadros (${sec}s de ${origSec}s disponibles)`);
  });
  console.log(`   Total cuadros asignados: ${finalFrameSum} / ${durationInFrames} (${(finalFrameSum / FPS).toFixed(2)}s)`);

  // 6. Clean public/generated directory (without touching input)
  console.log('\n🧹 Limpiando directorio public/generated/...');
  const existingGeneratedFiles = fs.readdirSync(generatedDir);
  for (const entry of existingGeneratedFiles) {
    fs.rmSync(path.join(generatedDir, entry), { recursive: true, force: true });
  }

  // 7. Normalize MP4 videos with FFmpeg
  console.log('\n🔄 Normalizando videos con FFmpeg (24 FPS CFR, H.264, CRF 18, yuv420p, faststart, sin audio)...');
  const videoClipsManifest = [];

  for (let i = 0; i < clipCount; i++) {
    const originalName = sortedMp4Files[i];
    const inputPath = path.join(inputDir, originalName);
    const generatedFileName = `clip_${String(i + 1).padStart(2, '0')}.mp4`;
    const outputPath = path.join(generatedDir, generatedFileName);

    console.log(`   [${i + 1}/${clipCount}] Normalizando "${originalName}" -> "${generatedFileName}"...`);

    const ffmpegArgs = [
      '-y',
      '-i', inputPath,
      '-r', String(FPS),
      '-c:v', 'libx264',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-movflags', '+faststart',
      outputPath
    ];

    await execFileAsync(ffmpegPath, ffmpegArgs);

    videoClipsManifest.push({
      id: `clip_${String(i + 1).padStart(2, '0')}`,
      file: generatedFileName,
      originalName,
      durationInSeconds: parseFloat((assignedFrames[i] / FPS).toFixed(3)),
      durationInFrames: assignedFrames[i],
    });
  }

  // 8. Copy audio with safe name to public/generated/
  const safeAudioName = sanitizeFileName(selectedMp3);
  const destAudioPath = path.join(generatedDir, safeAudioName);
  fs.copyFileSync(inputMp3Path, destAudioPath);
  console.log(`\n🔊 Audio copiado a public/generated/${safeAudioName}`);

  // 9. Generate suggested output filename
  const suggestedOutputFileName = generateOutputFileName(selectedMp3);

  // 10. Generate manifest files
  const manifestData = {
    audioFileName: safeAudioName,
    originalAudioName: selectedMp3,
    audioDuration: parseFloat(audioDurationSec.toFixed(3)),
    fps: FPS,
    durationInFrames,
    videos: videoClipsManifest,
    outputFileName: suggestedOutputFileName,
  };

  const manifestTsContent = `// Auto-generated by scripts/prepare-reel.mjs - DO NOT EDIT MANUALLY
export interface VideoClipInfo {
  id: string;
  file: string;
  originalName: string;
  durationInSeconds: number;
  durationInFrames: number;
}

export interface ManifestData {
  audioFileName: string;
  originalAudioName: string;
  audioDuration: number;
  fps: number;
  durationInFrames: number;
  videos: VideoClipInfo[];
  outputFileName: string;
}

export const MANIFEST: ManifestData = ${JSON.stringify(manifestData, null, 2)};

export default MANIFEST;
`;

  fs.writeFileSync(manifestTsPath, manifestTsContent, 'utf-8');
  fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestData, null, 2), 'utf-8');

  console.log('📝 Manifiesto generado en src/generated-manifest.ts');
  console.log(`🎬 Archivo final sugerido: out/${suggestedOutputFileName}`);
  console.log('\n✅ Preparación completada con éxito.');
  console.log('============================================================\n');
}

// Run if called directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/prepare-reel.mjs')) {
  prepareReel().catch(err => {
    console.error('❌ Error fatal durante la preparación:', err);
    process.exit(1);
  });
}

export { prepareReel };
