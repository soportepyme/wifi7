import { BeatMap, BeatPoint, DynamicSegment } from './types';

export const MIN_BEAT_CONFIDENCE = 0.35;

export interface SnapResult {
  frame: number;
  beat: BeatPoint | null;
  snapped: boolean;
  diff: number;
}

/**
 * Snaps a target frame to the nearest musical beat within tolerance
 */
export function snapFrameToBeat(
  targetFrame: number,
  beatMap: BeatMap | null | undefined,
  toleranceFrames = 5
): SnapResult {
  if (!beatMap || !beatMap.enabled || !beatMap.beats || beatMap.beats.length === 0) {
    return { frame: targetFrame, beat: null, snapped: false, diff: 0 };
  }

  let nearestBeat: BeatPoint | null = null;
  let minDiff = Infinity;

  for (const beat of beatMap.beats) {
    const diff = Math.abs(beat.frame - targetFrame);
    if (diff < minDiff) {
      minDiff = diff;
      nearestBeat = beat;
    }
  }

  if (nearestBeat && minDiff <= toleranceFrames) {
    return {
      frame: nearestBeat.frame,
      beat: nearestBeat,
      snapped: true,
      diff: nearestBeat.frame - targetFrame,
    };
  }

  return {
    frame: targetFrame,
    beat: null,
    snapped: false,
    diff: 0,
  };
}

/**
 * Retrieves the beat point at or very close to a specific frame
 */
export function getBeatAtFrame(
  frame: number,
  beatMap: BeatMap | null | undefined,
  tolerance = 1
): BeatPoint | null {
  if (!beatMap || !beatMap.enabled || !beatMap.beats) return null;
  return (
    beatMap.beats.find((b) => Math.abs(b.frame - frame) <= tolerance) || null
  );
}

/**
 * Generates beat-synchronized segments for SOPY_VIRAL preset
 */
export function buildSopyViralBeatSyncedSegments(
  scene1File = 'escena1_cfr.mp4',
  scene2File = 'escena2_cfr.mp4',
  beatMap: BeatMap | null | undefined,
  beatSync = true
): DynamicSegment[] {
  // 1. Fallback if beatSync is disabled or confidence is low
  const isSyncActive =
    beatSync &&
    beatMap &&
    beatMap.enabled &&
    beatMap.confidence >= MIN_BEAT_CONFIDENCE &&
    beatMap.beats.length > 0;

  if (!isSyncActive) {
    return buildViralBaseSegments(scene1File, scene2File);
  }

  // 2. Base narrative cut points for Scene 1 (0 - 300 frames)
  // Base targets: [24, 48, 70, 90, 135, 175, 220, 260, 300]
  const baseScene1Cuts = [24, 48, 70, 90, 135, 175, 220, 260, 300];
  const snappedScene1Cuts: { frame: number; beat: BeatPoint | null }[] = [];

  let lastCut = 0;
  for (let i = 0; i < baseScene1Cuts.length - 1; i++) {
    const target = baseScene1Cuts[i];
    const snap = snapFrameToBeat(target, beatMap, 5);
    // Ensure minimum cut duration (cooldown of at least 14 frames)
    let safeFrame = snap.snapped ? snap.frame : target;
    if (safeFrame - lastCut < 14) {
      safeFrame = lastCut + 14;
    }
    snappedScene1Cuts.push({ frame: safeFrame, beat: snap.beat });
    lastCut = safeFrame;
  }
  // Scene 1 boundary is strictly fixed at 300
  snappedScene1Cuts.push({ frame: 300, beat: getBeatAtFrame(300, beatMap, 4) });

  // 3. Base narrative cut points for Scene 2 (300 - 600 frames)
  // Base targets relative to scene 2: [35, 80, 120, 170, 215, 260, 300] -> Global: [335, 380, 420, 470, 515, 560, 600]
  const baseScene2GlobalCuts = [335, 380, 420, 470, 515, 560, 600];
  const snappedScene2Cuts: { frame: number; beat: BeatPoint | null }[] = [];

  lastCut = 300;
  for (let i = 0; i < baseScene2GlobalCuts.length - 1; i++) {
    const target = baseScene2GlobalCuts[i];
    const snap = snapFrameToBeat(target, beatMap, 5);
    let safeFrame = snap.snapped ? snap.frame : target;
    if (safeFrame - lastCut < 15) {
      safeFrame = lastCut + 15;
    }
    snappedScene2Cuts.push({ frame: safeFrame, beat: snap.beat });
    lastCut = safeFrame;
  }
  // Scene 2 boundary is strictly fixed at 600
  snappedScene2Cuts.push({ frame: 600, beat: getBeatAtFrame(600, beatMap, 4) });

  // 4. Build Scene 1 segments with snapped durations
  const scene1Segments: DynamicSegment[] = [];
  let prevFrame = 0;

  const s1ShotBlueprints = [
    { shot: 'WIDE', cameraEffect: 'SLOW_PUSH', energy: 'HOOK', label: 'Hook Wide' },
    { shot: 'CLOSEUP', cameraEffect: 'PUNCH_IN', punchConfig: { durationFrames: 7, startScale: 1.15, targetScale: 1.28 }, energy: 'HOOK', label: 'Hook Closeup Punch' },
    { shot: 'DETAIL', cameraEffect: 'NONE', energy: 'HOOK', label: 'Hook Detail' },
    { shot: 'RIGHT_FOCUS', cameraEffect: 'CAMERA_SHAKE', shakeConfig: { intensity: 9, durationFrames: 6, startFrame: 0 }, energy: 'HOOK', label: 'Hook Shake Impact' },
    { shot: 'MEDIUM', cameraEffect: 'NONE', energy: 'HIGH', label: 'Body Medium' },
    { shot: 'LEFT_FOCUS', cameraEffect: 'PUNCH_IN', punchConfig: { durationFrames: 8, startScale: 1.12, targetScale: 1.25 }, energy: 'HIGH', label: 'Body Left Punch' },
    { shot: 'CLOSEUP', cameraEffect: 'NONE', energy: 'HIGH', label: 'Body Closeup Hard Cut' },
    { shot: 'DETAIL', cameraEffect: 'NONE', energy: 'HIGH', label: 'Body Detail' },
    { shot: 'WIDE', cameraEffect: 'SLOW_PUSH', transitionOut: 'WHIP_RIGHT', energy: 'HIGH', label: 'Body Wide Whip Out' },
  ] as const;

  for (let i = 0; i < snappedScene1Cuts.length; i++) {
    const cut = snappedScene1Cuts[i];
    const dur = Math.max(1, cut.frame - prevFrame);
    const sourceInSec = prevFrame / 30;
    const bp = s1ShotBlueprints[i] || s1ShotBlueprints[0];

    scene1Segments.push({
      id: `viral_s1_beat_${i + 1}`,
      sourceFile: scene1File,
      sourceInSec,
      durationInFrames: dur,
      shot: bp.shot,
      cameraEffect: bp.cameraEffect,
      shakeConfig: 'shakeConfig' in bp ? bp.shakeConfig : undefined,
      punchConfig: 'punchConfig' in bp ? bp.punchConfig : undefined,
      transitionOut: 'transitionOut' in bp ? bp.transitionOut : undefined,
      energy: bp.energy,
      label: bp.label,
      beatSynced: !!cut.beat,
      targetBeatFrame: cut.beat?.frame,
    });

    prevFrame = cut.frame;
  }

  // 5. Build Scene 2 segments with snapped durations
  const scene2Segments: DynamicSegment[] = [];
  prevFrame = 300;

  const s2ShotBlueprints = [
    {
      shot: 'MEDIUM',
      transitionIn: 'WHIP_RIGHT',
      cameraEffect: 'CAMERA_SHAKE',
      shakeConfig: { intensity: 11, durationFrames: 7, startFrame: 0 },
      energy: 'HIGH',
      label: 'Wi-Fi 7 Whip In & Shake',
    },
    {
      shot: 'DETAIL',
      cameraEffect: 'PUNCH_IN',
      punchConfig: { durationFrames: 8, startScale: 1.25, targetScale: 1.45 },
      energy: 'HIGH',
      label: 'Wi-Fi 7 Detail Punch',
    },
    { shot: 'RIGHT_FOCUS', cameraEffect: 'NONE', energy: 'HIGH', label: 'Right Focus Reframe' },
    { shot: 'WIDE', cameraEffect: 'SLOW_PUSH', energy: 'HIGH', label: 'Wide Push Solution' },
    {
      shot: 'CLOSEUP',
      cameraEffect: 'PUNCH_IN',
      punchConfig: { durationFrames: 8, startScale: 1.15, targetScale: 1.30 },
      energy: 'HIGH',
      label: 'Price Closeup Punch',
    },
    { shot: 'MEDIUM', cameraEffect: 'NONE', energy: 'HIGH', label: 'Medium Final Call' },
    { shot: 'WIDE', cameraEffect: 'SLOW_PUSH', energy: 'HIGH', label: 'Final Closing Wide' },
  ] as const;

  for (let i = 0; i < snappedScene2Cuts.length; i++) {
    const cut = snappedScene2Cuts[i];
    const dur = Math.max(1, cut.frame - prevFrame);
    const sourceInSec = (prevFrame - 300) / 30;
    const bp = s2ShotBlueprints[i] || s2ShotBlueprints[0];

    scene2Segments.push({
      id: `viral_s2_beat_${i + 1}`,
      sourceFile: scene2File,
      sourceInSec,
      durationInFrames: dur,
      shot: bp.shot,
      cameraEffect: bp.cameraEffect,
      transitionIn: 'transitionIn' in bp ? bp.transitionIn : undefined,
      shakeConfig: 'shakeConfig' in bp ? bp.shakeConfig : undefined,
      punchConfig: 'punchConfig' in bp ? bp.punchConfig : undefined,
      energy: bp.energy,
      label: bp.label,
      beatSynced: !!cut.beat,
      targetBeatFrame: cut.beat?.frame,
    });

    prevFrame = cut.frame;
  }

  return [...scene1Segments, ...scene2Segments];
}

/**
 * Standard fixed-timing fallback for SOPY_VIRAL
 */
function buildViralBaseSegments(
  scene1File: string,
  scene2File: string
): DynamicSegment[] {
  return [
    // SCENE 1
    { id: 'viral_s1_01_hook_wide', sourceFile: scene1File, sourceInSec: 0.0, durationInFrames: 24, shot: 'WIDE', cameraEffect: 'SLOW_PUSH', energy: 'HOOK', label: 'Hook Wide' },
    { id: 'viral_s1_02_hook_closeup', sourceFile: scene1File, sourceInSec: 0.8, durationInFrames: 24, shot: 'CLOSEUP', cameraEffect: 'PUNCH_IN', punchConfig: { durationFrames: 7, startScale: 1.15, targetScale: 1.28 }, energy: 'HOOK', label: 'Hook Closeup Punch' },
    { id: 'viral_s1_03_hook_detail', sourceFile: scene1File, sourceInSec: 1.6, durationInFrames: 22, shot: 'DETAIL', cameraEffect: 'NONE', energy: 'HOOK', label: 'Hook Detail' },
    { id: 'viral_s1_04_hook_shake', sourceFile: scene1File, sourceInSec: 2.33, durationInFrames: 20, shot: 'RIGHT_FOCUS', cameraEffect: 'CAMERA_SHAKE', shakeConfig: { intensity: 9, durationFrames: 6, startFrame: 0 }, energy: 'HOOK', label: 'Hook Shake Impact' },
    { id: 'viral_s1_05_body_medium', sourceFile: scene1File, sourceInSec: 3.0, durationInFrames: 45, shot: 'MEDIUM', cameraEffect: 'NONE', energy: 'HIGH', label: 'Body Medium' },
    { id: 'viral_s1_06_body_leftpunch', sourceFile: scene1File, sourceInSec: 4.5, durationInFrames: 40, shot: 'LEFT_FOCUS', cameraEffect: 'PUNCH_IN', punchConfig: { durationFrames: 8, startScale: 1.12, targetScale: 1.25 }, energy: 'HIGH', label: 'Body Left Punch' },
    { id: 'viral_s1_07_body_closeup', sourceFile: scene1File, sourceInSec: 5.83, durationInFrames: 45, shot: 'CLOSEUP', cameraEffect: 'NONE', energy: 'HIGH', label: 'Body Closeup Hard Cut' },
    { id: 'viral_s1_08_body_detail', sourceFile: scene1File, sourceInSec: 7.33, durationInFrames: 40, shot: 'DETAIL', cameraEffect: 'NONE', energy: 'HIGH', label: 'Body Detail' },
    { id: 'viral_s1_09_body_whipout', sourceFile: scene1File, sourceInSec: 8.66, durationInFrames: 40, shot: 'WIDE', cameraEffect: 'SLOW_PUSH', transitionOut: 'WHIP_RIGHT', energy: 'HIGH', label: 'Body Wide Whip Out' },

    // SCENE 2
    { id: 'viral_s2_01_whipin_shake', sourceFile: scene2File, sourceInSec: 0.0, durationInFrames: 35, shot: 'MEDIUM', transitionIn: 'WHIP_RIGHT', cameraEffect: 'CAMERA_SHAKE', shakeConfig: { intensity: 11, durationFrames: 7, startFrame: 0 }, energy: 'HIGH', label: 'Wi-Fi 7 Whip In & Shake' },
    { id: 'viral_s2_02_tech_punch', sourceFile: scene2File, sourceInSec: 1.17, durationInFrames: 45, shot: 'DETAIL', cameraEffect: 'PUNCH_IN', punchConfig: { durationFrames: 8, startScale: 1.25, targetScale: 1.45 }, energy: 'HIGH', label: 'Wi-Fi 7 Detail Punch' },
    { id: 'viral_s2_03_right_focus', sourceFile: scene2File, sourceInSec: 2.67, durationInFrames: 40, shot: 'RIGHT_FOCUS', cameraEffect: 'NONE', energy: 'HIGH', label: 'Right Focus Reframe' },
    { id: 'viral_s2_04_wide_push', sourceFile: scene2File, sourceInSec: 4.0, durationInFrames: 50, shot: 'WIDE', cameraEffect: 'SLOW_PUSH', energy: 'HIGH', label: 'Wide Push Solution' },
    { id: 'viral_s2_05_price_closeup', sourceFile: scene2File, sourceInSec: 5.67, durationInFrames: 45, shot: 'CLOSEUP', cameraEffect: 'PUNCH_IN', punchConfig: { durationFrames: 8, startScale: 1.15, targetScale: 1.30 }, energy: 'HIGH', label: 'Price Closeup Punch' },
    { id: 'viral_s2_06_medium_clean', sourceFile: scene2File, sourceInSec: 7.17, durationInFrames: 45, shot: 'MEDIUM', cameraEffect: 'NONE', energy: 'HIGH', label: 'Medium Final Call' },
    { id: 'viral_s2_07_final_wide', sourceFile: scene2File, sourceInSec: 8.67, durationInFrames: 40, shot: 'WIDE', cameraEffect: 'SLOW_PUSH', energy: 'HIGH', label: 'Final Closing Wide' },
  ];
}
