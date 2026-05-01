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

const RiverBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    <defs><linearGradient id="sky-r" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={palette.sky[0]} /><stop offset="100%" stopColor={palette.sky[2]} /></linearGradient></defs>
    <rect width="1920" height="1080" fill="url(#sky-r)" />
    {/* Far hills */}
    <g transform={`translate(${offset * 0.1}, 0)`}>
      <polygon points="0,650 400,400 800,650" fill="#6B8E6B" opacity="0.4" />
      <polygon points="600,650 1100,350 1600,650" fill="#5A7A5A" opacity="0.3" />
      <polygon points="1200,650 1700,420 1920,650" fill="#6B8E6B" opacity="0.4" />
    </g>
    {/* River banks */}
    <rect y="700" width="1920" height="380" fill={palette.ground} />
    {/* River water */}
    <path d="M0,720 Q480,700 960,730 Q1440,760 1920,720 L1920,820 Q1440,840 960,810 Q480,780 0,820 Z" fill="#4169E1" opacity="0.7" />
    <path d="M0,740 Q480,720 960,750 Q1440,780 1920,740" fill="none" stroke="#87CEEB" strokeWidth="2" opacity="0.5" />
    <path d="M200,755 Q480,735 760,765" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
    {/* Reeds on banks */}
    {[100, 250, 400, 1500, 1650, 1800].map((x, i) => (
      <g key={i} transform={`translate(${x + offset * 0.4}, 0)`}>
        <line x1="0" y1="710" x2="-5" y2="660" stroke="#228B22" strokeWidth="3" />
        <line x1="8" y1="712" x2="12" y2="655" stroke="#1B7A1B" strokeWidth="2" />
        <ellipse cx="10" cy="650" rx="6" ry="10" fill="#2E8B2E" />
      </g>
    ))}
    {/* Stepping stones */}
    {[600, 750, 920, 1100].map((x, i) => (
      <ellipse key={i} cx={x} cy={770 + (i % 2) * 10} rx="30" ry="12" fill="#808080" stroke="#666" strokeWidth="1" />
    ))}
    {/* Trees on far bank */}
    <g transform={`translate(${offset * 0.3}, 0)`}>
      {[300, 700, 1200, 1600].map((x, i) => (
        <g key={i}><rect x={x - 6} y="580" width="12" height="120" rx="4" fill="#8B4513" /><circle cx={x} cy="560" r="50" fill="#228B22" /><circle cx={x - 20} cy="575" r="35" fill="#2E8B2E" /></g>
      ))}
    </g>
  </g>
);

const MarketBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    <defs><linearGradient id="sky-m" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={palette.sky[0]} /><stop offset="100%" stopColor={palette.sky[2]} /></linearGradient></defs>
    <rect width="1920" height="1080" fill="url(#sky-m)" />
    {/* Ground — stone road */}
    <rect y="750" width="1920" height="330" fill="#C4A46C" />
    <rect y="750" width="1920" height="5" fill="#B89A5F" />
    {/* Market stalls */}
    <g transform={`translate(${offset * 0.3}, 0)`}>
      {[200, 600, 1000, 1400, 1800].map((x, i) => {
        const colors = ['#FF4500', '#4169E1', '#32CD32', '#FFD700', '#FF69B4'];
        return (
          <g key={i}>
            {/* Stall frame */}
            <rect x={x - 60} y="580" width="120" height="170" rx="4" fill="#DEB887" stroke="#8B4513" strokeWidth="2" />
            {/* Awning */}
            <polygon points={`${x - 70},580 ${x + 70},580 ${x + 65},560 ${x - 65},560`} fill={colors[i % colors.length]} />
            <polygon points={`${x - 70},580 ${x + 70},580 ${x + 65},560 ${x - 65},560`} fill="white" opacity="0.15" />
            {/* Goods (circles = pots/fruits) */}
            <circle cx={x - 25} cy="700" r="12" fill="#FF6347" /><circle cx={x} cy="695" r="14" fill="#FFD700" /><circle cx={x + 25} cy="700" r="11" fill="#32CD32" />
            {/* Basket */}
            <ellipse cx={x - 30} cy="730" rx="20" ry="10" fill="#8B4513" /><ellipse cx={x + 30} cy="735" rx="18" ry="8" fill="#A0522D" />
          </g>
        );
      })}
    </g>
    {/* Crowd silhouettes (far) */}
    <g transform={`translate(${offset * 0.2}, 0)`} opacity="0.15">
      {[150, 350, 550, 850, 1050, 1250, 1450, 1650].map((x, i) => (
        <g key={i}><ellipse cx={x} cy="710" rx="12" ry="14" fill="#333" /><rect x={x - 10} y="724" width="20" height="30" rx="6" fill="#333" /></g>
      ))}
    </g>
  </g>
);

const TempleBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    <defs><linearGradient id="sky-t" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={palette.sky[0]} /><stop offset="100%" stopColor={palette.sky[2]} /></linearGradient></defs>
    <rect width="1920" height="1080" fill="url(#sky-t)" />
    <rect y="750" width="1920" height="330" fill="#D2B48C" />
    {/* Temple structure */}
    <g transform={`translate(${960 + offset * 0.2}, 300)`}>
      {/* Base */}
      <rect x="-200" y="200" width="400" height="250" rx="4" fill="#F5DEB3" stroke="#DAA520" strokeWidth="3" />
      {/* Gopuram / tower */}
      <polygon points="-120,200 0,40 120,200" fill="#DAA520" stroke="#B8860B" strokeWidth="2" />
      <polygon points="-80,200 0,80 80,200" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
      {/* Door */}
      <rect x="-30" y="350" width="60" height="100" rx="30" fill="#654321" />
      {/* Pillars */}
      <rect x="-160" y="220" width="16" height="230" fill="#F5DEB3" stroke="#DAA520" strokeWidth="1" />
      <rect x="144" y="220" width="16" height="230" fill="#F5DEB3" stroke="#DAA520" strokeWidth="1" />
      {/* Bell */}
      <circle cx="0" cy="190" r="8" fill="#DAA520" /><line x1="0" y1="182" x2="0" y2="170" stroke="#DAA520" strokeWidth="2" />
      {/* Flags */}
      <polygon points="-200,200 -200,170 -170,185" fill="#FF4500" />
      <polygon points="200,200 200,170 170,185" fill="#FF4500" />
    </g>
    {/* Oil lamps */}
    {[300, 700, 1200, 1600].map((x, i) => (
      <g key={i}><ellipse cx={x} cy="740" rx="8" ry="4" fill="#DAA520" /><circle cx={x} cy="732" r="4" fill="#FF6347" opacity="0.8" /></g>
    ))}
  </g>
);

const CaveBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    <rect width="1920" height="1080" fill="#1A1A2E" />
    {/* Cave ceiling arch */}
    <path d="M0,0 L0,500 Q960,100 1920,500 L1920,0 Z" fill="#2C2C3E" />
    {/* Stalactites */}
    {[200, 400, 650, 900, 1100, 1350, 1550, 1750].map((x, i) => (
      <polygon key={i} points={`${x - 8},${150 + (i % 3) * 40} ${x},${220 + (i % 4) * 50} ${x + 8},${150 + (i % 3) * 40}`} fill="#3D3D50" />
    ))}
    {/* Cave floor */}
    <path d="M0,780 Q480,760 960,790 Q1440,810 1920,770 L1920,1080 L0,1080 Z" fill="#3D3D3D" />
    {/* Rocks */}
    {[150, 500, 900, 1300, 1700].map((x, i) => (
      <ellipse key={i} cx={x} cy={790 + (i % 2) * 15} rx={30 + (i % 3) * 10} ry={15 + (i % 2) * 8} fill="#4A4A5A" />
    ))}
    {/* Torch glow */}
    <circle cx="300" cy="500" r="150" fill="#FF6B00" opacity="0.08" />
    <circle cx="1600" cy="500" r="150" fill="#FF6B00" opacity="0.08" />
    {/* Dripping water */}
    <circle cx={700} cy={350} r="2" fill="#87CEEB" opacity="0.6" />
    <circle cx={1200} cy={280} r="2" fill="#87CEEB" opacity="0.6" />
  </g>
);

const MountainBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    <defs><linearGradient id="sky-mt" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={palette.sky[0]} /><stop offset="100%" stopColor={palette.sky[2]} /></linearGradient></defs>
    <rect width="1920" height="1080" fill="url(#sky-mt)" />
    {/* Snow-capped mountains */}
    <g transform={`translate(${offset * 0.1}, 0)`}>
      <polygon points="100,700 500,200 900,700" fill="#556B2F" />
      <polygon points="450,250 500,200 550,250" fill="white" opacity="0.8" />
      <polygon points="700,700 1200,150 1700,700" fill="#4A6E3A" />
      <polygon points="1130,200 1200,150 1270,200" fill="white" opacity="0.9" />
      <polygon points="1400,700 1750,300 1920,700" fill="#556B2F" opacity="0.8" />
    </g>
    {/* Grassy slope */}
    <path d="M0,750 Q480,720 960,740 Q1440,760 1920,730 L1920,1080 L0,1080 Z" fill={palette.ground} />
    {/* Rocky path */}
    <path d="M800,780 Q960,770 1120,790" fill="none" stroke="#8B7355" strokeWidth="8" strokeLinecap="round" />
    {/* Small bushes */}
    {[200, 600, 1000, 1400, 1800].map((x, i) => (
      <ellipse key={i} cx={x + offset * 0.4} cy={755 + (i % 2) * 10} rx="35" ry="20" fill="#2E8B2E" opacity="0.7" />
    ))}
    {/* Eagle silhouette */}
    <path d={`M${960 + offset * 0.5},200 Q${950 + offset * 0.5},195 ${940 + offset * 0.5},200 Q${950 + offset * 0.5},198 ${960 + offset * 0.5},200`} fill="none" stroke="#333" strokeWidth="2" />
  </g>
);

const GardenBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    <defs><linearGradient id="sky-gd" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={palette.sky[0]} /><stop offset="100%" stopColor={palette.sky[2]} /></linearGradient></defs>
    <rect width="1920" height="1080" fill="url(#sky-gd)" />
    <rect y="720" width="1920" height="360" fill="#32CD32" />
    {/* Hedges */}
    <g transform={`translate(${offset * 0.3}, 0)`}>
      {[100, 500, 900, 1300, 1700].map((x, i) => (
        <rect key={i} x={x} y="670" width="120" height="60" rx="30" fill="#228B22" stroke="#1B6B1B" strokeWidth="2" />
      ))}
    </g>
    {/* Fountain center */}
    <g transform={`translate(${960 + offset * 0.1}, 650)`}>
      <ellipse cx="0" cy="30" rx="60" ry="20" fill="#808080" stroke="#666" strokeWidth="2" />
      <rect x="-8" y="-40" width="16" height="70" rx="4" fill="#A0A0A0" />
      <circle cx="0" cy="-45" r="12" fill="#87CEEB" opacity="0.6" />
      <path d="M0,-45 Q-8,-60 -15,-50" fill="none" stroke="#87CEEB" strokeWidth="2" opacity="0.5" />
      <path d="M0,-45 Q8,-60 15,-50" fill="none" stroke="#87CEEB" strokeWidth="2" opacity="0.5" />
    </g>
    {/* Flower beds */}
    {[200, 400, 1400, 1600].map((x, i) => (
      <g key={i}>{[0, 15, 30, -10, 20].map((dx, j) => (
        <circle key={j} cx={x + dx} cy={740 + (j % 3) * 8} r={4 + (j % 2) * 2} fill={['#FF69B4', '#FF4500', '#FFD700', '#FF1493', '#FFA500'][j % 5]} />
      ))}</g>
    ))}
    {/* Butterflies */}
    <g transform={`translate(${offset * 0.6}, 0)`} opacity="0.6">
      <polygon points="700,400 710,390 710,410" fill="#FF69B4" /><polygon points="700,400 690,390 690,410" fill="#FFD700" />
    </g>
  </g>
);

const BeachBackground: React.FC<{ palette: typeof TIME_PALETTES.day; offset: number }> = ({ palette, offset }) => (
  <g>
    <defs><linearGradient id="sky-b" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={palette.sky[0]} /><stop offset="100%" stopColor={palette.sky[2]} /></linearGradient></defs>
    <rect width="1920" height="1080" fill="url(#sky-b)" />
    {/* Ocean */}
    <rect y="550" width="1920" height="200" fill="#006994" opacity="0.8" />
    <path d="M0,580 Q240,560 480,580 Q720,600 960,580 Q1200,560 1440,580 Q1680,600 1920,580" fill="none" stroke="#87CEEB" strokeWidth="2" opacity="0.5" />
    <path d="M0,620 Q300,600 600,620 Q900,640 1200,620 Q1500,600 1920,620" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
    {/* Sandy beach */}
    <path d="M0,740 Q480,720 960,735 Q1440,750 1920,730 L1920,1080 L0,1080 Z" fill="#F4E4C1" />
    {/* Palm trees */}
    <g transform={`translate(${offset * 0.4}, 0)`}>
      {[300, 1500].map((x, i) => (
        <g key={i}>
          <path d={`M${x},740 Q${x + 5},600 ${x - 10},500`} fill="none" stroke="#8B4513" strokeWidth="10" strokeLinecap="round" />
          <ellipse cx={x - 30} cy="490" rx="50" ry="15" fill="#228B22" transform={`rotate(-20, ${x - 30}, 490)`} />
          <ellipse cx={x + 20} cy="485" rx="45" ry="12" fill="#2E8B2E" transform={`rotate(15, ${x + 20}, 485)`} />
          <ellipse cx={x - 10} cy="480" rx="40" ry="10" fill="#32CD32" transform={`rotate(-5, ${x - 10}, 480)`} />
        </g>
      ))}
    </g>
    {/* Shells */}
    {[500, 800, 1100, 1300].map((x, i) => (
      <ellipse key={i} cx={x} cy={760 + (i % 2) * 10} rx="6" ry="4" fill="#FFF8DC" stroke="#DEB887" strokeWidth="1" />
    ))}
    {/* Coconut */}
    <circle cx="320" cy="510" r="8" fill="#8B4513" /><circle cx="340" cy="515" r="7" fill="#A0522D" />
  </g>
);

function renderGenericBackground(locationType: string, palette: typeof TIME_PALETTES.day, offset: number): React.ReactElement {
  return (
    <g>
      <defs><linearGradient id="sky-g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={palette.sky[0]} /><stop offset="100%" stopColor={palette.sky[2]} /></linearGradient></defs>
      <rect width="1920" height="1080" fill="url(#sky-g)" />
      <rect y="700" width="1920" height="380" fill={palette.ground} />
      {/* Generic nature elements instead of text label */}
      {[200, 600, 1000, 1400, 1800].map((x, i) => (
        <g key={i}><rect x={x - 5} y="580" width="10" height="120" rx="3" fill="#8B4513" /><circle cx={x} cy="560" r="40" fill="#228B22" opacity="0.7" /></g>
      ))}
      <path d="M0,780 Q960,760 1920,780" fill="none" stroke="#8B7355" strokeWidth="4" />
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
    river: <RiverBackground palette={palette} offset={offset} />,
    market: <MarketBackground palette={palette} offset={offset} />,
    temple: <TempleBackground palette={palette} offset={offset} />,
    cave: <CaveBackground palette={palette} offset={offset} />,
    mountain: <MountainBackground palette={palette} offset={offset} />,
    garden: <GardenBackground palette={palette} offset={offset} />,
    beach: <BeachBackground palette={palette} offset={offset} />,
  };

  const bg = backgroundMap[locationType] ?? renderGenericBackground(locationType, palette, offset);

  // Time-of-day color wash
  const TIME_WASH: Record<string, string> = {
    dawn: 'rgba(255,180,120,0.06)', day: 'rgba(255,255,240,0.03)',
    dusk: 'rgba(255,120,50,0.08)', night: 'rgba(30,50,120,0.1)',
  };

  // Drifting clouds (outdoor scenes only)
  const clouds = locationType !== 'cave' ? [
    { cx: 300, cy: 120, rx: 90, ry: 30 },
    { cx: 800, cy: 80, rx: 120, ry: 35 },
    { cx: 1400, cy: 150, rx: 100, ry: 28 },
  ] : [];

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {bg}

      {/* Clouds */}
      {clouds.map((cloud, i) => {
        const drift = (frame * 0.15 + i * 500) % 2200 - 200;
        return (
          <g key={i} transform={`translate(${drift}, 0)`} opacity={timeOfDay === 'night' ? 0.12 : 0.4}>
            <ellipse cx={cloud.cx} cy={cloud.cy} rx={cloud.rx} ry={cloud.ry} fill="white" />
            <ellipse cx={cloud.cx - cloud.rx * 0.5} cy={cloud.cy + 5} rx={cloud.rx * 0.6} ry={cloud.ry * 0.7} fill="white" />
            <ellipse cx={cloud.cx + cloud.rx * 0.4} cy={cloud.cy + 3} rx={cloud.rx * 0.7} ry={cloud.ry * 0.8} fill="white" />
          </g>
        );
      })}

      {/* Sun/Moon */}
      {timeOfDay === 'day' && (
        <g><circle cx="1600" cy="150" r="45" fill="#FFF176" opacity="0.7" /><circle cx="1600" cy="150" r="120" fill="#FFD700" opacity="0.06" /></g>
      )}
      {timeOfDay === 'night' && (
        <g>
          <circle cx="300" cy="120" r="35" fill="#F0F0FF" opacity="0.8" />
          <circle cx="300" cy="120" r="100" fill="rgba(200,220,255,0.08)" />
          {Array.from({ length: 20 }, (_, i) => (
            <circle key={i} cx={(i * 97) % 1920} cy={30 + (i * 43) % 300} r={0.8 + (i % 3) * 0.5}
              fill="white" opacity={0.3 + Math.sin(frame * 0.08 + i) * 0.15} />
          ))}
        </g>
      )}

      {/* Time-of-day color wash */}
      <rect width="1920" height="1080" fill={TIME_WASH[timeOfDay] ?? TIME_WASH.day} />

      {/* Vignette — darkens corners for cinematic feel */}
      <defs>
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="70%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#vignette)" />
    </svg>
  );
};
