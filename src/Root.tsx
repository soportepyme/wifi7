import React from 'react';
import { Composition } from 'remotion';
import { SopyWifi7Reel } from './SopyWifi7Reel';
import { Reel } from './Reel';
import { MANIFEST } from './generated-manifest';
import { EditingPresetType } from './editing';

export const REEL_FPS = MANIFEST.fps || 30;
export const REEL_WIDTH = MANIFEST.width || 1080;
export const REEL_HEIGHT = MANIFEST.height || 1920;
export const REEL_DURATION_IN_FRAMES = MANIFEST.durationInFrames || 600;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="SopyWifi7Reel"
        component={SopyWifi7Reel}
        durationInFrames={REEL_DURATION_IN_FRAMES}
        fps={REEL_FPS}
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
        defaultProps={{
          editingPreset: 'SOPY_VIRAL' as EditingPresetType,
          beatSync: true,
          debugBeatMarkers: false,
        }}
      />
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={REEL_DURATION_IN_FRAMES}
        fps={REEL_FPS}
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
        defaultProps={{
          editingPreset: 'SOPY_VIRAL' as EditingPresetType,
          beatSync: true,
          debugBeatMarkers: false,
        }}
      />
    </>
  );
};

