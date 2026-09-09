import React from 'react';
import {
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
  OffthreadVideo,
} from 'remotion';
import { AD_MANIFEST } from './generated-ad-manifest';
import { AdCaptions } from './components/AdCaptions';
import { AdOverlays } from './components/AdOverlays';

export const AdYouTube: React.FC = () => {
  const currentFrame = useCurrentFrame();

  // Dynamic Audio Ducking Calculation for Music Track
  const calculateMusicVolume = (frame: number): number => {
    // Master Fade Out at the end (57.5s - 60.0s -> Frames 1725 - 1800)
    if (frame >= 1725) {
      return interpolate(frame, [1725, 1800], [0.18, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }

    // Check if current frame falls within any narration range (with 6-frame smooth transition)
    let isSpeaking = false;
    let minDistanceToSpeech = 999;

    for (const narr of AD_MANIFEST.narrations) {
      const startF = narr.startFrame;
      const endF = narr.startFrame + Math.round(narr.durationSec * 30);

      if (frame >= startF && frame <= endF) {
        isSpeaking = true;
        break;
      }

      const dist = Math.min(Math.abs(frame - startF), Math.abs(frame - endF));
      if (dist < minDistanceToSpeech) {
        minDistanceToSpeech = dist;
      }
    }

    if (isSpeaking) {
      return AD_MANIFEST.music.duckingVolume || 0.10; // -20 dB under voice
    }

    // Smooth return to normal volume in gaps
    return interpolate(
      minDistanceToSpeech,
      [0, 8],
      [AD_MANIFEST.music.duckingVolume || 0.10, AD_MANIFEST.music.normalVolume || 0.28],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  };

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        position: 'relative',
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* 1. Sequential 10-Second 1080p Video Clips */}
      {AD_MANIFEST.videos.map((clip, index) => {
        return (
          <Sequence
            key={`${clip.id}-${clip.file}-${index}`}
            from={clip.startFrame}
            durationInFrames={clip.durationInFrames}
          >
            <AdClipRenderer clip={clip} />
          </Sequence>
        );
      })}

      {/* 2. Micro Impact Flash on "¡NO COMPRES!" (Frames 267 - 275) */}
      {currentFrame >= 267 && currentFrame <= 275 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1920,
            height: 1080,
            pointerEvents: 'none',
            backgroundColor: 'rgba(255, 59, 48, 0.15)',
            mixBlendMode: 'screen',
            zIndex: 25,
          }}
        />
      )}

      {/* 3. Commercial Overlays & Tech Badges Layer */}
      <AdOverlays />

      {/* 4. Synchronized Subtitles (Safe Area Bottom-Center) */}
      <AdCaptions />

      {/* ============================================================
          AUDIO PIPELINE (Voices + SFX + Ducked Background Music)
          ============================================================ */}

      {/* Background Music with Frame-Accurate Dynamic Ducking */}
      {AD_MANIFEST.music?.file ? (
        <Audio
          src={staticFile(`generated/${AD_MANIFEST.music.file}`)}
          volume={(f) => calculateMusicVolume(f)}
        />
      ) : null}

      {/* Exact Narration Sequences */}
      {AD_MANIFEST.narrations.map((narr) => (
        <Sequence
          key={narr.id}
          from={narr.startFrame}
          durationInFrames={Math.round(narr.durationSec * 30) + 15}
        >
          <Audio src={staticFile(`generated/${narr.file}`)} volume={1.0} />
        </Sequence>
      ))}

      {/* Synchronized SFX Clips */}
      {AD_MANIFEST.sfx.map((sfx) => (
        <Sequence
          key={sfx.id}
          from={sfx.startFrame}
          durationInFrames={90} // 3 seconds max per one-shot
        >
          <Audio src={staticFile(`generated/${sfx.file}`)} volume={sfx.volume} />
        </Sequence>
      ))}
    </div>
  );
};

// Component for rendering each 1080p clip with subtle digital push-in
const AdClipRenderer: React.FC<{
  clip: {
    file: string;
    durationInFrames: number;
    sceneNumber: number;
  };
}> = ({ clip }) => {
  const frameInClip = useCurrentFrame();

  // Subtle digital push-in (scale 1.00 -> 1.03) for camera dynamism
  const scale = interpolate(
    frameInClip,
    [0, clip.durationInFrames],
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
        src={staticFile(`generated/${clip.file}`)}
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
