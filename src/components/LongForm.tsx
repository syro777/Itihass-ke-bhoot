/* Long-form (16:9) overlays: chapter card, chapter badge, night clock, "dar meter" gauge, Devanagari-capable texture. */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { pop } from "../lib/util";

const POP = "Poppins";

/** Full-screen chapter title: big number, place, region, time chip. Use inside a Sequence. */
export const ChapterCard: React.FC<{ num: string; place: string; region: string; time: string; dur: number }> = ({ num, place, region, time, dur }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const inP = pop(f, 0, 30, 10);
  const out = interpolate(f, [dur - 10, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const bar = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const shake = f < 8 ? Math.sin(f * 3.1) * (8 - f) * 1.4 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 1 - out }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="ccband" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity={0} />
            <stop offset="0.25" stopColor="#0a0408" stopOpacity={0.82} />
            <stop offset="0.75" stopColor="#0a0408" stopOpacity={0.82} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={0} y={H / 2 - 230} width={W * bar} height={460} fill="url(#ccband)" />
        <rect x={W / 2 - 520 * bar} y={H / 2 + 222} width={1040 * bar} height={8} fill="#e01b1b" />
        <g transform={`translate(${W / 2 + shake},${H / 2}) scale(${inP})`}>
          <text x={-300} y={70} textAnchor="end" fontFamily="Creepster" fontSize={260} fill="#ff2e2e" stroke="#000" strokeWidth={8} paintOrder="stroke">
            {num}
          </text>
          <text x={-250} y={-10} fontFamily={POP} fontWeight={900} fontSize={110} fill="#ffffff" stroke="#000" strokeWidth={10} paintOrder="stroke" letterSpacing={2}>
            {place}
          </text>
          <text x={-246} y={70} fontFamily={POP} fontWeight={800} fontSize={52} fill="#ffd84d" letterSpacing={6}>
            {region}
          </text>
          <g transform="translate(-246,120)">
            <rect x={0} y={0} width={250} height={64} rx={32} fill="#ffd84d" />
            <circle cx={36} cy={32} r={19} fill="none" stroke="#111" strokeWidth={5} />
            <line x1={36} y1={32} x2={36} y2={19} stroke="#111" strokeWidth={5} strokeLinecap="round" />
            <line x1={36} y1={32} x2={46} y2={36} stroke="#111" strokeWidth={5} strokeLinecap="round" />
            <text x={66} y={45} fontFamily={POP} fontWeight={900} fontSize={36} fill="#111">
              {time}
            </text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Small persistent chapter pill (top-left). */
export const ChapterBadge: React.FC<{ num: string; place: string }> = ({ num, place }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const p = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const w = 120 + place.length * 25;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(${-w + (w + 48) * p},48)`} opacity={0.95}>
          <rect x={0} y={0} width={w} height={62} rx={31} fill="rgba(10,6,8,0.78)" stroke="#e01b1b" strokeWidth={4} />
          <text x={22} y={44} fontFamily="Creepster" fontSize={44} fill="#ff2e2e">
            {num}
          </text>
          <text x={98} y={42} fontFamily={POP} fontWeight={900} fontSize={30} fill="#ffffff" letterSpacing={1}>
            {place}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Big night clock that ticks to the given time (bridge scenes). */
export const NightClock: React.FC<{ hour: number; minute?: number; label: string; x?: number; y?: number }> = ({ hour, minute = 0, label, x = 1590, y = 250 }) => {
  const f = useCurrentFrame();
  const p = pop(f, 0, 30, 10);
  const m = minute + interpolate(f, [0, 40], [-15, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const ha = ((hour % 12) + m / 60) * 30;
  const ma = m * 6;
  return (
    <g transform={`translate(${x},${y}) scale(${p})`}>
      <circle r={132} fill="rgba(8,6,12,0.85)" stroke="#ffd84d" strokeWidth={8} />
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.sin(a) * 104} y1={-Math.cos(a) * 104} x2={Math.sin(a) * 118} y2={-Math.cos(a) * 118} stroke="#ffd84d" strokeWidth={i % 3 === 0 ? 8 : 4} />;
      })}
      <line x1={0} y1={0} x2={Math.sin((ha * Math.PI) / 180) * 62} y2={-Math.cos((ha * Math.PI) / 180) * 62} stroke="#ffffff" strokeWidth={12} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin((ma * Math.PI) / 180) * 96} y2={-Math.cos((ma * Math.PI) / 180) * 96} stroke="#ff2e2e" strokeWidth={7} strokeLinecap="round" />
      <circle r={10} fill="#ffd84d" />
      <rect x={-120} y={150} width={240} height={64} rx={32} fill="#ffd84d" />
      <text y={195} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={38} fill="#111">
        {label}
      </text>
    </g>
  );
};

/** Semicircle gauge 0..10 with a needle that swings to `value`. */
export const DarMeter: React.FC<{ value: number; at: number; x?: number; y?: number }> = ({ value, at, x = 960, y = 470 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 30, 10);
  const swing = interpolate(f, [at + 6, at + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
  const v = value * swing;
  const ang = -90 + (v / 10) * 180;
  const segs = 10;
  return (
    <g transform={`translate(${x},${y}) scale(${p})`}>
      <rect x={-340} y={-300} width={680} height={400} rx={40} fill="rgba(8,6,10,0.86)" stroke="#ffffff" strokeWidth={5} />
      <text y={-238} textAnchor="middle" fontFamily="Creepster" fontSize={72} fill="#ff2e2e">
        DAR METER
      </text>
      {new Array(segs).fill(0).map((_, i) => {
        const a0 = Math.PI + (i / segs) * Math.PI;
        const a1 = Math.PI + ((i + 1) / segs) * Math.PI - 0.03;
        const r0 = 150;
        const r1 = 210;
        const col = i < 4 ? "#5ff28a" : i < 7 ? "#ffd84d" : "#ff2e2e";
        const d = `M ${Math.cos(a0) * r1} ${Math.sin(a0) * r1} A ${r1} ${r1} 0 0 1 ${Math.cos(a1) * r1} ${Math.sin(a1) * r1} L ${Math.cos(a1) * r0} ${Math.sin(a1) * r0} A ${r0} ${r0} 0 0 0 ${Math.cos(a0) * r0} ${Math.sin(a0) * r0} Z`;
        return <path key={i} d={d} fill={col} opacity={i < Math.round(v) ? 1 : 0.22} />;
      })}
      <g transform={`rotate(${ang})`}>
        <polygon points="-9,0 9,0 0,-200" fill="#ffffff" stroke="#000" strokeWidth={3} />
      </g>
      <circle r={22} fill="#ffffff" stroke="#000" strokeWidth={4} />
      <text y={84} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={64} fill="#ffffff">
        {Math.round(v)}/10
      </text>
    </g>
  );
};

/** Canvas text texture with a chosen font family (use "Hind" for Devanagari). */
export const famTexture = (lines: { text: string; size: number; color: string; family?: string; weight?: string }[], w = 1024, h = 512, bg?: string, glow?: string) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  const total = lines.reduce((a, l) => a + l.size * 1.2, 0);
  let y = (h - total) / 2;
  for (const l of lines) {
    g.font = `${l.weight ?? "700"} ${l.size}px ${l.family ?? "Poppins"}, Hind, Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "top";
    if (glow) {
      g.shadowColor = glow;
      g.shadowBlur = 30;
    }
    g.fillStyle = l.color;
    g.fillText(l.text, w / 2, y);
    y += l.size * 1.2;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
