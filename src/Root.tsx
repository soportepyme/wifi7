import React from 'react';
import { Composition } from 'remotion';
import { Reel } from './Reel';
import { MANIFEST } from './generated-manifest';

export const VIDEO_FPS = MANIFEST.fps || 24;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const TOTAL_DURATION_IN_FRAMES = Math.max(1, MANIFEST.durationInFrames || 24);

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoPrincipal"
        component={Reel}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{}}
      />
    </>
  );
};
