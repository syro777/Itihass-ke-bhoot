import React from "react";
import { random, useCurrentFrame } from "remotion";

/** Layered sand dunes. */
export const Dunes: React.FC<{ y: number; colors: [string, string, string]; drift?: number }> = ({ y, colors, drift = 0 }) => (
  <g>
    <path transform={`translate(${-drift * 0.3},0)`} d={`M -300 ${y} L -300 ${y - 120} Q -40 ${y - 230} 260 ${y - 130} Q 520 ${y - 50} 760 ${y - 190} Q 980 ${y - 300} 1400 ${y - 140} L 1400 ${y} Z`} fill={colors[0]} />
    <path transform={`translate(${-drift * 0.6},0)`} d={`M -300 ${y + 80} L -300 ${y - 40} Q 100 ${y - 160} 420 ${y - 40} Q 700 ${y + 40} 1000 ${y - 90} Q 1200 ${y - 150} 1400 ${y - 50} L 1400 ${y + 80} Z`} fill={colors[1]} />
    <path transform={`translate(${-drift},0)`} d={`M -300 ${y + 200} L -300 ${y + 40} Q 200 ${y - 40} 560 ${y + 40} Q 860 ${y + 100} 1400 ${y + 10} L 1400 ${y + 200} Z`} fill={colors[2]} />
  </g>
);

const arch = (cx: number, by: number, w: number, h: number) =>
  `M ${cx - w / 2} ${by} L ${cx - w / 2} ${by - h + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${cx + w / 2} ${by - h + w / 2} L ${cx + w / 2} ${by} Z`;

/** A row of intact sandstone village houses (flat roofs, parapets). */
export const VillageHouses: React.FC<{ y: number; scale?: number; fill?: string; line?: string; lit?: number; seed?: string; x0?: number; x1?: number }> = ({
  y,
  scale = 1,
  fill = "#c99558",
  line = "#6e4626",
  lit = 0,
  seed = "v",
  x0 = -60,
  x1 = 1140,
}) => {
  const frame = useCurrentFrame();
  const out = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const w = (110 + random(`${seed}w${i}`) * 70) * scale;
    const h = (110 + random(`${seed}h${i}`) * 70) * scale;
    const two = random(`${seed}t${i}`) > 0.55;
    const flick = 0.7 + 0.3 * Math.sin(frame / 4 + i * 1.7);
    out.push(
      <g key={i}>
        {two && <rect x={x + w * 0.15} y={y - h - 60 * scale} width={w * 0.55} height={64 * scale} fill={fill} stroke={line} strokeWidth={3} />}
        <rect x={x} y={y - h} width={w} height={h} fill={fill} stroke={line} strokeWidth={3} />
        <rect x={x - 6 * scale} y={y - h - 12 * scale} width={w + 12 * scale} height={14 * scale} fill={fill} stroke={line} strokeWidth={3} />
        <path d={arch(x + w * 0.3, y, w * 0.24, h * 0.55)} fill="#2a180c" />
        <rect x={x + w * 0.58} y={y - h * 0.7} width={w * 0.2} height={w * 0.2} fill={lit > 0 ? `rgba(255,170,60,${lit * flick})` : "#3a2414"} stroke={line} strokeWidth={2} />
        {lit > 0 && <circle cx={x + w * 0.68} cy={y - h * 0.6} r={60 * scale} fill="url(#lantern)" opacity={0.35 * lit * flick} />}
      </g>,
    );
    x += w + 10 * scale;
    i++;
  }
  return <g>{out}</g>;
};

/** Side view of a stone well; dry adds cracked earth around it. */
export const Well: React.FC<{ x: number; y: number; scale?: number; dry?: boolean }> = ({ x, y, scale = 1, dry = false }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {dry && (
      <g stroke="#5a3a1c" strokeWidth={5} fill="none" strokeLinecap="round">
        <path d="M -260 30 L -190 10 L -150 40 L -90 20" />
        <path d="M 260 30 L 200 8 L 150 38 L 100 18" />
        <path d="M -40 40 L 0 22 L 40 44" />
      </g>
    )}
    <rect x={-120} y={-150} width={10} height={150} fill="#6b4a2b" />
    <rect x={110} y={-150} width={10} height={150} fill="#6b4a2b" />
    <rect x={-130} y={-160} width={260} height={14} rx={6} fill="#7a5533" />
    <circle cx={0} cy={-150} r={16} fill="#3a2a1a" />
    <line x1={0} y1={-140} x2={0} y2={-70} stroke="#3a2a1a" strokeWidth={3} />
    <path d="M -16 -70 L 16 -70 L 12 -44 L -12 -44 Z" fill="#8a6a46" stroke="#3a2a1a" strokeWidth={3} />
    <rect x={-100} y={-60} width={200} height={70} fill="#b08354" stroke="#5a3a1c" strokeWidth={4} />
    <ellipse cx={0} cy={-60} rx={100} ry={18} fill="#2a1a0c" stroke="#5a3a1c" strokeWidth={4} />
    {[-60, 0, 60].map((bx) => (
      <line key={bx} x1={bx} y1={-42} x2={bx} y2={10} stroke="#5a3a1c" strokeWidth={3} />
    ))}
    <line x1={-100} y1={-25} x2={100} y2={-25} stroke="#5a3a1c" strokeWidth={3} />
  </g>
);

export const Campfire: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const f = useCurrentFrame();
  const fl = (k: number) => Math.sin(f / 2.3 + k) * 8;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <circle cy={-60} r={260} fill="url(#lantern)" opacity={0.75 + 0.15 * Math.sin(f / 3)} />
      <path d={`M -60 0 Q -64 -90 ${-18 + fl(1)} -170 Q -10 -110 0 -90 Q 20 ${-200 + fl(2)} ${30 + fl(3)} -150 Q 60 -90 60 0 Z`} fill="#ff8a1c" />
      <path d={`M -34 0 Q -36 -60 ${-6 + fl(4)} -120 Q 30 -70 34 0 Z`} fill="#ffd56b" />
      <line x1={-80} y1={6} x2={80} y2={-14} stroke="#5a3a1c" strokeWidth={18} strokeLinecap="round" />
      <line x1={-80} y1={-14} x2={80} y2={6} stroke="#6b4a2b" strokeWidth={18} strokeLinecap="round" />
    </g>
  );
};

/** Side-view camel with a walk cycle and optional trade bags. */
export const Camel: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; color?: string; phase?: number; bags?: boolean }> = ({
  x,
  y,
  scale = 1,
  facing = 1,
  color = "#b07a45",
  phase = 0,
  bags = true,
}) => {
  const legs = [-70, -40, 45, 75].map((lx, i) => {
    const a = Math.sin(phase + (i % 2 ? Math.PI : 0)) * 16;
    const rad = (a * Math.PI) / 180;
    return <line key={i} x1={lx} y1={-130} x2={lx + Math.sin(rad) * 130} y2={-130 + Math.cos(rad) * 130} stroke={color} strokeWidth={14} strokeLinecap="round" />;
  });
  return (
    <g transform={`translate(${x},${y}) scale(${facing * scale},${scale})`}>
      {legs}
      <path d="M -110 -150 Q -100 -250 -30 -240 Q 0 -300 40 -240 Q 90 -235 110 -160 Q 60 -120 -100 -125 Z" fill={color} stroke="#5a3a1c" strokeWidth={4} />
      <path d="M 100 -170 Q 150 -190 150 -280 L 175 -300 Q 205 -300 205 -282 L 190 -270 Q 175 -250 168 -200 Q 150 -150 108 -140 Z" fill={color} stroke="#5a3a1c" strokeWidth={4} />
      <circle cx={186} cy={-288} r={4} fill="#2a1a0c" />
      {bags && (
        <g>
          <rect x={-70} y={-215} width={50} height={60} rx={10} fill="#8a3b2b" stroke="#3a1a10" strokeWidth={3} />
          <rect x={20} y={-212} width={50} height={56} rx={10} fill="#3b6b8a" stroke="#10283a" strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

/** Rows of crops that grow with `grow` (0..1). */
export const CropField: React.FC<{ y: number; grow: number; x0?: number; x1?: number }> = ({ y, grow, x0 = 40, x1 = 1040 }) => {
  const f = useCurrentFrame();
  const plants = [];
  let i = 0;
  for (let row = 0; row < 3; row++) {
    for (let x = x0 + row * 22; x < x1; x += 62) {
      const g = Math.max(0, Math.min(1, grow * 1.6 - (x - x0) / (x1 - x0) * 0.6));
      const h = 46 * g * (1 + row * 0.25);
      const sway = Math.sin(f / 8 + i) * 4 * g;
      const by = y + row * 34;
      plants.push(
        <g key={i}>
          <line x1={x} y1={by} x2={x + sway} y2={by - h} stroke="#3f8f3a" strokeWidth={6} strokeLinecap="round" />
          <path d={`M ${x + sway} ${by - h * 0.6} Q ${x + 22} ${by - h * 0.9} ${x + 26 + sway} ${by - h * 0.55}`} stroke="#5bb04f" strokeWidth={6} fill="none" opacity={g} />
          <path d={`M ${x + sway} ${by - h * 0.75} Q ${x - 22} ${by - h * 1.05} ${x - 26 + sway} ${by - h * 0.7}`} stroke="#5bb04f" strokeWidth={6} fill="none" opacity={g} />
        </g>,
      );
      i++;
    }
  }
  return <g>{plants}</g>;
};

/** Gold coins flying from (x0,y0) to (x1,y1), or floating upward when no target. */
export const Coins: React.FC<{ x0: number; y0: number; x1?: number; y1?: number; from: number; count?: number; to?: number }> = ({ x0, y0, x1, y1, from, count = 10, to = 99999 }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 30) return null;
  return (
    <g>
      {new Array(count).fill(0).map((_, i) => {
        const t = (f - from - i * 3) / 22;
        if (t < 0 || t > 1) return null;
        const tx = x1 ?? x0 + (random(`cx${i}`) - 0.5) * 300;
        const ty = y1 ?? y0 - 260 - random(`cy${i}`) * 140;
        const cx = x0 + (tx - x0) * t;
        const cy = y0 + (ty - y0) * t - Math.sin(t * Math.PI) * 140;
        return (
          <g key={i} transform={`translate(${cx},${cy}) scale(${Math.abs(Math.cos(t * 9 + i))},1)`} opacity={x1 === undefined ? 1 - t * 0.6 : 1}>
            <circle r={22} fill="#f2c14e" stroke="#8a5a0a" strokeWidth={4} />
            <circle r={13} fill="none" stroke="#8a5a0a" strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

/** Parchment scroll with a big word on it (e.g. TAX). */
export const Scroll: React.FC<{ x: number; y: number; s: number; text: string; color?: string }> = ({ x, y, s, text, color = "#a3161a" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-150} y={-90} width={300} height={180} fill="#f3e1b6" stroke="#5a3d17" strokeWidth={6} />
    <rect x={-170} y={-100} width={26} height={200} rx={12} fill="#c9a25b" stroke="#5a3d17" strokeWidth={5} />
    <rect x={144} y={-100} width={26} height={200} rx={12} fill="#c9a25b" stroke="#5a3d17" strokeWidth={5} />
    <text y={34} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={96} fill={color}>
      {text}
    </text>
  </g>
);

/** Water drop crossed out (water scarcity icon). */
export const NoWater: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={110} fill="#ffffff" stroke="#111" strokeWidth={8} />
    <path d="M 0 -70 Q 50 -10 50 25 A 50 50 0 0 1 -50 25 Q -50 -10 0 -70 Z" fill="#2f8fe0" stroke="#0d3b66" strokeWidth={5} />
    <circle r={92} fill="none" stroke="#e01b1b" strokeWidth={16} />
    <line x1={-64} y1={64} x2={64} y2={-64} stroke="#e01b1b" strokeWidth={16} />
  </g>
);
