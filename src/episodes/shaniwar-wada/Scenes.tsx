import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Fort } from "../../components/Buildings";
import { FallenPagdi, Flames, Gaddi, Letter, Shout, SoundRings, WadaGate } from "../../components/Palace";
import { CommentBubble, DateBadge, HighwaySign, Lantern, NameTag, Pin, VoteButtons } from "../../components/Props";
import { SceneFrame } from "../../components/SceneFrame";
import { Dust, Fog, Ground, Hills, Moon, Sky, Sparkles, Stars, Sun } from "../../components/Scenery";
import { POSES, SharedDefs, Stickman, mixPose, walkPose } from "../../components/Stickman";
import { ChannelCard } from "../../components/Subscribe";
import { flash, lerp, mixColor, pop, prog, shake, sumShake, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };
const GY = 1180;
const NARAYAN = { head: "pagdi", pagdiColor: "#b0122a", sash: "#f2c14e" } as const;
const BAJIRAO = { head: "pagdi", pagdiColor: "#b0122a", mustache: true, sash: "#f2c14e" } as const;
const RAGHU = { head: "pagdi", pagdiColor: "#5a0a14", mustache: true, sash: "#2a2a2a" } as const;
const ANANDI = { head: "girl", veil: "#1f7a4a", lehenga: "#2a8a55" } as const;
const GARDI = { head: "helmet" } as const;
const TOURIST = { head: "cap", backpack: true } as const;

/* Courtyard backdrop (day or night) */
const Courtyard: React.FC<{ night?: boolean }> = ({ night = false }) => (
  <g>
    <rect x={-100} y={-100} width={1300} height={1300} fill={night ? "#120a10" : "#2a1418"} />
    <rect x={-100} y={560} width={1300} height={640} fill={night ? "#24161a" : "#4a2a22"} stroke="#120808" strokeWidth={4} />
    {[40, 300, 560, 820].map((x) => (
      <path key={x} d={`M ${x} ${GY} L ${x} 860 A 110 110 0 0 1 ${x + 220} 860 L ${x + 220} ${GY} Z`} fill={night ? "#08040a" : "#1a0a08"} stroke="#c99a3a" strokeWidth={5} />
    ))}
    <rect x={-100} y={GY} width={1300} height={800} fill={night ? "#1a1014" : "#6b3a22"} />
  </g>
);

const GhostBoy: React.FC<{ x: number; y: number; o: number; s?: number }> = ({ x, y, o, s = 1.15 }) => {
  const f = useCurrentFrame();
  return (
    <g opacity={o}>
      <circle cx={x} cy={y - 260 * s} r={230 * s} fill="url(#redAura)" opacity={0.45} />
      <Stickman x={x + Math.sin(f / 14) * 8} y={y + Math.sin(f / 10) * 8} scale={s} ghost color="#d6ecff" pose={POSES.shock} eyes="glow" mouth="scream"
        outfit={{ head: "pagdi", pagdiColor: "#b0122a" }} seed={3} />
    </g>
  );
};

/* 1 ─────────── HOOK: the scream at night ─────────── */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fCheekh = wordFrame(words, "cheekh");
  const fKaka = wordFrame(words, "kaka");
  const fYaani = wordFrame(words, "yaani");
  const ghost = prog(f, fKaka - 4, fKaka + 6);
  const sh = sumShake(shake(f, fCheekh, 22, 18, "ch"), shake(f, fKaka, 26, 18, "kk"));
  return (
    <SceneFrame transition="none" cam={{ zoom: 1 + 0.1 * prog(f, 0, dur, Easing.linear), cx: 540, cy: 880, sx: sh.x, sy: sh.y, rot: sh.r }}
      flash={flash(f, fKaka, 8, 0.6)} tint="#ff1a1a" tintOpacity={f >= fCheekh ? 0.1 + 0.05 * Math.sin(f / 3) : 0}>
      <Sky id="swHook" top="#04050f" bottom="#241a3a" />
      <Stars />
      <Moon x={540} y={560} r={150} color="#f3ecdc" />
      <WadaGate x={540} y={GY + 10} scale={0.95} fill="#2a2230" line="#0c080e" door="#2a1a10" />
      <Fog y={1130} opacity={0.8} />
      <Ground y={GY + 10} color="#120e18" />
      <SoundRings x={598} y={GY - 50} from={fCheekh} />
      {ghost > 0 && <GhostBoy x={540} y={GY + 20} o={ghost} />}
      <Shout x={540} y={640} at={fKaka} until={fYaani + 4} text="KAKA MALA VACHVA!" s={0.95} />
    </SceneFrame>
  );
};

/* 2 ─────────── LOCATION ─────────── */
export const Location: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fSh = wordFrame(words, "shaniwar");
  const fWada = wordFrame(words, "wada");
  return (
    <SceneFrame cam={{ zoom: 1 + 0.06 * prog(f, 0, dur), cx: 540, cy: 960 }}>
      <Sky id="swLoc" top="#2a2050" bottom="#f0905a" />
      <Sun x={880} y={760} r={80} />
      <Hills y={1060} colors={["#5a3a5a", "#4a2e48", "#3a2238"]} />
      <WadaGate x={700} y={GY + 10} scale={0.6} fill="#6b4e3c" line="#2a1a10" glow={0.6} />
      <Pin x={700} y={GY - 400} at={fWada} scale={0.7} />
      <Ground y={GY + 10} color="#3a2a2a" />
      <HighwaySign x={210} y={GY + 40} scale={0.5} popAt={fSh - 10} hi="शनिवार वाड़ा" en="SHANIWAR WADA" sub="PUNE • MAHARASHTRA" />
      <Stickman x={430} y={GY + 40} pose={walkPose(f * 0.36)} outfit={TOURIST} eyes={f > fWada ? "big" : "dot"} mouth={f > fWada ? "o" : "smile"} seed={2} />
    </SceneFrame>
  );
};

/* 3 ─────────── HISTORY: foundation on a Saturday ─────────── */
export const History: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fYear = wordFrame(words, "1730");
  const fBaji = wordFrame(words, "bajirao");
  const fSat = wordFrame(words, "shaniwar", 1);
  const fNaam = wordFrame(words, "naam");
  const build = 0.15 + 0.85 * prog(f, fYear, fNaam, Easing.inOut(Easing.quad));
  const badgeMove = prog(f, fBaji + 4, fBaji + 18);
  const cal = pop(f, fSat - 2, 30, 9);
  const hammer = (seed: number) => mixPose(POSES.holdUp, POSES.throwFwd, (Math.sin((f + seed) / 3.2) + 1) / 2);
  return (
    <SceneFrame cam={{ zoom: 1 + 0.05 * prog(f, 0, dur), cx: 540, cy: 920 }} tint="#c47a2c" tintOpacity={0.1} grain={0.1}>
      <Sky id="swHis" top="#e9a85e" bottom="#fbdcaa" />
      <Sun x={180} y={600} r={80} />
      <Hills y={1060} colors={["#c98d4e", "#b0733a", "#8a5a2b"]} />
      <WadaGate x={700} y={GY + 10} scale={0.62} fill="#8a6a4e" line="#3a2410" build={build} />
      {build < 0.98 && <Dust x={700} y={GY} at={fYear} color="#d9b07a" spread={360} />}
      <Ground y={GY + 10} color="#8a5a2b" color2="#2b190a" />
      <Stickman x={900} y={GY + 30} scale={0.6} facing={-1} pose={hammer(4)} color="#fff4df" seed={8} />
      <Stickman x={500} y={GY + 30} scale={0.6} pose={hammer(0)} color="#fff4df" seed={9} />
      {f >= fBaji - 6 && (
        <g transform={`translate(230,${GY + 40}) scale(${pop(f, fBaji - 6, 30, 11)}) translate(-230,${-(GY + 40)})`}>
          <Stickman x={230} y={GY + 40} scale={1.35} pose={POSES.point} held="sword" outfit={BAJIRAO} color="#fff4df" seed={1} />
        </g>
      )}
      <NameTag x={240} y={GY - 450} at={fBaji} text="BAJIRAO PESHWA" size={36} bg="#ffd84d" />
      <g transform={`translate(${lerp(540, 870, badgeMove)},${lerp(640, 470, badgeMove)}) scale(${lerp(1, 0.55, badgeMove)})`} opacity={1 - prog(f, fSat - 4, fSat + 2)}>
        <DateBadge x={0} y={0} at={fYear - 2} top="NEEV" big="1730" />
      </g>
      {f >= fSat - 2 && (
        <g transform={`translate(720,600) scale(${cal}) rotate(-5)`}>
          <rect x={-190} y={-120} width={380} height={240} rx={22} fill="#ffffff" stroke="#111" strokeWidth={8} />
          <rect x={-190} y={-120} width={380} height={70} rx={22} fill="#d0141a" />
          <text y={-70} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={40} fill="#ffffff" letterSpacing={4}>SATURDAY</text>
          <text y={60} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={74} fill="#111">SHANIWAR</text>
        </g>
      )}
    </SceneFrame>
  );
};

/* 4 ─────────── THE 17-YEAR-OLD PESHWA ─────────── */
export const Peshwa: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f17 = wordFrame(words, "17");
  const fNar = wordFrame(words, "narayanrao");
  const fRag = wordFrame(words, "raghunathrao");
  const fGad = wordFrame(words, "gaddi");
  const uncle = prog(f, fRag - 4, fRag + 8);
  const greed = prog(f, fGad - 2, fGad + 10);
  return (
    <SceneFrame cam={{ zoom: 1.02 + 0.06 * prog(f, 0, dur), cx: 540, cy: 960 }}>
      <Courtyard />
      <Gaddi x={620} y={GY + 30} s={0.9} glow={greed} />
      <Stickman x={620} y={GY - 20} scale={1.2} pose={POSES.meditate} eyes={f >= fGad ? "big" : "dot"} mouth={f >= fGad ? "o" : "smile"} outfit={NARAYAN} seed={3} />
      <NameTag x={640} y={GY - 360} at={fNar} text="NARAYANRAO PESHWA" size={34} bg="#ffd84d" />
      {uncle > 0 && (
        <g opacity={uncle}>
          <Stickman x={200} y={GY + 30} scale={1.3} pose={f >= fGad ? POSES.point : POSES.armsCrossed} eyes="evil" mouth="grin" outfit={RAGHU} seed={5} />
        </g>
      )}
      <NameTag x={300} y={GY - 470} at={fRag} text="CHACHA RAGHUNATHRAO" size={28} bg="#a3161a" fg="#ffffff" until={fGad + 30} />
      {greed > 0 && (
        <line x1={260} y1={GY - 360} x2={lerp(260, 560, greed)} y2={lerp(GY - 360, GY - 60, greed)} stroke="#f2c14e" strokeWidth={8} strokeDasharray="20 14" strokeDashoffset={-f * 3} />
      )}
      <g transform="translate(880,560) scale(0.62)">
        <DateBadge x={0} y={0} at={f17 - 2} top="UMAR" big="17" bottom="SAAL" />
      </g>
    </SceneFrame>
  );
};

/* 5 ─────────── THE CHANGED LETTER ─────────── */
export const LetterScene: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fCh = wordFrame(words, "chitthi");
  const fDhara = wordFrame(words, "dhara");
  const fPakdo = wordFrame(words, "pakdo");
  const fAn = wordFrame(words, "anandibai");
  const fBad = wordFrame(words, "badalkar");
  const fMaara = wordFrame(words, "maara");
  const lp = pop(f, fCh - 2, 30, 10);
  const strike = prog(f, fBad, fMaara - 4);
  const changed = prog(f, fMaara - 3, fMaara + 4);
  const sh = shake(f, fMaara, 30, 18, "mr");
  const quillX = lerp(900, 640, prog(f, fBad - 6, fBad + 6));
  return (
    <SceneFrame transition="glitch" cam={{ zoom: 1.02 + 0.05 * prog(f, 0, dur), cx: 540, cy: 900, sx: sh.x, sy: sh.y, rot: sh.r }}
      flash={flash(f, fMaara, 9, 0.7)} tint="#ff0000" tintOpacity={changed * (0.18 + 0.05 * Math.sin(f / 3))}>
      <rect x={-100} y={-100} width={1300} height={2200} fill="#0e0810" />
      <Lantern x={160} y={560} seed={1} />
      <Lantern x={920} y={560} seed={2} />
      <rect x={-100} y={GY} width={1300} height={800} fill="#1e1216" />
      <rect x={120} y={1000} width={840} height={40} rx={8} fill="#5a3418" />
      {f >= fCh - 2 && (
        <Letter x={540} y={720} s={lp * 0.95} line1="नारायणरावास" oldWord="धरावे" newWord="मारावे" strike={strike} changed={changed} glowOld={prog(f, fDhara - 2, fDhara + 6) * (1 - prog(f, fPakdo + 10, fPakdo + 20))} />
      )}
      {f >= fPakdo - 2 && f < fBad && (
        <g transform={`translate(540,470) scale(${pop(f, fPakdo - 2, 30, 9)})`}>
          <rect x={-200} y={-55} width={400} height={110} rx={55} fill="#2b6fe6" stroke="#ffffff" strokeWidth={6} />
          <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={60} fill="#ffffff">= PAKDO</text>
        </g>
      )}
      {f >= fMaara - 2 && (
        <g transform={`translate(540,470) scale(${pop(f, fMaara - 2, 30, 8)})`}>
          <rect x={-200} y={-55} width={400} height={110} rx={55} fill="#d0141a" stroke="#ffffff" strokeWidth={6} />
          <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={60} fill="#ffffff">= MAARO</text>
        </g>
      )}
      {f >= fAn - 4 && (
        <g opacity={prog(f, fAn - 4, fAn + 6)}>
          <Stickman x={880} y={GY + 30} facing={-1} scale={1.15} pose={f >= fBad - 6 ? POSES.holdOut : POSES.stand} eyes="evil" mouth="grin" outfit={ANANDI} seed={7} />
        </g>
      )}
      <NameTag x={840} y={GY - 420} at={fAn} text="CHACHI ANANDIBAI" size={30} bg="#1f7a4a" fg="#ffffff" />
      {f >= fBad - 6 && f < fMaara + 10 && (
        <g transform={`translate(${quillX},${800 + Math.sin(f / 2) * 10}) rotate(-35)`}>
          <path d="M 0 0 Q 30 -90 10 -190 Q -20 -90 0 0 Z" fill="#ffffff" stroke="#111" strokeWidth={4} />
          <line x1={0} y1={0} x2={6} y2={-180} stroke="#111" strokeWidth={3} />
        </g>
      )}
    </SceneFrame>
  );
};

/* 6 ─────────── THE ATTACK (shown without violence) ─────────── */
export const Attack: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fG = wordFrame(words, "gardi");
  const fNar = wordFrame(words, "narayanrao");
  const fKaka = wordFrame(words, "kaka");
  const fNahi = wordFrame(words, "nahi");
  const run = prog(f, fNar, fNahi, Easing.inOut(Easing.quad));
  const nx = lerp(620, 300, run);
  const gone = f >= fNahi;
  const sh = sumShake(shake(f, fNahi, 40, 24, "nh"), shake(f, fG, 8, 30, "gd"));
  const dark = prog(f, fNahi, fNahi + 8);
  const soldiers = [0, 1, 2];
  return (
    <SceneFrame cam={{ zoom: 1.02 + 0.06 * prog(f, 0, dur), cx: 540, cy: 960, sx: sh.x, sy: sh.y, rot: sh.r }} flash={flash(f, fNahi, 10, 0.85)}
      tint="#b00000" tintOpacity={dark * 0.45}>
      <Courtyard night />
      <Lantern x={170} y={820} seed={1} />
      <Lantern x={690} y={820} seed={3} />
      {/* uncle's doorway at the far left */}
      <rect x={20} y={GY - 330} width={140} height={330} fill="#050205" stroke="#c99a3a" strokeWidth={5} />
      <Stickman x={90} y={GY + 10} scale={0.9} facing={1} pose={POSES.armsCrossed} color="#0a0608" eyes="glow" mouth="none" outfit={RAGHU} seed={5} />
      {!gone && (
        <Stickman x={nx} y={GY + 30} scale={1.2} facing={-1} pose={f >= fNar ? walkPose(f * 0.55, 1, true) : POSES.scared} eyes="big" mouth="scream" outfit={NARAYAN} seed={3} />
      )}
      {soldiers.map((i) => {
        const sx = lerp(1250 + i * 130, nx + 260 + i * 130, prog(f, fG, fNahi, Easing.out(Easing.quad)));
        return (
          <Stickman key={i} x={sx} y={GY + 30 + (i % 2) * 14} scale={1.05} facing={-1} pose={f >= fG ? walkPose(f * 0.5 + i, 1, true) : POSES.stand} held="sword"
            color={gone ? "#1a0a0a" : "#d9d0c0"} eyes="angry" mouth="grin" outfit={GARDI} seed={20 + i} />
        );
      })}
      <Shout x={540} y={680} at={fKaka} until={fNahi - 2} text="KAKA MALA VACHVA!" s={0.85} />
      <FallenPagdi x={360} y={GY + 40} s={1.1} at={fNahi + 2} />
      <Dust x={360} y={GY} at={fNahi} color="#5a2a2a" spread={420} count={20} />
      <g opacity={1 - prog(f, fG - 4, fG + 4)}>
        <DateBadge x={540} y={600} at={0} top="30 AUGUST" big="1773" />
      </g>
    </SceneFrame>
  );
};

/* 7 ─────────── THE 1828 FIRE ─────────── */
export const Fire: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f1828 = wordFrame(words, "1828");
  const fAag = wordFrame(words, "aag", 1);
  const f7 = wordFrame(words, "7");
  const fPata = wordFrame(words, "pata");
  const burn = prog(f, fAag - 4, fAag + 20);
  const sh = shake(f, fAag, 20, 20, "fr");
  return (
    <SceneFrame cam={{ zoom: 1.02 + 0.07 * prog(f, 0, dur), cx: 540, cy: 900, sx: sh.x, sy: sh.y }} flash={flash(f, fAag, 8, 0.5)}>
      <Sky id="swFire" top={mixColor("#120814", "#3a0a06", burn)} bottom={mixColor("#2a1a30", "#e0501a", burn)} />
      <Stars opacity={1 - burn} />
      <Fort x={540} y={GY + 10} scale={0.9} fill="#1a0e08" line="#3a1a0a" glow={0.4 + 0.6 * burn} temple={false} />
      <Flames x0={420} x1={660} y={735} h={200} on={burn} />
      <Flames x0={300} x1={790} y={985} h={150} on={prog(f, fAag + 4, fAag + 24)} />
      <Ground y={GY + 10} color="#1a0a06" />
      <g transform="translate(540,560) scale(0.8)" opacity={1 - prog(f, f7 - 6, f7)}>
        <DateBadge x={0} y={0} at={f1828 - 2} top="SAN" big="1828" />
      </g>
      {f >= f7 - 2 && (
        <g transform="translate(540,560) scale(0.8)" opacity={1 - prog(f, fPata - 6, fPata)}>
          <DateBadge x={0} y={0} at={f7 - 2} top="" big="7" bottom="DIN TAK" />
        </g>
      )}
      {f >= fPata - 2 && (
        <text x={540} y={680} textAnchor="middle" fontFamily="Creepster" fontSize={300 * pop(f, fPata - 2, 30, 8)} fill="#ffffff" filter="url(#ghostGlow)">
          ?
        </text>
      )}
      <Sparkles x={540} y={700} from={fAag} color="#ffb347" radius={360} count={24} />
    </SceneFrame>
  );
};

/* 8 ─────────── TODAY: the cry on full-moon nights ─────────── */
export const Today: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fPoo = wordFrame(words, "poornima");
  const fCheekh = wordFrame(words, "cheekh");
  const moon = prog(f, fPoo - 4, fPoo + 10);
  const ghost = prog(f, fCheekh - 2, fCheekh + 8);
  const scared = f >= fCheekh;
  const torch = { ...POSES.holdOut, rs: 100, re: 12 };
  const sh = shake(f, fCheekh, 18, 14, "td");
  return (
    <SceneFrame cam={{ zoom: 1 + 0.08 * prog(f, 0, dur), cx: 540, cy: 900, sx: sh.x, sy: sh.y }} tint="#ff1a1a" tintOpacity={scared ? 0.1 : 0}>
      <Sky id="swToday" top="#03040c" bottom="#1d1838" />
      <Stars />
      <Moon x={760} y={500} r={lerp(80, 140, moon)} color={mixColor("#d9d2c0", "#fff6e0", moon)} />
      <WadaGate x={600} y={GY + 10} scale={0.8} fill="#2e2834" line="#0c080e" door="#2a1a10" />
      <Fog y={1130} opacity={0.8} />
      <Ground y={GY + 10} color="#120e18" />
      {ghost > 0 && <GhostBoy x={640} y={GY + 20} o={ghost} s={1.0} />}
      <SoundRings x={640} y={GY - 300} from={fCheekh} color="#ff6a6a" />
      <Stickman x={170} y={GY + 40} pose={scared ? POSES.scared : torch} outfit={TOURIST} held="flashlight" beamOn={!scared} eyes={scared ? "big" : "dot"} mouth={scared ? "scream" : "flat"} seed={2} />
    </SceneFrame>
  );
};

/* 9 ─────────── CTA ─────────── */
export const Cta: React.FC<SP> = ({ words }) => {
  const f = useCurrentFrame();
  const fSach = wordFrame(words, "sach");
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const subPart = f >= fAur;
  const focus = prog(f, fAur - 2, fAur + 10);
  return (
    <>
      <SceneFrame transition="glitch" cam={{ zoom: 1.02, cx: 540, cy: 960 }} tint="#000000" tintOpacity={focus * 0.55}>
        <Sky id="swCta" top="#03040c" bottom="#1d1838" />
        <Stars />
        <Moon x={540} y={560} r={130} color="#f3ecdc" />
        <WadaGate x={540} y={GY + 10} scale={0.9} fill="#2a2230" line="#0c080e" door="#2a1a10" />
        <GhostBoy x={440} y={GY + 10} o={0.6} s={0.9} />
        <Fog y={1140} opacity={0.8} />
        <Ground y={GY + 10} color="#120e18" />
        <Stickman x={860} y={GY + 40} scale={1.25} facing={subPart ? 1 : -1} pose={subPart ? POSES.pointUp : POSES.think} outfit={TOURIST} eyes="dot" mouth={subPart ? "smile" : "flat"} seed={2} />
      </SceneFrame>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <SharedDefs />
          {f < fCom + 4 && (
            <g opacity={1 - prog(f, fCom - 4, fCom + 4)}>
              <VoteButtons y={560} at={fSach - 2} left="SACH" right="VAHAM" />
            </g>
          )}
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

export const SCENES = { hook: Hook, location: Location, history: History, peshwa: Peshwa, letter: LetterScene, attack: Attack, fire: Fire, today: Today, cta: Cta };
