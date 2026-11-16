import React from "react";
import { AbsoluteFill } from "remotion";
import { Fort } from "../components/Buildings";
import { Fog, Hills, Stars } from "../components/Scenery";
import { POSES, SharedDefs, Stickman } from "../components/Stickman";

/** The channel mascot: the ghost of a king (history + ghost in one character). */
const GhostKing: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g>
    <circle cx={x} cy={y - 150 * scale} r={210 * scale} fill="url(#ghostHalo)" />
    <Stickman
      x={x}
      y={y}
      scale={scale}
      ghost
      color="#dff6ff"
      pose={{ ...POSES.shock, ls: -118, le: -30, rs: 118, re: 30, head: -4 }}
      eyes="glow"
      mouth="o"
      outfit={{ head: "crown", mustache: true }}
      seed={1}
    />
  </g>
);

const BrandDefs: React.FC = () => (
  <defs>
    <radialGradient id="brandSky" cx="0.5" cy="0.35" r="0.8">
      <stop offset="0" stopColor="#4a1c6b" />
      <stop offset="0.55" stopColor="#1c0b2e" />
      <stop offset="1" stopColor="#07030d" />
    </radialGradient>
    <radialGradient id="ghostHalo">
      <stop offset="0" stopColor="#9fe3ff" stopOpacity={0.45} />
      <stop offset="1" stopColor="#9fe3ff" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="bloodMoon">
      <stop offset="0" stopColor="#ffb36b" />
      <stop offset="0.7" stopColor="#ff6a2b" />
      <stop offset="1" stopColor="#c2321a" />
    </radialGradient>
    <radialGradient id="bloodMoonGlow">
      <stop offset="0.4" stopColor="#ff6a2b" stopOpacity={0.55} />
      <stop offset="1" stopColor="#ff6a2b" stopOpacity={0} />
    </radialGradient>
  </defs>
);

const BloodMoon: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.9} fill="url(#bloodMoonGlow)" />
    <circle cx={x} cy={y} r={r} fill="url(#bloodMoon)" />
    <circle cx={x - r * 0.3} cy={y - r * 0.25} r={r * 0.16} fill="#000" opacity={0.1} />
    <circle cx={x + r * 0.32} cy={y + r * 0.22} r={r * 0.22} fill="#000" opacity={0.09} />
  </g>
);

/** 800×800 profile picture — circle-safe, no text so it reads at tiny sizes. */
export const LogoAvatar: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07030d" }}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <SharedDefs />
      <BrandDefs />
      <rect width={800} height={800} fill="url(#brandSky)" />
      <g transform="scale(0.74)">
        <Stars count={40} maxY={700} />
      </g>
      <BloodMoon x={400} y={330} r={250} />
      <GhostKing x={400} y={800} scale={2.15} />
      <Fort x={400} y={905} scale={0.62} fill="#07050b" line="#1a1424" glow={0.9} temple={false} />
      <g transform="translate(0,-10)">
        <Fog y={790} count={4} opacity={0.5} />
      </g>
    </svg>
  </AbsoluteFill>
);

/** 1200×1200 full logo with the channel name (social posts, watermark, intro card). */
export const LogoFull: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07030d" }}>
    <svg width={1200} height={1200} viewBox="0 0 1200 1200">
      <SharedDefs />
      <BrandDefs />
      <rect width={1200} height={1200} fill="url(#brandSky)" />
      <Stars count={60} maxY={800} />
      <BloodMoon x={600} y={330} r={240} />
      <GhostKing x={600} y={880} scale={1.95} />
      <Fort x={600} y={880} scale={0.6} fill="#07050b" line="#1a1424" glow={0.9} temple />
      <Fog y={790} count={5} opacity={0.5} />
      <rect x={0} y={800} width={1200} height={400} fill="#07030d" opacity={0.86} />
      <text x={600} y={905} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={96} fill="#ffffff" stroke="#000" strokeWidth={10} paintOrder="stroke" letterSpacing={4}>
        ITIHAAS KE
      </text>
      <text x={600} y={1060} textAnchor="middle" fontFamily="Creepster" fontSize={190} fill="#ff2e2e" stroke="#000" strokeWidth={12} paintOrder="stroke" letterSpacing={10}>
        BHOOT
      </text>
      <text x={600} y={1140} textAnchor="middle" fontFamily="Hind" fontWeight={700} fontSize={54} fill="#ffd84d">
        इतिहास के भूत
      </text>
    </svg>
  </AbsoluteFill>
);

/** 2560×1440 YouTube banner. Key content sits inside the 1546×423 safe area in the middle. */
export const Banner: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07030d" }}>
    <svg width={2560} height={1440} viewBox="0 0 2560 1440">
      <SharedDefs />
      <BrandDefs />
      <rect width={2560} height={1440} fill="url(#brandSky)" />
      <g transform="scale(2.37,0.75)">
        <Stars count={90} maxY={1900} />
      </g>
      <BloodMoon x={1880} y={560} r={150} />
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${i * 1280},420) scale(1.19,0.8)`}>
          <Hills y={1020} colors={["#2a1440", "#1c0d2e", "#12081f"]} />
        </g>
      ))}
      <Fort x={360} y={1060} scale={0.62} fill="#07050b" line="#1a1424" glow={0.8} />
      <Fort x={2220} y={1060} scale={0.55} fill="#07050b" line="#1a1424" glow={0.8} ruined />
      <rect x={0} y={1040} width={2560} height={400} fill="#07030d" />
      <g transform="scale(2.37,1)">
        <Fog y={1020} count={8} opacity={0.4} />
      </g>
      <GhostKing x={830} y={835} scale={1.05} />
      <text x={1430} y={650} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={92} fill="#ffffff" stroke="#000" strokeWidth={10} paintOrder="stroke" letterSpacing={4}>
        ITIHAAS KE
      </text>
      <text x={1430} y={800} textAnchor="middle" fontFamily="Creepster" fontSize={180} fill="#ff2e2e" stroke="#000" strokeWidth={12} paintOrder="stroke" letterSpacing={10}>
        BHOOT
      </text>
      <text x={1430} y={878} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={42} fill="#ffd84d" letterSpacing={3}>
        ITIHAAS KE RAAZ • BHOOTON KI KAHANIYAN
      </text>
    </svg>
  </AbsoluteFill>
);
