import React, { useMemo } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { Burst } from "../../components/three/Mystery3D";
import { Palm, Plane1945, Radio } from "../../components/three/Props3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { Clouds, lerp3, rand, SkyDome, Snowfall, softTexture, textTexture } from "../../components/three/World";
import { lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/flight-19.timeline.json";
import { DayLights, NightLights, Sea } from "../bhootiya-5/Worlds";

const V_OFF: V3[] = [
  [0, 0, 0],
  [-5, 0.6, -5],
  [-5, -0.4, 5],
  [-10, 0.8, -10],
  [-10, -0.2, 10],
];

/** Five planes in a V, nose +x, centred at c. */
const Formation: React.FC<{ c: V3; bank?: number; s?: number }> = ({ c, bank = 0, s = 1.4 }) => {
  const f = useCurrentFrame();
  return (
    <group>
      {V_OFF.map((o, i) => (
        <Plane1945 key={i} position={[c[0] + o[0], c[1] + o[1] + Math.sin(f / 20 + i) * 0.4, c[2] + o[2]]} rotation={[bank + Math.sin(f / 25 + i) * 0.05, 0, Math.sin(f / 30 + i) * 0.03]} scale={s} />
      ))}
    </group>
  );
};

const Label3D: React.FC<{ position: V3; text: string; color?: string }> = ({ position, text, color = "#ffd84d" }) => {
  const tex = useMemo(() => textTexture([{ text, size: 110, color }], 1024, 200, undefined, "#000"), [text, color]);
  return (
    <sprite position={position} scale={[44, 8.6, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} fog={false} />
    </sprite>
  );
};

const Cockpit: React.FC<{ spin: number }> = ({ spin }) => {
  const f = useCurrentFrame();
  const needle = spin > 0 ? f * 0.35 * spin + Math.sin(f / 3) * 1.5 * spin : 0.3;
  const fuel = 1.1 - spin * 0.6;
  return (
    <group>
      <color attach="background" args={["#0a0c10"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 2.2, 1.5]} color="#ffcf8a" intensity={10} distance={6} />
      <mesh position={[0, 0.9, -0.3]}>
        <boxGeometry args={[3, 1.2, 0.3]} />
        <meshStandardMaterial color="#2a2e26" roughness={0.8} />
      </mesh>
      <group position={[-0.5, 1.0, -0.13]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.06, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <circleGeometry args={[0.28, 32]} />
          <meshStandardMaterial color="#e8e4d8" />
        </mesh>
        {["N", "E", "S", "W"].map((d, i) => (
          <mesh key={d} position={[Math.sin((i * Math.PI) / 2) * 0.2, Math.cos((i * Math.PI) / 2) * 0.2, 0.04]}>
            <circleGeometry args={[0.025, 8]} />
            <meshBasicMaterial color={i === 0 ? "#c0262d" : "#222"} />
          </mesh>
        ))}
        <group position={[0, 0, 0.045]} rotation={[0, 0, needle]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.03, 0.2, 0.01]} />
            <meshBasicMaterial color="#c0262d" />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.03, 0.2, 0.01]} />
            <meshBasicMaterial color="#222" />
          </mesh>
        </group>
      </group>
      <group position={[0.5, 1.0, -0.13]}>
        <mesh position={[0, 0, 0.035]}>
          <circleGeometry args={[0.24, 32]} />
          <meshStandardMaterial color="#e8e4d8" />
        </mesh>
        <group position={[0, -0.05, 0.045]} rotation={[0, 0, fuel]}>
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[0.025, 0.18, 0.01]} />
            <meshBasicMaterial color={spin > 0.5 ? "#e01b1b" : "#222"} />
          </mesh>
        </group>
      </group>
      <Radio position={[0, 1.95, -0.2]} scale={0.45} glow={0.8 + 0.2 * Math.sin(f / 2)} />
    </group>
  );
};

const World: React.FC<WP> = ({ f, t, dur, x, ramp, after, wf }) => {
  const storm = x.storm === true;
  const dusk = x.dusk === true;
  const night = x.night === true;
  const tex = softTexture();
  if (x.cockpit === true) return <Cockpit spin={ramp(x.spinAt, 10)} />;
  const fc: V3 = [lerp(-20, 20, t), 30, -60];
  const take = x.takeoff === true ? Math.max(0, t - 0.35) / 0.65 : 0;
  const boom = after(x.boomAt);
  const tb = x.boomAt ? Easing.inOut(Easing.quad)(Math.min(1, wf(x.boomAt as string) / dur)) : 1;
  const rescuePos: V3 = lerp3([60, 26, -110], [-10, 22, -120], boom ? tb : t);
  return (
    <>
      {storm ? (
        <>
          <fog attach="fog" args={["#2a3038", 30, 220]} />
          <SkyDome top="#0e1218" horizon="#3a4250" />
          <NightLights moon={[0, 60, -100]} strength={0.7} />
          <Clouds y={48} count={16} spread={200} opacity={0.8} color="#3a3e48" scale={1.4} />
          <Snowfall center={[0, 0, 10]} area={60} height={40} count={400} size={0.08} speed={0.9} />
        </>
      ) : night ? (
        <>
          <fog attach="fog" args={["#0a0e18", 30, 260]} />
          <SkyDome top="#02030a" horizon="#141c30" />
          <NightLights moon={[40, 40, -200]} strength={0.7} />
        </>
      ) : dusk ? (
        <>
          <fog attach="fog" args={["#c07a5a", 60, 420]} />
          <SkyDome top="#2a3a6a" horizon="#ff8a50" />
          <sprite position={[0, 12, -320]} scale={[80, 80, 1]}>
            <spriteMaterial map={tex} color="#ffcf7a" transparent opacity={0.95} depthWrite={false} fog={false} />
          </sprite>
          <DayLights warm sun={[0, 20, -200]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#bcd4ea", 80, 520]} />
          <SkyDome top="#3d7fd0" horizon="#d8e8f4" />
          <DayLights warm={false} sun={[60, 80, 40]} />
          <Clouds y={60} count={14} spread={220} opacity={0.85} />
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
        <planeGeometry args={[3000, 3000]} />
        <meshStandardMaterial color={storm || night ? "#0a1620" : dusk ? "#2a3a5a" : "#1f5a8a"} roughness={0.3} metalness={0.2} />
      </mesh>
      <Sea color={storm || night ? "#0c1828" : dusk ? "#2a3a5a" : "#2a6a9a"} />
      {x.airfield === true && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 60]} receiveShadow>
            <planeGeometry args={[400, 80]} />
            <meshStandardMaterial color="#8a9a5a" roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 21]}>
            <planeGeometry args={[400, 3]} />
            <meshStandardMaterial color="#e8dcb8" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 30]} receiveShadow>
            <planeGeometry args={[120, 8]} />
            <meshStandardMaterial color="#4a4a50" />
          </mesh>
          <group position={[-24, 0, 44]}>
            <mesh position={[0, 3, 0]} castShadow>
              <boxGeometry args={[16, 6, 10]} />
              <meshStandardMaterial color="#9aa0a8" />
            </mesh>
            <mesh position={[0, 6, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[5, 5, 16, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color="#8a9098" />
            </mesh>
          </group>
          {new Array(8).fill(0).map((_, i) => (
            <Palm key={i} position={[-40 + i * 11 + rand(i, 3) * 3, 0, 23 + rand(i + 1, 3) * 3]} scale={1.3} seed={i} />
          ))}
          {(x.parked === true || take > 0 || x.takeoff === true) &&
            [0, 1, 2, 3, 4].map((i) => {
              const roll = x.takeoff === true ? Math.min(1, t * 1.4) : 0;
              const px = -36 + i * 3 + roll * 80 - i * 6 * roll;
              const py = 0.9 + take * 14 * (1 - i * 0.12);
              return <Plane1945 key={i} position={[px, py, 30 + (i % 2 ? 2 : -2)]} rotation={[0, 0, take * 0.15]} scale={1.2} />;
            })}
        </group>
      )}
      {x.formation === true && <Formation c={fc} bank={storm ? Math.sin(f / 12) * 0.15 : 0} />}
      {x.rescue === true && !boom && <Plane1945 position={rescuePos} rotation={[0, Math.PI, 0]} scale={2.2} />}
      {x.rescue === true && typeof x.boomAt === "string" && <Burst position={rescuePos} at={wf(x.boomAt)} scale={1.2} snow={false} />}
      {x.triangle === true && (
        <group>
          {(
            [
              [-40, 0.6, 10, "MIAMI"],
              [30, 0.6, -70, "BERMUDA"],
              [20, 0.6, 30, "PUERTO RICO"],
            ] as [number, number, number, string][]
          ).map(([a, b, c, n], i) => (
            <group key={n}>
              <mesh position={[a, b, c]}>
                <sphereGeometry args={[1.8, 14, 10]} />
                <meshBasicMaterial color="#ffd84d" toneMapped={false} />
              </mesh>
              <Label3D position={[a, 12, c + (i === 1 ? -8 : 8)]} text={n} />
            </group>
          ))}
          {(
            [
              [[-40, 10], [30, -70]],
              [[30, -70], [20, 30]],
              [[20, 30], [-40, 10]],
            ] as [[number, number], [number, number]][]
          ).map(([a, b], i) => {
            const k = Math.min(1, Math.max(0, t * 3 - i * 0.6));
            const dx = b[0] - a[0];
            const dz = b[1] - a[1];
            const len = Math.hypot(dx, dz) * k;
            const ang = Math.atan2(dx, dz);
            return (
              <mesh key={i} position={[a[0] + (dx * k) / 2, 0.5, a[1] + (dz * k) / 2]} rotation={[0, ang, 0]}>
                <boxGeometry args={[1.2, 0.3, Math.max(0.01, len)]} />
                <meshBasicMaterial color="#e01b1b" toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      )}
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([-45, 34, -38], [-8, 33, -40], [-15, 30, -60], [25, 30, -60], { entry: false, x: { formation: true }, ov: [date("1945"), chip("5 JANGI VIMAAN", "vimaan", { until: "gaayab" }), stamp("SAB GAAYAB!", "gaayab", { size: 92 })] }),
  date: sh([20, 6, 62], [14, 5, 52], [0, 1, 30], [0, 1, 30], { x: { airfield: true, parked: true }, ov: [date("1945", "DECEMBER"), tag("FLORIDA, USA", "florida", { size: 54 })] }),
  takeoff: sh([62, 2.6, 31], [56, 4.5, 31], [-20, 2.5, 30], [20, 9, 30], { x: { airfield: true, takeoff: true }, ov: [chip("FLIGHT 19", "19", { until: "training" }), chip("ROUTINE TRAINING", "training", { bg: "#1a3a5a" })] }),
  compass: sh([0, 1.4, 3.4], [0, 1.3, 2.8], [0, 1.2, 0], [0, 1.15, 0], { x: { cockpit: true, spinAt: "compass" }, ov: [chip("RADIO...", "radio", { until: "compass" }), stamp("COMPASS FAIL!", "nahi", { size: 80 })] }),
  lost: sh([34, 31, -48], [46, 31, -50], [-20, 30, -60], [20, 30, -60], { x: { formation: true, dusk: true }, ov: [chip("SAMANDAR HI SAMANDAR", "bhatakte", { until: "idhan" }), stamp("FUEL KHATAM!", "idhan", { size: 86 })] }),
  rescue: sh([30, 24, -70], [26, 23, -74], [30, 24, -115], [-6, 22, -120], { x: { rescue: true, dusk: true, boomAt: "gaayab" }, flash: "gaayab", ov: [tag("RESCUE PLANE", "bachaav", { size: 50, until: "terah" }), stamp("13 AUR GAAYAB!", "terah", { size: 78 })] }),
  total: sh([0, 6, 10], [0, 5, 6], [0, 2, -60], [0, 2, -60], { x: { night: true }, ov: [stamp("27 LOG", "sattaais", { size: 100 }), chip("MALBA: NAHI MILA", "malba", { y: 840, bg: "#5a1010" })] }),
  legend: sh([0, 170, 70], [0, 160, 60], [0, 0, -20], [0, 0, -20], { fov: 55, x: { triangle: true }, ov: [stamp("BERMUDA TRIANGLE", "bermuda", { y: 1180, size: 76 })] }),
  truth: sh([-30, 34, -40], [10, 33, -42], [-12, 30, -60], [28, 30, -60], { x: { formation: true, storm: true }, flash: "mausam", ov: [chip("NAVY JAANCH:", "navy", { bg: "#1b5e20", until: "bhatakna" }), chip("BHATKAV + KHARAB MAUSAM", "bhatakna", { bg: "#1b5e20" })] }),
  cta: sh([0, 4, 12], [0, 4.5, 10], [0, 6, -100], [0, 8, -100], { x: { dusk: true }, ov: [cta("HAADSA", "RAAZ")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "flight-19/mix.m4a", line1: "5 VIMAAN + RESCUE", line2: "SAB GAYAB!", nudge: "lost" });
export const Flight19 = short.Ep;
export const flight19Frames = short.total;
