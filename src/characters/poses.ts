import type { Pose, PoseData } from '../types';

// M11 audit-v10 (Keane / Baker): mirrored limb pairs are the #1 robot
// tell. Real anatomy is asymmetric — dominant arm carries 2-5° more
// flex, body weight shifts onto one leg in stance. We break perfect
// mirror in every named pose. Numbers stay ≤7° from prior values so no
// existing scene composition is visually disrupted.
export const POSES: Record<Pose, PoseData> = {
  idle_stand: {
    leftArm: { angle: 12, x: -30, y: 0 },
    rightArm: { angle: -8, x: 30, y: 0 },
    leftLeg: { angle: 0, x: -12, y: 0 },
    rightLeg: { angle: 2, x: 12, y: 0 },
    bodyTilt: 0,
    headTilt: 0,
  },
  idle_sit: {
    leftArm: { angle: 45, x: -25, y: 10 },
    rightArm: { angle: -45, x: 25, y: 10 },
    leftLeg: { angle: 90, x: -15, y: 20 },
    rightLeg: { angle: 90, x: 15, y: 20 },
    bodyTilt: -5,
    headTilt: 0,
  },
  walk_cycle: {
    leftArm: { angle: -28, x: -28, y: -5 },
    rightArm: { angle: 33, x: 28, y: 5 },
    leftLeg: { angle: 22, x: -10, y: 5 },
    rightLeg: { angle: -27, x: 10, y: -5 },
    bodyTilt: 3,
    headTilt: 0,
  },
  talk_gesture: {
    leftArm: { angle: -20, x: -32, y: -10 },
    rightArm: { angle: -45, x: 35, y: -15 },
    leftLeg: { angle: 0, x: -12, y: 0 },
    rightLeg: { angle: 5, x: 12, y: 0 },
    bodyTilt: 2,
    headTilt: 5,
  },
  point: {
    leftArm: { angle: 10, x: -30, y: 0 },
    rightArm: { angle: -80, x: 45, y: -30 },
    leftLeg: { angle: 0, x: -12, y: 0 },
    rightLeg: { angle: 5, x: 14, y: 0 },
    bodyTilt: 5,
    headTilt: 3,
  },
  surprised: {
    leftArm: { angle: -57, x: -35, y: -20 },
    rightArm: { angle: 64, x: 35, y: -20 },
    leftLeg: { angle: -5, x: -15, y: 0 },
    rightLeg: { angle: 5, x: 15, y: 0 },
    bodyTilt: -5,
    headTilt: 0,
  },
  sad: {
    leftArm: { angle: 20, x: -28, y: 8 },
    rightArm: { angle: -20, x: 28, y: 8 },
    leftLeg: { angle: 0, x: -10, y: 0 },
    rightLeg: { angle: 0, x: 10, y: 0 },
    bodyTilt: -8,
    headTilt: -10,
  },
  angry: {
    leftArm: { angle: -38, x: -30, y: -5 },
    rightArm: { angle: 43, x: 30, y: -5 },
    leftLeg: { angle: -5, x: -14, y: 0 },
    rightLeg: { angle: 5, x: 14, y: 0 },
    bodyTilt: 5,
    headTilt: -3,
  },
  laugh: {
    leftArm: { angle: -28, x: -25, y: 0 },
    rightArm: { angle: 33, x: 25, y: 0 },
    leftLeg: { angle: 5, x: -12, y: 3 },
    rightLeg: { angle: -5, x: 12, y: 3 },
    bodyTilt: -3,
    headTilt: 8,
  },
  think: {
    leftArm: { angle: 15, x: -28, y: 2 },
    rightArm: { angle: -90, x: 15, y: -25 },
    leftLeg: { angle: 0, x: -12, y: 0 },
    rightLeg: { angle: 0, x: 12, y: 0 },
    bodyTilt: -2,
    headTilt: 5,
  },
  wave: {
    leftArm: { angle: 10, x: -30, y: 0 },
    rightArm: { angle: -120, x: 35, y: -35 },
    leftLeg: { angle: 0, x: -12, y: 0 },
    rightLeg: { angle: 0, x: 12, y: 0 },
    bodyTilt: 2,
    headTilt: 5,
  },
  celebrate: {
    leftArm: { angle: -127, x: -30, y: -35 },
    rightArm: { angle: 133, x: 30, y: -35 },
    leftLeg: { angle: -10, x: -15, y: -5 },
    rightLeg: { angle: 10, x: 15, y: -5 },
    bodyTilt: 0,
    headTilt: -5,
  },
};

export function getPose(pose: Pose): PoseData {
  return POSES[pose];
}
