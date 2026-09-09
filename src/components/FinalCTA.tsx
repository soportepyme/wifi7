import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface FinalCTAProps {
  durationInFrames: number;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.7 },
  });

  const scale = interpolate(spr, [0, 1], [0.8, 1]);
  const opacity = interpolate(frame, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Pulsing glow for the CTA button
  const pulseScale = 1 + Math.sin(frame * 0.3) * 0.03;

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
        transform: `scale(${scale})`,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '880px',
          background: 'linear-gradient(135deg, rgba(8, 20, 42, 0.95) 0%, rgba(4, 12, 28, 0.95) 100%)',
          border: '2.5px solid #FF6B00',
          borderRadius: '28px',
          padding: '24px 36px',
          boxShadow: '0 20px 60px rgba(255, 107, 0, 0.35), 0 0 35px rgba(255, 107, 0, 0.25), inset 0 0 24px rgba(255, 107, 0, 0.15)',
          backdropFilter: 'blur(24px)',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Brand Name */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 950,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            lineHeight: 1,
            textShadow: '0 4px 16px rgba(0,0,0,0.9)',
          }}
        >
          SOPORTE<span style={{ color: '#FF7A00' }}>PYME</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '30px',
            fontWeight: 850,
            color: '#00D4FF',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginTop: '10px',
            textShadow: '0 0 16px rgba(0, 212, 255, 0.7)',
          }}
        >
          ACTUALIZA TU WI-FI
        </div>

        {/* CTA Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px 44px',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #FF6B00 0%, #FF9500 100%)',
              boxShadow: '0 8px 30px rgba(255, 107, 0, 0.6), inset 0 2px 4px rgba(255,255,255,0.4)',
              transform: `scale(${pulseScale})`,
            }}
          >
            <span
              style={{
                fontSize: '32px',
                fontWeight: 950,
                color: '#FFFFFF',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              CONTÁCTANOS ➔
            </span>
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            marginTop: '14px',
            fontSize: '22px',
            fontWeight: 700,
            color: '#A0AEC0',
            letterSpacing: '0.04em',
          }}
        >
          soportepyme.com.mx
        </div>
      </div>
    </div>
  );
};
