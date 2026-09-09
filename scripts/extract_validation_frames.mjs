import path from 'path';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function extractValidationFrames() {
  const outDir = path.resolve('scratch/validation_frames');
  fs.mkdirSync(outDir, { recursive: true });

  const timestamps = [
    { t: '00:00:01.500', name: '01_intro_wifi' },
    { t: '00:00:04.000', name: '02_devices_badges' },
    { t: '00:00:05.000', name: '03_todo_conectado' },
    { t: '00:00:07.500', name: '04_mas_de_20_dispositivos' },
    { t: '00:00:09.500', name: '05_sopy_te_dice_la_verdad' },
    { t: '00:00:10.000', name: '06_transition_flash' },
    { t: '00:00:11.800', name: '07_tu_router_importa' },
    { t: '00:00:13.800', name: '08_salto_wifi7' },
    { t: '00:00:16.000', name: '09_mas_capacidad' },
    { t: '00:00:17.800', name: '10_price_card_1500_250' },
    { t: '00:00:19.400', name: '11_final_cta' }
  ];

  const videoPath = path.resolve('out/sopy_wifi7_reel.mp4');

  for (const item of timestamps) {
    const outPath = path.join(outDir, `${item.name}.jpg`);
    await execFileAsync(ffmpegStatic, [
      '-y',
      '-ss', item.t,
      '-i', videoPath,
      '-vframes', '1',
      '-q:v', '2',
      outPath
    ]);
    console.log(`Extracted: ${outPath}`);
  }
}

extractValidationFrames().catch(console.error);
