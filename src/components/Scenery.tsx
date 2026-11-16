import React from "react";
import { random, useCurrentFrame } from "remotion";
import { H, W } from "../lib/util";

export const Sky: React.FC<{ top: string; bottom: string; id: string }> = ({ top, bottom, id }) => (
  <g>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#${id})`} />
  </g>
);

export const Stars: React.FC<{ count?: number; maxY?: number; opacity?: number }> = ({ count = 70, maxY = 900, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`sx${i}`) * W;
        const y = random(`sy${i}`) * maxY;
        const r = 1.2 + random(`sr${i}`) * 2.6;
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(frame / (10 + random(`st${i}`) * 25) + i));
        return <circle key={i} cx={x} cy={y} r={r} fill="#fff8e7" opacity={tw} />;
      })}
    </g>
  );
};

export const Moon: React.FC<{ x: number; y: number; r?: number; color?: string; opacity?: number }> = ({
  x,
  y,
  r = 110,
  color = "#ffe7b8",
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r * 2.6} fill="url(#moonGlow)" />
    <circle cx={x} cy={y} r={r} fill={color} />
    <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.18} fill="#000" opacity={0.08} />
    <circle cx={x + r * 0.35} cy={y + r * 0.25} r={r * 0.24} fill="#000" opacity={0.07} />
    <circle cx={x + r * 0.1} cy={y - r * 0.45} r={r * 0.1} fill="#000" opacity={0.08} />
  </g>
);

export const Sun: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 120 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 3} fill="url(#sunGlow)" />
    <circle cx={x} cy={y} r={r} fill="#ffcf6b" />
  </g>
);

/** Layered Aravalli-style hills. y = baseline of the farthest layer. */
export const Hills: React.FC<{ y: number; colors: [string, string, string]; drift?: number }> = ({ y, colors, drift = 0 }) => (
  <g>
    <path
      transform={`translate(${-drift * 0.3},0)`}
      d={`M -300 ${y} L -300 ${y - 160} Q -100 ${y - 330} 120 ${y - 210} Q 300 ${y - 120} 460 ${y - 260} Q 640 ${y - 380} 820 ${y - 220} Q 1000 ${y - 110} 1400 ${y - 240} L 1400 ${y} Z`}
      fill={colors[0]}
    />
    <path
      transform={`translate(${-drift * 0.6},0)`}
      d={`M -300 ${y + 90} L -300 ${y - 60} Q -60 ${y - 210} 200 ${y - 90} Q 420 ${y + 10} 640 ${y - 140} Q 860 ${y - 260} 1100 ${y - 80} Q 1250 ${y + 10} 1400 ${y - 60} L 1400 ${y + 90} Z`}
      fill={colors[1]}
    />
    <path
      transform={`translate(${-drift},0)`}
      d={`M -300 ${y + 200} L -300 ${y + 40} Q 0 ${y - 60} 300 ${y + 30} Q 600 ${y + 110} 900 ${y + 10} Q 1150 ${y - 50} 1400 ${y + 40} L 1400 ${y + 200} Z`}
      fill={colors[2]}
    />
  </g>
);

export const Ground: React.FC<{ y: number; color: string; color2?: string }> = ({ y, color, color2 }) => (
  <g>
    <defs>
      <linearGradient id={`g${y}${color}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} />
        <stop offset="1" stopColor={color2 ?? "#000000"} />
      </linearGradient>
    </defs>
    <rect x={-300} y={y} width={W + 600} height={H - y + 400} fill={`url(#g${y}${color})`} />
  </g>
);

export const Fog: React.FC<{ y: number; count?: number; opacity?: number; speed?: number }> = ({ y, count = 7, opacity = 1, speed = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {new Array(count).fill(0).map((_, i) => {
        const base = random(`fx${i}`) * (W + 800) - 400;
        const x = ((base + frame * (0.8 + random(`fs${i}`) * 1.4) * speed + 600) % (W + 1200)) - 600;
        const yy = y + (random(`fy${i}`) - 0.5) * 160;
        const rx = 380 + random(`fr${i}`) * 260;
        return <ellipse key={i} cx={x} cy={yy} rx={rx} ry={rx * 0.28} fill="url(#fogBlob)" />;
      })}
    </g>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#vignette)" opacity={strength} />
);

export const Lightning: React.FC<{ x: number; at: number; seed?: string; len?: number; y2?: number }> = ({
  x,
  at,
  seed = "L",
  len = 7,
  y2 = 900,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > len) return null;
  let px = x;
  let d = `M ${px} -50`;
  const steps = 9;
  for (let i = 1; i <= steps; i++) {
    px += (random(`${seed}${i}`) - 0.5) * 140;
    d += ` L ${px} ${-50 + (i * (y2 + 50)) / steps}`;
  }
  const flicker = t % 2 === 0 ? 1 : 0.55;
  return (
    <g opacity={flicker * (1 - t / (len + 1))}>
      <path d={d} stroke="#c9b8ff" strokeWidth={26} fill="none" opacity={0.35} filter="url(#softGlow)" />
      <path d={d} stroke="#ffffff" strokeWidth={8} fill="none" strokeLinejoin="round" />
    </g>
  );
};

/** Particles: dust burst at (x,y) starting at frame `at`. */
export const Dust: React.FC<{ x: number; y: number; at: number; color?: string; count?: number; spread?: number }> = ({
  x,
  y,
  at,
  color = "#b9a58c",
  count = 26,
  spread = 380,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 45) return null;
  return (
    <g>
      {new Array(count).fill(0).map((_, i) => {
        const a = random(`da${i}${at}`) * Math.PI;
        const v = 0.4 + random(`dv${i}${at}`) * 0.6;
        const k = 1 - Math.exp(-t / 9);
        const cx = x + Math.cos(a) * spread * v * k * (random(`dd${i}`) > 0.5 ? 1 : -1);
        const cy = y - Math.sin(a) * spread * 0.45 * v * k;
        const r = 30 + 50 * v * k;
        return <circle key={i} cx={cx} cy={cy} r={r} fill={color} opacity={0.5 * (1 - t / 45)} />;
      })}
    </g>
  );
};

export const Sparkles: React.FC<{ x: number; y: number; from: number; to?: number; color?: string; radius?: number; count?: number }> = ({
  x,
  y,
  from,
  to = 99999,
  color = "#e0b3ff",
  radius = 140,
  count = 18,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  return (
    <g>
      {new Array(count).fill(0).map((_, i) => {
        const life = 26;
        const t = (frame - from + i * 7) % life;
        const a = random(`spa${i}`) * Math.PI * 2;
        const rr = radius * (0.3 + random(`spr${i}`) * 0.7);
        const cx = x + Math.cos(a) * rr;
        const cy = y + Math.sin(a) * rr - t * 3;
        const s = Math.sin((t / life) * Math.PI) * 9;
        return <path key={i} d={`M ${cx} ${cy - s} L ${cx + s * 0.3} ${cy} L ${cx} ${cy + s} L ${cx - s * 0.3} ${cy} Z M ${cx - s} ${cy} L ${cx} ${cy + s * 0.3} L ${cx + s} ${cy} L ${cx} ${cy - s * 0.3} Z`} fill={color} />;
      })}
    </g>
  );
};

export const FloatingHearts: React.FC<{ x: number; y: number; from: number; to: number }> = ({ x, y, from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 30) return null;
  return (
    <g>
      {new Array(7).fill(0).map((_, i) => {
        const t = frame - from - i * 6;
        if (t < 0 || t > 45) return null;
        const hx = x + Math.sin(t / 6 + i) * 22 + (i - 3) * 16;
        const hy = y - t * 4.5;
        const s = 1 + i * 0.12;
        return (
          <path
            key={i}
            transform={`translate(${hx},${hy}) scale(${s})`}
            d="M 0 10 L -12 -2 A 6 6 0 0 1 0 -9 A 6 6 0 0 1 12 -2 Z"
            fill="#ff4d8d"
            opacity={1 - t / 45}
          />
        );
      })}
    </g>
  );
};

/** Expanding ring shockwave. */
export const Shockwave: React.FC<{ x: number; y: number; at: number; color?: string; max?: number }> = ({ x, y, at, color = "#ff3b3b", max = 900 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 24) return null;
  const k = t / 24;
  return <circle cx={x} cy={y} r={60 + max * k} fill="none" stroke={color} strokeWidth={30 * (1 - k)} opacity={1 - k} />;
};

/** Film grain using an animated turbulence filter. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={opacity}>
      <filter id={`grain${frame % 6}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 6} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect x={0} y={0} width={W} height={H} filter={`url(#grain${frame % 6})`} />
    </g>
  );
};
