import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import captionsData from '../captions/captions.json';

export interface CaptionToken {
  text: string;
  fromMs: number;
  toMs: number;
}

export interface CaptionPage {
  text: string;
  startMs: number;
  endMs: number;
  tokens: CaptionToken[];
}

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Current playback time in milliseconds
  const currentTimeMs = (frame / fps) * 1000;

  // Find the active caption page for the current time
  const activePage = (captionsData.pages as CaptionPage[]).find(
    (page) => currentTimeMs >= page.startMs && currentTimeMs < page.endMs
  );

  if (!activePage) {
    return null;
  }

  // Animation for page entrance (spring scale & opacity)
  const pageAgeInFrames = Math.max(0, (currentTimeMs - activePage.startMs) / (1000 / fps));
  const entranceSpring = spring({
    frame: pageAgeInFrames,
    fps,
    config: {
      damping: 14,
      mass: 0.4,
      stiffness: 200,
    },
  });

  const pageScale = interpolate(entranceSpring, [0, 1], [0.93, 1]);
  const pageOpacity = interpolate(pageAgeInFrames, [0, 2], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: '460px', // Safe margin above TikTok / IG Reels UI
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: '920px',
          maxWidth: '92%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          transform: `scale(${pageScale})`,
          opacity: pageOpacity,
          padding: '14px 28px',
          borderRadius: '24px',
          backgroundColor: 'rgba(0, 0, 0, 0.42)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
        }}
      >
        {activePage.tokens.map((token, index) => {
          const isWordActive =
            currentTimeMs >= token.fromMs && currentTimeMs < token.toMs;
          const isPastWord = currentTimeMs >= token.toMs;

          // Subtle bounce/pop animation for the active spoken word
          const tokenAgeInFrames = Math.max(0, (currentTimeMs - token.fromMs) / (1000 / fps));
          const wordPop = isWordActive
            ? interpolate(tokenAgeInFrames, [0, 2, 5], [1.02, 1.14, 1.08], {
                extrapolateRight: 'clamp',
              })
            : 1;

          return (
            <span
              key={`${token.text}-${index}`}
              style={{
                display: 'inline-block',
                margin: '2px 10px',
                fontFamily:
                  'Impact, "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 900,
                fontSize: '62px',
                lineHeight: 1.18,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: isWordActive
                  ? '#FFE600' // Vibrant glowing yellow
                  : isPastWord
                  ? '#FFFFFF' // Spoken words bright white
                  : '#E2E8F0', // Upcoming words soft white
                WebkitTextStroke: isWordActive ? '6px #000000' : '5px #000000',
                paintOrder: 'stroke fill',
                textShadow: isWordActive
                  ? '0 0 24px rgba(255, 230, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.95)'
                  : '0 4px 18px rgba(0, 0, 0, 0.9)',
                transform: `scale(${wordPop})`,
                transition: 'transform 0.06s ease, color 0.06s ease',
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
