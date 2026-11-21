/* Six 3D worlds for the long-form "5 Bhootiya Jagah" episode. Each world takes WP and renders its set;
 * the camera is placed by ShotScene. Everything is frame-driven. */
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { famTexture } from "../../components/LongForm";
import { BP, Bean, BeanLook, BeanPose, walk } from "../../components/three/Bean";
import { DesertTerrain, Temple } from "../../components/three/Desert3D";
import { Candle } from "../../components/three/Mystery3D";
import { fbm, Mist, rand, SkyDome, softTexture, Stars } from "../../components/three/World";

export type V3 = [number, number, number];
export type WP = { f: number; t: number; dur: number; x: Record<string, unknown>; wf: (k: string, nth?: number) => number };

const sm = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const after = (p: WP, key: unknown, pad = 0) => typeof key === "string" && p.f >= p.wf(key) + pad;
const since = (p: WP, key: unknown) => (typeof key === "string" ? p.f - p.wf(key) : -9999);

export const EXPLORER: BeanLook = { body: "#5a4632", legs: "#3a3028", hat: "ranger", hatColor: "#6b5532", backpack: "#7a3a22", held: "lantern", skin: "#c98e6a" };

/* ---------------- shared bits ---------------- */
export const Moon: React.FC<{ position: V3; size?: number }> = ({ position, size = 30 }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[size * 0.18, 24, 16]} />
      <meshBasicMaterial color="#fff6dc" fog={false} />
    </mesh>
    <sprite scale={[size, size, 1]}>
      <spriteMaterial map={softTexture()} color="#cfdcff" transparent opacity={0.55} depthWrite={false} fog={false} />
    </sprite>
  </group>
);

export const NightLights: React.FC<{ moon: V3; strength?: number }> = ({ moon, strength = 1 }) => (
  <>
    <ambientLight intensity={0.38 * strength} />
    <hemisphereLight args={["#6a7cc0", "#16141a", 0.85 * strength]} />
    <directionalLight
      position={[moon[0] * 0.3, Math.max(30, moon[1] * 0.6), moon[2] * 0.3]}
      color="#a8bcff"
      intensity={1.1 * strength}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-50}
      shadow-camera-right={50}
      shadow-camera-top={50}
      shadow-camera-bottom={-50}
      shadow-camera-far={300}
    />
  </>
);

export const DayLights: React.FC<{ warm?: boolean; sun?: V3 }> = ({ warm = true, sun = [-60, 70, 40] }) => (
  <>
    <ambientLight intensity={0.55} />
    <hemisphereLight args={[warm ? "#ffe2b8" : "#cfe2ff", "#7a6040", 1.2]} />
    <directionalLight
      position={sun}
      color={warm ? "#ffd9a0" : "#fff2dc"}
      intensity={2.8}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-60}
      shadow-camera-right={60}
      shadow-camera-top={60}
      shadow-camera-bottom={-60}
      shadow-camera-far={300}
    />
  </>
);

/** Translucent drifting spirit. */
export const Wisp: React.FC<{ position: V3; seed?: number; s?: number; op?: number }> = ({ position, seed = 0, s = 1, op = 1 }) => {
  const f = useCurrentFrame();
  const o = (0.18 + 0.14 * Math.sin(f / 13 + seed * 2)) * op;
  return (
    <group position={[position[0] + Math.sin(f / 40 + seed) * 0.8, position[1] + Math.sin(f / 23 + seed) * 0.2, position[2]]}>
      <sprite scale={[1.4 * s, 3.4 * s, 1]}>
        <spriteMaterial map={softTexture()} color="#dfe8ff" transparent opacity={o} depthWrite={false} />
      </sprite>
      <sprite position={[0, 1.2 * s, 0]} scale={[1.0 * s, 1.0 * s, 1]}>
        <spriteMaterial map={softTexture()} color="#ffffff" transparent opacity={o * 1.2} depthWrite={false} />
      </sprite>
    </group>
  );
};

export const Fire: React.FC<{ position: V3; s?: number; light?: number }> = ({ position, s = 1, light = 1 }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  return (
    <group position={position} scale={s}>
      {new Array(9).fill(0).map((_, i) => {
        const ph = ((f * 0.04 + i * 0.37) % 1 + 1) % 1;
        return (
          <sprite key={i} position={[Math.sin(i * 2.1 + f / 9) * 0.35 * (1 - ph), 0.3 + ph * 2.2, Math.cos(i * 1.7) * 0.3 * (1 - ph)]} scale={[1.4 * (1 - ph * 0.6), 1.8 * (1 - ph * 0.5), 1]}>
            <spriteMaterial map={tex} color={ph < 0.4 ? "#ffd27a" : "#ff6a1a"} transparent opacity={0.9 * (1 - ph)} depthWrite={false} toneMapped={false} />
          </sprite>
        );
      })}
      <pointLight position={[0, 1.2, 0]} color="#ff9a3a" intensity={30 * light * (0.85 + 0.15 * Math.sin(f / 2.3))} distance={14 * s} decay={1.5} />
    </group>
  );
};

/* ---------------- 1. CROSSROADS ---------------- */
const SIGNS = [
  { n: "DUMAS BEACH", r: 0.6, y: 3.6 },
  { n: "DOW HILL", r: -0.55, y: 3.15 },
  { n: "SHANIWAR WADA", r: 1.25, y: 2.7 },
  { n: "KULDHARA", r: -1.15, y: 2.25 },
  { n: "BHANGARH", r: 0.1, y: 1.8 },
];
const DeadTree: React.FC<{ position: V3; s?: number; seed?: number }> = ({ position, s = 1, seed = 1 }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 2, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.28, 4, 6]} />
      <meshStandardMaterial color="#1e1814" roughness={1} />
    </mesh>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[Math.cos(i * 1.7 + seed) * 0.5, 2.6 + i * 0.45, Math.sin(i * 1.7 + seed) * 0.5]} rotation={[Math.sin(i + seed) * 0.8, i * 1.7 + seed, 0.9 * (i % 2 ? 1 : -1)]} castShadow>
        <cylinderGeometry args={[0.03, 0.08, 1.8 - i * 0.2, 5]} />
        <meshStandardMaterial color="#1e1814" roughness={1} />
      </mesh>
    ))}
  </group>
);

export const Crossroads: React.FC<WP> = (p) => {
  const { f, x } = p;
  const texs = useMemo(() => SIGNS.map((s) => famTexture([{ text: s.n, size: 104, color: "#f4ead2", weight: "900" }], 1024, 180, "#5a3a22")), []);
  const litMap = (x.lit as [number, string][] | undefined) ?? [];
  const allLit = x.allLit === true;
  const lanternOn = x.lanternAt ? after(p, x.lanternAt) : x.lantern !== false;
  const walking = x.walkAway === true;
  const ex: V3 = walking ? [1.6 - p.t * 2, 0, 1.4 - p.t * 14] : [1.7, 0, 1.6];
  return (
    <>
      <fog attach="fog" args={["#141a2e", 12, 110]} />
      <SkyDome top="#04050f" horizon="#262a48" />
      <Stars />
      <Moon position={[-60, 48, -150]} size={40} />
      <NightLights moon={[-60, 48, -150]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#26221e" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[4, 300]} />
        <meshStandardMaterial color="#4a4036" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[4, 300]} />
        <meshStandardMaterial color="#4a4036" roughness={1} />
      </mesh>
      {[[-8, 0, -6, 1.1, 1], [9, 0, -11, 1.3, 2], [-14, 0, 5, 0.9, 3], [12, 0, 7, 1.0, 4], [-20, 0, -22, 1.4, 5], [22, 0, -26, 1.6, 6]].map(([a, b, c, s, k]) => (
        <DeadTree key={k} position={[a, b, c]} s={s} seed={k} />
      ))}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 4.4, 8]} />
          <meshStandardMaterial color="#4a3020" roughness={0.9} />
        </mesh>
        {SIGNS.map((s, i) => {
          const lit = allLit || litMap.some(([j, k]) => j === i && after(p, k));
          return (
            <group key={s.n} position={[0, s.y, 0]} rotation={[0, s.r, 0]}>
              <mesh position={[1.25, 0, 0.1]} castShadow>
                <boxGeometry args={[2.4, 0.42, 0.08]} />
                <meshStandardMaterial color="#5a3a22" />
              </mesh>
              <mesh position={[1.25, 0, 0.145]}>
                <planeGeometry args={[2.36, 0.4]} />
                <meshStandardMaterial map={texs[i]} emissive="#ffb347" emissiveMap={texs[i]} emissiveIntensity={lit ? 0.9 : 0.05} />
              </mesh>
              <mesh position={[2.6, 0, 0.1]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.25, 0.4, 3]} />
                <meshStandardMaterial color="#5a3a22" />
              </mesh>
            </group>
          );
        })}
      </group>
      {x.hideExplorer !== true && <Bean
        position={ex}
        rotY={walking ? Math.PI : -0.5}
        scale={1.05}
        pose={walking ? walk(f * 0.22, 0.6) : BP.lantern}
        look={{ ...EXPLORER, held: lanternOn ? "lantern" : "none" }}
        blink={f % 83 < 4}
      />}
      <Mist y={0.6} spread={18} opacity={0.3} color="#8fa0c8" />
    </>
  );
};

/* ---------------- 2. DUMAS ---------------- */
export const Sea: React.FC<{ color: string }> = ({ color }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(700, 300, 120, 50);
    g.rotateX(-Math.PI / 2);
    g.translate(0, -0.2, -150);
    return g;
  }, []);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const X = pos.getX(i);
    const Z = pos.getZ(i);
    pos.setY(i, -0.2 + 0.22 * Math.sin(X * 0.12 + f * 0.05) + 0.16 * Math.sin(Z * 0.21 + f * 0.07) + 0.08 * Math.sin((X + Z) * 0.4 + f * 0.11));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.22} metalness={0.35} flatShading />
    </mesh>
  );
};

export const Casuarina: React.FC<{ position: V3; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 2.5, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.18, 5, 6]} />
      <meshStandardMaterial color="#3a2a1e" />
    </mesh>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0, 3.6 + i * 1.3, 0]} castShadow>
        <coneGeometry args={[1.3 - i * 0.3, 2.2, 7]} />
        <meshStandardMaterial color={i % 2 ? "#1f3326" : "#243a2a"} flatShading />
      </mesh>
    ))}
  </group>
);

export const Dog: React.FC<{ position: V3; rotY?: number; bark?: boolean; color?: string }> = ({ position, rotY = 0, bark = false, color = "#8a6a44" }) => {
  const f = useCurrentFrame();
  const hb = bark ? Math.max(0, Math.sin(f / 3)) * 0.12 : 0;
  const L = (x: number, z: number, i: number) => (
    <mesh key={i} position={[x, 0.22, z]} castShadow>
      <boxGeometry args={[0.1, 0.44, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.34, 0.3, 0.85]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <group position={[0, 0.72 + hb, 0.45]} rotation={[-hb * 2, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.26, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.05, 0.2]}>
          <boxGeometry args={[0.16, 0.14, 0.18]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {[-0.09, 0.09].map((x) => (
          <mesh key={x} position={[x, 0.17, -0.04]} rotation={[0.2, 0, 0]}>
            <coneGeometry args={[0.05, 0.14, 4]} />
            <meshStandardMaterial color="#3a2a1a" />
          </mesh>
        ))}
        {[-0.07, 0.07].map((x) => (
          <mesh key={`e${x}`} position={[x, 0.04, 0.155]}>
            <sphereGeometry args={[0.025, 8, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
      </group>
      {L(-0.12, 0.3, 1)}
      {L(0.12, 0.3, 2)}
      {L(-0.12, -0.3, 3)}
      {L(0.12, -0.3, 4)}
      <mesh position={[0, 0.7, -0.5]} rotation={[0.8 + Math.sin(f / 4) * 0.2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.4, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

const CROWD = ["#c0392b", "#2b6fe6", "#e8b23a", "#3a8a5a", "#8a3a8a", "#e07a1a", "#2a2a30", "#f2efe6", "#5a7ab8", "#b05a3a"];

export const Dumas: React.FC<WP> = (p) => {
  const { f, x, t } = p;
  const sunset = x.sunset === true;
  const tex = softTexture();
  const moon: V3 = [40, 42, -220];
  const prints = useMemo(() => new Array(16).fill(0).map((_, i) => ({ x: (i % 2 ? 0.25 : -0.25) + Math.sin(i * 0.5) * 0.4, z: 16 - i * 0.9 })), []);
  return (
    <>
      {sunset ? (
        <>
          <fog attach="fog" args={["#e8a070", 60, 420]} />
          <SkyDome top="#3a3a7a" horizon="#ff9a50" bottom="#5a3a40" />
          <sprite position={[0, 9, -260]} scale={[70, 70, 1]}>
            <spriteMaterial map={tex} color="#ffcf7a" transparent opacity={0.95} depthWrite={false} fog={false} />
          </sprite>
          <DayLights warm sun={[0, 12, -100]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#0e1424", 20, 230]} />
          <SkyDome top="#03050f" horizon="#1c2440" />
          <Stars />
          <Moon position={moon} size={46} />
          <NightLights moon={moon} />
        </>
      )}
      <Sea color={sunset ? "#2a3a5a" : "#0c1828"} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 100]} receiveShadow>
        <planeGeometry args={[700, 200]} />
        <meshStandardMaterial color={sunset ? "#3a3532" : "#2a2828"} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.5]} receiveShadow>
        <planeGeometry args={[700, 3]} />
        <meshStandardMaterial color="#17171b" roughness={0.25} metalness={0.25} />
      </mesh>
      {[0, 1].map((k) => (
        <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -0.4 - k * 1.6 - 1.2 * (0.5 + 0.5 * Math.sin(f / 30 + k * 2))]}>
          <planeGeometry args={[700, 0.5]} />
          <meshBasicMaterial color="#dfe8ee" transparent opacity={0.35 + 0.15 * Math.sin(f / 30 + k)} depthWrite={false} />
        </mesh>
      ))}
      {new Array(18).fill(0).map((_, i) => (
        <Casuarina key={i} position={[-80 + i * 9.5 + rand(i, 4) * 4, 0, 34 + rand(i + 3, 4) * 14]} s={1.4 + rand(i + 1, 4) * 0.8} />
      ))}
      {sunset &&
        CROWD.map((c, i) => (
          <Bean
            key={i}
            position={[-9 + i * 2 + rand(i, 9) * 1.2, 0, 4 + rand(i + 2, 9) * 9]}
            rotY={Math.PI + (rand(i + 5, 9) - 0.5) * 1.2}
            scale={0.95 + rand(i + 7, 9) * 0.2}
            pose={i % 3 === 0 ? walk(f * 0.2 + i, 0.5) : BP.idle}
            look={{ body: c, legs: i % 2 ? "#2f3440" : "#e8dcc0", skin: i % 2 ? "#c98e6a" : "#d9a57e", hat: i % 4 === 1 ? "cap" : "none" }}
          />
        ))}
      {x.pyre === true && (
        <group position={[3, 0, 8]}>
          {[0, 1, 2, 3].map((k) => (
            <group key={k} position={[0, 0.15 + k * 0.22, 0]} rotation={[0, (k % 2) * Math.PI / 2, 0]}>
              {[-0.5, 0, 0.5].map((z) => (
                <mesh key={z} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.1, 0.1, 2.2, 6]} />
                  <meshStandardMaterial color="#4a3020" />
                </mesh>
              ))}
            </group>
          ))}
          <Fire position={[0, 0.8, 0]} s={1.3} />
          {new Array(14).fill(0).map((_, i) => {
            const ph = ((f * 0.012 + i * 0.13) % 1 + 1) % 1;
            return (
              <sprite key={i} position={[Math.sin(i * 1.9) * 0.6 + ph * 0.8, 1.5 + ph * 6, Math.cos(i * 2.3) * 0.6]} scale={[0.08, 0.08, 1]}>
                <spriteMaterial map={tex} color="#ffb347" transparent opacity={1 - ph} depthWrite={false} toneMapped={false} />
              </sprite>
            );
          })}
        </group>
      )}
      {x.ghosts === true && (
        <>
          <Wisp position={[-4, 1.6, 3]} seed={1} s={1.2} />
          <Wisp position={[5, 1.5, 1]} seed={2} s={1.1} />
          <Wisp position={[1, 1.8, -2]} seed={3} s={1.3} />
        </>
      )}
      {x.explorer === true && <Bean position={[-6 + t * 10, 0, 6]} rotY={Math.PI / 2} scale={1.05} pose={walk(f * 0.2, 0.55)} look={EXPLORER} />}
      {x.dogs === true && (
        <>
          <Dog position={[1.1, 0, 9]} rotY={Math.PI} bark />
          <Dog position={[-1.3, 0, 9.8]} rotY={Math.PI + 0.25} bark color="#2a2622" />
        </>
      )}
      {x.prints === true &&
        prints.map((q, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[q.x, 0.02, q.z]} scale={[0.6, 1, 1]}>
            <circleGeometry args={[0.22, 10]} />
            <meshStandardMaterial color="#8a847a" roughness={1} emissive="#3a3630" emissiveIntensity={0.6} />
          </mesh>
        ))}
      {x.sparkle === true &&
        new Array(70).fill(0).map((_, i) => {
          const tw = Math.max(0, Math.sin(f / 4 + i * 1.7));
          return (
            <mesh key={i} position={[(rand(i, 12) - 0.5) * 2.4, 0.02, 8 + (rand(i + 1, 12) - 0.5) * 2]}>
              <icosahedronGeometry args={[0.025 + rand(i + 2, 12) * 0.03, 0]} />
              <meshStandardMaterial color="#9aa0aa" metalness={0.95} roughness={0.2} emissive="#cfd8ff" emissiveIntensity={tw * 1.2} />
            </mesh>
          );
        })}
      {x.wind === true &&
        new Array(90).fill(0).map((_, i) => {
          const ph = ((f * 0.02 + rand(i, 13)) % 1 + 1) % 1;
          return (
            <sprite key={i} position={[-14 + ph * 28, 0.2 + rand(i + 1, 13) * 1.6, 2 + rand(i + 2, 13) * 12]} scale={[0.9, 0.05, 1]}>
              <spriteMaterial map={tex} color="#b8b0a4" transparent opacity={0.5 * Math.sin(ph * Math.PI)} depthWrite={false} />
            </sprite>
          );
        })}
      {!sunset && <Mist y={0.5} spread={22} opacity={0.22} color="#8fa0c8" />}
    </>
  );
};

/* ---------------- 3. DOW HILL ---------------- */
export const Deodar: React.FC<{ position: V3; s?: number; c?: string }> = ({ position, s = 1, c = "#1f3a2c" }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 1.2, 0]} castShadow>
      <cylinderGeometry args={[0.16, 0.26, 2.4, 6]} />
      <meshStandardMaterial color="#3a2a1e" />
    </mesh>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[0, 2.4 + i * 1.15, 0]} castShadow>
        <coneGeometry args={[1.7 - i * 0.36, 2.0, 7]} />
        <meshStandardMaterial color={c} flatShading roughness={0.9} />
      </mesh>
    ))}
  </group>
);

export const ColonialSchool: React.FC<{ position: V3; rotY?: number; roof?: string; lit?: number; name: string; w?: number }> = ({ position, rotY = 0, roof = "#7a2e22", lit = 0.3, name, w = 18 }) => {
  const sign = useMemo(() => famTexture([{ text: name, size: 70, color: "#f4ead2", weight: "900" }], 1024, 150, "#2a3a2a"), [name]);
  const r = 6;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 7, 8]} />
        <meshStandardMaterial color="#77716a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 7 + 1.5, 0]} rotation={[0, Math.PI / 4, 0]} scale={[(w + 1) / (r * Math.SQRT2), 1, 9 / (r * Math.SQRT2)]} castShadow>
        <coneGeometry args={[r, 3, 4]} />
        <meshStandardMaterial color={roof} roughness={0.8} />
      </mesh>
      {[0, 1].map((row) =>
        new Array(Math.floor(w / 3)).fill(0).map((_, i) => (
          <group key={`${row}-${i}`} position={[-w / 2 + 1.8 + i * 3, 2 + row * 3, 4.01]}>
            <mesh>
              <planeGeometry args={[1.2, 1.8]} />
              <meshStandardMaterial color="#2a2a30" emissive="#ffd38a" emissiveIntensity={lit * (rand(i + row * 9, 3) > 0.5 ? 1 : 0.15)} />
            </mesh>
            <mesh position={[0, 0.9, 0.01]}>
              <circleGeometry args={[0.6, 12, 0, Math.PI]} />
              <meshStandardMaterial color="#2a2a30" emissive="#ffd38a" emissiveIntensity={lit * 0.4} />
            </mesh>
          </group>
        )),
      )}
      <group position={[w / 2 + 1.6, 0, 0]}>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[3, 10, 3]} />
          <meshStandardMaterial color="#6f6962" />
        </mesh>
        <mesh position={[0, 11, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2.4, 2.4, 4]} />
          <meshStandardMaterial color={roof} />
        </mesh>
        <mesh position={[0, 8.6, 1.51]}>
          <circleGeometry args={[0.7, 18]} />
          <meshStandardMaterial color="#e8e4d8" />
        </mesh>
      </group>
      {[-w / 3, w / 4].map((cx) => (
        <mesh key={cx} position={[cx, 9.6, -1.5]} castShadow>
          <boxGeometry args={[0.9, 2.4, 0.9]} />
          <meshStandardMaterial color="#5a504a" />
        </mesh>
      ))}
      <group position={[w / 2 - 2, 0, 7.5]}>
        {[-1.3, 1.3].map((px) => (
          <mesh key={px} position={[px, 1.1, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 2.2, 6]} />
            <meshStandardMaterial color="#3a2a1e" />
          </mesh>
        ))}
        <mesh position={[0, 1.9, 0.02]}>
          <planeGeometry args={[3.2, 0.5]} />
          <meshStandardMaterial map={sign} />
        </mesh>
      </group>
    </group>
  );
};

const Orchid: React.FC<{ position: V3; s?: number }> = ({ position, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <group position={position} scale={s} rotation={[0, 0, Math.sin(f / 30 + position[0]) * 0.05]}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.015, 0.8, 5]} />
        <meshStandardMaterial color="#3a6a2a" />
      </mesh>
      <group position={[0, 0.82, 0]} rotation={[0.5, 0, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]} position={[Math.sin((i / 5) * Math.PI * 2) * -0.07, Math.cos((i / 5) * Math.PI * 2) * 0.07, 0]}>
            <circleGeometry args={[0.07, 10]} />
            <meshStandardMaterial color="#f8f6f2" side={2} emissive="#ffffff" emissiveIntensity={0.15} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshStandardMaterial color="#f0c040" />
        </mesh>
      </group>
    </group>
  );
};

export const DowHill: React.FC<WP> = (p) => {
  const { f, x, t } = p;
  const day = x.day === true;
  const trees = useMemo(() => {
    const out: { x: number; z: number; s: number; c: string }[] = [];
    for (let i = 0; i < 110; i++) {
      const side = i % 2 ? 1 : -1;
      const xx = side * (4.5 + rand(i, 21) * 40);
      const zz = -110 + rand(i + 1, 21) * 150;
      if (xx < -6 && xx > -32 && zz > -34 && zz < -14) continue; // boys' school
      if (xx > 10 && xx < 36 && zz > -72 && zz < -50) continue; // girls' school
      out.push({ x: xx, z: zz, s: 1.6 + rand(i + 2, 21) * 1.4, c: rand(i + 3, 21) > 0.5 ? "#1f3a2c" : "#24402e" });
    }
    return out;
  }, []);
  const boyStart = -6;
  const vanish = x.vanishAt ? after(p, x.vanishAt) : false;
  const bx = boyStart + Math.min(1, t * 1.15) * 11;
  const eyes = x.eyes === true;
  return (
    <>
      {day ? (
        <>
          <fog attach="fog" args={["#b8c4cc", 20, 160]} />
          <SkyDome top="#7a98b8" horizon="#d8e0e6" />
          <DayLights warm={false} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#3a4654", 6, 85]} />
          <SkyDome top="#0a0e18" horizon="#3a4654" />
          <NightLights moon={[30, 50, -120]} strength={1.1} />
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#1c2216" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -35]} receiveShadow>
        <planeGeometry args={[4.2, 160]} />
        <meshStandardMaterial color="#3a3a3e" roughness={0.9} />
      </mesh>
      {[-1.9, 1.9].map((ex) => (
        <mesh key={ex} rotation={[-Math.PI / 2, 0, 0]} position={[ex, 0.03, -35]}>
          <planeGeometry args={[0.1, 160]} />
          <meshStandardMaterial color="#9a9a8a" />
        </mesh>
      ))}
      {[[-60, -220, 70], [10, -260, 95], [80, -230, 75], [-120, -260, 90]].map(([mx, mz, mh], i) => (
        <mesh key={i} position={[mx, mh / 2 - 2, mz]}>
          <coneGeometry args={[mh * 0.9, mh, 7]} />
          <meshStandardMaterial color="#1a2420" flatShading />
        </mesh>
      ))}
      {trees.map((q, i) => (
        <Deodar key={i} position={[q.x, 0, q.z]} s={q.s} c={q.c} />
      ))}
      <ColonialSchool position={[-19, 0, -24]} rotY={0.35} name="VICTORIA BOYS' SCHOOL" lit={day ? 0 : (x.schoolLit as number) ?? 0.25} />
      <ColonialSchool position={[23, 0, -61]} rotY={-0.4} roof="#2a4a5a" name="DOW HILL GIRLS' SCHOOL" w={15} lit={day ? 0 : (x.schoolLit as number) ?? 0.25} />
      {x.orchid === true &&
        new Array(9).fill(0).map((_, i) => <Orchid key={i} position={[2.6 + (rand(i, 31) - 0.5) * 1.4, 0, 4 + (rand(i + 1, 31) - 0.5) * 1.2]} s={0.9 + rand(i + 2, 31) * 0.5} />)}
      {x.boy === true && !vanish && (
        <Bean position={[bx, 0, -6]} rotY={Math.PI / 2} scale={1.0} pose={walk(f * 0.2, 0.55)} look={{ body: "#1e2a44", legs: "#5a5a62", skin: "#d9a57e", headless: true }} />
      )}
      {x.boy === true && vanish && since(p, x.vanishAt) < 12 && (
        <sprite position={[bx, 1.4, -6]} scale={[2.5, 3.5, 1]}>
          <spriteMaterial map={softTexture()} color="#dfe8ff" transparent opacity={0.6 * (1 - since(p, x.vanishAt) / 12)} depthWrite={false} />
        </sprite>
      )}
      {x.woodcutter === true && (
        <Bean position={[-3.6, 0, -1.5]} rotY={0.7} scale={1.05} pose={after(p, x.shockAt) ? BP.shock : BP.idle} look={{ body: "#6a4a2a", legs: "#3a3028", hat: "beanie", hatColor: "#8a2a1a", held: "stick", skin: "#b88462", eyes: after(p, x.shockAt) ? "wide" : "normal" }} />
      )}
      {x.walker === true && <Bean position={[0.6, 0, 4 - t * 8]} rotY={Math.PI} scale={1.05} pose={walk(f * 0.2, 0.55)} look={EXPLORER} />}
      {eyes &&
        [[8, 1.5, -8], [11, 1.2, -14], [6.5, 1.8, -18], [14, 1.4, -6], [9.5, 2.1, -24]].map(([ex, ey, ez], i) => {
          const open = Math.sin(f / 17 + i * 1.9) > -0.7 && f > 8 + i * 9;
          return (
            <group key={i} position={[ex, ey, ez]} visible={open} rotation={[0, -0.9, 0]}>
              {[-0.09, 0.09].map((d) => (
                <mesh key={d} position={[d, 0, 0]}>
                  <sphereGeometry args={[0.045, 8, 6]} />
                  <meshBasicMaterial color="#ff2020" toneMapped={false} />
                </mesh>
              ))}
            </group>
          );
        })}
      <Mist y={0.8} spread={30} opacity={day ? 0.2 : 0.38} color={day ? "#e8eef2" : "#8fa0b8"} />
    </>
  );
};

/* ---------------- 4. SHANIWAR WADA ---------------- */
const STONE = "#7a6a58";
const Bastion: React.FC<{ position: V3; r?: number; h?: number }> = ({ position, r = 4.2, h = 12 }) => (
  <group position={position}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[r, r * 1.08, h, 8]} />
      <meshStandardMaterial color={STONE} roughness={0.95} flatShading />
    </mesh>
    {new Array(8).fill(0).map((_, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      return (
        <mesh key={i} position={[Math.cos(a) * r * 0.9, h + 0.6, Math.sin(a) * r * 0.9]} castShadow>
          <boxGeometry args={[1.3, 1.2, 1.3]} />
          <meshStandardMaterial color={STONE} flatShading />
        </mesh>
      );
    })}
  </group>
);

const Palace: React.FC<{ lit?: number }> = ({ lit = 1 }) => (
  <group position={[0, 0, -32]}>
    {[0, 1, 2, 3].map((i) => {
      const w = 28 - i * 4;
      const d = 16 - i * 2;
      return (
        <group key={i} position={[0, 2 + i * 4, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, 4, d]} />
            <meshStandardMaterial color={i % 2 ? "#8a5a32" : "#9a6a3a"} roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.05, 0]}>
            <boxGeometry args={[w + 1.2, 0.3, d + 1.2]} />
            <meshStandardMaterial color="#5a3420" />
          </mesh>
          {new Array(Math.floor(w / 2.6)).fill(0).map((_, k) => (
            <mesh key={k} position={[-w / 2 + 1.5 + k * 2.6, -0.2, d / 2 + 0.01]}>
              <planeGeometry args={[1.0, 1.8]} />
              <meshStandardMaterial color="#2a1a10" emissive="#ffb347" emissiveIntensity={lit * (rand(k + i * 7, 5) > 0.4 ? 0.9 : 0.1)} />
            </mesh>
          ))}
        </group>
      );
    })}
    <mesh position={[0, 18.5, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 4, 6]} />
      <meshStandardMaterial color="#5a3a20" />
    </mesh>
    <mesh position={[0.9, 19.8, 0]}>
      <planeGeometry args={[1.8, 1.1]} />
      <meshStandardMaterial color="#ff7a1a" side={2} />
    </mesh>
  </group>
);

const Fountain: React.FC<{ water?: boolean }> = ({ water = false }) => {
  const f = useCurrentFrame();
  return (
    <group position={[0, 0, -16]}>
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[3.6, 3.8, 0.6, 16]} />
        <meshStandardMaterial color="#8a7a66" />
      </mesh>
      {new Array(16).fill(0).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.2, 0.75, Math.sin(a) * 2.2]} rotation={[0, -a, 0.5]} castShadow>
            <boxGeometry args={[1.4, 0.12, 0.7]} />
            <meshStandardMaterial color="#a8987e" />
          </mesh>
        );
      })}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 1.0, 10]} />
        <meshStandardMaterial color="#a8987e" />
      </mesh>
      {water &&
        new Array(10).fill(0).map((_, i) => {
          const ph = ((f * 0.05 + i * 0.1) % 1 + 1) % 1;
          return (
            <sprite key={i} position={[Math.cos(i) * ph * 1.2, 1.6 + Math.sin(ph * Math.PI) * 1.4, Math.sin(i) * ph * 1.2]} scale={[0.4, 0.4, 1]}>
              <spriteMaterial map={softTexture()} color="#dff2ff" transparent opacity={0.7} depthWrite={false} />
            </sprite>
          );
        })}
    </group>
  );
};

const NARAYAN: BeanLook = { body: "#f2e6c8", legs: "#f2e6c8", hat: "turban", hatColor: "#b0123a", skin: "#d9a57e" };
const GARDI: BeanLook = { body: "#3a2a1e", legs: "#2a2018", hat: "turban", hatColor: "#2a1a10", skin: "#b07d5a", held: "stick", beard: "#1a1410" };

export const Shaniwar: React.FC<WP> = (p) => {
  const { f, x, t } = p;
  const day = x.day === true;
  const palace = x.palace === true || x.fire === true;
  const fire = x.fire === true;
  const moon: V3 = [-30, 46, -170];
  const letterTex = useMemo(
    () =>
      [false, true].map((m) =>
        famTexture(
          [
            { text: "NARAYANRAO KO", size: 70, color: "#3a2410", weight: "900" },
            { text: m ? "MAARA" : "DHARA", size: 130, color: m ? "#b3121a" : "#3a2410", weight: "900" },
          ],
          768,
          560,
          "#e9d9b0",
        ),
      ),
    [],
  );
  const maara = after(p, x.maaraAt);
  const runPose = (ph: number, help: boolean): BeanPose => (help ? { ...walk(ph, 1, true), la: [2.6, 0.4], ra: [2.6, -0.4] } : walk(ph, 1, true));
  return (
    <>
      {day ? (
        <>
          <fog attach="fog" args={["#d8b890", 70, 400]} />
          <SkyDome top="#5a8fd0" horizon="#f3d9b0" />
          <DayLights warm sun={[60, 60, 40]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#141a2e", 30, 260]} />
          <SkyDome top="#03050d" horizon="#22284a" />
          <Stars />
          <Moon position={moon} size={60} />
          <NightLights moon={moon} />
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color={day ? "#8a7458" : "#4a4034"} roughness={1} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 25, 5, 0]} castShadow receiveShadow>
            <boxGeometry args={[42, 10, 3]} />
            <meshStandardMaterial color={STONE} roughness={0.95} />
          </mesh>
          {new Array(16).fill(0).map((_, i) => (
            <mesh key={i} position={[s * (5 + i * 2.6), 10.6, 0]} castShadow>
              <boxGeometry args={[1.3, 1.2, 3.2]} />
              <meshStandardMaterial color={STONE} />
            </mesh>
          ))}
          <mesh position={[s * 46, 5, -24]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[48, 10, 3]} />
            <meshStandardMaterial color={STONE} roughness={0.95} />
          </mesh>
        </group>
      ))}
      <Bastion position={[-6.5, 0, 0.5]} r={3.4} h={13} />
      <Bastion position={[6.5, 0, 0.5]} r={3.4} h={13} />
      <Bastion position={[-46, 0, 0]} />
      <Bastion position={[46, 0, 0]} />
      <mesh position={[0, 10.5, 0]} castShadow>
        <boxGeometry args={[9, 3, 3.4]} />
        <meshStandardMaterial color={STONE} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={`d${s}`} position={[s * 1.55, 4.5, 1.2]}>
          <mesh castShadow>
            <boxGeometry args={[3.1, 9, 0.5]} />
            <meshStandardMaterial color="#4a2a14" roughness={0.8} />
          </mesh>
          {new Array(5).fill(0).map((_, r) =>
            [-0.9, 0, 0.9].map((cx) => (
              <mesh key={`${r}${cx}`} position={[cx, -1.6 + r * 1.0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.13, 0.75, 8]} />
                <meshStandardMaterial color="#8a8a90" metalness={0.8} roughness={0.3} />
              </mesh>
            )),
          )}
        </group>
      ))}
      {!palace &&
        new Array(18).fill(0).map((_, i) => {
          const gx = (i % 6) - 2.5;
          const gz = Math.floor(i / 6);
          return (
            <mesh key={i} position={[gx * 7, 0.3 + rand(i, 8) * 0.3, -26 - gz * 7]} receiveShadow castShadow>
              <boxGeometry args={[6, 0.6 + rand(i, 8) * 0.6, 5.6]} />
              <meshStandardMaterial color="#8a7a66" roughness={1} />
            </mesh>
          );
        })}
      {!day &&
        [-4.4, 4.4].map((tx) => (
          <group key={tx} position={[tx, 0, 3.2]}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 3, 6]} />
              <meshStandardMaterial color="#3a2414" />
            </mesh>
            <Fire position={[0, 2.9, 0]} s={0.45} light={1.4} />
          </group>
        ))}
      <Fountain water={day} />
      {palace && <Palace lit={fire ? 0.2 : day ? 0.2 : 1} />}
      {fire && (
        <>
          {[[-10, 2, -26], [8, 4, -27], [0, 9, -30], [-6, 13, -31], [5, 15, -32], [12, 1, -36], [-12, 5, -38]].map((q, i) => (
            <Fire key={i} position={q as V3} s={2.6} light={i < 3 ? 1.5 : 0} />
          ))}
          {new Array(10).fill(0).map((_, i) => {
            const ph = ((f * 0.008 + i * 0.1) % 1 + 1) % 1;
            return (
              <sprite key={i} position={[Math.sin(i * 1.3) * 6, 18 + ph * 30, -32 + Math.cos(i) * 4]} scale={[8 + ph * 14, 8 + ph * 14, 1]}>
                <spriteMaterial map={softTexture()} color="#2a2224" transparent opacity={0.6 * (1 - ph)} depthWrite={false} />
              </sprite>
            );
          })}
        </>
      )}
      {x.bajirao === true && (
        <>
          <Bean position={[-1.4, 0, -10.5]} rotY={0.8} scale={1.15} pose={BP.idle} look={{ body: "#c8a060", legs: "#f2e6c8", hat: "turban", hatColor: "#e07a1a", beard: "#1a1410", skin: "#c98e6a" }} blink={f % 77 < 4} />
          <Bean position={[1.4, 0, -10.5]} rotY={-0.8} scale={1.08} pose={BP.idle} look={{ body: "#8a1f4a", legs: "#8a1f4a", hat: "hood", hatColor: "#a8305a", coat: true, skin: "#e2b48c" }} blink={f % 69 < 4} />
        </>
      )}
      {x.chase === true && (
        <>
          <Bean position={[-8 + t * 16, 0, -12]} rotY={Math.PI / 2} scale={1.05} pose={runPose(f * 0.38, x.help === true)} look={NARAYAN} />
          {[3, 4.6, 6.2].map((d, i) => (
            <Bean key={i} position={[-8 + t * 16 - d, 0, -12 + (i - 1) * 1.2]} rotY={Math.PI / 2} scale={1.1} pose={walk(f * 0.36 + i, 1, true)} look={GARDI} />
          ))}
        </>
      )}
      {x.help === true && x.chase !== true && (
        <Bean position={[0, 0, -15 + t * 7]} rotY={0} scale={1.1} pose={runPose(f * 0.4, true)} look={{ ...NARAYAN, eyes: "wide" }} />
      )}
      {x.letter === true && (
        <group position={[200, 0, 0]}>
          <pointLight position={[0.6, 2.2, 0.8]} color="#ffb060" intensity={14} distance={6} />
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 1.0, 1.4]} />
            <meshStandardMaterial color="#4a2a16" />
          </mesh>
          <mesh position={[-0.1, 1.01, 0.05]} rotation={[-Math.PI / 2, 0, 0.08]}>
            <planeGeometry args={[1.2, 0.88]} />
            <meshStandardMaterial map={letterTex[maara ? 1 : 0]} />
          </mesh>
          <Candle position={[0.95, 1.0, -0.3]} h={0.4} light={1.6} />
          <mesh position={[-0.9, 1.08, 0.3]}>
            <cylinderGeometry args={[0.1, 0.12, 0.16, 12]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[-0.85, 1.35, 0.32]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.012, 0.03, 0.6, 6]} />
            <meshStandardMaterial color="#f4f1ea" />
          </mesh>
        </group>
      )}
    </>
  );
};

/* ---------------- 5. KULDHARA ---------------- */
const SAND = "#c9a46a";
const RuinHouse: React.FC<{ position: V3; rotY?: number; h?: number; broken?: number; roof?: boolean }> = ({ position, rotY = 0, h = 2.6, broken = 0, roof = false }) => {
  const W = 4.6;
  const T = 0.32;
  const hb = h * (1 - broken * 0.55);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, hb / 2, -W / 2]} castShadow receiveShadow>
        <boxGeometry args={[W, hb, T]} />
        <meshStandardMaterial color={SAND} roughness={1} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2), h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[T, h, W]} />
          <meshStandardMaterial color={s > 0 ? "#bf9a62" : SAND} roughness={1} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`f${s}`} position={[s * 1.45, h / 2, W / 2]} castShadow receiveShadow>
          <boxGeometry args={[1.7, h, T]} />
          <meshStandardMaterial color={SAND} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, h - 0.25, W / 2]} castShadow>
        <boxGeometry args={[1.3, 0.5, T]} />
        <meshStandardMaterial color={SAND} roughness={1} />
      </mesh>
      {roof && (
        <mesh position={[0, h + 0.1, 0]} castShadow>
          <boxGeometry args={[W + 0.3, 0.2, W + 0.3]} />
          <meshStandardMaterial color="#a8865a" />
        </mesh>
      )}
    </group>
  );
};

const PALIWAL = ["#efe6d0", "#e8dcc0", "#f2efe6"];
const TURBANS = ["#e07a1a", "#c0392b", "#e8b23a", "#d4501a"];

export const Kuldhara: React.FC<WP> = (p) => {
  const { f, x, t } = p;
  const day = x.day === true;
  const moon: V3 = [50, 44, -160];
  const houses = useMemo(() => {
    const out: { x: number; z: number; r: number; h: number; b: number }[] = [];
    for (const gx of [-3, -2, -1, 1, 2, 3])
      for (const gz of [-2, -1, 0, 1, 2]) {
        const i = out.length;
        out.push({ x: gx * 6.4 + (rand(i, 7) - 0.5) * 0.6, z: gz * 7 - 2, r: gx < 0 ? Math.PI / 2 : -Math.PI / 2, h: 2.3 + rand(i + 1, 7) * 0.7, b: rand(i + 2, 7) > 0.6 ? rand(i + 3, 7) : 0 });
      }
    return out;
  }, []);
  const villagers = 14;
  return (
    <>
      {day ? (
        <>
          <fog attach="fog" args={["#f2dcb4", 80, 520]} />
          <SkyDome top="#3d7fd0" horizon="#f6dcae" />
          <DayLights warm />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#1a1830", 40, 300]} />
          <SkyDome top="#03040f" horizon="#2e2244" />
          <Stars />
          <Moon position={moon} size={50} />
          <NightLights moon={moon} />
        </>
      )}
      <DesertTerrain night={!day} />
      {houses.map((h, i) => (
        <RuinHouse key={i} position={[h.x, 0, h.z]} rotY={h.r} h={h.h} broken={day ? 0 : h.b} roof={day} />
      ))}
      <Temple position={[0, 0, -24]} scale={0.42} glow={day ? 0 : 0.25} />
      <group position={[8, 0, 15]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.4, 0.9, 16, 1, true]} />
          <meshStandardMaterial color={SAND} side={2} roughness={1} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.25, 16]} />
          <meshStandardMaterial color={x.dry === true ? "#6a5232" : "#0a0806"} />
        </mesh>
        {[-1.2, 1.2].map((s) => (
          <mesh key={s} position={[s, 1.4, 0]}>
            <boxGeometry args={[0.2, 2.0, 0.2]} />
            <meshStandardMaterial color="#6a4a2a" />
          </mesh>
        ))}
        <mesh position={[0, 2.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 2.6, 6]} />
          <meshStandardMaterial color="#6a4a2a" />
        </mesh>
        {x.dry === true &&
          new Array(8).fill(0).map((_, i) => (
            <mesh key={i} position={[(rand(i, 3) - 0.5) * 1.6, 0.31, (rand(i + 1, 3) - 0.5) * 1.6]} rotation={[-Math.PI / 2, 0, rand(i + 2, 3) * 3]}>
              <planeGeometry args={[0.9, 0.03]} />
              <meshBasicMaterial color="#3a2a18" />
            </mesh>
          ))}
      </group>
      {x.villagers === true &&
        new Array(8).fill(0).map((_, i) => (
          <Bean
            key={i}
            position={[(i % 2 ? 1.2 : -1.2) + Math.sin(i) * 0.3, 0, 10 - i * 3 - (i % 3 === 0 ? t * 3 : 0)]}
            rotY={i % 3 === 0 ? Math.PI : i % 2 ? -1.2 : 1.2}
            scale={1.0}
            pose={i % 3 === 0 ? walk(f * 0.2 + i, 0.5) : BP.idle}
            look={{ body: PALIWAL[i % 3], legs: "#efe6d0", hat: i % 4 === 3 ? "hood" : "turban", hatColor: i % 4 === 3 ? "#c0392b" : TURBANS[i % 4], skin: "#c98e6a" }}
            blink={(f + i * 11) % 90 < 4}
          />
        ))}
      {x.salim === true && (
        <>
          <Bean position={[0, 0, 5]} rotY={Math.PI} scale={1.2} pose={after(p, x.pointAt) ? BP.point : BP.idle} look={{ body: "#3a1a4a", legs: "#2a1438", hat: "turban", hatColor: "#e8b23a", beard: "#111", skin: "#c98e6a", coat: true }} />
          {[-1.6, 1.6].map((d) => (
            <Bean key={d} position={[d, 0, 6.2]} rotY={Math.PI} scale={1.05} pose={BP.idle} look={{ body: "#5a2a1a", legs: "#3a2010", hat: "turban", hatColor: "#3a1a10", held: "stick", skin: "#b07d5a" }} />
          ))}
          <Bean position={[0.8, 0, 0.6]} rotY={0} scale={1.05} pose={BP.cover} look={{ body: "#efe6d0", legs: "#efe6d0", hat: "turban", hatColor: "#e07a1a", beard: "#e8e8e8", skin: "#c98e6a" }} />
          <Bean position={[-0.8, 0, 0.2]} rotY={0.2} scale={0.95} pose={BP.shock} look={{ body: "#c0392b", legs: "#c0392b", hat: "hood", hatColor: "#e8b23a", coat: true, skin: "#d9a57e", eyes: "wide" }} />
        </>
      )}
      {x.exodus === true &&
        new Array(villagers).fill(0).map((_, i) => (
          <Bean
            key={i}
            position={[Math.sin(i * 0.9) * 1.2, 0, -8 - i * 2.4 - t * 14]}
            rotY={Math.PI}
            scale={i % 4 === 3 ? 0.8 : 1.0}
            pose={walk(f * 0.2 + i * 0.7, 0.5)}
            look={{ body: PALIWAL[i % 3], legs: "#efe6d0", hat: i % 4 === 2 ? "hood" : "turban", hatColor: i % 4 === 2 ? "#c0392b" : TURBANS[i % 4], skin: "#c98e6a", held: i % 3 === 0 ? "lantern" : "none", backpack: i % 2 ? "#8a6a4a" : undefined }}
          />
        ))}
      {x.tourists === true &&
        new Array(5).fill(0).map((_, i) => (
          <Bean key={i} position={[(i % 2 ? 0.9 : -0.9), 0, 12 - i * 2.6 - t * 3]} rotY={Math.PI + (i % 2 ? 0.4 : -0.4)} scale={1.0} pose={i % 2 ? BP.hold : walk(f * 0.2 + i, 0.5)} look={{ body: CROWD[i + 1], legs: "#2f3440", hat: i % 2 ? "cap" : "none", skin: "#d9a57e", backpack: "#2a2a30" }} />
        ))}
      {x.ghosts === true && (
        <>
          <Wisp position={[-3, 1.5, 4]} seed={1} />
          <Wisp position={[3.2, 1.4, -3]} seed={2} />
          <Wisp position={[-2.5, 1.6, -9]} seed={3} />
        </>
      )}
      {!day && <Mist y={0.6} spread={26} opacity={0.18} color="#a8a0c8" />}
    </>
  );
};

/* ---------------- 6. BHANGARH ---------------- */
export const bhH = (X: number, Z: number) => {
  const r = Math.hypot(X, Z + 10);
  let h = sm(45, 110, r) * (18 + (fbm(X * 0.02, Z * 0.02, 4, 41) - 0.5) * 30);
  h += 8 * Math.exp(-(X ** 2 + (Z + 44) ** 2) / (2 * 16 ** 2));
  return Math.max(0, h);
};

const BhTerrain: React.FC<{ night: boolean }> = ({ night }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(600, 600, 150, 150);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, bhH(pos.getX(i), pos.getZ(i)));
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    const P = ng.attributes.position as THREE.BufferAttribute;
    const N = ng.attributes.normal as THREE.BufferAttribute;
    const cols = new Float32Array(P.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < P.count; i += 3) {
      const ny = (N.getY(i) + N.getY(i + 1) + N.getY(i + 2)) / 3;
      const patch = fbm(P.getX(i) * 0.05, P.getZ(i) * 0.05, 3, 9);
      if (ny < 0.75) c.set("#7a6a58");
      else c.set(patch > 0.55 ? "#6a6a3a" : patch > 0.45 ? "#7a7044" : "#8a7a52");
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
      <meshStandardMaterial vertexColors flatShading roughness={1} color={night ? "#b9b0c8" : "#ffffff"} />
    </mesh>
  );
};

const Banyan: React.FC<{ position: V3; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 2, 0]} castShadow>
      <cylinderGeometry args={[0.6, 0.9, 4, 8]} />
      <meshStandardMaterial color="#5a4a3a" roughness={1} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[Math.cos(i * 1.3) * 2.2, 1.8, Math.sin(i * 1.3) * 2.2]}>
        <cylinderGeometry args={[0.05, 0.06, 3.6, 4]} />
        <meshStandardMaterial color="#6a5a4a" />
      </mesh>
    ))}
    {[[0, 4.6, 0, 3.6], [2, 4.2, 1, 2.6], [-2, 4.3, -1, 2.8], [1, 4.4, -2, 2.4]].map(([cx, cy, cz, r], i) => (
      <mesh key={`c${i}`} position={[cx, cy, cz]} scale={[1, 0.55, 1]} castShadow>
        <icosahedronGeometry args={[r, 1]} />
        <meshStandardMaterial color={i % 2 ? "#2e4a24" : "#3a5a2a"} flatShading />
      </mesh>
    ))}
  </group>
);

const Shop: React.FC<{ position: V3; rotY?: number; h?: number; ruin?: boolean }> = ({ position, rotY = 0, h = 2.4, ruin = true }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
      <boxGeometry args={[4, 0.6, 4]} />
      <meshStandardMaterial color="#8a7a62" />
    </mesh>
    <mesh position={[0, 0.6 + h / 2, -1.85]} castShadow>
      <boxGeometry args={[4, h * (ruin ? 0.8 : 1), 0.3]} />
      <meshStandardMaterial color="#9a8a70" roughness={1} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 1.85, 0.6 + h / 2, 0]} castShadow>
        <boxGeometry args={[0.3, h * (ruin && s > 0 ? 0.6 : 1), 4]} />
        <meshStandardMaterial color="#8f806a" roughness={1} />
      </mesh>
    ))}
    {!ruin && (
      <>
        <mesh position={[0, 0.6 + h + 0.1, 0]} castShadow>
          <boxGeometry args={[4.4, 0.2, 4.4]} />
          <meshStandardMaterial color="#7a6a52" />
        </mesh>
        <mesh position={[0, 0.6 + h - 0.3, 2.1]} rotation={[0.4, 0, 0]}>
          <planeGeometry args={[4, 1.2]} />
          <meshStandardMaterial color={rand(position[2], 2) > 0.5 ? "#c0392b" : "#e8b23a"} side={2} />
        </mesh>
      </>
    )}
  </group>
);

export const AsiBoard: React.FC<{ position: V3; rotY?: number }> = ({ position, rotY = 0 }) => {
  const tex = useMemo(
    () =>
      famTexture(
        [
          { text: "पुरातत्व विभाग", size: 64, color: "#ffffff", family: "Hind" },
          { text: "सूर्योदय से पहले और", size: 54, color: "#ffffff", family: "Hind" },
          { text: "सूर्यास्त के बाद", size: 54, color: "#ffffff", family: "Hind" },
          { text: "प्रवेश वर्जित है", size: 64, color: "#ffd84d", family: "Hind" },
          { text: "ENTRY PROHIBITED", size: 46, color: "#ffffff", weight: "900" },
          { text: "BEFORE SUNRISE & AFTER SUNSET", size: 34, color: "#ffffff", weight: "800" },
        ],
        1024,
        700,
        "#1a3a7a",
      ),
    [],
  );
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.4, 6]} />
          <meshStandardMaterial color="#2a2a30" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.0, 0.02]} castShadow>
        <boxGeometry args={[3.2, 2.2, 0.06]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      <mesh position={[0, 2.0, 0.06]}>
        <planeGeometry args={[3.0, 2.05]} />
        <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.12} />
      </mesh>
    </group>
  );
};

const TANTRIK: BeanLook = { body: "#141014", legs: "#141014", hat: "hood", hatColor: "#0e0a0e", beard: "#9a9a9a", skin: "#a87a5a", coat: true };
const PRINCESS: BeanLook = { body: "#b0123a", legs: "#b0123a", hat: "hood", hatColor: "#e8b23a", coat: true, skin: "#e2b48c" };
const SADHU: BeanLook = { body: "#d4601a", legs: "#d4601a", hat: "turban", hatColor: "#c4501a", beard: "#f0f0f0", skin: "#b88462" };

export const Bhangarh: React.FC<WP> = (p) => {
  const { f, x, t } = p;
  const day = x.day === true;
  const moon: V3 = [50, 46, -160];
  const palaceY = bhH(0, -44);
  const hutY = bhH(-24, -30);
  const throwAt = x.throwAt ? p.wf(x.throwAt as string) : 99999;
  const rollT = x.roll === true ? Math.min(1, Math.max(0, (f - 6) / 34)) : 0;
  const rockFrom: V3 = [21, 1.4, -13];
  const rockTo: V3 = [26, 1.2, -6];
  const rock: V3 = [rockFrom[0] + (rockTo[0] - rockFrom[0]) * rollT, rockFrom[1] + Math.sin(rollT * Math.PI) * 0.3, rockFrom[2] + (rockTo[2] - rockFrom[2]) * rollT];
  const shadowK = x.shadow === true ? sm(0.1, 0.8, t) : 0;
  return (
    <>
      {day ? (
        <>
          <fog attach="fog" args={["#e8c89a", 80, 420]} />
          <SkyDome top="#4a7ac0" horizon="#f6d4a0" />
          <DayLights warm sun={[70, 40, 30]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#141a2e", 30, 260]} />
          <SkyDome top="#03050d" horizon="#22284a" />
          <Stars />
          <Moon position={moon} size={56} />
          <NightLights moon={moon} />
        </>
      )}
      <BhTerrain night={!day} />
      {/* outer wall + Hanuman gate */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 4.6, 4.5, 20]} castShadow>
            <boxGeometry args={[3.6, 9, 4]} />
            <meshStandardMaterial color="#8a7a62" roughness={1} />
          </mesh>
          {new Array(8).fill(0).map((_, i) => {
            const hh = 3 + rand(i + (s > 0 ? 20 : 0), 6) * 2.5;
            return (
              <mesh key={i} position={[s * (8.5 + i * 4.2), hh / 2, 20 + Math.sin(i) * 0.3]} castShadow receiveShadow>
                <boxGeometry args={[4.3, hh, 2]} />
                <meshStandardMaterial color="#86765e" roughness={1} />
              </mesh>
            );
          })}
        </group>
      ))}
      <mesh position={[0, 8.2, 20]} castShadow>
        <boxGeometry args={[5.6, 1.6, 4]} />
        <meshStandardMaterial color="#8a7a62" />
      </mesh>
      <mesh position={[0, 7.0, 22.01]}>
        <torusGeometry args={[2.8, 0.25, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#9a8a70" />
      </mesh>
      <AsiBoard position={[5.2, 0, 26]} rotY={-0.35} />
      {/* bazaar */}
      {new Array(7).fill(0).map((_, i) =>
        [-1, 1].map((s) => <Shop key={`${i}${s}`} position={[s * 5.6, 0, 13 - i * 4.4]} rotY={s > 0 ? -Math.PI / 2 : Math.PI / 2} h={2.2 + rand(i, 3) * 0.5} ruin={!day} />),
      )}
      <Temple position={[-16, 0, -6]} rotY={0.5} scale={0.36} glow={day ? 0 : 0.2} />
      <Temple position={[13, 0, -16]} rotY={-0.6} scale={0.34} glow={day ? 0 : 0.2} />
      {/* palace on the hill */}
      <group position={[0, palaceY - 0.5, -44]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 1.5, 2.5 + i * 3, -i * 2]} castShadow receiveShadow>
            <boxGeometry args={[20 - i * 5, 5, 10 - i * 2]} />
            <meshStandardMaterial color="#8a7a62" roughness={1} />
          </mesh>
        ))}
        {new Array(6).fill(0).map((_, i) => (
          <mesh key={`w${i}`} position={[-8 + i * 3.2, 3, 5.01]}>
            <planeGeometry args={[1.2, 2.2]} />
            <meshStandardMaterial color="#1a1410" />
          </mesh>
        ))}
      </group>
      {[[-22, 0, 6, 1.1], [24, 0, 10, 1.3], [-30, 0, -20, 1.4], [32, 0, -28, 1.2]].map(([a, b, c, s], i) => (
        <Banyan key={i} position={[a, bhH(a, c) + b, c]} s={s} />
      ))}
      {/* sadhu's hut */}
      <group position={[-24, hutY, -30]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[1.6, 1.7, 1.8, 12]} />
          <meshStandardMaterial color="#8a6a4a" roughness={1} />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <coneGeometry args={[2.3, 1.7, 12]} />
          <meshStandardMaterial color="#a8884a" roughness={1} />
        </mesh>
        <mesh position={[0, 0.7, 1.62]}>
          <planeGeometry args={[0.8, 1.3]} />
          <meshStandardMaterial color="#1a120c" />
        </mesh>
        {x.sadhu === true && (
          <>
            <Bean position={[0.4, 0, 3.0]} rotY={0} scale={1.0} pose={BP.sit} look={{ ...SADHU, eyes: "closed" }} />
            <Fire position={[0.4, 0, 4.4]} s={0.35} light={0.4} />
          </>
        )}
        {shadowK > 0 && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, -6 + shadowK * 6]}>
            <planeGeometry args={[14, 12]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.55 * shadowK} depthWrite={false} />
          </mesh>
        )}
      </group>
      {x.crowd === true &&
        CROWD.slice(0, 8).map((c, i) => (
          <Bean
            key={`cr${i}`}
            position={[(i % 2 ? 2.2 : -2.2) + Math.sin(i) * 0.6, 0, 10 - i * 2.6 - (i % 3 === 0 ? t * 2 : 0)]}
            rotY={i % 3 === 0 ? Math.PI : i % 2 ? -1.4 : 1.4}
            scale={0.95 + rand(i, 5) * 0.15}
            pose={i % 3 === 0 ? walk(f * 0.2 + i, 0.5) : BP.idle}
            look={{ body: c, legs: "#efe6d0", hat: i % 3 === 1 ? "hood" : "turban", hatColor: TURBANS[i % 4], skin: "#c98e6a", coat: i % 3 === 1 }}
          />
        ))}
      {x.princess === true && (
        <>
          <Bean position={[0, 0, 5]} rotY={0.2} scale={1.05} pose={BP.idle} look={PRINCESS} blink={f % 70 < 4} />
          <Bean position={[1.3, 0, 5.6]} rotY={-0.3} scale={0.95} pose={BP.hold} look={{ body: "#2b6fe6", legs: "#2b6fe6", hat: "hood", hatColor: "#2b4a8a", coat: true, skin: "#d9a57e" }} />
        </>
      )}
      {x.tantrik === true && <Bean position={[26, 0, -6]} rotY={-1.0} scale={1.1} pose={x.roll === true && rollT > 0.6 ? BP.shock : BP.point} look={TANTRIK} />}
      {x.itr === true && (
        <group position={f < throwAt ? [0.9, 1.25, 5.3] : (([0.9 + (rockFrom[0] - 0.9) * Math.min(1, (f - throwAt) / 18), 1.25 + Math.sin(Math.min(1, (f - throwAt) / 18) * Math.PI) * 3, 5.3 + (rockFrom[2] - 5.3) * Math.min(1, (f - throwAt) / 18)]) as V3)}>
          <mesh>
            <sphereGeometry args={[0.13, 12, 10]} />
            <meshStandardMaterial color="#c08aff" emissive="#9a4aff" emissiveIntensity={1.2} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.12, 8]} />
            <meshStandardMaterial color="#e8b23a" metalness={0.7} />
          </mesh>
          <pointLight color="#b06aff" intensity={6} distance={4} />
        </group>
      )}
      {(x.rock === true || x.roll === true) && (
        <mesh position={rock} rotation={[0, 0, -rollT * 8]} castShadow>
          <icosahedronGeometry args={[1.4, 0]} />
          <meshStandardMaterial color="#6a6258" flatShading roughness={1} emissive="#7a3aff" emissiveIntensity={x.roll === true ? 0.25 : f >= throwAt + 18 ? 0.4 : 0} />
        </mesh>
      )}
      {x.leopards === true &&
        [[-34, 1.0, 34], [-40, 0.9, 26], [30, 1.0, 40]].map(([a, b, c], i) => (
          <group key={i} position={[a, bhH(a, c) + b, c]} visible={Math.sin(f / 14 + i * 2) > -0.6}>
            {[-0.12, 0.12].map((d) => (
              <mesh key={d} position={[d, 0, 0]}>
                <sphereGeometry args={[0.06, 8, 6]} />
                <meshBasicMaterial color="#b8ff5a" toneMapped={false} />
              </mesh>
            ))}
          </group>
        ))}
      {!day && <Mist y={0.6} spread={30} opacity={0.2} color="#8fa0c8" />}
      {!day && x.ghosts === true && (
        <>
          <Wisp position={[-2, 1.6, 6]} seed={4} />
          <Wisp position={[3, 1.7, -4]} seed={5} />
        </>
      )}
    </>
  );
};
