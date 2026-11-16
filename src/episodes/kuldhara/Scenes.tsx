import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Fort, RuinedHouses } from "../../components/Buildings";
import { Camel, Campfire, Coins, CropField, Dunes, NoWater, Scroll, VillageHouses, Well } from "../../components/Desert";
import { CommentBubble, DateBadge, HighwaySign, NameTag, Pin, VoteButtons } from "../../components/Props";
import { SceneFrame } from "../../components/SceneFrame";
import { Dust, Fog, Ground, Lightning, Moon, Shockwave, Sky, Sparkles, Stars, Sun } from "../../components/Scenery";
import { POSES, SharedDefs, Stickman, mixPose, walkPose } from "../../components/Stickman";
import { ChannelCard } from "../../components/Subscribe";
import { flash, lerp, mixColor, pop, prog, shake, sumShake, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };
const GY = 1180;
const SAND_DAY = { fill: "#c99558", line: "#6e4626" };
const SAND_NIGHT = { fill: "#4a3628", line: "#22160e" };
const PALIWAL = { head: "pagdi", pagdiColor: "#f4f1ea", mustache: true } as const;
const MUKHIYA = { head: "pagdi", pagdiColor: "#f4f1ea", beard: "#f1f1f1" } as const;
const DIWAN = { head: "pagdi", pagdiColor: "#7a0f1f", mustache: true, sash: "#111111" } as const;
const BETI = { head: "girl", veil: "#d7263d", lehenga: "#ff8a1c" } as const;
const TOURIST = { head: "cap", backpack: true } as const;

/* 1 ─────────── HOOK: ruined village → flashback → people vanish ─────────── */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f200 = wordFrame(words, "200");
  const fKehte = wordFrame(words, "kehte");
  const fRaat = wordFrame(words, "raat");
  const fGayab = wordFrame(words, "gayab");
  const past = prog(f, fKehte - 3, fKehte + 5) * (1 - prog(f, fGayab + 4, fGayab + 10));
  const gone = f >= fGayab + 8;
  const flickerVillager = f >= fGayab && f < fGayab + 8 ? (f % 2 === 0 ? 0.15 : 1) : 1;
  const sh = shake(f, fGayab, 30, 18, "gy");
  const villagers = [120, 260, 420, 600, 760, 930];
  return (
    <SceneFrame
      transition="none"
      cam={{ zoom: 1 + 0.08 * prog(f, 0, dur, Easing.linear) + 0.04 * prog(f, fRaat, fGayab), cx: 540, cy: 950, sx: sh.x, sy: sh.y, rot: sh.r }}
      flash={Math.max(flash(f, fKehte - 1, 7, 0.5), flash(f, fGayab, 9, 0.85))}
      tint="#e0a35e"
      tintOpacity={0.16 * past}
    >
      <Sky id="kHookSky" top="#05070f" bottom={mixColor("#241a3a", "#3b2a4a", past)} />
      <Stars />
      <Moon x={820} y={520} r={90} />
      <Dunes y={1070} colors={["#1d1a30", "#16132a", "#100d20"]} />
      <g opacity={1 - past}>
        <RuinedHouses y={GY + 10} scale={1.05} seed="kh" fill={SAND_NIGHT.fill} line={SAND_NIGHT.line} ghosts={gone ? 0.3 : 0} />
      </g>
      <g opacity={past}>
        <VillageHouses y={GY + 10} scale={1.05} seed="kh" fill="#6a4c34" line="#2a1a0e" lit={1} />
      </g>
      <Ground y={GY + 10} color={mixColor("#1a1420", "#2a1c14", past)} />
      {past > 0 && !gone &&
        villagers.map((vx, i) => (
          <g key={vx} opacity={past * flickerVillager}>
            <Stickman x={vx} y={GY + 40} scale={0.85} facing={i % 2 ? -1 : 1} pose={i % 3 === 0 ? POSES.wave : POSES.stand}
              outfit={i === 2 ? BETI : i % 2 ? { head: "pagdi", pagdiColor: "#e8741e", mustache: true } : PALIWAL} seed={i} />
          </g>
        ))}
      {villagers.map((vx) => (
        <Dust key={vx} x={vx} y={GY} at={fGayab + 2} color="#8a7a9a" spread={120} count={6} />
      ))}
      <Fog y={1120} opacity={0.6} />
      <g opacity={1 - prog(f, fKehte - 6, fKehte)}>
        <DateBadge x={540} y={640} at={f200 - 2} top="VEERAAN" big="200" bottom="SAAL SE" />
      </g>
    </SceneFrame>
  );
};

/* 2 ─────────── LOCATION ─────────── */
export const Location: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fJ = wordFrame(words, "jaisalmer");
  const fK = wordFrame(words, "kuldhara");
  return (
    <SceneFrame cam={{ zoom: 1 + 0.06 * prog(f, 0, dur), cx: 540, cy: 960 }}>
      <Sky id="kLocSky" top="#f39a52" bottom="#ffd99a" />
      <Sun x={800} y={640} r={90} />
      <Fort x={790} y={1010} scale={0.34} fill="#b9773e" line="#7a4a22" hill />
      <Dunes y={1070} colors={["#e0a35e", "#d0904c", "#bf7f3d"]} drift={f * 1.5} />
      <g transform="translate(0,-40)">
        <RuinedHouses y={1080} scale={0.5} seed="kl" fill="#b88a5a" line="#6e4626" />
      </g>
      <Pin x={560} y={960} at={fK} scale={0.7} />
      <Ground y={GY} color="#c98b4c" color2="#4a2c14" />
      <HighwaySign x={300} y={GY + 30} scale={0.66} popAt={fJ - 10} hi="कुलधरा" en="KULDHARA" sub="JAISALMER • RAJASTHAN" />
      <Stickman x={840} y={GY + 30} facing={-1} pose={walkPose(f * 0.36)} outfit={TOURIST} eyes={f > fK ? "big" : "dot"} mouth={f > fK ? "o" : "smile"} seed={2} />
    </SceneFrame>
  );
};

/* 3 ─────────── HISTORY: Paliwals, farming, trade ─────────── */
export const History: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fSaat = wordFrame(words, "saat");
  const fPal = wordFrame(words, "paliwal");
  const fKheti = wordFrame(words, "kheti");
  const fVy = wordFrame(words, "vyapaar");
  const fKam = wordFrame(words, "kamaal");
  const badgeMove = prog(f, fPal + 6, fPal + 20);
  const pIn = pop(f, fPal - 4, 30, 11);
  const camelX = lerp(1300, 860, prog(f, fVy - 10, fVy + 24, Easing.out(Easing.quad)));
  const cheer = f >= fKam;
  return (
    <SceneFrame cam={{ zoom: 1 + 0.06 * prog(f, 0, dur), cx: 540, cy: 920 }} tint="#c47a2c" tintOpacity={0.1} grain={0.1}>
      <Sky id="kHisSky" top="#f2b467" bottom="#fde3b0" />
      <Sun x={180} y={560} r={85} />
      <Dunes y={1040} colors={["#e6b070", "#d89e5c", "#c98b4c"]} />
      <VillageHouses y={GY - 30} scale={0.9} seed="kv" fill={SAND_DAY.fill} line={SAND_DAY.line} />
      <Ground y={GY - 30} color="#c98b4c" color2="#5a3418" />
      <CropField y={GY + 30} grow={prog(f, fKheti - 4, fKheti + 28)} x0={40} x1={600} />
      <g transform={`translate(400,${GY + 20}) scale(${pIn}) translate(-400,${-(GY + 20)})`}>
        <Stickman x={300} y={GY + 20} pose={cheer ? POSES.cheer : POSES.hips} outfit={PALIWAL} color="#fff4df" seed={1} />
        <Stickman x={480} y={GY + 20} facing={-1} pose={cheer ? POSES.cheer : POSES.wave} outfit={{ head: "pagdi", pagdiColor: "#e8741e", mustache: true }} color="#fff4df" seed={3} />
      </g>
      <NameTag x={390} y={GY - 430} at={fPal} text="PALIWAL BRAHMIN" size={36} bg="#ffd84d" />
      {f >= fVy - 10 && <Camel x={camelX} y={GY + 30} scale={0.9} facing={-1} phase={f * 0.35} />}
      <Coins x0={860} y0={GY - 260} from={fVy + 4} count={12} />
      <Sparkles x={540} y={GY - 300} from={fKam} color="#fff3b0" radius={320} count={20} />
      <g transform={`translate(${lerp(540, 870, badgeMove)},${lerp(640, 480, badgeMove)}) scale(${lerp(1, 0.55, badgeMove)})`}>
        <DateBadge x={0} y={0} at={fSaat - 2} top="KAREEB" big="700" bottom="SAAL PEHLE" />
      </g>
    </SceneFrame>
  );
};

/* Darbar backdrop */
const Darbar: React.FC = () => (
  <g>
    <rect x={-100} y={-100} width={1300} height={1300} fill="#2a0d12" />
    <rect x={-100} y={560} width={1300} height={640} fill="#3a1418" stroke="#1a0608" strokeWidth={4} />
    {[40, 300, 560, 820].map((x) => (
      <g key={x}>
        <path d={`M ${x} ${GY} L ${x} 860 A 110 110 0 0 1 ${x + 220} 860 L ${x + 220} ${GY} Z`} fill="#1a0608" stroke="#c99a3a" strokeWidth={6} />
      </g>
    ))}
    <rect x={-100} y={GY} width={1300} height={800} fill="#5a1a20" />
    <rect x={160} y={GY + 6} width={760} height={30} fill="#a3161a" />
  </g>
);

/* 4 ─────────── DIWAN SALIM SINGH ─────────── */
export const Diwan: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fDiwan = wordFrame(words, "diwan");
  const fTax = wordFrame(words, "tax");
  const fKehte = wordFrame(words, "kehte");
  const fNazar = wordFrame(words, "nazar");
  const fBeti = wordFrame(words, "beti");
  const evil = f >= fNazar;
  const scroll = pop(f, fTax - 2, 30, 9) * (1 - prog(f, fKehte - 2, fKehte + 6));
  const line = prog(f, fNazar, fNazar + 10);
  const sh = shake(f, fTax, 14, 12, "tax");
  return (
    <SceneFrame transition="glitch" cam={{ zoom: 1.02 + 0.06 * prog(f, 0, dur), cx: 540, cy: 960, sx: sh.x, sy: sh.y }}>
      <Darbar />
      <Stickman x={280} y={GY + 20} scale={1.4} pose={f >= fTax ? POSES.point : POSES.armsCrossed} eyes={evil ? "evil" : "angry"} mouth="grin" outfit={DIWAN} seed={5} />
      <NameTag x={280} y={GY - 490} at={fDiwan} text="DIWAN SALIM SINGH" size={34} bg="#a3161a" fg="#ffffff" until={fNazar - 2} />
      <Stickman x={720} y={GY + 20} facing={-1} pose={evil ? POSES.shock : POSES.stand} eyes={f >= fTax ? "sad" : "dot"} mouth={f >= fTax ? "frown" : "flat"} outfit={MUKHIYA} seed={6} />
      <Stickman x={880} y={GY + 20} scale={1.15} facing={-1} pose={evil ? POSES.cower : POSES.stand} eyes={evil ? "big" : "dot"} mouth={evil ? "o" : "smile"} outfit={BETI} seed={7} />
      <NameTag x={790} y={GY - 360} at={fBeti} text="MUKHIYA KI BETI" size={30} bg="#ffd84d" />
      {scroll > 0.01 && <Scroll x={720} y={560} s={scroll * 0.85} text="TAX" />}
      <Coins x0={720} y0={GY - 300} x1={300} y1={GY - 330} from={fTax + 2} count={10} />
      {line > 0 && (
        <line
          x1={335}
          y1={GY - 395}
          x2={lerp(335, 880, line)}
          y2={lerp(GY - 395, GY - 330, line)}
          stroke="#ff2a2a"
          strokeWidth={8}
          strokeDasharray="22 14"
          strokeDashoffset={-f * 3}
          filter="url(#redGlow)"
        />
      )}
    </SceneFrame>
  );
};

/* 5 ─────────── THREAT → NIGHT PANCHAYAT ─────────── */
export const Council: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fDh = wordFrame(words, "dhamki");
  const fBura = wordFrame(words, "bura");
  const fTab = wordFrame(words, "tab");
  const f84 = wordFrame(words, "84");
  const fPan = wordFrame(words, "panchayat");
  const toNight = prog(f, fTab - 4, fTab + 6);
  const shadow = prog(f, fDh - 2, fDh + 14);
  const sh = shake(f, fBura, 32, 18, "bura");
  return (
    <SceneFrame cam={{ zoom: 1 + 0.06 * prog(f, 0, dur), cx: 540, cy: 960, sx: sh.x, sy: sh.y, rot: sh.r }} flash={flash(f, fBura, 9, 0.8)}
      tint="#ff0000" tintOpacity={(1 - toNight) * shadow * 0.18}>
      {toNight < 1 && (
        <g opacity={1 - toNight}>
          <Sky id="kThreat" top="#1a0204" bottom="#7a1414" />
          <g opacity={shadow * 0.92}>
            <Stickman x={540} y={GY + 470} scale={3.4} pose={POSES.point} color="#090304" eyes="glow" mouth="grin" outfit={{ ...DIWAN, sash: "#090304" }} seed={5} />
          </g>
          <VillageHouses y={GY + 10} scale={1.05} seed="kc" fill="#3a2418" line="#140a06" />
          <Ground y={GY + 10} color="#1a0a06" />
          <Lightning x={820} at={fBura - 1} seed="kb" y2={980} />
        </g>
      )}
      {toNight > 0 && (
        <g opacity={toNight}>
          <Sky id="kNight" top="#04050e" bottom="#1d1838" />
          <Stars />
          <Moon x={850} y={480} r={70} />
          <VillageHouses y={GY - 20} scale={0.95} seed="kc" fill="#3c2c22" line="#140a06" lit={0.7} />
          <Ground y={GY - 20} color="#1a1420" />
          <Campfire x={540} y={GY + 40} scale={0.75} />
          {[150, 280].map((x, i) => (
            <Stickman key={x} x={x} y={GY + 50} scale={0.95} pose={POSES.meditate} eyes="sad" mouth="flat" outfit={i ? PALIWAL : { head: "pagdi", pagdiColor: "#e8741e", mustache: true }} seed={10 + i} />
          ))}
          {[800, 930].map((x, i) => (
            <Stickman key={x} x={x} y={GY + 50} scale={0.95} facing={-1} pose={POSES.meditate} eyes="sad" mouth="flat" outfit={i ? { head: "pagdi", pagdiColor: "#e8741e", mustache: true } : PALIWAL} seed={12 + i} />
          ))}
          <Stickman x={400} y={GY + 50} scale={1.05} pose={POSES.point} eyes="angry" mouth="o" outfit={MUKHIYA} seed={6} />
          <Stickman x={1010} y={GY + 50} scale={0.95} facing={-1} pose={POSES.holdUp} held="torch" outfit={PALIWAL} seed={14} />
          <Stickman x={60} y={GY + 50} scale={0.95} pose={POSES.holdUp} held="torch" outfit={PALIWAL} seed={15} />
          <NameTag x={560} y={GY - 340} at={fPan} text="RAAT KI PANCHAYAT" size={34} bg="#ffd84d" />
        </g>
      )}
      <DateBadge x={540} y={590} at={f84 - 2} top="" big="84" bottom="GAON" />
    </SceneFrame>
  );
};

/* 6 ─────────── OVERNIGHT EXODUS ─────────── */
export const Exodus: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fKoi = wordFrame(words, "koi");
  const fKahan = wordFrame(words, "kahan");
  const fade = 1 - 0.85 * prog(f, fKahan - 4, fKahan + 10);
  const q = pop(f, fKahan, 30, 8);
  const walkers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <SceneFrame cam={{ zoom: 1 + 0.05 * prog(f, 0, dur), cx: 540, cy: 960 }}>
      <Sky id="kExSky" top="#03040c" bottom="#1a2140" />
      <Stars />
      <Moon x={870} y={460} r={95} />
      <Dunes y={1060} colors={["#1d2240", "#161a33", "#10132a"]} drift={-f * 0.6} />
      <VillageHouses y={1070} scale={0.5} seed="ke" x0={640} x1={1140} fill="#3c2c22" line="#140a06" lit={1 - prog(f, 0, fKoi)} />
      <Ground y={GY - 10} color="#141a30" />
      <g opacity={fade}>
        {walkers.map((i) => {
          const x = 640 + i * 150 - f * 3.0 - (i % 2) * 40;
          if (x < -200 || x > 1300) return null;
          if (i === 3 || i === 7) return <Camel key={i} x={x} y={GY + 10} scale={0.75} facing={-1} color="#7a5634" phase={f * 0.35 + i} />;
          return (
            <Stickman key={i} x={x} y={GY + 20} scale={0.9} facing={-1} pose={walkPose(f * 0.35 + i)}
              outfit={i === 2 ? { ...BETI, bundle: false } : { ...PALIWAL, bundle: i % 2 === 0 }} held={i === 0 || i === 5 ? "torch" : "none"} eyes="sad" mouth="frown" seed={20 + i} />
          );
        })}
      </g>
      <Fog y={1130} opacity={0.4 + 0.6 * prog(f, fKoi - 6, fKahan + 6)} count={9} />
      {f >= fKahan && (
        <text x={540} y={860} textAnchor="middle" fontFamily="Creepster" fontSize={300 * q} fill="#ffffff" opacity={0.85} filter="url(#ghostGlow)">
          ?
        </text>
      )}
    </SceneFrame>
  );
};

/* 7 ─────────── THE CURSE ─────────── */
export const Curse: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fUn = wordFrame(words, "unhone");
  const fSh = wordFrame(words, "shraap");
  const fNahi = wordFrame(words, "nahi");
  const ruin = prog(f, fSh + 2, fSh + 12);
  const pose = mixPose(POSES.stand, POSES.curse, prog(f, fUn, fSh - 2));
  const sh = sumShake(shake(f, fSh, 38, 22, "ksh"), shake(f, fNahi, 30, 18, "kn"));
  const red = prog(f, fSh, fSh + 4);
  return (
    <SceneFrame cam={{ zoom: 1.02 + 0.08 * prog(f, 0, dur), cx: 540, cy: 960, sx: sh.x, sy: sh.y, rot: sh.r }}
      flash={Math.max(flash(f, fSh, 10, 0.9), flash(f, fNahi, 8, 0.6))} tint="#ff0000" tintOpacity={red * (0.2 + 0.06 * Math.sin(f / 2.5))}>
      <Sky id="kCuSky" top={mixColor("#0a0610", "#1a0204", red)} bottom={mixColor("#2a2040", "#7a1414", red)} />
      <Stars opacity={1 - red} />
      <Moon x={820} y={480} r={80} color={red > 0.5 ? "#ff8a6a" : "#ffe7b8"} />
      <g opacity={1 - ruin}>
        <VillageHouses y={GY + 10} scale={1.05} seed="kc2" fill="#4a3628" line="#1a0e08" />
      </g>
      <g opacity={ruin}>
        <RuinedHouses y={GY + 10} scale={1.05} seed="kc2" fill="#3a2a20" line="#140a06" ghosts={0.3} />
      </g>
      <Ground y={GY + 10} color="#1a0e10" />
      <circle cx={420} cy={GY - 200} r={230} fill="url(#redAura)" opacity={red * (0.6 + 0.3 * Math.sin(f / 4))} />
      <Stickman x={420} y={GY + 40} scale={1.3} pose={pose} eyes={f >= fSh ? "glow" : "angry"} mouth={f >= fSh ? "scream" : "frown"} outfit={MUKHIYA} seed={6} />
      <Shockwave x={420} y={GY - 300} at={fSh} max={1300} />
      <Lightning x={760} at={fSh - 1} seed="kcu" y2={1000} len={9} />
      <Dust x={700} y={GY} at={fNahi} color="#5a4030" spread={600} count={30} />
    </SceneFrame>
  );
};

/* 8 ─────────── TODAY + WHAT HISTORIANS SAY ─────────── */
export const Today: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fIt = wordFrame(words, "itihaaskar");
  const fPaani = wordFrame(words, "paani");
  const fTax = wordFrame(words, "tax");
  const walkIn = prog(f, 0, 44, Easing.out(Easing.quad));
  const tPose = f < 44 ? walkPose(f * 0.34, 1 - walkIn * 0.4) : f >= fIt ? mixPose(POSES.stand, { ...POSES.stand, head: 10 }, 1) : POSES.think;
  return (
    <SceneFrame cam={{ zoom: 1 + 0.06 * prog(f, 0, dur), cx: 540, cy: 960 }}>
      <Sky id="kTdSky" top="#f1c98a" bottom="#fbe7c4" />
      <Sun x={850} y={520} r={80} />
      <Dunes y={1060} colors={["#e3b27a", "#d8a066", "#cd9256"]} />
      <RuinedHouses y={GY + 10} scale={1.05} seed="kt" fill="#b88a5a" line="#6e4626" />
      <Ground y={GY + 10} color="#c98b4c" color2="#4a2c14" />
      <Fog y={1110} opacity={0.35} speed={2} />
      {f >= fPaani - 2 && (
        <g transform={`translate(560,${GY + 60}) scale(${pop(f, fPaani - 2, 30, 10)}) translate(-560,${-(GY + 60)})`}>
          <Well x={560} y={GY + 60} scale={0.75} dry />
        </g>
      )}
      <Stickman x={lerp(-60, 230, walkIn)} y={GY + 40} pose={tPose} outfit={TOURIST} eyes={f >= fPaani ? "big" : "dot"} mouth={f >= fPaani ? "o" : "flat"} seed={2} />
      {f >= fIt - 2 && (
        <g transform={`translate(860,${GY + 40}) scale(${pop(f, fIt - 2, 30, 10)}) translate(-860,${-(GY + 40)})`}>
          <Stickman x={860} y={GY + 40} facing={-1} pose={POSES.holdOut} held="book" outfit={{ glasses: true }} eyes="dot" mouth="flat" seed={30} />
        </g>
      )}
      <NameTag x={860} y={GY - 400} at={fIt} text="ITIHAASKAR" size={38} bg="#ffffff" />
      {f >= fPaani - 2 && <NoWater x={360} y={640} s={0.8 * pop(f, fPaani - 2, 30, 9)} />}
      {f >= fTax - 2 && <Scroll x={720} y={640} s={0.62 * pop(f, fTax - 2, 30, 9)} text="TAX" />}
      <Coins x0={720} y0={700} from={fTax + 2} count={8} />
    </SceneFrame>
  );
};

/* 9 ─────────── CTA: comment + subscribe ─────────── */
export const Cta: React.FC<SP> = ({ words }) => {
  const f = useCurrentFrame();
  const fSh = wordFrame(words, "shraap");
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const subPart = f >= fAur;
  const focus = prog(f, fAur - 2, fAur + 10);
  const torch = { ...POSES.holdOut, rs: 96, re: 12 };
  const ghosts = [180, 470, 640];
  return (
    <>
      <SceneFrame transition="glitch" cam={{ zoom: 1.02, cx: 540, cy: 960 }} tint="#000000" tintOpacity={focus * 0.55}>
        <Sky id="kCtaSky" top="#04050e" bottom="#1c1530" />
        <Stars />
        <Moon x={860} y={560} r={80} />
        <RuinedHouses y={GY + 10} scale={1.05} seed="kq" fill="#3e3028" line="#140a06" ghosts={0.4} />
        {ghosts.map((gx, i) => (
          <Stickman key={gx} x={gx + Math.sin(f / 20 + i) * 20} y={GY - 40 + Math.sin(f / 12 + i) * 10} scale={0.85} ghost opacity={0.7} color="#cfe6ff"
            pose={POSES.stand} eyes="glow" mouth="o" outfit={{ ...PALIWAL, bundle: i !== 1 }} facing={i % 2 ? -1 : 1} seed={40 + i} />
        ))}
        <Fog y={1150} opacity={0.8} />
        <Ground y={GY + 10} color="#16121f" />
        <Stickman x={850} y={GY + 30} scale={1.3} facing={subPart ? 1 : -1} pose={subPart ? POSES.pointUp : torch} outfit={TOURIST} held="flashlight" beamOn={!subPart}
          eyes="dot" mouth={subPart ? "smile" : "flat"} seed={2} />
      </SceneFrame>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <SharedDefs />
          {f < fCom + 4 && (
            <g opacity={1 - prog(f, fCom - 4, fCom + 4)}>
              <VoteButtons y={560} at={fSh - 2} left="SHRAAP" right="PAANI" />
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

export const SCENES = { hook: Hook, location: Location, history: History, diwan: Diwan, council: Council, exodus: Exodus, curse: Curse, today: Today, cta: Cta };
