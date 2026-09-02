import React from 'react';
import { Series, staticFile } from 'remotion';
import { Video } from '@remotion/media';

export interface VideoClipConfig {
  file: string;
  durationInFrames: number;
}

export const CLIPS_SEQUENCE: VideoClipConfig[] = [
  { file: '1_ok.mp4', durationInFrames: 146 },
  { file: '2_ok.mp4', durationInFrames: 146 },
  { file: '03_1.mp4', durationInFrames: 146 },
  { file: '3_2_ok.mp4', durationInFrames: 146 },
  { file: '5_ok.mp4', durationInFrames: 146 },
  { file: '6_1ok1.mp4', durationInFrames: 44 },
  { file: '08_ok.mp4', durationInFrames: 146 },
  { file: '9_ok.mp4', durationInFrames: 145 },
];

export const VideoSequence: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      <Series>
        {CLIPS_SEQUENCE.map((clip, index) => (
          <Series.Sequence
            key={`${clip.file}-${index}`}
            durationInFrames={clip.durationInFrames}
          >
            <Video
              src={staticFile(`media-cfr/${clip.file}`)}
              muted
              playbackRate={1}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Series.Sequence>
        ))}
      </Series>
    </div>
  );
};
