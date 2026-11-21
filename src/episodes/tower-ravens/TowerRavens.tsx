import React, { useMemo } from "react";
import { BP, Bean, BeanLook, walk } from "../../components/three/Bean";
import { chip, cta, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { Clouds, rand, SkyDome } from "../../components/three/World";
import { Timeline } from "../../lib/util";
import timelineJson from "../../data/tower-ravens.timeline.json";
import { DayLights, NightLights } from "../bhootiya-5/Worlds";
import { Bird } from "../jatinga/Scenes3D";

const STONE = "#d8d0bc";
const WALL = "#9a9080";
const LEAD = "#5f6068";

const Turret: React.FC<{ position: V3; h?: number }> = ({ position, h = 17 }) => (
  <group position={position}>
    <mesh position={[0, h / 2, 0]} castShadow>
      <cylinderGeometry args={[1.3, 1.4, h, 12]} />
      <meshStandardMaterial color={STONE} roughness={0.9} />
    </mesh>
    <mesh position={[0, h, 0]} castShadow>
      <sphereGeometry args={[1.45, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={LEAD} roughness={0.5} metalness={0.3} />
    </mesh>
    <mesh position={[0, h + 1.9, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 1.2, 4]} />
      <meshStandardMaterial color="#c9a24a" metalness={0.7} />
    </mesh>
  </group>
);

const WhiteTower: React.FC = () => (
  <group position={[0, 0, -14]}>
    <mesh position={[0, 7, 0]} castShadow receiveShadow>
      <boxGeometry args={[14, 14, 12]} />
      <meshStandardMaterial color={STONE} roughness={0.92} />
    </mesh>
    {[0, 1, 2].map((r) =>
      [-4.5, -1.5, 1.5, 4.5].map((x) => (
        <group key={`${r}${x}`} position={[x, 3.5 + r * 3.6, 6.01]}>
          <mesh>
            <planeGeometry args={[0.8, 1.4]} />
            <meshStandardMaterial color="#1c1a20" />
          </mesh>
          <mesh position={[0, 0.7, 0.001]}>
            <circleGeometry args={[0.4, 10, 0, Math.PI]} />
            <meshStandardMaterial color="#1c1a20" />
          </mesh>
        </group>
      )),
    )}
    {new Array(9).fill(0).map((_, i) => (
      <mesh key={i} position={[-6 + i * 1.5, 14.4, 6]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.4]} />
        <meshStandardMaterial color={STONE} />
      </mesh>
    ))}
    <Turret position={[-7, 0, 6]} />
    <Turret position={[7, 0, 6]} />
    <Turret position={[-7, 0, -6]} />
    <Turret position={[7, 0, -6]} h={19} />
  </group>
);

const CurtainWalls: React.FC = () => (
  <group>
    {[
      [0, -40, 70, 0],
      [-35, -5, 70, Math.PI / 2],
      [35, -5, 70, Math.PI / 2],
    ].map(([x, z, len, r], i) => (
      <mesh key={i} position={[x, 3.5, z]} rotation={[0, r, 0]} castShadow receiveShadow>
        <boxGeometry args={[len, 7, 2.5]} />
        <meshStandardMaterial color={WALL} roughness={1} />
      </mesh>
    ))}
    {[[-35, -40], [35, -40], [-35, 30], [35, 30]].map(([x, z], i) => (
      <mesh key={`t${i}`} position={[x, 5, z]} castShadow>
        <cylinderGeometry args={[3, 3.2, 10, 10]} />
        <meshStandardMaterial color={WALL} roughness={1} />
      </mesh>
    ))}
  </group>
);

const MASTER: BeanLook = { body: "#1a2048", legs: "#1a2048", hat: "ranger", hatColor: "#111", skin: "#e2b48c", coat: true };
const CHARLES: BeanLook = { body: "#8a1a2a", legs: "#2a1a1a", hat: "hair", hatColor: "#1a1410", skin: "#e2b48c", coat: true };
const RAVEN = { color: "#141418", belly: "#24242c" };

const World: React.FC<WP> = ({ f, x, after, ramp }) => {
  const n = (x.ravens as number) ?? 6;
  const storm = x.storm === true;
  const sunset = x.sunset === true;
  const spots = useMemo(() => new Array(10).fill(0).map((_, i) => ({ x: -4 + (i % 5) * 2 + rand(i, 3) * 0.8, z: 9 + Math.floor(i / 5) * 2.2 + rand(i + 1, 3), r: rand(i + 2, 3) * 6 })), []);
  const away = storm ? ramp(x.awayAt ?? "kila", 40) : 0;
  return (
    <>
      {storm ? (
        <>
          <fog attach="fog" args={["#1a1e2a", 20, 140]} />
          <SkyDome top="#05060c" horizon="#2a3040" />
          <NightLights moon={[30, 50, -100]} strength={0.8} />
        </>
      ) : sunset ? (
        <>
          <fog attach="fog" args={["#e0a080", 40, 220]} />
          <SkyDome top="#3a4a8a" horizon="#ffa070" />
          <DayLights warm sun={[-60, 20, -80]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#c8d0da", 40, 240]} />
          <SkyDome top="#6a84a8" horizon="#d8dee6" />
          <DayLights warm={false} />
          <Clouds y={40} count={10} spread={160} opacity={0.6} />
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={storm ? "#2a3a26" : "#4e7a3a"} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 6]} receiveShadow>
        <planeGeometry args={[3, 40]} />
        <meshStandardMaterial color="#b8ad94" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 70]}>
        <planeGeometry args={[400, 30]} />
        <meshStandardMaterial color="#3a5a6a" roughness={0.3} metalness={0.3} />
      </mesh>
      <WhiteTower />
      <CurtainWalls />
      {x.closeup !== true &&
        spots.slice(0, n).map((s, i) => {
          if (away > 0) {
            const a = Math.min(1, away * (1 + i * 0.15));
            return <Bird key={i} position={[s.x + a * (i - 3) * 6, 0.4 + a * 18, s.z - a * 30]} rotation={[-0.4, Math.PI + (i - 3) * 0.2, 0]} flap={Math.sin(f * 0.9 + i) * 1.0} color={RAVEN.color} belly={RAVEN.belly} s={1.8} />;
          }
          const hop = Math.abs(Math.sin(f / 6 + i * 1.7)) * 0.18;
          return <Bird key={i} position={[s.x, 0.32 + hop, s.z]} rotation={[0, s.r + Math.sin(f / 30 + i) * 0.4, 0]} flap={hop > 0.15 ? 0.6 : 0.1} color={RAVEN.color} belly={RAVEN.belly} s={1.8} />;
        })}
      {x.flyAt !== undefined &&
        [0, 1, 2].map((i) => {
          const k = ramp(x.flyAt, 30, i * 4);
          return k > 0 ? <Bird key={`fy${i}`} position={[-2 + i * 2, 1 + k * 8, 3 - k * 10]} rotation={[-0.5, Math.PI, 0]} flap={Math.sin(f * 1.0 + i) * 1.0} color={RAVEN.color} belly={RAVEN.belly} s={1.8} /> : null;
        })}
      {x.closeup === true && <Bird position={[0.4, 0.45, 10.6]} rotation={[0, 0.6, 0]} flap={0.9 + Math.sin(f / 5) * 0.15} color={RAVEN.color} belly={RAVEN.belly} s={2.6} />}
      {x.master === true && <Bean position={[2.4, 0, 11.2]} rotY={-0.7} scale={1.1} pose={{ ...BP.hold, la: [1.3, 0.2] }} look={MASTER} blink={f % 70 < 4} />}
      {x.charles === true && (
        <group>
          <Bean position={[0, 0, 9]} rotY={0.3} scale={1.15} pose={after(x.pointAt ?? "nahi", -10) ? BP.point : BP.idle} look={CHARLES} blink={f % 80 < 4} />
          <mesh position={[0, 2.62, 9]}>
            <cylinderGeometry args={[0.26, 0.3, 0.2, 10, 1, true]} />
            <meshStandardMaterial color="#e8b23a" metalness={0.8} roughness={0.25} side={2} />
          </mesh>
        </group>
      )}
      {x.victorian === true && <Bean position={[-2, 0, 10]} rotY={0.4} scale={1.1} pose={walk(f * 0.15, 0.4)} look={{ body: "#2a2a30", legs: "#2a2a30", hat: "officer", hatColor: "#111", skin: "#e2b48c", coat: true }} />}
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([4, 0.9, 19], [2.6, 0.8, 16.5], [0, 4.5, -10], [0, 4, -10], { entry: false, x: { flyAt: "gir" }, flash: "gir", ov: [chip("6 KAUVE", "chhah", { bg: "#111", until: "gir" }), stamp("RAAJ GIREGA?", "gir", { size: 88 })] }),
  place: sh([40, 30, 44], [30, 22, 32], [0, 6, -14], [0, 6, -14], { ov: [tag("TOWER OF LONDON", "london", { size: 52 }), chip("RAVENS = KAUVE", "ravens", { y: 820 })] }),
  legend: sh([10, 3, 16], [8, 4, 14], [0, 8, -14], [0, 10, -14], { x: { storm: true, awayAt: "kila" }, flash: "rajgaddi", ov: [chip("LOKKATHA", undefined, { bg: "#4a1a6a", until: "kila" }), stamp("KILA + RAJGADDI GIRENGE?", "rajgaddi", { size: 58 })] }),
  charles: sh([3, 1.8, 14.4], [2.4, 1.7, 13.2], [0, 1.6, 9], [0, 1.6, 9], { x: { charles: true, pointAt: "nahi" }, ov: [tag("KING CHARLES II", "charles", { until: "nahi" }), stamp("KAUVE NAHI HATENGE!", "nahi", { size: 66 })] }),
  today: sh([5, 2.2, 16.5], [4, 2, 15], [1, 0.8, 10], [1, 0.8, 10], { x: { master: true }, ov: [chip("KAM SE KAM 6", "kam", { until: "ravenmaster" }), tag("RAVENMASTER", "ravenmaster", { size: 54 })] }),
  spare: sh([0, 6, 20], [0, 5, 18], [0, 0.5, 10], [0, 0.5, 10], { x: { ravens: 8, master: true }, ov: [stamp("6 + 2 EXTRA!", "extra", { size: 84 })] }),
  wings: sh([2.4, 1.2, 14.4], [1.8, 1.0, 13.6], [0.4, 0.6, 10.6], [0.4, 0.6, 10.6], { x: { closeup: true }, ov: [chip("PANKH HALKE SE TRIM", "pankh", { bg: "#1a3a5a" })] }),
  twist: sh([8, 3, 12], [6, 2.6, 10], [0, 5, -10], [0, 5, -10], { x: { victorian: true }, sepia: true, ov: [chip("ITIHAASKAAR:", "itihaaskaaron", { bg: "#1b5e20", until: "victorian" }), stamp("VICTORIAN KAHANI?", "victorian", { size: 70 })] }),
  cta: sh([6, 1.4, 20], [4, 1.4, 18], [0, 5, -10], [0, 5, -10], { x: { sunset: true }, ov: [cta("RISK LO", "NAHI")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "tower-ravens/mix.m4a", line1: "6 KAUVE UDE TO", line2: "RAAJ KHATAM?", nudge: "spare" });
export const TowerRavens = short.Ep;
export const towerRavensFrames = short.total;
