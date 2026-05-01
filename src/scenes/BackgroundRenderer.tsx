import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import type { LocationType, TimeOfDay } from '../types';

interface BackgroundRendererProps {
  locationType: LocationType;
  timeOfDay?: TimeOfDay;
  weather?: string;
  parallaxOffset?: number;
}

const TIME_PALETTES: Record<TimeOfDay, { sky: string[]; ground: string; accent: string }> = {
  dawn: { sky: ['#FF9AA2', '#FFB7B2', '#FFDAC1'], ground: '#4A7C59', accent: '#FFD700' },
  day: { sky: ['#87CEEB', '#B0E0E6', '#E0F7FA'], ground: '#228B22', accent: '#FFD700' },
  dusk: { sky: ['#FF6B35', '#FF8C42', '#FFA07A'], ground: '#2E4600', accent: '#FF4500' },
  night: { sky: ['#0D1B2A', '#1B2838', '#2C3E50'], ground: '#0B3D0B', accent: '#C0C0C0' },
};

const ForestBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    {/* Sky gradient */}
    <defs>
      <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.sky[0]} />
        <stop offset="50%" stopColor={palette.sky[1]} />
        <stop offset="100%" stopColor={palette.sky[2]} />
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#sky)" />

    {/* Far trees (parallax layer 1) */}
    <g transform={`translate(${offset * 0.2}, 0)`}>
      {[100, 300, 500, 700, 900, 1100, 1300, 1500, 1700].map((x, i) => (
        <g key={i}>
          <polygon points={`${x},750 ${x - 40},450 ${x + 40},450`} fill="#1A5E1A" opacity="0.6" />
          <polygon points={`${x},650 ${x - 30},400 ${x + 30},400`} fill="#1A5E1A" opacity="0.5" />
        </g>
      ))}
    </g>

    {/* Mid trees (parallax layer 2) */}
    <g transform={`translate(${offset * 0.5}, 0)`}>
      {[150, 450, 750, 1050, 1350, 1650].map((x, i) => (
        <g key={i}>
          <rect x={x - 8} y="500" width="16" height="280" rx="4" fill="#8B4513" />
          <circle cx={x} cy="480" r="80" fill="#228B22" />
          <circle cx={x - 30} cy="500" r="50" fill="#2E8B2E" />
          <circle cx={x + 35} cy="510" r="55" fill="#1B7A1B" />
        </g>
      ))}
    </g>

    {/* Ground */}
    <rect y="780" width="1920" height="300" fill={palette.ground} />

    {/* Path */}
    <path d="M0,850 Q480,820 960,860 Q1440,900 1920,850" fill="#8B7355" stroke="#6B5B45" strokeWidth="3" />

    {/* Foreground bushes (parallax layer 3) */}
    <g transform={`translate(${offset * 0.8}, 0)`}>
      {[50, 350, 700, 1100, 1500, 1800].map((x, i) => (
        <ellipse key={i} cx={x} cy="800" rx="60" ry="35" fill="#32CD32" opacity="0.8" />
      ))}
    </g>
  </g>
);

const VillageBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    <defs>
      <linearGradient id="sky-v" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.sky[0]} />
        <stop offset="100%" stopColor={palette.sky[2]} />
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#sky-v)" />

    {/* Mountains far */}
    <g transform={`translate(${offset * 0.1}, 0)`}>
      <polygon points="0,700 300,400 600,700" fill="#6B8E6B" opacity="0.4" />
      <polygon points="400,700 800,350 1200,700" fill="#5A7A5A" opacity="0.3" />
      <polygon points="1000,700 1400,380 1920,700" fill="#6B8E6B" opacity="0.4" />
    </g>

    {/* Ground */}
    <rect y="700" width="1920" height="380" fill={palette.ground} />

    {/* Huts */}
    <g transform={`translate(${offset * 0.4}, 0)`}>
      {[300, 800, 1400].map((x, i) => (
        <g key={i}>
          <rect x={x - 50} y="620" width="100" height="80" rx="4" fill="#D2B48C" />
          <polygon points={`${x - 60},620 ${x},560 ${x + 60},620`} fill="#8B4513" />
          <rect x={x - 15} y="660" width="30" height="40" rx="2" fill="#654321" />
        </g>
      ))}
    </g>

    {/* Well */}
    <g transform={`translate(${offset * 0.5}, 0)`}>
      <rect x="560" y="680" width="40" height="20" rx="4" fill="#808080" />
      <line x1="580" y1="660" x2="580" y2="680" stroke="#8B4513" strokeWidth="4" />
      <line x1="570" y1="660" x2="590" y2="660" stroke="#8B4513" strokeWidth="3" />
    </g>

    {/* Road */}
    <path d="M0,780 Q960,760 1920,780" fill="#C4A46C" />
  </g>
);

const PalaceBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    <rect width="1920" height="1080" fill={palette.sky[2]} />
    {/* Grand pillars */}
    <g transform={`translate(${offset * 0.3}, 0)`}>
      {[200, 500, 800, 1120, 1420, 1720].map((x, i) => (
        <g key={i}>
          <rect x={x - 20} y="200" width="40" height="600" fill="#F5DEB3" />
          <rect x={x - 25} y="190" width="50" height="20" rx="4" fill="#DAA520" />
          <rect x={x - 25} y="790" width="50" height="20" rx="4" fill="#DAA520" />
        </g>
      ))}
    </g>
    {/* Floor */}
    <rect y="810" width="1920" height="270" fill="#8B0000" />
    {/* Carpet pattern */}
    <rect x="400" y="810" width="1120" height="270" fill="#B22222" />
    <rect x="420" y="820" width="1080" height="250" fill="none" stroke="#FFD700" strokeWidth="3" />
    {/* Throne */}
    <g transform={`translate(${960 + offset * 0.1}, 500)`}>
      <rect x="-60" y="0" width="120" height="120" rx="10" fill="#DAA520" />
      <rect x="-50" y="-100" width="100" height="100" rx="8" fill="#B22222" />
      <circle cx="0" cy="-120" r="25" fill="#FFD700" />
    </g>
  </g>
);

function renderGenericBackground(locationType: string, palette: typeof TIME_PALETTES.day, offset: number): React.ReactElement {
  // Generic background with sky and ground
  return (
    <g>
      <defs>
        <linearGradient id="sky-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.sky[0]} />
          <stop offset="100%" stopColor={palette.sky[2]} />
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#sky-g)" />
      <rect y="700" width="1920" height="380" fill={palette.ground} />
      <text x="960" y="400" textAnchor="middle" fill={palette.accent} fontSize="32" fontFamily="sans-serif" opacity="0.3">
        {locationType.toUpperCase()}
      </text>
    </g>
  );
}

export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({
  locationType,
  timeOfDay = 'day',
  parallaxOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const palette = TIME_PALETTES[timeOfDay];

  // Gentle automatic drift
  const autoDrift = interpolate(frame, [0, 9000], [0, 30], { extrapolateRight: 'clamp' });
  const offset = parallaxOffset + autoDrift;

  const backgroundMap: Record<string, React.ReactElement> = {
    forest: <ForestBackground palette={palette} offset={offset} />,
    village: <VillageBackground palette={palette} offset={offset} />,
    palace: <PalaceBackground palette={palette} offset={offset} />,
  };

  const bg = backgroundMap[locationType] ?? renderGenericBackground(locationType, palette, offset);

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {bg}
    </svg>
  );
};
