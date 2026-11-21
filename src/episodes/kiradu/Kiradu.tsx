import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook, BeanPose, walk } from "../../components/three/Bean";
import { DesertTerrain, Temple } from "../../components/three/Desert3D";
import { chip, cta, makeScenes, makeShort, sh, stamp, tag, WP } from "../../components/three/ShortShots";
import { rand, SkyDome, Stars } from "../../components/three/World";
import { mixColor, Timeline } from "../../lib/util";
import timelineJson from "../../data/kiradu.timeline.json";
import { DayLights, Moon, NightLights } from "../bhootiya-5/Worlds";

const STONE = "#a8906a";
const TRIM = "#7a6248";
const GREY = "#8a8478";

const stoneLook = (l: BeanLook, k: number): BeanLook =>
  k <= 0
    ? l
    : {
        ...l,
        body: mixColor(l.body ?? "#3b6ea8", GREY, k),
        legs: mixColor(l.legs ?? "#2f3440", GREY, k),
        skin: mixColor(l.skin ?? "#e2b48c", GREY, k),
        hatColor: mixColor(l.hatColor ?? "#8a7448", GREY, k),
        beard: l.beard ? mixColor(l.beard, GREY, k) : undefined,
        eyes: k > 0.6 ? "closed" : l.eyes,
      };

const SADHU: BeanLook = { body: "#d4601a", legs: "#d4601a", hat: "turban", hatColor: "#c4501a", beard: "#f0f0f0", skin: "#b88462", held: "stick" };
const DISCIPLE: BeanLook = { body: "#e8a040", legs: "#e8a040", hat: "none", skin: "#c98e6a" };
const POTTER: BeanLook = { body: "#b0123a", legs: "#b0123a", hat: "hood", hatColor: "#e07a1a", coat: true, skin: "#c98e6a" };
const VILL = ["#e8dcc0", "#3a5a8a", "#8a3a2a", "#e8dcc0", "#5a7a3a"];

const Ruins: React.FC = () => {
  const blocks = useMemo(() => new Array(18).fill(0).map((_, i) => ({ x: -14 + rand(i, 5) * 28, z: -10 + rand(i + 1, 5) * 20, s: 0.4 + rand(i + 2, 5) * 0.8, r: rand(i + 3, 5) * 3, pillar: i % 3 === 0 })), []);
  return (
    <group>
      {blocks.map((b, i) =>
        b.pillar ? (
          <mesh key={i} position={[b.x, 1.4 * b.s + 0.2, b.z]} castShadow>
            <cylinderGeometry args={[0.3, 0.34, 2.8 * b.s + 0.4, 8]} />
            <meshStandardMaterial color={STONE} roughness={1} />
          </mesh>
        ) : (
          <mesh key={i} position={[b.x, b.s * 0.3, b.z]} rotation={[0, b.r, 0.1]} castShadow>
            <boxGeometry args={[b.s * 1.6, b.s * 0.6, b.s]} />
            <meshStandardMaterial color={TRIM} roughness={1} />
          </mesh>
        ),
      )}
    </group>
  );
};

const CarvedPanel: React.FC = () => {
  const f = useCurrentFrame();
  const poses: BeanPose[] = [BP.cheer, BP.point, BP.hold, BP.lantern, BP.shock, BP.cheer];
  return (
    <group position={[0, 0, 5.6]}>
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 4.4, 0.6]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      {[0.6, 2.2, 3.8].map((y) => (
        <mesh key={y} position={[0, y - 0.15, 0.32]}>
          <boxGeometry args={[7, 0.14, 0.12]} />
          <meshStandardMaterial color={TRIM} />
        </mesh>
      ))}
      {[0, 1].map((row) =>
        new Array(6).fill(0).map((_, i) => (
          <Bean key={`${row}${i}`} position={[-2.9 + i * 1.16, 0.75 + row * 1.6, 0.36]} scale={0.42} pose={poses[(i + row) % 6]} look={{ body: STONE, legs: STONE, skin: "#b49c76", hat: i % 2 ? "turban" : "none", hatColor: TRIM }} />
        )),
      )}
      <pointLight position={[2, 3, 3]} color="#ffd8a0" intensity={8 + Math.sin(f / 30)} distance={8} />
    </group>
  );
};

const World: React.FC<WP> = ({ f, t, x, ramp, after }) => {
  const night = x.night === true;
  const dusk = x.dusk === true || x.storm === true;
  const stoneK = ramp(x.stoneAt, 14);
  return (
    <>
      {night ? (
        <>
          <fog attach="fog" args={["#1a1830", 40, 260]} />
          <SkyDome top="#03040f" horizon="#2e2244" />
          <Stars />
          <Moon position={[40, 44, -140]} size={50} />
          <NightLights moon={[40, 44, -140]} />
        </>
      ) : dusk ? (
        <>
          <fog attach="fog" args={["#c0704a", 50, 300]} />
          <SkyDome top={x.storm === true ? "#1a1420" : "#3a2a5a"} horizon={x.storm === true ? "#6a3a3a" : "#ff8a40"} />
          <DayLights warm sun={[-60, 10 - t * 6, -40]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#f2dcb4", 80, 420]} />
          <SkyDome top="#3d7fd0" horizon="#f6dcae" />
          <DayLights warm />
        </>
      )}
      <DesertTerrain night={night} />
      <Temple position={[0, 0, -4]} scale={0.5} stone={STONE} trim={TRIM} glow={night ? 0.3 : 0} noFlag />
      <Temple position={[-11, 0, -10]} rotY={0.5} scale={0.38} stone={STONE} trim={TRIM} glow={0} noFlag />
      <Temple position={[11, 0, -12]} rotY={-0.5} scale={0.34} stone={STONE} trim={TRIM} glow={0} noFlag />
      <Ruins />
      {x.panel === true && <CarvedPanel />}
      {x.tourist === true && <Bean position={[0.4, 0, 3.6]} rotY={0.2} scale={1.1} pose={stoneK > 0.5 ? BP.shock : BP.idle} look={stoneLook({ body: "#2b6fe6", legs: "#2f3440", hat: "cap", hatColor: "#c0392b", skin: "#d9a57e", backpack: "#2a2a30" }, stoneK)} blink={stoneK === 0 && f % 70 < 4} />}
      {(x.sadhu === true || x.sadhuPoint === true) && <Bean position={[-2.2, 0, 4.2]} rotY={0.6} scale={1.1} pose={x.sadhuPoint === true ? BP.point : walk(f * 0.15, 0.4)} look={SADHU} />}
      {x.disciple === true && <Bean position={[0.6, 0.0, 4.6]} rotY={0} scale={1.0} pose={{ ...BP.sit, ra: [2.3, -0.6] }} look={DISCIPLE} />}
      {(x.villagers === true || x.curseV === true) &&
        VILL.map((c, i) => (
          <Bean
            key={i}
            position={[-4 + i * 2, 0, 1 + (i % 2) * 1.4]}
            rotY={x.villagers === true && x.sadhuPoint !== true ? Math.PI + (i - 2) * 0.2 : -0.2 + (i - 2) * 0.1}
            scale={1.0}
            pose={stoneK > 0.4 ? BP.shock : BP.idle}
            look={stoneLook({ body: c, legs: "#e8dcc0", hat: "turban", hatColor: i % 2 ? "#e07a1a" : "#c0392b", skin: "#c98e6a" }, stoneK)}
          />
        ))}
      {x.potter === true && (
        <group>
          <Bean position={[1.6, 0, 5.2]} rotY={-1.0} scale={1.0} pose={BP.hold} look={POTTER} />
          <mesh position={[1.2, 1.25, 5.0]}>
            <sphereGeometry args={[0.22, 12, 10]} />
            <meshStandardMaterial color="#8a4a2a" />
          </mesh>
        </group>
      )}
      {x.potterWalk === true && (
        <group>
          <Bean
            position={[0, 0, 6 + Math.min(t, after(x.lookAt) ? 0.55 : 1) * 4]}
            rotY={0}
            scale={1.05}
            pose={after(x.lookAt) ? { ...BP.idle, head: [2.4, 0] } : walk(f * 0.2, 0.55)}
            look={stoneLook(POTTER, stoneK)}
          />
          <mesh position={[0, 2.62, 6 + Math.min(t, after(x.lookAt) ? 0.55 : 1) * 4]}>
            <sphereGeometry args={[0.24, 12, 10]} />
            <meshStandardMaterial color={mixColor("#8a4a2a", GREY, stoneK)} />
          </mesh>
        </group>
      )}
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([4.4, 1.9, 12], [3.2, 1.7, 9.8], [0, 1.8, 2], [0, 2.4, 0], { entry: false, x: { tourist: true, dusk: true, stoneAt: "patthar" }, ov: [chip("SURAJ DHALNE KE BAAD...", "suraj", { until: "patthar" }), stamp("PATTHAR!", "patthar", { size: 110 })] }),
  place: sh([40, 24, 46], [30, 18, 36], [0, 4, -4], [0, 4, -4], { ov: [tag("KIRADU MANDIR, BARMER", "kiradu", { size: 46, until: "nau" }), chip("~900 SAAL PURANE", "nau", { bg: "#5a3a1a" })] }),
  carving: sh([0.9, 2.4, 13.2], [0.5, 2.2, 11.6], [0, 2.2, 5.6], [0, 2.2, 5.6], { x: { panel: true }, ov: [stamp("RAJASTHAN KA KHAJURAHO", "khajuraho", { size: 58 })] }),
  sadhu: sh([6, 2.2, 10.5], [5, 2, 9.4], [0, 1.2, 4], [0, 1.2, 4], { x: { sadhu: true, disciple: true, villagers: true }, sepia: true, ov: [chip("LOKKATHA", "lokkatha", { bg: "#4a1a6a", until: "beemaar" }), tag("BEEMAAR SHISHYA", "beemaar", { until: "madad" }), stamp("KOI MADAD NAHI", "madad", { size: 70 })] }),
  potter: sh([5.4, 2.0, 11.4], [4.4, 1.8, 10.2], [0.8, 1.1, 5], [0.8, 1.1, 5], { x: { potter: true, disciple: true }, sepia: true, ov: [tag("KUMHAARIN", "kumhaarin", { size: 56 }), chip("SIRF USNE SEVA KI", "seva", { y: 840, bg: "#1b5e20" })] }),
  curse: sh([8, 3, 12.5], [6, 2.6, 10.5], [0, 1.4, 3], [0, 1.4, 3], { x: { sadhuPoint: true, curseV: true, storm: true, stoneAt: "patthar" }, flash: "shraap", ov: [stamp("SHRAAP!", "shraap", { until: "patthar", size: 110 }), stamp("PATTHAR!", "patthar", { size: 100 })] }),
  lookback: sh([1.8, 1.7, 15], [1.5, 1.6, 13.6], [0, 1.3, 8], [0, 1.3, 8], { x: { potterWalk: true, lookAt: "dekha", stoneAt: "patthar", dusk: true }, ov: [stamp("PEECHHE MAT DEKHNA!", "peechhe", { size: 60, until: "dekha" }), stamp("PATTHAR!", "patthar", { size: 100 })] }),
  truth: sh([20, 8, 26], [14, 6, 19], [0, 4, -4], [0, 4, -4], { x: { night: true }, ov: [chip("SABOOT: NAHI", "saboot", { bg: "#1b5e20", until: "aaj" }), stamp("SHAAM KE BAAD: KOI NAHI", "nahi", { size: 56 })] }),
  cta: sh([10, 3, 15], [8, 3, 13], [0, 4, -4], [0, 4, -4], { x: { night: true }, ov: [cta("HAAN", "NAHI")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "kiradu/mix.m4a", line1: "SHAAM KE BAAD RUKE", line2: "TO PATTHAR?", nudge: "potter" });
export const Kiradu = short.Ep;
export const kiraduFrames = short.total;
