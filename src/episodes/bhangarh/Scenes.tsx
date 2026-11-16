import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Fort, Gate, Hut, RuinedHouses } from "../../components/Buildings";
import { Boulder, CommentBubble, DateBadge, HighwaySign, Lantern, NameTag, Pin, VoteButtons, WarningBoard } from "../../components/Props";
import { SceneFrame } from "../../components/SceneFrame";
import { Dust, FloatingHearts, Fog, Ground, Hills, Lightning, Moon, Shockwave, Sky, Sparkles, Stars, Sun } from "../../components/Scenery";
import { POSES, SharedDefs, Stickman, mixPose, walkPose } from "../../components/Stickman";
import { ChannelCard } from "../../components/Subscribe";
import { flash, lerp, mixColor, pop, prog, shake, sumShake, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };
const GY = 1180; // ground line

const TOURIST = { head: "cap", backpack: true } as const;

/* 1 ─────────────────────────── HOOK ─────────────────────────── */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const wf = (k: string, n = 1) => wordFrame(words, k, n);
  const fKila = wf("kila");
  const fSooraj = wf("sooraj");
  const fBaad = wf("baad");
  const fJaana = wf("jaana");
  const fMana = wf("mana");

  const night = prog(f, fSooraj - 4, fBaad + 10);
  const sunY = lerp(840, 1230, prog(f, 0, fBaad + 6, Easing.in(Easing.quad)));
  const walkIn = prog(f, 0, 46, Easing.out(Easing.quad));
  const torch = { ...POSES.holdOut, rs: 104, re: 14 };
  let pose = f < 46 ? walkPose(f * 0.34, 1 - walkIn * 0.4) : torch;
  if (f >= fMana) pose = mixPose(torch, POSES.scared, prog(f, fMana, fMana + 5));
  const jumpT = f - fMana;
  const jump = jumpT >= 0 && jumpT < 12 ? -Math.sin((jumpT / 12) * Math.PI) * 70 : 0;
  const sh = shake(f, fMana, 34, 20, "hook");
  const punch = f >= fKila ? Math.exp(-(f - fKila) / 7) : 0;

  return (
    <SceneFrame
      transition="none"
      cam={{ zoom: 1 + 0.07 * prog(f, 0, dur, Easing.linear) + 0.06 * punch, cx: 540, cy: 900, sx: sh.x, sy: sh.y, rot: sh.r }}
      flash={flash(f, fMana - 1, 9, 0.85)}
      tint="#ff1a1a"
      tintOpacity={f >= fMana ? 0.12 + 0.05 * Math.sin(f / 3) : 0}
    >
      <Sky id="hookSky" top={mixColor("#3a2257", "#060a1c", night)} bottom={mixColor("#ff8f4a", "#2a1440", night)} />
      <Stars opacity={night} />
      <Sun x={540} y={sunY} />
      <Moon x={800} y={520} r={92} color="#ffd7a8" opacity={prog(f, fJaana - 6, fJaana + 14)} />
      <Hills y={1080} colors={[mixColor("#7a3b52", "#1b1430", night), mixColor("#5a2a40", "#120e22", night), mixColor("#3a1a2c", "#0b0916", night)]} />
      <Fort x={540} y={1090} scale={0.95} fill={mixColor("#2a1420", "#07060c", night)} line={mixColor("#43202f", "#191426", night)} glow={night} />
      <Fog y={1080} opacity={0.4 + 0.6 * night} />
      <Ground y={GY} color={mixColor("#2b1620", "#0d0b14", night)} />
      <Stickman x={lerp(-60, 250, walkIn)} y={GY + 10 + jump} pose={pose} outfit={TOURIST} held="flashlight" beamOn={night > 0.55}
        eyes={f >= fMana ? "big" : "dot"} mouth={f >= fMana ? "scream" : "flat"} />
      <WarningBoard x={790} y={GY + 70} scale={0.72} dropAt={fMana - 4} stampAt={fMana + 6} />
      <Lightning x={360} at={fMana - 1} seed="hk" y2={1000} />
    </SceneFrame>
  );
};

/* 2 ─────────────────────────── LOCATION ─────────────────────────── */
export const Location: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fRaj = wordFrame(words, "rajasthan");
  const fAlwar = wordFrame(words, "alwar");
  const fBh = wordFrame(words, "bhangarh");
  const travel = interpolate(f, [0, fAlwar + 6], [0, 520], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const moving = f < fAlwar + 6;
  const pose = moving ? walkPose(f * 0.36) : mixPose(POSES.stand, { ...POSES.stand, head: -16 }, prog(f, fAlwar + 6, fAlwar + 14));
  const dashOff = travel;

  return (
    <SceneFrame cam={{ zoom: 1 + 0.08 * prog(f, 0, dur), cx: 540, cy: 960 }}>
      <Sky id="locSky" top="#090d2a" bottom="#43285e" />
      <Stars />
      <Moon x={860} y={430} r={80} />
      <Hills y={1040} colors={["#251a40", "#1b1430", "#120e22"]} drift={travel * 0.25} />
      <Fort x={560 - travel * 0.08} y={1040} scale={0.38} fill="#08070d" line="#1d1830" glow={0.9} temple={false} />
      <Pin x={560 - travel * 0.08} y={800} at={fBh} scale={0.7} />
      <Fog y={1050} opacity={0.6} />
      <Ground y={GY} color="#18141f" />
      {/* road */}
      <rect x={-200} y={GY + 6} width={1500} height={90} fill="#24212b" />
      {new Array(14).fill(0).map((_, i) => {
        const x = ((i * 160 - dashOff * 1.0) % 2240 + 2240) % 2240 - 200;
        return <rect key={i} x={x} y={GY + 46} width={80} height={10} rx={5} fill="#d8d0b0" opacity={0.8} />;
      })}
      <HighwaySign x={1290 - travel * 0.92} y={GY + 20} scale={0.7} popAt={fRaj - 8} />
      <Stickman x={300} y={GY + 30} pose={pose} outfit={TOURIST} held="flashlight" beamOn={false} eyes={f > fBh ? "big" : "dot"} mouth={f > fBh ? "o" : "smile"} seed={2} />
    </SceneFrame>
  );
};

/* 3 ─────────────────────────── HISTORY 1573 ─────────────────────────── */
export const History: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fYear = wordFrame(words, "1573");
  const fRaja = wordFrame(words, "raja");
  const fIse = wordFrame(words, "ise");
  const fMadho = wordFrame(words, "madho");
  const fBasaya = wordFrame(words, "basaya");
  const build = 0.3 + 0.7 * prog(f, fIse - 4, fBasaya + 4, Easing.inOut(Easing.quad));
  const badgeMove = prog(f, fRaja + 4, fRaja + 18);
  const kingPose = f < fIse ? POSES.hips : mixPose(POSES.hips, POSES.point, prog(f, fIse, fIse + 6));
  const hammer = (seed: number) => mixPose(POSES.holdUp, POSES.throwFwd, (Math.sin((f + seed) / 3.2) + 1) / 2);
  const kingIn = pop(f, fRaja - 6, 30, 12);
  const princeIn = pop(f, fMadho - 4, 30, 10);

  return (
    <SceneFrame cam={{ zoom: 1 + 0.06 * prog(f, 0, dur), cx: 540, cy: 900 }} tint="#c47a2c" tintOpacity={0.12} grain={0.1}>
      <Sky id="hisSky" top="#e7a95e" bottom="#f8dfae" />
      <Sun x={850} y={560} r={95} />
      <Hills y={1080} colors={["#c98d4e", "#b0733a", "#8a5a2b"]} />
      <Fort x={600} y={1150} scale={0.86} fill="#6b4523" line="#3a2410" build={build} flags={f > fBasaya} />
      {f > fIse && build < 0.99 && <Dust x={600} y={1130} at={fIse} color="#d9b07a" spread={420} />}
      <Ground y={GY} color="#7a4e26" color2="#2b190a" />
      {/* workers */}
      <Stickman x={830} y={GY + 6} scale={0.62} pose={hammer(0)} color="#fff4df" seed={4} />
      <Stickman x={960} y={GY + 6} scale={0.62} facing={-1} pose={hammer(9)} color="#fff4df" seed={5} />
      <g transform={`translate(220,${GY + 30}) scale(${kingIn}) translate(-220,${-(GY + 30)})`}>
        <Stickman x={220} y={GY + 30} scale={1.35} pose={kingPose} outfit={{ head: "pagdi", mustache: true, sash: "#c4421a" }} color="#fff4df" seed={1} />
      </g>
      <NameTag x={220} y={GY - 450} at={fRaja} text="RAJA BHAGWANT DAS" size={34} until={fMadho - 2} />
      <g transform={`translate(400,${GY + 30}) scale(${princeIn}) translate(-400,${-(GY + 30)})`}>
        {f >= fMadho - 4 && (
          <Stickman x={400} y={GY + 30} scale={1.05} pose={POSES.wave} outfit={{ head: "crown" }} color="#fff4df" seed={3} />
        )}
      </g>
      <NameTag x={330} y={GY - 450} at={fMadho} text="BETA: MADHO SINGH" size={34} bg="#ffd84d" />
      <g transform={`translate(${lerp(540, 860, badgeMove)},${lerp(600, 470, badgeMove)}) scale(${lerp(1, 0.55, badgeMove)})`}>
        <DateBadge x={0} y={0} at={fYear} big="1573" />
      </g>
    </SceneFrame>
  );
};

/* Shared world for the sage legend (scenes 4 & 5) */
const SageWorld: React.FC<{
  f: number;
  shadow: number; // shadow tip x
  extra: number;
  sky: [string, string];
  hutDark: number;
  children?: React.ReactNode;
  palaceGlow?: number;
}> = ({ f, shadow, extra, sky, hutDark, children, palaceGlow = 0.4 }) => (
  <>
    <Sky id={`sage${sky[0]}`} top={sky[0]} bottom={sky[1]} />
    <Stars count={40} opacity={0.6} />
    <Sun x={70} y={760} r={70} />
    <Hills y={1080} colors={["#1d3440", "#162a33", "#0f1e25"]} />
    <Ground y={GY} color="#5b7a5c" color2="#0a120d" />
    {/* shadow on the ground */}
    <path d={`M 150 ${GY} L 330 ${GY} L ${shadow} ${GY + 22} L ${shadow - 40} ${GY + 70} L ${150 + (shadow - 150) * 0.55} ${GY + 70} Z`} fill="#050807" opacity={0.78} />
    <Fort x={250} y={GY + 4} scale={0.6} fill="#2a2f3d" line="#151821" hill={false} temple={false} extra={extra} glow={palaceGlow} />
    <Hut x={880} y={GY + 4} scale={0.85} tint={hutDark > 0 ? `rgba(0,0,0,${0.6 * hutDark})` : undefined} />
    {/* the sage's boundary line */}
    <line x1={560} y1={GY + 8} x2={560} y2={GY + 80} stroke="#ffd56b" strokeWidth={8} strokeDasharray="14 12" opacity={0.85 - 0.6 * hutDark} />
    {children}
    <Fog y={1150} opacity={0.35} count={5} />
  </>
);

/* 4 ─────────────────────────── SAGE ─────────────────────────── */
export const Sage: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fBaba = wordFrame(words, "baba");
  const fShart = wordFrame(words, "shart");
  const fPar = wordFrame(words, "parchhai");
  const fKabhi = wordFrame(words, "kabhi");
  const shadowTip = lerp(330, 530, prog(f, fPar - 4, fKabhi + 6));
  const banner = pop(f, fShart - 3, 30, 12);
  const aura = 0.7 + 0.3 * Math.sin(f / 8);
  return (
    <SceneFrame cam={{ zoom: 1.04 + 0.05 * prog(f, 0, dur), cx: 560, cy: 940 }}>
      <SageWorld f={f} shadow={shadowTip} extra={0} sky={["#0f2236", "#3f7280"]} hutDark={0}>
        <circle cx={730} cy={GY - 110} r={170} fill="url(#goldAura)" opacity={aura * prog(f, fBaba - 6, fBaba + 6)} />
        <Stickman x={730} y={GY + 6} facing={-1} pose={POSES.meditate} eyes="closed" mouth="flat" outfit={{ head: "jata", beard: "#f1f1f1", robe: "#e8741e", tilak: "sage" }} seed={7} />
      </SageWorld>
      <NameTag x={730} y={GY - 330} at={fBaba} text="BABA BALU NATH" size={36} bg="#ffd84d" />
      {f >= fShart - 3 && (
        <g transform={`translate(540,560) scale(${banner},${Math.min(1, banner * 1.2)})`}>
          <rect x={-330} y={-120} width={660} height={250} rx={26} fill="#f3e1b6" stroke="#5a3d17" strokeWidth={8} />
          <text x={0} y={-36} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={78} fill="#7a1a10">
            SHART
          </text>
          {/* palace → shadow → hut, crossed out */}
          <g transform="translate(-200,90) scale(0.11)">
            <Fort x={0} y={0} hill={false} temple={false} fill="#3a3040" line="#1a1420" />
          </g>
          <path d="M -120 60 L 110 60" stroke="#3a3040" strokeWidth={10} strokeDasharray="18 12" />
          <path d="M 96 44 L 124 60 L 96 76" stroke="#3a3040" strokeWidth={10} fill="none" />
          <g transform="translate(210,96) scale(0.42)">
            <Hut x={0} y={0} />
          </g>
          <circle cx={0} cy={60} r={52} fill="none" stroke="#e01b1b" strokeWidth={12} />
          <line x1={-36} y1={96} x2={36} y2={24} stroke="#e01b1b" strokeWidth={12} />
        </g>
      )}
    </SceneFrame>
  );
};

/* 5 ─────────────────────────── CURSE ─────────────────────────── */
export const Curse: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fRaja = wordFrame(words, "raja");
  const fMahal = wordFrame(words, "mahal");
  const fPar = wordFrame(words, "parchhai");
  const fPadi = wordFrame(words, "padi");
  const fSh = wordFrame(words, "shraapit");
  const extra = prog(f, fMahal, fMahal + 26, Easing.out(Easing.back(1.4)));
  const shadowTip = lerp(530, 1060, prog(f, fPar - 2, fPadi + 8, Easing.inOut(Easing.cubic)));
  const hutDark = prog(f, fPar + 4, fPadi + 8);
  const wake = prog(f, fPadi, fPadi + 10);
  const sagePose = mixPose(POSES.meditate, POSES.curse, prog(f, fSh - 10, fSh));
  const sh = sumShake(shake(f, fMahal + 4, 10, 26, "rise"), shake(f, fSh, 40, 26, "curse"));
  const red = prog(f, fSh, fSh + 4);
  const kingIn = pop(f, fRaja - 4, 30, 12);
  return (
    <SceneFrame
      cam={{ zoom: 1.04 + 0.08 * prog(f, 0, dur), cx: 560, cy: 940, sx: sh.x, sy: sh.y, rot: sh.r }}
      flash={flash(f, fSh, 10, 0.9)}
      tint="#ff0000"
      tintOpacity={red * (0.22 + 0.06 * Math.sin(f / 2.5))}
    >
      <SageWorld f={f} shadow={shadowTip} extra={extra} sky={[mixColor("#0f2236", "#2a0508", red), mixColor("#3f7280", "#6b0f12", red)]} hutDark={hutDark} palaceGlow={0.4 + 0.6 * red}>
        {f >= fMahal && f < fMahal + 40 && <Dust x={250} y={GY} at={fMahal} color="#7f8a99" spread={300} />}
        <circle cx={730} cy={GY - 110} r={190} fill={wake > 0.5 ? "url(#redAura)" : "url(#goldAura)"} opacity={0.6 + 0.4 * Math.sin(f / 5)} />
        <Stickman x={730} y={GY + 6} facing={-1} pose={sagePose} eyes={wake > 0.5 ? "glow" : "closed"} mouth={f >= fSh ? "scream" : wake > 0.5 ? "frown" : "flat"}
          outfit={{ head: "jata", beard: "#f1f1f1", robe: "#e8741e", tilak: "sage" }} seed={7} />
        <g transform={`translate(420,${GY + 10}) scale(${kingIn}) translate(-420,${-(GY + 10)})`}>
          <Stickman x={420} y={GY + 10} pose={f < fSh ? POSES.armsCrossed : POSES.scared} eyes={f < fSh ? "dot" : "big"} mouth={f < fSh ? "grin" : "scream"}
            outfit={{ head: "crown", mustache: true, sash: "#5b2a86" }} seed={9} />
        </g>
        <Shockwave x={730} y={GY - 140} at={fSh} max={1100} />
      </SageWorld>
      <Lightning x={720} at={fSh - 1} seed="cu" y2={1040} len={9} />
      <Lightning x={300} at={fSh + 4} seed="cu2" y2={900} len={6} />
    </SceneFrame>
  );
};

/* Night palace backdrop for the tantrik legend */
const PalaceWall: React.FC = () => (
  <g>
    <rect x={-100} y={640} width={1300} height={560} fill="#1c1030" stroke="#0e0818" strokeWidth={4} />
    {new Array(24).fill(0).map((_, i) => (
      <rect key={i} x={-100 + i * 56} y={606} width={34} height={36} fill="#1c1030" stroke="#0e0818" strokeWidth={3} />
    ))}
    {[60, 330, 600, 870].map((x) => (
      <path key={x} d={`M ${x} 1180 L ${x} 860 A 90 90 0 0 1 ${x + 180} 860 L ${x + 180} 1180 Z`} fill="#0b0614" stroke="#2c1a48" strokeWidth={4} />
    ))}
    <Lantern x={285} y={830} seed={1} />
    <Lantern x={825} y={830} seed={3} />
  </g>
);

/* 6 ─────────────────────────── TANTRIK ─────────────────────────── */
export const Tantrik: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fT = wordFrame(words, "tantrik");
  const fRat = wordFrame(words, "ratnavati");
  const fMohit = wordFrame(words, "mohit");
  const fJ = wordFrame(words, "jaadui");
  const fVash = wordFrame(words, "vash");
  const tIn = prog(f, fT - 4, fT + 6);
  const love = f >= fMohit && f < fJ;
  const holding = f >= fJ - 2;
  const tPose = holding ? mixPose(POSES.stand, POSES.holdUp, prog(f, fJ - 2, fJ + 6)) : POSES.stand;
  const card = 1 - prog(f, fT - 8, fT);
  const sh = shake(f, fT, 14, 12, "tan");
  return (
    <SceneFrame transition="glitch" cam={{ zoom: 1.02 + 0.07 * prog(f, 0, dur), cx: 540, cy: 960, sx: sh.x, sy: sh.y }}>
      <Sky id="tanSky" top="#0c0418" bottom="#3c1458" />
      <Stars count={50} />
      <Moon x={540} y={430} r={86} color="#e6d3ff" />
      <PalaceWall />
      <Ground y={GY} color="#1a0f28" color2="#050208" />
      <Fog y={1150} opacity={0.5} />
      {card > 0 && (
        <text x={540} y={590} textAnchor="middle" fontFamily="Creepster" fontSize={150} fill="#c77dff" opacity={card} style={{ letterSpacing: 6 }}>
          KAHANI #2
        </text>
      )}
      {/* princess */}
      <Stickman x={800} y={GY + 20} facing={-1} pose={f >= fVash ? POSES.armsCrossed : POSES.stand} eyes={f >= fVash ? "angry" : "dot"} mouth={f >= fVash ? "frown" : "smile"}
        outfit={{ head: "princess", lehenga: "#d7263d" }} seed={11} />
      <NameTag x={790} y={GY - 450} at={fRat} text="RAJKUMARI RATNAVATI" size={32} bg="#ff8fb1" />
      {/* tantrik */}
      {f >= fT - 4 && (
        <g opacity={tIn}>
          <circle cx={290} cy={GY - 200} r={260 * tIn} fill="url(#purpleGlow)" opacity={0.55} />
          <Stickman x={290} y={GY + 20} pose={tPose} held={holding ? "bottle" : "staff"} eyes={love ? "heart" : "evil"} mouth={love ? "smile" : "grin"}
            outfit={{ head: "wild", beard: "#1d1717", robe: "#2a2233", tilak: "red", mala: true }} color="#efe6ff" seed={13} />
        </g>
      )}
      <NameTag x={290} y={GY - 470} at={fT + 3} text="TANTRIK SINGHIA" size={34} bg="#7b2cbf" fg="#ffffff" />
      <FloatingHearts x={400} y={GY - 420} from={fMohit} to={fJ - 6} />
      <Sparkles x={360} y={GY - 430} from={fJ} color="#e0b3ff" radius={130} />
      {f >= fVash && (
        <path
          d={`M 380 ${GY - 430} Q 560 ${GY - 620 + Math.sin(f / 5) * 30} ${lerp(380, 760, prog(f, fVash, fVash + 18))} ${GY - 360}`}
          stroke="#b45cff"
          strokeWidth={22}
          fill="none"
          strokeLinecap="round"
          opacity={0.65}
          filter="url(#softGlow)"
        />
      )}
    </SceneFrame>
  );
};

/* 7 ─────────────────────────── ROCK ─────────────────────────── */
export const Rock: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fPhenk = wordFrame(words, "phenk");
  const fRoll = wordFrame(words, "chattan", 2);
  const fK = wordFrame(words, "kuchal");
  const fMarte = wordFrame(words, "marte");
  const fShraap = wordFrame(words, "shraap");
  const fYahan = wordFrame(words, "yahan");
  const fNahi = wordFrame(words, "nahi");

  const throwT = prog(f, fPhenk - 6, fPhenk + 2);
  const pPose = f < fPhenk - 6 ? POSES.holdOut : f < fPhenk ? mixPose(POSES.holdOut, POSES.throwBack, throwT) : mixPose(POSES.throwBack, POSES.throwFwd, prog(f, fPhenk, fPhenk + 5));
  const fly = prog(f, fPhenk + 2, fPhenk + 16, Easing.linear);
  const bx = lerp(720, 230, fly);
  const by = lerp(GY - 300, 640, fly) - Math.sin(fly * Math.PI) * 260;
  const glow = prog(f, fPhenk + 16, fPhenk + 24);
  const roll = prog(f, fRoll - 4, fK, Easing.in(Easing.quad));
  const rx = lerp(220, 470, roll);
  const ry = lerp(640, GY - 95, roll);
  const crushed = f >= fK;
  const ghostRise = prog(f, fMarte, fMarte + 20, Easing.out(Easing.cubic));
  const zoomIn = prog(f, fYahan - 2, fYahan + 18, Easing.inOut(Easing.cubic));
  const sh = sumShake(shake(f, fK, 44, 24, "crash"), shake(f, fNahi, 30, 18, "nahi"), shake(f, fRoll, 6, 40, "roll"));
  const tScared = f >= fRoll - 4;

  return (
    <SceneFrame
      cam={{ zoom: lerp(1.02, 2.0, zoomIn), cx: lerp(540, 470, zoomIn), cy: lerp(950, 560, zoomIn), sx: sh.x, sy: sh.y, rot: sh.r }}
      flash={Math.max(flash(f, fK, 8, 0.9), flash(f, fNahi, 8, 0.7))}
      tint="#ff0000"
      tintOpacity={f >= fShraap ? 0.18 + 0.08 * Math.sin(f / 2) : 0}
    >
      <Sky id="rockSky" top="#0c0418" bottom="#3c1458" />
      <Stars count={50} />
      <Moon x={860} y={430} r={80} color="#e6d3ff" />
      {/* slope */}
      <path d={`M -100 ${GY} L -100 700 Q 120 690 300 760 Q 420 860 520 ${GY} Z`} fill="#2a1d3a" stroke="#120a1c" strokeWidth={5} />
      <Ground y={GY} color="#1a0f28" color2="#050208" />
      {!crushed && (
        <Stickman x={470} y={GY + 20} facing={tScared ? -1 : 1} pose={tScared ? POSES.scared : POSES.stand} eyes={tScared ? "big" : "evil"} mouth={tScared ? "scream" : "grin"}
          outfit={{ head: "wild", beard: "#1d1717", robe: "#2a2233", tilak: "red", mala: true }} color="#efe6ff" seed={13} />
      )}
      <Boulder x={crushed ? 470 : rx} y={crushed ? GY - 95 : ry} r={115} rot={roll * 400} glow={glow} />
      {f >= fPhenk + 2 && fly < 1 && (
        <g transform={`translate(${bx},${by}) rotate(${fly * 720})`}>
          <path d="M -7 -34 L 7 -34 L 7 -22 Q 22 -10 18 10 Q 14 26 0 26 Q -14 26 -18 10 Q -22 -10 -7 -22 Z" fill="#b45cff" stroke="#f0dcff" strokeWidth={3} />
        </g>
      )}
      {f >= fPhenk + 16 && <Sparkles x={220} y={640} from={fPhenk + 16} to={fK} color="#d9a6ff" radius={150} count={22} />}
      <Dust x={470} y={GY} at={fK} color="#6d5a80" spread={520} count={30} />
      {/* princess */}
      <Stickman x={820} y={GY + 20} facing={-1} pose={pPose} held={f < fPhenk + 2 ? "bottle" : "none"} eyes={crushed ? "big" : "angry"} mouth={crushed ? "o" : "frown"}
        outfit={{ head: "princess", lehenga: "#d7263d" }} seed={11} />
      {/* ghost of the tantrik */}
      {f >= fMarte && (
        <g>
          <circle cx={470} cy={GY - 420 - ghostRise * 60} r={240} fill="url(#redAura)" opacity={0.5 * ghostRise} />
          <Stickman x={470} y={GY - 120 - ghostRise * 150} scale={1.6} ghost opacity={ghostRise} color="#cfe6ff" pose={f >= fShraap - 4 ? POSES.curse : POSES.stand}
            eyes="glow" mouth={f >= fYahan ? "scream" : "grin"} outfit={{ head: "wild" }} seed={13} />
        </g>
      )}
      <Shockwave x={470} y={GY - 500} at={fShraap} max={1200} />
      <Shockwave x={470} y={GY - 500} at={fNahi} max={1400} color="#ffffff" />
    </SceneFrame>
  );
};

/* 8 ─────────────────────────── RUINS + BOARD ─────────────────────────── */
export const Ruins: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fYuddh = wordFrame(words, "yuddh");
  const fUjad = wordFrame(words, "ujad");
  const fAaj = wordFrame(words, "aaj");
  const fPr = wordFrame(words, "pravesh");
  const toRuins = prog(f, fUjad - 6, fUjad + 6);
  const sh = sumShake(shake(f, fYuddh, 10, 30, "war"), shake(f, fPr + 4, 22, 14, "st"));
  const swing = (i: number) => mixPose(POSES.sword, POSES.throwFwd, (Math.sin(f / 3 + i) + 1) / 2);
  return (
    <SceneFrame cam={{ zoom: 1 + 0.07 * prog(f, 0, dur), cx: 540, cy: 940, sx: sh.x, sy: sh.y, rot: sh.r }} flash={flash(f, fUjad - 2, 10, 0.6)}>
      {toRuins < 1 && (
        <g opacity={1 - toRuins}>
          <Sky id="warSky" top="#1e0606" bottom="#a3361a" />
          <Fort x={540} y={1060} scale={0.75} fill="#1a0a08" line="#3a140c" glow={1} />
          <Hills y={1100} colors={["#3a120a", "#2a0c08", "#1a0806"]} />
          <Ground y={GY} color="#2a0c08" />
          {new Array(5).fill(0).map((_, i) => (
            <Stickman key={`a${i}`} x={110 + i * 85} y={GY + 20 + (i % 2) * 18} scale={0.62} pose={swing(i)} held="sword" color="#0d0606" eyes="angry" mouth="scream" outfit={{ head: "helmet" }} seed={i} />
          ))}
          {new Array(5).fill(0).map((_, i) => (
            <Stickman key={`b${i}`} x={600 + i * 85} y={GY + 20 + ((i + 1) % 2) * 18} scale={0.62} facing={-1} pose={swing(i + 2)} held="sword" color="#0d0606" eyes="angry" mouth="scream" outfit={{ head: "pagdi" }} seed={i + 9} />
          ))}
          <Fog y={1000} opacity={0.6} speed={2} />
        </g>
      )}
      {toRuins > 0 && (
        <g opacity={toRuins}>
          <Sky id="ruinSky" top="#060914" bottom="#2c3a52" />
          <Stars count={40} opacity={0.7} />
          <Moon x={820} y={440} r={90} color="#dfe8ff" />
          <Fort x={560} y={1000} scale={0.62} fill="#11141e" line="#232838" ruined temple />
          <RuinedHouses y={GY + 10} scale={1.05} seed="bh" ghosts={0.35} fill="#3a4054" line="#141720" />
          <Ground y={GY + 10} color="#1b2130" color2="#05070b" />
          <Fog y={1150} opacity={0.8} />
          <WarningBoard x={540} y={GY + 150} scale={0.9} dropAt={fAaj - 2} stampAt={fPr} />
        </g>
      )}
    </SceneFrame>
  );
};

/* 9 ─────────────────────────── CTA ─────────────────────────── */
export const Cta: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fSach = wordFrame(words, "sach");
  const fPar = wordFrame(words, "par");
  const fAap = wordFrame(words, "aap");
  const fRaat = wordFrame(words, "raat");
  const fRuk = wordFrame(words, "rukoge");
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const zoom = prog(f, fAap - 4, fAap + 14);
  const eyes = prog(f, fRaat - 2, fRaat + 8);
  const hand = prog(f, fRaat + 4, fRuk + 10);
  const scared = f >= fRuk;
  const torch = { ...POSES.holdOut, rs: 96, re: 12 };
  const turned = f >= fAap;
  const subPart = f >= fAur;
  const tPose = subPart ? POSES.pointUp : scared ? POSES.scared : turned ? POSES.point : torch;
  const focus = prog(f, fAur - 2, fAur + 10);
  const sh = shake(f, fRuk, 14, 14, "cta");
  const hx = lerp(600, 770, hand);
  const hy = lerp(870, 900, hand);
  return (
    <>
    <SceneFrame
      transition="glitch"
      cam={{ zoom: lerp(1, 1.3, zoom), cx: lerp(540, 700, zoom), cy: lerp(960, 900, zoom), sx: sh.x, sy: sh.y }}
      tint="#000000"
      tintOpacity={focus * 0.55}
    >
      <Sky id="ctaSky" top="#04050e" bottom="#1c1530" />
      <Stars count={60} />
      <Moon x={860} y={520} r={84} color="#ffd7a8" />
      <Gate x={480} y={GY + 10} scale={0.92} fill="#241f30" line="#0b0a0f" />
      {/* eyes in the dark gate */}
      {eyes > 0 && (
        <g opacity={eyes}>
          <ellipse cx={440} cy={790} rx={22} ry={22 * eyes} fill="#ff2a2a" filter="url(#redGlow)" />
          <ellipse cx={520} cy={790} rx={22} ry={22 * eyes} fill="#ff2a2a" filter="url(#redGlow)" />
        </g>
      )}
      {hand > 0 && (
        <g opacity={0.8} filter="url(#ghostGlow)">
          <path d={`M 600 870 Q ${(600 + hx) / 2} ${hy - 40} ${hx} ${hy}`} stroke="#cfe6ff" strokeWidth={16} strokeLinecap="round" fill="none" />
          {[-24, 0, 24].map((a) => (
            <line key={a} x1={hx} y1={hy} x2={hx + 26 * Math.cos(((a - 10) * Math.PI) / 180)} y2={hy + 26 * Math.sin(((a + 20) * Math.PI) / 180)} stroke="#cfe6ff" strokeWidth={8} strokeLinecap="round" />
          ))}
        </g>
      )}
      <Fog y={1150} opacity={0.7} />
      <Ground y={GY + 10} color="#16121f" />
      <Stickman x={830} y={GY + 30} scale={1.35} facing={turned ? 1 : -1} pose={tPose} outfit={TOURIST} held="flashlight" beamOn={!turned}
        eyes={scared && !subPart ? "big" : "dot"} mouth={subPart ? "smile" : scared ? "scream" : turned ? "smile" : "flat"} seed={2} />
      {f < fPar + 6 && (
        <g opacity={1 - prog(f, fPar - 2, fPar + 6)}>
          <VoteButtons y={560} at={fSach - 2} left="SACH" right="KAHANI" />
        </g>
      )}
    </SceneFrame>
    {/* screen-space CTA layer: comment ask, then the subscribe card */}
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <SharedDefs />
        {f < fIti && (
          <g opacity={1 - prog(f, fAur, fIti)}>
            <CommentBubble x={540} y={520} at={fCom - 2} />
          </g>
        )}
        <ChannelCard x={540} y={470} at={fIti - 4} clickAt={fSub + 4} />
      </svg>
    </AbsoluteFill>
    </>
  );
};
