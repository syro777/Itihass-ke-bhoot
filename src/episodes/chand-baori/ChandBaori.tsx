import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BP, Bean, walk } from "../../components/three/Bean";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, WP } from "../../components/three/ShortShots";
import { SkyDome, Snowfall, softTexture, Stars } from "../../components/three/World";
import { Timeline } from "../../lib/util";
import timelineJson from "../../data/chand-baori.timeline.json";
import { DayLights, Moon, NightLights, Wisp } from "../bhootiya-5/Worlds";

const A = 14; // half-size of the pit at the top
const LEVELS = 13;
const DROP = 1.0;
const INSET = 0.9;
const SAND = "#b89a72";

const StepInstances: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mats = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    for (let k = 0; k < LEVELS; k++) {
      const a = A - k * INSET;
      const y = -k * DROP;
      const d = a - INSET / 2;
      const L = 2 * a - 0.6;
      const n = Math.floor(L / 0.32);
      for (let side = 0; side < 4; side++) {
        q.setFromAxisAngle(up, (side * Math.PI) / 2);
        for (let i = 0; i < n; i++) {
          const u = -L / 2 + (i + 0.5) * (L / n);
          const g = ((((u + 50) / 3.0) % 1) + 1) % 1;
          const h = (1 - Math.abs(2 * g - 1)) * 0.55;
          const local = new THREE.Vector3(u, y + 0.07 + h, d);
          local.applyQuaternion(q);
          m.compose(local, q, new THREE.Vector3(1, 1 + h * 2, 1));
          out.push(m.clone());
        }
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const im = ref.current;
    if (!im) return;
    mats.forEach((mm, i) => im.setMatrixAt(i, mm));
    im.instanceMatrix.needsUpdate = true;
  }, [mats]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, mats.length]} castShadow receiveShadow>
      <boxGeometry args={[0.3, 0.14, 0.34]} />
      <meshStandardMaterial color="#c8aa80" roughness={1} />
    </instancedMesh>
  );
};

const Baori: React.FC<{ water?: number }> = ({ water = 0 }) => (
  <group>
    {new Array(LEVELS).fill(0).map((_, k) => {
      const a = A - k * INSET;
      const y = -k * DROP - DROP / 2;
      const col = k % 2 ? "#a8865e" : SAND;
      return (
        <group key={k}>
          {[-1, 1].map((s) => (
            <mesh key={`z${s}`} position={[0, y, s * (a - INSET / 2)]} receiveShadow castShadow>
              <boxGeometry args={[2 * a, DROP, INSET]} />
              <meshStandardMaterial color={col} roughness={1} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={`x${s}`} position={[s * (a - INSET / 2), y, 0]} receiveShadow castShadow>
              <boxGeometry args={[INSET, DROP, 2 * a - 2 * INSET]} />
              <meshStandardMaterial color={col} roughness={1} />
            </mesh>
          ))}
        </group>
      );
    })}
    <StepInstances />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -LEVELS * DROP + 0.05 + water * 3, 0]}>
      <planeGeometry args={[2 * (A - LEVELS * INSET) + 0.2 + water * 6, 2 * (A - LEVELS * INSET) + 0.2 + water * 6]} />
      <meshStandardMaterial color="#3a5a3a" roughness={0.15} metalness={0.3} emissive="#0a2a1a" emissiveIntensity={0.4} />
    </mesh>
    {/* ground around the pit */}
    {[
      [-(A + 100), 0, 200, 400],
      [A + 100, 0, 200, 400],
      [0, -(A + 100), 2 * A, 200],
      [0, A + 100, 2 * A, 200],
    ].map(([x, z, w, d], i) => (
      <mesh key={i} position={[x, -0.05, z]} receiveShadow>
        <boxGeometry args={[w, 0.1, d]} />
        <meshStandardMaterial color="#c8a878" roughness={1} />
      </mesh>
    ))}
    {/* north arcade pavilion */}
    <group position={[0, 0, -A - 2.2]}>
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[2 * A, 6, 4]} />
        <meshStandardMaterial color="#b08e66" />
      </mesh>
      {new Array(9).fill(0).map((_, i) => (
        <group key={i} position={[-A + 1.6 + i * 3.1, 2.2, 2.01]}>
          <mesh>
            <planeGeometry args={[1.6, 2.6]} />
            <meshStandardMaterial color="#2a1a10" />
          </mesh>
          <mesh position={[0, 1.3, 0.001]}>
            <circleGeometry args={[0.8, 12, 0, Math.PI]} />
            <meshStandardMaterial color="#2a1a10" />
          </mesh>
        </group>
      ))}
    </group>
  </group>
);

const World: React.FC<WP> = ({ f, t, x, ramp }) => {
  const night = x.night === true;
  const tex = softTexture();
  const rain = x.rain === true;
  return (
    <>
      {night ? (
        <>
          <fog attach="fog" args={["#141a2e", 30, 160]} />
          <SkyDome top="#03050d" horizon="#22284a" />
          <Stars />
          <Moon position={[-40, 50, -120]} size={44} />
          <NightLights moon={[-40, 50, -120]} />
        </>
      ) : rain ? (
        <>
          <fog attach="fog" args={["#8a96a8", 30, 200]} />
          <SkyDome top="#4a5668" horizon="#a8b0bc" />
          <DayLights warm={false} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#f2dcb4", 60, 300]} />
          <SkyDome top="#3d7fd0" horizon="#f6dcae" />
          <DayLights warm sun={[50, 60, 30]} />
        </>
      )}
      {x.cool === true && <pointLight position={[0, -10, 0]} color="#6ab0ff" intensity={40} distance={20} />}
      <Baori water={rain ? t * 0.6 : 0} />
      {rain && <Snowfall center={[0, -12, 0]} area={30} height={26} count={500} size={0.06} speed={0.7} />}
      {x.ghosts === true &&
        [0, 1, 2, 3, 4].map((i) => {
          const ph = ((f * 0.006 + i * 0.2) % 1 + 1) % 1;
          const k = Math.floor(ph * 12);
          const a = A - k * INSET - 0.5;
          const ang = i * 1.3 + ph * 2;
          return (
            <group key={i}>
              <Wisp position={[Math.cos(ang) * a * 0.8, -k * DROP + 1.2, Math.sin(ang) * a * 0.8]} seed={i} s={0.9} />
              <mesh position={[Math.cos(ang) * a * 0.8, -k * DROP + 1.8, Math.sin(ang) * a * 0.8]}>
                <boxGeometry args={[0.6, 0.3, 0.4]} />
                <meshStandardMaterial color="#c8aa80" emissive="#8a9aff" emissiveIntensity={0.3} />
              </mesh>
            </group>
          );
        })}
      {x.king === true && (
        <>
          <Bean position={[0, 0, A + 1.5]} rotY={Math.PI} scale={1.2} pose={BP.point} look={{ body: "#e8dcc0", legs: "#e8dcc0", hat: "turban", hatColor: "#e8b23a", beard: "#1a1410", skin: "#c98e6a", coat: true }} />
          <Bean position={[1.8, 0, A + 2.2]} rotY={Math.PI + 0.3} scale={1.0} pose={BP.hold} look={{ body: "#6a4a2a", legs: "#e8dcc0", hat: "turban", hatColor: "#c0392b", skin: "#b07d5a" }} />
        </>
      )}
      {x.walker === true && (
        <Bean
          position={[2 - t * 4, -4 - t * 3 + 0.05, A - 4 * INSET - 0.45 - t * 2.6]}
          rotY={Math.PI + 0.6}
          scale={0.9}
          pose={ramp(x.lostAt, 10) > 0 ? BP.shock : walk(f * 0.2, 0.5)}
          look={{ body: "#5a4632", legs: "#3a3028", hat: "ranger", hatColor: "#6b5532", skin: "#c98e6a", held: "lantern" }}
        />
      )}
      {night && (
        <sprite position={[0, -8, 0]} scale={[30, 14, 1]}>
          <spriteMaterial map={tex} color="#8a9aff" transparent opacity={0.12} depthWrite={false} />
        </sprite>
      )}
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([17, 9, 21], [12.5, 6, 15.5], [0, -6, 0], [0, -7, 0], { entry: false, x: { night: true, ghosts: true }, ov: [chip("3500 SEEDHIYAN", "hazaar", { until: "bhooton" }), stamp("BHOOTON NE?", "bhooton", { until: "raat", size: 90 }), stamp("EK RAAT MEIN?", "raat", { size: 84 })] }),
  place: sh([30, 34, 36], [22, 26, 28], [0, -6, 0], [0, -6, 0], { ov: [tag("CHAND BAORI, ABHANERI", "abhaneri", { size: 46 })] }),
  deep: sh([0, 0.5, 11], [0, -9, 5], [0, -8, -6], [0, -13, -2], { ov: [stamp("~100 FEET GEHRI", "sau", { size: 72 }), chip("13 MANZIL", "gehri", { y: 840, bg: "#5a3a1a" })] }),
  king: sh([8, 3.8, 26], [6.5, 3.2, 23.5], [0, 0.5, 12], [0, 0.2, 12], { x: { king: true }, ov: [date("8-9", "SADI", "aathvi"), tag("RAJA CHANDA", "chanda", { size: 54 })] }),
  why: sh([10, 6, 14], [8, 4, 11], [0, -9, 0], [0, -10, 0], { x: { rain: true }, ov: [chip("BAARISH KA PAANI", "baarish", { bg: "#1a3a5a" })] }),
  cool: sh([1.6, -11.6, 1.6], [1.2, -11.2, 1.2], [-6, -3, -6], [-6, -1, -6], { x: { cool: true }, tint: "#1a3a6a", tintOp: 0.08, ov: [chip("KEHTE HAIN...", undefined, { bg: "#4a1a6a", until: "thandi" }), chip("NEECHE THANDI HAWA", "thandi", { bg: "#1a3a5a" })] }),
  maze: sh([6, 30, 2], [-2, 30, 6], [0, -8, 0], [0, -8, 0], { ov: [stamp("BHOOLBHULAIYA!", "bhoolbhulaiya", { size: 84 })] }),
  legend: sh([9, -2, 12], [7.5, -4, 10], [0, -6, 6], [0, -7, 5], { exp: 1.7, x: { night: true, walker: true, lostAt: "nahi" }, ov: [chip("LOKKATHA", "lokkatha", { bg: "#4a1a6a", until: "usi" }), stamp("WAPAS NAHI CHADH PAATA?", "nahi", { size: 58 })] }),
  truth: sh([24, 14, 24], [18, 10, 18], [0, -5, 0], [0, -5, 0], { ov: [chip("SHILALEKH: NAHI MILA", "shilalekh", { bg: "#5a1010" }), stamp("KAHANIYAN ZINDA", "zinda", { y: 840, size: 76 })] }),
  cta: sh([16, 6, 20], [14, 7, 18], [0, -6, 0], [0, -6, 0], { x: { night: true, ghosts: true }, ov: [cta("BHOOT", "INSAAN")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "chand-baori/mix.m4a", line1: "3500 SEEDHIYAN", line2: "EK RAAT MEIN?", nudge: "why" });
export const ChandBaori = short.Ep;
export const chandBaoriFrames = short.total;
