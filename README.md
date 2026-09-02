# 🎬 Plantilla Automatizada para Producción de Reels (Remotion)

Plantilla automatizada y reutilizable basada en [Remotion](https://www.remotion.dev/) para producir videos verticales (Reels / TikToks / Shorts) listos para publicar, normalizados y sincronizados proporcionalmente con una pista de audio MP3.

---

## 🚀 Inicio Rápido

### 1. Requisitos Previos
* [Node.js](https://nodejs.org/) (versión 18 o superior)
* npm instalado

### 2. Instalación
Clona el repositorio e instala las dependencias:
```bash
git clone https://github.com/soportepyme/wifi7.git
cd wifi7
npm install
```

---

## 📂 Modo de Uso

### Paso 1: Colocar los archivos en `input/`
Coloca en la carpeta `input/` los clips de video MP4 que desees y exactamente **un archivo MP3**.

Los videos pueden tener nombres con numeración estándar o sufijos, por ejemplo:
* `01.mp4`, `02.mp4`, `03.mp4`
* `1_video.mp4`, `2_ok.mp4`, `03_1.mp4`, `3_2_ok.mp4`, `08_final.mp4`
* `Historia del WiFi.mp3`

### Paso 2: Ejecutar la producción
```bash
npm run reel
```

El sistema automáticamente:
1. Lee los archivos de `input/` y valida que haya $\ge 1$ video MP4 y exactamente 1 archivo MP3.
2. Ordena los videos **numéricamente** (no alfabéticamente).
3. Mide la duración exacta del audio y de los videos con `ffprobe`.
4. Si la duración total de los videos es menor a la música, detiene el proceso indicando los segundos adicionales requeridos.
5. Calcula los cuadros a 24 FPS constantes (`Math.ceil(duracionAudio * 24)`) y distribuye proporcionalmente los cuadros entre los clips.
6. Normaliza automáticamente con FFmpeg cada video a `public/generated/` (H.264, 24 FPS CFR, CRF 18, `yuv420p`, `-movflags +faststart`, sin audio).
7. Genera el manifiesto `src/generated-manifest.ts`.
8. Renderiza el video a `out/[Nombre-del-Audio]-Reel.mp4`.
9. Verifica técnicamente el archivo con `ffprobe` (resolución 1080×1920, 24 FPS, códec H.264, 1 pista AAC) y muestra el resumen final.

---

## 🛠️ Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run reel` | **Comando principal:** Prepara, normaliza, renderiza y verifica el Reel final en `out/`. |
| `npm run prepare` | Prepara y normaliza los archivos en `public/generated/` y genera el manifiesto sin renderizar. |
| `npm run reel:preview` | Prepara los archivos y abre Remotion Studio en el navegador para previsualización interactiva. |

---

## 📐 Especificaciones Técnicas del Reel

* **Resolución:** 1080 × 1920 (Formato vertical 9:16).
* **Velocidad de cuadros:** 24 FPS constante (CFR).
* **Códec de Video:** H.264 (`libx264`), CRF 18, Pixel Format `yuv420p`.
* **Audio:** 1 sola pista estéreo en formato AAC correspondiente al archivo MP3 de entrada (audio original de los videos eliminado).
* **Cortes:** Cortes directos limpios entre clips, sin transiciones ni aceleraciones artificiales (`playbackRate={1}`).

---

## 📁 Estructura del Proyecto

```
wifi7/
├── input/                      # 📥 Videos MP4 y pista MP3 de entrada
├── public/
│   └── generated/              # ⚙️ Archivos normalizados y temporales (auto-limpiado)
├── out/                        # 🎬 Renders finales verificados
├── scripts/
│   ├── prepare-reel.mjs        # 🚀 Detección, ordenamiento numérico, distribución y FFmpeg
│   ├── render-reel.mjs         # 🎥 Render Remotion, verificación técnica ffprobe y reemplazo seguro
│   └── test_pipeline.mjs       # 🧪 Suite de pruebas automatizadas
├── src/
│   ├── generated-manifest.ts   # 📝 Manifiesto autogenerado
│   ├── Root.tsx                # 📐 Definición de composición dinámica
│   ├── Reel.tsx                # 🎬 Componente visual con <Sequence> y <Video> de @remotion/media
│   └── index.ts                # ⚡ Entrada de Remotion
├── remotion.config.ts          # ⚙️ Configuración de Remotion
└── package.json                # 📦 Scripts y dependencias
```

---

## 🧪 Pruebas Automatizadas

Para validar todos los casos extremos (validaciones de error, ordenamiento numérico y renderizado):
```bash
node scripts/test_pipeline.mjs
```
