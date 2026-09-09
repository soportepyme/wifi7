import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import captionsData from '../captions/ad_captions.json';

export interface CaptionToken {
  text: string;
  fromMs: number;
  toMs: number;
  isHighlight?: boolean;
}

export interface CaptionPage {
  text: string;
  startMs: number;
  endMs: number;
  tokens: CaptionToken[];
}

export const AdCaptions: React.FC = () => {
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

  // Progressive, smooth entrance over 3 frames
  const pageAgeInFrames = Math.max(0, (currentTimeMs - activePage.startMs) / (1000 / fps));
  const pageOpacity = interpolate(pageAgeInFrames, [0, 3], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const pageScale = interpolate(pageAgeInFrames, [0, 3], [0.95, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 85, // 16:9 safe zone for YouTube controls / progress bar
        left: 0,
        width: 1920,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          transform: `scale(${pageScale})`,
          opacity: pageOpacity,
          padding: '12px 32px',
          borderRadius: '20px',
          backgroundColor: 'rgba(8, 12, 22, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        }}
      >
        {activePage.tokens.map((token, index) => {
          const isWordActive =
            currentTimeMs >= token.fromMs && currentTimeMs < token.toMs;
          const isPastWord = currentTimeMs >= token.toMs;

          // Gentle pop animation for active spoken word
          const tokenAgeInFrames = Math.max(0, (currentTimeMs - token.fromMs) / (1000 / fps));
          const wordPop = isWordActive
            ? interpolate(tokenAgeInFrames, [0, 2.5], [1.0, 1.07], {
                extrapolateRight: 'clamp',
              })
            : 1;

          const textColor = isWordActive
            ? '#FFE600' // Vivid electric yellow for active spoken word
            : token.isHighlight
            ? '#00E5FF' // High-tech cyan for key concepts
            : isPastWord
            ? '#FFFFFF'
            : '#94A3B8';

          return (
            <span
              key={`${token.text}-${index}`}
              style={{
                display: 'inline-block',
                margin: '2px 8px',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Montserrat", "Inter", "Segoe UI", Roboto, sans-serif',
                fontWeight: 900,
                fontSize: '38px',
                lineHeight: 1.2,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: textColor,
                WebkitTextStroke: isWordActive ? '4px #000000' : '3px #000000',
                paintOrder: 'stroke fill',
                textShadow: isWordActive
                  ? '0 0 20px rgba(255, 230, 0, 0.8), 0 4px 14px rgba(0, 0, 0, 0.95)'
                  : '0 3px 12px rgba(0, 0, 0, 0.9)',
                transform: `scale(${wordPop})`,
                transition: 'color 0.08s ease, transform 0.08s ease',
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
