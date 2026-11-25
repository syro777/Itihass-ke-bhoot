import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook, BeanPose } from "../../components/three/Bean";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { rand, SkyDome, softTexture, Stars } from "../../components/three/World";
import { lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/kailasa-ellora.timeline.json";
import { DayLights, Moon, NightLights } from "../bhootiya-5/Worlds";

const H = 18; // height of the rock scarp
const ROCK = "#8a7562";
const ROCK_D = "#6e5a4a";
const STONE = "#9c836c";
const TRIM = "#6a5444";
const CAVE = "#2a1e18";

const Box: React.FC<{ p: V3; s: V3; c?: string; r?: number }> = ({ p, s, c = STONE, r = 0 }) => (
  <mesh position={p} rotation={[0, r, 0]} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={1} flatShading />
  </mesh>
);

const Elephant: React.FC<{ position: V3; rotY?: number; s?: number }> = ({ position, rotY = 0, s = 1 }) => (
  <group position={position} rotation={[0, rotY, 0]} scale={s}>
    <Box p={[0, 0.75, 0]} s={[0.9, 0.8, 1.5]} c={TRIM} />
    <Box p={[0, 0.95, 0.85]} s={[0.7, 0.7, 0.5]} c={TRIM} />
    <mesh position={[0, 0.5, 1.15]} rotation={[0.25, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.16, 0.9, 6]} />
      <meshStandardMaterial color={TRIM} roughness={1} />
    </mesh>
    {[-0.42, 0.42].map((x) => (
      <Box key={x} p={[x, 1.0, 0.75]} s={[0.12, 0.55, 0.45]} c={TRIM} />
    ))}
    {[
      [-0.3, -0.5],
      [0.3, -0.5],
      [-0.3, 0.5],
      [0.3, 0.5],
    ].map(([x, z], i) => (
      <Box key={i} p={[x, 0.2, z]} s={[0.25, 0.45, 0.25]} c={TRIM} />
    ))}
  </group>
);

/** Kailasa: plinth with elephant frieze, mandapa, vimana tower, Nandi mandapa, two pillars. Centre z = -2. */
const KailasaTemple: React.FC<{ glow?: number }> = ({ glow = 0 }) => {
  const tiers = [0, 1, 2, 3, 4];
  return (
    <group>
      <Box p={[0, 1.6, -2]} s={[14, 3.2, 20]} />
      <Box p={[0, 3.05, -2]} s={[14.4, 0.3, 20.4]} c={TRIM} />
      {[-1, 1].map((sd) =>
        [-9, -5, -1, 3, 7].map((z) => <Elephant key={`${sd}${z}`} position={[sd * 7.2, 0.1, z - 2]} rotY={sd * (Math.PI / 2)} s={1.25} />),
      )}
      {/* sanctum + tower */}
      <Box p={[0, 5.7, -7]} s={[8, 5, 8]} />
      {tiers.map((i) => (
        <group key={i}>
          <Box p={[0, 8.85 + i * 1.3, -7]} s={[7.4 - i * 1.25, 1.3, 7.4 - i * 1.25]} c={i % 2 ? TRIM : STONE} />
          {[-1, 1].map((sx) =>
            [-1, 1].map((sz) => <Box key={`${sx}${sz}`} p={[sx * (3.2 - i * 0.62), 9.8 + i * 1.3, -7 + sz * (3.2 - i * 0.62)]} s={[0.7, 0.7, 0.7]} c={STONE} />),
          )}
        </group>
      ))}
      <mesh position={[0, 15.6, -7]} castShadow>
        <cylinderGeometry args={[1.4, 1.9, 1.4, 8]} />
        <meshStandardMaterial color={STONE} roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 16.3, -7]} castShadow>
        <sphereGeometry args={[1.5, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={STONE} roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 18.1, -7]}>
        <coneGeometry args={[0.35, 0.9, 8]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* mandapa */}
      <Box p={[0, 5.4, 1.5]} s={[10, 4.4, 9]} />
      <Box p={[0, 7.8, 1.5]} s={[10.6, 0.5, 9.6]} c={TRIM} />
      {[-4, -2, 0, 2, 4].map((x) => (
        <Box key={x} p={[x, 5.3, 6.05]} s={[0.5, 4.2, 0.2]} c={TRIM} />
      ))}
      <Box p={[0, 4.6, 6.1]} s={[1.6, 2.8, 0.1]} c={CAVE} />
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <Box key={`l${sx}${sz}`} p={[sx * 4.6, 8.4, 1.5 + sz * 4]} s={[0.8, 0.8, 0.8]} c={STONE} />))}
      {/* bridge + Nandi mandapa */}
      <Box p={[0, 4.2, 8]} s={[2.6, 0.8, 4]} c={TRIM} />
      <Box p={[0, 3.4, 11.5]} s={[5, 6.8, 5]} />
      <mesh position={[0, 7.6, 11.5]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.6, 1.8, 4]} />
        <meshStandardMaterial color={TRIM} roughness={1} flatShading />
      </mesh>
      {/* dhwaja stambhas + big elephants */}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <mesh position={[sd * 7.5, 7, 10]} castShadow>
            <cylinderGeometry args={[0.45, 0.6, 14, 8]} />
            <meshStandardMaterial color={STONE} roughness={1} flatShading />
          </mesh>
          <Box p={[sd * 7.5, 14.3, 10]} s={[1.4, 0.8, 1.4]} c={TRIM} />
          <Elephant position={[sd * 9.6, 0, 6]} rotY={0} s={2.1} />
        </group>
      ))}
      {glow > 0 && (
        <>
          <pointLight position={[0, 5, 7]} color="#ffb060" intensity={60 * glow} distance={22} />
          <pointLight position={[0, 12, -1]} color="#ffb060" intensity={40 * glow} distance={20} />
        </>
      )}
    </group>
  );
};

/** Courtyard floor, three cliff walls with cave galleries, gateway, plain outside. */
const Pit: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#9a8468" roughness={1} />
    </mesh>
    <Box p={[0, H / 2, -15 - 60]} s={[200, H, 120]} c={ROCK} />
    <Box p={[-13 - 45, H / 2, 0]} s={[90, H, 30.2]} c={ROCK} />
    <Box p={[13 + 45, H / 2, 0]} s={[90, H, 30.2]} c={ROCK} />
    {/* galleries */}
    {[-1, 1].map((sd) =>
      [-10, -4, 2, 8].map((z) => (
        <group key={`${sd}${z}`}>
          <mesh position={[sd * 12.98, 3.2, z]} rotation={[0, -sd * (Math.PI / 2), 0]}>
            <planeGeometry args={[4.2, 3.6]} />
            <meshStandardMaterial color={CAVE} roughness={1} />
          </mesh>
          {[-1.2, 0, 1.2].map((dz) => (
            <Box key={dz} p={[sd * 12.6, 3.2, z + dz]} s={[0.5, 3.6, 0.45]} c={ROCK_D} />
          ))}
        </group>
      )),
    )}
    {[-8, -2, 4].map((x) => (
      <group key={x}>
        <mesh position={[x, 3.4, -14.98]}>
          <planeGeometry args={[4.4, 4]} />
          <meshStandardMaterial color={CAVE} roughness={1} />
        </mesh>
        {[-1.3, 0, 1.3].map((dx) => (
          <Box key={dx} p={[x + dx, 3.4, -14.6]} s={[0.45, 4, 0.5]} c={ROCK_D} />
        ))}
      </group>
    ))}
    {/* gateway (gopuram) wall at the front */}
    {[-1, 1].map((sd) => (
      <Box key={sd} p={[sd * 8, 3.6, 16]} s={[10, 7.2, 2]} c={ROCK_D} />
    ))}
    <Box p={[0, 8.2, 16]} s={[6.4, 2, 2.2]} c={TRIM} />
    {/* scrub on the plateau */}
    {new Array(16).fill(0).map((_, i) => (
      <mesh key={i} position={[-40 + rand(i, 2) * 80, H + 0.5, -20 - rand(i + 3, 2) * 40]}>
        <icosahedronGeometry args={[0.8 + rand(i + 5, 2), 0]} />
        <meshStandardMaterial color="#5a6a32" flatShading />
      </mesh>
    ))}
  </group>
);

const HAMMER = 16;
/** A kneeling craftsman striking a chisel. */
const Mason: React.FC<{ position: V3; rotY?: number; seed?: number; s?: number }> = ({ position, rotY = 0, seed = 0, s = 1 }) => {
  const f = useCurrentFrame() + seed * 5;
  const p = (f % HAMMER) / HAMMER;
  const sw = p < 0.72 ? Math.sin((p / 0.72) * (Math.PI / 2)) : 1 - (p - 0.72) / 0.28;
  const pose: BeanPose = { ...BP.kneel, ra: [1.0 + 1.2 * sw, -0.25], la: [1.2, 0.15], head: [0, 0.45] };
  const look: BeanLook = { body: seed % 2 ? "#e8dcc0" : "#c98e4a", legs: "#e8dcc0", hat: "turban", hatColor: seed % 3 ? "#e8e0d0" : "#c0392b", skin: "#b07a52" };
  const tex = softTexture();
  const spark = p < 0.14;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={s}>
      <Bean position={[0, 0, 0]} scale={1} pose={pose} look={look} />
      <group position={[-0.32, 1.1, 0.25]} rotation={[lerp(0.95, -0.9, sw), 0, 0]}>
        <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.8, 6]} />
          <meshStandardMaterial color="#5a3a1e" />
        </mesh>
        <mesh position={[0, 0, 0.82]}>
          <boxGeometry args={[0.16, 0.16, 0.3]} />
          <meshStandardMaterial color="#3a3a40" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      <mesh position={[0.05, 0.35, 0.85]} rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.02, 0.6, 6]} />
        <meshStandardMaterial color="#8a8a90" metalness={0.7} roughness={0.3} />
      </mesh>
      {spark &&
        [0, 1, 2, 3, 4].map((i) => {
          const a = i * 1.26 + seed;
          const r = 0.1 + p * 3;
          return (
            <sprite key={i} position={[0.05 + Math.cos(a) * r, 0.15 + p * 2 + Math.sin(i) * 0.1, 0.95 + Math.sin(a) * r]} scale={[0.12, 0.12, 1]}>
              <spriteMaterial map={tex} color="#ffd070" transparent opacity={1 - p / 0.14} depthWrite={false} toneMapped={false} />
            </sprite>
          );
        })}
      {[0, 1, 2].map((i) => {
        const q = ((f + i * 5) % 30) / 30;
        return (
          <mesh key={`c${i}`} position={[0.05 + (rand(i + seed, 3) - 0.5) * q * 1.6, 0.1 + q * 1.4 - q * q * 1.6, 0.9 + q * 0.8]}>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
            <meshStandardMaterial color={ROCK} />
          </mesh>
        );
      })}
    </group>
  );
};

const MASON_SPOTS: [number, number, number][] = [
  [6, 6, -0.6],
  [-6, 4, 0.7],
  [8, -6, -1.2],
  [-8, -8, 1.9],
  [3, 12, 0.2],
  [-4, 13, -0.4],
];

const Rubble: React.FC<{ k: number }> = ({ k }) => {
  const rocks = useMemo(() => new Array(40).fill(0).map((_, i) => ({ a: rand(i, 9) * Math.PI * 2, r: rand(i + 1, 9), s: 0.6 + rand(i + 2, 9) * 1.4 })), []);
  if (k <= 0) return null;
  return (
    <group position={[22, 0, 30]} scale={[k, k, k]}>
      <mesh position={[0, 5, 0]} castShadow>
        <coneGeometry args={[12, 10, 9]} />
        <meshStandardMaterial color={ROCK_D} roughness={1} flatShading />
      </mesh>
      {rocks.map((b, i) => (
        <mesh key={i} position={[Math.cos(b.a) * (4 + b.r * 9), (1 - (4 + b.r * 9) / 13) * 9 + b.s * 0.3, Math.sin(b.a) * (4 + b.r * 9)]} rotation={[b.a, b.r * 3, 0]}>
          <dodecahedronGeometry args={[b.s, 0]} />
          <meshStandardMaterial color={i % 2 ? ROCK : ROCK_D} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
};

const KING: BeanLook = { body: "#9a1030", legs: "#e8dcc0", hat: "turban", hatColor: "#e8b23a", coat: true, beard: "#222", skin: "#b07a52" };

const World: React.FC<WP> = ({ f, t, x, ramp, after }) => {
  const night = x.night === true;
  const dusk = x.dusk === true;
  const tex = softTexture();
  const carveK = typeof x.carve === "number" ? (x.carve as number) : x.carve === true ? Math.min(1, t * 1.05) : typeof x.carveFrom === "number" ? lerp(x.carveFrom as number, 1, Math.min(1, t * 1.4)) : 1;
  const cutY = H * (1 - carveK);
  const masons = x.masons === true || after(x.masonsAt);
  const ufo = after(x.ufoAt) && !after(x.ufoEnd);
  const glow = night ? 1 : dusk ? 0.6 : 0;
  return (
    <>
      {night ? (
        <>
          <fog attach="fog" args={["#141428", 60, 300]} />
          <SkyDome top="#04050f" horizon="#2a2448" />
          <Stars />
          <Moon position={[-50, 60, -160]} size={40} />
          <NightLights moon={[-50, 60, -160]} />
        </>
      ) : dusk ? (
        <>
          <fog attach="fog" args={["#d08a5a", 80, 420]} />
          <SkyDome top="#3a2a6a" horizon="#ff9a50" />
          <DayLights warm sun={[50, 22, 30]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#f0dcb8", 100, 500]} />
          <SkyDome top="#3d7fd0" horizon="#f4dcb0" />
          <DayLights warm sun={[-50, 60, 50]} />
        </>
      )}
      {x.kailash === true && (
        <group position={[0, 0, -260]}>
          <mesh position={[0, 55, 0]}>
            <coneGeometry args={[70, 110, 4]} />
            <meshStandardMaterial color="#8a8aa0" roughness={1} flatShading fog={false} />
          </mesh>
          <mesh position={[0, 88, 0]}>
            <coneGeometry args={[30, 46, 4]} />
            <meshStandardMaterial color="#f4f4ff" roughness={1} flatShading fog={false} />
          </mesh>
          <sprite position={[0, 70, 10]} scale={[260, 200, 1]}>
            <spriteMaterial map={tex} color="#ffd8a0" transparent opacity={0.25 + 0.05 * Math.sin(f / 20)} depthWrite={false} fog={false} />
          </sprite>
        </group>
      )}
      <Pit />
      <KailasaTemple glow={glow} />
      {cutY > 0.05 && (
        <mesh position={[0, cutY / 2, 0.5]} castShadow receiveShadow>
          <boxGeometry args={[26.02, cutY, 31]} />
          <meshStandardMaterial color={ROCK} roughness={1} flatShading />
        </mesh>
      )}
      {cutY > 0.05 && x.lines === true && (
        <group position={[0, cutY + 0.03, 0]}>
          {[
            [0, -2, 14.2, 0.12],
            [0, -2, 0.12, 20.2],
          ].map(([px, pz, w, d], i) => (
            <mesh key={i} position={[px, 0, pz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[w, d]} />
              <meshBasicMaterial color="#e8d8b0" />
            </mesh>
          ))}
        </group>
      )}
      {(x.carve !== undefined || typeof x.carveFrom === "number") && cutY > 0.3 && MASON_SPOTS.map(([mx, mz, r], i) => <Mason key={i} position={[mx, cutY, mz]} rotY={r} seed={i} s={1.1} />)}
      {masons &&
        [
          [-4, 7.8, 5, 0.3],
          [4, 7.8, 4, -0.4],
          [-2.5, 13.6, -4.5, 0.6],
          [2.5, 11, -3.5, -0.2],
          [0, 3.2, 8.6, 0],
          [-6.6, 3.2, -9, 1.4],
        ].map(([mx, my, mz, r], i) => <Mason key={`m${i}`} position={[mx, my, mz]} rotY={r} seed={i + 3} s={0.9} />)}
      <Rubble k={typeof x.rubble === "number" ? (x.rubble as number) : x.rubble === true ? Math.min(1, 0.25 + t) : 0} />
      {x.king === true && (
        <group>
          <Bean position={[0, 0, 20]} rotY={0} scale={1.2} pose={after(x.pointAt) ? BP.point : BP.idle} look={KING} blink={f % 80 < 4} />
          <Bean position={[1.3, 0, 19.2]} rotY={-0.2} scale={1.0} pose={BP.lantern} look={{ body: "#e8dcc0", legs: "#e8dcc0", hat: "turban", hatColor: "#c0392b", skin: "#b07a52" }} />
          <mesh position={[0.6, 3.25, 19.8]}>
            <coneGeometry args={[1.3, 0.6, 12]} />
            <meshStandardMaterial color="#c0392b" />
          </mesh>
          <mesh position={[0.6, 2.3, 19.8]}>
            <cylinderGeometry args={[0.04, 0.04, 2, 6]} />
            <meshStandardMaterial color="#e8b23a" />
          </mesh>
          {[-1, 1].map((sd) => (
            <Bean key={sd} position={[sd * 3, 0, 18.6]} rotY={-sd * 0.3} scale={1.0} pose={{ ...BP.idle, ra: [0.2, -0.15] }} look={{ body: "#3a5a8a", legs: "#e8dcc0", hat: "turban", hatColor: "#e07a1a", skin: "#b07a52", held: "stick" }} />
          ))}
        </group>
      )}
      {night &&
        [-6, -3, 0, 3, 6].map((xx) =>
          [-1, 1].map((sd) => (
            <group key={`${xx}${sd}`} position={[sd * 7.4, 3.3, xx - 2]}>
              <mesh>
                <sphereGeometry args={[0.12, 8, 6]} />
                <meshBasicMaterial color="#ffd070" toneMapped={false} />
              </mesh>
            </group>
          )),
        )}
      {ufo && (
        <group position={[Math.sin(f / 15) * 3, 26 + Math.sin(f / 10) * 0.8, -4]} rotation={[0.15, f * 0.06, 0]}>
          <mesh scale={[1, 0.25, 1]}>
            <sphereGeometry args={[4, 24, 12]} />
            <meshStandardMaterial color="#9aa0aa" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[1.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#7ad8ff" emissive="#3aa8ff" emissiveIntensity={0.8} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, -9, 0]}>
            <coneGeometry args={[5, 18, 20, 1, true]} />
            <meshBasicMaterial color="#8affc0" transparent opacity={0.12 + 0.05 * Math.sin(f / 4)} depthWrite={false} />
          </mesh>
        </group>
      )}
      {x.sun === true && <pointLight position={[0, 20, 10]} color="#ffe0a0" intensity={30 * ramp(x.sunAt, 20)} distance={60} />}
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([19, 21, 31], [13, 16, 23], [0, 7, -4], [0, 8, -4], { entry: false, fov: 55, ov: [chip("EK BHI EENT NAHI", "eent", { bg: "#5a1010", until: "chattaan" }), stamp("EK HI CHATTAAN!", "chattaan", { size: 92 })] }),
  place: sh([0, 46, 66], [0, 36, 52], [0, 6, -4], [0, 6, -4], { ov: [tag("KAILASH MANDIR, ELLORA", "ellora", { size: 46, until: "solah" }), chip("GUFA NO. 16", "solah", { bg: "#5a3a1a" })] }),
  topdown: sh([24, 34, 44], [20, 30, 38], [0, 6, -2], [0, 6, -2], { x: { carve: true }, ov: [chip("NEECHE SE UPAR? NAHI", "neeche", { bg: "#1a1a1a", until: "upar" }), stamp("UPAR SE NEECHE!", "upar", { size: 84 })] }),
  rock: sh([46, 32, 66], [40, 27, 57], [8, 4, 8], [10, 4, 10], { x: { carveFrom: 0.88, rubble: true }, ov: [chip("ANUMAAN", "anumaan", { bg: "#3a3a3a", until: "do" }), stamp("~2 LAAKH TON!", "do", { size: 90 })] }),
  king: sh([6.5, 3.0, 31], [5, 2.8, 28.5], [0, 1.9, 17], [0, 2.4, 15], { x: { king: true, pointAt: "banwaaya" }, ov: [date("8VI", "SADI", "aathvi"), tag("RASHTRAKUT RAJA KRISHNA I", "rashtrakut", { size: 40 })] }),
  shiva: sh([-12, 5, 32], [-9, 7, 27], [0, 12, -8], [0, 14, -8], { x: { dusk: true, kailash: true }, ov: [chip("BHAGWAN SHIV KO SAMARPIT", "shiv", { bg: "#3a1a5a", until: "kailash" }), stamp("DHARTI PAR KAILASH", "kailash", { size: 66 })] }),
  tools: sh([10.2, 11.8, 11.6], [9.4, 11.4, 10.6], [6, 9.6, 6], [6, 9.6, 6], { x: { carve: 0.5 }, ov: [chip("NA MACHINE, NA CRANE", "machine", { bg: "#1a1a1a", until: "chheni" }), stamp("CHHENI + HATHAUDI", "chheni", { size: 64 })] }),
  debris: sh([0, 62, 24], [0, 52, 14], [0, 0, -2], [0, 0, -3], { ov: [chip("AAJ BHI SAWAAL", "sawaal", { bg: "#4a1a6a", until: "kahan" }), stamp("PATTHAR KAHAN GAYA?", "kahan", { size: 62 })] }),
  truth: sh([18, 9, 32], [13, 10, 25], [0, 12, -4], [0, 11, -4], { x: { ufoAt: "aliens", ufoEnd: "itihaaskaaron", masonsAt: "kaarigaron" }, ov: [stamp("ALIENS? NAHI!", "itihaaskaaron", { size: 80, until: "kaarigaron" }), stamp("INSAANI KAMAAL!", "kaarigaron", { size: 84, color: "#1b8a3a" })] }),
  cta: sh([0, 22, 56], [0, 17, 46], [0, 7, -4], [0, 8, -4], { x: { night: true }, ov: [cta("INSAANI", "CHAMATKAAR")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "kailasa-ellora/mix.m4a", line1: "EK HI CHATTAAN SE", line2: "POORA MANDIR?", nudge: "shiva" });
export const Kailasa = short.Ep;
export const kailasaFrames = short.total;
