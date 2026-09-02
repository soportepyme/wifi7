import React from 'react';
import { Audio, staticFile } from 'remotion';
import { VideoSequence } from './components/VideoSequence';
import { Captions } from './components/Captions';

export const Reel: React.FC = () => {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* Background Video Sequence - All MP4 videos muted (volume 0) */}
      <VideoSequence />

      {/* Main and Only Audio Track */}
      <Audio
        src={staticFile('diagnostico_wifi.mp3')}
        volume={1}
      />

      {/* Synchronized Reel/TikTok Style Dynamic Captions */}
      <Captions />
    </div>
  );
};
