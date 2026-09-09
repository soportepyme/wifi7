import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface PriceCardProps {
  durationInFrames: number;
}

export const PriceCard: React.FC<PriceCardProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 190, mass: 0.8 },
  });

  const scale = interpolate(spr, [0, 1], [0.75, 1]);
  const translateY = interpolate(spr, [0, 1], [30, 0]);

  const exitProgress = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = interpolate(frame, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * exitProgress;
  const pulse = Math.sin(frame * 0.25) * 0.02;

  return (
    <div
      style={{
        position: 'absolute',
        top: 230,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 40px',
        boxSizing: 'border-box',
        zIndex: 35,
        transform: `translateY(${translateY}px) scale(${scale + pulse})`,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '880px',
          background: 'linear-gradient(135deg, rgba(8, 20, 42, 0.95) 0%, rgba(4, 12, 28, 0.95) 100%)',
          border: '2.5px solid #00D4FF',
          borderRadius: '28px',
          padding: '22px 32px',
          boxShadow: '0 20px 60px rgba(0, 212, 255, 0.35), 0 0 30px rgba(0, 212, 255, 0.2), inset 0 0 24px rgba(0, 212, 255, 0.15)',
          backdropFilter: 'blur(24px)',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Category pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <div
            style={{
              padding: '5px 18px',
              borderRadius: '999px',
              background: 'rgba(0, 212, 255, 0.18)',
              border: '1px solid rgba(0, 212, 255, 0.6)',
              fontSize: '20px',
              fontWeight: 800,
              color: '#00D4FF',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            ⚡ EQUIPO DE NUEVA GENERACIÓN
          </div>
        </div>

        {/* Product Name */}
        <div
          style={{
            fontSize: '34px',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
          }}
        >
          WI-FI 7
        </div>

        {/* Big Price */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            margin: '4px 0',
          }}
        >
          <span
            style={{
              fontSize: '84px',
              fontWeight: 950,
              color: '#00FFA3',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              textShadow: '0 0 35px rgba(0, 255, 163, 0.7), 0 4px 16px rgba(0,0,0,0.9)',
            }}
          >
            $1,500
          </span>
        </div>

        {/* Installation Add-on Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 24px',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #FF6B00 0%, #FF8C00 100%)',
              boxShadow: '0 6px 20px rgba(255, 107, 0, 0.45)',
            }}
          >
            <span
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                textShadow: '0 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              + $250 INSTALACIÓN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
