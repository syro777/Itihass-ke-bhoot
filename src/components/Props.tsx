import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { pop } from "../lib/util";

const HIND = "Hind";
const POP = "Poppins";

/** Archaeological Survey of India style warning board. Origin = bottom centre (ground). */
export const WarningBoard: React.FC<{ x: number; y: number; scale?: number; stampAt?: number; dropAt?: number }> = ({
  x,
  y,
  scale = 1,
  stampAt,
  dropAt,
}) => {
  const frame = useCurrentFrame();
  const drop = dropAt === undefined ? 1 : pop(frame, dropAt, 30, 9);
  const dy = interpolate(drop, [0, 1], [-1400, 0]);
  const st = stampAt === undefined ? 0 : pop(frame, stampAt, 30, 10);
  const stScale = interpolate(st, [0, 1], [2.6, 1]);
  return (
    <g transform={`translate(${x},${y + dy}) scale(${scale})`}>
      <rect x={-170} y={-330} width={22} height={330} fill="#5b5b62" stroke="#111" strokeWidth={3} />
      <rect x={148} y={-330} width={22} height={330} fill="#5b5b62" stroke="#111" strokeWidth={3} />
      <rect x={-250} y={-660} width={500} height={360} rx={14} fill="#0d3b66" stroke="#f4f4f4" strokeWidth={9} />
      <text x={0} y={-612} textAnchor="middle" fontFamily={HIND} fontWeight={700} fontSize={34} fill="#ffffff">
        भारतीय पुरातत्व सर्वेक्षण
      </text>
      <text x={0} y={-580} textAnchor="middle" fontFamily={POP} fontWeight={800} fontSize={17} fill="#cfe3ff" letterSpacing={1}>
        ARCHAEOLOGICAL SURVEY OF INDIA
      </text>
      <line x1={-215} y1={-562} x2={215} y2={-562} stroke="#f4f4f4" strokeWidth={3} />
      <text x={0} y={-512} textAnchor="middle" fontFamily={HIND} fontWeight={700} fontSize={42} fill="#ffd84d">
        सूर्योदय से पहले और
      </text>
      <text x={0} y={-464} textAnchor="middle" fontFamily={HIND} fontWeight={700} fontSize={42} fill="#ffd84d">
        सूर्यास्त के बाद
      </text>
      <text x={0} y={-414} textAnchor="middle" fontFamily={HIND} fontWeight={700} fontSize={46} fill="#ffffff">
        प्रवेश वर्जित है
      </text>
      <text x={0} y={-366} textAnchor="middle" fontFamily={POP} fontWeight={800} fontSize={19} fill="#cfe3ff">
        ENTRY PROHIBITED BEFORE SUNRISE
      </text>
      <text x={0} y={-340} textAnchor="middle" fontFamily={POP} fontWeight={800} fontSize={19} fill="#cfe3ff">
        AND AFTER SUNSET
      </text>
      {stampAt !== undefined && frame >= stampAt && (
        <g transform={`translate(0,-480) rotate(-14) scale(${stScale})`} opacity={Math.min(1, st * 1.4)}>
          <rect x={-220} y={-62} width={440} height={124} rx={18} fill="rgba(200,20,20,0.18)" stroke="#e01b1b" strokeWidth={12} />
          <text x={0} y={30} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={88} fill="#ff2b2b" letterSpacing={3}>
            NO ENTRY
          </text>
        </g>
      )}
    </g>
  );
};

export const HighwaySign: React.FC<{ x: number; y: number; scale?: number; popAt?: number; hi?: string; en?: string; sub?: string }> = ({
  x,
  y,
  scale = 1,
  popAt = 0,
  hi = "भानगढ़",
  en = "BHANGARH",
  sub = "ALWAR • RAJASTHAN",
}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, popAt, 30, 10);
  return (
    <g transform={`translate(${x},${y}) scale(${scale * interpolate(p, [0, 1], [0.6, 1])})`} opacity={Math.min(1, p * 2)}>
      <rect x={-12} y={-560} width={24} height={560} fill="#8d939b" stroke="#222" strokeWidth={3} />
      <rect x={-320} y={-760} width={640} height={300} rx={22} fill="#0b6e3d" stroke="#ffffff" strokeWidth={10} />
      <text x={-55} y={-672} textAnchor="middle" fontFamily={HIND} fontWeight={700} fontSize={70} fill="#ffffff">
        {hi}
      </text>
      <text x={-55} y={-590} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={en.length > 9 ? 50 : 66} fill="#ffffff">
        {en}
      </text>
      <text x={-55} y={-516} textAnchor="middle" fontFamily={POP} fontWeight={800} fontSize={30} fill="#d6f5e3" letterSpacing={2}>
        {sub}
      </text>
      <path d="M 232 -650 L 282 -610 L 232 -570 M 282 -610 L 200 -610" stroke="#ffffff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
};

export const DateBadge: React.FC<{ x: number; y: number; at: number; top?: string; big: string; bottom?: string }> = ({ x, y, at, top = "SAN", big, bottom }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = pop(frame, at, 30, 8);
  const s = interpolate(p, [0, 1], [2.2, 1]);
  const spin = (frame - at) * 0.6;
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(-6)`} opacity={Math.min(1, p * 1.5)}>
      <circle r={175} fill="#f2c14e" stroke="#7a4f06" strokeWidth={10} />
      <circle r={150} fill="none" stroke="#7a4f06" strokeWidth={5} strokeDasharray="14 10" transform={`rotate(${spin})`} />
      <text y={-62} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={44} fill="#5a3604" letterSpacing={6}>
        {top}
      </text>
      <text y={bottom ? 44 : 60} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={bottom ? 104 : 118} fill="#3a2200">
        {big}
      </text>
      {bottom && (
        <text y={102} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={36} fill="#5a3604" letterSpacing={3}>
          {bottom}
        </text>
      )}
    </g>
  );
};

export const NameTag: React.FC<{ x: number; y: number; at: number; text: string; bg?: string; fg?: string; size?: number; until?: number }> = ({
  x,
  y,
  at,
  text,
  bg = "#ffffff",
  fg = "#111111",
  size = 40,
  until,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || (until !== undefined && frame > until)) return null;
  const p = pop(frame, at, 30, 9);
  const w = text.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x},${y}) scale(${p})`}>
      <path d={`M -16 0 L 0 22 L 16 0 Z`} fill={bg} />
      <rect x={-w / 2} y={-size - 34} width={w} height={size + 36} rx={(size + 36) / 2} fill={bg} stroke="#111" strokeWidth={5} />
      <text y={-22} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={size} fill={fg} letterSpacing={1}>
        {text}
      </text>
    </g>
  );
};

export const Boulder: React.FC<{ x: number; y: number; r?: number; rot?: number; glow?: number }> = ({ x, y, r = 150, rot = 0, glow = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    {glow > 0 && <circle r={r * 1.8} fill="url(#purpleGlow)" opacity={glow} />}
    <path
      d={`M ${-r} ${r * 0.1} L ${-r * 0.8} ${-r * 0.6} L ${-r * 0.2} ${-r} L ${r * 0.5} ${-r * 0.85} L ${r} ${-r * 0.2} L ${r * 0.85} ${r * 0.6} L ${r * 0.2} ${r} L ${-r * 0.6} ${r * 0.85} Z`}
      fill="#6f6a72"
      stroke="#1c1a20"
      strokeWidth={8}
      strokeLinejoin="round"
    />
    <path d={`M ${-r * 0.5} ${-r * 0.4} L ${-r * 0.1} ${-r * 0.05} L ${-r * 0.25} ${r * 0.4} M ${r * 0.3} ${-r * 0.5} L ${r * 0.45} ${r * 0.1}`} stroke="#3a363e" strokeWidth={7} fill="none" strokeLinecap="round" />
    <path d={`M ${-r * 0.7} ${-r * 0.45} L ${-r * 0.2} ${-r * 0.85}`} stroke="#9a95a0" strokeWidth={9} strokeLinecap="round" />
    {glow > 0 && <path d={`M ${-r * 0.6} ${-r * 0.2} Q 0 ${-r * 0.5} ${r * 0.6} ${-r * 0.1}`} stroke="#d39bff" strokeWidth={10} fill="none" opacity={glow} />}
  </g>
);

export const Pin: React.FC<{ x: number; y: number; at: number; scale?: number }> = ({ x, y, at, scale = 1 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = pop(frame, at, 30, 7);
  const dy = interpolate(p, [0, 1], [-500, 0]);
  const t = frame - at;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {[0, 12].map((d) => {
        const k = ((t - d) % 36) / 36;
        if (t - d < 0) return null;
        return <ellipse key={d} rx={30 + 110 * k} ry={(30 + 110 * k) * 0.32} fill="none" stroke="#ff3b3b" strokeWidth={6} opacity={1 - k} />;
      })}
      <g transform={`translate(0,${dy})`}>
        <path d="M 0 0 C -20 -40 -60 -70 -60 -120 A 60 60 0 1 1 60 -120 C 60 -70 20 -40 0 0 Z" fill="#e62e2e" stroke="#ffffff" strokeWidth={7} />
        <circle cy={-122} r={24} fill="#ffffff" />
      </g>
    </g>
  );
};

export const VoteButtons: React.FC<{ y: number; at: number; left: string; right: string }> = ({ y, at, left, right }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const a = pop(frame, at, 30, 9);
  const b = pop(frame, at + 6, 30, 9);
  const v = pop(frame, at + 12, 30, 7);
  const pulse = 1 + 0.04 * Math.sin((frame - at) / 4);
  const fit = (t: string, base: number) => Math.min(base, Math.floor(350 / (t.length * 0.72)));
  return (
    <g>
      <g transform={`translate(250,${y}) scale(${a * pulse})`}>
        <rect x={-200} y={-80} width={400} height={160} rx={36} fill="#e62e2e" stroke="#ffffff" strokeWidth={8} />
        <text y={left.length > 5 ? 22 : 30} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={fit(left, left.length > 5 ? 66 : 84)} fill="#ffffff">
          {left}
        </text>
      </g>
      <g transform={`translate(830,${y}) scale(${b * pulse})`}>
        <rect x={-200} y={-80} width={400} height={160} rx={36} fill="#2b6fe6" stroke="#ffffff" strokeWidth={8} />
        <text y={right.length > 5 ? 22 : 30} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={fit(right, right.length > 5 ? 66 : 76)} fill="#ffffff">
          {right}
        </text>
      </g>
      <g transform={`translate(540,${y}) scale(${v})`}>
        <circle r={74} fill="#111" stroke="#ffd84d" strokeWidth={8} />
        <text y={24} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={64} fill="#ffd84d">
          VS
        </text>
      </g>
    </g>
  );
};

export const CommentBubble: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = pop(frame, at, 30, 8);
  const dots = Math.floor((frame - at) / 6) % 4;
  return (
    <g transform={`translate(${x},${y}) scale(${p})`}>
      <path d="M -230 -110 L 230 -110 Q 270 -110 270 -70 L 270 40 Q 270 80 230 80 L -90 80 L -150 140 L -140 80 L -230 80 Q -270 80 -270 40 L -270 -70 Q -270 -110 -230 -110 Z" fill="#ffffff" stroke="#111" strokeWidth={8} />
      <text x={0} y={-20} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={60} fill="#111">
        COMMENT KARO
      </text>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={-40 + i * 40} cy={40} r={13} fill={i < dots ? "#e62e2e" : "#c9c9c9"} />
      ))}
    </g>
  );
};

export const Lantern: React.FC<{ x: number; y: number; seed?: number }> = ({ x, y, seed = 0 }) => {
  const frame = useCurrentFrame();
  const f = 0.75 + 0.25 * Math.sin(frame / 3 + seed) * Math.sin(frame / 7 + seed * 2);
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={120} fill="url(#lantern)" opacity={f * 0.7} />
      <line x1={0} y1={-60} x2={0} y2={-24} stroke="#1a1410" strokeWidth={4} />
      <path d="M -18 -24 L 18 -24 L 24 18 L -24 18 Z" fill="#ffb347" opacity={f} stroke="#3a2614" strokeWidth={4} />
    </g>
  );
};
