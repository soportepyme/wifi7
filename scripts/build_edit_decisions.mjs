import fs from 'fs';
import path from 'path';

const FPS = 30;
const TOTAL_FRAMES = 1589; // Exactly 52.96667s

// 20 carefully curated scenes matching audio rhythms and user constraints, now enriched with dynamic camera decisions
const rawScenes = [
  {
    sceneNumber: 1,
    archivo: 'video1.mp4',
    sourceInSec: 0.50,
    durationInFrames: 85, // 2.83s
    shot: 'WIDE',
    scale: 1.00,
    translateX: 0,
    translateY: 0,
    camera_effect: 'SLOW_PUSH',
    energy: 'HOOK',
    motivo_de_seleccion: 'Plano inicial tranquilo de la familia desayunando, estableciendo el punto de partida (somos 4 personas).'
  },
  {
    sceneNumber: 2,
    archivo: 'video1.mp4',
    sourceInSec: 3.50,
    durationInFrames: 45, // 1.50s
    shot: 'CLOSEUP',
    scale: 1.25,
    translateX: 0,
    translateY: -30,
    camera_effect: 'PUNCH_IN',
    energy: 'HOOK',
    motivo_de_seleccion: 'Gesto de complicidad y duda al preguntar "¿Seguro?", preparando la entrada del ritmo musical.'
  },
  {
    sceneNumber: 3,
    archivo: 'video2.mp4',
    sourceInSec: 1.00,
    durationInFrames: 65, // 2.17s
    shot: 'DETAIL',
    scale: 1.40,
    translateX: 0,
    translateY: 0,
    transition_in: 'HARD_CUT',
    camera_effect: 'NONE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Los 4 celulares encendiéndose simultáneamente sobre la mesa de madera con pantallas iluminadas.'
  },
  {
    sceneNumber: 4,
    archivo: 'video3.mp4',
    sourceInSec: 0.50,
    durationInFrames: 70, // 2.33s
    shot: 'MEDIUM',
    scale: 1.12,
    translateX: 0,
    translateY: -10,
    camera_effect: 'NONE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Toma nítida de los 4 miembros de la familia utilizando simultáneamente sus 4 computadoras (laptops e iMac).'
  },
  {
    sceneNumber: 5,
    archivo: 'video4.mp4',
    sourceInSec: 0.50,
    durationInFrames: 70, // 2.33s
    shot: 'LEFT_FOCUS',
    scale: 1.20,
    translateX: -40,
    translateY: 0,
    camera_effect: 'PUNCH_IN',
    energy: 'HIGH',
    motivo_de_seleccion: 'La familia observando las 2 televisiones transmitiendo contenido de alto ancho de banda a la vez.'
  },
  {
    sceneNumber: 6,
    archivo: 'video 5.mp4',
    sourceInSec: 0.50,
    durationInFrames: 80, // 2.67s
    shot: 'DETAIL',
    scale: 1.45,
    translateX: 0,
    translateY: 0,
    camera_effect: 'CAMERA_SHAKE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Close-up del asistente inteligente Alexa con el anillo LED cian activándose y pulsando.'
  },
  {
    sceneNumber: 7,
    archivo: 'video6.mp4',
    sourceInSec: 2.50,
    durationInFrames: 70, // 2.33s
    shot: 'TOP_FOCUS',
    scale: 1.22,
    translateX: 0,
    translateY: -50,
    camera_effect: 'NONE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Los 3 focos inteligentes suspendidos iluminándose en colores amarillo, magenta y cian.'
  },
  {
    sceneNumber: 8,
    archivo: 'video6.mp4',
    sourceInSec: 0.20,
    durationInFrames: 55, // 1.83s
    shot: 'RIGHT_FOCUS',
    scale: 1.20,
    translateX: 40,
    translateY: 0,
    camera_effect: 'NONE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Cocina inteligente mostrando el refrigerador conectado de última generación.'
  },
  {
    sceneNumber: 9,
    archivo: 'video7.mp4',
    sourceInSec: 0.50,
    durationInFrames: 65, // 2.17s
    shot: 'CLOSEUP',
    scale: 1.28,
    translateX: 0,
    translateY: -20,
    camera_effect: 'PUNCH_IN',
    energy: 'HIGH',
    motivo_de_seleccion: 'Plano del router con múltiples dispositivos conectados: cámaras de seguridad, tablet y consola de videojuegos.'
  },
  {
    sceneNumber: 10,
    archivo: 'video7.mp4',
    sourceInSec: 2.80,
    durationInFrames: 75, // 2.50s
    shot: 'MEDIUM',
    scale: 1.15,
    translateX: 0,
    translateY: 0,
    camera_effect: 'CAMERA_SHAKE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Aceleración del tráfico con líneas luminosas conectando más de 20 dispositivos a la red.'
  },
  {
    sceneNumber: 11,
    archivo: 'video7.mp4',
    sourceInSec: 5.50,
    durationInFrames: 85, // 2.83s
    shot: 'DETAIL',
    scale: 1.40,
    translateX: 0,
    translateY: 0,
    camera_effect: 'CAMERA_SHAKE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Clímax de saturación y caos: la red llega a su punto máximo de demanda con "¡Todos quieren Wi-Fi!".'
  },
  {
    sceneNumber: 12,
    archivo: 'video1.mp4',
    sourceInSec: 5.50,
    durationInFrames: 100, // 3.33s
    shot: 'WIDE',
    scale: 1.00,
    translateX: 0,
    translateY: 0,
    camera_effect: 'SLOW_PUSH',
    energy: 'MEDIUM',
    motivo_de_seleccion: 'Pausa reflexiva y cambio de tono musical: "Tal vez tu internet no es el problema".'
  },
  {
    sceneNumber: 13,
    archivo: 'video7.mp4',
    sourceInSec: 7.50,
    durationInFrames: 65, // 2.17s
    shot: 'MEDIUM',
    scale: 1.12,
    translateX: 0,
    translateY: 0,
    transition_out: 'WHIP_RIGHT',
    camera_effect: 'NONE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Transición hacia la evolución: "Tu red también debería hacerlo", dando paso a la tecnología Wi-Fi 7.'
  },
  {
    sceneNumber: 14,
    archivo: 'video8.mp4',
    sourceInSec: 0.50,
    durationInFrames: 95, // 3.17s
    shot: 'CLOSEUP',
    scale: 1.25,
    translateX: 0,
    translateY: -20,
    transition_in: 'WHIP_RIGHT',
    camera_effect: 'PUNCH_IN',
    energy: 'HIGH',
    motivo_de_seleccion: 'Aparición de Wi-Fi 7: Diagnóstico técnico en tablet mostrando la optimización del espectro y cobertura.'
  },
  {
    sceneNumber: 15,
    archivo: 'video3.mp4',
    sourceInSec: 3.50,
    durationInFrames: 95, // 3.17s
    shot: 'MEDIUM',
    scale: 1.12,
    translateX: 0,
    translateY: 0,
    camera_effect: 'NONE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Red rápida y estable: Familia navegando a máxima velocidad sin retrasos ni interferencias.'
  },
  {
    sceneNumber: 16,
    archivo: 'video4.mp4',
    sourceInSec: 3.50,
    durationInFrames: 95, // 3.17s
    shot: 'RIGHT_FOCUS',
    scale: 1.20,
    translateX: 40,
    translateY: 0,
    camera_effect: 'SLOW_PUSH',
    energy: 'HIGH',
    motivo_de_seleccion: 'Streaming en 4K fluido en múltiples pantallas: hogar inteligente conectado con total estabilidad.'
  },
  {
    sceneNumber: 17,
    archivo: 'video2.mp4',
    sourceInSec: 4.50,
    durationInFrames: 90, // 3.00s
    shot: 'DETAIL',
    scale: 1.40,
    translateX: 0,
    translateY: 0,
    camera_effect: 'PUNCH_IN',
    energy: 'HIGH',
    motivo_de_seleccion: 'Todos los dispositivos móviles conectados con máxima señal y velocidad Wi-Fi 7 ("¿Tu Wi-Fi puede con todos?").'
  },
  {
    sceneNumber: 18,
    archivo: 'video8.mp4',
    sourceInSec: 3.50,
    durationInFrames: 95, // 3.17s
    shot: 'CLOSEUP',
    scale: 1.24,
    translateX: -20,
    translateY: -10,
    camera_effect: 'NONE',
    energy: 'HIGH',
    motivo_de_seleccion: 'Técnico de SoportePyme con tablet y router Wi-Fi 7 explicando el diagnóstico optimizado ("Contacta a SoportePyme").'
  },
  {
    sceneNumber: 19,
    archivo: 'video8.mp4',
    sourceInSec: 6.80,
    durationInFrames: 95, // 3.17s
    shot: 'MEDIUM',
    scale: 1.12,
    translateX: 0,
    translateY: 0,
    camera_effect: 'SLOW_PUSH',
    energy: 'HIGH',
    motivo_de_seleccion: 'Cierre triunfal: Toda la familia sonriente junto al técnico y Sopy el robot mascota dando pulgar arriba ("¡Actualiza tu red!").'
  },
  {
    sceneNumber: 20,
    archivo: 'video8.mp4',
    sourceInSec: 7.20,
    durationInFrames: 94, // 3.13s (Total exact sum = 1589 frames)
    shot: 'WIDE',
    scale: 1.00,
    translateX: 0,
    translateY: 0,
    camera_effect: 'SLOW_PUSH',
    energy: 'HIGH',
    motivo_de_seleccion: 'Resolución y finalización musical: Toma final con sutil encuadre dinámico cerrando la experiencia tecnológica de SoportePyme.'
  }
];

// Check frame sum
let sumFrames = rawScenes.reduce((acc, s) => acc + s.durationInFrames, 0);
console.log(`Current sum: ${sumFrames}, Target: ${TOTAL_FRAMES}`);

let accumulatedFrame = 0;
const edlDecisions = rawScenes.map((s) => {
  const startFrame = accumulatedFrame;
  accumulatedFrame += s.durationInFrames;
  const endFrame = accumulatedFrame;
  const sourceOutSec = s.sourceInSec + (s.durationInFrames / FPS);

  return {
    escena: s.sceneNumber,
    archivo: s.archivo,
    inicio_fuente: `${s.sourceInSec.toFixed(3)}s`,
    fin_fuente: `${sourceOutSec.toFixed(3)}s`,
    inicio_reel: `${(startFrame / FPS).toFixed(3)}s (frame ${startFrame})`,
    fin_reel: `${(endFrame / FPS).toFixed(3)}s (frame ${endFrame})`,
    duracion: `${(s.durationInFrames / FPS).toFixed(3)}s (${s.durationInFrames} frames)`,
    motivo_de_seleccion: s.motivo_de_seleccion,
    shot: s.shot || 'WIDE',
    scale: s.scale || 1.0,
    translateX: s.translateX || 0,
    translateY: s.translateY || 0,
    transition_in: s.transition_in || 'HARD_CUT',
    transition_out: s.transition_out || 'HARD_CUT',
    camera_effect: s.camera_effect || 'NONE',
    energy: s.energy || 'MEDIUM',
    startFrame,
    endFrame,
    durationInFrames: s.durationInFrames,
    sourceInSec: parseFloat(s.sourceInSec.toFixed(3)),
    sourceOutSec: parseFloat(sourceOutSec.toFixed(3))
  };
});

console.log(`Total scenes: ${edlDecisions.length}`);
console.log(`Total frames: ${accumulatedFrame} / ${TOTAL_FRAMES} target`);
console.log(`Total duration: ${(accumulatedFrame / FPS).toFixed(3)}s`);

edlDecisions.forEach((s) => {
  if (s.durationInFrames > 150) {
    console.error(`ERROR: Scene ${s.escena} exceeds 5.0s (${s.durationInFrames} frames)`);
  }
});

fs.writeFileSync('wifi7_edit_decisions.json', JSON.stringify(edlDecisions, null, 2), 'utf-8');
console.log('Saved wifi7_edit_decisions.json with extended dynamic camera parameters.');
