import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface DeviceItem {
  name: string;
  icon: string;
  x: number;
  y: number;
  startOffset: number; // in frames relative to scene start
  color: string;
  bgGlow: string;
}

const DEVICES: DeviceItem[] = [
  { name: 'TV 4K', icon: '📺', x: 740, y: 350, startOffset: 0, color: '#FF4D4D', bgGlow: 'rgba(255, 77, 77, 0.4)' },
  { name: 'LAPTOPS', icon: '💻', x: 220, y: 560, startOffset: 7, color: '#FFA500', bgGlow: 'rgba(255, 165, 0, 0.4)' },
  { name: 'CELULARES', icon: '📱', x: 750, y: 660, startOffset: 14, color: '#FF3B30', bgGlow: 'rgba(255, 59, 48, 0.4)' },
  { name: 'ALEXA', icon: '🔊', x: 540, y: 820, startOffset: 21, color: '#00D4FF', bgGlow: 'rgba(0, 212, 255, 0.4)' },
  { name: 'CÁMARAS', icon: '📹', x: 200, y: 360, startOffset: 28, color: '#FF5E3A', bgGlow: 'rgba(255, 94, 58, 0.4)' },
  { name: 'FOCOS', icon: '💡', x: 490, y: 430, startOffset: 35, color: '#FFCC00', bgGlow: 'rgba(255, 204, 0, 0.4)' },
  { name: 'GAMING', icon: '🎮', x: 760, y: 920, startOffset: 42, color: '#E02424', bgGlow: 'rgba(224, 36, 36, 0.4)' },
];

export const DeviceBadges: React.FC<{ startFrame: number; durationInFrames: number }> = ({
  startFrame,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relFrame = frame - startFrame;

  // Global exit fade for badges when "TODO CONECTADO" arrives
  const badgesFadeOut = interpolate(
    relFrame,
    [52, 58],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Global exit fade near end of sequence (frames 84 to 90)
  const exitFade = interpolate(
    relFrame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Banner "TODO CONECTADO AL MISMO TIEMPO" entrance (relFrame 56)
  const bannerRel = relFrame - 56;
  const bannerSpring = spring({
    frame: bannerRel,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const bannerScale = interpolate(bannerSpring, [0, 1], [0.7, 1]);
  const bannerOpacity = interpolate(bannerRel, [0, 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * exitFade;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        pointerEvents: 'none',
        zIndex: 25,
      }}
    >
      {/* Individual sequential popping device badges */}
      {badgesFadeOut > 0.01 &&
        DEVICES.map((item, index) => {
          const itemRel = relFrame - item.startOffset;
          if (itemRel < 0) return null;

          const spr = spring({
            frame: itemRel,
            fps,
            config: { damping: 11, stiffness: 220, mass: 0.6 },
          });
          const scale = interpolate(spr, [0, 1], [0.2, 1]);
          const opacity =
            interpolate(itemRel, [0, 3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) *
            badgesFadeOut;

          const pulse = Math.sin(itemRel * 0.3) * 0.04;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                transform: `translate(-50%, -50%) scale(${scale + (itemRel > 6 ? pulse : 0)})`,
                opacity,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 22px',
                borderRadius: '999px',
                background: 'rgba(15, 20, 35, 0.88)',
                border: `2px solid ${item.color}`,
                boxShadow: `0 8px 24px ${item.bgGlow}, 0 2px 8px rgba(0,0,0,0.8)`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <span style={{ fontSize: '28px', lineHeight: 1 }}>{item.icon}</span>
              <span
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontWeight: 900,
                  fontSize: '26px',
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                }}
              >
                {item.name}
              </span>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}`,
                }}
              />
            </div>
          );
        })}

      {/* "TODO CONECTADO AL MISMO TIEMPO" Banner */}
      {bannerRel >= 0 && (
        <div
          style={{
            position: 'absolute',
            top: 240,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            transform: `scale(${bannerScale})`,
            opacity: bannerOpacity,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(40, 10, 10, 0.94) 0%, rgba(20, 5, 5, 0.94) 100%)',
              border: '2.5px solid #FF3B30',
              borderRadius: '28px',
              padding: '24px 40px',
              boxShadow: '0 16px 48px rgba(255, 59, 48, 0.5), inset 0 0 24px rgba(255, 59, 48, 0.25)',
              backdropFilter: 'blur(16px)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 900,
                fontSize: '48px',
                color: '#FFFFFF',
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                textShadow: '0 4px 16px rgba(0,0,0,0.9)',
              }}
            >
              TODO CONECTADO
              <br />
              <span style={{ color: '#FF3B30', textShadow: '0 0 24px rgba(255, 59, 48, 0.9)' }}>
                AL MISMO TIEMPO
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
