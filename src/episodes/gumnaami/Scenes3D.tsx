import React, { useMemo } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { CommentBubble, DateBadge, NameTag } from "../../components/Props";
import { ChannelCard } from "../../components/Subscribe";
import { BP, Bean, BeanLook, walk } from "../../components/three/Bean";
import { Chip, Stamp } from "../../components/three/Overlays";
import { Curtain, DnaHelix, Plane1945, Radio, Trunk } from "../../components/three/Props3D";
import { Stage3D } from "../../components/three/Stage3D";
import { CameraRig, Clouds, lerp3, Mist, SkyDome, softTexture, Stars, textTexture } from "../../components/three/World";
import { flash, lerp, pop, prog, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };

const NETAJI: BeanLook = { body: "#8f7f52", legs: "#7a6a44", hat: "officer", hatColor: "#8f7f52", glasses: true, skin: "#d9a57e" };
const SADHU: BeanLook = { body: "#c4621a", legs: "#c4621a", hat: "hood", hatColor: "#a8501a", beard: "#e8e8e8", skin: "#c98e6a" };

/** Simple old house with a tiled roof and a glowing window. */
const House: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const f = useCurrentFrame();
  const flick = 0.8 + 0.2 * Math.sin(f / 4) * Math.sin(f / 9);
  return (
    <group>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 4, 5]} />
        <meshStandardMaterial color="#b8a58a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[5.4, 2, 4]} />
        <meshStandardMaterial color="#7a3a22" roughness={0.8} />
      </mesh>
      <mesh position={[1.6, 2.4, 2.51]}>
        <planeGeometry args={[1.3, 1.3]} />
        <meshStandardMaterial color="#ffc46b" emissive="#ffb347" emissiveIntensity={1.6 * glow * flick} />
      </mesh>
      <mesh position={[-1.4, 1.2, 2.51]}>
        <planeGeometry args={[1.2, 2.4]} />
        <meshStandardMaterial color="#3a2414" />
      </mesh>
      <pointLight position={[1.6, 2.4, 3.6]} color="#ffb347" intensity={12 * glow * flick} distance={10} />
    </group>
  );
};

/* 1 ── HOOK: Faizabad 1985 — a sadhu's room, a trunk full of photographs */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fF = wordFrame(words, "faizabad");
  const fK = wordFrame(words, "kamre");
  const fN = wordFrame(words, "netaji");
  const fT = wordFrame(words, "tasveerein");
  const inside = f >= fK - 6;
  const tOut = prog(f, 0, fK - 6, Easing.inOut(Easing.quad));
  const tIn = prog(f, fK - 6, dur);
  return (
    <Stage3D
      flashOp={flash(f, fK - 6, 6, 0.5)}
      overlay={<g>
        <g transform="translate(840,500) scale(0.6)"><DateBadge x={0} y={0} at={1} top="SAN" big="1985" /></g>
        <NameTag x={300} y={760} at={fF} text="FAIZABAD" size={42} bg="#ffd84d" until={fK - 6} />
        <Stamp x={540} y={1040} at={fN} text="RAHASYA" until={dur} size={80} />
      </g>}
    >
      {!inside ? (
        <>
          <fog attach="fog" args={["#141a2e", 20, 120]} />
          <SkyDome top="#03050d" horizon="#1a2240" />
          <Stars />
          <ambientLight intensity={0.35} />
          <hemisphereLight args={["#5a6fa8", "#1a1410", 0.8]} />
          <CameraRig pos={lerp3([6, 3.5, 22], [2.2, 2.6, 6.5], tOut)} look={[1.2, 2.3, 0]} fov={50} />
          <House />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#2a2620" />
          </mesh>
          <Mist y={0.8} spread={14} opacity={0.25} color="#8fa0c8" />
        </>
      ) : (
        <>
          <color attach="background" args={["#120c08"]} />
          <ambientLight intensity={0.35} />
          <pointLight position={[1.5, 3.5, 2.5]} intensity={22} distance={14} decay={1.5} color="#ffcf8a" />
          <CameraRig pos={lerp3([0, 2.6, 4.6], [0, 2.2, 3.4], tIn)} look={[0, 1.3, 0]} fov={48} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#3a2a1c" />
          </mesh>
          <mesh position={[0, 3, -2.2]}>
            <planeGeometry args={[14, 8]} />
            <meshStandardMaterial color="#6b5a44" />
          </mesh>
          <Trunk position={[0, 0, 0]} open={prog(f, fK, fK + 18)} rise={prog(f, fN - 4, fT + 4, Easing.out(Easing.cubic))} />
        </>
      )}
    </Stage3D>
  );
};

/* 2 ── CRASH: the official story, Taihoku 1945 */
export const Crash: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f45 = wordFrame(words, "1945");
  const fT = wordFrame(words, "taiwan");
  const fC = wordFrame(words, "crash");
  const t = prog(f, 0, fC, Easing.in(Easing.quad));
  const pos: [number, number, number] = [lerp(-40, 6, t), lerp(26, 1.5, t), lerp(-30, -6, t)];
  const fire = prog(f, fC, fC + 10);
  const sign = useMemo(() => textTexture([{ text: "TAIHOKU", size: 120, color: "#f4f1ea" }, { text: "18 AUGUST 1945", size: 70, color: "#ffd84d" }], 1024, 384, "#2a2a30"), []);
  void dur;
  return (
    <Stage3D flashOp={flash(f, fC, 9, 0.85)} tint="#ff4a1a" tintOp={0.18 * fire} overlay={<g>
      <g transform="translate(540,600) scale(0.75)" opacity={1 - prog(f, fT, fT + 8)}><DateBadge x={0} y={0} at={f45 - 2} top="18 AUGUST" big="1945" /></g>
      <Chip x={540} y={760} at={fC + 4} text="SARKAARI KAHANI" />
    </g>}>
      <fog attach="fog" args={["#9aa2ae", 60, 500]} />
      <SkyDome top="#5a6a86" horizon="#c8ccd2" />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#c8d0e0", "#3a3a30", 1.1]} />
      <directionalLight position={[30, 50, 20]} intensity={2.2} castShadow />
      <CameraRig pos={f >= fC ? [16, 5, 10] : [pos[0] + 12, pos[1] + 2.5, pos[2] + 14]} look={f >= fC ? [6, 1.5, -6] : pos} fov={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#5a6a48" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.3]} position={[0, 0.01, -6]}>
        <planeGeometry args={[80, 7]} />
        <meshStandardMaterial color="#4a4a50" />
      </mesh>
      <group position={[2, 0, 0]} rotation={[0, 0.9, 0]}>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[0.15, 2.8, 0.15]} />
          <meshStandardMaterial color="#5a5a5a" />
        </mesh>
        <mesh position={[0, 3.1, 0.1]}>
          <planeGeometry args={[3.2, 1.2]} />
          <meshStandardMaterial map={sign} />
        </mesh>
      </group>
      {f < fC + 2 && <Plane1945 position={pos} rotation={[0.25, 0.6, -0.25 - t * 0.3]} scale={1.5} smoke={prog(f, fT - 10, fT + 10)} />}
      {f >= fC && (
        <group position={[6, 0.5, -6]}>
          <pointLight color="#ff7a2a" intensity={60 * fire} distance={30} />
          {new Array(12).fill(0).map((_, i) => (
            <sprite key={i} position={[Math.cos(i) * 1.5, 0.8 + (i % 4) * 0.9 + (f - fC) * 0.03, Math.sin(i * 1.3) * 1.5]} scale={[2.5 + i * 0.2, 2.5 + i * 0.2, 1]}>
              <spriteMaterial map={softTexture()} color={i % 3 === 0 ? "#ffb347" : "#3a3436"} transparent opacity={0.75 * fire} depthWrite={false} />
            </sprite>
          ))}
        </group>
      )}
    </Stage3D>
  );
};

/* 3 ── COMMISSION 2005: "he did not die in that crash" */
export const Commission: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f05 = wordFrame(words, "2005");
  const fM = wordFrame(words, "mukherjee");
  const fNahi = wordFrame(words, "nahi", 1);
  const fR = wordFrame(words, "report");
  const sign = useMemo(() => textTexture([{ text: "MUKHERJEE AAYOG", size: 110, color: "#f4f1ea" }, { text: "JAANCH • 2005", size: 70, color: "#ffd84d" }], 1024, 320, "#3a1c14"), []);
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  return (
    <Stage3D flashOp={flash(f, fNahi, 8, 0.6)} overlay={<g>
      <g transform="translate(840,520) scale(0.6)"><DateBadge x={0} y={0} at={f05 - 2} top="SAN" big="2005" /></g>
      <Stamp x={540} y={660} at={fNahi - 2} text="NAHI MARE THE!" until={fR - 6} size={72} />
      <Chip x={540} y={660} at={fR - 2} text="SARKAAR NE NAHI MAANA" bg="#7a1010" />
    </g>}>
      <color attach="background" args={["#1a120e"]} />
      <ambientLight intensity={0.55} />
      <spotLight position={[0, 9, 6]} angle={0.6} penumbra={0.6} intensity={90} castShadow />
      <CameraRig pos={lerp3([0, 2.6, 6.5], [0.4, 2.3, 4.8], t)} look={[0, 1.9, -1.5]} fov={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#4a3020" />
      </mesh>
      <mesh position={[0, 4, -3.5]}>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#7a5a40" />
      </mesh>
      <mesh position={[0, 3.35, -3.45]}>
        <planeGeometry args={[3.4, 1.05]} />
        <meshStandardMaterial map={sign} />
      </mesh>
      <mesh position={[0, 0.5, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[5, 1.0, 1.2]} />
        <meshStandardMaterial color="#5a2e18" roughness={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[1.4, 1.1 + i * 0.12, -1.0]} rotation={[0, 0.1 * i, 0]}>
          <boxGeometry args={[0.9, 0.1, 0.65]} />
          <meshStandardMaterial color={["#e8dcc0", "#c9d6e8", "#f4e6b0"][i]} />
        </mesh>
      ))}
      <mesh position={[0, 0.2, -2.1]}>
        <boxGeometry args={[3, 0.4, 1.2]} />
        <meshStandardMaterial color="#3a2010" />
      </mesh>
      <Bean position={[0, 0.4, -2.1]} scale={1.15} pose={f >= fM ? BP.point : BP.idle} look={{ body: "#1b1b22", legs: "#1b1b22", glasses: true, skin: "#c98e6a", beard: "#d8d8d8" }} blink={f % 91 < 4} />
    </Stage3D>
  );
};

/* 4 ── BABA: a silhouette in the mist — Gumnaami Baba? */
export const Baba: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fG = wordFrame(words, "gumnaami");
  const t = prog(f, 0, dur);
  const z = lerp(-8, -2.5, t);
  return (
    <Stage3D exposure={1.3} overlay={<NameTag x={540} y={800} at={fG} text="GUMNAAMI BABA?" size={50} bg="#c4621a" fg="#ffffff" />}>
      <fog attach="fog" args={["#1a1e2e", 6, 40]} />
      <SkyDome top="#03050d" horizon="#252a44" />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 4, z + 6]} intensity={14} distance={20} color="#9fb4ff" />
      <pointLight position={[0, 1.5, z - 2]} intensity={10} distance={8} color="#ffb347" />
      <CameraRig pos={[0.4, 1.6, 4]} look={[0, 1.4, z]} fov={46} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a20" />
      </mesh>
      <Bean position={[0, 0, z]} scale={1.15} pose={walk(f * 0.22, 0.55)} look={{ ...SADHU, body: "#3a2416", legs: "#3a2416", hatColor: "#4a2a14", eyes: "closed" }} />
      <Mist y={0.4} spread={10} opacity={0.35} color="#8fa0c8" />
    </Stage3D>
  );
};

/* 5 ── CURTAIN: he spoke only from behind a curtain */
export const CurtainScene: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fC = wordFrame(words, "chehra");
  const fP = wordFrame(words, "parde");
  const t = prog(f, 0, dur);
  return (
    <Stage3D overlay={<g>
      <Stamp x={540} y={600} at={fC} text="CHEHRA NAHI" until={fP - 4} size={74} />
      <Chip x={540} y={600} at={fP} text="SIRF PARDE KE PEECHE SE" />
    </g>}>
      <color attach="background" args={["#100a08"]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2.4, -3.2]} intensity={26} distance={10} decay={1.4} color="#ffb060" />
      <pointLight position={[2, 3, 4]} intensity={8} distance={12} color="#9fb4ff" />
      <CameraRig pos={[-0.6 + t * 0.4, 2.0, 5.2 - t * 0.6]} look={[0.2, 1.7, -1.5]} fov={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2a1c14" />
      </mesh>
      <mesh position={[0, 2, -3.6]}>
        <planeGeometry args={[7, 5]} />
        <meshStandardMaterial color="#ffd08a" emissive="#ffb050" emissiveIntensity={1.1} />
      </mesh>
      <Bean position={[0.2, 0, -2.2]} scale={1.15} pose={BP.sit} look={{ ...SADHU, body: "#0c0806", legs: "#0c0806", hatColor: "#0c0806", beard: "#0c0806", skin: "#0c0806" }} />
      <Curtain position={[0, 2, -1]} width={5.5} height={4} />
      <Bean position={[1.9, 0, 0.9]} rotY={Math.PI - 0.5} scale={1.0} pose={BP.sit} look={{ body: "#2b4a6b", legs: "#e8dcc0", skin: "#d9a57e" }} blink={f % 87 < 4} />
    </Stage3D>
  );
};

/** 2D overlay: two voice waveforms that look alike. */
const VoiceCompare: React.FC<{ at: number; matchAt: number }> = ({ at, matchAt }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pop(f, at, 30, 10);
  const rows = [
    { label: "NETAJI", color: "#ffd84d", y: 0 },
    { label: "BABA", color: "#ff8a3d", y: 150 },
  ];
  return (
    <g transform={`translate(540,560) scale(${p})`}>
      <rect x={-470} y={-90} width={940} height={330} rx={30} fill="rgba(10,10,16,0.82)" stroke="#ffffff" strokeWidth={4} />
      {rows.map((r, k) => (
        <g key={r.label} transform={`translate(0,${r.y})`}>
          <text x={-440} y={12} fontFamily="Poppins" fontWeight={900} fontSize={40} fill={r.color}>{r.label}</text>
          {new Array(30).fill(0).map((_, i) => {
            const h = 14 + 46 * Math.abs(Math.sin(i * 0.9 + (f - at) / 4 + k * 0.15)) * (0.5 + 0.5 * Math.abs(Math.sin(i * 0.37)));
            return <rect key={i} x={-230 + i * 22} y={-h / 2} width={12} height={h} rx={6} fill={r.color} />;
          })}
        </g>
      ))}
      {f >= matchAt && (
        <text y={-110} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={54} fill="#5ff28a" transform={`scale(${pop(f, matchAt, 30, 8)})`}>
          MILTI-JULTI AAWAAZ
        </text>
      )}
    </g>
  );
};

/* 6 ── VOICE: the commission noted the voice was very similar */
export const Voice: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fA = wordFrame(words, "aawaaz");
  const fJ = wordFrame(words, "jaisi");
  const t = prog(f, 0, dur);
  return (
    <Stage3D overlay={<VoiceCompare at={fA - 2} matchAt={fJ} />}>
      <color attach="background" args={["#140e0a"]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[1, 3, 3]} intensity={18} distance={12} color="#ffcf8a" />
      <CameraRig pos={[Math.sin(t) * 1.2, 1.9, 3.6 - t * 0.6]} look={[0, 1.2, 0]} fov={46} />
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <boxGeometry args={[4, 1, 2]} />
        <meshStandardMaterial color="#4a2e18" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#24180e" />
      </mesh>
      <Radio position={[-0.6, 1.5, 0]} glow={0.8 + 0.2 * Math.sin(f / 3)} />
      <group position={[1.1, 1.0, 0.2]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 1, 8]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <capsuleGeometry args={[0.13, 0.22, 6, 12]} />
          <meshStandardMaterial color="#b8bcc4" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>
    </Stage3D>
  );
};

/* 7 ── REVEAL 2019: a follower, not Netaji — DNA did not match */
export const Reveal: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f19 = wordFrame(words, "2019");
  const fA = wordFrame(words, "anuyayi");
  const fD = wordFrame(words, "dna");
  const fK = wordFrame(words, "khaya");
  const dna = prog(f, fD - 6, fD + 8);
  const t = prog(f, 0, dur);
  const cover = useMemo(() => textTexture([{ text: "AAYOG REPORT", size: 120, color: "#3a2410" }, { text: "GUMNAAMI BABA • 2019", size: 70, color: "#7a1010" }], 1024, 720, "#e9d9b0"), []);
  return (
    <Stage3D flashOp={flash(f, fA, 8, 0.6)} overlay={<g>
      <g transform="translate(840,500) scale(0.6)"><DateBadge x={0} y={0} at={f19 - 2} top="SAN" big="2019" /></g>
      <Stamp x={540} y={660} at={fA - 2} text="ANUYAYI" until={fD - 4} size={92} />
      <Stamp x={540} y={660} at={fK - 2} text="DNA MATCH NAHI" size={66} />
    </g>}>
      <color attach="background" args={["#0a0f18"]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 4.5, 1]} color="#5ff2ff" intensity={20 + dna * 40} distance={20} decay={1.5} />
      <spotLight position={[3, 8, 5]} angle={0.6} penumbra={0.6} intensity={60} castShadow />
      <CameraRig pos={[Math.sin(0.2 + t * 0.6) * 4.6, 2.9, Math.cos(0.2 + t * 0.6) * 4.6]} look={[0, 1.4, 0]} fov={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1c2330" />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.16, 1.8]} />
        <meshStandardMaterial color="#d8dde6" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[3, 0.9, 1.5]} />
        <meshStandardMaterial color="#3a4250" />
      </mesh>
      <mesh position={[-0.75, 1.03, 0.15]} rotation={[-Math.PI / 2, 0, 0.25]} castShadow>
        <planeGeometry args={[1.5, 1.05]} />
        <meshStandardMaterial map={cover} />
      </mesh>
      {dna > 0 && <DnaHelix position={[0.7, 1.05, 0]} scale={0.42 * dna} colorA={f >= fK ? "#ff4a4a" : "#5ff2ff"} colorB={f >= fK ? "#ff4a4a" : "#ff5fd2"} />}
    </Stage3D>
  );
};

/* 8 ── CTA: Netaji walks into the mist — what happened after 1945? */
export const Cta: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fK = wordFrame(words, "kya");
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const t = prog(f, 0, dur);
  const focus = prog(f, fAur - 2, fAur + 10);
  const q = useMemo(() => textTexture([{ text: "?", size: 460, color: "#f3ecdc" }], 512, 512, undefined, "#ffd27a"), []);
  const qp = prog(f, fK - 4, fK + 10);
  return (
    <Stage3D exposure={1.4} tint="#000000" tintOp={focus * 0.45} overlay={<g>
      {f < fIti && f >= fCom - 2 && <g opacity={1 - prog(f, fAur, fIti)}><CommentBubble x={540} y={560} at={fCom - 2} /></g>}
      <ChannelCard x={540} y={470} at={fIti - 4} clickAt={fSub + 4} />
    </g>}>
      <fog attach="fog" args={["#1a1e2e", 8, 60]} />
      <SkyDome top="#03050d" horizon="#252a44" />
      <Stars />
      <ambientLight intensity={0.4} />
      <hemisphereLight args={["#6a80c0", "#141420", 1.0]} />
      <CameraRig pos={[0, 1.8, 5]} look={[0, 2 + qp * 2, -10]} fov={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a20" />
      </mesh>
      <Bean position={[0, 0, lerp(-1, -9, t)]} rotY={Math.PI + Math.sin(f / 30) * 0.15} scale={1.15} pose={walk(f * 0.2, 0.5)} look={NETAJI} />
      <Clouds y={9} count={8} spread={40} color="#4a5478" opacity={0.4} scale={0.25} />
      <sprite position={[0, 8, -30]} scale={[12 * qp, 12 * qp, 1]}>
        <spriteMaterial map={q} transparent opacity={0.9 * qp} depthWrite={false} fog={false} />
      </sprite>
      <Mist y={0.4} spread={12} opacity={0.3} color="#8fa0c8" />
    </Stage3D>
  );
};

export const SCENES = { hook: Hook, crash: Crash, commission: Commission, baba: Baba, curtain: CurtainScene, voice: Voice, reveal: Reveal, cta: Cta };
