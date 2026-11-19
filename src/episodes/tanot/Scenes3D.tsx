import React, { useMemo } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { CommentBubble, DateBadge, NameTag, VoteButtons } from "../../components/Props";
import { ChannelCard } from "../../components/Subscribe";
import { BP, Bean, BeanLook, BeanPose } from "../../components/three/Bean";
import { BorderFence, DesertTerrain, DisplayCase, Diyas, Drop, FieldGun, Sandbags, Scrub, Shell, ShellRain, Temple, VijayStambh } from "../../components/three/Desert3D";
import { Chip, Stamp } from "../../components/three/Overlays";
import { Stage3D } from "../../components/three/Stage3D";
import { CameraRig, lerp3, rand, SkyDome, softTexture, Stars, textTexture } from "../../components/three/World";
import { flash, lerp, prog, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };
type V3 = [number, number, number];

const JAWAN: BeanLook = { body: "#5d6b3a", legs: "#4f5a32", hat: "cap", hatColor: "#3d4a2a", skin: "#c98e6a" };
const OY = 640; // overlay row (below the title, above the subject)

/** Golden halo behind the temple. */
const Aura: React.FC<{ op: number; y?: number; s?: number }> = ({ op, y = 7, s = 30 }) => (
  <sprite position={[0, y, -3]} scale={[s, s * 1.1, 1]}>
    <spriteMaterial map={softTexture()} color="#ffcf6a" transparent opacity={op} depthWrite={false} />
  </sprite>
);

/** Distant muzzle flashes on the western horizon. */
const HorizonFire: React.FC<{ seed?: number }> = ({ seed = 1 }) => {
  const f = useCurrentFrame();
  return (
    <group>
      {new Array(6).fill(0).map((_, i) => {
        const period = 23 + Math.round(rand(i, seed) * 17);
        const ph = (f + Math.round(rand(i + 3, seed) * 40)) % period;
        const op = ph < 5 ? 1 - ph / 5 : 0;
        return (
          <sprite key={i} position={[-260 + i * 28, 6 + rand(i + 7, seed) * 6, -240 + i * 22]} scale={[40, 26, 1]}>
            <spriteMaterial map={softTexture()} color="#ff9a3a" transparent opacity={op * 0.9} depthWrite={false} fog={false} />
          </sprite>
        );
      })}
    </group>
  );
};

const Dusk: React.FC = () => (
  <>
    <fog attach="fog" args={["#5a3440", 70, 420]} />
    <SkyDome top="#0e1236" horizon="#d8663a" bottom="#3a2418" />
    <Stars opacity={0.6} />
    <ambientLight intensity={0.45} />
    <hemisphereLight args={["#ffb38a", "#3a2a30", 0.9]} />
    <directionalLight position={[-90, 14, -30]} color="#ff9a5a" intensity={2.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />
  </>
);

const Night: React.FC = () => (
  <>
    <fog attach="fog" args={["#1a1830", 60, 380]} />
    <SkyDome top="#03040f" horizon="#2e2244" bottom="#100c14" />
    <Stars />
    <ambientLight intensity={0.4} />
    <hemisphereLight args={["#6a78c0", "#1a1418", 0.9]} />
    <directionalLight position={[40, 60, 30]} color="#9fb4ff" intensity={1.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />
  </>
);

const Day: React.FC<{ low?: boolean }> = ({ low = false }) => (
  <>
    <fog attach="fog" args={[low ? "#f2c894" : "#f3dcb4", 120, 620]} />
    <SkyDome top={low ? "#2a4a8a" : "#3d7fd0"} horizon={low ? "#ffb878" : "#f6dcae"} />
    <ambientLight intensity={0.55} />
    <hemisphereLight args={[low ? "#ffd2a8" : "#cfe2ff", "#a07850", 1.3]} />
    <directionalLight
      position={low ? [80, 28, 60] : [-60, 80, 50]}
      color={low ? "#ffb070" : "#fff0d6"}
      intensity={low ? 2.8 : 3.2}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-40}
      shadow-camera-right={40}
      shadow-camera-top={40}
      shadow-camera-bottom={-40}
    />
  </>
);

/** Shells raining around the temple, landing between `a` and `b`, from the west. */
const ringDrops = (n: number, a: number, b: number, seed: number, rMin = 9.5, rMax = 18, front = false): Drop[] =>
  new Array(n).fill(0).map((_, i) => {
    const ang = front ? Math.PI * (0.12 + 0.76 * rand(i, seed)) : rand(i, seed) * Math.PI * 2;
    const r = rMin + rand(i + 4, seed) * (rMax - rMin);
    const to: V3 = [Math.cos(ang) * r, 0, Math.sin(ang) * r];
    return { from: [to[0] - 22, 40, to[2] - 16], to, land: Math.round(a + (i / Math.max(1, n - 1)) * (b - a)), dur: 24, arc: 4, s: 1.1 };
  });

/* 1 ── HOOK: 1965 — shells rain on a desert temple… none explode */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f3 = wordFrame(words, "3000");
  const fG = wordFrame(words, "gire");
  const fAur = wordFrame(words, "aur");
  const fN = wordFrame(words, "nahi");
  const hero: V3 = [5, 0, 15];
  const drops = useMemo(
    () => [{ from: [-8, 24, 2] as V3, to: [3.5, 0, 16] as V3, land: 20, dur: 32, arc: 3, s: 1.3 }, ...ringDrops(15, 4, fG + 4, 3), { from: [hero[0] - 22, 40, hero[2] - 16] as V3, to: hero, land: fG, dur: 24, arc: 4, s: 1.3 }],
    [fG],
  );
  const close = f >= fAur;
  const tw = prog(f, 0, fAur, Easing.inOut(Easing.quad));
  const tc = prog(f, fAur, dur);
  return (
    <Stage3D
      exposure={1.25}
      entryFlash={false}
      flashOp={flash(f, fAur, 6, 0.35)}
      overlay={<g>
        {f < fAur && <g transform="translate(850,520) scale(0.6)"><DateBadge x={0} y={0} at={1} top="SAN" big="1965" /></g>}
        <Chip x={540} y={OY} at={f3} text="~3000 BAM" until={fN - 2} bg="#7a1010" />
        <Stamp x={540} y={OY} at={fN} text="0 DHAMAKA!" size={80} />
      </g>}
    >
      <Dusk />
      <HorizonFire />
      <DesertTerrain />
      <Scrub />
      <Temple glow={1.2} />
      <Aura op={close ? 0.35 * prog(f, fN, fN + 12) : 0} />
      <ShellRain drops={drops} />
      {close ? (
        <>
          <CameraRig pos={lerp3([8.4, 1.2, 21.8], [7.8, 1.05, 20.6], tc)} look={[2.2, 4.4, 0]} fov={50} />
          <pointLight position={[6.5, 1.6, 17.5]} color="#ffc27a" intensity={10} distance={6} />
        </>
      ) : (
        <CameraRig pos={lerp3([26, 16, 34], [15, 8, 24], tw)} look={[0, 5.5, 0]} fov={50} />
      )}
    </Stage3D>
  );
};

/* 2 ── PLACE: Jaisalmer, near the Pakistan border — Tanot Mata Mandir */
export const Place: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fJ = wordFrame(words, "jaisalmer");
  const fB = wordFrame(words, "border");
  const fT = wordFrame(words, "tanot");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const a = lerp(0.95, 0.35, t);
  const R = lerp(60, 30, t);
  const H = lerp(30, 9, t);
  return (
    <Stage3D
      overlay={<g>
        <NameTag x={540} y={OY} at={fJ} text="JAISALMER, RAJASTHAN" size={44} bg="#ffd84d" until={fB - 2} />
        <Chip x={540} y={OY} at={fB} text="PAKISTAN BORDER" until={fT - 2} />
        <NameTag x={540} y={OY} at={fT} text="TANOT MATA MANDIR" size={50} bg="#ff7a1a" fg="#ffffff" />
      </g>}
    >
      <Day />
      <DesertTerrain />
      <Scrub count={34} />
      <BorderFence />
      <Temple glow={0.5} />
      <CameraRig pos={[Math.sin(a) * R, H, Math.cos(a) * R]} look={[0, 4.5, -6]} fov={50} />
    </Stage3D>
  );
};

/* 3 ── ATTACK: enemy guns fire, shells streak over the desert */
export const Attack: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fTo = wordFrame(words, "topon");
  const fL = wordFrame(words, "lagaataar");
  const fGo = wordFrame(words, "gole");
  const guns = f < fGo - 2;
  const fires = [fTo, fTo + 7, fTo + 14, fL, fL + 6, fL + 12];
  const drops = useMemo<Drop[]>(
    () =>
      new Array(12).fill(0).map((_, i) => {
        const to: V3 = [(rand(i, 8) - 0.5) * 30, 0, 8 + rand(i + 3, 8) * 10];
        return { from: [to[0] * 0.4 + (rand(i + 5, 8) - 0.5) * 30, 40, -170], to, land: fGo + 18 + i * 4, dur: 30, arc: 10, s: 1.1 };
      }),
    [fGo],
  );
  const flashes = fires.reduce((m, t) => Math.max(m, flash(f, t, 5, 0.22)), 0);
  const t = prog(f, fGo - 2, dur);
  return (
    <Stage3D
      exposure={1.3}
      flashOp={guns ? flashes : 0}
      overlay={<g>
        <Chip x={540} y={OY} at={fTo} text="DUSHMAN KI TOPEIN" until={fL - 2} bg="#7a1010" />
        <Stamp x={540} y={OY} at={fL} text="GOLABAARI" size={84} />
      </g>}
    >
      <Night />
      <DesertTerrain night />
      {guns ? (
        <>
          <HorizonFire seed={4} />
          {[-4.2, 0, 4.2].map((x, i) => (
            <FieldGun key={x} position={[x, 0, -i * 1.5]} fireAt={fires.filter((_, k) => k % 3 === i)} />
          ))}
          <Sandbags position={[-1, 0, 4.5]} n={9} rows={2} />
          <CameraRig pos={lerp3([7.5, 1.4, 6.5], [6.2, 1.7, 5.2], prog(f, 0, fGo))} look={[-1.5, 2.2, -6]} fov={50} />
        </>
      ) : (
        <>
          <Temple glow={1.1} />
          <ShellRain drops={drops} tracer="#ffd890" />
          <CameraRig pos={lerp3([0, 4, 36], [0, 5, 32], t)} look={[0, 9, -20]} fov={52} />
        </>
      )}
    </Stage3D>
  );
};

/* 4 ── DUDS: ~450 shells land in the courtyard — the temple is untouched */
export const Duds: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f450 = wordFrame(words, "450");
  const fA = wordFrame(words, "aangan");
  const fKh = wordFrame(words, "kharonch");
  const drops = useMemo(() => [...ringDrops(10, f450 - 6, fA + 6, 11, 9.5, 15, true), ...ringDrops(10, fA - 4, fKh - 10, 12, 9.5, 17)], [f450, fA, fKh]);
  const pull = prog(f, fKh - 4, fKh + 30, Easing.inOut(Easing.cubic));
  const safe = f >= fKh;
  const pose: BeanPose = safe ? BP.shock : BP.cover;
  void dur;
  return (
    <Stage3D
      exposure={1.3}
      overlay={<g>
        <Stamp x={540} y={OY} at={f450} text="450 GOLE" size={84} until={fKh - 2} />
        <Chip x={540} y={OY} at={fKh} text="MANDIR SURAKSHIT" bg="#1b5e20" />
      </g>}
    >
      <Night />
      <HorizonFire seed={7} />
      <DesertTerrain night />
      <Temple glow={1.3} />
      <Aura op={0.45 * prog(f, fKh, fKh + 20)} />
      <ShellRain drops={drops} />
      <Sandbags position={[3.55, 0, 15.65]} rotY={0.49} n={4} rows={2} />
      <Sandbags position={[4.0, 0, 10.5]} rotY={0.49} n={4} rows={2} />
      <Bean position={[3.1, 0, 14.8]} rotY={0.49} scale={1.05} pose={pose} look={{ ...JAWAN, eyes: safe ? "wide" : "normal" }} blink={f % 83 < 4} />
      <Bean position={[3.55, 0, 9.65]} rotY={0.49} scale={1.05} pose={safe ? BP.cheer : BP.cover} look={JAWAN} blink={f % 71 < 4} />
      <CameraRig pos={lerp3([8.5, 2.4, 22], [0, 7.5, 34], pull)} look={lerp3([0, 3.2, 6], [0, 6.5, 0], pull)} fov={50} />
    </Stage3D>
  );
};

/* 5 ── QUESTION: inside the shrine — a miracle? */
export const Question: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fC = wordFrame(words, "chamatkar");
  const t = prog(f, 0, dur);
  const glow = 0.85 + 0.15 * Math.sin(f / 4);
  return (
    <Stage3D exposure={1.25} flashOp={flash(f, fC, 6, 0.3)} overlay={<Stamp x={540} y={OY} at={fC} text="CHAMATKAR?" size={84} color="#ffd84d" />}>
      <color attach="background" args={["#120806"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 1.4, 1.6]} color="#ffb347" intensity={16 * glow} distance={9} decay={1.5} />
      <pointLight position={[0, 3.6, 2.5]} color="#ffd8a0" intensity={8} distance={10} />
      <CameraRig pos={lerp3([0, 2.1, 6.6], [0, 2.0, 5.3], t)} look={[0, 1.9, -0.9]} fov={46} />
      <mesh position={[0, 3, -1.6]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#4a1010" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.0, -1.55]}>
        <planeGeometry args={[2.6, 2.8]} />
        <meshStandardMaterial color="#ffcf8a" emissive="#ff9a3a" emissiveIntensity={0.6 * glow} />
      </mesh>
      <mesh position={[0, 3.4, -1.5]}>
        <torusGeometry args={[1.3, 0.1, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#e8b23a" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-1.3, 1.3].map((x) => (
        <mesh key={x} position={[x, 1.7, -1.5]}>
          <cylinderGeometry args={[0.1, 0.1, 3.4, 8]} />
          <meshStandardMaterial color="#e8b23a" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.4, -0.9]} castShadow>
        <boxGeometry args={[3.2, 0.8, 1.3]} />
        <meshStandardMaterial color="#8a1a1a" />
      </mesh>
      <mesh position={[0, 0.82, -0.9]}>
        <boxGeometry args={[3.3, 0.06, 1.4]} />
        <meshStandardMaterial color="#e8b23a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* draped form with crown and halo (stylised, no idol detail) */}
      <mesh position={[0, 1.55, -0.95]} castShadow>
        <coneGeometry args={[0.6, 1.5, 16]} />
        <meshStandardMaterial color="#c41e1e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.38, -0.95]}>
        <sphereGeometry args={[0.32, 16, 12]} />
        <meshStandardMaterial color="#c41e1e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.82, -0.95]}>
        <coneGeometry args={[0.22, 0.45, 8]} />
        <meshStandardMaterial color="#e8b23a" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.4, -1.2]}>
        <torusGeometry args={[0.7, 0.06, 8, 32]} />
        <meshStandardMaterial color="#ffd26a" emissive="#ffb347" emissiveIntensity={1.2 * glow} />
      </mesh>
      <mesh position={[0, 2.2, -0.62]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.38, 0.07, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#ff9a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.55, -0.95]}>
        <coneGeometry args={[0.9, 0.4, 16]} />
        <meshStandardMaterial color="#d8d8e0" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.15, 0.4]}>
        <boxGeometry args={[3.8, 0.3, 0.7]} />
        <meshStandardMaterial color="#5a2a14" />
      </mesh>
      <Diyas points={[-1.3, -0.65, 0, 0.65, 1.3].map((x) => [x, 0.3, 0.4] as V3)} />
      {[-1.7, 1.7].map((x, i) => (
        <group key={x} position={[x, 3.4, -0.6]} rotation={[0, 0, Math.sin(f / 7 + i) * 0.25]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 4]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          <mesh position={[0, -0.7, 0]}>
            <coneGeometry args={[0.2, 0.32, 12, 1, true]} />
            <meshStandardMaterial color="#e8b23a" metalness={0.7} roughness={0.3} side={2} />
          </mesh>
        </group>
      ))}
    </Stage3D>
  );
};

/* 6 ── SCIENCE: slow-motion — a shell buries itself in soft sand */
export const Science: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fNa = wordFrame(words, "naram");
  const fR = wordFrame(words, "ret");
  const fP = wordFrame(words, "phate");
  const drops = useMemo<Drop[]>(() => [{ from: [-8, 11, -7], to: [0, 0, 0], land: fR, dur: 50, arc: 1, s: 1.0 }], [fR]);
  const t = prog(f, 0, dur);
  return (
    <Stage3D
      overlay={<g>
        <Chip x={540} y={OY} at={12} text="THEORY" until={fNa - 2} bg="#1a3a7a" />
        <Stamp x={540} y={OY} at={fNa} text="NARAM RET?" size={84} color="#ffd84d" until={fP - 2} />
        <Stamp x={540} y={OY} at={fP} text="NO BLAST?" size={84} />
      </g>}
    >
      <Day />
      <DesertTerrain />
      <Scrub count={20} rMin={24} />
      <ShellRain drops={drops} bury={0.5} topple={false} />
      {[[-1.6, 0, 1.2], [1.8, 0, -1.4], [-2.4, 0, -2.2]].map((p, i) => (
        <mesh key={i} position={p as V3} rotation={[-Math.PI / 2, 0, i]}>
          <circleGeometry args={[0.5 + i * 0.2, 7]} />
          <meshStandardMaterial color="#d6ab70" />
        </mesh>
      ))}
      <CameraRig pos={lerp3([3.6, 1.2, 4.6], [2.5, 0.85, 3.3], t)} look={[0, 0.5, 0]} fov={50} />
    </Stage3D>
  );
};

/* 7 ── PROOF: the unexploded shells in the temple museum */
export const Proof: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fAaj = wordFrame(words, "aaj");
  const fM = wordFrame(words, "museum");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const board = useMemo(() => textTexture([{ text: "TANOT", size: 120, color: "#3a2410" }, { text: "1965", size: 110, color: "#9a1c10" }], 512, 512, "#e9d9b0"), []);
  const board2 = useMemo(() => textTexture([{ text: "LONGEWALA", size: 84, color: "#3a2410" }, { text: "1971", size: 110, color: "#9a1c10" }], 512, 512, "#e9d9b0"), []);
  return (
    <Stage3D
      exposure={1.25}
      flashOp={flash(f, fM, 6, 0.4)}
      overlay={<g>
        <Chip x={540} y={OY} at={fAaj} text="AAJ BHI MAUJOOD" until={fM - 2} />
        <Stamp x={540} y={OY} at={fM} text="SABOOT" size={92} />
      </g>}
    >
      <color attach="background" args={["#1a120c"]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[0, 7, 3]} angle={0.45} penumbra={0.6} intensity={140} castShadow color="#fff2d8" />
      <pointLight position={[0, 2.2, 0]} intensity={6} distance={4} color="#ffe2b0" />
      <CameraRig pos={lerp3([1.0, 2.5, 8.6], [0.35, 2.05, 5.9], t)} look={[0, 1.5, 0]} fov={48} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#3a2a1e" />
      </mesh>
      <mesh position={[0, 3.5, -2.6]}>
        <planeGeometry args={[20, 7]} />
        <meshStandardMaterial color="#6a5238" />
      </mesh>
      {[-2.6, 2.6].map((x, i) => (
        <group key={x} position={[x, 3.0, -2.55]}>
          <mesh>
            <planeGeometry args={[1.7, 1.7]} />
            <meshStandardMaterial color="#3a2414" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshStandardMaterial map={i ? board2 : board} />
          </mesh>
        </group>
      ))}
      <DisplayCase position={[0, 0, 0]} />
      <Bean position={[2.7, 0, -0.6]} rotY={-0.4} scale={1.0} pose={BP.idle} look={JAWAN} blink={f % 77 < 4} />
    </Stage3D>
  );
};

/* 8 ── BSF: Vijay Stambh after Longewala 1971; BSF jawans perform the aarti */
export const Bsf: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f71 = wordFrame(words, "1971");
  const fL = wordFrame(words, "longewala");
  const fV = wordFrame(words, "vijay");
  const fAur = wordFrame(words, "aur");
  const fP = wordFrame(words, "pooja");
  const fB = wordFrame(words, "bsf");
  const partB = f >= fAur - 2;
  const ta = prog(f, 0, fAur - 2, Easing.inOut(Easing.quad));
  const tb = prog(f, fAur - 2, dur);
  const aarti: BeanPose = { ...BP.lantern, ra: [1.0 + 0.35 * Math.sin(f / 7), -0.25 + 0.3 * Math.cos(f / 7)] };
  const bell = f >= fP ? Math.sin((f - fP) / 5) * 0.45 * Math.exp(-(f - fP) / 60) : 0;
  return (
    <Stage3D
      flashOp={flash(f, fAur - 2, 6, 0.3)}
      overlay={<g>
        {!partB && <g transform="translate(850,520) scale(0.6)"><DateBadge x={0} y={0} at={f71 - 2} top="SAN" big="1971" /></g>}
        <NameTag x={540} y={OY + 60} at={fL} text="LONGEWALA KI JEET" size={46} bg="#ffd84d" until={fV - 2} />
        <NameTag x={540} y={OY + 60} at={fV} text="VIJAY STAMBH" size={52} bg="#ff7a1a" fg="#ffffff" until={fAur - 4} />
        <Chip x={540} y={OY} at={fB} text="BSF KE JAWAN" bg="#1b3a20" />
      </g>}
    >
      <Day low />
      <DesertTerrain />
      <Scrub />
      <Temple glow={0.9} bellSwing={bell} />
      <VijayStambh position={[11, 0, 10]} />
      {[-1.8, 0, 1.8].map((x, i) => (
        <Bean key={x} position={[x, 0, 9.4 - Math.abs(x) * 0.15]} rotY={Math.PI - x * 0.1} scale={1.05} pose={i === 1 ? aarti : BP.hold} look={i === 1 ? { ...JAWAN, held: "lantern" } : JAWAN} />
      ))}
      {partB ? (
        <CameraRig pos={lerp3([8.5, 2.6, 17], [6.2, 2.3, 14.2], tb)} look={[0, 2.8, 7]} fov={50} />
      ) : (
        <CameraRig pos={lerp3([19, 1.6, 24], [17, 4.5, 21.5], ta)} look={lerp3([11, 6.5, 10], [10, 8, 9], ta)} fov={50} />
      )}
    </Stage3D>
  );
};

/* 9 ── CTA: the glowing temple at night — miracle or science? */
export const Cta: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fCh = wordFrame(words, "chamatkar");
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const t = prog(f, 0, dur);
  const a = lerp(0.55, 0.15, t);
  const focus = prog(f, fAur - 2, fAur + 10);
  return (
    <Stage3D
      exposure={1.3}
      tint="#000000"
      tintOp={focus * 0.45}
      overlay={<g>
        {f < fCom - 2 && <VoteButtons y={OY} at={fCh - 2} left="CHAMATKAR" right="SCIENCE" />}
        {f < fIti && f >= fCom - 2 && <g opacity={1 - prog(f, fAur, fIti)}><CommentBubble x={540} y={600} at={fCom - 2} /></g>}
        <ChannelCard x={540} y={470} at={fIti - 4} clickAt={fSub + 4} />
      </g>}
    >
      <Night />
      <DesertTerrain night />
      <Temple glow={1.4} />
      <Aura op={0.35} />
      <Shell position={[3.4, -0.5, 11]} rotation={[0.5, 0, -0.35]} scale={1.3} />
      <Shell position={[-4.2, -0.4, 12.5]} rotation={[-0.4, 0, 0.45]} scale={1.1} />
      <CameraRig pos={[Math.sin(a) * 26, 4.5, Math.cos(a) * 26]} look={[0, 6, 0]} fov={50} />
    </Stage3D>
  );
};

export const SCENES = { hook: Hook, place: Place, attack: Attack, duds: Duds, question: Question, science: Science, proof: Proof, bsf: Bsf, cta: Cta };
