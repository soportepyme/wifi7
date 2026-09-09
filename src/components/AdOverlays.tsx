import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const AdOverlays: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        pointerEvents: 'none',
        zIndex: 30,
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Montserrat", "Inter", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ============================================================
          SCENE 1: 00:00 - 00:10 (Frames 0 - 300)
          ============================================================ */}
      
      {/* 00:00.4 - 00:02.8: ¿TU COMPUTADORA ESTÁ LENTÍSIMA? */}
      {frame >= 12 && frame < 85 && (
        <Scene1Question
          frame={frame}
          startFrame={12}
          endFrame={85}
          fps={fps}
          line1="¿TU COMPUTADORA"
          line2="ESTÁ LENTÍSIMA?"
          accentWord="LENTÍSIMA?"
          top={120}
        />
      )}

      {/* 00:03.0 - 00:05.3: ¿EL INTERNET SE TRABA? */}
      {frame >= 90 && frame < 160 && (
        <Scene1Question
          frame={frame}
          startFrame={90}
          endFrame={160}
          fps={fps}
          line1="¿EL INTERNET"
          line2="SE TRABA?"
          accentWord="SE TRABA?"
          top={120}
        />
      )}

      {/* 00:05.5 - 00:08.5: ¿YOUTUBE CARGA Y CARGA? */}
      {frame >= 165 && frame < 260 && (
        <Scene1Question
          frame={frame}
          startFrame={165}
          endFrame={260}
          fps={fps}
          line1="¿YOUTUBE"
          line2="CARGA Y CARGA?"
          accentWord="CARGA Y CARGA?"
          top={120}
        />
      )}

      {/* TRANSITION 1 -> 2 & J-CUT: 00:08.89 - 00:10.0 (Frames 267 - 300) */}
      {frame >= 267 && frame < 305 && (
        <NoCompresImpact frame={frame} startFrame={267} fps={fps} />
      )}

      {/* ============================================================
          SCENE 2: 00:10 - 00:20 (Frames 300 - 600)
          ============================================================ */}
      
      {/* 00:10.0 - 00:15.2: NO PAGUES MÁS MEGAS A CIEGAS */}
      {frame >= 305 && frame < 460 && (
        <Scene2NoPagues frame={frame} startFrame={305} fps={fps} />
      )}

      {/* 00:15.5 - 00:19.5: EL PROBLEMA PUEDE ESTAR DONDE MENOS IMAGINAS */}
      {frame >= 465 && frame < 590 && (
        <Scene2DondeMenos frame={frame} startFrame={465} fps={fps} />
      )}

      {/* ============================================================
          SCENE 3: 00:20 - 00:30 (Frames 600 - 900)
          TECH BADGES FLOATING & COVERING BOTTOM AI LABELS
          ============================================================ */}
      {frame >= 600 && frame < 900 && (
        <Scene3Badges frame={frame} fps={fps} />
      )}

      {/* ============================================================
          SCENE 4: 00:30 - 00:40 (Frames 900 - 1200)
          MUCHOS MEGAS ≠ BUEN WI-FI + CONCEPTOS
          ============================================================ */}
      {frame >= 900 && frame < 1200 && (
        <Scene4MegasNotWifi frame={frame} fps={fps} />
      )}

      {/* ============================================================
          SCENE 5: 00:40 - 00:50 (Frames 1200 - 1500)
          DIAGNÓSTICO EN DOMICILIO + $250 HERO REVELATION
          ============================================================ */}
      {frame >= 1200 && frame < 1500 && (
        <Scene5DiagnosticPrice frame={frame} fps={fps} />
      )}

      {/* ============================================================
          SCENE 6: 00:50 - 01:00 (Frames 1500 - 1800)
          RESOLUCIÓN, DESCUENTO $250 & FINAL CTA
          ============================================================ */}
      {frame >= 1500 && frame <= 1800 && (
        <Scene6ResolutionCTA frame={frame} fps={fps} />
      )}
    </div>
  );
};

// ==========================================
// SCENE 1 HELPER COMPONENTS
// ==========================================

const Scene1Question: React.FC<{
  frame: number;
  startFrame: number;
  endFrame: number;
  fps: number;
  line1: string;
  line2: string;
  accentWord: string;
  top: number;
}> = ({ frame, startFrame, endFrame, fps, line1, line2, accentWord, top }) => {
  const age = frame - startFrame;
  const leaveAge = endFrame - frame;

  const opacity = interpolate(
    age,
    [0, 8],
    [0, 1],
    { extrapolateRight: 'clamp' }
  ) * interpolate(leaveAge, [0, 8], [0, 1], { extrapolateLeft: 'clamp' });

  const translateY = interpolate(
    age,
    [0, 10],
    [24, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 100,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(10, 15, 28, 0.82)',
          backdropFilter: 'blur(16px)',
          borderLeft: '6px solid #FF3B30',
          borderRadius: '4px 18px 18px 4px',
          padding: '16px 36px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#F8FAFC',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            lineHeight: 1.15,
          }}
        >
          {line1}
        </div>
        <div
          style={{
            fontSize: '52px',
            fontWeight: 900,
            color: '#FF453A',
            letterSpacing: '1.8px',
            textTransform: 'uppercase',
            lineHeight: 1.15,
            textShadow: '0 0 25px rgba(255, 69, 58, 0.6)',
          }}
        >
          {line2}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TRANSITION 1 -> 2: ¡NO COMPRES OTRA COMPUTADORA TODAVÍA!
// ==========================================

const NoCompresImpact: React.FC<{ frame: number; startFrame: number; fps: number }> = ({
  frame,
  startFrame,
  fps,
}) => {
  const age = frame - startFrame;
  const spr = spring({
    frame: age,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.8 },
  });

  const glitchShift = age < 5 ? (age % 2 === 0 ? 4 : -4) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: age < 4 ? 'rgba(255, 0, 50, 0.18)' : 'transparent',
      }}
    >
      <div
        style={{
          transform: `scale(${spr}) translateX(${glitchShift}px)`,
          textAlign: 'center',
          backgroundColor: 'rgba(12, 10, 24, 0.88)',
          backdropFilter: 'blur(20px)',
          padding: '24px 56px',
          borderRadius: '24px',
          border: '2px solid #FF3B30',
          boxShadow: '0 0 60px rgba(255, 59, 48, 0.6), 0 30px 60px rgba(0, 0, 0, 0.9)',
        }}
      >
        <div
          style={{
            fontSize: '76px',
            fontWeight: 900,
            color: '#FFE600',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            lineHeight: 1.05,
            WebkitTextStroke: '2px #000000',
            textShadow: '0 0 35px rgba(255, 230, 0, 0.8)',
          }}
        >
          ¡NO COMPRES!
        </div>
        <div
          style={{
            fontSize: '44px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginTop: 8,
          }}
        >
          OTRA COMPUTADORA TODAVÍA
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SCENE 2: NO PAGUES MÁS MEGAS A CIEGAS
// ==========================================

const Scene2NoPagues: React.FC<{ frame: number; startFrame: number; fps: number }> = ({
  frame,
  startFrame,
  fps,
}) => {
  const age = frame - startFrame;
  const opacity = interpolate(age, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(age, [0, 10], [20, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: 90,
        left: 100,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(8, 14, 30, 0.85)',
          backdropFilter: 'blur(16px)',
          borderLeft: '6px solid #00E5FF',
          borderRadius: '4px 20px 20px 4px',
          padding: '18px 40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75)',
        }}
      >
        <div
          style={{
            fontSize: '38px',
            fontWeight: 800,
            color: '#E2E8F0',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}
        >
          NO PAGUES
        </div>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 900,
            color: '#00E5FF',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textShadow: '0 0 30px rgba(0, 229, 255, 0.7)',
            lineHeight: 1.1,
          }}
        >
          MÁS MEGAS
        </div>
        <div
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          A CIEGAS
        </div>
      </div>
    </div>
  );
};

const Scene2DondeMenos: React.FC<{ frame: number; startFrame: number; fps: number }> = ({
  frame,
  startFrame,
  fps,
}) => {
  const age = frame - startFrame;
  const opacity = interpolate(age, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(age, [0, 8], [15, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: 100,
        left: 100,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(10, 15, 32, 0.88)',
          backdropFilter: 'blur(16px)',
          borderLeft: '6px solid #FFE600',
          borderRadius: '4px 20px 20px 4px',
          padding: '18px 36px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75)',
        }}
      >
        <div
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color: '#F1F5F9',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          EL PROBLEMA PUEDE ESTAR
        </div>
        <div
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#FFE600',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            textShadow: '0 0 24px rgba(255, 230, 0, 0.6)',
          }}
        >
          DONDE MENOS IMAGINAS
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SCENE 3: CAUSAS & TECH BADGES (REPLACES BOTTOM AI LABELS)
// ==========================================

const Scene3Badges: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const badges = [
    { text: '¿HDD O SSD?', startFrame: 605, endFrame: 660, color: '#00E5FF' },
    { text: '¿POCA MEMORIA RAM?', startFrame: 660, endFrame: 710, color: '#38BDF8' },
    { text: '¿TARJETA WI-FI LIMITADA?', startFrame: 710, endFrame: 760, color: '#FFE600' },
    { text: '¿SEÑAL DÉBIL?', startFrame: 760, endFrame: 810, color: '#F97316' },
    { text: '¿MUCHOS EQUIPOS CONECTADOS?', startFrame: 810, endFrame: 885, color: '#EC4899' },
  ];

  return (
    <>
      {/* Top Section Header */}
      {frame >= 605 && frame < 890 && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: 90,
            backgroundColor: 'rgba(8, 14, 28, 0.88)',
            backdropFilter: 'blur(16px)',
            borderLeft: '6px solid #00E5FF',
            borderRadius: '4px 16px 16px 4px',
            padding: '12px 32px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            DIAGNÓSTICO DE CAUSAS REALES
          </div>
        </div>
      )}

      {/* Floating Active Tech Badge synced with narration on the upper-left */}
      <div
        style={{
          position: 'absolute',
          top: 155,
          left: 90,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {badges.map((b, i) => {
          if (frame < b.startFrame) return null;
          const age = frame - b.startFrame;
          const spr = spring({
            frame: age,
            fps,
            config: { damping: 14, stiffness: 220, mass: 0.6 },
          });

          const isCurrentActive = frame >= b.startFrame && frame < b.endFrame;

          return (
            <div
              key={i}
              style={{
                transform: `scale(${spr})`,
                backgroundColor: isCurrentActive
                  ? 'rgba(12, 20, 40, 0.95)'
                  : 'rgba(8, 14, 28, 0.75)',
                backdropFilter: 'blur(16px)',
                border: isCurrentActive ? `2px solid ${b.color}` : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '10px 24px',
                boxShadow: isCurrentActive
                  ? `0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px ${b.color}50`
                  : '0 6px 18px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.1s ease',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: b.color,
                  boxShadow: isCurrentActive ? `0 0 12px ${b.color}` : 'none',
                }}
              />
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: isCurrentActive ? '#FFFFFF' : '#94A3B8',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {b.text}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ==========================================
// SCENE 4: MUCHOS MEGAS ≠ BUEN WI-FI
// ==========================================

const Scene4MegasNotWifi: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // 00:30.0 - 00:37.0: MUCHOS MEGAS ≠ BUEN WI-FI
  const showFormula = frame >= 905 && frame < 1120;
  const showQuestion = frame >= 1130 && frame < 1200;

  return (
    <>
      {showFormula && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 90,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(8, 14, 30, 0.88)',
              backdropFilter: 'blur(16px)',
              borderRadius: '20px',
              border: '2px solid rgba(0, 229, 255, 0.4)',
              padding: '20px 40px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <span
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '1.5px',
              }}
            >
              MUCHOS MEGAS
            </span>
            <span
              style={{
                fontSize: '54px',
                fontWeight: 900,
                color: '#FF3B30',
                textShadow: '0 0 25px rgba(255, 59, 48, 0.8)',
              }}
            >
              ≠
            </span>
            <span
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#00E5FF',
                letterSpacing: '1.5px',
                textShadow: '0 0 25px rgba(0, 229, 255, 0.7)',
              }}
            >
              BUEN WI-FI
            </span>
          </div>

          {/* Issues Badges (Ping alto, congestión, mala cobertura) */}
          {frame >= 960 && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              {['PING ALTO', 'CONGESTIÓN', 'MALA COBERTURA'].map((tag, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 20px',
                    borderRadius: '12px',
                    color: '#FCA5A5',
                    fontSize: '22px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                  }}
                >
                  ⚠ {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 00:37.8: ¿QUÉ NECESITAS REALMENTE? */}
      {showQuestion && (
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 90,
            backgroundColor: 'rgba(8, 14, 30, 0.9)',
            backdropFilter: 'blur(16px)',
            borderLeft: '6px solid #FFE600',
            borderRadius: '4px 20px 20px 4px',
            padding: '18px 40px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '2px',
            }}
          >
            ENTONCES...
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 900,
              color: '#FFE600',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textShadow: '0 0 30px rgba(255, 230, 0, 0.7)',
            }}
          >
            ¿QUÉ NECESITAS REALMENTE?
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================
// SCENE 5: DIAGNÓSTICO EN DOMICILIO & $250 HERO PRICE
// ==========================================

const Scene5DiagnosticPrice: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Top Banner: SOPORTEPYME · DIAGNÓSTICO EN TU DOMICILIO
  const showTopHeader = frame >= 1205 && frame < 1380;
  const showHeroPrice = frame >= 1385 && frame < 1500;

  const priceAge = frame - 1385;
  const priceSpring = spring({
    frame: priceAge,
    fps,
    config: { damping: 11, stiffness: 180, mass: 0.9 },
  });

  return (
    <>
      {showTopHeader && (
        <div
          style={{
            position: 'absolute',
            top: 75,
            left: 80,
            backgroundColor: 'rgba(8, 14, 30, 0.88)',
            backdropFilter: 'blur(18px)',
            borderLeft: '6px solid #00E5FF',
            borderRadius: '4px 20px 20px 4px',
            padding: '18px 40px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#00E5FF',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            SOPORTEPYME
          </div>
          <div
            style={{
              fontSize: '44px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            DIAGNÓSTICO EN TU DOMICILIO
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#FFE600',
              letterSpacing: '2px',
              marginTop: 4,
            }}
          >
            PC + WI-FI
          </div>
        </div>
      )}

      {/* $250 HERO REVELATION (Clean Remotion Card over clean freeze) */}
      {showHeroPrice && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1920,
            height: 1080,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              transform: `scale(${priceSpring})`,
              backgroundColor: 'rgba(10, 16, 32, 0.92)',
              backdropFilter: 'blur(24px)',
              border: '3px solid #00E5FF',
              borderRadius: '32px',
              padding: '36px 80px',
              textAlign: 'center',
              boxShadow:
                '0 0 80px rgba(0, 229, 255, 0.5), 0 30px 70px rgba(0, 0, 0, 0.95)',
            }}
          >
            <div
              style={{
                fontSize: '30px',
                fontWeight: 900,
                color: '#94A3B8',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              POR SOLO
            </div>
            <div
              style={{
                fontSize: '130px',
                fontWeight: 900,
                color: '#FFE600',
                letterSpacing: '2px',
                lineHeight: 1,
                WebkitTextStroke: '4px #000000',
                textShadow:
                  '0 0 50px rgba(255, 230, 0, 0.9), 0 10px 30px rgba(0, 0, 0, 0.95)',
              }}
            >
              $250
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginTop: '12px',
              }}
            >
              DIAGNÓSTICO EN DOMICILIO
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#00E5FF',
                letterSpacing: '2px',
                marginTop: '6px',
              }}
            >
              PC + WI-FI
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================
// SCENE 6: RESOLUCIÓN & FINAL CTA
// ==========================================

const Scene6ResolutionCTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // 00:50.0 - 00:54.0: TE DECIMOS QUÉ ESTÁ FALLANDO Y QUÉ NECESITAS
  const showCondition1 = frame >= 1505 && frame < 1625;
  // 00:54.5 - 00:57.3: SI AUTORIZAS LA SOLUCIÓN, LOS $250 SE DESCUENTAN
  const showDiscount = frame >= 1630 && frame < 1720;
  // 00:57.5 - 01:00.0: FINAL CTA (ANTES DE GASTAR... DIAGNOSTICA)
  const showFinalCTA = frame >= 1725 && frame <= 1800;

  const ctaAge = frame - 1725;
  const ctaSpring = spring({
    frame: ctaAge,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.8 },
  });

  return (
    <>
      {showCondition1 && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 80,
            backgroundColor: 'rgba(8, 14, 30, 0.88)',
            backdropFilter: 'blur(16px)',
            borderLeft: '6px solid #00E5FF',
            borderRadius: '4px 20px 20px 4px',
            padding: '18px 40px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div
            style={{
              fontSize: '40px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            TE DECIMOS QUÉ ESTÁ FALLANDO
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 900,
              color: '#FFE600',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            Y QUÉ NECESITAS REALMENTE
          </div>
        </div>
      )}

      {showDiscount && (
        <div
          style={{
            position: 'absolute',
            top: 75,
            left: 80,
            backgroundColor: 'rgba(8, 14, 30, 0.92)',
            backdropFilter: 'blur(18px)',
            borderLeft: '6px solid #FFE600',
            borderRadius: '4px 24px 24px 4px',
            padding: '20px 44px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            SI AUTORIZAS EL SERVICIO...
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 900,
              color: '#FFE600',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              lineHeight: 1.15,
              textShadow: '0 0 30px rgba(255, 230, 0, 0.6)',
            }}
          >
            LOS $250 SE DESCUENTAN
          </div>
          <div
            style={{
              fontSize: '34px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            DEL SERVICIO FINAL
          </div>
        </div>
      )}

      {showFinalCTA && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1920,
            height: 1080,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(6, 10, 20, 0.65)',
          }}
        >
          <div
            style={{
              transform: `scale(${ctaSpring})`,
              textAlign: 'center',
              backgroundColor: 'rgba(8, 12, 26, 0.94)',
              backdropFilter: 'blur(28px)',
              border: '2px solid rgba(0, 229, 255, 0.6)',
              borderRadius: '32px',
              padding: '40px 90px',
              boxShadow:
                '0 0 100px rgba(0, 229, 255, 0.5), 0 30px 80px rgba(0, 0, 0, 0.95)',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                fontWeight: 800,
                color: '#CBD5E1',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              ANTES DE GASTAR...
            </div>
            <div
              style={{
                fontSize: '110px',
                fontWeight: 900,
                color: '#00E5FF',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                lineHeight: 1,
                WebkitTextStroke: '3px #000000',
                textShadow:
                  '0 0 50px rgba(0, 229, 255, 0.9), 0 10px 30px rgba(0, 0, 0, 0.95)',
              }}
            >
              DIAGNOSTICA.
            </div>
            <div
              style={{
                marginTop: 24,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(255, 230, 0, 0.12)',
                border: '1px solid rgba(255, 230, 0, 0.5)',
                padding: '10px 32px',
                borderRadius: '16px',
              }}
            >
              <span
                style={{
                  fontSize: '38px',
                  fontWeight: 900,
                  color: '#FFE600',
                  letterSpacing: '3px',
                }}
              >
                SoportePyme
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
