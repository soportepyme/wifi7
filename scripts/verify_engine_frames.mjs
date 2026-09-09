import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffprobeStatic from 'ffprobe-static';

const execFileAsync = promisify(execFile);
const ffprobePath = ffprobeStatic.path;

async function verifyEngineFrames() {
  console.log('=== VERIFICANDO SOPY DYNAMIC EDIT ENGINE (STILL TEST) ===');

  const testFramesDir = path.resolve('scratch/test_frames');
  fs.mkdirSync(testFramesDir, { recursive: true });

  const remotionCliPath = path.resolve('node_modules/@remotion/cli/remotion-cli.js');
  
  // Frames clave para verificar:
  // - Frame 0: Hook Wide
  // - Frame 28: Hook Closeup Punch Zoom
  // - Frame 80: Hook Shake / Medium
  // - Frame 300: Wi-Fi 7 Cut / Transition
  // - Frame 315: Wi-Fi 7 Detail Punch In
  // - Frame 500: Wi-Fi 7 Price Closeup
  const framesToTest = [
    { frame: 10, label: '01_hook_wide' },
    { frame: 30, label: '02_hook_closeup_punch' },
    { frame: 80, label: '03_scene1_body' },
    { frame: 300, label: '04_wifi7_transition' },
    { frame: 320, label: '05_wifi7_detail_punch' },
    { frame: 500, label: '06_wifi7_closing' }
  ];

  for (const { frame, label } of framesToTest) {
    const outImg = path.join(testFramesDir, `frame_${frame}_${label}.png`);
    console.log(`\nRenderizando frame ${frame} (${label})...`);
    
    await execFileAsync(process.execPath, [
      remotionCliPath,
      'still',
      'src/index.ts',
      'SopyWifi7Reel',
      outImg,
      `--frame=${frame}`,
      '--image-format=png'
    ]);

    // Comprobar con ffprobe
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v', 'error',
      '-show_streams',
      '-print_format', 'json',
      outImg
    ]);
    const probe = JSON.parse(stdout);
    const stream = probe.streams[0];
    console.log(`✅ Frame ${frame} generado: ${stream.width}x${stream.height} PNG (${(fs.statSync(outImg).size / 1024).toFixed(1)} KB)`);
  }

  console.log('\n✅ Todos los frames de prueba fueron generados y verificados exitosamente.');
}

verifyEngineFrames().catch(err => {
  console.error('Error al verificar frames:', err);
  process.exit(1);
});
