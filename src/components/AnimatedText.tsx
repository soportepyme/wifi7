import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface AnimatedTextProps {
  children: React.ReactNode;
  startFrame?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
  animationType?: 'pop' | 'slideUp' | 'scale' | 'fade';
  fontSize?: number;
  color?: string;
  glowColor?: string;
  align?: 'center' | 'left' | 'right';
  cardStyle?: 'glass' | 'alert' | 'cyber' | 'none';
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  startFrame = 0,
  durationInFrames = 60,
  style = {},
  animationType = 'pop',
  fontSize = 48,
  color = '#FFFFFF',
  glowColor,
  align = 'center',
  cardStyle = 'none',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = frame - startFrame;

  // Spring entrance
  const springProgress = spring({
    frame: relativeFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 180,
      mass: 0.8,
    },
  });

  // Fade out transition near end of life
  const exitDuration = 6;
  const exitProgress = interpolate(
    relativeFrame,
    [durationInFrames - exitDuration, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  let transform = '';
  let opacity = 1;

  if (animationType === 'pop') {
    const scale = interpolate(springProgress, [0, 1], [0.7, 1]);
    transform = `scale(${scale})`;
    opacity = interpolate(relativeFrame, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * exitProgress;
  } else if (animationType === 'slideUp') {
    const translateY = interpolate(springProgress, [0, 1], [60, 0]);
    transform = `translateY(${translateY}px)`;
    opacity = interpolate(relativeFrame, [0, 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * exitProgress;
  } else if (animationType === 'scale') {
    const scale = interpolate(relativeFrame, [0, durationInFrames], [0.95, 1.05], { extrapolateRight: 'clamp' });
    transform = `scale(${scale})`;
    opacity = interpolate(relativeFrame, [0, 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * exitProgress;
  } else {
    opacity = interpolate(relativeFrame, [0, 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * exitProgress;
  }

  // Card styles
  let background = 'transparent';
  let border = 'none';
  let backdropFilter = 'none';
  let boxShadow = 'none';
  let padding = '0';
  let borderRadius = '0px';

  if (cardStyle === 'glass') {
    background = 'rgba(7, 15, 30, 0.82)';
    border = '1.5px solid rgba(0, 212, 255, 0.45)';
    backdropFilter = 'blur(16px)';
    boxShadow = '0 12px 36px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(0, 212, 255, 0.15)';
    padding = '24px 36px';
    borderRadius = '24px';
  } else if (cardStyle === 'alert') {
    background = 'rgba(35, 10, 10, 0.88)';
    border = '2px solid #FF3B30';
    backdropFilter = 'blur(16px)';
    boxShadow = '0 12px 40px rgba(255, 59, 48, 0.35), inset 0 0 24px rgba(255, 59, 48, 0.2)';
    padding = '24px 36px';
    borderRadius = '24px';
  } else if (cardStyle === 'cyber') {
    background = 'linear-gradient(135deg, rgba(5, 18, 38, 0.92) 0%, rgba(10, 30, 65, 0.92) 100%)';
    border = '2px solid #00D4FF';
    backdropFilter = 'blur(20px)';
    boxShadow = '0 16px 48px rgba(0, 212, 255, 0.4), inset 0 0 30px rgba(0, 212, 255, 0.25)';
    padding = '28px 42px';
    borderRadius = '28px';
  }

  const textShadow = glowColor
    ? `0 0 20px ${glowColor}, 0 4px 16px rgba(0,0,0,0.9)`
    : '0 4px 20px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.8)';

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
        textAlign: align,
        transform,
        opacity,
        background,
        border,
        backdropFilter,
        boxShadow,
        padding,
        borderRadius,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontWeight: 900,
        fontSize,
        color,
        textShadow,
        lineHeight: 1.15,
        letterSpacing: '-0.01em',
        boxSizing: 'border-box',
        maxWidth: '920px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
