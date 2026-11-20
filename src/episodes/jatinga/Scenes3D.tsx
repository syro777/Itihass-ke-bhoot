import React, { useMemo } from "react";
import { Easing, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { CommentBubble, NameTag, VoteButtons } from "../../components/Props";
import { ChannelCard } from "../../components/Subscribe";
import { BP, Bean, BeanLook } from "../../components/three/Bean";
import { Chip, Stamp } from "../../components/three/Overlays";
import { Stage3D } from "../../components/three/Stage3D";
import { CameraRig, fbm, lerp3, Mist, rand, SkyDome, softTexture } from "../../components/three/World";
import { flash, lerp, prog, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };
type V3 = [number, number, number];
const OY = 640;

const sm = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------------- terrain: a misty valley with the village on a flat shelf ---------------- */
const jH = (x: number, z: number) => {
  const r = Math.hypot(x, z + 4);
  return sm(16, 70, r) * (8 + fbm(x * 0.02, z * 0.02, 4, 51) * 34) + (fbm(x * 0.08, z * 0.08, 2, 7) - 0.5) * 0.6;
};

const Hills: React.FC<{ dawn?: boolean }> = ({ dawn = false }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(500, 500, 140, 140);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, jH(pos.getX(i), pos.getZ(i)));
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    const P = ng.attributes.position as THREE.BufferAttribute;
    const N = ng.attributes.normal as THREE.BufferAttribute;
    const cols = new Float32Array(P.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < P.count; i += 3) {
      const ny = (N.getY(i) + N.getY(i + 1) + N.getY(i + 2)) / 3;
      const patch = fbm(P.getX(i) * 0.06, P.getZ(i) * 0.06, 3, 9);
      if (ny < 0.7) c.set("#2c3a24");
      else c.set(patch > 0.55 ? "#2f5a2c" : patch > 0.45 ? "#3a6a30" : "#28502a");
      c.offsetHSL(0, 0, (rand(i, 4) - 0.5) * 0.04);
      for (let k = 0; k < 3; k++) {
        cols[(i + k) * 3] = c.r;
        cols[(i + k) * 3 + 1] = c.g;
        cols[(i + k) * 3 + 2] = c.b;
      }
    }
    ng.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return ng;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={1} color={dawn ? "#ffffff" : "#b8c4d8"} />
    </mesh>
  );
};

const Bamboo: React.FC<{ position: V3; seed?: number; s?: number }> = ({ position, seed = 1, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <group position={position} scale={s}>
      {new Array(7).fill(0).map((_, i) => {
        const a = rand(i, seed) * Math.PI * 2;
        const lean = 0.08 + rand(i + 3, seed) * 0.18 + Math.sin(f / 40 + i + seed) * 0.02;
        const h = 6 + rand(i + 5, seed) * 3;
        return (
          <group key={i} position={[Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5]} rotation={[Math.sin(a) * lean, 0, -Math.cos(a) * lean]}>
            <mesh position={[0, h / 2, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.07, h, 5]} />
              <meshStandardMaterial color={i % 2 ? "#5a7a2a" : "#6a8a30"} roughness={0.8} />
            </mesh>
            <mesh position={[0, h - 0.6, 0]} scale={[1.2, 0.5, 1.2]}>
              <icosahedronGeometry args={[0.7, 0]} />
              <meshStandardMaterial color="#3e6a26" flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const Hut: React.FC<{ position: V3; rotY?: number; lit?: number }> = ({ position, rotY = 0, lit = 1 }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    {[-1.3, 1.3].map((x) =>
      [-1.3, 1.3].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.3, z]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 5]} />
          <meshStandardMaterial color="#4a3420" />
        </mesh>
      )),
    )}
    <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
      <boxGeometry args={[3, 2.2, 3]} />
      <meshStandardMaterial color="#6a5038" roughness={1} />
    </mesh>
    <mesh position={[0, 3.35, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.15, 1, 1.15]} castShadow>
      <coneGeometry args={[2.6, 1.3, 4]} />
      <meshStandardMaterial color="#6a6a72" metalness={0.4} roughness={0.5} />
    </mesh>
    <mesh position={[0.6, 1.8, 1.51]}>
      <planeGeometry args={[0.7, 0.7]} />
      <meshStandardMaterial color="#2a2018" emissive="#ffb347" emissiveIntensity={1.3 * lit} />
    </mesh>
  </group>
);

/** Petromax lantern on a bamboo pole. */
const LampPost: React.FC<{ position: V3; on?: number; h?: number }> = ({ position, on = 1, h = 3.4 }) => {
  const f = useCurrentFrame();
  const fl = 0.9 + 0.1 * Math.sin(f / 2.7 + position[0]);
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, h, 6]} />
        <meshStandardMaterial color="#6a8a30" />
      </mesh>
      <group position={[0, h + 0.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 14, 10]} />
          <meshBasicMaterial color="#fff6d0" toneMapped={false} />
        </mesh>
        <sprite scale={[3.4 * fl * on, 3.4 * fl * on, 1]}>
          <spriteMaterial map={softTexture()} color="#ffd27a" transparent opacity={0.85 * on} depthWrite={false} />
        </sprite>
        <pointLight color="#ffcf7a" intensity={34 * on * fl} distance={16} decay={1.5} />
      </group>
    </group>
  );
};

const WatchTower: React.FC<{ position: V3; beam?: number }> = ({ position, beam = 1 }) => {
  const f = useCurrentFrame();
  const sweep = Math.sin(f / 40) * 0.5;
  return (
    <group position={position}>
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 3.5, z]} rotation={[z * 0.05, 0, -x * 0.05]} castShadow>
            <boxGeometry args={[0.18, 7, 0.18]} />
            <meshStandardMaterial color="#5a4a3a" />
          </mesh>
        )),
      )}
      <mesh position={[0, 7.1, 0]} castShadow>
        <boxGeometry args={[2.8, 0.2, 2.8]} />
        <meshStandardMaterial color="#4a3a2a" />
      </mesh>
      <mesh position={[0, 8.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.2, 1.2, 4]} />
        <meshStandardMaterial color="#3a5a3a" />
      </mesh>
      <group position={[0, 7.6, 0]} rotation={[0, 2.4 + sweep, 0]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.3, 0.4, 12]} />
          <meshStandardMaterial color="#ddd" emissive="#ffffff" emissiveIntensity={2 * beam} />
        </mesh>
        {beam > 0 && (
          <mesh position={[0, -1.2, 9]} rotation={[-Math.PI / 2 + 0.13, 0, 0]}>
            <coneGeometry args={[3.2, 18, 20, 1, true]} />
            <meshBasicMaterial color="#fff6d8" transparent opacity={0.12 * beam} depthWrite={false} side={2} />
          </mesh>
        )}
        <spotLight position={[0, 0, 0.3]} angle={0.5} penumbra={0.5} intensity={200 * beam} distance={60} color="#fff6d8" />
      </group>
    </group>
  );
};

/* ---------------- birds ---------------- */
const Bird: React.FC<{ position: V3; rotation?: V3; flap: number; color?: string; belly?: string; s?: number; lying?: boolean }> = ({
  position,
  rotation = [0, 0, 0],
  flap,
  color = "#6a5a4a",
  belly = "#d8cdb8",
  s = 1,
  lying = false,
}) => (
  <group position={position} rotation={rotation} scale={s * 0.42}>
    <group rotation={lying ? [0, 0, Math.PI / 2 - 0.2] : [0, 0, 0]}>
      <mesh scale={[0.55, 0.5, 1.1]} castShadow>
        <sphereGeometry args={[0.5, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.12, 0.1]} scale={[0.45, 0.35, 0.8]}>
        <sphereGeometry args={[0.5, 12, 8]} />
        <meshStandardMaterial color={belly} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.22, 0.55]} castShadow>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.34, 8]} />
        <meshStandardMaterial color="#e8a020" />
      </mesh>
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0.28, 0.75]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.22, 0.08, 0.05]} rotation={[0, 0, sd * flap]}>
          <mesh position={[sd * 0.55, 0, 0]} castShadow>
            <boxGeometry args={[1.1, 0.04, 0.55]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.05, -0.62]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.35, 0.03, 0.45]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  </group>
);

const COLORS: [string, string][] = [
  ["#6a5a4a", "#d8cdb8"],
  ["#2a6ab8", "#e07a2a"],
  ["#e8e4da", "#f4f1ea"],
  ["#5a4a2a", "#c8a870"],
  ["#3a3a3a", "#8a8a8a"],
  ["#8a6a3a", "#e8d8b0"],
];

type Path = { from: V3; to: V3; t0: number; dur: number; fall: boolean; land: V3; c: number; s: number; circle?: boolean };

/** Birds that fly to a light, then either fall dazed to the ground or circle the light like moths. */
const Flock: React.FC<{ paths: Path[] }> = ({ paths }) => {
  const f = useCurrentFrame();
  return (
    <group>
      {paths.map((p, i) => {
        const [col, bel] = COLORS[p.c % COLORS.length];
        const t = (f - p.t0) / p.dur;
        if (t < 0) return null;
        if (t < 1) {
          const e = Easing.in(Easing.quad)(t);
          const pos: V3 = [lerp(p.from[0], p.to[0], e) + Math.sin(f / 5 + i) * 0.3, lerp(p.from[1], p.to[1], e) + Math.sin(f / 4 + i * 2) * 0.25, lerp(p.from[2], p.to[2], e)];
          const d = [p.to[0] - p.from[0], p.to[1] - p.from[1], p.to[2] - p.from[2]];
          const yaw = Math.atan2(d[0], d[2]);
          const pitch = -Math.atan2(d[1], Math.hypot(d[0], d[2])) * 0.6;
          return <Bird key={i} position={pos} rotation={[pitch, yaw, Math.sin(f / 6 + i) * 0.2]} flap={Math.sin(f * 0.9 + i) * 0.9} color={col} belly={bel} s={p.s} />;
        }
        const k = f - (p.t0 + p.dur);
        if (p.circle) {
          const a = k * 0.12 + i;
          const r = 0.9 + (i % 3) * 0.35;
          return <Bird key={i} position={[p.to[0] + Math.cos(a) * r, p.to[1] + Math.sin(k * 0.2 + i) * 0.3, p.to[2] + Math.sin(a) * r]} rotation={[0, -a, -0.5]} flap={Math.sin(f * 1.1 + i) * 0.9} color={col} belly={bel} s={p.s} />;
        }
        if (!p.fall) return null;
        const ft = Math.min(1, k / 14);
        const pos: V3 = [lerp(p.to[0], p.land[0], ft), lerp(p.to[1], p.land[1], Easing.in(Easing.quad)(ft)), lerp(p.to[2], p.land[2], ft)];
        const twitch = ft >= 1 && Math.sin(f / 7 + i * 3) > 0.85 ? Math.sin(f) * 0.6 : 0;
        return <Bird key={i} position={pos} rotation={[ft * 1.2, i * 1.3, ft * 0.5]} flap={ft < 1 ? Math.sin(f * 1.4 + i) * 1.1 : 0.15 + twitch} color={col} belly={bel} s={p.s} lying={ft >= 1} />;
      })}
    </group>
  );
};

const makePaths = (n: number, seed: number, light: V3, a: number, b: number, fallShare = 0.6, circleShare = 0.2): Path[] =>
  new Array(n).fill(0).map((_, i) => {
    const ang = rand(i, seed) * Math.PI * 1.2 - Math.PI * 1.1;
    const from: V3 = [light[0] + Math.cos(ang) * 40, light[1] + 14 + rand(i + 1, seed) * 10, light[2] + Math.sin(ang) * 40 - 10];
    const to: V3 = [light[0] + (rand(i + 2, seed) - 0.5) * 1.6, light[1] + (rand(i + 3, seed) - 0.5) * 1.2, light[2] + (rand(i + 4, seed) - 0.5) * 1.6];
    const r = rand(i + 5, seed);
    const land: V3 = [light[0] + (rand(i + 6, seed) - 0.5) * 6, 0.12, light[2] + (rand(i + 7, seed) - 0.3) * 6];
    return { from, to, t0: Math.round(a + (b - a) * (i / n)), dur: 26 + Math.round(rand(i + 8, seed) * 14), fall: r < fallShare, circle: r >= fallShare && r < fallShare + circleShare, land, c: i, s: 0.8 + rand(i + 9, seed) * 0.5 };
  });

/* ---------------- the village set ---------------- */
const LIGHTS: V3[] = [
  [-3, 0, 3],
  [3.5, 0, -1],
  [0, 0, -7],
];
const VILLAGER: BeanLook = { body: "#3a4a6a", legs: "#2a2a30", hat: "beanie", hatColor: "#7a2a2a", skin: "#c48a62" };
const GUARD: BeanLook = { body: "#7a6a3a", legs: "#5a4a2a", hat: "cap", hatColor: "#4a5a2a", skin: "#c48a62" };

const Village: React.FC<{ fog?: number; lights?: number; dawn?: boolean; tower?: number; spirits?: boolean }> = ({ fog = 1, lights = 1, dawn = false, tower = 0, spirits = false }) => {
  const f = useCurrentFrame();
  const bamboo = useMemo(
    () =>
      new Array(40)
        .fill(0)
        .map((_, i) => {
          const a = rand(i, 61) * Math.PI * 2;
          const r = 10 + rand(i + 1, 61) * 16;
          const x = Math.cos(a) * r;
          const z = Math.sin(a) * r - 4;
          return { x, z, y: jH(x, z) };
        })
        .filter((b) => b.z < -6 || (Math.abs(b.x) > 13 && b.z < 2))
        .slice(0, 16),
    [],
  );
  return (
    <>
      {dawn ? (
        <>
          <fog attach="fog" args={["#8a9ab0", 14, 160]} />
          <SkyDome top="#3a5a8a" horizon="#f0a878" />
          <ambientLight intensity={0.55} />
          <hemisphereLight args={["#ffd8b8", "#2a3a2a", 1.0]} />
          <directionalLight position={[-40, 18, -60]} color="#ffb070" intensity={1.8} castShadow />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#1a222e", 6 + (1 - fog) * 20, 70 + (1 - fog) * 80]} />
          <SkyDome top="#020306" horizon="#121a24" />
          <ambientLight intensity={0.3} />
          <hemisphereLight args={["#4a5a78", "#0a0e0a", 0.6]} />
        </>
      )}
      <Hills dawn={dawn} />
      {[[-8, 0, -2, 0.4], [7, 0, 5, -0.6], [-6, 0, -12, 0.2], [9, 0, -9, -0.3], [-11, 0, 7, 0.9]].map(([x, y, z, r], i) => (
        <Hut key={i} position={[x, y, z]} rotY={r} lit={lights} />
      ))}
      {bamboo.map((b, i) => (
        <Bamboo key={i} position={[b.x, b.y, b.z]} seed={i + 1} s={0.9 + rand(i, 3) * 0.4} />
      ))}
      {LIGHTS.map((l, i) => (
        <LampPost key={i} position={l} on={lights} />
      ))}
      {tower > 0 && <WatchTower position={[12, 0, -14]} beam={tower} />}
      {spirits &&
        [[-5, 4, -4], [4, 5, -9], [0, 6, 2]].map((q, i) => (
          <sprite key={i} position={[q[0] + Math.sin(f / 30 + i) * 1.5, q[1] + Math.sin(f / 20 + i) * 0.4, q[2]]} scale={[2.2, 4.2, 1]}>
            <spriteMaterial map={softTexture()} color="#cfe0ff" transparent opacity={0.34 + 0.14 * Math.sin(f / 11 + i)} depthWrite={false} />
          </sprite>
        ))}
      <Mist y={1.2} spread={26} opacity={0.32 * fog} color={dawn ? "#e8eef4" : "#8a9ab8"} count={18} />
      <Mist y={6} spread={40} opacity={0.22 * fog} color={dawn ? "#f4f4f4" : "#6a7a98"} count={10} />
    </>
  );
};

/* ---------------- scenes ---------------- */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fP = wordFrame(words, "panchhi");
  const fM = wordFrame(words, "maut");
  const paths = useMemo(() => [...makePaths(18, 3, [-3, 3.6, 3], -30, fM, 0.55, 0.3), { from: [6, 9, -10] as V3, to: [0.6, 1.6, 5.6] as V3, t0: fM - 26, dur: 26, fall: true, circle: false, land: [0.4, 0.12, 6.2] as V3, c: 1, s: 1.3 }], [fM]);
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  return (
    <Stage3D
      entryFlash={false}
      exposure={1.35}
      flashOp={flash(f, fM + 2, 6, 0.3)}
      overlay={<g>
        <Chip x={540} y={OY} at={fP} text="ASSAM KA EK GAON" until={fM - 2} bg="#111" />
        <Stamp x={540} y={OY} at={fM} text="MAUT KI TARAF?" size={78} />
      </g>}
    >
      <Village />
      <Flock paths={paths} />
      <CameraRig pos={lerp3([2.4, 1.4, 11], [1.6, 1.3, 9.2], t)} look={lerp3([-1.5, 3.2, 0], [-1, 2.4, 2], t)} fov={52} />
    </Stage3D>
  );
};

export const Place: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fJ = wordFrame(words, "jatinga");
  const fP = wordFrame(words, "pahaadiyon");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  return (
    <Stage3D
      exposure={1.4}
      overlay={<g>
        <NameTag x={540} y={OY} at={fJ} text="JATINGA" size={64} bg="#ffd84d" until={fP - 2} />
        <Chip x={540} y={OY} at={fP} text="DIMA HASAO, ASSAM" />
      </g>}
    >
      <Village fog={0.35} />
      <CameraRig pos={lerp3([30, 30, 44], [20, 20, 30], t)} look={[0, 2, -4]} fov={50} />
    </Stage3D>
  );
};

export const When: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fA = wordFrame(words, "august");
  const fC = wordFrame(words, "chaand");
  const fK = wordFrame(words, "kohre");
  const fog = prog(f, fK - 10, fK + 30);
  const t = prog(f, 0, dur);
  return (
    <Stage3D
      exposure={1.35}
      overlay={<g>
        <Chip x={540} y={OY} at={fA} text="AUGUST - OCTOBER" bg="#7a1010" until={fC - 2} />
        <Chip x={540} y={OY} at={fC} text="BINA CHAAND" bg="#111" until={fK - 2} />
        <Chip x={540} y={OY} at={fK} text="GHANA KOHRA" bg="#1a2a3a" />
      </g>}
    >
      <Village fog={0.6 + fog * 0.6} />
      <CameraRig pos={lerp3([0, 2, 14], [0, 2.4, 12], t)} look={lerp3([0, 8, -20], [0, 12, -30], t)} fov={52} />
    </Stage3D>
  );
};

export const Birds: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fJ = wordFrame(words, "jhund");
  const fG = wordFrame(words, "gir");
  const paths = useMemo(() => [...makePaths(26, 7, [-3, 3.6, 3], fJ - 30, fG - 10, 0.75, 0.2), ...makePaths(14, 11, [3.5, 3.6, -1], fJ - 10, fG, 0.7, 0.2)], [fJ, fG]);
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  return (
    <Stage3D
      exposure={1.35}
      flashOp={flash(f, fG, 6, 0.3)}
      overlay={<g>
        <Stamp x={540} y={OY} at={fJ} text="JHUND KE JHUND" size={74} until={fG - 2} />
        <Stamp x={540} y={OY} at={fG} text="DHAPP!" size={110} />
      </g>}
    >
      <Village />
      <Flock paths={paths} />
      <CameraRig pos={lerp3([7, 2.4, 12], [5, 1.8, 10], t)} look={lerp3([-1, 4.5, 0], [-1, 1.5, 2], t)} fov={52} />
    </Stage3D>
  );
};

export const Spirits: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fA = wordFrame(words, "aatmaon");
  const t = prog(f, 0, dur);
  return (
    <Stage3D
      exposure={1.35}
      overlay={<g>
        <Chip x={540} y={OY} at={4} text="KEHTE HAIN..." bg="#4a1a6a" until={fA - 2} />
        <Stamp x={540} y={OY} at={fA} text="BURI AATMAYEIN?" size={70} color="#b05aff" />
      </g>}
    >
      <Village spirits />
      {[[-2.6, 0, 7.6, 0.4], [-0.6, 0, 4.2, -0.1], [2.6, 0, 7.4, -0.5]].map(([x, y, z, r], i) => (
        <Bean key={i} position={[x, y, z]} rotY={Math.PI + r} scale={1.05} pose={i === 1 ? BP.lantern : BP.shock} look={{ ...VILLAGER, body: ["#3a4a6a", "#6a3a2a", "#2a5a4a"][i], held: i === 1 ? "lantern" : "none", eyes: "wide" }} blink={(f + i * 9) % 80 < 4} />
      ))}
      <CameraRig pos={lerp3([0.4, 1.3, 13.5], [0.2, 1.2, 12.6], t)} look={[0, 4.2, -2]} fov={52} />
    </Stage3D>
  );
};

export const Question: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fM = wordFrame(words, "marne");
  const t = prog(f, 0, dur);
  return (
    <Stage3D exposure={1.4} overlay={<Stamp x={540} y={OY} at={fM} text="KHUD MARNE?" size={84} />}>
      <Village />
      <Bird position={[-2.6, 0.14, 4.2]} rotation={[0, 0.8, 0]} flap={0.15 + (Math.sin(f / 5) > 0.8 ? 0.6 : 0)} color="#2a6ab8" belly="#e07a2a" s={1.4} lying />
      <Bird position={[-1.6, 0.12, 5.0]} rotation={[0, -0.6, 0]} flap={0.1} color="#6a5a4a" belly="#d8cdb8" s={1.1} lying />
      <CameraRig pos={lerp3([-1.0, 0.8, 7.4], [-1.4, 0.6, 6.4], t)} look={[-2.4, 0.3, 4.4]} fov={46} />
    </Stage3D>
  );
};

/** Wind streak particles. */
const Wind: React.FC<{ strength?: number }> = ({ strength = 1 }) => {
  const f = useCurrentFrame();
  return (
    <group>
      {new Array(80).fill(0).map((_, i) => {
        const ph = ((f * 0.025 * (0.7 + rand(i, 2) * 0.6) + rand(i + 1, 2)) % 1 + 1) % 1;
        return (
          <sprite key={i} position={[-18 + ph * 36, 1 + rand(i + 2, 2) * 10, -10 + rand(i + 3, 2) * 20]} scale={[2.6, 0.07, 1]}>
            <spriteMaterial map={softTexture()} color="#cfe0ff" transparent opacity={0.55 * strength * Math.sin(ph * Math.PI)} depthWrite={false} />
          </sprite>
        );
      })}
    </group>
  );
};

export const Science: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fN = wordFrame(words, "nahi");
  const fH = wordFrame(words, "hawa");
  const t = prog(f, 0, dur);
  const tumble = new Array(9).fill(0).map((_, i) => ({ x: -6 + i * 1.5 + Math.sin(f / 9 + i) * 1.4 + (f - fH) * 0.05 * (f > fH ? 1 : 0), y: 5 + Math.sin(f / 7 + i * 2) * 1.2 + (i % 3) }));
  return (
    <Stage3D
      exposure={1.35}
      overlay={<g>
        <Stamp x={540} y={OY} at={fN} text="NAHI!" size={110} color="#2ecc71" until={fH - 2} />
        <Chip x={540} y={OY} at={fH} text="KOHRA + TEZ HAWA" bg="#1a3a5a" />
      </g>}
    >
      <Village fog={1.3} />
      <Wind strength={prog(f, fH - 10, fH + 10) + 0.2} />
      {tumble.map((b, i) => (
        <Bird key={i} position={[b.x, b.y, -2 + (i % 3)]} rotation={[Math.sin(f / 5 + i) * 0.6, Math.PI / 2 + Math.sin(f / 8 + i) * 0.8, Math.sin(f / 4 + i) * 0.9]} flap={Math.sin(f * 1.2 + i) * 1.0} color={COLORS[i % 6][0]} belly={COLORS[i % 6][1]} s={1.1} />
      ))}
      <CameraRig pos={lerp3([0, 4, 14], [0, 4.5, 12], t)} look={[0, 5, -2]} fov={52} />
    </Stage3D>
  );
};

export const Light: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fR = wordFrame(words, "roshni");
  const fK = wordFrame(words, "kheench");
  const paths = useMemo(() => makePaths(16, 21, [3.5, 3.6, -1], -20, fK, 0, 1), [fK]);
  const t = prog(f, 0, dur);
  return (
    <Stage3D
      exposure={1.35}
      overlay={<g>
        <Chip x={540} y={OY} at={fR} text="ROSHNI KA JAAL" bg="#5a3a0a" until={fK - 2} />
        <Stamp x={540} y={OY} at={fK} text="KHEENCH LETI HAI" size={70} color="#ffd84d" />
      </g>}
    >
      <Village />
      <Flock paths={paths} />
      <CameraRig pos={lerp3([6.5, 3.2, 5.5], [5.6, 3.6, 3.8], t)} look={[3.5, 3.8, -1]} fov={50} />
    </Stage3D>
  );
};

export const Young: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fC = wordFrame(words, "chhote");
  const t = prog(f, 0, dur);
  return (
    <Stage3D exposure={1.45} overlay={<Chip x={540} y={OY} at={fC} text="CHHOTE, STHANIYA PANCHHI" bg="#1b5e20" />}>
      <Village />
      <mesh position={[-1.4, 1.2, 6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 4, 6]} />
        <meshStandardMaterial color="#6a8a30" />
      </mesh>
      {[[-1.95, 0, "#2a6ab8", "#e07a2a"], [-1.4, 1, "#e8e4da", "#f4f1ea"], [-0.85, 2, "#8a6a3a", "#e8d8b0"]].map(([x, i, c, b]) => (
        <group key={i as number} position={[x as number, 1.42, 6]}>
          <Bird position={[0, 0, 0]} rotation={[0, 0.4 + Math.sin(f / 20 + (i as number)) * 0.3, 0]} flap={Math.sin(f / 9 + (i as number)) > 0.9 ? 0.8 : 0.1} color={c as string} belly={b as string} s={1.05} />
        </group>
      ))}
      <CameraRig pos={lerp3([-1.3, 1.75, 10.4], [-1.4, 1.65, 9.6], t)} look={[-1.4, 1.5, 6]} fov={46} />
    </Stage3D>
  );
};

export const Today: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fB = wordFrame(words, "baans");
  const fV = wordFrame(words, "van");
  const now = f >= fV - 4;
  const t = prog(f, 0, dur);
  const release = prog(f, fV + 20, fV + 50);
  return (
    <Stage3D
      exposure={1.35}
      tint={now ? undefined : "#7a4a1a"}
      tintOp={now ? 0 : 0.25}
      flashOp={flash(f, fV - 4, 6, 0.35)}
      overlay={<g>
        <Chip x={540} y={OY} at={fB - 4} text="PEHLE: BAANS KE DANDE" bg="#5a1a1a" until={fV - 6} />
        <Chip x={540} y={OY} at={fV} text="AAJ: VAN VIBHAAG KA PEHRA" bg="#1b5e20" />
      </g>}
    >
      <Village tower={now ? 1 : 0} />
      {!now ? (
        <>
          {[[-2, 0, 5, 0.2], [0.6, 0, 5.6, -0.2]].map(([x, y, z, r], i) => (
            <Bean key={i} position={[x, y, z]} rotY={Math.PI + r} scale={1.05} pose={{ ...BP.point, ra: [2.4 + Math.sin(f / 6 + i) * 0.4, -0.2] }} look={{ ...VILLAGER, held: "stick", body: i ? "#6a3a2a" : "#3a4a6a" }} />
          ))}
          <CameraRig pos={lerp3([5.2, 1.9, 10.2], [4.6, 1.9, 9.4], t)} look={[-1.2, 2.6, 4]} fov={52} />
        </>
      ) : (
        <>
          <Bean position={[0, 0, 6]} rotY={Math.PI - 0.3} scale={1.1} pose={BP.hold} look={GUARD} blink={f % 70 < 4} />
          <Bird position={[lerp(0.1, 3, release), lerp(1.55, 6, release), lerp(6.7, 0, release)]} rotation={[0, 2.6, 0]} flap={release > 0 ? Math.sin(f * 0.9) * 0.9 : 0.1} color="#2a6ab8" belly="#e07a2a" s={1.1} />
          <CameraRig pos={lerp3([-2.2, 1.8, 10.5], [-1.8, 2, 9.6], prog(f, fV, dur))} look={[0.5, 2.4, 4]} fov={52} />
        </>
      )}
    </Stage3D>
  );
};

export const Cta: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fB = wordFrame(words, "bhooton");
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const t = prog(f, 0, dur);
  const focus = prog(f, fAur - 2, fAur + 10);
  const fly = prog(f, 0, dur, Easing.inOut(Easing.quad));
  return (
    <Stage3D
      exposure={1.25}
      tint="#000000"
      tintOp={focus * 0.45}
      overlay={<g>
        {f < fCom - 2 && <VoteButtons y={OY} at={fB - 2} left="BHOOT" right="KUDRAT" />}
        {f < fIti && f >= fCom - 2 && <g opacity={1 - prog(f, fAur, fIti)}><CommentBubble x={540} y={600} at={fCom - 2} /></g>}
        <ChannelCard x={540} y={470} at={fIti - 4} clickAt={fSub + 4} />
      </g>}
    >
      <Village dawn fog={0.6} lights={0.4} />
      <Bird position={[lerp(-2, 8, fly), lerp(3, 14, fly), lerp(4, -30, fly)]} rotation={[-0.2, 2.9, 0]} flap={Math.sin(f * 0.8) * 0.9} color="#2a6ab8" belly="#e07a2a" s={1.4} />
      <CameraRig pos={lerp3([0, 2.2, 12], [0, 3, 13], t)} look={lerp3([0, 4, 0], [2, 9, -20], t)} fov={52} />
    </Stage3D>
  );
};

export const SCENES = { hook: Hook, place: Place, when: When, birds: Birds, spirits: Spirits, question: Question, science: Science, light: Light, young: Young, today: Today, cta: Cta };
