import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const execFileAsync = promisify(execFile);
const ffprobePath = ffprobeStatic.path;

const FPS = 30;
const TOTAL_DURATION_IN_FRAMES = 1800; // 60.00 seconds exact
const TOTAL_DURATION_SEC = 60.0;

const inputDir = path.resolve('input');
const generatedDir = path.resolve('public/generated');
const outDir = path.resolve('out');
const scriptsDir = path.resolve('scripts');
const captionsDir = path.resolve('src/captions');

const manifestTsPath = path.resolve('src/generated-ad-manifest.ts');
const manifestJsonPath = path.resolve('public/generated/ad_manifest.json');
const editDecisionsJsonPath = path.resolve('out/soportepyme_edit_decisions.json');
const captionsJsonPath = path.resolve('src/captions/ad_captions.json');

// Ensure base directories exist
[inputDir, generatedDir, outDir, scriptsDir, captionsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 6 Master Scenes of 10.00 seconds each (300 frames each = 1800 frames total)
const SCENE_DEFINITIONS = [
  {
    sceneNumber: 1,
    archivo: 'escena1.mp4',
    sourceInSec: 0.0,
    sourceDurationSec: 10.0,
    durationInFrames: 300, // 10.00s
    timelineInSec: 0.0,
    timelineOutSec: 10.0,
    motivo_de_seleccion: 'Usuario experimentando frustración y lentitud frente a la computadora con video de YouTube en buffering.',
    ai_artifact_treatment: 'Video fuente limpio de 10s. Aplicado sutil push-in digital (scale 1.00 -> 1.03).'
  },
  {
    sceneNumber: 2,
    archivo: 'escena2.mp4',
    sourceInSec: 0.0,
    sourceDurationSec: 10.0,
    durationInFrames: 300, // 10.00s
    timelineInSec: 10.0,
    timelineOutSec: 20.0,
    motivo_de_seleccion: 'Usuario con tarjeta de crédito frente a tienda online a punto de comprar equipo nuevo innecesariamente.',
    ai_artifact_treatment: 'Fondo de pantalla desenfocado sutilmente para mitigar tipografías falsas de tienda online.'
  },
  {
    sceneNumber: 3,
    archivo: 'escena3.mp4',
    sourceInSec: 0.0,
    sourceDurationSec: 10.0,
    durationInFrames: 300, // 10.00s
    timelineInSec: 20.0,
    timelineOutSec: 30.0,
    motivo_de_seleccion: 'Desglose técnico de componentes internos (almacenamiento, SSD/HDD, memoria RAM, tarjeta de red).',
    ai_artifact_treatment: 'Etiquetas dudosas de IA en la parte inferior cubiertas con tarjetas tecnológicas de Remotion limpias.'
  },
  {
    sceneNumber: 4,
    archivo: 'escena4.mp4',
    sourceInSec: 0.0,
    sourceDurationSec: 10.0,
    durationInFrames: 300, // 10.00s
    timelineInSec: 30.0,
    timelineOutSec: 40.0,
    motivo_de_seleccion: 'Demostración de problemas de red en gaming/streaming (ping alto, congestión, mala cobertura Wi-Fi).',
    ai_artifact_treatment: 'Filtro limpio y superposición de conceptos de conectividad con alta jerarquía visual.'
  },
  {
    sceneNumber: 5,
    archivo: 'escena5.mp4',
    sourceInSec: 0.0,
    sourceDurationSec: 6.2, // Clean action before AI holograms appear at 6.5s
    padFreezeSec: 3.8,     // Freeze clean technician frame to reach 10.0s
    durationInFrames: 300, // 10.00s
    timelineInSec: 40.0,
    timelineOutSec: 50.0,
    motivo_de_seleccion: 'Entrada del técnico en domicilio con escáner de diagnóstico y laptop con telemetría de red real.',
    ai_artifact_treatment: 'Recorte preventivo a 6.2s para descartar tarjetas holográficas falsas de Gemini. Cuadro limpio sostenido durante la revelación del precio protagonista $250.'
  },
  {
    sceneNumber: 6,
    archivo: 'escena6.mp4',
    sourceInSec: 0.0,
    sourceDurationSec: 7.6, // Clean action before fake AI sidebar appears at 7.8s
    padFreezeSec: 2.4,     // Freeze clean handshake frame to reach 10.0s
    durationInFrames: 300, // 10.00s
    timelineInSec: 50.0,
    timelineOutSec: 60.0,
    motivo_de_seleccion: 'Explicación del técnico, apretón de manos con cliente satisfecho y resolución positiva del servicio.',
    ai_artifact_treatment: 'Recorte preventivo a 7.6s para descartar panel lateral falso de Gemini. Cuadro limpio sostenido durante el CTA final "ANTES DE GASTAR... DIAGNOSTICA."'
  }
];

// Complete narration clips and exact timeline offsets
const NARRATION_CLIPS = [
  {
    id: 'voice_01',
    file: '01_problema.mp3',
    startSec: 0.000,
    startFrame: 0,
    durationSec: 8.385,
    endSec: 8.385,
    text: 'Tu computadora está lentísima, el Internet se traba, YouTube carga y carga. Antes de gastar, descubre qué está fallando.'
  },
  {
    id: 'voice_02',
    file: '02_no_compres.mp3',
    startSec: 8.890,
    startFrame: Math.round(8.890 * FPS), // Frame 267 (J-cut into scene 1 before scene 2)
    durationSec: 6.922,
    endSec: 15.812,
    text: '¡No compres otra computadora todavía y no pagues más megas a ciegas! El problema puede estar donde menos imaginas.'
  },
  {
    id: 'voice_03',
    file: '03_causas.mp3',
    startSec: 16.310,
    startFrame: Math.round(16.310 * FPS), // Frame 489
    durationSec: 10.580,
    endSec: 26.890,
    text: 'Puede ser tu disco duro, poca memoria, una tarjeta Wi-Fi limitada, señal débil, interferencias o demasiados equipos usando la red.'
  },
  {
    id: 'voice_04',
    file: '04_megas.mp3',
    startSec: 27.290,
    startFrame: Math.round(27.290 * FPS), // Frame 819
    durationSec: 10.580,
    endSec: 37.870,
    text: 'Porque puedes tener muchos megas contratados y aún así sufrir una mala conexión. Ping alto, congestión o mala cobertura pueden arruinar la experiencia.'
  },
  {
    id: 'voice_05',
    file: '05_solucion.mp3',
    startSec: 38.270,
    startFrame: Math.round(38.270 * FPS), // Frame 1148
    durationSec: 9.091,
    endSec: 47.361,
    text: 'En SoportePyme revisamos tu computadora y tu Wi-Fi en tu domicilio. Encontramos el verdadero cuello de botella por solo 250 pesos.'
  },
  {
    id: 'voice_06',
    file: '06_cierre_v2.mp3',
    fallbackFile: '06_cierre.mp3',
    startSec: 47.800,
    startFrame: Math.round(47.800 * FPS), // Frame 1434
    durationSec: 12.199,
    endSec: 60.000,
    text: 'Te decimos qué está fallando y qué necesitas realmente. Si autorizas la solución, tus 250 pesos se descuentan del servicio. Antes de gastar, Diagnostica.'
  }
];

// SFX placements
const SFX_CLIPS = [
  { id: 'sfx_01', file: '01_compu_buffering.mp3', startSec: 0.000, startFrame: 0, volume: 0.35, description: 'Buffering discreto bajo la escena 1' },
  { id: 'sfx_02', file: '02_clic_pago.mp3', startSec: 8.890, startFrame: Math.round(8.890 * FPS), volume: 0.50, description: 'Clic de compra previa al freno' },
  { id: 'sfx_03', file: '03_freno_digital.mp3', startSec: 9.000, startFrame: Math.round(9.000 * FPS), volume: 0.70, description: 'Impacto de freno digital sincronizado con ¡NO COMPRES!' },
  { id: 'sfx_04', file: '04_escaneo.mp3', startSec: 16.310, startFrame: Math.round(16.310 * FPS), volume: 0.40, description: 'Escaneo tecnológico suave en causas' },
  { id: 'sfx_05', file: '05_ping_red.mp3', startSec: 27.290, startFrame: Math.round(27.290 * FPS), volume: 0.40, description: 'Ping de red y latencia en escena 4' },
  { id: 'sfx_06', file: '06_inicio_diagnostico.mp3', startSec: 38.270, startFrame: Math.round(38.270 * FPS), volume: 0.55, description: 'Chime de inicio de diagnóstico en domicilio' },
  { id: 'sfx_07', file: '07_confirmacion_final.mp3', startSec: 58.600, startFrame: Math.round(58.600 * FPS), volume: 0.65, description: 'Confirmación final tras Diagnostica' }
];

// Build precise captions data with karaoke timing
function generateCaptionsData() {
  const rawPages = [
    // Clip 1 (offset 0.000s)
    {
      startMs: 0,
      endMs: 2000,
      tokens: [
        { text: "¿TU", fromMs: 0, toMs: 180, isHighlight: false },
        { text: "COMPUTADORA", fromMs: 180, toMs: 540, isHighlight: true },
        { text: "ESTÁ", fromMs: 540, toMs: 760, isHighlight: false },
        { text: "LENTÍSIMA?", fromMs: 760, toMs: 1580, isHighlight: true }
      ]
    },
    {
      startMs: 2000,
      endMs: 3360,
      tokens: [
        { text: "¿EL", fromMs: 2000, toMs: 2150, isHighlight: false },
        { text: "INTERNET", fromMs: 2150, toMs: 2500, isHighlight: true },
        { text: "SE", fromMs: 2500, toMs: 2700, isHighlight: false },
        { text: "TRABA?", fromMs: 2700, toMs: 3360, isHighlight: true }
      ]
    },
    {
      startMs: 3360,
      endMs: 5600,
      tokens: [
        { text: "¿YOUTUBE", fromMs: 3360, toMs: 4000, isHighlight: true },
        { text: "CARGA", fromMs: 4000, toMs: 4600, isHighlight: true },
        { text: "Y", fromMs: 4600, toMs: 4800, isHighlight: false },
        { text: "CARGA?", fromMs: 4800, toMs: 5600, isHighlight: true }
      ]
    },
    {
      startMs: 5600,
      endMs: 8390,
      tokens: [
        { text: "ANTES", fromMs: 5600, toMs: 5840, isHighlight: false },
        { text: "DE GASTAR,", fromMs: 5840, toMs: 6760, isHighlight: false },
        { text: "DESCUBRE", fromMs: 6760, toMs: 7300, isHighlight: true },
        { text: "QUÉ ESTÁ FALLANDO.", fromMs: 7300, toMs: 8390, isHighlight: true }
      ]
    },

    // Clip 2 (offset 8890ms)
    {
      startMs: 8890,
      endMs: 11200,
      tokens: [
        { text: "¡NO", fromMs: 8890, toMs: 9100, isHighlight: true },
        { text: "COMPRES", fromMs: 9100, toMs: 9500, isHighlight: true },
        { text: "OTRA", fromMs: 9500, toMs: 9800, isHighlight: false },
        { text: "COMPUTADORA", fromMs: 9800, toMs: 10400, isHighlight: true },
        { text: "TODAVÍA!", fromMs: 10400, toMs: 11200, isHighlight: false }
      ]
    },
    {
      startMs: 11200,
      endMs: 13200,
      tokens: [
        { text: "Y NO", fromMs: 11200, toMs: 11500, isHighlight: false },
        { text: "PAGUES", fromMs: 11500, toMs: 11800, isHighlight: false },
        { text: "MÁS", fromMs: 11800, toMs: 12100, isHighlight: true },
        { text: "MEGAS", fromMs: 12100, toMs: 12500, isHighlight: true },
        { text: "A CIEGAS.", fromMs: 12500, toMs: 13200, isHighlight: false }
      ]
    },
    {
      startMs: 13200,
      endMs: 15810,
      tokens: [
        { text: "EL PROBLEMA", fromMs: 13200, toMs: 13900, isHighlight: false },
        { text: "PUEDE ESTAR", fromMs: 13900, toMs: 14500, isHighlight: false },
        { text: "DONDE MENOS", fromMs: 14500, toMs: 15000, isHighlight: true },
        { text: "IMAGINAS.", fromMs: 15000, toMs: 15810, isHighlight: true }
      ]
    },

    // Clip 3 (offset 16310ms)
    {
      startMs: 16310,
      endMs: 18400,
      tokens: [
        { text: "PUEDE SER", fromMs: 16310, toMs: 16900, isHighlight: false },
        { text: "TU DISCO DURO,", fromMs: 16900, toMs: 17700, isHighlight: true },
        { text: "POCA MEMORIA,", fromMs: 17700, toMs: 18400, isHighlight: true }
      ]
    },
    {
      startMs: 18400,
      endMs: 21500,
      tokens: [
        { text: "UNA TARJETA", fromMs: 18400, toMs: 19500, isHighlight: false },
        { text: "WI-FI LIMITADA,", fromMs: 19500, toMs: 20500, isHighlight: true },
        { text: "SEÑAL DÉBIL,", fromMs: 20500, toMs: 21500, isHighlight: true }
      ]
    },
    {
      startMs: 21500,
      endMs: 26890,
      tokens: [
        { text: "INTERFERENCIAS", fromMs: 21500, toMs: 23500, isHighlight: true },
        { text: "O DEMASIADOS EQUIPOS", fromMs: 23500, toMs: 25500, isHighlight: false },
        { text: "USANDO LA RED.", fromMs: 25500, toMs: 26890, isHighlight: true }
      ]
    },

    // Clip 4 (offset 27290ms)
    {
      startMs: 27290,
      endMs: 30000,
      tokens: [
        { text: "PORQUE PUEDES TENER", fromMs: 27290, toMs: 28500, isHighlight: false },
        { text: "MUCHOS MEGAS", fromMs: 28500, toMs: 29200, isHighlight: true },
        { text: "CONTRATADOS", fromMs: 29200, toMs: 30000, isHighlight: true }
      ]
    },
    {
      startMs: 30000,
      endMs: 33000,
      tokens: [
        { text: "Y AÚN ASÍ SUFRIR", fromMs: 30000, toMs: 31500, isHighlight: false },
        { text: "UNA MALA", fromMs: 31500, toMs: 32000, isHighlight: true },
        { text: "CONEXIÓN.", fromMs: 32000, toMs: 33000, isHighlight: true }
      ]
    },
    {
      startMs: 33000,
      endMs: 35500,
      tokens: [
        { text: "PING ALTO,", fromMs: 33000, toMs: 34000, isHighlight: true },
        { text: "CONGESTIÓN", fromMs: 34000, toMs: 34800, isHighlight: true },
        { text: "O MALA COBERTURA", fromMs: 34800, toMs: 35500, isHighlight: true }
      ]
    },
    {
      startMs: 35500,
      endMs: 37870,
      tokens: [
        { text: "PUEDEN ARRUINAR", fromMs: 35500, toMs: 36800, isHighlight: false },
        { text: "LA EXPERIENCIA.", fromMs: 36800, toMs: 37870, isHighlight: true }
      ]
    },

    // Clip 5 (offset 38270ms)
    {
      startMs: 38270,
      endMs: 41800,
      tokens: [
        { text: "EN SOPORTEPYME", fromMs: 38270, toMs: 39300, isHighlight: true },
        { text: "REVISAMOS TU PC", fromMs: 39300, toMs: 40200, isHighlight: false },
        { text: "Y TU WI-FI", fromMs: 40200, toMs: 41000, isHighlight: true },
        { text: "EN TU DOMICILIO.", fromMs: 41000, toMs: 41800, isHighlight: false }
      ]
    },
    {
      startMs: 41800,
      endMs: 44500,
      tokens: [
        { text: "ENCONTRAMOS EL", fromMs: 41800, toMs: 42800, isHighlight: false },
        { text: "VERDADERO", fromMs: 42800, toMs: 43500, isHighlight: true },
        { text: "CUELLO DE BOTELLA", fromMs: 43500, toMs: 44500, isHighlight: true }
      ]
    },
    {
      startMs: 44500,
      endMs: 47360,
      tokens: [
        { text: "POR SOLO", fromMs: 44500, toMs: 45400, isHighlight: false },
        { text: "$250", fromMs: 45400, toMs: 46500, isHighlight: true },
        { text: "PESOS.", fromMs: 46500, toMs: 47360, isHighlight: true }
      ]
    },

    // Clip 6 (offset 47800ms)
    {
      startMs: 47800,
      endMs: 51000,
      tokens: [
        { text: "TE DECIMOS", fromMs: 47800, toMs: 48500, isHighlight: false },
        { text: "QUÉ ESTÁ FALLANDO", fromMs: 48500, toMs: 49600, isHighlight: true },
        { text: "Y QUÉ NECESITAS", fromMs: 49600, toMs: 50400, isHighlight: false },
        { text: "REALMENTE.", fromMs: 50400, toMs: 51000, isHighlight: true }
      ]
    },
    {
      startMs: 51000,
      endMs: 53500,
      tokens: [
        { text: "SI AUTORIZAS", fromMs: 51000, toMs: 52000, isHighlight: false },
        { text: "LA SOLUCIÓN,", fromMs: 52000, toMs: 53500, isHighlight: true }
      ]
    },
    {
      startMs: 53500,
      endMs: 56800,
      tokens: [
        { text: "TUS $250 PESOS", fromMs: 53500, toMs: 54900, isHighlight: true },
        { text: "SE DESCUENTAN", fromMs: 54900, toMs: 55800, isHighlight: true },
        { text: "DEL SERVICIO.", fromMs: 55800, toMs: 56800, isHighlight: false }
      ]
    },
    {
      startMs: 56800,
      endMs: 60000,
      tokens: [
        { text: "ANTES DE GASTAR...", fromMs: 56800, toMs: 58500, isHighlight: false },
        { text: "DIAGNOSTICA.", fromMs: 58500, toMs: 60000, isHighlight: true }
      ]
    }
  ];

  return {
    pages: rawPages.map(page => ({
      text: page.tokens.map(t => t.text).join(' '),
      startMs: page.startMs,
      endMs: page.endMs,
      tokens: page.tokens
    }))
  };
}

async function prepareAd() {
  console.log('\n============================================================');
  console.log('🚀 PREPARACIÓN Y NORMALIZACIÓN DE ANUNCIO 60S (1920x1080 30 FPS CFR)');
  console.log('============================================================\n');

  // 1. Verify existence of all input files
  console.log('🔍 Verificando archivos de entrada en input/...');
  for (const scene of SCENE_DEFINITIONS) {
    const src = path.join(inputDir, scene.archivo);
    if (!fs.existsSync(src)) {
      throw new Error(`Falta el archivo de video: ${scene.archivo}`);
    }
  }

  for (const voice of NARRATION_CLIPS) {
    const src = path.join(inputDir, voice.file);
    if (!fs.existsSync(src)) {
      if (voice.fallbackFile && fs.existsSync(path.join(inputDir, voice.fallbackFile))) {
        console.log(`ℹ️ Usando archivo de respaldo ${voice.fallbackFile} para ${voice.id}`);
        voice.file = voice.fallbackFile;
      } else {
        throw new Error(`Falta el archivo de voz: ${voice.file}`);
      }
    }
  }

  for (const sfx of SFX_CLIPS) {
    const src = path.join(inputDir, sfx.file);
    if (!fs.existsSync(src)) {
      throw new Error(`Falta el archivo SFX: ${sfx.file}`);
    }
  }

  // Background music
  let musicFile = 'fondo.m4a';
  if (!fs.existsSync(path.join(inputDir, musicFile))) {
    musicFile = 'cama_60s.mp3';
  }
  if (!fs.existsSync(path.join(inputDir, musicFile))) {
    throw new Error('No se encontró archivo de música de fondo en input/ (ni fondo.m4a ni cama_60s.mp3)');
  }
  console.log(`🎵 Música de fondo seleccionada: "${musicFile}"`);

  // 2. Normalize 6 Video Scenes to 1920x1080 30 FPS CFR H.264
  console.log('\n🔄 Normalizando clips de video a 1920x1080 30 FPS CFR (sin audio)...');
  const generatedClips = [];

  for (let i = 0; i < SCENE_DEFINITIONS.length; i++) {
    const scene = SCENE_DEFINITIONS[i];
    const srcPath = path.join(inputDir, scene.archivo);
    const clipFileName = `ad_clip_${String(i + 1).padStart(2, '0')}.mp4`;
    const destPath = path.join(generatedDir, clipFileName);

    console.log(`   [${i + 1}/${SCENE_DEFINITIONS.length}] Procesando ${scene.archivo} -> ${clipFileName}...`);

    let filterComplex = '';
    if (scene.padFreezeSec && scene.padFreezeSec > 0) {
      // Scale to 1920:1080, force 30fps CFR, and pad by cloning last clean frame
      filterComplex = `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${scene.padFreezeSec},setpts=N/(30*TB)`;
    } else {
      filterComplex = `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,setpts=N/(30*TB)`;
    }

    const ffmpegArgs = [
      '-y',
      '-ss', scene.sourceInSec.toString(),
      '-t', scene.sourceDurationSec.toString(),
      '-i', srcPath,
      '-vf', filterComplex,
      '-t', (scene.durationInFrames / FPS).toString(),
      '-fps_mode', 'cfr',
      '-c:v', 'libx264',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-movflags', '+faststart',
      destPath
    ];

    await execFileAsync(ffmpegPath, ffmpegArgs);

    // Verify generated clip with ffprobe
    const { stdout: probeOut } = await execFileAsync(ffprobePath, [
      '-v', 'error',
      '-show_streams',
      '-of', 'json',
      destPath
    ]);
    const probeData = JSON.parse(probeOut);
    const vStream = probeData.streams?.find(s => s.codec_type === 'video');
    const aStream = probeData.streams?.find(s => s.codec_type === 'audio');

    if (!vStream || vStream.width !== 1920 || vStream.height !== 1080 || vStream.r_frame_rate !== '30/1' || aStream) {
      throw new Error(`Error en validación técnica de "${clipFileName}": ${JSON.stringify(vStream)}`);
    }

    generatedClips.push({
      id: `clip_${String(i + 1).padStart(2, '0')}`,
      file: clipFileName,
      originalName: scene.archivo,
      durationInSeconds: scene.durationInFrames / FPS,
      durationInFrames: scene.durationInFrames,
      startFrame: i * 300,
      endFrame: (i + 1) * 300,
      sceneNumber: scene.sceneNumber,
      treatment: scene.ai_artifact_treatment
    });
  }

  // 3. Copy/Normalize Audio Assets to public/generated/
  console.log('\n🔊 Preparando activos de audio en public/generated/...');
  for (const voice of NARRATION_CLIPS) {
    const src = path.join(inputDir, voice.file);
    const dst = path.join(generatedDir, voice.file);
    fs.copyFileSync(src, dst);
  }

  for (const sfx of SFX_CLIPS) {
    const src = path.join(inputDir, sfx.file);
    const dst = path.join(generatedDir, sfx.file);
    fs.copyFileSync(src, dst);
  }

  const musicDstName = 'fondo_musica.mp3';
  const musicDstPath = path.join(generatedDir, musicDstName);
  await execFileAsync(ffmpegPath, [
    '-y',
    '-i', path.join(inputDir, musicFile),
    '-t', '60.0',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    musicDstPath
  ]);

  // 4. Generate Subtitles JSON
  console.log('\n📝 Generando subtítulos sincronizados en src/captions/ad_captions.json...');
  const captionsData = generateCaptionsData();
  fs.writeFileSync(captionsJsonPath, JSON.stringify(captionsData, null, 2), 'utf-8');

  // 5. Generate Edit Decisions JSON
  console.log('📝 Generando out/soportepyme_edit_decisions.json...');
  const editDecisions = SCENE_DEFINITIONS.map(scene => ({
    scene: scene.sceneNumber,
    source_file: scene.archivo,
    source_in: scene.sourceInSec,
    source_out: scene.sourceInSec + scene.sourceDurationSec,
    timeline_in: scene.timelineInSec,
    timeline_out: scene.timelineOutSec,
    duration_frames: scene.durationInFrames,
    reason: scene.motivo_de_seleccion,
    ai_artifact_treatment: scene.ai_artifact_treatment,
    overlays: getOverlaysForScene(scene.sceneNumber)
  }));
  fs.writeFileSync(editDecisionsJsonPath, JSON.stringify(editDecisions, null, 2), 'utf-8');

  // 6. Generate Manifest TS & JSON
  console.log('📝 Generando manifiesto en src/generated-ad-manifest.ts y public/generated/ad_manifest.json...');
  const manifestData = {
    title: 'SoportePyme Diagnóstico $250 - YouTube Ad 60s',
    fps: FPS,
    width: 1920,
    height: 1080,
    durationInFrames: TOTAL_DURATION_IN_FRAMES,
    durationInSeconds: TOTAL_DURATION_SEC,
    music: {
      file: musicDstName,
      originalFile: musicFile,
      duckingVolume: 0.10,
      normalVolume: 0.32,
      fadeStartSec: 57.5,
      fadeEndSec: 60.0
    },
    videos: generatedClips,
    narrations: NARRATION_CLIPS,
    sfx: SFX_CLIPS,
    outputFileName: 'soportepyme_diagnostico_250_youtube.mp4'
  };

  const manifestTs = `// Auto-generated by scripts/prepare-ad.mjs - DO NOT EDIT MANUALLY
export interface VideoClipInfo {
  id: string;
  file: string;
  originalName: string;
  durationInSeconds: number;
  durationInFrames: number;
  startFrame: number;
  endFrame: number;
  sceneNumber: number;
  treatment: string;
}

export interface NarrationClipInfo {
  id: string;
  file: string;
  startSec: number;
  startFrame: number;
  durationSec: number;
  endSec: number;
  text: string;
}

export interface SfxClipInfo {
  id: string;
  file: string;
  startSec: number;
  startFrame: number;
  volume: number;
  description: string;
}

export interface AdManifestData {
  title: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  durationInSeconds: number;
  music: {
    file: string;
    originalFile: string;
    duckingVolume: number;
    normalVolume: number;
    fadeStartSec: number;
    fadeEndSec: number;
  };
  videos: VideoClipInfo[];
  narrations: NarrationClipInfo[];
  sfx: SfxClipInfo[];
  outputFileName: string;
}

export const AD_MANIFEST: AdManifestData = ${JSON.stringify(manifestData, null, 2)};

export default AD_MANIFEST;
`;

  fs.writeFileSync(manifestTsPath, manifestTs, 'utf-8');
  fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestData, null, 2), 'utf-8');

  console.log('\n✅ Preparación completada con éxito. Todos los activos listos.');
  console.log('============================================================\n');
}

function getOverlaysForScene(sceneNumber) {
  switch (sceneNumber) {
    case 1:
      return [
        { time: '00:00.4', text: '¿TU COMPUTADORA ESTÁ LENTÍSIMA?' },
        { time: '00:03.0', text: '¿EL INTERNET SE TRABA?' },
        { time: '00:05.5', text: '¿YOUTUBE CARGA Y CARGA?' },
        { time: '00:08.89 - J-Cut', text: '¡NO COMPRES OTRA COMPUTADORA TODAVÍA!' }
      ];
    case 2:
      return [
        { time: '00:10.0', text: 'NO PAGUES MÁS MEGAS A CIEGAS' },
        { time: '00:15.8', text: 'EL PROBLEMA PUEDE ESTAR DONDE MENOS IMAGINAS' }
      ];
    case 3:
      return [
        { time: '00:20.0', badge: '¿HDD O SSD?' },
        { time: '00:22.0', badge: '¿POCA RAM?' },
        { time: '00:24.0', badge: '¿TARJETA WI-FI LIMITADA?' },
        { time: '00:26.0', badge: '¿SEÑAL DÉBIL?' },
        { time: '00:28.0', badge: '¿MUCHOS EQUIPOS?' }
      ];
    case 4:
      return [
        { time: '00:30.0', text: 'MUCHOS MEGAS... ≠ BUEN WI-FI' },
        { time: '00:33.0', badges: ['PING ALTO', 'CONGESTIÓN', 'MALA COBERTURA'] },
        { time: '00:37.8', text: 'ENTONCES... ¿QUÉ NECESITAS REALMENTE?' }
      ];
    case 5:
      return [
        { time: '00:40.0', text: 'SOPORTEPYME · DIAGNÓSTICO EN TU DOMICILIO · PC + WI-FI' },
        { time: '00:47.0', heroPrice: '$250', subtitle: 'DIAGNÓSTICO EN DOMICILIO' }
      ];
    case 6:
      return [
        { time: '00:50.0', text: 'TE DECIMOS QUÉ ESTÁ FALLANDO' },
        { time: '00:52.5', text: 'Y QUÉ NECESITAS REALMENTE' },
        { time: '00:54.5', text: 'SI AUTORIZAS EL SERVICIO... LOS $250 SE DESCUENTAN' },
        { time: '00:57.5', cta: 'ANTES DE GASTAR... DIAGNOSTICA. · SoportePyme' }
      ];
    default:
      return [];
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/prepare-ad.mjs')) {
  prepareAd().catch(err => {
    console.error('❌ Error fatal en prepare-ad:', err);
    process.exit(1);
  });
}

export { prepareAd };
