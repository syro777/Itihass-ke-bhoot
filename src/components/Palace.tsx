import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { pop } from "../lib/util";

const HIND = "Hind";
const POP = "Poppins";

const arch = (cx: number, by: number, w: number, h: number) =>
  `M ${cx - w / 2} ${by} L ${cx - w / 2} ${by - h + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${cx + w / 2} ${by - h + w / 2} L ${cx + w / 2} ${by} Z`;

/** Shaniwar Wada style "Delhi Darwaza": twin bastions, nagarkhana on top, spiked wooden doors. Origin = bottom centre. */
export const WadaGate: React.FC<{ x: number; y: number; scale?: number; fill?: string; line?: string; door?: string; glow?: number; build?: number }> = ({
  x,
  y,
  scale = 1,
  fill = "#4a3a30",
  line = "#1a120c",
  door = "#5a3418",
  glow = 0,
  build = 1,
}) => {
  const f = useCurrentFrame();
  const clip = `wg${Math.round(x)}${Math.round(y)}`;
  const crenel = (x0: number, x1: number, yy: number) => {
    const out = [];
    for (let cx = x0; cx < x1; cx += 34) out.push(<path key={cx} d={arch(cx + 12, yy, 24, 30)} fill={fill} stroke={line} strokeWidth={2} />);
    return out;
  };
  const spikes = [];
  for (const sy of [-360, -270, -180, -90]) {
    for (let sx = -112; sx <= 112; sx += 32) {
      if (Math.abs(sx) < 8) continue;
      spikes.push(<path key={`${sx}${sy}`} d={`M ${sx - 7} ${sy} L ${sx} ${sy - 16} L ${sx + 7} ${sy} Z`} fill="#9aa0a8" stroke="#2a2a2a" strokeWidth={1.5} />);
    }
  }
  const win = (i: number) => (glow > 0 ? `rgba(255,170,70,${glow * (0.6 + 0.4 * Math.abs(Math.sin(f / 8 + i)))})` : "#140c08");
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <defs>
        <clipPath id={clip}>
          <rect x={-600} y={-900 * build + 40} width={1200} height={1000} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {[-340, 340].map((bx) => (
          <g key={bx}>
            <path d={`M ${bx - 100} 0 L ${bx - 90} -520 L ${bx + 90} -520 L ${bx + 100} 0 Z`} fill={fill} stroke={line} strokeWidth={4} />
            {crenel(bx - 100, bx + 90, -520)}
            {[-420, -300, -180].map((sy) => (
              <rect key={sy} x={bx - 6} y={sy} width={12} height={40} rx={5} fill="#0c0806" />
            ))}
            <line x1={bx - 92} y1={-300} x2={bx + 92} y2={-300} stroke={line} strokeWidth={3} />
          </g>
        ))}
        <rect x={-240} y={-640} width={480} height={640} fill={fill} stroke={line} strokeWidth={4} />
        {crenel(-240, 230, -640)}
        {/* nagarkhana windows */}
        <rect x={-200} y={-600} width={400} height={110} fill={fill} stroke={line} strokeWidth={3} />
        {[-150, -75, 0, 75, 150].map((wx, i) => (
          <path key={wx} d={arch(wx, -505, 44, 80)} fill={win(i)} stroke={line} strokeWidth={2} />
        ))}
        {/* gate arch + doors */}
        <path d={arch(0, 0, 300, 470)} fill={line} />
        <rect x={-136} y={-410} width={136} height={410} fill={door} stroke={line} strokeWidth={4} />
        <rect x={0} y={-410} width={136} height={410} fill={door} stroke={line} strokeWidth={4} />
        {[-100, -64, -28, 28, 64, 100].map((px) => (
          <line key={px} x1={px} y1={-405} x2={px} y2={-4} stroke="#3a2210" strokeWidth={3} />
        ))}
        {spikes}
        {/* wicket door */}
        <rect x={40} y={-130} width={64} height={126} fill="#2a180c" stroke={line} strokeWidth={3} />
      </g>
    </g>
  );
};

/** A row of animated flames with rising smoke, from x0 to x1 standing on line y. */
export const Flames: React.FC<{ x0: number; x1: number; y: number; h?: number; on?: number }> = ({ x0, x1, y, h = 160, on = 1 }) => {
  const f = useCurrentFrame();
  if (on <= 0) return null;
  const items = [];
  let i = 0;
  for (let x = x0; x <= x1; x += 46) {
    const hh = h * (0.6 + 0.4 * random(`fl${i}`)) * on * (0.85 + 0.15 * Math.sin(f / 3 + i));
    const sway = Math.sin(f / 4 + i * 1.3) * 10;
    items.push(
      <g key={i}>
        <path d={`M ${x - 34} ${y} Q ${x - 40} ${y - hh * 0.5} ${x + sway} ${y - hh} Q ${x + 40} ${y - hh * 0.5} ${x + 34} ${y} Z`} fill="#ff6a1c" opacity={0.92} />
        <path d={`M ${x - 18} ${y} Q ${x - 20} ${y - hh * 0.35} ${x + sway * 0.6} ${y - hh * 0.62} Q ${x + 22} ${y - hh * 0.35} ${x + 18} ${y} Z`} fill="#ffd56b" />
      </g>,
    );
    for (let k = 0; k < 2; k++) {
      const t = ((f + i * 11 + k * 23) % 60) / 60;
      items.push(<circle key={`s${i}${k}`} cx={x + sway * 2 + t * 40} cy={y - hh - t * 320} r={30 + t * 70} fill="#2a2228" opacity={0.45 * (1 - t) * on} />);
    }
    i++;
  }
  return <g>{items}</g>;
};

/** Parchment order. `strike` crosses out the old word; `changed` swaps it for the new one. */
export const Letter: React.FC<{ x: number; y: number; s: number; line1: string; oldWord: string; newWord: string; strike: number; changed: number; glowOld?: number }> = ({
  x,
  y,
  s,
  line1,
  oldWord,
  newWord,
  strike,
  changed,
  glowOld = 0,
}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-300} y={-190} width={600} height={380} rx={10} fill="#f1deb0" stroke="#6b4a1f" strokeWidth={8} />
    <path d="M -300 -150 Q -330 -170 -300 -190 M 300 150 Q 330 170 300 190" stroke="#6b4a1f" strokeWidth={8} fill="none" />
    <text x={0} y={-60} textAnchor="middle" fontFamily={HIND} fontWeight={700} fontSize={70} fill="#3a2410">
      {line1}
    </text>
    <g opacity={1 - changed}>
      {glowOld > 0 && <rect x={-150} y={0} width={300} height={130} rx={20} fill="#ffd84d" opacity={0.55 * glowOld} />}
      <text x={0} y={100} textAnchor="middle" fontFamily={HIND} fontWeight={700} fontSize={104} fill="#3a2410">
        {oldWord}
      </text>
      {strike > 0 && <line x1={-140} y1={66} x2={-140 + 280 * strike} y2={56} stroke="#d0141a" strokeWidth={14} strokeLinecap="round" />}
    </g>
    {changed > 0 && (
      <g transform={`translate(0,66) scale(${0.6 + 0.4 * changed}) translate(0,-66)`} opacity={changed}>
        <text x={0} y={100} textAnchor="middle" fontFamily={HIND} fontWeight={700} fontSize={112} fill="#c8101a">
          {newWord}
        </text>
      </g>
    )}
  </g>
);

/** Spiky shout bubble with text. */
export const Shout: React.FC<{ x: number; y: number; at: number; until?: number; text: string; s?: number }> = ({ x, y, at, until = 99999, text, s = 1 }) => {
  const f = useCurrentFrame();
  if (f < at || f > until) return null;
  const p = pop(f, at, 30, 7);
  const jitter = Math.sin(f * 1.7) * 3;
  const pts = [];
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = i % 2 ? 1 : 1.18;
    pts.push(`${Math.cos(a) * 300 * r},${Math.sin(a) * 120 * r}`);
  }
  return (
    <g transform={`translate(${x + jitter},${y}) scale(${p * s}) rotate(-4)`}>
      <polygon points={pts.join(" ")} fill="#ffffff" stroke="#111" strokeWidth={8} strokeLinejoin="round" />
      <text y={18} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={text.length > 12 ? 46 : 60} fill="#d0141a">
        {text}
      </text>
    </g>
  );
};

/** Echoing sound rings spreading from a point. */
export const SoundRings: React.FC<{ x: number; y: number; from: number; to?: number; color?: string }> = ({ x, y, from, to = 99999, color = "#ff4a4a" }) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const t = ((f - from + i * 10) % 40) / 40;
        return <circle key={i} cx={x} cy={y} r={40 + t * 380} fill="none" stroke={color} strokeWidth={10 * (1 - t)} opacity={0.8 * (1 - t)} />;
      })}
    </g>
  );
};

/** Peshwa's seat (gaddi) with bolster; `glow` lights it up gold. */
export const Gaddi: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {glow > 0 && <ellipse cx={0} cy={-60} rx={300} ry={140} fill="url(#goldAura)" opacity={glow} />}
    <rect x={-230} y={-60} width={460} height={70} rx={20} fill="#a3161a" stroke="#5a0a0d" strokeWidth={5} />
    <rect x={-230} y={-60} width={460} height={14} fill="#f2c14e" />
    <rect x={-250} y={-150} width={70} height={100} rx={30} fill="#c9a03a" stroke="#6b4a10" strokeWidth={5} />
    <path d={`M -200 10 L -190 40 M 200 10 L 190 40`} stroke="#5a0a0d" strokeWidth={10} />
  </g>
);

/** Fallen turban lying on the floor (used to show a death without showing violence). */
export const FallenPagdi: React.FC<{ x: number; y: number; s?: number; at: number }> = ({ x, y, s = 1, at }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const drop = interpolate(f, [at, at + 8], [-120, 0], { extrapolateRight: "clamp" });
  return (
    <g transform={`translate(${x},${y + drop}) scale(${s}) rotate(${interpolate(f, [at, at + 8], [-40, 12], { extrapolateRight: "clamp" })})`}>
      <path d="M -60 0 Q -70 -60 0 -64 Q 70 -60 60 0 Q 0 -20 -60 0 Z" fill="#b0122a" stroke="#111" strokeWidth={5} />
      <path d="M -54 -20 Q 0 -44 56 -20" stroke="#7a0a1a" strokeWidth={6} fill="none" />
      <path d="M 30 -50 Q 52 -100 26 -118" stroke="#ffffff" strokeWidth={6} fill="none" />
    </g>
  );
};
