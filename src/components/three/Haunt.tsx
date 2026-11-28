/* Horror layer for "haunting" episodes: animated film grain, VHS scanlines, light flicker,
 * a breathing vignette, tear lines and brief shadow-figure flashes at chosen frames. */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** A tall, thin silhouette (head, shoulders, long coat) drawn at x, height h. */
const Figure: React.FC<{ x: number; y: number; h: number; op: number; flip?: boolean }> = ({ x, y, h, op, flip }) => {
  const w = h * 0.26;
  const d = `M ${x} ${y - h}
    c ${w * 0.32} 0 ${w * 0.36} ${h * 0.11} 0 ${h * 0.12}
    c ${w * 0.5} ${h * 0.02} ${w * 0.62} ${h * 0.06} ${w * 0.62} ${h * 0.2}
    l ${w * 0.05} ${h * 0.68}
    l ${-w * 1.34} 0
    l ${w * 0.05} ${-h * 0.68}
    c 0 ${-h * 0.14} ${w * 0.12} ${-h * 0.18} ${w * 0.62} ${-h * 0.2}
    c ${-w * 0.36} ${-h * 0.01} ${-w * 0.32} ${-h * 0.12} 0 ${-h * 0.12} Z`;
  return (
    <g opacity={op} transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>
      <path d={d} fill="#000" filter="url(#hauntBlur)" />
      <circle cx={x - w * 0.09} cy={y - h * 0.94} r={h * 0.006} fill="#ff2020" opacity={0.9} />
      <circle cx={x + w * 0.09} cy={y - h * 0.94} r={h * 0.006} fill="#ff2020" opacity={0.9} />
    </g>
  );
};

export const HauntFX: React.FC<{ flashes?: number[]; strength?: number; tint?: string }> = ({ flashes = [], strength = 1, tint = "#0a1a10" }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const r = hash(f);
  // light flicker: rare deep dips + constant small wobble
  const dip = f < 10 ? 0 : r < 0.04 ? 0.4 : r < 0.08 ? 0.18 : 0;
  const wobble = 0.025 + 0.02 * Math.sin(f / 5.3) * Math.sin(f / 2.1);
  const breathe = 0.55 + 0.12 * Math.sin(f / 18);
  const fl = flashes.find((a) => f >= a && f < a + 5);
  const fp = fl !== undefined ? 1 - (f - fl) / 5 : 0;
  const tear = fl !== undefined || hash(f + 7) < 0.03;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id="hauntGrain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 97} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.9" />
            </feComponentTransfer>
          </filter>
          <filter id="hauntBlur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <radialGradient id="hauntVig" cx="50%" cy="46%" r="72%">
            <stop offset="45%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity={breathe * strength} />
          </radialGradient>
          <pattern id="hauntScan" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="2" fill="#000" opacity="0.16" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={tint} opacity={0.12 * strength} style={{ mixBlendMode: "multiply" }} />
        <rect width={W} height={H} fill="url(#hauntVig)" />
        <rect width={W} height={H} filter="url(#hauntGrain)" opacity={0.16 * strength} style={{ mixBlendMode: "overlay" }} />
        <rect width={W} height={H} fill="url(#hauntScan)" opacity={strength} />
        {tear &&
          [0, 1, 2].map((i) => {
            const y = hash(f * 3 + i) * H;
            const h = 6 + hash(f * 5 + i) * 26;
            return <rect key={i} x={0} y={y} width={W} height={h} fill={i % 2 ? "#ff2a4a" : "#2affe0"} opacity={0.12 * strength} style={{ mixBlendMode: "screen" }} />;
          })}
        {fp > 0 && <Figure x={fl! % 2 ? W * 0.83 : W * 0.17} y={H * 0.86} h={H * 0.62} op={0.85 * fp} flip={fl! % 2 === 1} />}
        {fp > 0 && <rect width={W} height={H} fill="#ffffff" opacity={0.08 * fp} />}
        <rect width={W} height={H} fill="#000" opacity={(dip + wobble) * strength} />
      </svg>
    </AbsoluteFill>
  );
};
