import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { BeatMap } from './types';

export interface BeatDebugMarkersProps {
  beatMap: BeatMap | null | undefined;
  enabled?: boolean;
}

export const BeatDebugMarkers: React.FC<BeatDebugMarkersProps> = ({
  beatMap,
  enabled = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!enabled || !beatMap || !beatMap.enabled || !beatMap.beats) {
    return null;
  }

  // Find if current frame is on/near a beat
  const activeBeat = beatMap.beats.find((b) => Math.abs(b.frame - frame) <= 1);
  const currentTimeSec = frame / fps;

  // Level color palette
  const levelColors: Record<string, string> = {
    STRONG: '#FF2A55',  // Vivid Red
    MEDIUM: '#FFCC00',  // Electric Yellow
    WEAK: '#94A3B8',    // Muted Gray
  };

  const badgeColor = activeBeat ? levelColors[activeBeat.level] || '#00D4FF' : '#475569';

  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px',
        fontFamily: 'monospace',
      }}
    >
      {/* Beat HUD Banner */}
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: `2px solid ${badgeColor}`,
          borderRadius: '12px',
          padding: '8px 14px',
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 700,
          boxShadow: `0 4px 16px ${badgeColor}66`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: badgeColor,
            boxShadow: activeBeat ? `0 0 10px ${badgeColor}` : 'none',
            transform: activeBeat ? 'scale(1.4)' : 'scale(1)',
            transition: 'transform 0.05s ease',
          }}
        />
        <span>🎵 BPM: {beatMap.bpm}</span>
        <span style={{ color: '#94A3B8' }}>|</span>
        <span>F: {frame}</span>
        <span style={{ color: '#94A3B8' }}>|</span>
        <span>{currentTimeSec.toFixed(2)}s</span>
      </div>

      {/* Beat Pulse Status */}
      {activeBeat && (
        <div
          style={{
            backgroundColor: badgeColor,
            color: activeBeat.level === 'MEDIUM' ? '#000000' : '#FFFFFF',
            fontSize: '13px',
            fontWeight: 900,
            padding: '3px 10px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          💥 {activeBeat.level} BEAT (Str: {activeBeat.strength})
        </div>
      )}
    </div>
  );
};
