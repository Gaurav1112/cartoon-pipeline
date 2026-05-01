import type { Pose, PoseData } from '../types';

export const POSES: Record<Pose, PoseData> = {
  idle_stand: {
    leftArm: { angle: 10, x: -30, y: 0 },
    rightArm: { angle: -10, x: 30, y: 0 },
    leftLeg: { angle: 0, x: -12, y: 0 },
    rightLeg: { angle: 0, x: 12, y: 0 },
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
    leftArm: { angle: -30, x: -28, y: -5 },
    rightArm: { angle: 30, x: 28, y: 5 },
    leftLeg: { angle: 25, x: -10, y: 5 },
    rightLeg: { angle: -25, x: 10, y: -5 },
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
    leftArm: { angle: -60, x: -35, y: -20 },
    rightArm: { angle: 60, x: 35, y: -20 },
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
    leftArm: { angle: -40, x: -30, y: -5 },
    rightArm: { angle: 40, x: 30, y: -5 },
    leftLeg: { angle: -5, x: -14, y: 0 },
    rightLeg: { angle: 5, x: 14, y: 0 },
    bodyTilt: 5,
    headTilt: -3,
  },
  laugh: {
    leftArm: { angle: -30, x: -25, y: 0 },
    rightArm: { angle: 30, x: 25, y: 0 },
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
    leftArm: { angle: -130, x: -30, y: -35 },
    rightArm: { angle: 130, x: 30, y: -35 },
    leftLeg: { angle: -10, x: -15, y: -5 },
    rightLeg: { angle: 10, x: 15, y: -5 },
    bodyTilt: 0,
    headTilt: -5,
  },
};

export function getPose(pose: Pose): PoseData {
  return POSES[pose];
}
