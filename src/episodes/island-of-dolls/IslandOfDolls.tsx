import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook } from "../../components/three/Bean";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { Mist, rand, SkyDome, Stars, textTexture } from "../../components/three/World";
import { lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/island-of-dolls.timeline.json";
import { DayLights, Moon, NightLights, Wisp } from "../bhootiya-5/Worlds";

const DRESS = ["#e07aa0", "#7ab0e0", "#f0e0a0", "#a0e07a", "#e0a07a", "#c0a0e0", "#ffffff"];

/** A small, creepy doll hanging from a string (origin = hook point). */
const Doll: React.FC<{ position: V3; seed: number; s?: number; lying?: boolean }> = ({ position, seed, s = 1, lying = false }) => {
  const f = useCurrentFrame();
  const sway = lying ? 0 : Math.sin(f / 22 + seed * 2.1) * 0.25;
  const str = 0.3 + rand(seed, 3) * 0.5;
  const dress = DRESS[seed % DRESS.length];
  const missingHead = seed % 9 === 4;
  return (
    <group position={position} rotation={lying ? [Math.PI / 2, 0, seed] : [0, seed, sway]} scale={s}>
      {!lying && (
        <mesh position={[0, -str / 2, 0]}>
          <cylinderGeometry args={[0.006, 0.006, str, 3]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      )}
      <group position={[0, -str - 0.18, 0]}>
        {!missingHead && (
          <group>
            <mesh>
              <sphereGeometry args={[0.1, 12, 10]} />
              <meshStandardMaterial color="#f0dcc8" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.04, -0.01]} scale={[1.05, 0.7, 1.05]}>
              <sphereGeometry args={[0.1, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={seed % 2 ? "#3a2a1a" : "#d8b060"} />
            </mesh>
            {[-0.035, 0.035].map((x) => (
              <mesh key={x} position={[x, 0.01, 0.09]}>
                <sphereGeometry args={[0.017, 8, 6]} />
                <meshBasicMaterial color="#111" />
              </mesh>
            ))}
          </group>
        )}
        <mesh position={[0, -0.2, 0]}>
          <coneGeometry args={[0.11, 0.28, 10]} />
          <meshStandardMaterial color={dress} roughness={0.9} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.09, -0.14, 0]} rotation={[0, 0, sd * 0.6]}>
            <capsuleGeometry args={[0.022, 0.1, 4, 6]} />
            <meshStandardMaterial color="#f0dcc8" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Tree: React.FC<{ position: V3; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 1.6, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.34, 3.2, 7]} />
      <meshStandardMaterial color="#4a3a2a" roughness={1} />
    </mesh>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[Math.cos(i * 1.6) * 0.8, 2.9, Math.sin(i * 1.6) * 0.8]} rotation={[Math.sin(i * 1.6) * 0.7, 0, -Math.cos(i * 1.6) * 0.7]}>
        <cylinderGeometry args={[0.05, 0.1, 1.8, 5]} />
        <meshStandardMaterial color="#4a3a2a" />
      </mesh>
    ))}
    {[[0, 4.4, 0, 1.9], [1.2, 3.9, 0.5, 1.3], [-1.1, 4.0, -0.4, 1.4]].map(([x, y, z, r], i) => (
      <mesh key={`c${i}`} position={[x, y, z]} scale={[1, 0.65, 1]} castShadow>
        <icosahedronGeometry args={[r, 1]} />
        <meshStandardMaterial color={i % 2 ? "#3a5a2a" : "#2e4a22"} flatShading />
      </mesh>
    ))}
  </group>
);

const TREES: V3[] = [
  [-3, 0.5, -1],
  [3, 0.5, 1],
  [0, 0.5, -4],
  [-5, 0.5, 3],
  [5, 0.5, -3],
];

const Boat: React.FC<{ position: V3; rotY?: number }> = ({ position, rotY = 0 }) => {
  const sign = useMemo(() => textTexture([{ text: "LUPITA", size: 120, color: "#ffffff" }], 1024, 200, "#c0392b"), []);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[2.4, 0.5, 6]} />
        <meshStandardMaterial color="#2a8a5a" />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[2.0, 0.06, 5.4]} />
        <meshStandardMaterial color="#e8c040" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.0, 1.4, 2.6]}>
          <cylinderGeometry args={[0.05, 0.05, 1.8, 5]} />
          <meshStandardMaterial color="#6a4a2a" />
        </mesh>
      ))}
      <mesh position={[0, 2.3, 2.62]}>
        <planeGeometry args={[2.2, 0.5]} />
        <meshStandardMaterial map={sign} side={2} />
      </mesh>
    </group>
  );
};

const JULIAN: BeanLook = { body: "#6a5a4a", legs: "#3a3028", hat: "ranger", hatColor: "#d8c080", beard: "#e8e8e8", skin: "#b88462" };

const World: React.FC<WP> = ({ f, t, x, ramp }) => {
  const night = x.night === true;
  const dusk = x.dusk === true;
  const hooks = useMemo(() => {
    const out: { p: V3; seed: number }[] = [];
    TREES.forEach((tr, ti) => {
      for (let k = 0; k < 9; k++) {
        const a = rand(k + ti * 11, 7) * Math.PI * 2;
        const r = 0.6 + rand(k + ti * 11 + 1, 7) * 1.4;
        out.push({ p: [tr[0] + Math.cos(a) * r, tr[1] + 3.3 + rand(k + 2, 7) * 0.6, tr[2] + Math.sin(a) * r], seed: k + ti * 9 });
      }
    });
    for (let k = 0; k < 10; k++) out.push({ p: [-6 + k * 1.3, 1.5, 6.6 + Math.sin(k) * 0.3], seed: 60 + k });
    return out;
  }, []);
  const shown = x.grow === true ? Math.round(lerp(1, hooks.length, Math.min(1, t * 1.3))) : hooks.length;
  return (
    <>
      {night ? (
        <>
          <fog attach="fog" args={["#141a26", 10, 90]} />
          <SkyDome top="#03050d" horizon="#1e2a34" />
          <Stars />
          <Moon position={[-30, 30, -90]} size={30} />
          <NightLights moon={[-30, 30, -90]} />
        </>
      ) : dusk ? (
        <>
          <fog attach="fog" args={["#8a6a6a", 14, 120]} />
          <SkyDome top="#2a2a4a" horizon="#c07a6a" />
          <DayLights warm sun={[-40, 8, -60]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#c8d4c0", 40, 260]} />
          <SkyDome top="#6a9ac8" horizon="#e0e8d8" />
          <DayLights warm={false} />
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color={night ? "#1a221a" : "#4a5a3a"} roughness={0.2} metalness={0.3} />
      </mesh>
      {[[-40, 0, 80, 30], [40, 0, 80, 30], [0, -40, 30, 40]].map(([px, pz, w, d], i) => (
        <mesh key={i} position={[px, 0.2, pz]}>
          <boxGeometry args={[w, 0.5, d]} />
          <meshStandardMaterial color="#3a5a2a" />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[8.5, 9, 0.6, 24]} />
        <meshStandardMaterial color="#5a5a3a" roughness={1} />
      </mesh>
      {TREES.map((p, i) => (
        <Tree key={i} position={p} s={1 + (i % 2) * 0.2} />
      ))}
      <group position={[-1, 0.5, 4]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[2.6, 2.2, 2.2]} />
          <meshStandardMaterial color="#7a5a3a" roughness={1} />
        </mesh>
        <mesh position={[0, 2.35, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[3.0, 0.1, 2.6]} />
          <meshStandardMaterial color="#6a6a70" metalness={0.4} />
        </mesh>
        {night && (
          <group position={[1.4, 1.6, 1.2]}>
            <mesh>
              <boxGeometry args={[0.2, 0.3, 0.2]} />
              <meshStandardMaterial color="#ffcf70" emissive="#ffb347" emissiveIntensity={2.5} />
            </mesh>
            <pointLight color="#ffb347" intensity={14} distance={10} decay={1.6} />
          </group>
        )}
      </group>
      {[-6, -4.7, -3.4, -2.1, -0.8, 0.5, 1.8, 3.1, 4.4, 5.7].map((px) => (
        <mesh key={px} position={[px, 1.1, 6.6]}>
          <cylinderGeometry args={[0.05, 0.06, 1.4, 5]} />
          <meshStandardMaterial color="#5a4a3a" />
        </mesh>
      ))}
      {hooks.slice(0, shown).map((h, i) => (
        <Doll key={i} position={h.p} seed={h.seed} s={1.2} />
      ))}
      {x.boat === true && <Boat position={[-2.8, 0, lerp(16, 11, t)]} rotY={0} />}
      {x.julian === true && <Bean position={[3.6, 0.5, 4.4]} rotY={-0.8} scale={1.05} pose={ramp(x.hangAt, 10) > 0 ? { ...BP.cheer } : BP.hold} look={JULIAN} blink={f % 70 < 4} />}
      {x.floatDoll === true && <Doll position={[6, 0.05 + Math.sin(f / 10) * 0.03, 6.5]} seed={3} s={1.4} lying />}
      {x.spirit === true && <Wisp position={[6, 0.9, 5]} seed={2} s={0.8} op={0.8} />}
      {x.ripples === true &&
        [0, 1, 2].map((k) => {
          const a = ((f / 40 + k / 3) % 1 + 1) % 1;
          return (
            <mesh key={k} position={[6, 0.02, 5]} rotation={[-Math.PI / 2, 0, 0]} scale={0.4 + a * 3}>
              <ringGeometry args={[0.9, 1, 32]} />
              <meshBasicMaterial color="#cfe0ff" transparent opacity={0.6 * (1 - a)} />
            </mesh>
          );
        })}
      <Mist y={0.6} spread={16} opacity={night || dusk ? 0.3 : 0.12} color={night ? "#8a9ab8" : "#e8e0d8"} />
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([5.2, 3.8, 5.6], [4, 3.2, 14], [3, 3.9, 1], [0, 3.2, 0], { entry: false, x: { boat: true, dusk: true }, ov: [chip("HAR PED PAR...", "ped", { until: "saikdon" }), stamp("SAIKDON GUDIYAN!", "saikdon", { size: 76 })] }),
  place: sh([40, 30, 42], [30, 22, 32], [0, 0, 0], [0, 0, 0], { ov: [tag("XOCHIMILCO, MEXICO CITY", "xochimilco", { size: 44, until: "taapu" }), chip("GUDIYON KA TAAPU", "taapu", { bg: "#5a1a4a" })] }),
  julian: sh([7, 2.1, 10.5], [5.6, 1.9, 9], [2.6, 1.6, 3.4], [2.6, 1.6, 3.4], { x: { julian: true }, ov: [tag("DON JULIAN SANTANA", "julian", { size: 46, until: "akele" }), chip("AKELE RAHTE THE", "akele", { bg: "#3a3a3a" })] }),
  girl: sh([10, 1.3, 10.5], [9, 1.2, 9.4], [6, 0.7, 4.6], [6, 0.7, 4.6], { x: { spirit: true, dusk: true }, ov: [chip("KEHTE HAIN...", undefined, { bg: "#4a1a6a", until: "doobi" }), chip("NAHAR MEIN EK BACHCHI", "bachchi", { bg: "#1a2a4a" })] }),
  doll: sh([8.6, 1.7, 10], [7.6, 1.6, 8.8], [5, 0.9, 5], [3.6, 1.6, 4.4], { x: { floatDoll: true, julian: true, hangAt: "taang" }, ov: [chip("TAIRTI GUDIYA", "gudiya", { until: "aatma" }), stamp("AATMA KE LIYE", "aatma", { size: 76 })] }),
  fifty: sh([10, 4, 14], [8, 3.6, 12], [0, 3, 0], [0, 3.2, 0], { x: { grow: true }, ov: [stamp("50 SAAL", "pachaas", { until: "saikdon", size: 96 }), stamp("SAIKDON!", "saikdon", { size: 100 })] }),
  death: sh([10.5, 1.5, 10.5], [9.4, 1.4, 9.4], [6, 0.4, 4.6], [6, 0.4, 4.6], { x: { night: true, ripples: true }, flash: "usi", ov: [date("2001"), stamp("USI JAGAH!", "usi", { size: 92 })] }),
  doubt: sh([4.4, 2.2, 12.5], [3.4, 2.1, 10.5], [0, 3, 0], [0, 3, 0], { ov: [chip("RISHTEDAAR:", "rishtedaar", { bg: "#1b5e20", until: "thi" }), stamp("BACHCHI THI HI NAHI?", "thi", { size: 62 })] }),
  cta: sh([0.4, 2.6, 22], [0.2, 2.4, 17], [0, 3, 0], [0, 3, 0], { x: { night: true }, ov: [cta("DUKH", "BHOOT")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "island-of-dolls/mix.m4a", line1: "HAR PED PAR LATAKTI", line2: "GUDIYAN!", nudge: "fifty" });
export const IslandOfDolls = short.Ep;
export const islandOfDollsFrames = short.total;
