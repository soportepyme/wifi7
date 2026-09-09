/**
 * SOPY DYNAMIC EDIT ENGINE - Types Definition
 */

export type ShotType =
  | 'WIDE'
  | 'MEDIUM'
  | 'CLOSEUP'
  | 'DETAIL'
  | 'LEFT_FOCUS'
  | 'RIGHT_FOCUS'
  | 'TOP_FOCUS'
  | 'LOW_FOCUS'
  | 'CUSTOM';

export type CameraEffectType =
  | 'NONE'
  | 'PUNCH_IN'
  | 'PUNCH_OUT'
  | 'CAMERA_SHAKE'
  | 'PARALLAX_PAN'
  | 'SLOW_PUSH';

export type TransitionType =
  | 'HARD_CUT'
  | 'WHIP_LEFT'
  | 'WHIP_RIGHT'
  | 'PUSH_LEFT'
  | 'PUSH_RIGHT'
  | 'ZOOM_IN'
  | 'ZOOM_OUT'
  | 'FADE';

export type EditingPresetType =
  | 'NONE'
  | 'SOPY_VIRAL'
  | 'SOPY_TECH'
  | 'SOPY_CINEMATIC'
  | 'SOPY_EXPLICA';

export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'HOOK';

export type BeatLevel = 'STRONG' | 'MEDIUM' | 'WEAK';

export interface BeatPoint {
  time: number;
  frame: number;
  strength: number;
  level: BeatLevel;
}

export interface BeatMap {
  version: number;
  source: string;
  sampleRate: number;
  fps: number;
  bpm: number;
  confidence: number;
  enabled: boolean;
  stats: {
    totalBeats: number;
    strong: number;
    medium: number;
    weak: number;
  };
  beats: BeatPoint[];
}

export interface ShotFramingValues {
  scale: number;
  translateX: number; // in pixels (clamped to prevent black bars)
  translateY: number; // in pixels (clamped to prevent black bars)
  rotation?: number;  // in degrees
}

export interface CameraShakeConfig {
  intensity?: number;      // max offset in px (e.g. 6 - 16px)
  durationFrames?: number; // 4 - 10 frames
  startFrame?: number;     // frame inside shot when shake triggers (defaults to 0)
  decay?: boolean;         // whether shake dampens down (defaults to true)
}

export interface PunchZoomConfig {
  startScale?: number;     // e.g. 1.00
  targetScale?: number;    // e.g. 1.18
  durationFrames?: number; // 6 - 10 frames
  easing?: 'spring' | 'ease-out' | 'smooth';
}

export interface DynamicCameraProps {
  shot?: ShotType;
  scale?: number;
  translateX?: number;
  translateY?: number;
  rotation?: number;
  cameraEffect?: CameraEffectType;
  shakeConfig?: CameraShakeConfig;
  punchConfig?: PunchZoomConfig;
  durationInFrames: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export interface DynamicSegment {
  id?: string;
  sourceFile: string;
  sourceInSec: number;
  durationInFrames: number;
  shot?: ShotType;
  scale?: number;
  translateX?: number;
  translateY?: number;
  rotation?: number;
  transitionIn?: TransitionType;
  transitionOut?: TransitionType;
  transitionDurationFrames?: number;
  cameraEffect?: CameraEffectType;
  shakeConfig?: CameraShakeConfig;
  punchConfig?: PunchZoomConfig;
  energy?: EnergyLevel;
  label?: string;
  beatSynced?: boolean;
  targetBeatFrame?: number;
  from?: number;
}

export interface EditDecision {
  archivo: string;
  inicio_fuente: number | string;
  fin_fuente: number | string;
  inicio_reel?: number | string;
  fin_reel?: number | string;
  duracion?: number | string;
  motivo_de_seleccion?: string;
  escena?: number;
  shot?: ShotType;
  scale?: number;
  translateX?: number;
  translateY?: number;
  rotation?: number;
  transition_in?: TransitionType;
  transition_out?: TransitionType;
  camera_effect?: CameraEffectType;
  energy?: EnergyLevel;
  startFrame?: number;
  endFrame?: number;
  durationInFrames?: number;
  sourceInSec?: number;
  sourceOutSec?: number;
  [key: string]: any;
}

