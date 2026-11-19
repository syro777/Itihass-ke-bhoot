import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "../lib/util";
import { POSES, SharedDefs, Stickman } from "./Stickman";

export const CHANNEL = { name: "ITIHAAS KE BHOOT", handle: "@ItihaasKeBhoot" };

const POP = "Poppins";

/** Arrow cursor that glides to (tx,ty) and taps at clickAt. */
const Cursor: React.FC<{ fromX: number; fromY: number; tx: number; ty: number; start: number; clickAt: number }> = ({ fromX, fromY, tx, ty, start, clickAt }) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const m = interpolate(f, [start, clickAt - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const x = fromX + (tx - fromX) * m;
  const y = fromY + (ty - fromY) * m;
  const press = f >= clickAt - 1 && f < clickAt + 3 ? 0.86 : 1;
  const rip = f - clickAt;
  const fade = interpolate(f, [clickAt + 14, clickAt + 22], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <g opacity={fade}>
      {rip >= 0 && rip < 14 && <circle cx={tx} cy={ty} r={14 + rip * 6} fill="none" stroke="#ffffff" strokeWidth={6 * (1 - rip / 14)} opacity={1 - rip / 14} />}
      <g transform={`translate(${x},${y}) scale(${press * 1.25})`}>
        <path d="M 0 0 L 0 62 L 16 48 L 28 74 L 40 69 L 28 43 L 48 43 Z" fill="#ffffff" stroke="#111" strokeWidth={5} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** Red SUBSCRIBE pill + bell. Turns grey "SUBSCRIBED" and rings the bell when clicked. Origin = centre of the pill. */
export const SubscribeButton: React.FC<{ x: number; y: number; scale?: number; at: number; clickAt: number; cursor?: boolean }> = ({
  x,
  y,
  scale = 1,
  at,
  clickAt,
  cursor = true,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 30, 9);
  const clicked = f >= clickAt;
  const press = f >= clickAt - 1 && f < clickAt + 3 ? 0.93 : 1;
  const rt = f - clickAt - 4;
  const ring = rt >= 0 ? 22 * Math.sin(rt / 1.8) * Math.exp(-rt / 16) : 0;
  const w = 500;
  const h = 120;
  return (
    <g transform={`translate(${x},${y}) scale(${scale * p})`}>
      <g transform={`scale(${press})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={clicked ? "#3d3b45" : "#e62117"} stroke="#ffffff" strokeWidth={6} />
        {clicked && <path d="M -205 0 L -188 18 L -160 -16" stroke="#ffffff" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        <text x={clicked ? 34 : 0} y={19} textAnchor="middle" fontFamily={POP} fontWeight={900} fontSize={clicked ? 48 : 60} fill="#ffffff" letterSpacing={2}>
          {clicked ? "SUBSCRIBED" : "SUBSCRIBE"}
        </text>
      </g>
      {/* bell */}
      <g transform={`translate(${w / 2 + 85},0)`}>
        <circle r={58} fill={clicked ? "#3d3b45" : "#26242c"} stroke="#ffffff" strokeWidth={6} />
        <g transform={`rotate(${ring}, 0, -30)`}>
          <path d="M -24 16 L -24 -4 Q -24 -28 0 -30 Q 24 -28 24 -4 L 24 16 L 31 23 L -31 23 Z" fill={clicked ? "#ffd84d" : "none"} stroke="#ffffff" strokeWidth={6} strokeLinejoin="round" />
          <circle cx={0} cy={30} r={7} fill="#ffffff" />
        </g>
        {rt >= 0 && rt < 26 && (
          <g stroke="#ffd84d" strokeWidth={6} strokeLinecap="round" opacity={1 - rt / 26}>
            <path d="M -44 -30 Q -54 -6 -44 18" fill="none" />
            <path d="M 44 -30 Q 54 -6 44 18" fill="none" />
          </g>
        )}
      </g>
      {/* burst */}
      {f >= clickAt && f < clickAt + 16 &&
        new Array(12).fill(0).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const k = (f - clickAt) / 16;
          const r0 = 150 + 140 * k;
          return (
            <line
              key={i}
              x1={Math.cos(a) * r0 * 1.6}
              y1={Math.sin(a) * r0 * 0.7}
              x2={Math.cos(a) * (r0 + 40) * 1.6}
              y2={Math.sin(a) * (r0 + 40) * 0.7}
              stroke={i % 2 ? "#ffd84d" : "#ffffff"}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={1 - k}
            />
          );
        })}
      {cursor && <Cursor fromX={380} fromY={330} tx={60} ty={20} start={at + 4} clickAt={clickAt} />}
    </g>
  );
};

const Avatar: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <defs>
      <radialGradient id="avMoon">
        <stop offset="0" stopColor="#ffb36b" />
        <stop offset="0.75" stopColor="#ff6a2b" />
        <stop offset="1" stopColor="#3a0f2a" />
      </radialGradient>
      <clipPath id="avClip">
        <circle cx={x} cy={y} r={r} />
      </clipPath>
    </defs>
    <circle cx={x} cy={y} r={r} fill="#1c0b2e" />
    <g clipPath="url(#avClip)">
      <circle cx={x} cy={y - r * 0.2} r={r * 0.85} fill="url(#avMoon)" />
      <Stickman x={x} y={y + r * 1.25} scale={r / 190} ghost color="#dff6ff" pose={{ ...POSES.shock, ls: -118, le: -30, rs: 118, re: 30 }} eyes="glow" mouth="o" outfit={{ head: "crown", mustache: true }} />
    </g>
    <circle cx={x} cy={y} r={r} fill="none" stroke="#ffffff" strokeWidth={6} />
  </g>
);

/** Channel card: avatar + name + handle + animated subscribe button. Origin = card centre. */
export const ChannelCard: React.FC<{ x: number; y: number; at: number; clickAt: number }> = ({ x, y, at, clickAt }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 30, 10);
  const wob = Math.sin((f - at) / 9) * 1.2;
  return (
    <g transform={`translate(${x},${y}) scale(${p}) rotate(${wob})`}>
      <rect x={-470} y={-215} width={940} height={430} rx={46} fill="#141019" stroke="#ff2e2e" strokeWidth={8} />
      <Avatar x={-310} y={-75} r={98} />
      <text x={-185} y={-92} fontFamily={POP} fontWeight={900} fontSize={58} fill="#ffffff">
        {CHANNEL.name}
      </text>
      <text x={-185} y={-36} fontFamily={POP} fontWeight={800} fontSize={36} fill="#b9b3c7">
        {CHANNEL.handle}
      </text>
      <SubscribeButton x={-60} y={120} scale={0.92} at={at + 3} clickAt={clickAt} />
    </g>
  );
};

/** Small mid-video reminder: pill slides in, gets clicked, slides out. Use inside a <Sequence> of ~80 frames. */
export const SubscribeNudge: React.FC<{ x?: number; y?: number; scale?: number }> = ({ x = 470, y = 600, scale = 0.8 }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const out = interpolate(f, [62, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <SharedDefs />
        <g transform={`translate(${out * 900},0)`}>
          <SubscribeButton x={x} y={y} scale={scale} at={0} clickAt={26} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
