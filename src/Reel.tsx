import React from 'react';
import { Sequence, Audio, staticFile } from 'remotion';
import { Video } from '@remotion/media';
import { MANIFEST } from './generated-manifest';

export const Reel: React.FC = () => {
  let accumulatedFrom = 0;

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
      {/* Sequential normalized video clips */}
      {MANIFEST.videos.map((clip, index) => {
        const from = accumulatedFrom;
        accumulatedFrom += clip.durationInFrames;

        return (
          <Sequence
            key={`${clip.id}-${clip.file}-${index}`}
            from={from}
            durationInFrames={clip.durationInFrames}
          >
            <Video
              src={staticFile(`generated/${clip.file}`)}
              muted
              playbackRate={1}
              objectFit="cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Sequence>
        );
      })}

      {/* Main audio track */}
      {MANIFEST.audioFileName ? (
        <Audio
          src={staticFile(`generated/${MANIFEST.audioFileName}`)}
          volume={1}
        />
      ) : null}
    </div>
  );
};
