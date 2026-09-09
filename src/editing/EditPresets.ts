import { DynamicSegment, EditingPresetType, ShotFramingValues, ShotType } from './types';
import { SHOT_FRAMING } from './DynamicCamera';

export interface PresetProfile {
  name: EditingPresetType;
  description: string;
  hookCutsRangeFrames: [number, number]; // [minFrames, maxFrames] for first 3 seconds
  bodyCutsRangeFrames: [number, number]; // [minFrames, maxFrames] after 3 seconds
  shotSequence: ShotType[];
}

export const PRESET_PROFILES: Record<EditingPresetType, PresetProfile> = {
  SOPY_VIRAL: {
    name: 'SOPY_VIRAL',
    description: 'High energy modern viral format: 0.4-1.1s hook jump cuts, punch zooms, whip pans and subtle camera shakes.',
    hookCutsRangeFrames: [12, 33], // 0.4s - 1.1s @ 30fps
    bodyCutsRangeFrames: [21, 66], // 0.7s - 2.2s @ 30fps
    shotSequence: ['WIDE', 'CLOSEUP', 'DETAIL', 'RIGHT_FOCUS', 'MEDIUM', 'LEFT_FOCUS', 'CLOSEUP', 'DETAIL', 'WIDE'],
  },
  SOPY_TECH: {
    name: 'SOPY_TECH',
    description: 'Tech-focused edition: heavy emphasis on DETAIL, CLOSEUP and RIGHT/LEFT focus for devices and hardware.',
    hookCutsRangeFrames: [15, 36],
    bodyCutsRangeFrames: [30, 75],
    shotSequence: ['MEDIUM', 'DETAIL', 'CLOSEUP', 'RIGHT_FOCUS', 'DETAIL', 'TOP_FOCUS', 'CLOSEUP', 'WIDE'],
  },
  SOPY_CINEMATIC: {
    name: 'SOPY_CINEMATIC',
    description: 'Smooth cinematic flow: wider shots, gentle slow pushes, longer cuts with elegant transitions.',
    hookCutsRangeFrames: [24, 45],
    bodyCutsRangeFrames: [45, 90],
    shotSequence: ['WIDE', 'MEDIUM', 'WIDE', 'CLOSEUP', 'MEDIUM', 'WIDE'],
  },
  SOPY_EXPLICA: {
    name: 'SOPY_EXPLICA',
    description: 'Narrative clarity: medium and closeup shots prioritized for explanations with punch zooms on key moments.',
    hookCutsRangeFrames: [18, 36],
    bodyCutsRangeFrames: [30, 70],
    shotSequence: ['MEDIUM', 'CLOSEUP', 'MEDIUM', 'LEFT_FOCUS', 'CLOSEUP', 'MEDIUM', 'WIDE'],
  },
  NONE: {
    name: 'NONE',
    description: 'Standard 1:1 original sequence without dynamic multicam splits or digital reframing.',
    hookCutsRangeFrames: [300, 300],
    bodyCutsRangeFrames: [300, 300],
    shotSequence: ['WIDE'],
  },
};

/**
 * Returns framing parameters (scale, tx, ty) for any shot type.
 */
export function getShotFraming(shot: ShotType): ShotFramingValues {
  return SHOT_FRAMING[shot] || SHOT_FRAMING.WIDE;
}

/**
 * Generates the dynamic segments for SoportePyme Reel based on the selected preset.
 */
export function buildSopyReelSegments(
  scene1File = 'escena1_cfr.mp4',
  scene2File = 'escena2_cfr.mp4',
  preset: EditingPresetType = 'SOPY_VIRAL'
): DynamicSegment[] {
  if (preset === 'NONE') {
    return [
      {
        id: 'scene_1_raw',
        sourceFile: scene1File,
        sourceInSec: 0,
        durationInFrames: 300,
        shot: 'WIDE',
        cameraEffect: 'NONE',
        energy: 'MEDIUM',
        label: 'Escena 1 Original',
      },
      {
        id: 'scene_2_raw',
        sourceFile: scene2File,
        sourceInSec: 0,
        durationInFrames: 300,
        shot: 'WIDE',
        cameraEffect: 'NONE',
        energy: 'MEDIUM',
        label: 'Escena 2 Original',
      },
    ];
  }

  if (preset === 'SOPY_TECH') {
    return [
      // Scene 1 - Tech analysis (300 frames)
      {
        id: 's1_tech_1',
        sourceFile: scene1File,
        sourceInSec: 0.0,
        durationInFrames: 35,
        shot: 'MEDIUM',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HOOK',
      },
      {
        id: 's1_tech_2',
        sourceFile: scene1File,
        sourceInSec: 1.17,
        durationInFrames: 30,
        shot: 'DETAIL',
        cameraEffect: 'PUNCH_IN',
        energy: 'HOOK',
      },
      {
        id: 's1_tech_3',
        sourceFile: scene1File,
        sourceInSec: 2.17,
        durationInFrames: 35,
        shot: 'RIGHT_FOCUS',
        cameraEffect: 'NONE',
        energy: 'HOOK',
      },
      {
        id: 's1_tech_4',
        sourceFile: scene1File,
        sourceInSec: 3.33,
        durationInFrames: 50,
        shot: 'CLOSEUP',
        cameraEffect: 'PUNCH_IN',
        energy: 'HIGH',
      },
      {
        id: 's1_tech_5',
        sourceFile: scene1File,
        sourceInSec: 5.0,
        durationInFrames: 50,
        shot: 'DETAIL',
        cameraEffect: 'NONE',
        energy: 'HIGH',
      },
      {
        id: 's1_tech_6',
        sourceFile: scene1File,
        sourceInSec: 6.67,
        durationInFrames: 50,
        shot: 'LEFT_FOCUS',
        cameraEffect: 'NONE',
        energy: 'HIGH',
      },
      {
        id: 's1_tech_7',
        sourceFile: scene1File,
        sourceInSec: 8.33,
        durationInFrames: 50,
        shot: 'MEDIUM',
        cameraEffect: 'SLOW_PUSH',
        transitionOut: 'WHIP_RIGHT',
        energy: 'HIGH',
      },

      // Scene 2 - Tech Solution (300 frames)
      {
        id: 's2_tech_1',
        sourceFile: scene2File,
        sourceInSec: 0.0,
        durationInFrames: 40,
        shot: 'DETAIL',
        transitionIn: 'WHIP_RIGHT',
        cameraEffect: 'CAMERA_SHAKE',
        shakeConfig: { intensity: 8, durationFrames: 6 },
        energy: 'HIGH',
      },
      {
        id: 's2_tech_2',
        sourceFile: scene2File,
        sourceInSec: 1.33,
        durationInFrames: 45,
        shot: 'CLOSEUP',
        cameraEffect: 'PUNCH_IN',
        energy: 'HIGH',
      },
      {
        id: 's2_tech_3',
        sourceFile: scene2File,
        sourceInSec: 2.83,
        durationInFrames: 45,
        shot: 'RIGHT_FOCUS',
        cameraEffect: 'NONE',
        energy: 'HIGH',
      },
      {
        id: 's2_tech_4',
        sourceFile: scene2File,
        sourceInSec: 4.33,
        durationInFrames: 50,
        shot: 'DETAIL',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HIGH',
      },
      {
        id: 's2_tech_5',
        sourceFile: scene2File,
        sourceInSec: 6.0,
        durationInFrames: 60,
        shot: 'MEDIUM',
        cameraEffect: 'NONE',
        energy: 'HIGH',
      },
      {
        id: 's2_tech_6',
        sourceFile: scene2File,
        sourceInSec: 8.0,
        durationInFrames: 60,
        shot: 'CLOSEUP',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HIGH',
      },
    ];
  }

  if (preset === 'SOPY_CINEMATIC') {
    return [
      // Scene 1 - Cinematic Flow (300 frames)
      {
        id: 's1_cine_1',
        sourceFile: scene1File,
        sourceInSec: 0.0,
        durationInFrames: 60,
        shot: 'WIDE',
        cameraEffect: 'SLOW_PUSH',
        energy: 'MEDIUM',
      },
      {
        id: 's1_cine_2',
        sourceFile: scene1File,
        sourceInSec: 2.0,
        durationInFrames: 60,
        shot: 'MEDIUM',
        cameraEffect: 'PARALLAX_PAN',
        energy: 'MEDIUM',
      },
      {
        id: 's1_cine_3',
        sourceFile: scene1File,
        sourceInSec: 4.0,
        durationInFrames: 60,
        shot: 'CLOSEUP',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HIGH',
      },
      {
        id: 's1_cine_4',
        sourceFile: scene1File,
        sourceInSec: 6.0,
        durationInFrames: 60,
        shot: 'MEDIUM',
        cameraEffect: 'NONE',
        energy: 'MEDIUM',
      },
      {
        id: 's1_cine_5',
        sourceFile: scene1File,
        sourceInSec: 8.0,
        durationInFrames: 60,
        shot: 'WIDE',
        cameraEffect: 'SLOW_PUSH',
        transitionOut: 'FADE',
        energy: 'HIGH',
      },

      // Scene 2 - Cinematic Solution (300 frames)
      {
        id: 's2_cine_1',
        sourceFile: scene2File,
        sourceInSec: 0.0,
        durationInFrames: 60,
        shot: 'WIDE',
        transitionIn: 'FADE',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HIGH',
      },
      {
        id: 's2_cine_2',
        sourceFile: scene2File,
        sourceInSec: 2.0,
        durationInFrames: 60,
        shot: 'MEDIUM',
        cameraEffect: 'PARALLAX_PAN',
        energy: 'HIGH',
      },
      {
        id: 's2_cine_3',
        sourceFile: scene2File,
        sourceInSec: 4.0,
        durationInFrames: 60,
        shot: 'CLOSEUP',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HIGH',
      },
      {
        id: 's2_cine_4',
        sourceFile: scene2File,
        sourceInSec: 6.0,
        durationInFrames: 60,
        shot: 'DETAIL',
        cameraEffect: 'NONE',
        energy: 'HIGH',
      },
      {
        id: 's2_cine_5',
        sourceFile: scene2File,
        sourceInSec: 8.0,
        durationInFrames: 60,
        shot: 'WIDE',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HIGH',
      },
    ];
  }

  if (preset === 'SOPY_EXPLICA') {
    return [
      // Scene 1 - Narrative Explanation (300 frames)
      {
        id: 's1_exp_1',
        sourceFile: scene1File,
        sourceInSec: 0.0,
        durationInFrames: 45,
        shot: 'MEDIUM',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HOOK',
      },
      {
        id: 's1_exp_2',
        sourceFile: scene1File,
        sourceInSec: 1.5,
        durationInFrames: 45,
        shot: 'CLOSEUP',
        cameraEffect: 'PUNCH_IN',
        punchConfig: { durationFrames: 8, startScale: 1.15, targetScale: 1.28 },
        energy: 'HOOK',
      },
      {
        id: 's1_exp_3',
        sourceFile: scene1File,
        sourceInSec: 3.0,
        durationInFrames: 50,
        shot: 'LEFT_FOCUS',
        cameraEffect: 'NONE',
        energy: 'HIGH',
      },
      {
        id: 's1_exp_4',
        sourceFile: scene1File,
        sourceInSec: 4.67,
        durationInFrames: 50,
        shot: 'MEDIUM',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HIGH',
      },
      {
        id: 's1_exp_5',
        sourceFile: scene1File,
        sourceInSec: 6.33,
        durationInFrames: 50,
        shot: 'CLOSEUP',
        cameraEffect: 'PUNCH_IN',
        punchConfig: { durationFrames: 8, startScale: 1.15, targetScale: 1.28 },
        energy: 'HIGH',
      },
      {
        id: 's1_exp_6',
        sourceFile: scene1File,
        sourceInSec: 8.0,
        durationInFrames: 60,
        shot: 'WIDE',
        cameraEffect: 'NONE',
        transitionOut: 'PUSH_LEFT',
        energy: 'HIGH',
      },

      // Scene 2 - Solution Explanation (300 frames)
      {
        id: 's2_exp_1',
        sourceFile: scene2File,
        sourceInSec: 0.0,
        durationInFrames: 45,
        shot: 'MEDIUM',
        transitionIn: 'PUSH_LEFT',
        cameraEffect: 'NONE',
        energy: 'HIGH',
      },
      {
        id: 's2_exp_2',
        sourceFile: scene2File,
        sourceInSec: 1.5,
        durationInFrames: 45,
        shot: 'CLOSEUP',
        cameraEffect: 'PUNCH_IN',
        punchConfig: { durationFrames: 8, startScale: 1.15, targetScale: 1.28 },
        energy: 'HIGH',
      },
      {
        id: 's2_exp_3',
        sourceFile: scene2File,
        sourceInSec: 3.0,
        durationInFrames: 50,
        shot: 'DETAIL',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HIGH',
      },
      {
        id: 's2_exp_4',
        sourceFile: scene2File,
        sourceInSec: 4.67,
        durationInFrames: 50,
        shot: 'RIGHT_FOCUS',
        cameraEffect: 'NONE',
        energy: 'HIGH',
      },
      {
        id: 's2_exp_5',
        sourceFile: scene2File,
        sourceInSec: 6.33,
        durationInFrames: 50,
        shot: 'CLOSEUP',
        cameraEffect: 'PUNCH_IN',
        punchConfig: { durationFrames: 8, startScale: 1.15, targetScale: 1.28 },
        energy: 'HIGH',
      },
      {
        id: 's2_exp_6',
        sourceFile: scene2File,
        sourceInSec: 8.0,
        durationInFrames: 60,
        shot: 'WIDE',
        cameraEffect: 'SLOW_PUSH',
        energy: 'HIGH',
      },
    ];
  }

  // Default: SOPY_VIRAL (High energy jump cuts, punch zooms, whip pans, subtle camera shakes)
  return [
    // -------------------------------------------------------------
    // SCENE 1: Overload / Caos (0.00s - 10.00s | Frames 0 - 300)
    // -------------------------------------------------------------
    // 1. Hook initial establishing shot (0.0 - 0.80s)
    {
      id: 'viral_s1_01_hook_wide',
      sourceFile: scene1File,
      sourceInSec: 0.0,
      durationInFrames: 24, // 0.80s
      shot: 'WIDE',
      cameraEffect: 'SLOW_PUSH',
      energy: 'HOOK',
      label: 'Hook Wide',
    },
    // 2. Immediate jump cut to Sopy/Protagonist Close-up (0.80 - 1.60s)
    {
      id: 'viral_s1_02_hook_closeup',
      sourceFile: scene1File,
      sourceInSec: 0.8,
      durationInFrames: 24, // 0.80s
      shot: 'CLOSEUP',
      cameraEffect: 'PUNCH_IN',
      punchConfig: { durationFrames: 7, startScale: 1.15, targetScale: 1.28 },
      energy: 'HOOK',
      label: 'Hook Closeup Punch',
    },
    // 3. Detail shot on devices/congestion (1.60 - 2.33s)
    {
      id: 'viral_s1_03_hook_detail',
      sourceFile: scene1File,
      sourceInSec: 1.6,
      durationInFrames: 22, // 0.73s
      shot: 'DETAIL',
      cameraEffect: 'NONE',
      energy: 'HOOK',
      label: 'Hook Detail',
    },
    // 4. Right focus with subtle camera shake impact on beat (2.33 - 3.00s)
    {
      id: 'viral_s1_04_hook_shake',
      sourceFile: scene1File,
      sourceInSec: 2.33,
      durationInFrames: 20, // 0.67s
      shot: 'RIGHT_FOCUS',
      cameraEffect: 'CAMERA_SHAKE',
      shakeConfig: { intensity: 9, durationFrames: 6, startFrame: 0 },
      energy: 'HOOK',
      label: 'Hook Shake Impact',
    },
    // 5. Jump cut to Medium shot (3.00 - 4.50s)
    {
      id: 'viral_s1_05_body_medium',
      sourceFile: scene1File,
      sourceInSec: 3.0,
      durationInFrames: 45, // 1.50s
      shot: 'MEDIUM',
      cameraEffect: 'NONE',
      energy: 'HIGH',
      label: 'Body Medium',
    },
    // 6. Punch Zoom on Left Focus (4.50 - 5.83s)
    {
      id: 'viral_s1_06_body_leftpunch',
      sourceFile: scene1File,
      sourceInSec: 4.5,
      durationInFrames: 40, // 1.33s
      shot: 'LEFT_FOCUS',
      cameraEffect: 'PUNCH_IN',
      punchConfig: { durationFrames: 8, startScale: 1.12, targetScale: 1.25 },
      energy: 'HIGH',
      label: 'Body Left Punch',
    },
    // 7. Hard cut to Close-up (5.83 - 7.33s)
    {
      id: 'viral_s1_07_body_closeup',
      sourceFile: scene1File,
      sourceInSec: 5.83,
      durationInFrames: 45, // 1.50s
      shot: 'CLOSEUP',
      cameraEffect: 'NONE',
      energy: 'HIGH',
      label: 'Body Closeup Hard Cut',
    },
    // 8. Detail cut on problem (7.33 - 8.66s)
    {
      id: 'viral_s1_08_body_detail',
      sourceFile: scene1File,
      sourceInSec: 7.33,
      durationInFrames: 40, // 1.33s
      shot: 'DETAIL',
      cameraEffect: 'NONE',
      energy: 'HIGH',
      label: 'Body Detail',
    },
    // 9. Wide shot leading into Whip Pan transition (8.66 - 10.00s)
    {
      id: 'viral_s1_09_body_whipout',
      sourceFile: scene1File,
      sourceInSec: 8.66,
      durationInFrames: 40, // 1.34s
      shot: 'WIDE',
      cameraEffect: 'SLOW_PUSH',
      transitionOut: 'WHIP_RIGHT',
      energy: 'HIGH',
      label: 'Body Wide Whip Out',
    },

    // -------------------------------------------------------------
    // SCENE 2: Wi-Fi 7 Solution / Control (10.00s - 20.00s | Frames 300 - 600)
    // -------------------------------------------------------------
    // 10. Whip In entrance with tech impact shake (10.00 - 11.17s)
    {
      id: 'viral_s2_01_whipin_shake',
      sourceFile: scene2File,
      sourceInSec: 0.0,
      durationInFrames: 35, // 1.17s
      shot: 'MEDIUM',
      transitionIn: 'WHIP_RIGHT',
      cameraEffect: 'CAMERA_SHAKE',
      shakeConfig: { intensity: 11, durationFrames: 7, startFrame: 0 },
      energy: 'HIGH',
      label: 'Wi-Fi 7 Whip In & Shake',
    },
    // 11. Big punch zoom on Wi-Fi 7 router / hardware (11.17 - 12.67s)
    {
      id: 'viral_s2_02_tech_punch',
      sourceFile: scene2File,
      sourceInSec: 1.17,
      durationInFrames: 45, // 1.50s
      shot: 'DETAIL',
      cameraEffect: 'PUNCH_IN',
      punchConfig: { durationFrames: 8, startScale: 1.25, targetScale: 1.45 },
      energy: 'HIGH',
      label: 'Wi-Fi 7 Detail Punch',
    },
    // 12. Right Focus reframe (12.67 - 14.00s)
    {
      id: 'viral_s2_03_right_focus',
      sourceFile: scene2File,
      sourceInSec: 2.67,
      durationInFrames: 40, // 1.33s
      shot: 'RIGHT_FOCUS',
      cameraEffect: 'NONE',
      energy: 'HIGH',
      label: 'Right Focus Reframe',
    },
    // 13. Wide presentation of speed / smart home (14.00 - 15.67s)
    {
      id: 'viral_s2_04_wide_push',
      sourceFile: scene2File,
      sourceInSec: 4.0,
      durationInFrames: 50, // 1.67s
      shot: 'WIDE',
      cameraEffect: 'SLOW_PUSH',
      energy: 'HIGH',
      label: 'Wide Push Solution',
    },
    // 14. Punch closeup on price card / offer (15.67 - 17.17s)
    {
      id: 'viral_s2_05_price_closeup',
      sourceFile: scene2File,
      sourceInSec: 5.67,
      durationInFrames: 45, // 1.50s
      shot: 'CLOSEUP',
      cameraEffect: 'PUNCH_IN',
      punchConfig: { durationFrames: 8, startScale: 1.15, targetScale: 1.30 },
      energy: 'HIGH',
      label: 'Price Closeup Punch',
    },
    // 15. Clean Medium shot (17.17 - 18.67s)
    {
      id: 'viral_s2_06_medium_clean',
      sourceFile: scene2File,
      sourceInSec: 7.17,
      durationInFrames: 45, // 1.50s
      shot: 'MEDIUM',
      cameraEffect: 'NONE',
      energy: 'HIGH',
      label: 'Medium Final Call',
    },
    // 16. Final closing shot with Sopy (18.67 - 20.00s)
    {
      id: 'viral_s2_07_final_wide',
      sourceFile: scene2File,
      sourceInSec: 8.67,
      durationInFrames: 40, // 1.33s
      shot: 'WIDE',
      cameraEffect: 'SLOW_PUSH',
      energy: 'HIGH',
      label: 'Final Closing Wide',
    },
  ];
}
