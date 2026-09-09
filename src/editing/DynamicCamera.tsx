import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import {
  ShotType,
  CameraEffectType,
  CameraShakeConfig,
  PunchZoomConfig,
  ShotFramingValues,
  DynamicCameraProps,
} from './types';

// Default framing definitions for shot types (designed for 1080x1920 vertical format)
export const SHOT_FRAMING: Record<ShotType, ShotFramingValues> = {
  WIDE: { scale: 1.0, translateX: 0, translateY: 0, rotation: 0 },
  MEDIUM: { scale: 1.12, translateX: 0, translateY: -10, rotation: 0 },
  CLOSEUP: { scale: 1.25, translateX: 0, translateY: -30, rotation: 0 },
  DETAIL: { scale: 1.40, translateX: 0, translateY: 0, rotation: 0 },
  LEFT_FOCUS: { scale: 1.22, translateX: -50, translateY: -10, rotation: 0 },
  RIGHT_FOCUS: { scale: 1.22, translateX: 50, translateY: -10, rotation: 0 },
  TOP_FOCUS: { scale: 1.24, translateX: 0, translateY: -60, rotation: 0 },
  LOW_FOCUS: { scale: 1.24, translateX: 0, translateY: 60, rotation: 0 },
  CUSTOM: { scale: 1.0, translateX: 0, translateY: 0, rotation: 0 },
};

/**
 * Clamps translation values to prevent black borders on a 1080x1920 canvas.
 * When scale >= 1.0, maximum allowable displacement without revealing boundaries is:
 * maxTx = (scale - 1) * (1080 / 2)
 * maxTy = (scale - 1) * (1920 / 2)
 */
export function clampDisplacement(
  scale: number,
  tx: number,
  ty: number,
  canvasWidth = 1080,
  canvasHeight = 1920
): { scale: number; translateX: number; translateY: number } {
  const safeScale = Math.max(1.0, scale);
  const maxTx = Math.max(0, (safeScale - 1.0) * (canvasWidth / 2));
  const maxTy = Math.max(0, (safeScale - 1.0) * (canvasHeight / 2));

  const clampedTx = Math.max(-maxTx, Math.min(maxTx, tx));
  const clampedTy = Math.max(-maxTy, Math.min(maxTy, ty));

  return {
    scale: safeScale,
    translateX: clampedTx,
    translateY: clampedTy,
  };
}

export const DynamicCamera: React.FC<DynamicCameraProps> = ({
  shot = 'WIDE',
  scale: customScale,
  translateX: customTx,
  translateY: customTy,
  rotation: customRotation,
  cameraEffect = 'NONE',
  shakeConfig,
  punchConfig,
  durationInFrames,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width = 1080, height = 1920 } = useVideoConfig();

  // 1. Determine base framing
  const baseFraming = SHOT_FRAMING[shot] || SHOT_FRAMING.WIDE;
  const baseScale = customScale ?? baseFraming.scale;
  const baseTx = customTx ?? baseFraming.translateX;
  const baseTy = customTy ?? baseFraming.translateY;
  const baseRot = customRotation ?? baseFraming.rotation ?? 0;

  // 2. Compute dynamic scale modifier
  let currentScale = baseScale;

  // Punch Zoom calculation
  if (cameraEffect === 'PUNCH_IN' || cameraEffect === 'PUNCH_OUT') {
    const isPunchIn = cameraEffect === 'PUNCH_IN';
    const punchDuration = Math.min(
      Math.max(4, punchConfig?.durationFrames ?? 8),
      durationInFrames
    );
    const startS = punchConfig?.startScale ?? (isPunchIn ? baseScale : baseScale * 1.18);
    const targetS = punchConfig?.targetScale ?? (isPunchIn ? baseScale * 1.18 : baseScale);

    if (punchConfig?.easing === 'spring') {
      const spr = spring({
        frame,
        fps,
        config: { damping: 14, stiffness: 220, mass: 0.8 },
      });
      currentScale = interpolate(spr, [0, 1], [startS, targetS]);
    } else {
      currentScale = interpolate(frame, [0, punchDuration], [startS, targetS], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
    }
  } else if (cameraEffect === 'SLOW_PUSH') {
    // Subtle digital push-in: +3% scale across total duration
    currentScale = interpolate(
      frame,
      [0, Math.max(1, durationInFrames)],
      [baseScale, baseScale * 1.03],
      { extrapolateRight: 'clamp' }
    );
  }

  // 3. Compute dynamic position modifier
  let currentTx = baseTx;
  let currentTy = baseTy;
  let currentRot = baseRot;

  if (cameraEffect === 'PARALLAX_PAN') {
    // Subtle horizontal drift (-12px to +12px)
    const panX = interpolate(
      frame,
      [0, Math.max(1, durationInFrames)],
      [-12, 12],
      { extrapolateRight: 'clamp' }
    );
    currentTx += panX;
  }

  // 4. Deterministic Camera Shake
  if (cameraEffect === 'CAMERA_SHAKE' || shakeConfig) {
    const shakeStart = shakeConfig?.startFrame ?? 0;
    const shakeDuration = Math.max(3, shakeConfig?.durationFrames ?? 8);
    const shakeIntensity = shakeConfig?.intensity ?? 10;
    const shakeFrame = frame - shakeStart;

    if (shakeFrame >= 0 && shakeFrame <= shakeDuration) {
      // Damping decay factor (1.0 -> 0.0)
      const decay = shakeConfig?.decay !== false
        ? Math.max(0, 1 - shakeFrame / shakeDuration)
        : 1;

      // Multi-harmonic deterministic pseudo-random waves
      const wave1 = Math.sin(shakeFrame * 1.85);
      const wave2 = Math.sin(shakeFrame * 3.41 + 1.2);
      const wave3 = Math.cos(shakeFrame * 2.37);
      const wave4 = Math.cos(shakeFrame * 4.12 + 0.8);

      const offsetShakeX = (wave1 * 0.7 + wave2 * 0.3) * shakeIntensity * decay;
      const offsetShakeY = (wave3 * 0.7 + wave4 * 0.3) * shakeIntensity * decay;
      const offsetRot = Math.sin(shakeFrame * 2.6) * (shakeIntensity * 0.05) * decay;

      currentTx += offsetShakeX;
      currentTy += offsetShakeY;
      currentRot += offsetRot;
    }
  }

  // 5. Clamping to prevent black borders on 1080x1920 canvas
  const safeFraming = clampDisplacement(currentScale, currentTx, currentTy, width, height);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        transform: `scale(${safeFraming.scale}) translate3d(${safeFraming.translateX}px, ${safeFraming.translateY}px, 0px) rotate(${currentRot}deg)`,
        transformOrigin: 'center center',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
