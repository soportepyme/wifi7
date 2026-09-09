import React from 'react';
import { Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { AnimatedText } from './AnimatedText';
import { DeviceBadges } from './DeviceBadges';

export const SceneOverload: React.FC = () => {
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
      {/* 0:00 - 0:02.5 (frames 0 - 75): "¿TU WI-FI SE TRABA CUANDO TODOS SE CONECTAN?" */}
      <Sequence from={0} durationInFrames={75}>
        <div
          style={{
            position: 'absolute',
            top: 270,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 40px',
            boxSizing: 'border-box',
          }}
        >
          <AnimatedText
            durationInFrames={75}
            animationType="pop"
            cardStyle="glass"
            fontSize={52}
          >
            <div style={{ textTransform: 'uppercase', textAlign: 'center' }}>
              ¿TU{' '}
              <span
                style={{
                  color: '#00D4FF',
                  textShadow: '0 0 24px rgba(0, 212, 255, 0.9), 0 2px 8px rgba(0,0,0,0.9)',
                }}
              >
                WI-FI
              </span>{' '}
              SE TRABA
            </div>
            <div
              style={{
                textTransform: 'uppercase',
                textAlign: 'center',
                marginTop: '8px',
                fontSize: '44px',
                color: '#E0E7FF',
              }}
            >
              CUANDO{' '}
              <span
                style={{
                  color: '#FF7A00',
                  textShadow: '0 0 24px rgba(255, 122, 0, 0.9), 0 2px 8px rgba(0,0,0,0.9)',
                }}
              >
                TODOS
              </span>{' '}
              SE CONECTAN?
            </div>
          </AnimatedText>
        </div>
      </Sequence>

      {/* 0:02.5 - 0:05.5 (frames 75 - 165): DeviceBadges + "TODO CONECTADO AL MISMO TIEMPO" */}
      <Sequence from={75} durationInFrames={90}>
        <DeviceBadges startFrame={0} durationInFrames={90} />
      </Sequence>

      {/* 0:05.5 - 0:09.0 (frames 165 - 270): Alert "¿MÁS DE 20 DISPOSITIVOS? TU ROUTER PUEDE QUEDARSE CORTO" */}
      <Sequence from={165} durationInFrames={105}>
        <div
          style={{
            position: 'absolute',
            top: 270,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 40px',
            boxSizing: 'border-box',
          }}
        >
          <AnimatedText
            durationInFrames={105}
            animationType="pop"
            cardStyle="alert"
            fontSize={52}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
                padding: '6px 18px',
                borderRadius: '999px',
                background: 'rgba(255, 59, 48, 0.25)',
                border: '1px solid #FF3B30',
              }}
            >
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#FF6B6B',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                LÍMITE DE CONEXIONES
              </span>
            </div>

            <div
              style={{
                textTransform: 'uppercase',
                textAlign: 'center',
                color: '#FFFFFF',
                fontSize: '48px',
                lineHeight: 1.1,
              }}
            >
              ¿MÁS DE{' '}
              <span
                style={{
                  color: '#FFCC00',
                  textShadow: '0 0 24px rgba(255, 204, 0, 0.9)',
                }}
              >
                20 DISPOSITIVOS?
              </span>
            </div>

            <div
              style={{
                textTransform: 'uppercase',
                textAlign: 'center',
                marginTop: '12px',
                fontSize: '36px',
                color: '#FF8A8A',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              TU ROUTER PUEDE
              <br />
              <span style={{ color: '#FFFFFF', fontWeight: 900 }}>
                QUEDARSE CORTO
              </span>
            </div>
          </AnimatedText>
        </div>
      </Sequence>

      {/* 0:09.0 - 0:10.0 (frames 270 - 300): "SOPY TE DICE LA VERDAD..." */}
      <Sequence from={270} durationInFrames={30}>
        <div
          style={{
            position: 'absolute',
            top: 280,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 40px',
            boxSizing: 'border-box',
          }}
        >
          <AnimatedText
            durationInFrames={30}
            animationType="slideUp"
            cardStyle="cyber"
            fontSize={50}
          >
            <div
              style={{
                textTransform: 'uppercase',
                textAlign: 'center',
                color: '#FFFFFF',
                lineHeight: 1.15,
              }}
            >
              <span
                style={{
                  color: '#FF7A00',
                  textShadow: '0 0 24px rgba(255, 122, 0, 0.9)',
                }}
              >
                SOPY
              </span>{' '}
              TE DICE
              <br />
              <span
                style={{
                  color: '#00D4FF',
                  textShadow: '0 0 24px rgba(0, 212, 255, 0.9)',
                }}
              >
                LA VERDAD...
              </span>
            </div>
          </AnimatedText>
        </div>
      </Sequence>
    </div>
  );
};
