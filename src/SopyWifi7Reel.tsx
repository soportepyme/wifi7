import React from 'react';
import {
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
  OffthreadVideo,
  AbsoluteFill,
} from 'remotion';
import { MANIFEST } from './generated-manifest';
import { SceneOverload } from './components/SceneOverload';
import { SceneWifi7 } from './components/SceneWifi7';
import { Captions } from './components/Captions';
import {
  EditingPresetType,
  DynamicShot,
  TransitionOverlay,
  buildSopyReelSegments,
  DynamicSegment,
} from './editing';

export interface SopyWifi7ReelProps {
  editingPreset?: EditingPresetType;
}

export const SopyWifi7Reel: React.FC<SopyWifi7ReelProps> = ({
  editingPreset = 'SOPY_VIRAL',
}) => {
  const currentFrame = useCurrentFrame();

  // Technological Transition between Scene 1 and Scene 2 (Cut at frame 300)
  // 8-frame fast technological blue flash & cyber scan (frames 296 - 304)
  const cutFrame = 300;
  const flashOpacity = interpolate(
    currentFrame,
    [cutFrame - 4, cutFrame, cutFrame + 4],
    [0, 0.7, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scanLineY = interpolate(
    currentFrame,
    [cutFrame - 4, cutFrame + 4],
    [0, 1920],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Generate dynamic multicam segments or fallback to standard 1:1 tracks
  const segments: DynamicSegment[] = React.useMemo(() => {
    return buildSopyReelSegments(
      'escena1_cfr.mp4',
      'escena2_cfr.mp4',
      editingPreset
    );
  }, [editingPreset]);

  // Compute accumulated sequence starting frames for segments
  let accumulatedFrom = 0;
  const renderedSegments = segments.map((segment) => {
    const from = accumulatedFrom;
    accumulatedFrom += segment.durationInFrames;
    return { ...segment, from };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* 1. Video Layer: Sopy Dynamic Edit Engine or Original Fallback */}
      {editingPreset === 'NONE' ? (
        <>
          <Sequence from={0} durationInFrames={300}>
            <OffthreadVideo
              src={staticFile('generated/escena1_cfr.mp4')}
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Sequence>
          <Sequence from={300} durationInFrames={300}>
            <OffthreadVideo
              src={staticFile('generated/escena2_cfr.mp4')}
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Sequence>
        </>
      ) : (
        renderedSegments.map((segment, index) => {
          return (
            <Sequence
              key={segment.id || `seg-${index}`}
              from={segment.from}
              durationInFrames={segment.durationInFrames}
            >
              <DynamicShot segment={segment} durationInFrames={segment.durationInFrames} />
              {/* WhipPan / Zoom In Transition Overlay if applicable */}
              {segment.transitionIn && segment.transitionIn !== 'HARD_CUT' && (
                <Sequence from={0} durationInFrames={8}>
                  <TransitionOverlay
                    transitionType={segment.transitionIn}
                    durationInFrames={8}
                    direction={segment.transitionIn === 'WHIP_LEFT' ? 'LEFT' : 'RIGHT'}
                  />
                </Sequence>
              )}
            </Sequence>
          );
        })
      )}

      {/* 2. Subtle Cinematic Top & Bottom Readability Gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0, 5, 15, 0.6) 0%, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0) 65%, rgba(0, 5, 15, 0.65) 100%)',
          zIndex: 10,
        }}
      />

      {/* 3. Scene 1 Overlay Elements (0:00 - 0:10 / Frames 0 - 300) */}
      <Sequence from={0} durationInFrames={300}>
        <SceneOverload />
      </Sequence>

      {/* 4. Technological Flash Transition (Second 10 / Frame 300) */}
      {flashOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.85) 0%, rgba(0, 100, 255, 0.4) 40%, rgba(0, 0, 0, 0) 75%)',
            opacity: flashOpacity,
            mixBlendMode: 'screen',
            zIndex: 40,
          }}
        >
          {/* Fast tech scanline */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: scanLineY,
              width: '100%',
              height: '4px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 20px #00D4FF, 0 0 40px #00D4FF',
            }}
          />
        </div>
      )}

      {/* 5. Scene 2 Overlay Elements (0:10 - 0:20 / Frames 300 - 600) */}
      <Sequence from={300} durationInFrames={300}>
        <SceneWifi7 />
      </Sequence>

      {/* 6. Independent Captions Layer (Top level - zIndex: 50) */}
      <Captions />

      {/* 7. Single Master Audio Track (No video audio, only Wi-Fi 7 Ya.mp3) */}
      <Audio
        src={staticFile('generated/wifi7_music_20s.mp3')}
        volume={1}
      />
    </AbsoluteFill>
  );
};
