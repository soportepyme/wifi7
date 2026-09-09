import React from 'react';
import { Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { AnimatedText } from './AnimatedText';
import { PriceCard } from './PriceCard';
import { FinalCTA } from './FinalCTA';

export const SceneWifi7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {/* 0:10 - 0:12.5 (frames 0 - 75 of scene 2): Word-by-word / line-by-line entry */}
      <Sequence from={0} durationInFrames={75}>
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
          }}
        >
          <ProblemExplanation />
        </div>
      </Sequence>

      {/* 0:12.5 - 0:15.0 (frames 75 - 150 of scene 2): "DA EL SALTO A WI-FI 7" */}
      <Sequence from={75} durationInFrames={75}>
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
          }}
        >
          <Wifi7BigTitle durationInFrames={75} />
        </div>
      </Sequence>

      {/* 0:15.0 - 0:17.0 (frames 150 - 210 of scene 2): "MÁS CAPACIDAD PARA TU CASA CONECTADA" */}
      <Sequence from={150} durationInFrames={60}>
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
          }}
        >
          <AnimatedText
            durationInFrames={60}
            animationType="pop"
            cardStyle="cyber"
            fontSize={44}
          >
            <div
              style={{
                textTransform: 'uppercase',
                textAlign: 'center',
                color: '#FFFFFF',
                lineHeight: 1.15,
              }}
            >
              <span style={{ color: '#00FFA3' }}>MÁS CAPACIDAD</span>
              <br />
              PARA TU CASA CONECTADA
            </div>

            <div
              style={{
                marginTop: '12px',
                padding: '6px 20px',
                borderRadius: '999px',
                background: 'rgba(0, 212, 255, 0.15)',
                border: '1px solid rgba(0, 212, 255, 0.5)',
                fontSize: '22px',
                fontWeight: 800,
                color: '#00D4FF',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Streaming • Gaming • Cámaras • Smart Home
            </div>
          </AnimatedText>
        </div>
      </Sequence>

      {/* 0:17.0 - 0:18.5 (frames 210 - 255 of scene 2): PriceCard ($1,500 + $250 instalación) */}
      <Sequence from={210} durationInFrames={45}>
        <PriceCard durationInFrames={45} />
      </Sequence>

      {/* 0:18.5 - 0:20.0 (frames 255 - 300 of scene 2): FinalCTA */}
      <Sequence from={255} durationInFrames={45}>
        <FinalCTA durationInFrames={45} />
      </Sequence>
    </div>
  );
};

// Subcomponent for word-by-word reveal in 0:10 - 0:12.5
const ProblemExplanation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerSpr = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const line1Spr = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const line2Spr = spring({ frame: frame - 16, fps, config: { damping: 12, stiffness: 200 } });
  const line3Spr = spring({ frame: frame - 36, fps, config: { damping: 12, stiffness: 200 } });

  const exitFade = interpolate(frame, [69, 75], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const containerScale = interpolate(containerSpr, [0, 1], [0.8, 1]);
  const containerOpacity = interpolate(frame, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * exitFade;

  return (
    <div
      style={{
        width: '880px',
        background: 'linear-gradient(135deg, rgba(8, 20, 42, 0.92) 0%, rgba(4, 12, 28, 0.92) 100%)',
        border: '2px solid #00D4FF',
        borderRadius: '28px',
        padding: '24px 36px',
        boxShadow: '0 16px 48px rgba(0, 212, 255, 0.35), inset 0 0 24px rgba(0, 212, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        textAlign: 'center',
        transform: `scale(${containerScale})`,
        opacity: containerOpacity,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          transform: `scale(${interpolate(line1Spr, [0, 1], [0.8, 1])})`,
          opacity: interpolate(frame, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          fontSize: '42px',
          fontWeight: 900,
          color: '#FFFFFF',
          textTransform: 'uppercase',
          lineHeight: 1.15,
        }}
      >
        TU INTERNET
      </div>

      {frame >= 16 && (
        <div
          style={{
            transform: `scale(${interpolate(line2Spr, [0, 1], [0.8, 1])})`,
            opacity: interpolate(frame - 16, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            fontSize: '38px',
            fontWeight: 900,
            color: '#FF6B6B',
            textTransform: 'uppercase',
            marginTop: '6px',
            lineHeight: 1.15,
          }}
        >
          NO SIEMPRE ES EL PROBLEMA
        </div>
      )}

      {frame >= 36 && (
        <div
          style={{
            transform: `scale(${interpolate(line3Spr, [0, 1], [0.8, 1])})`,
            opacity: interpolate(frame - 36, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(0, 212, 255, 0.3)',
            fontSize: '40px',
            fontWeight: 950,
            color: '#00D4FF',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            textShadow: '0 0 20px rgba(0, 212, 255, 0.8)',
          }}
        >
          TU ROUTER TAMBIÉN IMPORTA
        </div>
      )}
    </div>
  );
};

// Subcomponent for massive WI-FI 7 announcement in 0:12.5 - 0:15.0
const Wifi7BigTitle: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({ frame, fps, config: { damping: 11, stiffness: 220, mass: 0.7 } });
  const scale = interpolate(spr, [0, 1], [0.65, 1]);

  const exitFade = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = interpolate(frame, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * exitFade;
  const shimmer = Math.sin(frame * 0.2) * 8;

  return (
    <div
      style={{
        width: '900px',
        background: 'linear-gradient(135deg, rgba(6, 18, 40, 0.94) 0%, rgba(2, 10, 25, 0.94) 100%)',
        border: '3px solid #00D4FF',
        borderRadius: '28px',
        padding: '20px 32px',
        boxShadow: '0 20px 60px rgba(0, 212, 255, 0.45), 0 0 35px rgba(0, 212, 255, 0.3), inset 0 0 30px rgba(0, 212, 255, 0.2)',
        backdropFilter: 'blur(24px)',
        textAlign: 'center',
        transform: `scale(${scale})`,
        opacity,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: '32px',
          fontWeight: 850,
          color: '#E0E7FF',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '4px',
          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
        }}
      >
        DA EL SALTO A
      </div>

      <div
        style={{
          fontSize: '104px',
          fontWeight: 950,
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A5F3FC 50%, #00D4FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 0 ${20 + shimmer}px rgba(0, 212, 255, 0.95)) drop-shadow(0 6px 16px rgba(0,0,0,0.9))`,
          textTransform: 'uppercase',
        }}
      >
        WI-FI 7
      </div>

      <div
        style={{
          marginTop: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 18px',
          borderRadius: '999px',
          background: 'rgba(0, 212, 255, 0.18)',
          border: '1px solid #00D4FF',
          fontSize: '20px',
          fontWeight: 800,
          color: '#00D4FF',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        🚀 MÁXIMA VELOCIDAD Y ESTABILIDAD
      </div>
    </div>
  );
};
