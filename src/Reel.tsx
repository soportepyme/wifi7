import React from 'react';
import { Sequence, Audio, staticFile, useCurrentFrame, interpolate, OffthreadVideo } from 'remotion';
import { MANIFEST } from './generated-manifest';
import { BEAT_MAP } from './generated-beats';
import { Captions } from './components/Captions';
import {
  EditingPresetType,
  DynamicShot,
  buildSopyReelSegments,
  BeatDebugMarkers,
} from './editing';

export interface ReelProps {
  editingPreset?: EditingPresetType;
  beatSync?: boolean;
  debugBeatMarkers?: boolean;
}

export const Reel: React.FC<ReelProps> = ({
  editingPreset = 'SOPY_VIRAL',
  beatSync = true,
  debugBeatMarkers = false,
}) => {
  const currentFrame = useCurrentFrame();

  // Technological Transition: CAOS -> CONTROL / WI-FI 7
  // Scene 14 starts at frame 300 / 930. We apply a soft, smooth 12-frame cyan glow transition
  const wifi7CutFrame = 300;
  const glowOpacity = interpolate(
    currentFrame,
    [wifi7CutFrame - 6, wifi7CutFrame, wifi7CutFrame + 6],
    [0, 0.35, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scenes = 'scenes' in MANIFEST ? MANIFEST.scenes : [];
  const scene1File = scenes[0]?.videoFile || 'escena1_cfr.mp4';
  const scene2File = scenes[1]?.videoFile || 'escena2_cfr.mp4';

  const dynamicSegments = React.useMemo(() => {
    return buildSopyReelSegments(
      scene1File,
      scene2File,
      editingPreset,
      BEAT_MAP,
      beatSync
    );
  }, [scene1File, scene2File, editingPreset, beatSync]);

  let accumulatedFrom = 0;

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Video Sequence */}
      {editingPreset === 'NONE'
        ? scenes.map((clip, index) => {
            const from = accumulatedFrom;
            accumulatedFrom += clip.durationInFrames;

            return (
              <Sequence
                key={`${clip.id}-${clip.videoFile}-${index}`}
                from={from}
                durationInFrames={clip.durationInFrames}
              >
                <ClipRenderer file={clip.videoFile} durationInFrames={clip.durationInFrames} />
              </Sequence>
            );
          })
        : dynamicSegments.map((segment, index) => {
            const from = accumulatedFrom;
            accumulatedFrom += segment.durationInFrames;

            return (
              <Sequence
                key={segment.id || `reel-seg-${index}`}
                from={from}
                durationInFrames={segment.durationInFrames}
              >
                <DynamicShot segment={segment} durationInFrames={segment.durationInFrames} />
              </Sequence>
            );
          })}

      {/* Smooth Technological Cyan Glow Transition (CAOS -> CONTROL) */}
      {glowOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 50% 55%, rgba(0, 229, 255, 0.7) 0%, rgba(0, 100, 255, 0.35) 45%, rgba(0, 0, 0, 0) 80%)',
            opacity: glowOpacity,
            mixBlendMode: 'screen',
            zIndex: 40,
          }}
        />
      )}

      {/* Synchronized Modern Captions Overlay (Top layer - independent of camera movement) */}
      <Captions />

      {/* Optional Visual Beat Markers */}
      <BeatDebugMarkers beatMap={BEAT_MAP} enabled={debugBeatMarkers} />

      {/* The Single Master Audio Track */}
      {MANIFEST.audioFileName ? (
        <Audio
          src={staticFile(`generated/${MANIFEST.audioFileName}`)}
          volume={1}
        />
      ) : null}
    </div>
  );
};

// Component for rendering raw clip fallback
const ClipRenderer: React.FC<{ file: string; durationInFrames: number }> = ({ file, durationInFrames }) => {
  const frameInClip = useCurrentFrame();

  const scale = interpolate(
    frameInClip,
    [0, durationInFrames],
    [1.0, 1.03],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <OffthreadVideo
        src={staticFile(`generated/${file}`)}
        muted
        playbackRate={1}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
};
