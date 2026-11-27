import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook } from "../../components/three/Bean";
import { Diyas } from "../../components/three/Desert3D";
import { Room } from "../../components/three/Mystery3D";
import { Palm } from "../../components/three/Props3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { rand, SkyDome, softTexture, Stars, textTexture } from "../../components/three/World";
import { lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/padmanabhaswamy.timeline.json";
import { DayLights, Moon, NightLights } from "../bhootiya-5/Worlds";
import { Torch } from "../shivaji-agra-escape/Scenes3D";

const GRANITE = "#b8aa8e";
const GRANITE_D = "#8a7c64";
const GOLD = "#e0b020";
const OFFICIAL: BeanLook = { body: "#f4f2ea", legs: "#f4f2ea", hat: "none", skin: "#a8744e", beard: "#2a2a2a" };

const Box: React.FC<{ p: V3; s: V3; c?: string; e?: string; ei?: number }> = ({ p, s, c = GRANITE, e, ei = 0 }) => (
  <mesh position={p} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={1} flatShading emissive={e ?? "#000000"} emissiveIntensity={ei} />
  </mesh>
);

/** Kerala-style east gopuram over the temple tank. */
const Gopuram: React.FC<{ lit: number }> = ({ lit }) => (
  <group position={[0, 0, -18]}>
    <Box p={[0, 3.5, 0]} s={[22, 7, 9]} />
    <Box p={[0, 7.3, 0]} s={[23, 0.6, 9.6]} c={GRANITE_D} />
    <Box p={[0, 2.6, 4.55]} s={[3.2, 5.2, 0.2]} c="#2a1a10" e="#ff9a30" ei={0.5 * lit} />
    {new Array(7).fill(0).map((_, i) => {
      const w = 20 - i * 2.3;
      const d = 8 - i * 0.75;
      return (
        <group key={i}>
          <Box p={[0, 8.4 + i * 2.6, 0]} s={[w, 2.2, d]} c={i % 2 ? GRANITE_D : GRANITE} />
          <Box p={[0, 9.6 + i * 2.6, 0]} s={[w + 0.4, 0.3, d + 0.4]} c="#6a5a44" />
          {[-1, 1].map((sd) => (
            <Box key={sd} p={[sd * (w / 2 - 0.9), 9.1 + i * 2.6, d / 2 + 0.05]} s={[1.2, 1.2, 0.3]} c="#6a5a44" />
          ))}
          {lit > 0 &&
            [-0.3, 0, 0.3].map((fx, k) => (
              <mesh key={k} position={[fx * w, 9.45 + i * 2.6, d / 2 + 0.25]}>
                <sphereGeometry args={[0.1, 6, 6]} />
                <meshBasicMaterial color="#ffc860" toneMapped={false} />
              </mesh>
            ))}
        </group>
      );
    })}
    {/* barrel roof + seven golden kalash */}
    <mesh position={[0, 27.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[1.6, 1.6, 6, 12, 1, false, 0, Math.PI]} />
      <meshStandardMaterial color={GRANITE_D} roughness={1} flatShading />
    </mesh>
    {[-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((x) => (
      <mesh key={x} position={[x, 29.1, 0]}>
        <coneGeometry args={[0.22, 0.9, 10]} />
        <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.3} emissive="#a06010" emissiveIntensity={0.3 + lit * 0.5} />
      </mesh>
    ))}
    {/* side walls */}
    {[-1, 1].map((sd) => (
      <Box key={sd} p={[sd * 26, 2.2, 1]} s={[30, 4.4, 2]} c="#d8ccb0" />
    ))}
  </group>
);

const Tank: React.FC = () => (
  <group position={[0, 0, 6]}>
    {new Array(5).fill(0).map((_, i) => (
      <mesh key={i} position={[0, -0.25 - i * 0.35, 0]} receiveShadow>
        <boxGeometry args={[30 - i * 1.2, 0.35, 14 - i * 1.2]} />
        <meshStandardMaterial color={i % 2 ? "#9a8a70" : "#b0a080"} roughness={1} />
      </mesh>
    ))}
    <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 8.2]} />
      <meshStandardMaterial color="#1a3a4a" metalness={0.7} roughness={0.12} />
    </mesh>
  </group>
);

/** Vault B door: riveted iron with two cobra reliefs. */
const Cobra: React.FC<{ x: number; flip: number; eyes: number }> = ({ x, flip, eyes }) => {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, -2.4, 0),
      new THREE.Vector3(0.5 * flip, -1.6, 0),
      new THREE.Vector3(-0.4 * flip, -0.6, 0),
      new THREE.Vector3(0.35 * flip, 0.3, 0),
      new THREE.Vector3(0, 1.1, 0),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.16, 8, false);
  }, [flip]);
  return (
    <group position={[x, 2.8, 0.18]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#b08a3a" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.45, 0]} scale={[1, 1.15, 0.35]}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshStandardMaterial color="#b08a3a" metalness={0.8} roughness={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.15, 1.55, 0.2]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshBasicMaterial color={eyes > 0 ? "#ff2020" : "#3a1a0a"} toneMapped={false} />
        </mesh>
      ))}
      {eyes > 0 && <pointLight position={[0, 1.55, 0.6]} color="#ff2020" intensity={4 * eyes} distance={3} />}
    </group>
  );
};

const CobraDoor: React.FC<{ eyes: number }> = ({ eyes }) => (
  <group position={[0, 0, -8]}>
    <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
      <boxGeometry args={[4.2, 5.6, 0.3]} />
      <meshStandardMaterial color="#3a3a3e" metalness={0.75} roughness={0.45} />
    </mesh>
    <mesh position={[0, 2.8, 0.16]}>
      <boxGeometry args={[0.06, 5.6, 0.04]} />
      <meshStandardMaterial color="#1a1a1c" />
    </mesh>
    {new Array(6).fill(0).map((_, r) =>
      [-1.8, -0.3, 0.3, 1.8].map((cx) => (
        <mesh key={`${r}${cx}`} position={[cx, 0.4 + r * 0.95, 0.17]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial color="#5a5a60" metalness={0.8} />
        </mesh>
      )),
    )}
    <Cobra x={-1.0} flip={1} eyes={eyes} />
    <Cobra x={1.0} flip={-1} eyes={eyes} />
    <Box p={[0, 5.9, 0.1]} s={[5.2, 0.6, 0.8]} c={GRANITE_D} />
    {[-1, 1].map((s) => (
      <Box key={s} p={[s * 2.4, 2.9, 0.1]} s={[0.6, 5.8, 0.8]} c={GRANITE_D} />
    ))}
  </group>
);

/** Stone corridor towards a vault door; `door` 0..1 opens a wooden door with gold light behind it. */
const Corridor: React.FC<{ cobra: boolean; door: number; eyes: number; spirit: number; officials: boolean }> = ({ cobra, door, eyes, spirit, officials }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  return (
    <>
      <color attach="background" args={["#040302"]} />
      <fog attach="fog" args={["#0a0604", 8, 30]} />
      <ambientLight intensity={0.25} color="#ffd8a0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 40]} />
        <meshStandardMaterial color="#5a4c3a" roughness={1} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 3, 3.2, 0]} rotation={[0, -s * (Math.PI / 2), 0]} receiveShadow>
          <planeGeometry args={[40, 6.4]} />
          <meshStandardMaterial color="#6a5a44" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 6.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 40]} />
        <meshStandardMaterial color="#3a2e22" roughness={1} />
      </mesh>
      {new Array(6).fill(0).map((_, i) => (
        <group key={i}>
          {[-1, 1].map((s) => (
            <Box key={s} p={[s * 2.8, 3.2, 6 - i * 3]} s={[0.5, 6.4, 0.6]} c="#5a4a36" />
          ))}
        </group>
      ))}
      <Torch position={[-2.6, 1.2, -2]} s={0.8} />
      <Torch position={[2.6, 1.2, -2]} s={0.8} />
      <pointLight position={[-2.2, 3.4, -2]} color="#ffa040" intensity={14 + Math.sin(f / 3) * 2} distance={12} />
      <pointLight position={[2.2, 3.4, -2]} color="#ffa040" intensity={14 + Math.cos(f / 3) * 2} distance={12} />
      {cobra ? (
        <>
          <CobraDoor eyes={eyes} />
          <pointLight position={[0, 4, -5]} color={eyes > 0 ? "#ff6040" : "#ffc080"} intensity={12} distance={9} />
          {spirit > 0 && (
            <group position={[0, 4 + spirit * 1.5, -8.6]}>
              <sprite scale={[6 * spirit, 7 * spirit, 1]}>
                <spriteMaterial map={tex} color="#30ff90" transparent opacity={0.35 * spirit} depthWrite={false} toneMapped={false} />
              </sprite>
              <mesh scale={[2.6 * spirit, 3 * spirit, 0.4]} position={[0, 1, 0]}>
                <sphereGeometry args={[1, 16, 12]} />
                <meshBasicMaterial color="#40ff90" transparent opacity={0.18 * spirit} depthWrite={false} />
              </mesh>
            </group>
          )}
        </>
      ) : (
        <group position={[0, 0, -8]}>
          <mesh position={[0, 2.8, -0.4]}>
            <planeGeometry args={[4.2, 5.6]} />
            <meshBasicMaterial color="#ffcf6a" toneMapped={false} />
          </mesh>
          <pointLight position={[0, 2.6, 1.2]} color="#ffc060" intensity={45 * door} distance={14} />
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 2.1, 0, 0]} rotation={[0, s * door * 1.3, 0]}>
              <mesh position={[-s * 1.05, 2.8, 0]} castShadow>
                <boxGeometry args={[2.1, 5.6, 0.25]} />
                <meshStandardMaterial color="#4a2a14" roughness={0.9} />
              </mesh>
              {[1.2, 2.8, 4.4].map((y) => (
                <mesh key={y} position={[-s * 1.05, y, 0.14]}>
                  <boxGeometry args={[2.0, 0.14, 0.04]} />
                  <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
                </mesh>
              ))}
            </group>
          ))}
          <Box p={[0, 5.9, 0.1]} s={[5.2, 0.6, 0.8]} c={GRANITE_D} />
        </group>
      )}
      {officials &&
        [-0.9, 0.9].map((x, i) => (
          <Bean key={i} position={[x, 0, -4.2 + i * 0.4]} rotY={Math.PI} scale={1} pose={i === 0 ? BP.lantern : BP.idle} look={{ ...OFFICIAL, held: i === 0 ? "lantern" : "map" }} />
        ))}
    </>
  );
};

const Treasure: React.FC<{ officials: boolean }> = ({ officials }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  const coins = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12);
    const mat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.25, emissive: "#6a4a08", emissiveIntensity: 0.4 });
    const N = 900;
    const m = new THREE.InstancedMesh(geo, mat, N);
    const d = new THREE.Object3D();
    const piles: [number, number, number, number][] = [
      [-2.2, -1.8, 1.6, 1.1],
      [2.0, -2.4, 1.4, 1.0],
      [0, -3.6, 2.2, 1.4],
      [-3.2, 0.6, 1.0, 0.7],
      [3.0, 0.2, 1.1, 0.7],
    ];
    for (let i = 0; i < N; i++) {
      const p = piles[i % piles.length];
      const a = rand(i, 3) * Math.PI * 2;
      const r = Math.sqrt(rand(i + 1, 3)) * p[2];
      const h = p[3] * (1 - r / p[2]);
      d.position.set(p[0] + Math.cos(a) * r, Math.max(0.02, h * rand(i + 2, 3) + 0.02), p[1] + Math.sin(a) * r);
      d.rotation.set(rand(i + 3, 3) * 1.4, rand(i + 4, 3) * 3, rand(i + 5, 3) * 1.4);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, []);
  return (
    <>
      <color attach="background" args={["#060402"]} />
      <ambientLight intensity={0.3} color="#ffd8a0" />
      <pointLight position={[0, 4.5, 1]} color="#ffd070" intensity={40} distance={14} />
      <pointLight position={[-3, 2, 3]} color="#ffa040" intensity={14} distance={9} />
      <Room wall="#5a4a36" floor="#3a2e22" w={10} d={8} h={5} />
      <primitive object={coins} />
      {/* golden idols */}
      {[
        [-1.2, -3.2, 1.15],
        [1.3, -3.4, 0.95],
        [0, -2.0, 0.8],
      ].map(([x, z, s], i) => (
        <group key={i}>
          <Box p={[x, 0.25, z]} s={[0.9, 0.5, 0.9]} c="#6a4a1a" />
          <Bean position={[x, 0.5, z]} rotY={0} scale={s} pose={i === 0 ? BP.cheer : BP.idle} look={{ body: GOLD, legs: GOLD, skin: "#e8c040", hat: "turban", hatColor: "#f0c830", eyes: "closed" }} />
        </group>
      ))}
      {/* chests + crowns + necklaces */}
      {[
        [-3.4, -2.6, 0.4],
        [3.4, -1.4, -0.5],
      ].map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, r, 0]}>
          <Box p={[0, 0.4, 0]} s={[1.4, 0.8, 0.9]} c="#5a2a12" />
          <mesh position={[0, 0.82, -0.2]} rotation={[-0.9, 0, 0]}>
            <boxGeometry args={[1.42, 0.06, 0.9]} />
            <meshStandardMaterial color="#5a2a12" />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[1.3, 0.1, 0.8]} />
            <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.25} emissive="#6a4a08" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
      {[
        [1.2, 1.1, -1.2],
        [-1.0, 1.0, -0.6],
      ].map(([x, y, z], i) => (
        <mesh key={`n${i}`} position={[x, y * 0.5, z]} rotation={[Math.PI / 2.4, 0, i]}>
          <torusGeometry args={[0.32, 0.05, 8, 24]} />
          <meshStandardMaterial color={i ? "#c8102e" : "#1a8a4a"} metalness={0.5} roughness={0.2} emissive={i ? "#6a0010" : "#0a4a20"} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {new Array(14).fill(0).map((_, i) => {
        const tw = Math.max(0, Math.sin(f / 4 + i * 1.7));
        return (
          <sprite key={`s${i}`} position={[(rand(i, 7) - 0.5) * 7, 0.4 + rand(i + 1, 7) * 1.4, -3.6 + rand(i + 2, 7) * 4]} scale={[0.5 * tw, 0.5 * tw, 1]}>
            <spriteMaterial map={tex} color="#fff2b0" transparent opacity={tw} depthWrite={false} toneMapped={false} />
          </sprite>
        );
      })}
      {officials && (
        <>
          <Bean position={[-1.8, 0, 1.6]} rotY={Math.PI - 0.3} scale={1} pose={BP.shock} look={{ ...OFFICIAL, held: "lantern" }} />
          <Bean position={[1.6, 0, 1.8]} rotY={Math.PI + 0.3} scale={1} pose={BP.hold} look={{ ...OFFICIAL, held: "map", glasses: true }} />
        </>
      )}
    </>
  );
};

const Lamp: React.FC<{ dim: number }> = ({ dim }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  const doc = useMemo(() => textTexture([{ text: "YACHIKA", size: 70, color: "#2a1a10" }, { text: "Supreme Court", size: 40, color: "#4a3a2a", font: "600" }, { text: "2011", size: 46, color: "#8a1a1a" }], 512, 640, "#efe6cf"), []);
  const fl = (0.85 + 0.15 * Math.sin(f / 2.3) * Math.sin(f / 5.1)) * (1 - dim * 0.85);
  return (
    <>
      <color attach="background" args={["#030201"]} />
      <ambientLight intensity={0.12} color="#ffd0a0" />
      <pointLight position={[0.4, 1.4, 0.2]} color="#ffb050" intensity={18 * fl} distance={7} />
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <boxGeometry args={[4, 1, 2.4]} />
        <meshStandardMaterial color="#4a2a14" />
      </mesh>
      <mesh position={[-0.7, 1.02, 0.1]} rotation={[-Math.PI / 2, 0, 0.15]}>
        <planeGeometry args={[1.1, 1.4]} />
        <meshStandardMaterial map={doc} />
      </mesh>
      <group position={[0.6, 1.0, 0.2]}>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.22, 0.14, 0.1, 14]} />
          <meshStandardMaterial color="#b0702a" metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.2, 0]} scale={[1, 1.9 * fl, 1]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshBasicMaterial color="#ffd070" toneMapped={false} transparent opacity={Math.max(0.15, fl)} />
        </mesh>
        <sprite position={[0, 0.22, 0]} scale={[0.9 * fl, 0.9 * fl, 1]}>
          <spriteMaterial map={tex} color="#ffb050" transparent opacity={0.8 * fl} depthWrite={false} toneMapped={false} />
        </sprite>
      </group>
    </>
  );
};

const Outside: React.FC<{ night: boolean }> = ({ night }) => (
  <>
    {night ? (
      <>
        <fog attach="fog" args={["#140e1e", 50, 220]} />
        <SkyDome top="#04050f" horizon="#2a1a3a" />
        <Stars />
        <Moon position={[-40, 50, -140]} size={26} />
        <NightLights moon={[-40, 50, -140]} />
        <pointLight position={[0, 8, -10]} color="#ffb050" intensity={60} distance={40} />
      </>
    ) : (
      <>
        <fog attach="fog" args={["#e8b890", 60, 300]} />
        <SkyDome top="#3a4a8a" horizon="#ffb070" />
        <DayLights warm sun={[50, 25, 40]} />
      </>
    )}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#9a8a6a" roughness={1} />
    </mesh>
    <Gopuram lit={night ? 1 : 0.3} />
    <Tank />
    {[-18, -14, 14, 18, -22, 22].map((x, i) => (
      <Palm key={i} position={[x, 0, -4 + (i % 2) * 6]} scale={1.8} seed={i} />
    ))}
    <Diyas points={new Array(14).fill(0).map((_, i) => [-13 + i * 2, 0.02, -0.6] as V3)} size={0.5} />
  </>
);

const World: React.FC<WP> = ({ x, ramp, after }) => {
  if (x.set === "temple") return <Outside night={x.night === true} />;
  if (x.set === "treasure") return <Treasure officials={x.officials === true} />;
  if (x.set === "lamp") return <Lamp dim={ramp(x.dimAt, 30)} />;
  return <Corridor cobra={x.cobra === true} door={x.door === true ? 1 : ramp(x.doorAt, 24)} eyes={x.eyes === true ? 1 : ramp(x.eyesAt, 10)} spirit={ramp(x.spiritAt, 24)} officials={x.officials === true || after(x.officialsAt)} />;
};

export const SCENES = makeScenes(World, {
  hook: sh([1.6, 2.6, 4.6], [1.0, 2.0, 3.2], [0, 0.6, -2.4], [0, 0.6, -2.4], {
    entry: false,
    exp: 1.4,
    x: { set: "treasure" },
    cut: { at: "darwaza", p: [[0.8, 2.4, -1.5], [0.3, 2.8, -4.0]], l: [[0, 3.6, -8], [0, 3.8, -8]], x: { set: "corridor", cobra: true, eyes: true }, exp: 1.5 },
    ov: [stamp("~1 LAAKH CRORE!", "laakh", { size: 86, until: "darwaza" }), stamp("EK DARWAZA BAND!", "darwaza", { size: 80 })],
  }),
  place: sh([30, 6, 40], [22, 8, 30], [0, 12, -16], [0, 14, -18], { x: { set: "temple" }, ov: [tag("SREE PADMANABHASWAMY, KERALA", "padmanabha", { size: 40, until: "vishnu" }), chip("BHAGWAN VISHNU KA DHAAM", "vishnu", { bg: "#5a3a1a" })] }),
  court: sh([0.4, 2.2, 6], [0.2, 2.4, 2.5], [0, 2.6, -8], [0, 2.6, -8], { exp: 1.4, x: { set: "corridor", doorAt: "tehkhane", officials: true }, ov: [date("2011", "SAN", "2011"), chip("SUPREME COURT KA AADESH", "supreme", { bg: "#1a2a4a" })] }),
  treasure: sh([0.6, 2.8, 4.6], [0.3, 2.0, 2.8], [0, 0.8, -2.4], [0, 0.7, -2.6], { exp: 1.4, x: { set: "treasure", officials: true }, ov: [stamp("SONA!", "sone", { size: 110, until: "sikke" }), stamp("HEERE + GEHNE!", "sikke", { size: 86 })] }),
  vaultb: sh([0.3, 2.4, 2.4], [0.1, 3.2, -3.4], [0, 3.4, -8], [0, 3.8, -8], { exp: 1.5, x: { set: "corridor", cobra: true }, ov: [stamp("TEHKHANA B: BAND", "b", { size: 78, until: "naag" }), tag("NAAG KI AAKRITI", "naag", { size: 52 })] }),
  legend: sh([1.6, 1.6, -2.4], [0.9, 1.8, -4.0], [0, 4.0, -8], [0, 4.4, -8], { exp: 1.5, x: { set: "corridor", cobra: true, eyesAt: "zabardasti", spiritAt: "zabardasti" }, flash: "anarth", ov: [chip("LOKKATHA", "lokkatha", { bg: "#4a1a6a", until: "anarth" }), stamp("ANARTH?!", "anarth", { size: 110 })] }),
  death: sh([1.8, 2.4, 2.8], [1.2, 2.0, 2.0], [0, 1.0, 0], [0.1, 1.0, 0], { sepia: true, x: { set: "lamp", dimAt: "maut" }, ov: [chip("YACHIKA KARNE WALE AFSAR", "yachika", { bg: "#3a2a1a", until: "hafton" }), tag("KUCH HAFTE BAAD...", "hafton", { size: 50 })] }),
  truth: sh([1.2, 2.0, 2.2], [0.8, 1.9, 1.6], [0, 1.0, 0], [0, 1.0, 0], { x: { set: "lamp" }, ov: [chip("WAJAH: BUKHAAR", "bukhaar", { bg: "#1b5e20", until: "shraap" }), stamp("AFWAAH = SHRAAP?", "shraap", { size: 74 })] }),
  today: sh([0, 3, 30], [0, 6, 22], [0, 14, -18], [0, 16, -18], { x: { set: "temple", night: true }, ov: [date("2020", "SAN", "2020"), chip("FAISLA: MANDIR SAMITI", "samiti", { bg: "#1a2a4a", until: "band" }), stamp("AAJ BHI BAND!", "band", { size: 96 })] }),
  cta: sh([0.2, 2.8, 1.6], [0.1, 3.0, -2.0], [0, 3.6, -8], [0, 3.8, -8], { exp: 1.5, x: { set: "corridor", cobra: true, eyes: true }, ov: [cta("KHOLO", "MAT KHOLO")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "padmanabhaswamy/mix.m4a", line1: "1 LAAKH CRORE KA KHAZANA", line2: "PAR TEHKHANA B?", nudge: "court" });
export const Padmanabha = short.Ep;
export const padmanabhaFrames = short.total;
void lerp;
