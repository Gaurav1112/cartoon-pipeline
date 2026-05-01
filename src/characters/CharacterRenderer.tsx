import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import type { CharacterId, Pose, EmotionType, MouthShape, PoseData } from '../types';
import { CHARACTERS } from '../story/characters';
import { getPose } from './poses';
import { getExpression } from './expressions';
import { getMouthShape, interpolateMouth } from './lip-sync';

interface CharacterRendererProps {
  characterId: CharacterId;
  pose: Pose;
  expression: EmotionType;
  mouthShape?: MouthShape;
  position: { x: number; y: number };
  scale?: number;
  flipX?: boolean;
}

// Character-specific body proportions
const BODY_CONFIGS: Record<CharacterId, {
  headW: number; headH: number; bodyW: number; bodyH: number; legH: number;
  hairStyle: 'spiky' | 'braid' | 'round' | 'bald_beard' | 'slick' | 'bun' | 'crown' | 'ears';
  extras: string[];
}> = {
  arjun:  { headW: 32, headH: 34, bodyW: 34, bodyH: 38, legH: 28, hairStyle: 'spiky',      extras: ['scarf', 'tilak'] },
  meera:  { headW: 30, headH: 32, bodyW: 30, bodyH: 36, legH: 28, hairStyle: 'braid',       extras: ['book', 'bindi', 'earrings'] },
  bablu:  { headW: 36, headH: 34, bodyW: 44, bodyH: 32, legH: 20, hairStyle: 'round',       extras: ['food_crumbs', 'belt'] },
  guruji: { headW: 30, headH: 32, bodyW: 30, bodyH: 50, legH: 34, hairStyle: 'bald_beard',  extras: ['staff', 'rudraksha'] },
  kaaliya:{ headW: 32, headH: 36, bodyW: 36, bodyH: 44, legH: 32, hairStyle: 'slick',       extras: ['collar', 'rings', 'scar'] },
  amma:   { headW: 30, headH: 32, bodyW: 34, bodyH: 42, legH: 28, hairStyle: 'bun',         extras: ['sari_pallu', 'bangles', 'bindi'] },
  raja:   { headW: 32, headH: 34, bodyW: 38, bodyH: 44, legH: 30, hairStyle: 'crown',       extras: ['cape', 'scepter', 'jewels'] },
  moti:   { headW: 28, headH: 26, bodyW: 36, bodyH: 28, legH: 18, hairStyle: 'ears',        extras: ['tail', 'collar_bell'] },
};

const OUTLINE_COLOR = '#2A1A0A';
const OUTLINE_WIDTH = 2.5;

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  characterId,
  pose,
  expression,
  mouthShape = 'B',
  position,
  scale = 1,
  flipX = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const character = CHARACTERS[characterId];
  const mouth = getMouthShape(mouthShape);
  const { primary, secondary, accent, skin } = character.colors;
  const cfg = BODY_CONFIGS[characterId];

  // ─── Pose interpolation (smooth transitions, not snapping) ───
  const basePose = getPose(pose);
  const isTalking = mouthShape !== 'B';

  // Walk cycle: animate legs/arms sinusoidally when in walk_cycle pose
  const walkPhase = (frame % 24) / 24; // 24-frame cycle = 0.8s per step
  const walkAngle = Math.sin(walkPhase * Math.PI * 2);
  const isWalking = pose === 'walk_cycle';

  const poseData: PoseData = isWalking ? {
    leftArm:  { angle: -20 * walkAngle, x: basePose.leftArm.x, y: Math.abs(walkAngle) * -3 },
    rightArm: { angle: 20 * walkAngle, x: basePose.rightArm.x, y: Math.abs(walkAngle) * -3 },
    leftLeg:  { angle: 25 * walkAngle, x: basePose.leftLeg.x, y: Math.abs(walkAngle) * 3 },
    rightLeg: { angle: -25 * walkAngle, x: basePose.rightLeg.x, y: Math.abs(walkAngle) * 3 },
    bodyTilt: 2 * Math.sin(walkPhase * Math.PI * 4), // double-freq bob
    headTilt: -1 * Math.sin(walkPhase * Math.PI * 4),
  } : isTalking ? {
    // Talk gesture: gentle arm movement + head bob
    ...basePose,
    rightArm: { ...basePose.rightArm, angle: basePose.rightArm.angle + Math.sin(frame * 0.08) * 8 },
    headTilt: basePose.headTilt + Math.sin(frame * 0.12) * 3,
    bodyTilt: basePose.bodyTilt + Math.sin(frame * 0.1) * 1.5,
  } : basePose;

  // Expression data (with smooth pupil drift for liveliness)
  const exprData = getExpression(expression);

  // ─── Animations ───
  const breathe = Math.sin(frame * 0.07) * 3; // increased from 2 to 3
  const idleSway = Math.sin(frame * 0.03) * 1.5;
  // Irregular blink using golden ratio
  const blinkCycle = (frame + characterId.charCodeAt(0) * 13) % 127;
  const blink = blinkCycle < 4 || (blinkCycle > 60 && blinkCycle < 64); // 4 frames not 3
  // Head bob when talking
  const talkBob = isTalking ? Math.sin(frame * 0.12) * 2.5 : 0;
  // Pupil drift (eyes look alive)
  const pupilDriftX = Math.sin(frame * 0.04 + characterId.charCodeAt(0)) * 1.5;
  const pupilDriftY = Math.cos(frame * 0.03 + characterId.charCodeAt(1) || 0) * 0.8;
  // Walk bob (vertical bounce when walking)
  const walkBob = isWalking ? Math.abs(Math.sin(walkPhase * Math.PI * 2)) * -4 : 0;

  const skinDark = darken(skin, 0.15);
  const primaryDark = darken(primary, 0.2);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y + walkBob,
        transform: `scale(${scale * (flipX ? -1 : 1)}, ${scale})`,
        transformOrigin: 'center bottom',
      }}
    >
      <svg width="140" height="220" viewBox="-70 -120 140 220" xmlns="http://www.w3.org/2000/svg">
        {/* ─── Gradient definitions for premium look ─── */}
        <defs>
          <linearGradient id={`${characterId}-skin`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lighten(skin, 0.08)} />
            <stop offset="55%" stopColor={skin} />
            <stop offset="100%" stopColor={darken(skin, 0.18)} />
          </linearGradient>
          <linearGradient id={`${characterId}-cloth`} x1="0%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor={lighten(primary, 0.12)} />
            <stop offset="50%" stopColor={primary} />
            <stop offset="100%" stopColor={darken(primary, 0.25)} />
          </linearGradient>
          <linearGradient id={`${characterId}-hair`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor={lighten(accent, 0.15)} />
            <stop offset="40%" stopColor={accent} />
            <stop offset="100%" stopColor={darken(accent, 0.3)} />
          </linearGradient>
          <radialGradient id={`${characterId}-eyeW`} cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E8EEF4" />
          </radialGradient>
        </defs>

        {/* Drop shadow on ground (responsive to breathing) */}
        <ellipse cx={1 + Math.sin(frame * 0.07) * 0.5} cy="95"
          rx={30 + Math.abs(breathe) * 0.5} ry={6 - Math.abs(breathe) * 0.2}
          fill="rgba(0,0,0,0.18)" />

        {/* === LEGS === */}
        <g transform={`rotate(${poseData.leftLeg.angle}, -8, 50)`}>
          <rect x="-16" y="50" width="14" height={cfg.legH} rx="5" fill={`url(#${characterId}-cloth)`} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
          <ellipse cx="-9" cy={50 + cfg.legH} rx="9" ry="5" fill={accent} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
        </g>
        <g transform={`rotate(${poseData.rightLeg.angle}, 8, 50)`}>
          <rect x="2" y="50" width="14" height={cfg.legH} rx="5" fill={`url(#${characterId}-cloth)`} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
          <ellipse cx="9" cy={50 + cfg.legH} rx="9" ry="5" fill={accent} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
        </g>

        {/* === BODY === */}
        <g transform={`rotate(${poseData.bodyTilt + idleSway * 0.3}, 0, 25) translate(0, ${breathe})`}>
          {/* Torso */}
          <rect x={-cfg.bodyW / 2} y="5" width={cfg.bodyW} height={cfg.bodyH} rx="12" fill={`url(#${characterId}-cloth)`} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
          {/* Clothing detail - collar */}
          <path d={`M${-cfg.bodyW / 2 + 6},10 Q0,20 ${cfg.bodyW / 2 - 6},10`} fill="none" stroke={secondary} strokeWidth="3" />
          {/* Clothing pattern lines */}
          <line x1={-cfg.bodyW / 2 + 3} y1={cfg.bodyH * 0.6} x2={cfg.bodyW / 2 - 3} y2={cfg.bodyH * 0.6} stroke={primaryDark} strokeWidth="1" opacity="0.3" />

          {/* Bablu belly bulge */}
          {characterId === 'bablu' && (
            <ellipse cx="0" cy="30" rx={cfg.bodyW / 2 + 4} ry="18" fill={`url(#${characterId}-cloth)`} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
          )}

          {/* Amma sari pallu */}
          {characterId === 'amma' && (
            <path d={`M${-cfg.bodyW / 2},12 Q-30,-5 -20,${cfg.bodyH}`} fill={secondary} stroke={OUTLINE_COLOR} strokeWidth={1.5} opacity="0.8" />
          )}

          {/* Raja cape */}
          {characterId === 'raja' && (
            <path d={`M${-cfg.bodyW / 2 - 3},8 L${-cfg.bodyW / 2 - 12},${cfg.bodyH + 10} L${cfg.bodyW / 2 + 12},${cfg.bodyH + 10} L${cfg.bodyW / 2 + 3},8`} fill="#B22222" stroke={OUTLINE_COLOR} strokeWidth={1.5} opacity="0.7" />
          )}

          {/* Kaaliya high collar */}
          {characterId === 'kaaliya' && (
            <>
              <path d={`M-18,5 L-14,-8 L14,-8 L18,5`} fill="#2F0040" stroke={OUTLINE_COLOR} strokeWidth={1.5} />
              <path d={`M-12,-5 L12,-5`} stroke="#8B008B" strokeWidth="1" />
            </>
          )}

          {/* Belt for Bablu */}
          {characterId === 'bablu' && (
            <rect x={-cfg.bodyW / 2 - 2} y={cfg.bodyH - 8} width={cfg.bodyW + 4} height="5" rx="2" fill={accent} stroke={OUTLINE_COLOR} strokeWidth={1} />
          )}

          {/* === ARMS === */}
          <g transform={`rotate(${poseData.leftArm.angle}, ${-cfg.bodyW / 2}, 12)`}>
            {/* Upper arm */}
            <path d={`M${-cfg.bodyW / 2 - 2},8 L${-cfg.bodyW / 2 - 12},8 L${-cfg.bodyW / 2 - 11},24 L${-cfg.bodyW / 2 - 1},24 Z`} fill={`url(#${characterId}-skin)`} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} rx="4" />
            {/* Forearm */}
            <path d={`M${-cfg.bodyW / 2 - 11},24 L${-cfg.bodyW / 2 - 10},38 L${-cfg.bodyW / 2 - 1},38 L${-cfg.bodyW / 2 - 1},24 Z`} fill={skin} stroke={OUTLINE_COLOR} strokeWidth={1.5} />
            {/* Mitt hand (not a circle!) */}
            <path d={`M${-cfg.bodyW / 2 - 11},37 Q${-cfg.bodyW / 2 - 13},42 ${-cfg.bodyW / 2 - 10},46 Q${-cfg.bodyW / 2 - 5},48 ${-cfg.bodyW / 2},45 Q${-cfg.bodyW / 2 + 1},41 ${-cfg.bodyW / 2 - 1},37 Z`} fill={`url(#${characterId}-skin)`} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
            {/* Thumb indication */}
            <path d={`M${-cfg.bodyW / 2 - 1},40 Q${-cfg.bodyW / 2 + 2},38 ${-cfg.bodyW / 2 + 1},42`} fill="none" stroke={OUTLINE_COLOR} strokeWidth="1" opacity="0.5" />
          </g>
          <g transform={`rotate(${poseData.rightArm.angle}, ${cfg.bodyW / 2}, 12)`}>
            {/* Upper arm */}
            <path d={`M${cfg.bodyW / 2 + 2},8 L${cfg.bodyW / 2 + 12},8 L${cfg.bodyW / 2 + 11},24 L${cfg.bodyW / 2 + 1},24 Z`} fill={`url(#${characterId}-skin)`} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
            {/* Forearm */}
            <path d={`M${cfg.bodyW / 2 + 1},24 L${cfg.bodyW / 2 + 1},38 L${cfg.bodyW / 2 + 10},38 L${cfg.bodyW / 2 + 11},24 Z`} fill={skin} stroke={OUTLINE_COLOR} strokeWidth={1.5} />
            {/* Mitt hand */}
            <path d={`M${cfg.bodyW / 2 + 1},37 Q${cfg.bodyW / 2 - 1},41 ${cfg.bodyW / 2},45 Q${cfg.bodyW / 2 + 5},48 ${cfg.bodyW / 2 + 10},46 Q${cfg.bodyW / 2 + 13},42 ${cfg.bodyW / 2 + 11},37 Z`} fill={`url(#${characterId}-skin)`} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
            {/* Thumb indication */}
            <path d={`M${cfg.bodyW / 2 + 1},40 Q${cfg.bodyW / 2 - 2},38 ${cfg.bodyW / 2 - 1},42`} fill="none" stroke={OUTLINE_COLOR} strokeWidth="1" opacity="0.5" />

            {/* Guruji staff */}
            {characterId === 'guruji' && (
              <rect x={cfg.bodyW / 2 + 7} y="-60" width="4" height="100" rx="2" fill="#8B4513" stroke={OUTLINE_COLOR} strokeWidth={1} />
            )}

            {/* Meera book */}
            {characterId === 'meera' && pose !== 'talk_gesture' && (
              <rect x={cfg.bodyW / 2 + 2} y="25" width="14" height="18" rx="2" fill="#4169E1" stroke={OUTLINE_COLOR} strokeWidth={1.5} />
            )}
          </g>

          {/* === HEAD === */}
          <g transform={`rotate(${poseData.headTilt + talkBob * 0.5}, 0, -20) translate(0, ${talkBob})`}>
            {/* Neck */}
            <rect x="-6" y="-8" width="12" height="16" rx="4" fill={skin} />

            {/* Head shape */}
            <ellipse cx="0" cy={-cfg.headH - 4} rx={cfg.headW} ry={cfg.headH} fill={`url(#${characterId}-skin)`} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />

            {/* Cheek blush (when happy/embarrassed) */}
            {(expression === 'happy' || expression === 'surprised') && (
              <>
                <ellipse cx={-cfg.headW + 10} cy={-cfg.headH + 8} rx="6" ry="3" fill="#FFB6C1" opacity="0.4" />
                <ellipse cx={cfg.headW - 10} cy={-cfg.headH + 8} rx="6" ry="3" fill="#FFB6C1" opacity="0.4" />
              </>
            )}

            {/* HAIR STYLES */}
            {cfg.hairStyle === 'spiky' && (
              <g>
                {/* Arjun - spiky upward tufts */}
                <path d={`M${-cfg.headW + 5},${-cfg.headH - 14} L${-cfg.headW + 10},${-cfg.headH - 30} L${-cfg.headW + 18},${-cfg.headH - 12}`} fill={accent} stroke={OUTLINE_COLOR} strokeWidth={1.5} />
                <path d={`M-5,${-cfg.headH - 16} L0,${-cfg.headH - 35} L5,${-cfg.headH - 16}`} fill={accent} stroke={OUTLINE_COLOR} strokeWidth={1.5} />
                <path d={`M${cfg.headW - 18},${-cfg.headH - 12} L${cfg.headW - 10},${-cfg.headH - 28} L${cfg.headW - 5},${-cfg.headH - 14}`} fill={accent} stroke={OUTLINE_COLOR} strokeWidth={1.5} />
                <ellipse cx="0" cy={-cfg.headH - 16} rx={cfg.headW + 2} ry="12" fill={accent} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
                {/* Arjun tilak */}
                <ellipse cx="0" cy={-cfg.headH - 18} rx="3" ry="4" fill="#FF4500" />
              </g>
            )}
            {cfg.hairStyle === 'braid' && (
              <g>
                {/* Meera - hair with side braid */}
                <ellipse cx="0" cy={-cfg.headH - 14} rx={cfg.headW + 3} ry="14" fill="#1A1A1A" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
                {/* Braid going down right side */}
                <path d={`M${cfg.headW - 2},${-cfg.headH + 4} Q${cfg.headW + 8},${-cfg.headH + 20} ${cfg.headW + 4},${-cfg.headH + 40} Q${cfg.headW},${-cfg.headH + 50} ${cfg.headW + 6},${-cfg.headH + 60}`} fill="none" stroke="#1A1A1A" strokeWidth="6" strokeLinecap="round" />
                {/* Braid segments */}
                {[20, 30, 40, 50].map((y) => (
                  <circle key={y} cx={cfg.headW + 4} cy={-cfg.headH + y} r="1.5" fill="white" />
                ))}
                {/* Hair flower */}
                <circle cx={cfg.headW - 4} cy={-cfg.headH + 2} r="4" fill="white" stroke="#FFD700" strokeWidth="1" />
                {/* Bindi */}
                <circle cx="0" cy={-cfg.headH - 2} r="2.5" fill="#FF0000" />
                {/* Nose stud */}
                <circle cx="4" cy={-cfg.headH + 12} r="1.5" fill="#FFD700" />
              </g>
            )}
            {cfg.hairStyle === 'round' && (
              <g>
                {/* Bablu - messy round hair */}
                <ellipse cx="0" cy={-cfg.headH - 12} rx={cfg.headW + 5} ry="16" fill="#3E2723" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
                <circle cx={-cfg.headW + 3} cy={-cfg.headH - 8} r="5" fill="#3E2723" />
                <circle cx={cfg.headW - 3} cy={-cfg.headH - 6} r="4" fill="#3E2723" />
              </g>
            )}
            {cfg.hairStyle === 'bald_beard' && (
              <g>
                {/* Guruji - bald top, white beard */}
                <ellipse cx="0" cy={-cfg.headH - 10} rx={cfg.headW - 4} ry="8" fill={skin} />
                {/* Small topknot */}
                <circle cx="0" cy={-cfg.headH - 20} r="6" fill="white" stroke={OUTLINE_COLOR} strokeWidth={1} />
                {/* Beard */}
                <path d={`M${-cfg.headW + 8},${-cfg.headH + 16} Q0,${-cfg.headH + 40} ${cfg.headW - 8},${-cfg.headH + 16}`} fill="white" stroke={OUTLINE_COLOR} strokeWidth={1.5} />
                {/* Mustache */}
                <path d={`M-10,${-cfg.headH + 12} Q0,${-cfg.headH + 18} 10,${-cfg.headH + 12}`} fill="white" stroke={OUTLINE_COLOR} strokeWidth={1} />
              </g>
            )}
            {cfg.hairStyle === 'slick' && (
              <g>
                {/* Kaaliya - slicked back dark hair */}
                <ellipse cx="0" cy={-cfg.headH - 12} rx={cfg.headW + 3} ry="14" fill="#1A0030" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
                <path d={`M${cfg.headW},${-cfg.headH - 6} L${cfg.headW + 10},${-cfg.headH + 10}`} fill="#1A0030" stroke={OUTLINE_COLOR} strokeWidth={2} />
                {/* Scar on left cheek */}
                <line x1={-cfg.headW + 8} y1={-cfg.headH + 6} x2={-cfg.headW + 14} y2={-cfg.headH + 14} stroke="#8B0000" strokeWidth="1.5" opacity="0.6" />
              </g>
            )}
            {cfg.hairStyle === 'bun' && (
              <g>
                {/* Amma - hair bun */}
                <ellipse cx="0" cy={-cfg.headH - 12} rx={cfg.headW + 2} ry="13" fill="#2C1810" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
                <circle cx="0" cy={-cfg.headH - 24} r="10" fill="#2C1810" stroke={OUTLINE_COLOR} strokeWidth={1.5} />
                {/* Flowers in bun */}
                <circle cx="-6" cy={-cfg.headH - 28} r="3" fill="white" />
                <circle cx="4" cy={-cfg.headH - 30} r="2.5" fill="#FFD700" />
                {/* Bindi */}
                <circle cx="0" cy={-cfg.headH - 2} r="3" fill="#FF0000" />
                {/* Sindoor */}
                <line x1="-4" y1={-cfg.headH - 14} x2="4" y2={-cfg.headH - 14} stroke="#FF0000" strokeWidth="2" />
              </g>
            )}
            {cfg.hairStyle === 'crown' && (
              <g>
                {/* Raja - crown + hair */}
                <ellipse cx="0" cy={-cfg.headH - 12} rx={cfg.headW + 2} ry="12" fill="#2C1810" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
                {/* Crown */}
                <path d={`M-20,${-cfg.headH - 18} L-22,${-cfg.headH - 38} L-10,${-cfg.headH - 28} L0,${-cfg.headH - 42} L10,${-cfg.headH - 28} L22,${-cfg.headH - 38} L20,${-cfg.headH - 18} Z`} fill="#FFD700" stroke={OUTLINE_COLOR} strokeWidth={1.5} />
                {/* Crown jewel */}
                <circle cx="0" cy={-cfg.headH - 30} r="4" fill="#FF0000" stroke="#FFD700" strokeWidth="1" />
                {/* Crown base band */}
                <rect x="-20" y={-cfg.headH - 20} width="40" height="5" rx="2" fill="#DAA520" stroke={OUTLINE_COLOR} strokeWidth={1} />
              </g>
            )}
            {cfg.hairStyle === 'ears' && (
              <g>
                {/* Moti - animal ears */}
                <ellipse cx={-cfg.headW + 5} cy={-cfg.headH - 14} rx="8" ry="14" fill={primary} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} transform={`rotate(-15, ${-cfg.headW + 5}, ${-cfg.headH - 14})`} />
                <ellipse cx={cfg.headW - 5} cy={-cfg.headH - 14} rx="8" ry="14" fill={primary} stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} transform={`rotate(15, ${cfg.headW - 5}, ${-cfg.headH - 14})`} />
                {/* Inner ear */}
                <ellipse cx={-cfg.headW + 5} cy={-cfg.headH - 12} rx="4" ry="8" fill="#FFB6C1" transform={`rotate(-15, ${-cfg.headW + 5}, ${-cfg.headH - 12})`} />
                <ellipse cx={cfg.headW - 5} cy={-cfg.headH - 12} rx="4" ry="8" fill="#FFB6C1" transform={`rotate(15, ${cfg.headW - 5}, ${-cfg.headH - 12})`} />
              </g>
            )}

            {/* === EYES === */}
            {blink ? (
              <>
                <line x1="-14" y1={-cfg.headH - 2} x2="-4" y2={-cfg.headH - 2} stroke={OUTLINE_COLOR} strokeWidth="2.5" strokeLinecap="round" />
                <line x1="4" y1={-cfg.headH - 2} x2="14" y2={-cfg.headH - 2} stroke={OUTLINE_COLOR} strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Left eye */}
                <ellipse cx="-9" cy={-cfg.headH - 2}
                  rx={exprData.eyeShape === 'wide' ? 8 : exprData.eyeShape === 'narrow' ? 5 : exprData.eyeShape === 'squint' ? 6 : 7}
                  ry={exprData.eyeShape === 'wide' ? 9 : exprData.eyeShape === 'narrow' ? 4 : exprData.eyeShape === 'squint' ? 4 : 7}
                  fill="white" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH}
                />
                <circle cx={-9 + pupilDriftX} cy={-cfg.headH - 1 + pupilDriftY} r={3 + exprData.pupilSize * 3} fill={characterId === 'kaaliya' ? '#8B0000' : '#2A1A0A'} />
                <circle cx={-7 + pupilDriftX} cy={-cfg.headH - 3 + pupilDriftY} r="2" fill="white" />

                {/* Right eye */}
                <ellipse cx="9" cy={-cfg.headH - 2}
                  rx={exprData.eyeShape === 'wide' ? 8 : exprData.eyeShape === 'narrow' ? 5 : exprData.eyeShape === 'squint' ? 6 : 7}
                  ry={exprData.eyeShape === 'wide' ? 9 : exprData.eyeShape === 'narrow' ? 4 : exprData.eyeShape === 'squint' ? 4 : 7}
                  fill="white" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH}
                />
                <circle cx={9 + pupilDriftX} cy={-cfg.headH - 1 + pupilDriftY} r={3 + exprData.pupilSize * 3} fill={characterId === 'kaaliya' ? '#8B0000' : '#2A1A0A'} />
                <circle cx={11 + pupilDriftX} cy={-cfg.headH - 3 + pupilDriftY} r="2" fill="white" />
              </>
            )}

            {/* Eyebrows */}
            <line
              x1="-16" y1={-cfg.headH - 10 + exprData.eyebrowAngle * 0.2}
              x2="-4" y2={-cfg.headH - 10 - exprData.eyebrowAngle * 0.2}
              stroke={OUTLINE_COLOR} strokeWidth="3" strokeLinecap="round"
            />
            <line
              x1="4" y1={-cfg.headH - 10 - exprData.eyebrowAngle * 0.2}
              x2="16" y2={-cfg.headH - 10 + exprData.eyebrowAngle * 0.2}
              stroke={OUTLINE_COLOR} strokeWidth="3" strokeLinecap="round"
            />

            {/* Nose */}
            <path d={`M-1,${-cfg.headH + 8} Q0,${-cfg.headH + 12} 3,${-cfg.headH + 8}`} fill="none" stroke={skinDark} strokeWidth="1.5" />

            {/* Mouth */}
            {mouth.shape === 'ellipse' ? (
              <ellipse cx="0" cy={-cfg.headH + 16} rx={mouth.width / 2} ry={mouth.height / 2}
                fill={mouth.openness > 0.3 ? '#8B0000' : skin} stroke={OUTLINE_COLOR} strokeWidth={1.5} />
            ) : mouth.shape === 'circle' ? (
              <circle cx="0" cy={-cfg.headH + 16} r={mouth.width / 2}
                fill="#8B0000" stroke={OUTLINE_COLOR} strokeWidth={1.5} />
            ) : (
              <path
                d={expression === 'happy'
                  ? `M${-mouth.width / 2},${-cfg.headH + 15} Q0,${-cfg.headH + 20} ${mouth.width / 2},${-cfg.headH + 15}`
                  : expression === 'sad'
                    ? `M${-mouth.width / 2},${-cfg.headH + 18} Q0,${-cfg.headH + 14} ${mouth.width / 2},${-cfg.headH + 18}`
                    : `M${-mouth.width / 2},${-cfg.headH + 16} L${mouth.width / 2},${-cfg.headH + 16}`
                }
                fill="none" stroke={OUTLINE_COLOR} strokeWidth="2.5" strokeLinecap="round"
              />
            )}
            {mouth.teethVisible && (
              <rect x="-5" y={-cfg.headH + 13} width="10" height="4" rx="1" fill="white" stroke="#ddd" strokeWidth="0.5" />
            )}

            {/* Anime effects */}
            {expression === 'angry' && characterId === 'kaaliya' && (
              <g transform={`translate(${cfg.headW - 4}, ${-cfg.headH - 16})`}>
                <line x1="-3" y1="0" x2="3" y2="0" stroke="#FF0000" strokeWidth="2" />
                <line x1="0" y1="-3" x2="0" y2="3" stroke="#FF0000" strokeWidth="2" />
              </g>
            )}
            {expression === 'scared' && (
              <>
                <line x1={cfg.headW + 4} y1={-cfg.headH - 8} x2={cfg.headW + 8} y2={-cfg.headH - 12} stroke="#4FC3F7" strokeWidth="1.5" />
                <line x1={cfg.headW + 6} y1={-cfg.headH - 4} x2={cfg.headW + 10} y2={-cfg.headH - 6} stroke="#4FC3F7" strokeWidth="1" />
              </>
            )}
          </g>

          {/* Rudraksha necklace for Guruji */}
          {characterId === 'guruji' && (
            <path d={`M-12,2 Q0,12 12,2`} fill="none" stroke="#8B4513" strokeWidth="2" strokeDasharray="4 3" />
          )}

          {/* Bangles for Amma */}
          {characterId === 'amma' && (
            <>
              <circle cx={-cfg.bodyW / 2 - 5} cy="30" r="7" fill="none" stroke="#FFD700" strokeWidth="1.5" />
              <circle cx={-cfg.bodyW / 2 - 5} cy="33" r="7" fill="none" stroke="#FFD700" strokeWidth="1.5" />
            </>
          )}
        </g>

        {/* Moti tail */}
        {characterId === 'moti' && (
          <path
            d={`M15,35 Q25,${25 + Math.sin(frame * 0.1) * 8} 20,${15 + Math.sin(frame * 0.1) * 5}`}
            fill="none" stroke={primary} strokeWidth="4" strokeLinecap="round"
          />
        )}

        {/* Arjun scarf (animated) */}
        {characterId === 'arjun' && (
          <path
            d={`M15,${5 + breathe} Q${25 + Math.sin(frame * 0.05) * 5},${15 + breathe} ${20 + Math.sin(frame * 0.04) * 8},${30 + breathe}`}
            fill="none" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" opacity="0.8"
          />
        )}
      </svg>
    </div>
  );
};

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xFF) + (255 - ((num >> 16) & 0xFF)) * amount);
  const g = Math.min(255, ((num >> 8) & 0xFF) + (255 - ((num >> 8) & 0xFF)) * amount);
  const b = Math.min(255, (num & 0xFF) + (255 - (num & 0xFF)) * amount);
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xFF) * (1 - amount));
  const g = Math.max(0, ((num >> 8) & 0xFF) * (1 - amount));
  const b = Math.max(0, (num & 0xFF) * (1 - amount));
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}
