import fs from 'fs';

// Word-level chunks with corrected transcription for Spanish and Soporte PYME context
const words = [
  { text: "¿Tu", start: 0.0, end: 0.14 },
  { text: "Wi-Fi?", start: 0.14, end: 1.08 },
  { text: "Pero", start: 1.08, end: 1.76 },
  { text: "no", start: 1.76, end: 1.92 },
  { text: "siempre", start: 1.92, end: 2.22 },
  { text: "es", start: 2.22, end: 2.38 },
  { text: "Internet...", start: 2.38, end: 3.3 },
  { text: "La", start: 3.3, end: 3.52 },
  { text: "señal", start: 3.52, end: 3.86 },
  { text: "sale,", start: 3.86, end: 4.54 },
  { text: "intenta", start: 4.54, end: 5.0 },
  { text: "llegar...", start: 5.0, end: 5.34 },
  { text: "Una", start: 5.34, end: 5.74 },
  { text: "vez,", start: 5.74, end: 6.3 },
  { text: "otra", start: 6.3, end: 6.96 },
  { text: "vez,", start: 6.96, end: 7.58 },
  { text: "otra", start: 8.02, end: 8.22 },
  { text: "vez...", start: 8.22, end: 8.96 },
  { text: "Equipo", start: 8.96, end: 10.48 },
  { text: "antiguo,", start: 10.48, end: 11.38 },
  { text: "solo", start: 11.38, end: 11.5 },
  { text: "2.4,", start: 11.5, end: 12.62 },
  { text: "interferencia,", start: 12.62, end: 13.56 },
  { text: "distancia,", start: 13.56, end: 14.32 },
  { text: "mala", start: 14.32, end: 14.48 },
  { text: "ubicación.", start: 14.48, end: 15.32 },
  { text: "Antes", start: 15.54, end: 15.54 },
  { text: "de", start: 15.54, end: 15.7 },
  { text: "comprar,", start: 15.7, end: 17.1 },
  { text: "hay", start: 17.1, end: 17.46 },
  { text: "que", start: 17.46, end: 17.58 },
  { text: "diagnosticar.", start: 17.58, end: 19.56 },
  { text: "Soporte", start: 19.56, end: 20.46 },
  { text: "PYME", start: 20.46, end: 20.8 },
  { text: "revisa", start: 20.8, end: 21.14 },
  { text: "tu", start: 21.14, end: 21.36 },
  { text: "señal,", start: 21.36, end: 21.94 },
  { text: "tus", start: 21.94, end: 22.06 },
  { text: "canales,", start: 22.06, end: 22.54 },
  { text: "tu", start: 22.54, end: 22.64 },
  { text: "seguridad", start: 22.64, end: 23.24 },
  { text: "y", start: 23.72, end: 23.82 },
  { text: "cada", start: 23.82, end: 24.02 },
  { text: "conexión.", start: 24.02, end: 24.78 },
  { text: "Y", start: 24.78, end: 25.02 },
  { text: "si", start: 25.02, end: 25.16 },
  { text: "tu", start: 25.16, end: 25.36 },
  { text: "red", start: 25.36, end: 25.6 },
  { text: "quedó", start: 25.6, end: 25.96 },
  { text: "atrás,", start: 25.96, end: 26.32 },
  { text: "es", start: 26.86, end: 27.08 },
  { text: "momento", start: 27.08, end: 27.3 },
  { text: "de", start: 27.3, end: 27.68 },
  { text: "avanzar:", start: 27.68, end: 28.54 },
  { text: "¡Wi-Fi", start: 28.84, end: 29.0 },
  { text: "7!", start: 29.0, end: 30.02 },
  { text: "Más", start: 30.02, end: 30.52 },
  { text: "capacidad,", start: 30.52, end: 31.66 },
  { text: "más", start: 31.66, end: 31.86 },
  { text: "velocidad,", start: 31.86, end: 32.18 },
  { text: "más", start: 32.98, end: 33.16 },
  { text: "dispositivos", start: 33.16, end: 33.86 },
  { text: "comunicándose", start: 33.86, end: 34.9 },
  { text: "al", start: 34.9, end: 35.14 },
  { text: "mismo", start: 35.14, end: 35.4 },
  { text: "tiempo.", start: 35.4, end: 35.88 },
  { text: "No", start: 36.12, end: 36.24 },
  { text: "adivines", start: 36.24, end: 36.66 },
  { text: "el", start: 36.66, end: 36.82 },
  { text: "problema...", start: 36.82, end: 37.3 },
  { text: "Diagnóstico", start: 37.86, end: 38.5 },
  { text: "Wi-Fi", start: 38.5, end: 39.02 },
  { text: "Soporte", start: 39.94, end: 40.52 },
  { text: "PYME.", start: 40.52, end: 42.0 }
];

// Group into short, dynamic TikTok-style caption pages (max ~3-5 words / 1-2 lines per page)
const pageGroups = [
  [0, 1],       // ¿Tu Wi-Fi?
  [2, 6],       // Pero no siempre es Internet...
  [7, 11],      // La señal sale, intenta llegar...
  [12, 13],     // Una vez,
  [14, 15],     // otra vez,
  [16, 17],     // otra vez...
  [18, 21],     // Equipo antiguo, solo 2.4,
  [22, 23],     // interferencia, distancia,
  [24, 25],     // mala ubicación.
  [26, 28],     // Antes de comprar,
  [29, 31],     // hay que diagnosticar.
  [32, 36],     // Soporte PYME revisa tu señal,
  [37, 40],     // tus canales, tu seguridad
  [41, 43],     // y cada conexión.
  [44, 49],     // Y si tu red quedó atrás,
  [50, 53],     // es momento de avanzar:
  [54, 55],     // ¡Wi-Fi 7!
  [56, 59],     // Más capacidad, más velocidad,
  [60, 65],     // más dispositivos comunicándose al mismo tiempo.
  [66, 69],     // No adivines el problema...
  [70, 71],     // Diagnóstico Wi-Fi
  [72, 73],     // Soporte PYME.
];

const pages = pageGroups.map((indices, pageIdx) => {
  const [startIdx, endIdx] = indices;
  const pageWords = words.slice(startIdx, endIdx + 1);
  const startMs = Math.round(pageWords[0].start * 1000);
  // Extend page endMs slightly to the next page start or word end for smooth reading
  const naturalEndMs = Math.round(pageWords[pageWords.length - 1].end * 1000);
  const nextGroup = pageGroups[pageIdx + 1];
  let endMs = naturalEndMs;
  if (nextGroup) {
    const nextStartMs = Math.round(words[nextGroup[0]].start * 1000);
    // If gap is small (< 500ms), bridge it so captions stay visible until next line
    if (nextStartMs > naturalEndMs && nextStartMs - naturalEndMs < 600) {
      endMs = nextStartMs;
    } else {
      endMs = Math.max(naturalEndMs, naturalEndMs + 200);
    }
  } else {
    endMs = naturalEndMs + 1000;
  }

  const tokens = pageWords.map((w, wIdx) => {
    const fromMs = Math.round(w.start * 1000);
    let toMs = Math.round(w.end * 1000);
    // Bridge to next word in the same page
    if (wIdx < pageWords.length - 1) {
      const nextWordStartMs = Math.round(pageWords[wIdx + 1].start * 1000);
      if (nextWordStartMs > toMs) {
        toMs = nextWordStartMs;
      }
    }
    return {
      text: w.text,
      fromMs,
      toMs
    };
  });

  return {
    text: pageWords.map(w => w.text).join(' '),
    startMs,
    endMs,
    tokens
  };
});

fs.writeFileSync('src/captions/captions.json', JSON.stringify({ pages }, null, 2));
console.log(`Generated ${pages.length} caption pages in src/captions/captions.json`);
