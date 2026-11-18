import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp, pop } from "../../lib/util";

/** Big rubber stamp overlay (2D). */
export const Stamp: React.FC<{ x: number; y: number; at: number; text: string; color?: string; until?: number; size?: number }> = ({ x, y, at, text, color = "#e01b1b", until = 99999, size = 84 }) => {
  const f = useCurrentFrame();
  if (f < at || f > until) return null;
  const p = pop(f, at, 30, 9);
  const s = lerp(2.4, 1, p);
  const w = text.length * size * 0.66 + 70;
  return (
    <g transform={`translate(${x},${y}) rotate(-10) scale(${s})`} opacity={Math.min(1, p * 1.4)}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.6} rx={18} fill="rgba(255,255,255,0.08)" stroke={color} strokeWidth={12} />
      <text y={size * 0.33} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={size} fill={color} letterSpacing={3}>
        {text}
      </text>
    </g>
  );
};

export const Chip: React.FC<{ x: number; y: number; at: number; text: string; bg?: string; until?: number }> = ({ x, y, at, text, bg = "#111", until = 99999 }) => {
  const f = useCurrentFrame();
  if (f < at || f > until) return null;
  const w = text.length * 34 + 80;
  return (
    <g transform={`translate(${x},${y}) scale(${pop(f, at, 30, 9)})`}>
      <rect x={-w / 2} y={-56} width={w} height={112} rx={30} fill={bg} stroke="#ffd84d" strokeWidth={6} />
      <text y={20} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={56} fill="#ffd84d">
        {text}
      </text>
    </g>
  );
};

