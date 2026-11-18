import React, { useMemo } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { Stage3D } from "../../components/three/Stage3D";
import { CommentBubble, DateBadge, NameTag } from "../../components/Props";
import { ChannelCard } from "../../components/Subscribe";
import { BP, Bean, BeanPose, walk } from "../../components/three/Bean";
import {
  BoneField,
  Bone,
  CameraRig,
  clampCam,
  Daylight,
  Hail,
  heightAt,
  Lake,
  lerp3,
  Mist,
  shoreR,
  Skull,
  SkyDome,
  Snowfall,
  Stars,
  Terrain,
  textTexture,
} from "../../components/three/World";
import { flash, pop, prog, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };

const DAWN = { top: "#3d5f99", hor: "#f3c79a", fog: "#e9d5c0" };

/* 1 ── HOOK: crane down from the peaks into the skeleton lake */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fK = wordFrame(words, "kankaal");
  const t = prog(f, 0, dur, Easing.inOut(Easing.cubic));
  const pos = clampCam(lerp3([10, 230, 210], [3, 8, 25], t), 12 * (1 - t) + 4);
  const look = lerp3([-25, 150, -420], [0, -1.8, 1], Math.pow(t, 0.75));
  return (
    <Stage3D flashOp={flash(f, fK, 8, 0.5)}>
      <fog attach="fog" args={[DAWN.fog, 170, 1300]} />
      <SkyDome top={DAWN.top} horizon={DAWN.hor} />
      <Daylight sun={[70, 90, 140]} sunColor="#ffe0bc" sky="#bcd4f7" ground="#7a6a58" />
      <CameraRig pos={pos} look={look} fov={55} />
      <Terrain />
      <Lake />
      <BoneField count={40} />
      <BoneField count={9} seed={77} rMin={0.5} rMax={8} />
      <Mist />
      <Snowfall area={90} height={60} />
    </Stage3D>
  );
};

/* 2 ── LOCATION: trekker on the rim, sign with the altitude */
export const Location: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fR = wordFrame(words, "roopkund");
  const tz = shoreR(Math.PI / 2) + 6;
  const ty = heightAt(0, tz);
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const pos = lerp3([3.5, ty + 9, tz + 10], [9, ty + 26, tz + 36], t);
  const look = lerp3([0, ty - 1, tz - 22], [-15, 30, -220], t);
  const sign = useMemo(
    () => textTexture([{ text: "ROOPKUND", size: 150, color: "#ffffff" }, { text: "5,029 m  •  16,499 ft", size: 74, color: "#ffd84d" }], 1024, 512, "#0b6e3d"),
    [],
  );
  const sp = pop(f, fR - 6, 30, 10);
  return (
    <Stage3D>
      <fog attach="fog" args={["#dfe8f3", 200, 1400]} />
      <SkyDome top="#2f6fc4" horizon="#cfe3f7" />
      <Daylight sun={[80, 120, 160]} sunColor="#fff2dc" sky="#cfe2ff" ground="#7a6a58" intensity={3.4} />
      <CameraRig pos={pos} look={look} fov={52} />
      <Terrain />
      <Lake />
      <BoneField count={30} />
      <mesh position={[0, ty - 0.2, tz]} scale={[2.6, 1.2, 2.2]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8d8794" flatShading roughness={0.9} />
      </mesh>
      <Bean position={[0, ty + 0.85, tz]} rotY={Math.PI} scale={1.1} pose={{ ...BP.idle, head: [Math.sin(f / 30) * 0.3, -0.1] }} look={{ body: "#d63a2f", legs: "#2f3440", hat: "beanie", hatColor: "#2b3a67", backpack: "#3d6b4f" }} blink={f % 97 < 4} />
      <group position={[3.4, ty + 0.3, tz + 0.5]} scale={sp} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.12, 2.4, 0.12]} />
          <meshStandardMaterial color="#7a5a3a" />
        </mesh>
        <mesh position={[0, 2.5, 0.08]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshStandardMaterial map={sign} />
        </mesh>
      </group>
      <Snowfall area={60} height={40} center={[0, ty, tz]} size={0.14} />
    </Stage3D>
  );
};

/* 3 ── 1942: forest ranger finds bones as the snow melts */
export const Discovery: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fMein = wordFrame(words, "mein");
  const fForest = wordFrame(words, "forest");
  const fBarf = wordFrame(words, "barf");
  const fHad = wordFrame(words, "haddiyon");
  const px = shoreR(0) + 3;
  const py = heightAt(px, 0);
  const melt = prog(f, fBarf, fHad + 6);
  const walkIn = prog(f, 0, fBarf - 4, Easing.out(Easing.quad));
  const rx = px + 1.8 + (1 - walkIn) * 9;
  const pose: BeanPose = f < fBarf - 4 ? walk(f * 0.32, 1 - walkIn * 0.6) : BP.kneel;
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const pos = clampCam(lerp3([px + 9, py + 4.5, 7], [px + 5.6, py + 3, 4.8], t), 1.5);
  const badge = prog(f, fMein, fMein + 12);
  return (
    <Stage3D
      overlay={
        <g>
          <g transform={`translate(${540 + 320 * badge},${640 - 170 * badge}) scale(${1 - 0.45 * badge})`}>
            <DateBadge x={0} y={0} at={0} top="SAN" big="1942" />
          </g>
          <NameTag x={330} y={760} at={fForest} text="FOREST RANGER" size={38} bg="#ffd84d" until={fHad + 20} />
        </g>
      }
    >
      <fog attach="fog" args={["#cfd6de", 120, 900]} />
      <SkyDome top="#7c8ea6" horizon="#d9dee4" />
      <Daylight sun={[90, 70, 60]} sunColor="#f4f1ea" sky="#d6e0ee" ground="#6f6252" intensity={2.6} />
      <CameraRig pos={pos} look={[px - 0.2, py + 0.5, 0]} fov={45} />
      <Terrain />
      <Lake />
      <group position={[px - 0.6, py, 0]}>
        <Skull position={[0, 0.05, 0.2]} rotation={[-0.5, 0.9, 0]} scale={0.75} />
        <Bone position={[0.7, 0.1, -0.6]} rotation={[0, 0.6, 0.1]} length={1.3} />
        <Bone position={[-0.5, 0.1, 0.7]} rotation={[0, -0.4, 0]} length={1.1} />
        <mesh position={[0, 0, 0]} scale={[2.6, 1.6 * (1 - melt) + 0.02, 2.6]} castShadow>
          <sphereGeometry args={[1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f7fafd" roughness={0.6} flatShading />
        </mesh>
      </group>
      <Bean position={[rx, heightAt(rx, 0.6), 0.6]} rotY={-Math.PI / 2} scale={1.1} pose={pose}
        look={{ body: "#a08a5a", legs: "#6b5a3a", hat: "ranger", held: "stick", eyes: f >= fHad ? "wide" : "normal", beard: undefined }} blink={f % 89 < 4} />
      <Snowfall area={30} height={20} center={[px, py, 0]} size={0.12} />
    </Stage3D>
  );
};

/* 4 ── THEORY: a deadly hailstorm on the pass */
export const Theory: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fBh = wordFrame(words, "bhayanak");
  const fOlon = wordFrame(words, "olon");
  const cx = -46;
  const cz = 14;
  const strike = Math.max(flash(f, fBh, 6, 1), flash(f, fOlon + 18, 5, 0.8));
  const runners = [0, 1, 2];
  const hail = prog(f, fBh - 10, fBh + 4);
  const mx = cx + 4 - f * 0.075 - 1.6;
  const my = heightAt(mx, cz);
  void dur;
  return (
    <Stage3D flashOp={strike * 0.5} exposure={0.8} tint="#0a1020" tintOp={0.35 * (1 - strike)}>
      <fog attach="fog" args={["#2a303c", 30, 260]} />
      <SkyDome top="#141822" horizon="#4a5160" />
      <Daylight sun={[-40, 80, 60]} sunColor="#c9d3ea" sky="#5a6478" ground="#2e2a28" intensity={1.2 + strike * 8} />
      <CameraRig pos={clampCam([mx + 3.5, my + 2.8, cz + 6.5], 1.5)} look={[mx - 0.5, my + 1.1, cz]} fov={50} />
      <Terrain />
      {runners.map((i) => {
        const x = cx + 4 - (f * 0.075) - i * 1.6;
        const z = cz + (i - 1) * 1.3;
        const legs = walk(f * 0.5 + i, 1, true);
        const pose: BeanPose = f >= fBh - 6 ? { ...legs, la: BP.cover.la, ra: BP.cover.ra, head: [0, 0.3] } : legs;
        return (
          <Bean key={i} position={[x, heightAt(x, z), z]} rotY={-Math.PI / 2} scale={1} pose={pose}
            look={{ body: ["#c4421a", "#e8d9b8", "#6b2a4a"][i], legs: "#e8dcc0", hat: "turban", hatColor: ["#f2f2f2", "#e8741e", "#b0122a"][i], eyes: "wide" }} />
        );
      })}
      {hail > 0 && <Hail center={[mx - 1, my - 1, cz]} area={12} height={14} count={Math.round(420 * hail)} />}
    </Stage3D>
  );
};

/* 5 ── DNA LAB 2019 */
export const Dna: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f2019 = wordFrame(words, "2019");
  const fDna = wordFrame(words, "dna");
  const fCh = wordFrame(words, "chaunka");
  const glow = prog(f, fDna - 6, fDna + 10);
  const screen = useMemo(() => textTexture([{ text: "DNA MATCH", size: 120, color: "#5ff2ff" }, { text: "SOUTH ASIA • MEDITERRANEAN", size: 56, color: "#ffffff" }], 1024, 512, "#08131f"), []);
  const ang = f * 0.045;
  const t = prog(f, 0, dur);
  const cam: [number, number, number] = [Math.sin(0.4 + t * 0.6) * 7, 3.4, Math.cos(0.4 + t * 0.6) * 7];
  return (
    <Stage3D flashOp={flash(f, fCh, 8, 0.55)}
      overlay={<g><g transform="translate(860,500) scale(0.55)"><DateBadge x={0} y={0} at={f2019 - 2} top="SAN" big="2019" /></g></g>}>
      <color attach="background" args={["#0a0f18"]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 4.5, 0]} color="#5ff2ff" intensity={30 + glow * 40} distance={20} decay={1.5} />
      <spotLight position={[4, 8, 5]} angle={0.6} intensity={60} penumbra={0.6} castShadow color="#ffffff" />
      <CameraRig pos={cam} look={[0, 2.2, 0]} fov={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1c2330" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5, -6]}>
        <planeGeometry args={[40, 12]} />
        <meshStandardMaterial color="#141b28" />
      </mesh>
      <mesh position={[0, 3.6, -5.8]}>
        <planeGeometry args={[4.6, 2.3]} />
        <meshStandardMaterial map={screen} emissive="#ffffff" emissiveMap={screen} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.16, 1.8]} />
        <meshStandardMaterial color="#d8dde6" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[3, 0.9, 1.5]} />
        <meshStandardMaterial color="#3a4250" />
      </mesh>
      <Skull position={[-0.6, 0.98, 0.1]} rotation={[0, 0.5, 0]} scale={0.8} />
      <group position={[0.6, 1.6, 0]} scale={0.55 + glow * 0.45}>
        {new Array(22).fill(0).map((_, i) => {
          const a = ang + i * 0.45;
          const y = i * 0.17;
          const x1 = Math.cos(a) * 0.55;
          const z1 = Math.sin(a) * 0.55;
          return (
            <group key={i}>
              <mesh position={[x1, y, z1]}>
                <sphereGeometry args={[0.07, 10, 8]} />
                <meshStandardMaterial color="#5ff2ff" emissive="#5ff2ff" emissiveIntensity={2} />
              </mesh>
              <mesh position={[-x1, y, -z1]}>
                <sphereGeometry args={[0.07, 10, 8]} />
                <meshStandardMaterial color="#ff5fd2" emissive="#ff5fd2" emissiveIntensity={2} />
              </mesh>
              <mesh position={[0, y, 0]} rotation={[0, -a, Math.PI / 2]}>
                <cylinderGeometry args={[0.018, 0.018, 1.1, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#9fdfff" emissiveIntensity={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>
      <Bean position={[-2.4, 0, 0.6]} rotY={0.9} scale={1.15} pose={f >= fCh ? BP.shock : { ...BP.hold, head: [0.3, -0.25] }}
        look={{ body: "#f4f6f8", legs: "#3a4250", coat: true, glasses: true, eyes: f >= fCh ? "wide" : "normal", skin: "#d9a57e" }} blink={f % 83 < 4} />
    </Stage3D>
  );
};

/* 6 ── INDIAN PILGRIMS, ~1200 years ago */
export const India: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fB = wordFrame(words, "bharat");
  const f12 = wordFrame(words, "1200");
  const a0 = 2.2;
  const r0 = shoreR(a0) + 9;
  const t = prog(f, 0, dur);
  const lead = 6 * t;
  const pilgrims = [0, 1, 2, 3, 4];
  const px = (k: number) => Math.cos(a0) * r0 + k * 1.6 - lead;
  const pz = (k: number) => Math.sin(a0) * r0 + k * 0.4;
  return (
    <Stage3D overlay={<g>
      <NameTag x={300} y={700} at={fB} text="BHARAT KE YATRI" size={38} bg="#ff9933" fg="#ffffff" />
      <g transform="translate(820,560) scale(0.6)"><DateBadge x={0} y={0} at={f12 - 2} top="KAREEB" big="1200" bottom="SAAL PEHLE" /></g>
    </g>}>
      <fog attach="fog" args={["#f6d7b0", 150, 1100]} />
      <SkyDome top="#e98a4b" horizon="#ffe3b5" />
      <Daylight sun={[-120, 40, 80]} sunColor="#ffc27a" sky="#ffd9a8" ground="#7a5a40" intensity={3.2} />
      <CameraRig pos={clampCam([px(2) + 3, heightAt(px(2), pz(2)) + 2.6, pz(2) + 8], 2)} look={[px(2) - 1, heightAt(px(2), pz(2)) + 1.3, pz(2)]} fov={48} />
      <Terrain />
      <Lake />
      {pilgrims.map((k) => {
        const x = px(k);
        const z = pz(k);
        return (
          <Bean key={k} position={[x, heightAt(x, z), z]} rotY={-Math.PI / 2 + 0.25} pose={walk(f * 0.28 + k * 1.3, 0.8)}
            look={{ body: ["#e8741e", "#f2efe6", "#c4421a", "#f2efe6", "#e8a21e"][k], legs: "#efe6d0", hat: "turban", hatColor: ["#f2efe6", "#e8741e", "#f2efe6", "#b0122a", "#f2efe6"][k], held: k % 2 ? "stick" : "none", beard: k === 0 ? "#efefef" : undefined }}
            blink={(f + k * 20) % 90 < 4} />
        );
      })}
    </Stage3D>
  );
};

/* 7 ── MEDITERRANEAN TRAVELLERS, ~200 years ago */
export const Greece: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const f14 = wordFrame(words, "14");
  const fG = wordFrame(words, "greece");
  const f200 = wordFrame(words, "200");
  const cx = Math.cos(3.6) * 46;
  const cz = Math.sin(3.6) * 46;
  const cy = heightAt(cx, cz);
  const t = prog(f, 0, dur);
  const ang = 0.6 + t * 0.9;
  const group = [0, 1, 2, 3];
  return (
    <Stage3D overlay={<g>
      {f >= f14 - 2 && (
        <g transform={`translate(250,600) scale(${pop(f, f14 - 2, 30, 9)})`}>
          <rect x={-150} y={-62} width={300} height={124} rx={30} fill="#111" stroke="#ffd84d" strokeWidth={6} />
          <text y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={76} fill="#ffd84d">14 LOG</text>
        </g>
      )}
      <NameTag x={560} y={760} at={fG} text="GREECE KE AASPAAS SE" size={34} bg="#2b6fe6" fg="#ffffff" />
      <g transform="translate(830,520) scale(0.6)"><DateBadge x={0} y={0} at={f200 - 2} top="LAGBHAG" big="200" bottom="SAAL PEHLE" /></g>
    </g>}>
      <fog attach="fog" args={["#aeb8c6", 60, 600]} />
      <SkyDome top="#59667a" horizon="#c3cbd6" />
      <Daylight sun={[60, 90, -40]} sunColor="#e6ecf5" sky="#c8d3e2" ground="#5e5650" intensity={2.4} />
      <CameraRig pos={clampCam([cx + Math.sin(ang) * 7, cy + 3, cz + Math.cos(ang) * 7], 1.5)} look={[cx, cy + 1.3, cz]} fov={48} />
      <Terrain />
      {group.map((k) => {
        const x = cx + (k - 1.5) * 1.3;
        const z = cz + (k % 2) * 1.1;
        return (
          <Bean key={k} position={[x, heightAt(x, z), z]} rotY={Math.sin(f / 25 + k * 1.7) * 0.9} scale={1.05}
            pose={k === 1 ? BP.hold : { ...BP.idle, head: [Math.sin(f / 18 + k) * 0.6, -0.1], la: [0.3, 0.3], ra: [0.3, -0.3] }}
            look={{ body: ["#26324d", "#5a3a22", "#2f4a32", "#5a1a2a"][k], legs: "#2a2a30", coat: true, hat: "cap", hatColor: ["#2a2a30", "#3a2a1a", "#2a2a30", "#3a2a1a"][k], held: k === 1 ? "map" : "none", skin: "#f0c8a8", eyes: "wide", beard: k === 2 ? "#6b4a2b" : undefined }}
            blink={(f + k * 17) % 95 < 4} />
        );
      })}
      <Snowfall area={40} height={25} center={[cx, cy, cz]} speed={0.14} size={0.16} />
    </Stage3D>
  );
};

/* 8 ── MYSTERY: night, lantern, a giant question mark in the sky */
export const Mystery: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fHaz = wordFrame(words, "hazaar");
  const fKaise = wordFrame(words, "kaise");
  const q = useMemo(() => textTexture([{ text: "?", size: 460, color: "#bfe8ff" }], 512, 512, undefined, "#7fd4ff"), []);
  const qs = 1 + 0.25 * prog(f, fKaise - 4, fKaise + 8) + 0.03 * Math.sin(f / 6);
  const qp = prog(f, 6, 30);
  const tz = shoreR(Math.PI / 2) - 0.5;
  const ty = heightAt(0.5, tz);
  const t = prog(f, 0, dur);
  return (
    <Stage3D exposure={1.7} overlay={<g>
      {f >= fHaz - 2 && f < fHaz + 70 && (
        <g transform={`translate(540,620) scale(${pop(f, fHaz - 2, 30, 9)})`}>
          <rect x={-290} y={-66} width={580} height={132} rx={30} fill="#d0141a" stroke="#ffffff" strokeWidth={6} />
          <text y={26} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={64} fill="#ffffff">1000 SAAL KA FARQ</text>
        </g>
      )}
    </g>}>
      <fog attach="fog" args={["#0c1222", 120, 900]} />
      <SkyDome top="#03050d" horizon="#1a2442" />
      <Stars />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#6a80c0", "#141420", 1.2]} />
      <directionalLight position={[-100, 120, -200]} intensity={1.4} color="#9fb4ff" />
      <mesh position={[160, 240, -900]}>
        <sphereGeometry args={[34, 32, 16]} />
        <meshBasicMaterial color="#f3ecdc" fog={false} />
      </mesh>
      <CameraRig pos={clampCam(lerp3([3, ty + 3, tz + 9], [2, ty + 2.2, tz + 5], t), 1.5)} look={[0, ty + 10 + 14 * qp, -80]} fov={55} />
      <Terrain />
      <Lake tint="#5a7aa8" />
      <BoneField count={30} />
      <Bean position={[0.5, ty, tz]} rotY={Math.PI} scale={1.1} pose={BP.lantern} look={{ body: "#2a2430", legs: "#1d1820", hat: "hood", hatColor: "#2a2430", held: "lantern" }} />
      <sprite position={[0, 48, -170]} scale={[70 * qs * qp, 70 * qs * qp, 1]} renderOrder={10}>
        <spriteMaterial map={q} transparent opacity={0.95 * qp} depthWrite={false} depthTest={false} fog={false} />
      </sprite>
      <Mist color="#9fb4e0" opacity={0.18} />
    </Stage3D>
  );
};

/* 9 ── CTA: night lake orbit + comment + subscribe card */
export const Cta: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const focus = prog(f, fAur - 2, fAur + 10);
  const a = 0.3 + prog(f, 0, dur) * 0.8;
  return (
    <Stage3D exposure={1.7} tint="#000000" tintOp={focus * 0.45} overlay={<g>
      {f < fIti && (
        <g opacity={1 - prog(f, fAur, fIti)}>
          <CommentBubble x={540} y={560} at={fCom - 2} />
        </g>
      )}
      <ChannelCard x={540} y={470} at={fIti - 4} clickAt={fSub + 4} />
    </g>}>
      <fog attach="fog" args={["#0c1222", 120, 900]} />
      <SkyDome top="#03050d" horizon="#1a2442" />
      <Stars />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#6a80c0", "#141420", 1.2]} />
      <directionalLight position={[-100, 120, -200]} intensity={1.4} color="#9fb4ff" />
      <mesh position={[-200, 260, -900]}>
        <sphereGeometry args={[40, 32, 16]} />
        <meshBasicMaterial color="#f3ecdc" fog={false} />
      </mesh>
      <CameraRig pos={clampCam([Math.sin(a) * 34, 12, Math.cos(a) * 34], 4)} look={[0, -1, 0]} fov={55} />
      <Terrain />
      <Lake tint="#5a7aa8" />
      <BoneField count={40} />
      <Mist color="#9fb4e0" opacity={0.2} />
      <Snowfall area={80} height={40} size={0.18} />
    </Stage3D>
  );
};

export const SCENES = { hook: Hook, location: Location, discovery: Discovery, theory: Theory, dna: Dna, india: India, greece: Greece, mystery: Mystery, cta: Cta };
