import React, { useMemo } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { CommentBubble, DateBadge, NameTag, VoteButtons } from "../../components/Props";
import { ChannelCard } from "../../components/Subscribe";
import { BP, Bean, BeanLook } from "../../components/three/Bean";
import { alpsH, Alps, ArchiveBox, Atom, Bed, Burst, Calendar, Candle, Dacha, Flask, Folder, Jet, Pine, Room, Table } from "../../components/three/Mystery3D";
import { Chip, Stamp } from "../../components/three/Overlays";
import { Radio, Shelves } from "../../components/three/Props3D";
import { Stage3D } from "../../components/three/Stage3D";
import { CameraRig, Clouds, lerp3, SkyDome, Snowfall, softTexture, Stars, textTexture } from "../../components/three/World";
import { flash, pop, prog, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };
type V3 = [number, number, number];

const OY = 640;
const SHASTRI: BeanLook = { body: "#f2efe6", legs: "#f2efe6", hat: "gandhi", skin: "#b88462" };
const BHABHA: BeanLook = { body: "#2a3038", legs: "#2a3038", hat: "hair", skin: "#d8ab88" };
const DELEGATE: BeanLook = { body: "#24242c", legs: "#24242c", hat: "hair", hatColor: "#3a3a3a", skin: "#d2a07a" };
const SHADOW: BeanLook = { body: "#14141a", legs: "#14141a", hat: "ranger", hatColor: "#0e0e12", skin: "#2a2420", coat: true };

/** The candle-lit calendar room (hook + CTA). */
const CalendarRoom: React.FC<{ circled: number[]; outAt: number }> = ({ circled, outAt }) => (
  <>
    <color attach="background" args={["#0c0806"]} />
    <ambientLight intensity={0.22} />
    <pointLight position={[3, 4, 3]} color="#7f95d8" intensity={6} distance={14} />
    <Room wall="#3a2a22" floor="#1e1610" w={10} d={4} h={6} windowGlow={0.7} />
    <Calendar position={[0, 2.75, -1.95]} circled={circled} />
    <Table position={[0, 0, 0.4]} w={3.4} d={1.4} h={1.0} />
    <Candle position={[-0.95, 1.05, 0.5]} outAt={outAt} />
    <Candle position={[0.95, 1.05, 0.5]} outAt={outAt} h={0.55} />
  </>
);

/* 1 ── HOOK: January 1966 — two dates, two candles */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fS = wordFrame(words, "sirf");
  const fD = wordFrame(words, "din");
  const fK = wordFrame(words, "kho");
  const circled = f >= fD ? [11, 24] : f >= fS ? [11] : [];
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  return (
    <Stage3D
      entryFlash={false}
      exposure={1.25}
      flashOp={flash(f, fK, 6, 0.45)}
      tint="#000000"
      tintOp={0.35 * prog(f, fK, fK + 10)}
      overlay={<g>
        <Chip x={540} y={1255} at={fS} text="11 JAN — 24 JAN" until={fD - 2} bg="#7a1010" />
        <Stamp x={540} y={1255} at={fD} text="SIRF 13 DIN" size={70} />
      </g>}
    >
      <CalendarRoom circled={circled} outAt={fK} />
      <CameraRig pos={lerp3([0, 2.2, 5.6], [0, 2.3, 4.2], t)} look={[0, 2.3, -1.5]} fov={50} />
    </Stage3D>
  );
};

/* 2 ── SHASTRI: Tashkent declaration, then the night he died */
export const Shastri: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fT = wordFrame(words, "tashkent");
  const fG = wordFrame(words, "ghante");
  const fL = wordFrame(words, "lal");
  const fM = wordFrame(words, "maut");
  const night = f >= fG - 2;
  const ta = prog(f, 0, fG - 2);
  const tb = prog(f, fG - 2, dur, Easing.inOut(Easing.quad));
  const light = 1 - prog(f, fM - 2, fM + 4);
  const papers = useMemo(() => textTexture([{ text: "DECLARATION", size: 70, color: "#2a2a2a" }, { text: "TASHKENT • 10.1.1966", size: 46, color: "#555" }], 768, 512, "#f6f1e2"), []);
  return (
    <Stage3D
      flashOp={flash(f, fG - 2, 6, 0.35) + flash(f, fM, 6, 0.3)}
      overlay={<g>
        <NameTag x={540} y={OY} at={fT} text="TASHKENT, 1966" size={50} bg="#ffd84d" until={fG - 4} />
        {night && f < fM - 2 && <g transform="translate(850,500) scale(0.6)"><DateBadge x={0} y={0} at={fG} top="11 JANUARY" big="1966" /></g>}
        <NameTag x={540} y={OY} at={fL} text="PM LAL BAHADUR SHASTRI" size={42} bg="#f2efe6" until={fM - 2} />
        <Stamp x={540} y={OY} at={fM} text="ACHANAK MAUT" size={76} />
      </g>}
    >
      {!night ? (
        <>
          <color attach="background" args={["#1a120c"]} />
          <ambientLight intensity={0.55} />
          <pointLight position={[0, 5, 1.5]} color="#ffe2b0" intensity={40} distance={14} castShadow />
          <Room wall="#6a5038" floor="#3a2416" w={14} d={6} h={6} />
          <Table position={[0, 0, 0]} w={5} d={1.6} h={1.0} cloth="#2a5a3a" />
          {[-1.4, 1.4].map((x) => (
            <mesh key={x} position={[x, 1.07, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.9, 0.6]} />
              <meshStandardMaterial map={papers} />
            </mesh>
          ))}
          <Bean position={[-1.4, 0, -0.95]} scale={1.1} pose={BP.hold} look={SHASTRI} blink={f % 80 < 4} />
          <Bean position={[1.4, 0, -0.95]} scale={1.1} pose={BP.hold} look={DELEGATE} blink={f % 67 < 4} />
          <Bean position={[0, 0, -2.0]} scale={1.1} pose={BP.idle} look={{ ...DELEGATE, body: "#3a3a44", legs: "#3a3a44" }} />
          <CameraRig pos={lerp3([0, 2.9, 6.4], [0.3, 2.6, 5.2], ta)} look={[0, 1.6, -0.8]} fov={50} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#141a2e", 18, 90]} />
          <SkyDome top="#03050d" horizon="#1e2644" />
          <Stars />
          <ambientLight intensity={0.35} />
          <hemisphereLight args={["#6a80c0", "#20202a", 0.8]} />
          <directionalLight position={[-20, 30, 20]} color="#9fb4ff" intensity={0.8} castShadow />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[300, 300]} />
            <meshStandardMaterial color="#cfd8e8" roughness={0.9} />
          </mesh>
          <Dacha position={[0, 0, -4]} light={light} />
          {[[-9, -6, 1.3], [-12, 2, 1.0], [9, -8, 1.4], [12, 0, 1.1], [-6, -14, 1.6], [6, -15, 1.5]].map(([x, z, s], i) => (
            <Pine key={i} position={[x, 0, z]} s={s} />
          ))}
          <Snowfall center={[2, 0, 6]} area={30} height={16} count={500} size={0.12} speed={0.06} />
          <CameraRig pos={lerp3([9, 2.6, 16], [5.5, 2.3, 11], tb)} look={[1, 3, -4]} fov={50} />
        </>
      )}
    </Stage3D>
  );
};

/** 2D heart monitor that goes flat. */
const Ecg: React.FC<{ y: number; flatAt: number; until: number }> = ({ y, flatAt, until }) => {
  const f = useCurrentFrame();
  if (f > until) return null;
  const W = 760;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 5) {
    const tm = f - (W - x) / 9;
    let v = 0;
    if (tm < flatAt) {
      const l = (((x + f * 9) % 190) + 190) % 190;
      if (l > 70 && l < 78) v = -14;
      else if (l >= 78 && l < 86) v = 56;
      else if (l >= 86 && l < 94) v = -34;
      else if (l >= 110 && l < 130) v = 10 * Math.sin(((l - 110) / 20) * Math.PI);
    }
    pts.push(`${x - W / 2},${-v}`);
  }
  const flat = f > flatAt + 20;
  const col = flat ? "#ff4a4a" : "#5ff28a";
  return (
    <g transform={`translate(540,${y}) scale(${pop(f, 0, 30, 10)})`}>
      <rect x={-W / 2 - 30} y={-95} width={W + 60} height={190} rx={24} fill="rgba(6,14,10,0.85)" stroke={col} strokeWidth={5} />
      <polyline points={pts.join(" ")} fill="none" stroke={col} strokeWidth={7} strokeLinejoin="round" />
      <text x={-W / 2 + 4} y={-55} fontFamily="Poppins" fontWeight={900} fontSize={34} fill={col}>{flat ? "♥ 0" : "♥ 72"}</text>
    </g>
  );
};

/** Bedroom of the dacha at night. */
const Bedroom: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <>
    <color attach="background" args={["#0c0a10"]} />
    <ambientLight intensity={0.3} />
    <pointLight position={[1.4, 1.9, -2.4]} color="#ffcf8a" intensity={7} distance={6} decay={1.6} />
    <pointLight position={[4, 3.5, 1]} color="#7f95d8" intensity={6} distance={12} />
    {glow > 0 && <pointLight position={[1.1, 1.3, -2.6]} color="#3aff8a" intensity={10 * glow} distance={3.5} />}
    <Room wall="#4a3a30" floor="#2a1e16" w={9} d={7} h={5} windowGlow={0.8} />
    <Bed position={[-0.9, 0, -1.4]} />
    <Table position={[1.2, 0, -2.7]} w={0.9} d={0.7} h={0.8} />
    <Flask position={[1.05, 0.85, -2.75]} glow={glow} />
    <mesh position={[1.45, 1.25, -2.85]}>
      <coneGeometry args={[0.22, 0.3, 14, 1, true]} />
      <meshStandardMaterial color="#f4e2b0" emissive="#ffcf8a" emissiveIntensity={0.8} side={2} />
    </mesh>
  </>
);

/* 3 ── HEART: "heart attack" — but no post-mortem, in India or Russia */
export const Heart: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fDil = wordFrame(words, "dil");
  const fP = wordFrame(words, "postmortem");
  const fNa = wordFrame(words, "na");
  const fR = wordFrame(words, "rus");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  return (
    <Stage3D
      overlay={<g>
        <Ecg y={OY} flatAt={fDil + 6} until={fP - 2} />
        <Stamp x={540} y={OY} at={fP} text="POSTMORTEM?" size={80} until={fNa - 2} />
        <Chip x={540} y={OY} at={fNa} text="BHARAT: NAHI" bg="#7a1010" />
        <Chip x={540} y={OY + 140} at={fR} text="RUS: NAHI" bg="#7a1010" />
      </g>}
    >
      <Bedroom />
      <CameraRig pos={lerp3([3.2, 2.7, 4.2], [2.2, 2.3, 2.8], t)} look={[0, 0.9, -2]} fov={50} />
    </Stage3D>
  );
};

/* 4 ── POISON: his wife suspected poisoning */
export const Poison: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fZ = wordFrame(words, "zehar");
  const glow = prog(f, fZ - 6, fZ + 10) * (0.8 + 0.2 * Math.sin(f / 3));
  const t = prog(f, 0, dur);
  return (
    <Stage3D
      exposure={1.2}
      tint="#0a3a1a"
      tintOp={0.18 * glow}
      overlay={<g>
        <NameTag x={540} y={OY} at={8} text="PATNI: LALITA SHASTRI" size={44} bg="#f2efe6" until={fZ - 2} />
        <Stamp x={540} y={OY} at={fZ} text="ZEHAR KA SHAK" size={72} />
      </g>}
    >
      <Bedroom glow={glow} />
      <CameraRig pos={lerp3([2.4, 1.5, -0.9], [2.0, 1.35, -1.5], t)} look={[1.15, 1.05, -2.75]} fov={45} />
    </Stage3D>
  );
};

/* 5 ── BHABHA: 13 days later — the father of India's nuclear programme */
export const Bhabha: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f13 = wordFrame(words, "13");
  const fP = wordFrame(words, "parmanu");
  const fH = wordFrame(words, "homi");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const board = useMemo(
    () =>
      textTexture(
        [
          { text: "E = mc²", size: 120, color: "#f4f4ea", font: "700" },
          { text: "²³⁵U + n → ?", size: 80, color: "#d8e8d0", font: "500" },
          { text: "TIFR • 1966", size: 60, color: "#ffe28a", font: "700" },
        ],
        1024,
        620,
        "#1f3a2e",
      ),
    [],
  );
  return (
    <Stage3D
      exposure={1.2}
      overlay={<g>
        {f < fH - 2 && <g transform="translate(850,500) scale(0.6)"><DateBadge x={0} y={0} at={f13} top="24 JANUARY" big="1966" /></g>}
        <Chip x={540} y={OY} at={f13} text="13 DIN BAAD" until={fP - 2} bg="#7a1010" />
        <Chip x={540} y={OY} at={fP} text="PARMANU KARYAKRAM" until={fH - 2} bg="#0a3a5a" />
        <NameTag x={540} y={OY} at={fH} text="DR. HOMI J. BHABHA" size={50} bg="#4fd8ff" fg="#0a1a2a" />
      </g>}
    >
      <color attach="background" args={["#0e141c"]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[0, 6, 4]} angle={0.7} penumbra={0.6} intensity={70} castShadow />
      <Room wall="#2e3a46" floor="#1a2028" w={12} d={4} h={6} />
      <mesh position={[0, 3.1, -1.96]}>
        <planeGeometry args={[4.4, 2.66]} />
        <meshStandardMaterial map={board} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.1, -1.98]}>
        <planeGeometry args={[4.6, 2.86]} />
        <meshStandardMaterial color="#6b4a2a" />
      </mesh>
      <Table position={[0.9, 0, 0.3]} w={2.2} d={1.1} h={1.0} />
      <Atom position={[0.9, 1.8, 0.3]} scale={0.6 + 0.25 * prog(f, fP - 4, fP + 10)} glow={0.5 + prog(f, fP - 4, fP + 10)} />
      <Bean position={[-1.3, 0, -0.6]} rotY={0.35} scale={1.15} pose={f >= fH - 6 ? BP.point : BP.idle} look={BHABHA} blink={f % 73 < 4} />
      <CameraRig pos={lerp3([0.4, 2.4, 6.6], [0.2, 2.25, 5.0], t)} look={[0, 2.0, -0.8]} fov={50} />
    </Stage3D>
  );
};

/* 6 ── CRASH: Air India 101 hits Mont Blanc */
export const Crash: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fA = wordFrame(words, "air");
  const fAl = wordFrame(words, "alps");
  const fT = wordFrame(words, "takra");
  const fN = wordFrame(words, "nahi");
  const P = useMemo<V3>(() => [0, alpsH(0, 44) + 1.5, 44], []);
  const S: V3 = [-170, P[1] + 38, 270];
  const tf = Math.min(1, f / fT);
  const pos = lerp3(S, P, tf);
  const d = [P[0] - S[0], P[1] - S[1], P[2] - S[2]];
  const len = Math.hypot(d[0], d[1], d[2]);
  const n: V3 = [d[0] / len, d[1] / len, d[2] / len];
  const yaw = Math.atan2(-d[2], d[0]);
  const pitch = Math.atan2(d[1], Math.hypot(d[0], d[2]));
  const camAt = (q: V3): V3 => {
    const c: V3 = [q[0] - n[0] * 17 + 6, q[1] - n[1] * 17 + 3.5, q[2] - n[2] * 17 + 3];
    return [c[0], Math.max(c[1], alpsH(c[0], c[2]) + 10), c[2]];
  };
  const hit = f >= fT;
  const freeze = lerp3(S, P, Math.max(0, (fT - 26) / fT));
  const camPos = hit ? lerp3(camAt(freeze), [camAt(freeze)[0] + 14, camAt(freeze)[1] + 12, camAt(freeze)[2] + 26], prog(f, fT, dur)) : camAt(pos);
  const look: V3 = hit ? [P[0], P[1] + 10, P[2]] : [pos[0] + n[0] * 5, pos[1] + n[1] * 5 + 0.5, pos[2] + n[2] * 5];
  return (
    <Stage3D
      flashOp={flash(f, fT, 10, 0.9)}
      overlay={<g>
        <NameTag x={540} y={OY} at={fA} text="AIR INDIA 101" size={50} bg="#ffffff" fg="#c0262d" until={fAl - 2} />
        <NameTag x={540} y={OY} at={fAl} text="MONT BLANC, ALPS" size={48} bg="#ffd84d" until={fT - 2} />
        <Stamp x={540} y={OY} at={fT} text="CRASH" size={110} until={fN - 2} />
        <Chip x={540} y={OY} at={fN} text="117 LOG, KOI NAHI BACHA" bg="#111" />
      </g>}
    >
      <fog attach="fog" args={["#c8d4e2", 120, 760]} />
      <SkyDome top="#4f6f9a" horizon="#dfe7f0" />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#dfe9ff", "#6a7080", 1.2]} />
      <directionalLight position={[120, 160, 140]} intensity={2.6} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-120} shadow-camera-right={120} shadow-camera-top={120} shadow-camera-bottom={-120} shadow-camera-far={600} />
      <Alps />
      <Clouds y={P[1] + 30} count={14} spread={260} opacity={0.6} color="#f4f7fb" scale={1.2} />
      {!hit && <Jet position={pos} rotation={[0, yaw, pitch]} scale={1.6} />}
      <Burst position={P} at={fT} scale={2.6} />
      <CameraRig pos={camPos} look={look} fov={50} />
    </Stage3D>
  );
};

/* 7 ── BOMB: the radio claim — 18 months to a bomb, if given the go-ahead */
const RadioWaves: React.FC<{ position: V3 }> = ({ position }) => {
  const f = useCurrentFrame();
  return (
    <group position={position}>
      {[0, 1, 2].map((k) => {
        const a = ((f + k * 14) % 42) / 42;
        return (
          <mesh key={k} rotation={[0, 0, 0]} scale={0.3 + a * 2.4}>
            <torusGeometry args={[0.5, 0.02, 6, 40, Math.PI * 0.6]} />
            <meshBasicMaterial color="#ffd84d" transparent opacity={0.8 * (1 - a)} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Bomb: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fM = wordFrame(words, "manzoori");
  const f18 = wordFrame(words, "18");
  const fA = wordFrame(words, "atom");
  const fB = wordFrame(words, "bam");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const big = prog(f, fA - 4, fB + 6, Easing.out(Easing.back(1.4)));
  return (
    <Stage3D
      exposure={1.2}
      flashOp={flash(f, fB, 8, 0.6)}
      overlay={<g>
        <Chip x={540} y={OY} at={6} text="ALL INDIA RADIO" until={fM - 2} bg="#2a1a0a" />
        <Chip x={540} y={OY} at={fM} text="MANZOORI MILE TO..." until={f18 - 2} bg="#0a3a5a" />
        <Stamp x={540} y={OY} at={f18} text="18 MAHINE" size={88} color="#ffd84d" until={fB - 2} />
        <Stamp x={540} y={OY} at={fB} text="ATOM BAM" size={96} />
      </g>}
    >
      <color attach="background" args={["#120c0a"]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 4, 3]} color="#ffcf8a" intensity={26} distance={14} castShadow />
      <Room wall="#4a3426" floor="#24180e" w={12} d={4} h={6} />
      <Table position={[0, 0, 0.4]} w={3.2} d={1.2} h={1.0} />
      <Radio position={[-0.9, 1.55, 0.3]} glow={0.8 + 0.2 * Math.sin(f / 3)} />
      <RadioWaves position={[-0.9, 2.3, 0.4]} />
      <group position={[0.5, 1.05, 0.7]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.7, 8]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <capsuleGeometry args={[0.1, 0.18, 6, 12]} />
          <meshStandardMaterial color="#b8bcc4" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>
      <Bean position={[0.5, 0, -0.55]} scale={1.15} pose={f >= fM ? BP.point : BP.hold} look={BHABHA} blink={f % 71 < 4} />
      {big > 0.01 && <Atom position={[0, 3.15, -0.9]} scale={1.15 * big} glow={1.5} speed={2} />}
      <CameraRig pos={lerp3([0.6, 2.5, 6.6], [0.3, 2.6, 5.4], t)} look={[0, 2.3, -0.5]} fov={50} />
    </Stage3D>
  );
};

/* 8 ── THEORY: some blame the CIA — but there is no solid proof */
export const Theory: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fC = wordFrame(words, "cia");
  const fP = wordFrame(words, "pakka");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const flick = 0.9 + 0.1 * Math.sin(f / 2.1) * Math.sin(f / 7);
  return (
    <Stage3D
      exposure={1.2}
      flashOp={flash(f, fC, 6, 0.35)}
      overlay={<g>
        <Stamp x={540} y={OY} at={fC} text="CIA?" size={120} until={fP - 2} />
        <Chip x={540} y={OY} at={fP} text="PAKKA SABOOT: NAHI" bg="#111" />
      </g>}
    >
      <color attach="background" args={["#060608"]} />
      <ambientLight intensity={0.15} />
      <spotLight position={[0.4, 4.2, 0.6]} angle={0.5} penumbra={0.5} intensity={90 * flick} castShadow color="#ffe8c0" />
      <pointLight position={[-0.6, 2.6, -1.2]} color="#6a7ab8" intensity={10} distance={5} />
      <Room wall="#1c1a20" floor="#121014" w={10} d={5} h={5} />
      <Table position={[0, 0, 0]} w={2.6} d={1.4} h={1.0} />
      <Folder position={[0, 1.06, 0.05]} rotation={[0, 0.15, 0]} open={prog(f, fC - 4, fC + 16)} title="CLASSIFIED" sub="AIR INDIA 101 • 1966" />
      <Bean position={[-1.7, 0, -1.9]} rotY={0.4} scale={1.15} pose={BP.idle} look={{ ...SHADOW, eyes: "normal" }} blink={f % 60 < 3} />
      <CameraRig pos={lerp3([1.5, 2.6, 3.6], [1.0, 2.35, 2.7], t)} look={[-0.6, 1.45, -0.9]} fov={50} />
    </Stage3D>
  );
};

/* 9 ── RECORDS: "pilot error" — and the Shastri inquiry records can't be found */
export const Records: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fG = wordFrame(words, "galti");
  const fAur = wordFrame(words, "aur");
  const fR = wordFrame(words, "record");
  const fM = wordFrame(words, "milte");
  const fN = wordFrame(words, "nahi");
  const partB = f >= fAur - 2;
  const ta = prog(f, 0, fAur - 2);
  const tb = prog(f, fAur - 2, dur, Easing.inOut(Easing.quad));
  const dust = softTexture();
  return (
    <Stage3D
      exposure={1.2}
      flashOp={flash(f, fAur - 2, 6, 0.3)}
      overlay={<g>
        <Chip x={540} y={OY} at={fG - 4} text="JAANCH: PILOT KI GALTI" until={fAur - 4} bg="#2a2a2a" />
        <NameTag x={540} y={OY} at={fR} text="SHASTRI JAANCH RECORD" size={44} bg="#f2efe6" until={fN - 2} />
        <Stamp x={540} y={OY} at={fN} text="NAHI MILE!" size={92} />
      </g>}
    >
      {!partB ? (
        <>
          <color attach="background" args={["#0c0a08"]} />
          <ambientLight intensity={0.35} />
          <spotLight position={[0, 4.5, 1.2]} angle={0.55} penumbra={0.6} intensity={80} castShadow />
          <Room wall="#3a3028" floor="#1e1610" w={10} d={5} h={5} />
          <Table position={[0, 0, 0]} w={2.6} d={1.4} h={1.0} />
          <Folder position={[0, 1.06, 0.05]} rotation={[0, -0.1, 0]} open={0} title="JAANCH REPORT" sub="AIR INDIA 101" />
          <CameraRig pos={lerp3([0.8, 3.2, 2.6], [0.4, 2.8, 1.9], ta)} look={[0, 1.05, -0.05]} fov={50} />
        </>
      ) : (
        <>
          <color attach="background" args={["#08080a"]} />
          <ambientLight intensity={0.3} />
          <spotLight position={[0.6, 3.4, 3.2]} angle={0.45} penumbra={0.5} intensity={80} castShadow color="#fff4d8" />
          <pointLight position={[0, 4, -1]} color="#7f8fc0" intensity={6} distance={10} />
          <Room wall="#2a2622" floor="#18140f" w={12} d={5} h={6} />
          <Shelves position={[0, 0, -2.3]} width={10} rows={5} />
          <Table position={[0, 0, 0.4]} w={2.4} d={1.4} h={0.9} />
          <ArchiveBox position={[0, 0.95, 0.4]} open={prog(f, fM - 6, fM + 14)} label="SHASTRI JAANCH • 1977" />
          {new Array(24).fill(0).map((_, i) => (
            <sprite key={i} position={[Math.sin(i * 2.3 + f / 40) * 1.6, 1.2 + ((i * 0.37 + f * 0.004) % 2.4), 0.4 + Math.cos(i * 1.7) * 1.2]} scale={[0.06, 0.06, 1]}>
              <spriteMaterial map={dust} color="#fff2d0" transparent opacity={0.7} depthWrite={false} />
            </sprite>
          ))}
          <CameraRig pos={lerp3([0.3, 2.9, 4.6], [0.1, 2.9, 2.9], tb)} look={[0, 1.2, 0.2]} fov={50} />
        </>
      )}
    </Stage3D>
  );
};

/* 10 ── CTA: back to the calendar — coincidence or conspiracy? */
export const Cta: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fS = wordFrame(words, "sanyog");
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const t = prog(f, 0, dur);
  const focus = prog(f, fAur - 2, fAur + 10);
  return (
    <Stage3D
      exposure={1.3}
      tint="#000000"
      tintOp={focus * 0.45}
      overlay={<g>
        {f < fCom - 2 && <VoteButtons y={OY} at={fS - 2} left="SANYOG" right="SAAZISH" />}
        {f < fIti && f >= fCom - 2 && <g opacity={1 - prog(f, fAur, fIti)}><CommentBubble x={540} y={600} at={fCom - 2} /></g>}
        <ChannelCard x={540} y={470} at={fIti - 4} clickAt={fSub + 4} />
      </g>}
    >
      <CalendarRoom circled={[11, 24]} outAt={-200} />
      <pointLight position={[0, 2.6, 1.5]} color="#ffb060" intensity={3 + 2 * Math.sin(f / 9)} distance={6} />
      <CameraRig pos={lerp3([0.8, 2.3, 4.8], [0, 2.3, 3.8], t)} look={[0, 2.4, -1.5]} fov={50} />
    </Stage3D>
  );
};

export const SCENES = { hook: Hook, shastri: Shastri, heart: Heart, poison: Poison, bhabha: Bhabha, crash: Crash, bomb: Bomb, theory: Theory, records: Records, cta: Cta };
