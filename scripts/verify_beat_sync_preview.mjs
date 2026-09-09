import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function verifyBeatSyncPreview() {
  console.log('=== VERIFICANDO SOPY BEAT SYNC ENGINE (PREVIEW TEST) ===\n');

  const beatMapPath = path.resolve('public/generated/beat-map.json');
  const BEAT_MAP = JSON.parse(fs.readFileSync(beatMapPath, 'utf-8'));



  // 1. Mostrar datos del Beat Map
  console.log('📊 DATOS DEL BEAT MAP:');
  console.log(`- Fuente: ${BEAT_MAP.source}`);
  console.log(`- BPM: ${BEAT_MAP.bpm}`);
  console.log(`- Confidence: ${BEAT_MAP.confidence}`);
  console.log(`- Beats totales: ${BEAT_MAP.stats.totalBeats}`);
  console.log(`- Strong: ${BEAT_MAP.stats.strong}`);
  console.log(`- Medium: ${BEAT_MAP.stats.medium}`);
  console.log(`- Weak: ${BEAT_MAP.stats.weak}`);
  console.log(`- Enabled: ${BEAT_MAP.enabled}\n`);

  console.log('🎬 GOLPES MUSICALES EN LOS PRIMEROS 6 SEGUNDOS (0 - 180 frames):');
  const earlyBeats = BEAT_MAP.beats.filter(b => b.frame <= 180);
  for (const b of earlyBeats) {
    console.log(`  🥁 Frame ${b.frame} (${b.time.toFixed(2)}s) -> Nivel: ${b.level} | Fuerza: ${b.strength}`);
  }


  // 3. Renderizar stills de prueba de los primeros 6 segundos con Remotion
  const outDir = path.resolve('scratch/beat_sync_test_frames');
  fs.mkdirSync(outDir, { recursive: true });

  const remotionCli = path.resolve('node_modules/@remotion/cli/remotion-cli.js');
  const testFrames = [
    { frame: 10, label: '01_hook_wide' },
    { frame: 25, label: '02_hook_closeup_punch_beat' },
    { frame: 50, label: '03_hook_detail_beat' },
    { frame: 80, label: '04_hook_shake_beat' },
    { frame: 140, label: '05_body_leftpunch_beat' },
    { frame: 180, label: '06_body_closeup' }
  ];

  console.log('\n🖼️ Renderizando stills de prueba para validar visualmente en 1080x1920:');
  for (const tf of testFrames) {
    const imgPath = path.join(outDir, `frame_${tf.frame}_${tf.label}.png`);
    await execFileAsync(process.execPath, [
      remotionCli,
      'still',
      'src/index.ts',
      'SopyWifi7Reel',
      imgPath,
      `--frame=${tf.frame}`,
      '--props={"editingPreset":"SOPY_VIRAL","beatSync":true}',
      '--image-format=png'
    ]);
    const sizeKB = (fs.statSync(imgPath).size / 1024).toFixed(1);
    console.log(`✅ Frame ${tf.frame} (${tf.label}) generado exitosamente (${sizeKB} KB)`);
  }

  console.log('\n🎉 Todas las validaciones de SOPY BEAT SYNC ENGINE completadas con éxito.');
}

verifyBeatSyncPreview().catch((err) => {
  console.error('Error en verificación:', err);
  process.exit(1);
});
