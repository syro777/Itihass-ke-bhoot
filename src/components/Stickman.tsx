import React from "react";
import { useCurrentFrame } from "remotion";
import { lerp } from "../lib/util";

/* ------------------------------------------------------------------ */
/* Pose rig                                                            */
/* Angles in degrees. 0 = limb hanging straight down, + = forward.     */
/* Arms/legs are absolute; elbows/knees are relative to the upper limb */
/* ------------------------------------------------------------------ */
export type Pose = {
  lean: number;
  head: number;
  ls: number; // back upper arm
  le: number; // back elbow
  rs: number; // front upper arm
  re: number; // front elbow
  lh: number; // back thigh
  lk: number; // back knee
  rh: number; // front thigh
  rk: number; // front knee
  hipY: number; // + lowers the hips (crouch / sit)
};

const base: Pose = { lean: 0, head: 0, ls: -8, le: 6, rs: 10, re: -6, lh: -5, lk: 0, rh: 5, rk: 0, hipY: 0 };
const P = (p: Partial<Pose>): Pose => ({ ...base, ...p });

export const POSES = {
  stand: P({}),
  point: P({ rs: 88, re: 0, ls: -12, le: 10, lean: 3 }),
  pointUp: P({ rs: 145, re: -5, lean: -3, head: -8 }),
  scared: P({ lean: -10, head: -6, ls: 55, le: 105, rs: 65, re: 100, lh: 8, lk: -28, rh: 20, rk: -34, hipY: 14 }),
  shock: P({ lean: -6, ls: -75, le: -25, rs: 78, re: 25, lh: -14, rh: 14 }),
  curse: P({ lean: -6, head: -12, ls: 160, le: 8, rs: 168, re: -8, lh: -10, rh: 10 }),
  think: P({ rs: 32, re: 128, ls: -10, le: 8, head: -6 }),
  hips: P({ ls: -38, le: 105, rs: 40, re: -108, lean: -3, head: -4 }),
  meditate: P({ hipY: 104, lh: 84, lk: -165, rh: 78, rk: -158, ls: 18, le: 55, rs: 28, re: 52 }),
  throwBack: P({ rs: -150, re: 25, ls: 40, le: 20, lean: -12, lh: -18, rh: 18 }),
  throwFwd: P({ rs: 105, re: 0, ls: -40, le: 10, lean: 14, lh: -20, rh: 22, rk: -10 }),
  holdUp: P({ rs: 118, re: 28, ls: -10, le: 10 }),
  holdOut: P({ rs: 76, re: 8, ls: -10, le: 10 }),
  wave: P({ rs: 150, re: 30, ls: -10, le: 10 }),
  cower: P({ lean: -14, head: 8, ls: 70, le: 110, rs: 80, re: 110, lh: 28, lk: -60, rh: 38, rk: -70, hipY: 40 }),
  cheer: P({ ls: 150, le: 15, rs: 155, re: -15, head: -10 }),
  armsCrossed: P({ rs: 48, re: 102, ls: 42, le: 104, head: -6 }),
  sword: P({ rs: 120, re: -40, ls: 30, le: 40, lean: 10, lh: -22, rh: 24, rk: -12 }),
} satisfies Record<string, Pose>;

export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    o[k] = lerp(a[k], b[k], t);
  });
  return o;
};

/** Walk / run cycle. `phase` in radians (≈ frame * 0.25). */
export const walkPose = (phase: number, amount = 1, run = false): Pose => {
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  const A = (run ? 34 : 24) * amount;
  return {
    lean: (run ? 12 : 3) * amount,
    head: 0,
    lh: A * s,
    rh: -A * s,
    lk: -(8 + (run ? 55 : 32) * Math.max(0, c)) * amount,
    rk: -(8 + (run ? 55 : 32) * Math.max(0, -c)) * amount,
    ls: -A * 0.9 * s,
    rs: A * 0.9 * s,
    le: (run ? 70 : 18) * amount,
    re: (run ? 70 : 18) * amount,
    hipY: -Math.abs(c) * 6 * amount,
  };
};

/* ------------------------------------------------------------------ */
/* Look                                                                */
/* ------------------------------------------------------------------ */
export type Eyes = "dot" | "big" | "closed" | "angry" | "glow" | "heart" | "sad" | "x" | "evil";
export type Mouth = "smile" | "flat" | "o" | "frown" | "grin" | "scream" | "none";

export type Outfit = {
  head?: "crown" | "pagdi" | "cap" | "princess" | "girl" | "jata" | "wild" | "helmet";
  beard?: string; // color
  mustache?: boolean;
  tilak?: "red" | "sage";
  robe?: string; // color
  lehenga?: string;
  sash?: string;
  mala?: boolean;
  backpack?: boolean;
  pagdiColor?: string;
  veil?: string; // dupatta colour for head "girl"
  glasses?: boolean;
  bundle?: boolean; // potli carried on the head
};

export type Held = "flashlight" | "bottle" | "staff" | "sword" | "torch" | "book" | "none";

type Props = {
  x: number;
  y: number; // ground line (feet)
  scale?: number;
  facing?: 1 | -1;
  pose?: Pose;
  color?: string;
  eyes?: Eyes;
  mouth?: Mouth;
  outfit?: Outfit;
  held?: Held;
  heldAngle?: number; // override beam angle
  ghost?: boolean;
  opacity?: number;
  seed?: number;
  rotate?: number;
  beamOn?: boolean;
};

const L = { torso: 105, neck: 8, R: 31, ua: 60, fa: 56, th: 70, sh: 68 };
const rad = (d: number) => (d * Math.PI) / 180;
const dir = (a: number, len: number): [number, number] => [Math.sin(rad(a)) * len, Math.cos(rad(a)) * len];
const add = (p: [number, number], q: [number, number]): [number, number] => [p[0] + q[0], p[1] + q[1]];
const INK = "#16121c";

export const Stickman: React.FC<Props> = ({
  x,
  y,
  scale = 1.3,
  facing = 1,
  pose = POSES.stand,
  color = "#F4EFE4",
  eyes = "dot",
  mouth = "smile",
  outfit = {},
  held = "none",
  heldAngle,
  ghost = false,
  opacity = 1,
  seed = 0,
  rotate = 0,
  beamOn = true,
}) => {
  const frame = useCurrentFrame();
  const p = pose;
  const hip: [number, number] = [0, -(L.th + L.sh) + p.hipY];
  const neck = add(hip, [Math.sin(rad(p.lean)) * L.torso, -Math.cos(rad(p.lean)) * L.torso]);
  const hd = L.neck + L.R;
  const headC = add(neck, [Math.sin(rad(p.lean + p.head)) * hd, -Math.cos(rad(p.lean + p.head)) * hd]);
  const shoulder = add(neck, dir(-p.lean, 12));

  const lElbow = add(shoulder, dir(p.ls, L.ua));
  const lHand = add(lElbow, dir(p.ls + p.le, L.fa));
  const rElbow = add(shoulder, dir(p.rs, L.ua));
  const rHand = add(rElbow, dir(p.rs + p.re, L.fa));
  const lKnee = add(hip, dir(p.lh, L.th));
  const lFoot = add(lKnee, dir(p.lh + p.lk, L.sh));
  const rKnee = add(hip, dir(p.rh, L.th));
  const rFoot = add(rKnee, dir(p.rh + p.rk, L.sh));

  const sw = 11;
  const limb = (pts: [number, number][], c: string, w = sw) => (
    <polyline
      points={pts.map((q) => q.join(",")).join(" ")}
      fill="none"
      stroke={c}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  const back = ghost ? color : shade(color, 0.78);

  // blink
  const blinkT = (frame + seed * 37) % 104;
  const blinking = (eyes === "dot" || eyes === "big" || eyes === "sad") && blinkT < 4;
  const eyeKind: Eyes = blinking ? "closed" : eyes;

  const forearmAngle = p.rs + p.re;
  const beamAngle = heldAngle ?? forearmAngle;
  const wisp = Math.sin(frame / 6 + seed) * 10;

  return (
    <g
      transform={`translate(${x},${y}) rotate(${rotate}) scale(${facing * scale},${scale})`}
      opacity={ghost ? opacity * 0.7 : opacity}
      filter={ghost ? "url(#ghostGlow)" : undefined}
    >
      {/* flashlight beam (drawn behind everything) */}
      {held === "flashlight" && beamOn && (
        <g transform={`translate(${rHand[0]},${rHand[1]}) rotate(${-beamAngle + 90})`}>
          <path d="M 0 -8 L 620 -150 L 620 150 L 0 8 Z" fill="url(#beam)" />
        </g>
      )}

      {/* back hair for princess */}
      {(outfit.head === "princess" || outfit.head === "girl") && (
        <path
          d={`M ${headC[0] - 26} ${headC[1] - 18} Q ${headC[0] - 58} ${headC[1] + 40} ${headC[0] - 46 + wisp * 0.3} ${headC[1] + 150} L ${headC[0] - 14} ${headC[1] + 120} Q ${headC[0] - 20} ${headC[1] + 40} ${headC[0] - 2} ${headC[1] + 6} Z`}
          fill="#2b1a14"
          stroke={INK}
          strokeWidth={3}
        />
      )}

      {/* backpack */}
      {outfit.backpack && (
        <rect
          x={neck[0] - 46}
          y={neck[1] + 14}
          width={34}
          height={64}
          rx={10}
          fill="#3d6b4f"
          stroke={INK}
          strokeWidth={3}
          transform={`rotate(${p.lean} ${neck[0]} ${neck[1]})`}
        />
      )}

      {/* back limbs */}
      {!ghost && limb([hip, lKnee, lFoot], back)}
      {limb([shoulder, lElbow, lHand], back)}

      {/* torso */}
      {limb([hip, neck], color)}

      {/* ghost tail instead of legs */}
      {ghost && (
        <path
          d={`M ${shoulder[0] - 22} ${shoulder[1]} Q ${hip[0] - 70 + wisp} ${hip[1] + 30} ${hip[0] - 30 + wisp * 1.5} ${hip[1] + 150} Q ${hip[0] - 4} ${hip[1] + 100} ${hip[0] + 12 + wisp} ${hip[1] + 170} Q ${hip[0] + 30} ${hip[1] + 110} ${hip[0] + 50 + wisp * 1.3} ${hip[1] + 140} Q ${hip[0] + 70} ${hip[1] + 30} ${shoulder[0] + 22} ${shoulder[1]} Z`}
          fill={color}
          opacity={0.7}
        />
      )}

      {/* front leg */}
      {!ghost && limb([hip, rKnee, rFoot], color)}

      {/* robe / lehenga over the legs */}
      {outfit.robe && (
        <path
          d={
            p.hipY > 60
              ? `M ${shoulder[0] - 16} ${shoulder[1]} L ${shoulder[0] + 18} ${shoulder[1]} L ${hip[0] + 78} ${hip[1] + 26} Q ${hip[0]} ${hip[1] + 46} ${hip[0] - 40} ${hip[1] + 26} Z`
              : `M ${shoulder[0] - 16} ${shoulder[1]} L ${shoulder[0] + 18} ${shoulder[1]} L ${hip[0] + 40} ${hip[1] + 62} Q ${hip[0]} ${hip[1] + 72} ${hip[0] - 40} ${hip[1] + 62} Z`
          }
          fill={outfit.robe}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      )}
      {outfit.lehenga && (
        <g>
          <path
            d={`M ${hip[0] - 18} ${hip[1] - 14} L ${hip[0] + 18} ${hip[1] - 14} L ${hip[0] + 62 + wisp * 0.2} ${hip[1] + 128} Q ${hip[0]} ${hip[1] + 140} ${hip[0] - 62 + wisp * 0.2} ${hip[1] + 128} Z`}
            fill={outfit.lehenga}
            stroke={INK}
            strokeWidth={3}
          />
          <path
            d={`M ${hip[0] - 58 + wisp * 0.2} ${hip[1] + 116} Q ${hip[0]} ${hip[1] + 128} ${hip[0] + 58 + wisp * 0.2} ${hip[1] + 116}`}
            stroke="#f2c14e"
            strokeWidth={7}
            fill="none"
          />
          <path
            d={`M ${shoulder[0] - 14} ${shoulder[1] - 2} L ${shoulder[0] + 16} ${shoulder[1] - 2} L ${hip[0] + 16} ${hip[1] - 12} L ${hip[0] - 16} ${hip[1] - 12} Z`}
            fill={shade(outfit.lehenga, 0.8)}
            stroke={INK}
            strokeWidth={3}
          />
        </g>
      )}
      {outfit.sash && (
        <line
          x1={shoulder[0] - 10}
          y1={shoulder[1] - 4}
          x2={hip[0] + 12}
          y2={hip[1] - 6}
          stroke={outfit.sash}
          strokeWidth={12}
          strokeLinecap="round"
        />
      )}
      {outfit.mala && (
        <path
          d={`M ${shoulder[0] - 10} ${shoulder[1] - 6} Q ${shoulder[0] + 22} ${shoulder[1] + 58} ${shoulder[0] + 14} ${shoulder[1] - 6}`}
          fill="none"
          stroke="#8a1c1c"
          strokeWidth={9}
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
      )}

      {/* head */}
      <g transform={`translate(${headC[0]},${headC[1]}) rotate(${p.lean + p.head})`}>
        {outfit.head === "jata" && (
          <g>
            <circle cx={-8} cy={-38} r={16} fill="#5d5a57" stroke={INK} strokeWidth={3} />
            <path d="M -30 -10 Q -34 -34 -8 -32 Q 18 -36 26 -18" fill="none" stroke="#5d5a57" strokeWidth={8} />
          </g>
        )}
        {outfit.head === "wild" && (
          <path
            d="M -30 6 L -46 -6 L -36 -16 L -52 -30 L -32 -32 L -38 -50 L -16 -40 L -10 -58 L 4 -40 L 18 -54 L 20 -34 L 34 -38 L 28 -22"
            fill="#1d1717"
            stroke="#1d1717"
            strokeWidth={10}
            strokeLinejoin="round"
          />
        )}
        <circle r={L.R} fill={color} stroke={ghost ? "none" : INK} strokeWidth={ghost ? 0 : 3} />
        <Face eyes={eyeKind} mouth={mouth} />
        {outfit.tilak === "red" && <line x1={11} y1={-27} x2={11} y2={-15} stroke="#d0241c" strokeWidth={5} strokeLinecap="round" />}
        {outfit.tilak === "sage" && (
          <g>
            <path d="M 4 -27 L 8 -14 L 14 -14 L 18 -27" fill="none" stroke="#ffffff" strokeWidth={3.5} />
            <line x1={11} y1={-24} x2={11} y2={-15} stroke="#d0241c" strokeWidth={3.5} />
          </g>
        )}
        {outfit.mustache && (
          <path d="M -2 8 Q 8 3 14 7 Q 20 3 30 7 Q 34 0 30 -3" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        )}
        {outfit.beard && (
          <path
            d="M -20 6 Q -14 36 4 64 Q 12 70 18 58 Q 30 30 30 8 Q 16 22 4 18 Q -10 14 -20 6 Z"
            fill={outfit.beard}
            stroke={INK}
            strokeWidth={3}
          />
        )}
        {outfit.head === "crown" && (
          <path
            d="M -24 -22 L -27 -54 L -12 -38 L 0 -60 L 12 -38 L 27 -54 L 24 -22 Z"
            fill="#f2c14e"
            stroke="#8a5a0a"
            strokeWidth={3}
            strokeLinejoin="round"
          />
        )}
        {outfit.head === "pagdi" && (
          <g>
            <path d="M -33 -4 Q -38 -48 0 -50 Q 38 -48 33 -4 Q 0 -18 -33 -4 Z" fill={outfit.pagdiColor ?? "#ff8a1c"} stroke={INK} strokeWidth={3} />
            <path d="M -30 -16 Q 0 -30 30 -16 M -26 -30 Q 0 -42 28 -30" stroke="#c4421a" strokeWidth={4} fill="none" />
            <circle cx={20} cy={-30} r={6} fill="#e8e8ff" stroke="#8a5a0a" strokeWidth={2} />
            <path d="M 20 -34 Q 30 -62 14 -76 Q 22 -56 16 -36" fill="#ffffff" stroke={INK} strokeWidth={2} />
          </g>
        )}
        {outfit.head === "cap" && (
          <g>
            <path d="M -31 -8 Q -32 -42 0 -42 Q 31 -42 31 -8 Z" fill="#d63a2f" stroke={INK} strokeWidth={3} />
            <path d="M 22 -12 L 54 -6 Q 46 2 26 -2 Z" fill="#a82a22" stroke={INK} strokeWidth={3} />
          </g>
        )}
        {outfit.head === "helmet" && (
          <path d="M -32 -4 Q -32 -44 0 -46 Q 32 -44 32 -4 Z M 0 -46 L 0 -62" fill="#7b8794" stroke={INK} strokeWidth={4} />
        )}
        {outfit.head === "princess" && (
          <g>
            <path d="M -30 -10 Q -30 -36 0 -36 Q 26 -36 30 -18 Q 8 -30 -14 -18 Z" fill="#2b1a14" stroke={INK} strokeWidth={3} />
            <path d="M -16 -34 L -10 -46 L -4 -36 L 4 -50 L 10 -36 L 16 -46 L 20 -32" fill="#f2c14e" stroke="#8a5a0a" strokeWidth={2} />
            <line x1={12} y1={-24} x2={12} y2={-16} stroke="#f2c14e" strokeWidth={3} />
            <circle cx={12} cy={-14} r={3.5} fill="#e63950" />
          </g>
        )}
        {outfit.head === "girl" && (
          <g>
            <path d="M -30 -10 Q -30 -36 0 -36 Q 26 -36 30 -18 Q 8 -30 -14 -18 Z" fill="#2b1a14" stroke={INK} strokeWidth={3} />
            <circle cx={12} cy={-14} r={3.5} fill="#e63950" />
            {outfit.veil && (
              <path d="M -36 6 Q -40 -46 2 -44 Q 34 -42 30 -20 Q 6 -34 -16 -22 Q -26 10 -44 40 Z" fill={outfit.veil} stroke={INK} strokeWidth={3} opacity={0.95} />
            )}
          </g>
        )}
        {outfit.glasses && (
          <g fill="none" stroke={INK} strokeWidth={3}>
            <circle cx={3} cy={-4} r={9} />
            <circle cx={21} cy={-4} r={9} />
            <path d="M -6 -6 L -26 -10" />
          </g>
        )}
        {outfit.bundle && (
          <g>
            <path d="M -30 -30 Q -34 -72 0 -74 Q 34 -72 30 -30 Q 0 -22 -30 -30 Z" fill="#a8743f" stroke={INK} strokeWidth={3} />
            <path d="M -6 -74 L -14 -88 M 6 -74 L 14 -88" stroke="#7a4f22" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
      </g>

      {/* front arm */}
      {limb([shoulder, rElbow, rHand], color)}

      {/* held items */}
      {held === "flashlight" && (
        <g transform={`translate(${rHand[0]},${rHand[1]}) rotate(${-forearmAngle + 90})`}>
          <rect x={-6} y={-8} width={34} height={16} rx={4} fill="#3b3f46" stroke={INK} strokeWidth={2} />
          <rect x={26} y={-11} width={10} height={22} rx={3} fill="#ffe680" />
        </g>
      )}
      {held === "bottle" && (
        <g transform={`translate(${rHand[0]},${rHand[1] - 6})`} filter="url(#softGlow)">
          <path d="M -7 -34 L 7 -34 L 7 -22 Q 22 -10 18 10 Q 14 26 0 26 Q -14 26 -18 10 Q -22 -10 -7 -22 Z" fill="#b45cff" stroke="#f0dcff" strokeWidth={3} />
          <rect x={-8} y={-44} width={16} height={11} rx={3} fill="#7a4b2a" />
        </g>
      )}
      {held === "staff" && (
        <g>
          <line x1={rHand[0]} y1={rHand[1] - 120} x2={rHand[0]} y2={rHand[1] + 150} stroke="#6b4a2b" strokeWidth={9} strokeLinecap="round" />
          <circle cx={rHand[0]} cy={rHand[1] - 132} r={14} fill="#e9e2cf" stroke={INK} strokeWidth={3} />
          <circle cx={rHand[0] - 4} cy={rHand[1] - 134} r={3} fill={INK} />
          <circle cx={rHand[0] + 5} cy={rHand[1] - 134} r={3} fill={INK} />
        </g>
      )}
      {held === "torch" && (
        <g>
          <line x1={rHand[0]} y1={rHand[1] + 40} x2={rHand[0]} y2={rHand[1] - 70} stroke="#6b4a2b" strokeWidth={10} strokeLinecap="round" />
          <circle cx={rHand[0]} cy={rHand[1] - 92} r={60} fill="url(#lantern)" opacity={0.8} />
          <path
            d={`M ${rHand[0] - 16} ${rHand[1] - 72} Q ${rHand[0] - 20 + Math.sin(frame / 2 + seed) * 4} ${rHand[1] - 104} ${rHand[0] + Math.sin(frame / 3 + seed) * 6} ${rHand[1] - 128} Q ${rHand[0] + 22} ${rHand[1] - 100} ${rHand[0] + 16} ${rHand[1] - 72} Z`}
            fill="#ffb347"
            stroke="#ff6a00"
            strokeWidth={4}
          />
        </g>
      )}
      {held === "book" && (
        <g transform={`translate(${rHand[0]},${rHand[1]}) rotate(-10)`}>
          <rect x={-6} y={-46} width={52} height={64} rx={4} fill="#7a2f2f" stroke={INK} strokeWidth={3} />
          <line x1={2} y1={-40} x2={2} y2={12} stroke="#f2c14e" strokeWidth={3} />
        </g>
      )}
      {held === "sword" && (
        <g transform={`translate(${rHand[0]},${rHand[1]}) rotate(${-forearmAngle + 90})`}>
          <line x1={0} y1={0} x2={110} y2={0} stroke="#d9dde3" strokeWidth={8} strokeLinecap="round" />
          <line x1={6} y1={-14} x2={6} y2={14} stroke="#8a5a0a" strokeWidth={7} />
        </g>
      )}
    </g>
  );
};

const Face: React.FC<{ eyes: Eyes; mouth: Mouth }> = ({ eyes, mouth }) => {
  const E: [number, number][] = [
    [3, -4],
    [18, -4],
  ];
  return (
    <g>
      {E.map(([ex, ey], i) => {
        switch (eyes) {
          case "big":
            return (
              <g key={i}>
                <circle cx={ex} cy={ey} r={8.5} fill="#ffffff" stroke={INK} strokeWidth={2.6} />
                <circle cx={ex + 1.5} cy={ey} r={3.6} fill={INK} />
              </g>
            );
          case "closed":
            return <path key={i} d={`M ${ex - 5} ${ey} Q ${ex} ${ey + 4} ${ex + 5} ${ey}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
          case "angry":
          case "evil":
            return (
              <g key={i}>
                <circle cx={ex} cy={ey + 1} r={4.2} fill={eyes === "evil" ? "#ff2626" : INK} />
                <line x1={ex - 7} y1={ey - (i === 0 ? 12 : 7)} x2={ex + 7} y2={ey - (i === 0 ? 7 : 12)} stroke={INK} strokeWidth={4} strokeLinecap="round" />
              </g>
            );
          case "sad":
            return (
              <g key={i}>
                <circle cx={ex} cy={ey + 1} r={4.2} fill={INK} />
                <line x1={ex - 7} y1={ey - (i === 0 ? 7 : 12)} x2={ex + 7} y2={ey - (i === 0 ? 12 : 7)} stroke={INK} strokeWidth={3} strokeLinecap="round" />
              </g>
            );
          case "glow":
            return <circle key={i} cx={ex} cy={ey} r={6.5} fill="#ff2a2a" filter="url(#redGlow)" />;
          case "heart":
            return (
              <path
                key={i}
                d={`M ${ex} ${ey + 6} L ${ex - 7} ${ey - 1} A 3.6 3.6 0 0 1 ${ex} ${ey - 5} A 3.6 3.6 0 0 1 ${ex + 7} ${ey - 1} Z`}
                fill="#ff3d7f"
              />
            );
          case "x":
            return (
              <path key={i} d={`M ${ex - 5} ${ey - 5} L ${ex + 5} ${ey + 5} M ${ex + 5} ${ey - 5} L ${ex - 5} ${ey + 5}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
            );
          default:
            return <circle key={i} cx={ex} cy={ey} r={4.4} fill={INK} />;
        }
      })}
      {mouth === "smile" && <path d="M 4 10 Q 11 17 19 10" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />}
      {mouth === "flat" && <path d="M 5 13 L 18 13" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />}
      {mouth === "frown" && <path d="M 4 16 Q 11 9 19 16" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />}
      {mouth === "o" && <ellipse cx={11} cy={14} rx={4.5} ry={5.5} fill={INK} />}
      {mouth === "scream" && <ellipse cx={11} cy={15} rx={7} ry={10} fill={INK} />}
      {mouth === "grin" && (
        <g>
          <path d="M -2 8 Q 11 24 26 6 Z" fill={INK} />
          <path d="M 1 10 L 24 9" stroke="#ffffff" strokeWidth={2.5} />
        </g>
      )}
    </g>
  );
};

export function shade(hex: string, k: number) {
  if (!hex.startsWith("#")) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}

/** SVG <defs> shared by all stickmen and scenery. Render once per scene SVG. */
export const SharedDefs: React.FC = () => (
  <defs>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#fff6b0" stopOpacity={0.75} />
      <stop offset="1" stopColor="#fff6b0" stopOpacity={0} />
    </linearGradient>
    <filter id="ghostGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="9" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="redGlow" x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="4" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="10" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.55" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.75} />
    </radialGradient>
    <radialGradient id="fogBlob">
      <stop offset="0" stopColor="#c9d3f0" stopOpacity={0.32} />
      <stop offset="1" stopColor="#c9d3f0" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="moonGlow">
      <stop offset="0.35" stopColor="#ffe9c2" stopOpacity={0.55} />
      <stop offset="1" stopColor="#ffe9c2" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="sunGlow">
      <stop offset="0.3" stopColor="#ffd27a" stopOpacity={0.8} />
      <stop offset="1" stopColor="#ff8a3d" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="purpleGlow">
      <stop offset="0" stopColor="#c77dff" stopOpacity={0.9} />
      <stop offset="1" stopColor="#7b2cbf" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="redAura">
      <stop offset="0" stopColor="#ff3b3b" stopOpacity={0.7} />
      <stop offset="1" stopColor="#ff3b3b" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="goldAura">
      <stop offset="0" stopColor="#ffd56b" stopOpacity={0.65} />
      <stop offset="1" stopColor="#ffd56b" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="lantern">
      <stop offset="0" stopColor="#ffb347" stopOpacity={0.9} />
      <stop offset="1" stopColor="#ff7b00" stopOpacity={0} />
    </radialGradient>
  </defs>
);
