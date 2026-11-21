import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { BP, Bean, BeanLook, BeanPose, walk } from "../../components/three/Bean";
import { FieldGun } from "../../components/three/Desert3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { fbm, rand, SkyDome } from "../../components/three/World";
import { Timeline } from "../../lib/util";
import timelineJson from "../../data/golconda-clap.timeline.json";
import { DayLights } from "../bhootiya-5/Worlds";

const gH = (x: number, z: number) => 30 * Math.exp(-(x * x + (z + 40) ** 2) / (2 * 24 * 24)) + (fbm(x * 0.05, z * 0.05, 3, 21) - 0.5) * 2;
const GRANITE = "#8a847a";
const WALL = "#9a8a72";

const Hill: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(400, 400, 120, 120);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, gH(pos.getX(i), pos.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  const rocks = useMemo(() => new Array(40).fill(0).map((_, i) => {
    const a = rand(i, 4) * Math.PI * 2;
    const r = 6 + rand(i + 1, 4) * 26;
    const x = Math.cos(a) * r;
    const z = -40 + Math.sin(a) * r;
    return { x, z, y: gH(x, z), s: 1 + rand(i + 2, 4) * 2.4 };
  }), []);
  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial color="#8a8060" roughness={1} flatShading />
      </mesh>
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.y + r.s * 0.4, r.z]} scale={r.s} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={GRANITE} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

const PATH: V3[] = [
  [0, 4.5, 20],
  [8, 8, 6],
  [-6, 14, -10],
  [6, 22, -26],
  [0, 31, -38],
];
const along = (s: number): V3 => {
  const n = PATH.length - 1;
  const k = Math.min(n - 1e-6, Math.max(0, s * n));
  const i = Math.floor(k);
  const u = k - i;
  const a = PATH[i];
  const b = PATH[i + 1];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
};

/** Sound rings travelling from the gate dome up to Bala Hisar, starting at frame `at`. */
const Rings: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return (
    <group>
      {[0, 1, 2, 3, 4].map((k) => {
        const s = (f - at - k * 5) / 36;
        if (s < 0 || s > 1.1) return null;
        const p = along(Math.min(1, s));
        return (
          <mesh key={k} position={p} rotation={[Math.PI / 2 - 0.4, 0, 0]} scale={1 + s * 2}>
            <torusGeometry args={[1.2, 0.08, 6, 32]} />
            <meshBasicMaterial color="#ffd84d" transparent opacity={0.9 * (1 - s * 0.6)} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

const Gate: React.FC = () => (
  <group position={[0, 0, 20]}>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 4.2, 4.5, 0]} castShadow>
        <boxGeometry args={[3, 9, 3.4]} />
        <meshStandardMaterial color={WALL} roughness={1} />
      </mesh>
    ))}
    <mesh position={[0, 8.2, 0]} castShadow>
      <boxGeometry args={[5.4, 1.6, 3.4]} />
      <meshStandardMaterial color={WALL} />
    </mesh>
    <mesh position={[0, 9.0, 0]}>
      <sphereGeometry args={[2.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#b8aa90" />
    </mesh>
    {[-1, 1].map((s) => (
      <group key={`d${s}`} position={[s * 1.35, 3.6, 1.2]}>
        <mesh castShadow>
          <boxGeometry args={[2.7, 7.2, 0.4]} />
          <meshStandardMaterial color="#4a2a14" roughness={0.8} />
        </mesh>
        {new Array(4).fill(0).map((_, r) =>
          [-0.7, 0.7].map((cx) => (
            <mesh key={`${r}${cx}`} position={[cx, -1.6 + r * 1.2, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.12, 0.7, 8]} />
              <meshStandardMaterial color="#8a8a90" metalness={0.8} roughness={0.3} />
            </mesh>
          )),
        )}
      </group>
    ))}
    {[-1, 1].map((s) => (
      <mesh key={`w${s}`} position={[s * 22, 3.5, -0.5]} castShadow>
        <boxGeometry args={[34, 7, 2.4]} />
        <meshStandardMaterial color={WALL} roughness={1} />
      </mesh>
    ))}
  </group>
);

const BalaHisar: React.FC = () => (
  <group position={[0, gH(0, -40) - 0.5, -40]}>
    <mesh position={[0, 2.8, 0]} castShadow>
      <boxGeometry args={[9, 5.6, 6]} />
      <meshStandardMaterial color="#b8aa90" />
    </mesh>
    {[-3, 0, 3].map((x) => (
      <group key={x} position={[x, 2.2, 3.01]}>
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
    {new Array(8).fill(0).map((_, i) => (
      <mesh key={i} position={[-3.9 + i * 1.12, 6.0, 2.8]}>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color="#b8aa90" />
      </mesh>
    ))}
  </group>
);

const GUARD: BeanLook = { body: "#5a2a1a", legs: "#3a2010", hat: "turban", hatColor: "#f2ead8", beard: "#111", skin: "#b07d5a" };
const clapPose = (f: number, on: boolean): BeanPose => (on ? { ...BP.idle, la: [1.35, 0.3 - Math.abs(Math.sin(f / 3)) * 0.35], ra: [1.35, -0.3 + Math.abs(Math.sin(f / 3)) * 0.35] } : BP.idle);

const World: React.FC<WP> = ({ f, x, wf, after, ramp }) => {
  const dusk = x.dusk === true;
  const clapAt = typeof x.clapAt === "string" ? wf(x.clapAt) : -1;
  const bell = after(x.bellAt) ? Math.sin((f - wf(x.bellAt as string)) / 4) * 0.5 : 0;
  const walls = useMemo(() => new Array(14).fill(0).map((_, i) => along(i / 14)), []);
  return (
    <>
      {dusk ? (
        <>
          <fog attach="fog" args={["#e09a70", 60, 320]} />
          <SkyDome top="#3a3a7a" horizon="#ff9a60" />
          <DayLights warm sun={[-60, 20, -60]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#f2dcb4", 80, 380]} />
          <SkyDome top="#3d7fd0" horizon="#f6dcae" />
          <DayLights warm sun={[60, 60, 40]} />
        </>
      )}
      <Hill />
      <Gate />
      <BalaHisar />
      {walls.map((p, i) => (
        <mesh key={i} position={[p[0] + 4, gH(p[0] + 4, p[2]) + 1.2, p[2]]} rotation={[0, i * 0.4, 0]} castShadow>
          <boxGeometry args={[5, 2.4, 1.2]} />
          <meshStandardMaterial color={WALL} roughness={1} />
        </mesh>
      ))}
      {clapAt >= 0 && <Rings at={clapAt} />}
      {clapAt >= 0 && clapAt < 999 && <Rings at={clapAt + 50} />}
      <Bean position={[1.4, 0, 23.6]} rotY={0.2} scale={1.1} pose={clapPose(f, clapAt >= 0 && f >= clapAt - 4 && f < clapAt + 30)} look={GUARD} blink={f % 70 < 4} />
      {x.topGuard === true && (
        <group>
          <Bean position={[2.2, gH(0, -40) - 0.5, -35.6]} rotY={0.4} scale={1.1} pose={after(x.bellAt) ? BP.point : BP.shock} look={{ ...GUARD, hatColor: "#c0392b", eyes: "wide" }} />
          <group position={[-2.4, gH(0, -40) + 4.2, -36.6]} rotation={[bell, 0, 0]}>
            <mesh position={[0, -0.5, 0]}>
              <coneGeometry args={[0.45, 0.7, 14, 1, true]} />
              <meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.3} side={2} />
            </mesh>
          </group>
        </group>
      )}
      {x.enemy === true &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <Bean key={i} position={[-4 + i * 1.6, 0, 40 - ramp(x.enemyAt ?? "dushman", 60) * 10 + (i % 2) * 1.5]} rotY={Math.PI} scale={1.05} pose={walk(f * 0.25 + i, 0.7)} look={{ body: "#2a2a30", legs: "#2a2a30", hat: "turban", hatColor: "#5a1010", held: "stick", beard: "#111", skin: "#a87a5a" }} />
        ))}
      {x.diamonds === true && (
        <group position={[0, 0, 28]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[2.6, 1.0, 1.4]} />
            <meshStandardMaterial color="#7a1a2a" />
          </mesh>
          {new Array(9).fill(0).map((_, i) => (
            <mesh key={i} position={[-1 + (i % 5) * 0.5, 1.2 + (i > 4 ? 0.05 : 0), -0.3 + (i > 4 ? 0.5 : 0)]} rotation={[0, f * 0.03 + i, 0]}>
              <octahedronGeometry args={[0.14 + (i % 3) * 0.04, 0]} />
              <meshStandardMaterial color="#e8f6ff" metalness={0.9} roughness={0.05} emissive="#9fe8ff" emissiveIntensity={0.3 + 0.3 * Math.max(0, Math.sin(f / 4 + i))} />
            </mesh>
          ))}
          <pointLight position={[0, 2, 0.6]} color="#bff4ff" intensity={8} distance={4} />
          <Bean position={[0, 0, -1.4]} scale={1.05} pose={BP.hold} look={{ body: "#e8dcc0", legs: "#e8dcc0", hat: "turban", hatColor: "#e8b23a", beard: "#222", skin: "#c98e6a", coat: true }} />
          <Bean position={[1.8, 0, 0.8]} rotY={-1.2} scale={1.0} pose={BP.point} look={{ body: "#2a4a6a", legs: "#e8dcc0", hat: "turban", hatColor: "#ffffff", skin: "#d2a07a" }} />
        </group>
      )}
      {x.siege === true && (
        <group>
          {new Array(10).fill(0).map((_, i) => (
            <mesh key={i} position={[-40 + i * 9, 1.4, 52 + (i % 2) * 6]} castShadow>
              <coneGeometry args={[2.2, 2.8, 6]} />
              <meshStandardMaterial color={i % 3 === 0 ? "#b0123a" : "#e8dcc0"} />
            </mesh>
          ))}
          {[-16, 0, 16].map((gx, i) => (
            <FieldGun key={gx} position={[gx, 0, 44]} rotY={0} fireAt={typeof x.gunsAt === "string" ? [wf(x.gunsAt) + i * 6, wf(x.gunsAt) + 30 + i * 6] : []} />
          ))}
        </group>
      )}
      {x.tourists === true &&
        [0, 1, 2, 3].map((i) => (
          <Bean key={i} position={[-2.4 + i * 1.6, 0, 24.5 + (i % 2) * 0.8]} rotY={Math.PI + (i - 1.5) * 0.2} scale={1.0} pose={clapPose(f + i * 2, clapAt >= 0 && f >= clapAt - 4 && f < clapAt + 40)} look={{ body: ["#c0392b", "#2b6fe6", "#e8b23a", "#3a8a5a"][i], legs: "#2f3440", hat: i % 2 ? "cap" : "none", skin: "#d9a57e", backpack: "#2a2a30" }} />
        ))}
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([7, 3.4, 31], [7, 31, -27], [0, 3.4, 20], [0, 31, -40], { entry: false, x: { clapAt: "taali" }, ov: [stamp("TAALI!", "taali", { until: "kilometer", size: 100 }), chip("1 KM DOOR", "kilometer", { until: "choti" }), stamp("CHOTI PAR AAWAAZ!", "choti", { size: 70 })] }),
  place: sh([60, 52, 74], [46, 42, 58], [0, 14, -12], [0, 14, -12], { ov: [tag("GOLCONDA, HYDERABAD", "golconda", { size: 50 })] }),
  dome: sh([10, 6, 38], [9, 15, 31], [0, 6, 20], [0, 22, -20], { x: { clapAt: "taali" }, ov: [tag("FATEH DARWAZA", "fateh", { size: 52, until: "taali" }), chip("BALA HISAR TAK!", "bala", { bg: "#5a3a0a" })] }),
  alarm: sh([9, gH(0, -40) + 4, -29], [7.5, gH(0, -40) + 3.4, -31], [0, gH(0, -40) + 2.2, -40], [0, gH(0, -40) + 2.6, -40], { x: { topGuard: true, bellAt: "alarm" }, ov: [chip("KEHTE HAIN...", undefined, { bg: "#4a1a6a", until: "alarm" }), stamp("ALARM SYSTEM!", "alarm", { size: 84 })] }),
  enemy: sh([12, 6, 42], [10, 5, 37], [0, 3, 22], [0, 3, 22], { x: { enemy: true, enemyAt: "dushman", clapAt: "taali" }, ov: [stamp("DUSHMAN!", "dushman", { until: "taali", size: 96 }), stamp("TAALI = KHABAR!", "khabar", { color: "#2ecc71", size: 76 })] }),
  spikes: sh([6.4, 2.4, 30.5], [5.2, 2.6, 29], [0, 3.2, 21.3], [0, 3.2, 21.3], { exp: 1.6, ov: [chip("NUKEELE KEELE", "nukeele", { until: "haathi" }), stamp("HAATHI-ROK!", "haathi", { size: 90 })] }),
  diamonds: sh([4, 2.3, 32.5], [3, 2.0, 31], [0, 1.1, 28], [0, 1.1, 28], { x: { diamonds: true }, ov: [tag("QUTB SHAHI DAUR", "qutb", { until: "heeron" }), stamp("HEERON KA BAZAAR", "heeron", { size: 68, color: "#2ab0e0" })] }),
  siege: sh([42, 16, 70], [32, 13, 62], [0, 10, 10], [0, 10, 10], { x: { siege: true, gunsAt: "gheraabandi" }, ov: [date("1687"), tag("AURANGZEB KI GHERABANDI", "aurangzeb", { size: 40 })] }),
  today: sh([6, 2.4, 34], [5, 2.2, 32], [0, 2.6, 22], [0, 2.6, 22], { x: { tourists: true, clapAt: "taali" }, ov: [chip("AAJ BHI SAILAANI", "sailaani", { until: "taali" }), stamp("TAALI AAZMAO!", "taali", { size: 80 })] }),
  cta: sh([52, 32, 62], [44, 27, 54], [0, 14, -12], [0, 14, -12], { x: { dusk: true }, ov: [cta("ENGINEERING", "JAADU")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "golconda-clap/mix.m4a", line1: "EK TAALI, AAWAAZ", line2: "1 KM DOOR!", nudge: "spikes" });
export const GolcondaClap = short.Ep;
export const golcondaFrames = short.total;
