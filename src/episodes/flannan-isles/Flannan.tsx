import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook } from "../../components/three/Bean";
import { Room, Table } from "../../components/three/Mystery3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { Clouds, rand, SkyDome, Snowfall, softTexture, Stars } from "../../components/three/World";
import { lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/flannan-isles.timeline.json";
import { DayLights, Moon, NightLights } from "../bhootiya-5/Worlds";

const TOP = 9.4; // island top height
const LH: V3 = [2, TOP, -2]; // lighthouse base
const KEEPER: BeanLook = { body: "#1e2a3a", legs: "#14181f", hat: "officer", hatColor: "#14181f", skin: "#e2b48c" };
const KEEPERS: BeanLook[] = [KEEPER, { ...KEEPER, beard: "#4a3020" }, { ...KEEPER, beard: "#8a6a4a", body: "#24303e" }];

const Ocean: React.FC<{ color: string; rough?: number }> = ({ color, rough = 1 }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(520, 520, 110, 110);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const X = pos.getX(i);
    const Z = pos.getZ(i);
    pos.setY(i, rough * (0.35 * Math.sin(X * 0.09 + f * 0.06) + 0.25 * Math.sin(Z * 0.17 + f * 0.08) + 0.12 * Math.sin((X - Z) * 0.35 + f * 0.13)));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.25} metalness={0.3} flatShading />
    </mesh>
  );
};

const Island: React.FC<{ night: boolean }> = ({ night }) => {
  const chunks = useMemo(
    () => new Array(14).fill(0).map((_, i) => ({ a: (i / 14) * Math.PI * 2 + rand(i, 4) * 0.3, r: 13 + rand(i + 1, 4) * 2.5, h: 4 + rand(i + 2, 4) * 6, s: 2.5 + rand(i + 3, 4) * 2 })),
    [],
  );
  const rock = night ? "#2e3036" : "#4f4e4a";
  return (
    <group>
      <mesh position={[0, TOP / 2 - 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[13.2, 16.5, TOP + 2, 11]} />
        <meshStandardMaterial color={rock} roughness={1} flatShading />
      </mesh>
      {chunks.map((c, i) => (
        <mesh key={i} position={[Math.cos(c.a) * c.r, c.h / 2 - 1, Math.sin(c.a) * c.r]} rotation={[0, c.a, 0]} castShadow>
          <boxGeometry args={[c.s, c.h, c.s * 1.3]} />
          <meshStandardMaterial color={rock} roughness={1} flatShading />
        </mesh>
      ))}
      <mesh position={[0, TOP + 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[13.0, 13.2, 0.5, 11]} />
        <meshStandardMaterial color={night ? "#2a3a22" : "#5d7a3a"} roughness={1} flatShading />
      </mesh>
      {/* west landing: stairs, ledge with the rope box, jetty */}
      {new Array(9).fill(0).map((_, i) => (
        <mesh key={`s${i}`} position={[-13.6 - i * 0.375, TOP - 0.45 - i * 0.48, 3 - i * 0.05]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.25, 2.2]} />
          <meshStandardMaterial color="#8a8a86" roughness={1} />
        </mesh>
      ))}
      <mesh position={[-17, 4.9, 2.2]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.4, 5]} />
        <meshStandardMaterial color="#8a8a86" roughness={1} />
      </mesh>
      <mesh position={[-19, 1.2, 2.2]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.5, 4.4]} />
        <meshStandardMaterial color="#7a7a76" roughness={1} />
      </mesh>
      <mesh position={[-18.2, 3, 0.6]} castShadow>
        <boxGeometry args={[0.8, 3.8, 0.8]} />
        <meshStandardMaterial color="#7a7a76" roughness={1} />
      </mesh>
      <mesh position={[-18.2, 7.2, 4.3]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 4.2, 6]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      <mesh position={[-19.2, 9.2, 4.3]} rotation={[0, 0, 1.0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.6, 6]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
    </group>
  );
};

const RopeBox: React.FC<{ hit: number }> = ({ hit }) => (
  <group position={[-16.8 - hit * 2.5, 5.45 + hit * 0.4, 0.8 + hit * 1.5]} rotation={[hit * 0.6, hit * 0.9, hit * 1.2]}>
    <mesh castShadow>
      <boxGeometry args={[1.4, 0.8, 0.9]} />
      <meshStandardMaterial color="#6a4a2a" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.45, 0]}>
      <torusGeometry args={[0.35, 0.09, 6, 14]} />
      <meshStandardMaterial color="#c8b080" roughness={1} />
    </mesh>
  </group>
);

const Lighthouse: React.FC<{ lit: number }> = ({ lit }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  const a = f * 0.05;
  return (
    <group position={LH}>
      <mesh position={[0, 3.6, 0]} castShadow>
        <cylinderGeometry args={[1.25, 1.6, 7.2, 20]} />
        <meshStandardMaterial color="#f2f0ea" roughness={0.8} />
      </mesh>
      <mesh position={[0, 7.3, 0]} castShadow>
        <cylinderGeometry args={[2.0, 2.0, 0.25, 20]} />
        <meshStandardMaterial color="#2a2a2e" />
      </mesh>
      <mesh position={[0, 8.1, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 1.4, 16]} />
        <meshStandardMaterial color={lit > 0 ? "#fff2b0" : "#3a4048"} emissive={lit > 0 ? "#ffd060" : "#000000"} emissiveIntensity={2.2 * lit} transparent opacity={0.9} toneMapped={lit <= 0} />
      </mesh>
      <mesh position={[0, 8.8, 0]} castShadow>
        <sphereGeometry args={[1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2a2a2e" metalness={0.4} />
      </mesh>
      <mesh position={[0, 7.75, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.7, 20, 1, true]} />
        <meshStandardMaterial color="#2a2a2e" wireframe />
      </mesh>
      {lit > 0 && (
        <>
          <pointLight position={[0, 8.1, 0]} color="#ffd890" intensity={60 * lit} distance={40} />
          <sprite position={[0, 8.1, 0]} scale={[7, 7, 1]}>
            <spriteMaterial map={tex} color="#ffe08a" transparent opacity={0.9 * lit} depthWrite={false} toneMapped={false} />
          </sprite>
          {[0, Math.PI].map((o) => (
            <group key={o} position={[0, 8.1, 0]} rotation={[0, a + o, 0]}>
              <mesh position={[0, 0, 22]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[3.2, 44, 16, 1, true]} />
                <meshBasicMaterial color="#fff0b0" transparent opacity={0.16 * lit} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </>
      )}
    </group>
  );
};

const Cottage: React.FC<{ door: number; lit: boolean }> = ({ door, lit }) => (
  <group position={[-3.6, TOP, -0.5]}>
    <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
      <boxGeometry args={[6.4, 2.6, 3.6]} />
      <meshStandardMaterial color="#e8e4da" roughness={0.9} />
    </mesh>
    <mesh position={[0, 3.0, 0]} rotation={[0, 0, 0]} scale={[1, 0.55, 1]} castShadow>
      <cylinderGeometry args={[2.2, 2.2, 6.6, 3, 1, false, Math.PI / 2, Math.PI * 2]} />
      <meshStandardMaterial color="#5a5e66" roughness={0.9} flatShading />
    </mesh>
    {[-2, 2].map((x) => (
      <mesh key={x} position={[x, 1.5, 1.81]}>
        <planeGeometry args={[0.8, 0.9]} />
        <meshStandardMaterial color={lit ? "#ffd070" : "#20262e"} emissive={lit ? "#ffb040" : "#000"} emissiveIntensity={lit ? 1 : 0} />
      </mesh>
    ))}
    <mesh position={[0, 1.0, 1.805]}>
      <planeGeometry args={[1.0, 2.0]} />
      <meshStandardMaterial color="#0e1014" />
    </mesh>
    <group position={[-0.5, 1.0, 1.82]} rotation={[0, -door * 1.6, 0]}>
      <mesh position={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[1.0, 2.0, 0.08]} />
        <meshStandardMaterial color="#2e4a3a" />
      </mesh>
    </group>
  </group>
);

const Steamer: React.FC<{ position: V3; rotY?: number; lights?: boolean; hull?: string; s?: number }> = ({ position, rotY = 0, lights = false, hull = "#1a1a1e", s = 1 }) => (
  <group position={position} rotation={[0, rotY, 0]} scale={s}>
    <mesh position={[0, 0.6, 0]} castShadow>
      <boxGeometry args={[12, 1.6, 2.8]} />
      <meshStandardMaterial color={hull} />
    </mesh>
    <mesh position={[0, 0.0, 0]}>
      <boxGeometry args={[12.05, 0.4, 2.85]} />
      <meshStandardMaterial color="#8a1a1a" />
    </mesh>
    <mesh position={[6.4, 0.7, 0]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.01, 1.4, 1.6, 3]} />
      <meshStandardMaterial color={hull} />
    </mesh>
    <mesh position={[-0.5, 2.0, 0]} castShadow>
      <boxGeometry args={[4.5, 1.2, 2.2]} />
      <meshStandardMaterial color="#e8e4da" />
    </mesh>
    <mesh position={[0.2, 3.4, 0]} castShadow>
      <cylinderGeometry args={[0.45, 0.5, 2.0, 12]} />
      <meshStandardMaterial color="#1a1a1e" />
    </mesh>
    <mesh position={[0.2, 4.0, 0]}>
      <cylinderGeometry args={[0.47, 0.47, 0.4, 12]} />
      <meshStandardMaterial color="#c0392b" />
    </mesh>
    {[-4, 3.5].map((x) => (
      <mesh key={x} position={[x, 3.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 5, 6]} />
        <meshStandardMaterial color="#3a2a1e" />
      </mesh>
    ))}
    {lights &&
      [-2, -1, 0, 1].map((x) => (
        <mesh key={x} position={[x, 2.0, 1.12]}>
          <planeGeometry args={[0.4, 0.35]} />
          <meshBasicMaterial color="#ffd070" toneMapped={false} />
        </mesh>
      ))}
  </group>
);

const Smoke: React.FC<{ position: V3 }> = ({ position }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  return (
    <group position={position}>
      {[0, 1, 2, 3, 4].map((i) => {
        const q = ((f * 0.02 + i * 0.2) % 1);
        return (
          <sprite key={i} position={[-q * 6, q * 5, 0]} scale={[1 + q * 3, 1 + q * 3, 1]}>
            <spriteMaterial map={tex} color="#5a5a60" transparent opacity={0.55 * (1 - q)} depthWrite={false} />
          </sprite>
        );
      })}
    </group>
  );
};

/** A big wave that rises out of the west and crashes onto the landing. k: 0..1 (1 = crash). */
const BigWave: React.FC<{ k: number; crash: number }> = ({ k, crash }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  if (k <= 0) return null;
  const h = lerp(1, 13, Math.min(1, k)) * (1 - crash * 0.85);
  const x = lerp(-50, -25, Math.min(1, k)) + crash * 5;
  return (
    <group position={[x, 0, -1]}>
      <mesh position={[0, h / 2 - 0.5, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[7, h, 20]} />
        <meshStandardMaterial color="#1c3a48" roughness={0.2} metalness={0.3} transparent opacity={0.92} />
      </mesh>
      <mesh position={[2.2, h - 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 20, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#27505e" roughness={0.2} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {new Array(12).fill(0).map((_, i) => (
        <sprite key={i} position={[2.5 + Math.sin(i + f / 5) * 0.8, h + 0.6 + Math.sin(i * 2.1 + f / 4) * 0.4, -9 + i * 1.6]} scale={[4, 3, 1]}>
          <spriteMaterial map={tex} color="#f2f6f8" transparent opacity={0.85} depthWrite={false} />
        </sprite>
      ))}
      {crash > 0 &&
        new Array(26).fill(0).map((_, i) => {
          const a = rand(i, 11) * Math.PI;
          const r = crash * (6 + rand(i + 1, 11) * 10);
          return (
            <sprite key={`sp${i}`} position={[6 + Math.cos(a) * r * 0.6, 4 + Math.sin(a) * r, -9 + rand(i + 2, 11) * 16]} scale={[5 + crash * 6, 5 + crash * 6, 1]}>
              <spriteMaterial map={tex} color="#e8f0f4" transparent opacity={0.9 * (1 - crash * 0.7)} depthWrite={false} />
            </sprite>
          );
        })}
    </group>
  );
};

const Interior: React.FC<{ x: WP["x"]; f: number }> = ({ x }) => {
  const tex = softTexture();
  return (
    <>
      <color attach="background" args={["#0a0c10"]} />
      <ambientLight intensity={0.35} color="#9ab0c8" />
      <pointLight position={[1.5, 3.6, 1.5]} color="#ffd8a0" intensity={22} distance={14} />
      <directionalLight position={[3, 5, 4]} intensity={0.5} color="#c8d8ff" />
      <Room wall="#d8d0c0" floor="#5a4a3a" w={10} d={8} h={4.4} windowGlow={0.6} />
      {x.coats === true && (
        <group position={[0, 0, -3.95]}>
          <mesh position={[0, 2.4, 0.03]}>
            <boxGeometry args={[3.6, 0.18, 0.06]} />
            <meshStandardMaterial color="#5a3a1e" />
          </mesh>
          {[-1.1, 0, 1.1].map((hx, i) => (
            <group key={i} position={[hx, 2.4, 0.1]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.22, 6]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.6} />
              </mesh>
              {i === 2 && (
                <group position={[0, -0.75, 0.12]}>
                  <mesh>
                    <boxGeometry args={[0.8, 1.4, 0.22]} />
                    <meshStandardMaterial color="#e0b020" roughness={0.6} />
                  </mesh>
                  {[-1, 1].map((sd) => (
                    <mesh key={sd} position={[sd * 0.48, -0.1, 0]} rotation={[0, 0, sd * 0.12]}>
                      <boxGeometry args={[0.2, 1.2, 0.2]} />
                      <meshStandardMaterial color="#d8a818" roughness={0.6} />
                    </mesh>
                  ))}
                </group>
              )}
            </group>
          ))}
          {[-1.1, 0].map((hx) => (
            <sprite key={hx} position={[hx, 1.7, 0.2]} scale={[0.9, 1.6, 1]}>
              <spriteMaterial map={tex} color="#2a3040" transparent opacity={0.25} depthWrite={false} />
            </sprite>
          ))}
        </group>
      )}
      {x.table === true && (
        <group position={[0, 0, -0.5]}>
          <Table position={[0, 0, 0]} w={2.6} d={1.4} h={0.95} color="#5a3a1e" />
          {[-0.8, 0, 0.8].map((px, i) => (
            <group key={i} position={[px, 1.02, 0.2]}>
              <mesh>
                <cylinderGeometry args={[0.24, 0.2, 0.04, 16]} />
                <meshStandardMaterial color="#f0ece4" />
              </mesh>
              <mesh position={[0, 0.05, 0]}>
                <sphereGeometry args={[0.12, 10, 8]} />
                <meshStandardMaterial color={i === 1 ? "#a0522d" : "#c8a060"} />
              </mesh>
            </group>
          ))}
          <group position={[1.6, 0.25, 0.6]} rotation={[0, 0.5, Math.PI / 2]}>
            <mesh>
              <boxGeometry args={[0.6, 0.08, 0.6]} />
              <meshStandardMaterial color="#4a2a16" />
            </mesh>
            <mesh position={[0, 0.4, -0.27]}>
              <boxGeometry args={[0.6, 0.8, 0.08]} />
              <meshStandardMaterial color="#4a2a16" />
            </mesh>
          </group>
          <group position={[-1.6, 0, 0.5]}>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.6, 0.08, 0.6]} />
              <meshStandardMaterial color="#4a2a16" />
            </mesh>
            <mesh position={[0, 0.9, -0.27]}>
              <boxGeometry args={[0.6, 0.8, 0.08]} />
              <meshStandardMaterial color="#4a2a16" />
            </mesh>
            {[-1, 1].map((sx) =>
              [-1, 1].map((sz) => (
                <mesh key={`${sx}${sz}`} position={[sx * 0.25, 0.25, sz * 0.25]}>
                  <boxGeometry args={[0.06, 0.5, 0.06]} />
                  <meshStandardMaterial color="#4a2a16" />
                </mesh>
              )),
            )}
          </group>
        </group>
      )}
    </>
  );
};

const World: React.FC<WP> = ({ f, t, x, wf, ramp, after }) => {
  if (x.interior === true) return <Interior x={x} f={f} />;
  const storm = x.storm === true;
  const night = x.night === true || storm;
  const dawn = x.dawn === true;
  const lit = x.lit === true ? 1 : typeof x.offAt === "string" ? 1 - ramp(x.offAt, 6) : 0;
  const gone = ramp(x.goneAt, 8);
  const waveK = typeof x.waveAt === "string" ? Math.min(1, Math.max(0, (f - (wf(x.waveAt) - 50)) / 50)) : 0;
  const crash = typeof x.waveAt === "string" ? Math.max(0, Math.min(1, (f - wf(x.waveAt)) / 30)) : 0;
  return (
    <>
      {storm ? (
        <>
          <fog attach="fog" args={["#1a2028", 20, 160]} />
          <SkyDome top="#07090e" horizon="#2a323c" />
          <NightLights moon={[30, 50, -120]} strength={0.6} />
          <Clouds y={34} count={18} spread={160} opacity={0.85} color="#2a2e36" scale={1.5} />
          <Snowfall center={[0, 0, 10]} area={70} height={40} count={500} size={0.06} speed={2.4} />
          {f % 90 < 3 && <pointLight position={[20, 40, 10]} intensity={300} distance={200} color="#c8d8ff" />}
        </>
      ) : night ? (
        <>
          <fog attach="fog" args={["#0e121c", 30, 220]} />
          <SkyDome top="#03050c" horizon="#1a2232" />
          <Stars opacity={0.7} />
          <Moon position={[-40, 40, -160]} size={30} />
          <NightLights moon={[-40, 40, -160]} strength={0.8} />
          <Clouds y={40} count={10} spread={180} opacity={0.6} color="#20242c" />
        </>
      ) : dawn ? (
        <>
          <fog attach="fog" args={["#a8a4a8", 40, 260]} />
          <SkyDome top="#5a6a8a" horizon="#e8b8a0" />
          <DayLights warm sun={[-80, 12, -60]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#9aa6b0", 50, 300]} />
          <SkyDome top="#6a7a8c" horizon="#c8d0d6" />
          <DayLights warm={false} sun={[40, 50, 30]} />
          <Clouds y={40} count={12} spread={180} opacity={0.7} color="#b8c0c8" />
        </>
      )}
      <Ocean color={storm ? "#14222c" : night ? "#0c1620" : dawn ? "#4a5a6a" : "#3a5262"} rough={storm ? 2.2 : 1} />
      <Island night={night} />
      <Lighthouse lit={lit} />
      <Cottage door={ramp(x.doorAt, 14)} lit={lit > 0} />
      <RopeBox hit={crash} />
      {x.keepers === true &&
        KEEPERS.map((l, i) => {
          const s = 1 - gone;
          if (s <= 0.02) return null;
          const p: V3 = [5 - i * 1.6, TOP, 4 + (i % 2) * 0.8];
          return <Bean key={i} position={[p[0], p[1] + gone * 2, p[2]]} rotY={0.2 - i * 0.2} scale={1.05 * s} pose={BP.lantern} look={{ ...l, held: i === 0 ? "lantern" : "none" }} />;
        })}
      {x.landing === true &&
        KEEPERS.map((l, i) => {
          if (after(x.goneAt)) return null;
          const p: V3 = [-16.6 + i * 0.5, 5.1, 3.6 - i * 1.0];
          return <Bean key={`l${i}`} position={p} rotY={-1.4 + i * 0.3} scale={0.9} pose={crash > 0 ? BP.cover : i === 0 ? BP.hold : BP.point} look={i === 2 ? { ...l, body: "#e8e4da" } : l} />;
        })}
      {x.landing === true && <pointLight position={[-15, 7.5, 6]} color="#ffd890" intensity={45} distance={18} />}
      <BigWave k={waveK} crash={crash} />
      {typeof x.shipAt === "number" && (
        <>
          <Steamer position={[lerp(-18, -4, t), 0.2, 20]} rotY={0} lights s={1.5} />
          <Smoke position={[lerp(-18, -4, t) + 0.3, 6.6, 20]} />
          <pointLight position={[lerp(-18, -4, t), 6, 24]} color="#ffd8a0" intensity={30} distance={26} />
        </>
      )}
      {x.hesperus === true && (
        <>
          <Steamer position={[-30, 0.2, 8]} rotY={0.4} hull="#2a3a5a" s={1.1} />
          <Smoke position={[-30, 5, 8]} />
        </>
      )}
      {x.relief === true && <Bean position={[-3.4, TOP, 3.2]} rotY={Math.PI} scale={1.0} pose={after(x.doorAt) ? BP.shock : BP.idle} look={{ body: "#2a3a5a", legs: "#14181f", hat: "officer", hatColor: "#14181f", skin: "#e2b48c", held: "lantern" }} />}
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([11, 12.2, 24], [7.5, 12.6, 17.5], [1, 13, -2], [1, 13.5, -2], { entry: false, x: { storm: true, keepers: true, offAt: "gaayab", goneAt: "gaayab" }, flash: "gaayab", ov: [date("1900", "SAN", "1900"), stamp("GAAYAB!", "gaayab", { size: 110 })] }),
  place: sh([56, 42, 76], [44, 34, 60], [0, 6, 0], [0, 6, 0], { ov: [tag("FLANNAN ISLES, SCOTLAND", "flannan", { size: 44 })] }),
  dark: sh([-6, 4.5, 50], [-1, 5, 48], [-10, 6, 18], [-2, 8, 6], { fov: 58, exp: 1.8, x: { night: true, shipAt: 0 }, ov: [date("15 DEC", "1900", "pandrah"), stamp("BATTI BUJHI!", "bujhi", { size: 96 })] }),
  arrive: sh([3.2, 12.0, 10], [1.2, 11.4, 7.2], [-3.6, 10.6, -0.5], [-3.6, 10.4, 0], { x: { hesperus: true, relief: true, doorAt: "andar" }, ov: [chip("11 DIN BAAD", "gyarah", { bg: "#2a3a5a", until: "koi" }), stamp("KOI NAHI!", "koi", { size: 110 })] }),
  coat: sh([1.2, 2.0, 5.5], [0.8, 1.9, 4.2], [0.2, 1.8, -4], [0.2, 1.8, -4], { x: { interior: true, coats: true }, ov: [tag("SIRF 1 COAT", "coat", { size: 52, until: "bina" }), stamp("BINA COAT!?", "bina", { size: 96 })] }),
  myth: sh([0.6, 2.7, 6.2], [0.3, 2.4, 5.0], [0.2, 0.7, -0.4], [0.2, 0.7, -0.4], { fov: 62, x: { interior: true, table: true }, sepia: true, ov: [chip("KAHANI KI BAATEIN", "adhoora", { bg: "#4a2a1a", until: "kavita" }), stamp("1912 KI KAVITA!", "kavita", { size: 80 })] }),
  wave: sh([-27, 8.5, 17], [-25.5, 7.8, 13.5], [-20, 5.5, 2], [-19, 5.2, 2], { exp: 1.9, fov: 60, x: { storm: true, landing: true, waveAt: "vishaal", goneAt: "teenon" }, flash: "lehar", ov: [tag("PASCHIMI JETTY", "paschimi", { size: 50, until: "andaaza" }), chip("JAANCH KA ANDAAZA", "andaaza", { bg: "#1a3a5a", until: "vishaal" }), stamp("VISHAAL LEHAR!", "vishaal", { size: 90 })] }),
  unknown: sh([-34, 3, 34], [-29, 3.6, 29], [0, 8, 0], [0, 9, 0], { x: { dawn: true }, ov: [chip("SHAREER: KABHI NAHI MILE", "shareer", { bg: "#2a2a2a" })] }),
  cta: sh([20, 15, 38], [15, 14, 30], [1, 13, -2], [1, 13.5, -2], { x: { night: true, lit: true }, ov: [cta("LEHAR", "RAHASYA")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "flannan-isles/mix.m4a", line1: "1900: 3 RAKHWALE", line2: "KAHAN GAYE?", nudge: "coat" });
export const Flannan = short.Ep;
export const flannanFrames = short.total;
