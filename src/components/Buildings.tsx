import React from "react";
import { random, useCurrentFrame } from "remotion";

type FortProps = {
  x: number;
  y: number;
  scale?: number;
  fill?: string;
  line?: string;
  glow?: number; // 0..1 window glow
  build?: number; // 0..1 construction reveal (bottom-up)
  extra?: number; // 0..1 extra floors rising (the "raised palace")
  ruined?: boolean;
  flags?: boolean;
  temple?: boolean;
  hill?: boolean;
};

const arch = (cx: number, by: number, w: number, h: number) =>
  `M ${cx - w / 2} ${by} L ${cx - w / 2} ${by - h + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${cx + w / 2} ${by - h + w / 2} L ${cx + w / 2} ${by} Z`;

const Chhatri: React.FC<{ cx: number; by: number; r: number; fill: string; line: string; broken?: boolean }> = ({ cx, by, r, fill, line, broken }) => (
  <g>
    <rect x={cx - r - 6} y={by - 10} width={2 * r + 12} height={10} fill={fill} stroke={line} strokeWidth={2} />
    {[-0.8, -0.27, 0.27, 0.8].map((k, i) => (
      <rect key={i} x={cx + k * r - 4} y={by - 10 - r * 0.9} width={8} height={r * 0.9} fill={fill} stroke={line} strokeWidth={1.5} />
    ))}
    <rect x={cx - r - 8} y={by - 18 - r * 0.9} width={2 * r + 16} height={10} fill={fill} stroke={line} strokeWidth={2} />
    {broken ? (
      <path d={`M ${cx - r} ${by - 18 - r * 0.9} L ${cx - r * 0.6} ${by - 30 - r * 1.1} L ${cx - r * 0.1} ${by - 22 - r * 0.9} L ${cx + r * 0.4} ${by - 40 - r} L ${cx + r} ${by - 18 - r * 0.9} Z`} fill={fill} stroke={line} strokeWidth={2} />
    ) : (
      <g>
        <path d={`M ${cx - r} ${by - 18 - r * 0.9} A ${r} ${r * 0.95} 0 0 1 ${cx + r} ${by - 18 - r * 0.9} Z`} fill={fill} stroke={line} strokeWidth={2} />
        <line x1={cx} y1={by - 18 - r * 1.85} x2={cx} y2={by - 34 - r * 1.85} stroke={line} strokeWidth={4} />
        <circle cx={cx} cy={by - 36 - r * 1.85} r={5} fill={line} />
      </g>
    )}
  </g>
);

export const Fort: React.FC<FortProps> = ({
  x,
  y,
  scale = 1,
  fill = "#0a0910",
  line = "#1f1b2b",
  glow = 0,
  build = 1,
  extra = 0,
  ruined = false,
  flags = false,
  temple = true,
  hill = true,
}) => {
  const frame = useCurrentFrame();
  const floorH = 70;
  const baseTop = -230;
  const floors = 4;
  const extraH = extra * floorH * 2;
  const top = baseTop - floors * floorH - extraH;
  const clipId = `fortclip${Math.round(x)}${Math.round(y)}`;
  const winFill = (i: number) => {
    if (glow <= 0) return line;
    const f = 0.55 + 0.45 * Math.abs(Math.sin(frame / (7 + (i % 5)) + i * 1.3));
    return `rgba(255,${150 + (i % 3) * 25},60,${glow * f})`;
  };

  const merlons = (x0: number, x1: number, yy: number) => {
    const out = [];
    for (let mx = x0; mx < x1; mx += 30) {
      if (ruined && random(`m${mx}${yy}`) < 0.35) continue;
      out.push(<rect key={mx} x={mx} y={yy - 22} width={18} height={22} fill={fill} stroke={line} strokeWidth={1.5} />);
    }
    return out;
  };

  let wi = 0;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <defs>
        <clipPath id={clipId}>
          <rect x={-700} y={-1100 * build + 160} width={1400} height={1400} />
        </clipPath>
      </defs>
      {hill && <path d="M -560 10 Q -430 -110 -250 -140 L 250 -140 Q 430 -110 560 10 Z" fill={fill} stroke={line} strokeWidth={2} />}
      <g clipPath={`url(#${clipId})`}>
        {/* temple shikhara */}
        {temple && (
          <g>
            <path d="M -470 -110 L -470 -150 Q -470 -300 -420 -360 Q -370 -300 -370 -150 L -370 -110 Z" fill={fill} stroke={line} strokeWidth={2.5} />
            <path d="M -452 -150 Q -450 -290 -420 -340 M -388 -150 Q -390 -290 -420 -340 M -420 -150 L -420 -350" stroke={line} strokeWidth={2} fill="none" />
            <ellipse cx={-420} cy={-366} rx={22} ry={8} fill={fill} stroke={line} strokeWidth={2} />
            {!ruined && <path d="M -420 -374 L -420 -396 M -428 -390 L -412 -390" stroke={line} strokeWidth={4} />}
            {flags && (
              <path d={`M -420 -396 L -420 -440 L ${-380 + Math.sin(frame / 4) * 6} -428 L -420 -416`} fill="#ff7a1a" stroke={line} strokeWidth={2} />
            )}
          </g>
        )}
        {/* outer wall + bastions */}
        <rect x={-300} y={baseTop} width={600} height={100} fill={fill} stroke={line} strokeWidth={2} />
        {merlons(-300, 300, baseTop)}
        {[-300, 300].map((bx) => (
          <g key={bx}>
            <rect x={bx - 36} y={baseTop - 50} width={72} height={150} fill={fill} stroke={line} strokeWidth={2} />
            {!ruined && <path d={`M ${bx - 40} ${baseTop - 50} A 40 34 0 0 1 ${bx + 40} ${baseTop - 50} Z`} fill={fill} stroke={line} strokeWidth={2} />}
          </g>
        ))}
        {/* main gate arch */}
        <path d={arch(0, -130, 70, 90)} fill={glow > 0 ? `rgba(255,170,70,${glow * 0.5})` : line} />

        {/* palace block */}
        <path
          d={
            ruined
              ? `M -150 ${baseTop} L -150 ${top + 40} L -110 ${top + 10} L -60 ${top + 50} L -10 ${top} L 40 ${top + 30} L 90 ${top - 6} L 150 ${top + 36} L 150 ${baseTop} Z`
              : `M -150 ${baseTop} L -150 ${top} L 150 ${top} L 150 ${baseTop} Z`
          }
          fill={fill}
          stroke={line}
          strokeWidth={2.5}
        />
        {new Array(floors + Math.ceil(extra * 2)).fill(0).map((_, f) => {
          const fy = baseTop - f * floorH;
          if (fy - floorH < top - 1) return null;
          return (
            <g key={f}>
              <line x1={-150} y1={fy} x2={150} y2={fy} stroke={line} strokeWidth={2} />
              {[-105, -52, 0, 52, 105].map((wx) => {
                wi++;
                if (ruined && random(`w${f}${wx}`) < 0.3) return null;
                return <path key={wx} d={arch(wx, fy - 12, 24, 44)} fill={winFill(wi)} />;
              })}
            </g>
          );
        })}
        {/* rooftop chhatris */}
        <Chhatri cx={-128} by={top} r={28} fill={fill} line={line} broken={ruined} />
        <Chhatri cx={128} by={top} r={28} fill={fill} line={line} broken={ruined} />
        <Chhatri cx={0} by={top} r={44} fill={fill} line={line} broken={ruined} />
        {flags && !ruined && (
          <g>
            <line x1={0} y1={top - 130} x2={0} y2={top - 210} stroke={line} strokeWidth={5} />
            <path d={`M 0 ${top - 210} Q ${36} ${top - 200 + Math.sin(frame / 5) * 8} ${74} ${top - 196} L 0 ${top - 172} Z`} fill="#ff7a1a" />
          </g>
        )}
      </g>
    </g>
  );
};

export const Hut: React.FC<{ x: number; y: number; scale?: number; tint?: string }> = ({ x, y, scale = 1, tint }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-72} y={-112} width={144} height={112} fill="#7a5233" stroke="#2a1a10" strokeWidth={4} />
    <rect x={-22} y={-74} width={44} height={74} rx={4} fill="#20140c" />
    <path d="M -110 -104 L 0 -220 L 110 -104 Z" fill="#c9a25b" stroke="#5a3d17" strokeWidth={4} strokeLinejoin="round" />
    {[-70, -40, -10, 20, 50, 80].map((sx) => (
      <line key={sx} x1={sx * 0.2} y1={-206} x2={sx} y2={-108} stroke="#8c6a2e" strokeWidth={3} />
    ))}
    {tint && <rect x={-115} y={-225} width={230} height={230} fill={tint} />}
  </g>
);

export const RuinedHouses: React.FC<{ y: number; scale?: number; fill?: string; line?: string; seed?: string; ghosts?: number }> = ({
  y,
  scale = 1,
  fill = "#2c2a33",
  line = "#15131a",
  seed = "h",
  ghosts = 0,
}) => {
  const frame = useCurrentFrame();
  const houses = [];
  let x = -60;
  let i = 0;
  while (x < 1140) {
    const w = (90 + random(`${seed}w${i}`) * 80) * scale;
    const h = (100 + random(`${seed}h${i}`) * 110) * scale;
    const jag = new Array(5)
      .fill(0)
      .map((_, k) => `L ${x + (w * (k + 1)) / 6} ${y - h + random(`${seed}j${i}${k}`) * 40 * scale}`)
      .join(" ");
    const showGhost = ghosts > 0 && random(`${seed}g${i}`) < ghosts;
    const blink = Math.sin(frame / 9 + i * 2) > 0.2;
    houses.push(
      <g key={i}>
        <path d={`M ${x} ${y} L ${x} ${y - h + 20 * scale} ${jag} L ${x + w} ${y - h + 10 * scale} L ${x + w} ${y} Z`} fill={fill} stroke={line} strokeWidth={3} />
        <path d={arch(x + w / 2, y, w * 0.32, h * 0.55)} fill="#0c0a10" />
        {showGhost && blink && (
          <g>
            <circle cx={x + w / 2 - 7 * scale} cy={y - h * 0.38} r={4 * scale} fill="#ff2a2a" filter="url(#redGlow)" />
            <circle cx={x + w / 2 + 7 * scale} cy={y - h * 0.38} r={4 * scale} fill="#ff2a2a" filter="url(#redGlow)" />
          </g>
        )}
      </g>,
    );
    x += w + 8 * scale;
    i++;
  }
  return <g>{houses}</g>;
};

export const Gate: React.FC<{ x: number; y: number; scale?: number; fill?: string; line?: string }> = ({ x, y, scale = 1, fill = "#1a1622", line = "#0b0a0f" }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M -300 0 L -300 -720 L 300 -720 L 300 0 L 160 0 L 160 -440 A 160 170 0 0 0 -160 -440 L -160 0 Z" fill={fill} stroke={line} strokeWidth={5} />
    <path d="M -160 0 L -160 -440 A 160 170 0 0 1 160 -440 L 160 0 Z" fill="#040306" />
    {[-260, -200, -140, -80, -20, 40, 100, 160, 220].map((mx) => (
      <rect key={mx} x={mx} y={-752} width={34} height={32} fill={fill} stroke={line} strokeWidth={3} />
    ))}
    <path d="M -300 -560 L 300 -560 M -300 -640 L 300 -640" stroke={line} strokeWidth={4} />
    {[-230, 230].map((cx) => (
      <path key={cx} d={arch(cx, -600, 40, 70)} fill="#09080c" />
    ))}
  </g>
);
