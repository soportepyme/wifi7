import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { TransitionType } from './types';

export interface DynamicTransitionOverlayProps {
  transitionType: TransitionType;
  durationInFrames: number;
  direction?: 'LEFT' | 'RIGHT';
}

/**
 * Renders directional motion blur and flash sweeps for WhipPan and Zoom transitions.
 */
export const TransitionOverlay: React.FC<DynamicTransitionOverlayProps> = ({
  transitionType,
  durationInFrames,
  direction = 'LEFT',
}) => {
  const frame = useCurrentFrame();
  const halfDuration = durationInFrames / 2;

  if (transitionType === 'HARD_CUT' || durationInFrames <= 0) {
    return null;
  }

  // Peak intensity at center of transition (frame = halfDuration)
  const peakFactor = interpolate(
    frame,
    [0, halfDuration, durationInFrames],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (transitionType === 'WHIP_LEFT' || transitionType === 'WHIP_RIGHT') {
    const isLeft = transitionType === 'WHIP_LEFT' || direction === 'LEFT';
    const motionBlurPx = peakFactor * 24;
    const streakTranslateX = interpolate(
      frame,
      [0, durationInFrames],
      [isLeft ? 1080 : -1080, isLeft ? -1080 : 1080]
    );

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          backdropFilter: `blur(${motionBlurPx}px)`,
          WebkitBackdropFilter: `blur(${motionBlurPx}px)`,
          opacity: peakFactor,
          zIndex: 30,
          overflow: 'hidden',
        }}
      >
        {/* Dynamic high-speed light streak */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: '400px',
            height: '100%',
            transform: `translateX(${streakTranslateX}px) skewX(-20deg)`,
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(0,212,255,0.3) 50%, rgba(255,255,255,0) 100%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>
    );
  }

  if (transitionType === 'ZOOM_IN' || transitionType === 'ZOOM_OUT') {
    const zoomBlurPx = peakFactor * 16;
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          backdropFilter: `blur(${zoomBlurPx}px)`,
          WebkitBackdropFilter: `blur(${zoomBlurPx}px)`,
          opacity: peakFactor * 0.8,
          zIndex: 30,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.2) 0%, rgba(0,0,0,0.6) 80%)',
          mixBlendMode: 'screen',
        }}
      />
    );
  }

  return null;
};

/**
 * Calculates transform and opacity for incoming and outgoing scenes during transitions.
 */
export function getTransitionStyles(
  transitionType: TransitionType,
  frameInTransition: number,
  durationInFrames: number,
  isOutgoing: boolean
): React.CSSProperties {
  if (transitionType === 'HARD_CUT' || durationInFrames <= 0) {
    return {};
  }

  const progress = interpolate(
    frameInTransition,
    [0, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    }
  );

  switch (transitionType) {
    case 'WHIP_LEFT': {
      if (isOutgoing) {
        const tx = interpolate(progress, [0, 1], [0, -1080]);
        return {
          transform: `translate3d(${tx}px, 0, 0)`,
          filter: `blur(${interpolate(progress, [0, 1], [0, 18])}px)`,
        };
      } else {
        const tx = interpolate(progress, [0, 1], [1080, 0]);
        return {
          transform: `translate3d(${tx}px, 0, 0)`,
          filter: `blur(${interpolate(progress, [0, 1], [18, 0])}px)`,
        };
      }
    }
    case 'WHIP_RIGHT': {
      if (isOutgoing) {
        const tx = interpolate(progress, [0, 1], [0, 1080]);
        return {
          transform: `translate3d(${tx}px, 0, 0)`,
          filter: `blur(${interpolate(progress, [0, 1], [0, 18])}px)`,
        };
      } else {
        const tx = interpolate(progress, [0, 1], [-1080, 0]);
        return {
          transform: `translate3d(${tx}px, 0, 0)`,
          filter: `blur(${interpolate(progress, [0, 1], [18, 0])}px)`,
        };
      }
    }
    case 'PUSH_LEFT': {
      const tx = isOutgoing
        ? interpolate(progress, [0, 1], [0, -1080])
        : interpolate(progress, [0, 1], [1080, 0]);
      return { transform: `translate3d(${tx}px, 0, 0)` };
    }
    case 'PUSH_RIGHT': {
      const tx = isOutgoing
        ? interpolate(progress, [0, 1], [0, 1080])
        : interpolate(progress, [0, 1], [-1080, 0]);
      return { transform: `translate3d(${tx}px, 0, 0)` };
    }
    case 'ZOOM_IN': {
      if (isOutgoing) {
        const s = interpolate(progress, [0, 1], [1, 1.25]);
        const op = interpolate(progress, [0.6, 1], [1, 0]);
        return { transform: `scale(${s})`, opacity: op };
      } else {
        const s = interpolate(progress, [0, 1], [0.85, 1]);
        const op = interpolate(progress, [0, 0.4], [0, 1]);
        return { transform: `scale(${s})`, opacity: op };
      }
    }
    case 'ZOOM_OUT': {
      if (isOutgoing) {
        const s = interpolate(progress, [0, 1], [1, 0.85]);
        const op = interpolate(progress, [0.6, 1], [1, 0]);
        return { transform: `scale(${s})`, opacity: op };
      } else {
        const s = interpolate(progress, [0, 1], [1.25, 1]);
        const op = interpolate(progress, [0, 0.4], [0, 1]);
        return { transform: `scale(${s})`, opacity: op };
      }
    }
    case 'FADE': {
      const op = isOutgoing
        ? interpolate(progress, [0, 1], [1, 0])
        : interpolate(progress, [0, 1], [0, 1]);
      return { opacity: op };
    }
    default:
      return {};
  }
}
