import React from 'react';
import { OffthreadVideo, staticFile, useVideoConfig } from 'remotion';
import { DynamicCamera } from './DynamicCamera';
import { DynamicSegment } from './types';

export interface DynamicShotProps {
  segment?: DynamicSegment;
  sourceFile?: string;
  sourceInSec?: number;
  durationInFrames: number;
  shot?: DynamicSegment['shot'];
  scale?: number;
  translateX?: number;
  translateY?: number;
  rotation?: number;
  cameraEffect?: DynamicSegment['cameraEffect'];
  shakeConfig?: DynamicSegment['shakeConfig'];
  punchConfig?: DynamicSegment['punchConfig'];
  style?: React.CSSProperties;
}

export const DynamicShot: React.FC<DynamicShotProps> = ({
  segment,
  sourceFile: propSourceFile,
  sourceInSec: propSourceInSec,
  durationInFrames: propDurationInFrames,
  shot: propShot,
  scale: propScale,
  translateX: propTx,
  translateY: propTy,
  rotation: propRotation,
  cameraEffect: propCameraEffect,
  shakeConfig: propShakeConfig,
  punchConfig: propPunchConfig,
  style,
}) => {
  const { fps } = useVideoConfig();

  const sourceFile = segment?.sourceFile ?? propSourceFile ?? '';
  const sourceInSec = segment?.sourceInSec ?? propSourceInSec ?? 0;
  const durationInFrames = segment?.durationInFrames ?? propDurationInFrames;
  const shot = segment?.shot ?? propShot ?? 'WIDE';
  const scale = segment?.scale ?? propScale;
  const translateX = segment?.translateX ?? propTx;
  const translateY = segment?.translateY ?? propTy;
  const rotation = segment?.rotation ?? propRotation;
  const cameraEffect = segment?.cameraEffect ?? propCameraEffect ?? 'NONE';
  const shakeConfig = segment?.shakeConfig ?? propShakeConfig;
  const punchConfig = segment?.punchConfig ?? propPunchConfig;

  // Compute frame offset in source video
  const startFromFrames = Math.max(0, Math.round(sourceInSec * fps));

  // Determine video URL path (resolves staticFile if not already absolute)
  const videoSrc = sourceFile.startsWith('http') || sourceFile.startsWith('/')
    ? sourceFile
    : sourceFile.startsWith('generated/') || sourceFile.startsWith('media-cfr/')
    ? staticFile(sourceFile)
    : staticFile(`generated/${sourceFile}`);

  return (
    <div
      style={{
        width: '1080px',
        height: '1920px',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#000000',
        overflow: 'hidden',
        ...style,
      }}
    >
      <DynamicCamera
        shot={shot}
        scale={scale}
        translateX={translateX}
        translateY={translateY}
        rotation={rotation}
        cameraEffect={cameraEffect}
        shakeConfig={shakeConfig}
        punchConfig={punchConfig}
        durationInFrames={durationInFrames}
      >
        <OffthreadVideo
          src={videoSrc}
          startFrom={startFromFrames}
          muted
          playbackRate={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </DynamicCamera>
    </div>
  );
};
