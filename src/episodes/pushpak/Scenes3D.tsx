import React, { useMemo } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { CommentBubble, DateBadge, NameTag, VoteButtons } from "../../components/Props";
import { ChannelCard } from "../../components/Subscribe";
import { BP, Bean, BeanPose } from "../../components/three/Bean";
import { Book, FailCraft, Palm, Pushpak, Shelves, WallClock } from "../../components/three/Props3D";
import { Stage3D } from "../../components/three/Stage3D";
import { Chip, Stamp } from "../../components/three/Overlays";
import { CameraRig, Clouds, lerp3, SkyDome, Snowfall, softTexture, Stars, textTexture } from "../../components/three/World";
import { flash, lerp, pop, prog, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };

/** Lab room used by the IISc and reveal scenes. */
const Lab: React.FC<{ red?: number; sign?: boolean }> = ({ red = 0, sign: showSign = true }) => {
  const sign = useMemo(() => textTexture([{ text: "INDIAN INSTITUTE OF SCIENCE", size: 64, color: "#f4f1ea" }, { text: "BENGALURU • 1974", size: 56, color: "#ffd84d" }], 1024, 256, "#1f3550"), []);
  return (
    <group>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 6, 3]} intensity={70} distance={30} decay={1.4} color={red > 0 ? "#ff6a5a" : "#fff1dc"} />
      <spotLight position={[3, 8, 6]} angle={0.7} penumbra={0.6} intensity={80} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5, -5]}>
        <planeGeometry args={[40, 12]} />
        <meshStandardMaterial color="#c8bfae" />
      </mesh>
      {showSign && (
        <mesh position={[-0.6, 3.2, -4.95]}>
          <planeGeometry args={[3.6, 0.9]} />
          <meshStandardMaterial map={sign} />
        </mesh>
      )}
      <WallClock position={[2.4, 3.2, -4.9]} scale={0.6} />
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.14, 2.2]} />
        <meshStandardMaterial color="#6b4a2b" roughness={0.7} />
      </mesh>
      {[-1.9, 1.9].map((x) =>
        [-0.9, 0.9].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.45, z]}>
            <boxGeometry args={[0.12, 0.9, 0.12]} />
            <meshStandardMaterial color="#4a3018" />
          </mesh>
        )),
      )}
    </group>
  );
};

const SCI = (k: number) => ({ body: ["#f4f6f8", "#cfe0f3", "#e8dcc0"][k], legs: "#3a4250", glasses: true, skin: ["#c98e6a", "#d9a57e", "#b98060"][k] });

/* 1 ── HOOK: a golden flying palace emerges from the dusk clouds */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fK = wordFrame(words, "kitaab");
  const fD = wordFrame(words, "daava");
  const t = prog(f, 0, dur, Easing.out(Easing.cubic));
  const pz = lerp(-200, -22, t);
  return (
    <Stage3D flashOp={flash(f, fK, 7, 0.4)} overlay={<Stamp x={540} y={1050} at={fD - 2} text="DAAVA?" />}>
      <fog attach="fog" args={["#e8a27a", 140, 900]} />
      <SkyDome top="#1a1440" horizon="#f08a5a" />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#ffcfa0", "#3a2a40", 1.2]} />
      <directionalLight position={[-60, 30, -120]} intensity={2.4} color="#ffb070" />
      <CameraRig pos={[0, 3, 30]} look={[0, 10 + 2 * t, pz]} fov={50} />
      <Clouds y={-12} count={22} spread={200} color="#ffd8c0" opacity={0.85} />
      <Clouds y={30} count={10} spread={220} color="#f6c3a0" opacity={0.5} seed={9} speed={0.08} />
      <Pushpak position={[0, 11, pz]} rotation={[0.1, f * 0.008, 0]} scale={2.6} />
    </Stage3D>
  );
};

/* 2 ── PUSHPAK: orbit around the vimana above the clouds */
export const PushpakScene: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fP = wordFrame(words, "pushpak");
  const a = 0.4 + prog(f, 0, dur) * 1.4;
  return (
    <Stage3D overlay={<NameTag x={540} y={700} at={fP} text="PUSHPAK VIMAAN" size={44} bg="#ffd84d" />}>
      <fog attach="fog" args={["#f6d9b0", 60, 600]} />
      <SkyDome top="#3a6fc0" horizon="#ffe2b8" />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#ffe9c8", "#5a4a3a", 1.3]} />
      <directionalLight position={[40, 60, 40]} intensity={3} color="#ffe0b0" castShadow />
      <CameraRig pos={[Math.sin(a) * 15, 4 + Math.sin(a) * 2, Math.cos(a) * 15]} look={[0, 1.5, 0]} fov={50} />
      <Clouds y={-10} count={24} spread={160} />
      <Pushpak position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1.2} />
    </Stage3D>
  );
};

/* 3 ── BOOK: an old library, the Vaimanika Shastra opens */
export const BookScene: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f52 = wordFrame(words, "1952");
  const fV = wordFrame(words, "vaimanik");
  const fN = wordFrame(words, "nakshon");
  const open = prog(f, fV - 4, fV + 26, Easing.inOut(Easing.cubic));
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  return (
    <Stage3D overlay={<g><g transform="translate(860,500) scale(0.6)"><DateBadge x={0} y={0} at={f52 - 2} top="SAN" big="1952" /></g></g>}>
      <color attach="background" args={["#120c08"]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[2, 5, 4]} intensity={45} distance={25} decay={1.4} color="#ffcf8a" />
      <CameraRig pos={lerp3([0, 3.6, 7], [0.3, 2.6, 2.6], t)} look={[0, 1.1, 0]} fov={48} />
      <Shelves position={[0, 0, -4]} />
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 2.2]} />
        <meshStandardMaterial color="#4a2e18" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2a1c12" />
      </mesh>
      <Book position={[0, 1.0, 0]} open={open} glow={prog(f, fN - 10, fN + 6) + 0.3 * open} scale={1.1} />
      <Snowfall area={8} height={5} center={[0, 0.5, 0]} speed={0.01} size={0.05} />
    </Stage3D>
  );
};

/* 4 ── CLAIM: a pandit in meditation, a ghostly blueprint above */
export const Claim: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fD = wordFrame(words, "daava");
  const fR = wordFrame(words, "rishi");
  const fDh = wordFrame(words, "dhyaan");
  const holo = prog(f, fR - 6, fR + 14);
  const t = prog(f, 0, dur);
  return (
    <Stage3D exposure={1.25} overlay={<Stamp x={540} y={560} at={fD - 2} text="DAAVA" until={fR + 30} />}>
      <color attach="background" args={["#0d0a14"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 2.5, 2]} intensity={30} distance={14} decay={1.5} color="#ffb060" />
      <pointLight position={[0, 5, 0]} intensity={40 * holo + 10 * prog(f, fDh, fDh + 10)} distance={12} decay={1.4} color="#7fd4ff" />
      <CameraRig pos={[Math.sin(t * 0.6) * 1.5, 1.6, 7.5 - t * 1.2]} look={[0, 1.9, 0]} fov={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#3a2a20" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.2, 1.35, 48]} />
        <meshStandardMaterial color="#d9a93a" emissive="#ffb347" emissiveIntensity={0.6} />
      </mesh>
      <Bean position={[0, 0, 0]} scale={1.15} pose={BP.sit} look={{ body: "#f2efe6", legs: "#e8741e", beard: "#e8e8e8", eyes: "closed", skin: "#c98e6a" }} />
      <group position={[0, 2.9, 0]} scale={0.2 * holo} rotation={[0.25, f * 0.02, 0]}>
        <Pushpak position={[0, 0, 0]} wire />
      </group>
      <sprite position={[0, 3.1, 0]} scale={[3.5 * holo, 2.2 * holo, 1]}>
        <spriteMaterial map={softTexture()} color="#7fd4ff" transparent opacity={0.35 * holo} depthWrite={false} />
      </sprite>
    </Stage3D>
  );
};

/* 5 ── IISc 1974: the investigation begins */
export const Iisc: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f74 = wordFrame(words, "1974");
  const fJ = wordFrame(words, "jaanch");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const lean = (k: number): BeanPose => ({ ...BP.hold, head: [Math.sin(f / 20 + k) * 0.2, 0.45], lean: 0.25 });
  return (
    <Stage3D overlay={<g>
      <g transform="translate(860,520) scale(0.6)"><DateBadge x={0} y={0} at={f74 - 2} top="SAN" big="1974" /></g>
      <Chip x={540} y={780} at={fJ} text="JAANCH SHURU..." />
    </g>}>
      <color attach="background" args={["#1a1612"]} />
      <Lab />
      <CameraRig pos={lerp3([0, 4.4, 8.5], [0.5, 3.3, 5.2], t)} look={[0, 1.6, -1]} fov={50} />
      <Book position={[0, 1.02, 0]} open={1} glow={0.6} scale={1} />
      <Bean position={[-1.6, 0, 1.2]} rotY={0.6} pose={lean(0)} look={SCI(0)} blink={f % 91 < 4} />
      <Bean position={[1.7, 0, 1.0]} rotY={-0.7} pose={lean(1)} look={SCI(1)} blink={(f + 30) % 91 < 4} />
      <Bean position={[0.2, 0, -1.6]} rotY={0} pose={lean(2)} look={SCI(2)} blink={(f + 60) % 91 < 4} />
    </Stage3D>
  );
};

/* 6 ── REVEAL: written in the 20th century */
export const Reveal: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fC = wordFrame(words, "chaunkane");
  const fNahi = wordFrame(words, "nahi");
  const fB = wordFrame(words, "beesvi");
  const red = prog(f, fC - 2, fC + 4) * (0.6 + 0.4 * Math.sin(f / 2));
  const a = prog(f, 0, dur) * 1.2;
  const shock: BeanPose = BP.shock;
  return (
    <Stage3D flashOp={flash(f, fC, 9, 0.7)} tint="#ff0000" tintOp={0.12 * red} overlay={<g>
      <Stamp x={540} y={620} at={fNahi - 2} text="PURANI NAHI!" until={fB - 2} size={74} />
      {f >= fB - 2 && <g transform="translate(540,620) scale(0.8)"><DateBadge x={0} y={0} at={fB - 2} top="" big="20vi" bottom="SADI" /></g>}
    </g>}>
      <color attach="background" args={["#1a1612"]} />
      <Lab red={red} sign={false} />
      <CameraRig pos={[Math.sin(a) * 6.5, 3.4, Math.cos(a) * 6.5]} look={[0, 1.4, 0]} fov={50} />
      <Book position={[0, 1.02, 0]} open={1 - prog(f, fC, fC + 20)} glow={0.4} scale={1} />
      <Bean position={[-1.6, 0, 1.2]} rotY={0.6} pose={f >= fC ? shock : BP.hold} look={{ ...SCI(0), eyes: f >= fC ? "wide" : "normal" }} />
      <Bean position={[1.7, 0, 1.0]} rotY={-0.7} pose={f >= fC ? shock : BP.hold} look={{ ...SCI(1), eyes: f >= fC ? "wide" : "normal" }} />
      <Bean position={[0.2, 0, -1.6]} rotY={0} pose={f >= fC ? BP.facepalm : BP.hold} look={SCI(2)} />
    </Stage3D>
  );
};

/* 7 ── FAIL: the book's aircraft tries to fly and breaks apart */
export const Fail: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fV = wordFrame(words, "vimaan");
  const fK = wordFrame(words, "kaha");
  const fU = wordFrame(words, "udd");
  const fN = wordFrame(words, "nahi");
  const t = prog(f, 0, dur);
  const dustT = Math.max(0, f - fU);
  return (
    <Stage3D flashOp={flash(f, fU, 6, 0.5)} overlay={<Stamp x={540} y={640} at={fN - 2} text="UDD NAHI SAKTE!" size={66} />}>
      <fog attach="fog" args={["#cfe3f5", 60, 500]} />
      <SkyDome top="#3a7fd0" horizon="#d8ecfb" />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#d6e8ff", "#6b6250", 1.3]} />
      <directionalLight position={[30, 50, 30]} intensity={3} castShadow />
      <CameraRig pos={[6 - t * 1.5, 3 + t, 11 - t * 2]} look={[0, 1.4, 0]} fov={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#8aa26a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 8]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>
      {new Array(12).fill(0).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-27 + i * 5, 0.02, 0]}>
          <planeGeometry args={[2.4, 0.25]} />
          <meshStandardMaterial color="#f4f1ea" />
        </mesh>
      ))}
      <FailCraft position={[0, 0.75, 0]} spinFrom={fV} liftAt={fK} crashAt={fU} />
      {dustT > 0 &&
        new Array(10).fill(0).map((_, i) => {
          const k = Math.min(1, dustT / 30);
          return (
            <sprite key={i} position={[Math.cos(i) * 2.5 * k, 0.6 + k, Math.sin(i * 1.7) * 2.5 * k]} scale={[3 + 4 * k, 2 + 3 * k, 1]}>
              <spriteMaterial map={softTexture()} color="#b9a58c" transparent opacity={0.6 * (1 - k)} depthWrite={false} />
            </sprite>
          );
        })}
      <Bean position={[4.5, 0, 3]} rotY={-0.9} pose={f >= fN ? BP.facepalm : BP.idle} look={SCI(0)} />
      <Bean position={[5.6, 0, 1.6]} rotY={-1.1} pose={f >= fU ? BP.shock : BP.idle} look={{ ...SCI(1), eyes: f >= fU ? "wide" : "normal" }} />
    </Stage3D>
  );
};

/* 8 ── TWIST: Chowpatty, 1895 — a claim with no proof */
export const Twist: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f95 = wordFrame(words, "1895");
  const fS = wordFrame(words, "shivkar");
  const fW = wordFrame(words, "wright");
  const fU = wordFrame(words, "udaya");
  const fP = wordFrame(words, "par", 2);
  const fSab = wordFrame(words, "saboot");
  const rise = prog(f, fU - 8, fP, Easing.inOut(Easing.quad));
  const frozen = prog(f, fP - 2, fP + 8);
  const ff = f < fP ? f : fP;
  const t = prog(f, 0, dur);
  const crowd = [0, 1, 2, 3, 4, 5];
  return (
    <Stage3D tint="#7a4a1a" tintOp={0.18 + 0.3 * frozen} overlay={<g>
      <g transform="translate(860,500) scale(0.6)"><DateBadge x={0} y={0} at={f95 - 2} top="SAN" big="1895" /></g>
      <NameTag x={330} y={820} at={fS} text="SHIVKAR TALPADE" size={36} bg="#ffd84d" until={fP} />
      <Chip x={540} y={650} at={fW} text="WRIGHT BROTHERS SE PEHLE?" until={fP - 4} />
      {f >= fP && (
        <text x={540} y={760} textAnchor="middle" fontFamily="Creepster" fontSize={320 * pop(f, fP, 30, 8)} fill="#ffffff" opacity={0.9} filter="url(#ghostGlow)">
          ?
        </text>
      )}
      <Stamp x={540} y={1000} at={fSab - 2} text="SABOOT NAHI" size={76} />
    </g>}>
      <fog attach="fog" args={["#f2d6a8", 50, 420]} />
      <SkyDome top="#6aa6d8" horizon="#ffe4b8" />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#ffe9c8", "#6b5a40", 1.2]} />
      <directionalLight position={[-40, 40, 30]} intensity={2.8} color="#ffd9a8" castShadow />
      <CameraRig pos={[2 + t * 2, 2.6 + rise * 2.5, 12]} look={[0, 2 + rise * 5, 0]} fov={52} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#e8d3a8" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -40]}>
        <planeGeometry args={[400, 70]} />
        <meshStandardMaterial color="#2f86a8" roughness={0.2} metalness={0.2} />
      </mesh>
      <Palm position={[-9, 0, -6]} scale={1.1} />
      <Palm position={[10, 0, -8]} scale={1.3} seed={3} />
      <Palm position={[-14, 0, 2]} scale={0.9} seed={5} />
      {crowd.map((k) => (
        <Bean key={k} position={[-4 + k * 1.5, 0, 2.5 + (k % 2) * 1.2]} rotY={Math.PI + (k - 2.5) * 0.12}
          pose={f >= fU ? BP.cheer : { ...BP.idle, head: [0, -0.4 * rise] }}
          look={{ body: ["#f2efe6", "#c4421a", "#f2efe6", "#2b4a6b", "#e8a21e", "#f2efe6"][k], legs: "#efe6d0", hat: k % 3 === 1 ? "cap" : "turban", hatColor: ["#e8741e", "#2a2a30", "#f2efe6", "#b0122a", "#2a2a30", "#e8741e"][k] }}
          blink={(ff + k * 13) % 90 < 4} />
      ))}
      <Bean position={[0, 0, -1]} rotY={0.3} pose={BP.point} look={{ body: "#f2efe6", legs: "#f2efe6", hat: "turban", hatColor: "#e8741e", beard: undefined }} />
      <group position={[1.5, 1.5 + rise * 7, -2]} rotation={[0, ff * 0.02, Math.sin(ff / 8) * 0.08]}>
        <mesh scale={[1.6, 0.7, 0.7]} castShadow>
          <sphereGeometry args={[0.8, 20, 14]} />
          <meshStandardMaterial color="#c9b08a" roughness={0.7} />
        </mesh>
        <mesh position={[-1.4, 0, 0]} rotation={[ff * 0.6, 0, 0]}>
          <boxGeometry args={[0.06, 1.2, 0.16]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[1.1, 0.3, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.05]} />
          <meshStandardMaterial color="#8a6a46" />
        </mesh>
      </group>
    </Stage3D>
  );
};

/* 9 ── CTA: the vimana flies toward the moon */
export const Cta: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fS = wordFrame(words, "sach");
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const t = prog(f, 0, dur);
  const focus = prog(f, fAur - 2, fAur + 10);
  return (
    <Stage3D exposure={1.4} tint="#000000" tintOp={focus * 0.4} overlay={<g>
      {f < fCom + 4 && <g opacity={1 - prog(f, fCom - 4, fCom + 4)}><VoteButtons y={560} at={fS - 2} left="SACH" right="KAHANI" /></g>}
      {f < fIti && f >= fCom - 2 && <g opacity={1 - prog(f, fAur, fIti)}><CommentBubble x={540} y={560} at={fCom - 2} /></g>}
      <ChannelCard x={540} y={470} at={fIti - 4} clickAt={fSub + 4} />
    </g>}>
      <fog attach="fog" args={["#141a33", 80, 700]} />
      <SkyDome top="#04060f" horizon="#1d2650" />
      <Stars />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#6a80c0", "#141420", 1.1]} />
      <mesh position={[60, 120, -500]}>
        <sphereGeometry args={[36, 32, 16]} />
        <meshBasicMaterial color="#f3ecdc" fog={false} />
      </mesh>
      <CameraRig pos={[0, 2, 26]} look={[10 * t, 14 + 30 * t, -150]} fov={50} />
      <Clouds y={-14} count={20} spread={200} color="#6a7aa8" opacity={0.6} />
      <Pushpak position={[lerp(-6, 30, t), lerp(6, 70, t), lerp(-20, -260, t)]} rotation={[0.1, f * 0.01, 0]} scale={1.4} />
    </Stage3D>
  );
};

export const SCENES = { hook: Hook, pushpak: PushpakScene, book: BookScene, claim: Claim, iisc: Iisc, reveal: Reveal, fail: Fail, twist: Twist, cta: Cta };
