import fs from 'fs';
import path from 'path';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function probeFile(filePath) {
  const { stdout } = await execFileAsync(ffprobeStatic.path, [
    '-v', 'error',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    filePath
  ]);
  return JSON.parse(stdout);
}

async function prepareReelAssets() {
  console.log('=== PREPARING REEL ASSETS ===');

  const inputDir = path.resolve('input');
  const publicGenDir = path.resolve('public/generated');
  fs.mkdirSync(publicGenDir, { recursive: true });

  const escena1In = path.join(inputDir, 'escena1.mp4');
  const escena2In = path.join(inputDir, 'escena2.mp4');
  const musicIn = path.join(inputDir, 'Wi-Fi 7 Ya.mp3');

  if (!fs.existsSync(escena1In) || !fs.existsSync(escena2In) || !fs.existsSync(musicIn)) {
    throw new Error('Input files missing in input/ directory.');
  }

  const escena1Out = path.join(publicGenDir, 'escena1_cfr.mp4');
  const escena2Out = path.join(publicGenDir, 'escena2_cfr.mp4');
  const musicOut = path.join(publicGenDir, 'wifi7_music_20s.mp3');

  // 1. Normalize Escena 1 (1080x1920, 30fps CFR, H.264 CRF 18, yuv420p, no audio)
  console.log('\n[1/3] Normalizing escena1.mp4 -> escena1_cfr.mp4...');
  await execFileAsync(ffmpegStatic, [
    '-y',
    '-i', escena1In,
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30',
    '-r', '30',
    '-vsync', 'cfr',
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    '-an',
    escena1Out
  ]);
  console.log('Normalized escena1_cfr.mp4 ready.');

  // 2. Normalize Escena 2 (1080x1920, 30fps CFR, H.264 CRF 18, yuv420p, no audio)
  console.log('\n[2/3] Normalizing escena2.mp4 -> escena2_cfr.mp4...');
  await execFileAsync(ffmpegStatic, [
    '-y',
    '-i', escena2In,
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30',
    '-r', '30',
    '-vsync', 'cfr',
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    '-an',
    escena2Out
  ]);
  console.log('Normalized escena2_cfr.mp4 ready.');

  // 3. Process Audio (20.0 seconds exact, aligned with energetic music beat start at 0.35s, fade-in 0.15s, fade-out 0.5s)
  console.log('\n[3/3] Processing Wi-Fi 7 Ya.mp3 -> wifi7_music_20s.mp3...');
  await execFileAsync(ffmpegStatic, [
    '-y',
    '-ss', '0.35',
    '-t', '20.0',
    '-i', musicIn,
    '-af', 'afade=t=in:ss=0:d=0.15,afade=t=out:st=19.5:d=0.5',
    '-c:a', 'libmp3lame',
    '-b:a', '320k',
    musicOut
  ]);
  console.log('Processed wifi7_music_20s.mp3 ready.');

  // Probing generated files
  const probe1 = await probeFile(escena1Out);
  const probe2 = await probeFile(escena2Out);
  const probeMusic = await probeFile(musicOut);

  const dur1 = parseFloat(probe1.format.duration);
  const dur2 = parseFloat(probe2.format.duration);
  const frames1 = Math.round(dur1 * 30);
  const frames2 = Math.round(dur2 * 30);
  const totalFrames = frames1 + frames2;

  console.log('\nGenerated Assets Summary:');
  console.log(`- escena1_cfr.mp4: ${dur1.toFixed(3)}s (~${frames1} frames, ${probe1.streams[0].width}x${probe1.streams[0].height} @ 30fps)`);
  console.log(`- escena2_cfr.mp4: ${dur2.toFixed(3)}s (~${frames2} frames, ${probe2.streams[0].width}x${probe2.streams[0].height} @ 30fps)`);
  console.log(`- wifi7_music_20s.mp3: ${parseFloat(probeMusic.format.duration).toFixed(3)}s`);
  console.log(`- Total Composition Duration: ${totalFrames} frames (~${(totalFrames/30).toFixed(2)}s)`);

  const manifest = {
    compositionId: 'SopyWifi7Reel',
    fps: 30,
    width: 1080,
    height: 1920,
    durationInFrames: totalFrames,
    durationInSeconds: totalFrames / 30,
    audioFileName: 'wifi7_music_20s.mp3',
    scenes: [
      {
        id: 'scene_overload',
        videoFile: 'escena1_cfr.mp4',
        durationInFrames: frames1,
        startFrame: 0,
        endFrame: frames1
      },
      {
        id: 'scene_wifi7',
        videoFile: 'escena2_cfr.mp4',
        durationInFrames: frames2,
        startFrame: frames1,
        endFrame: totalFrames
      }
    ]
  };

  fs.writeFileSync(path.join(publicGenDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const tsContent = `// Auto-generated manifest for Remotion
export const MANIFEST = ${JSON.stringify(manifest, null, 2)} as const;

export type ManifestType = typeof MANIFEST;
`;
  fs.writeFileSync(path.resolve('src/generated-manifest.ts'), tsContent);

  console.log('\nManifest successfully saved to public/generated/manifest.json and src/generated-manifest.ts');
}

prepareReelAssets().catch(err => {
  console.error('Error preparing reel assets:', err);
  process.exit(1);
});
