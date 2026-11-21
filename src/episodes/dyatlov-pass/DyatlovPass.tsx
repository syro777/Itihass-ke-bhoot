import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { BP, Bean, BeanLook, walk } from "../../components/three/Bean";
import { Alps, Pine } from "../../components/three/Mystery3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, WP } from "../../components/three/ShortShots";
import { fbm, SkyDome, Snowfall, softTexture, Stars } from "../../components/three/World";
import { lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/dyatlov-pass.timeline.json";
import { DayLights, NightLights } from "../bhootiya-5/Worlds";

const dyH = (x: number, z: number) => -0.22 * z + (fbm(x * 0.03, z * 0.03, 4, 11) - 0.5) * 3;

const Slope: React.FC<{ night: boolean }> = ({ night }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 320, 110, 110);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, dyH(pos.getX(i), pos.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={night ? "#b8c4dc" : "#f2f6fb"} roughness={0.9} flatShading />
    </mesh>
  );
};

const Tent: React.FC<{ slit?: boolean; buried?: number }> = ({ slit = false, buried = 0 }) => {
  const f = useCurrentFrame();
  const y = dyH(0, 0);
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0.55 - buried * 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.95, 0.95, 4.2, 3]} />
        <meshStandardMaterial color="#8a8a6a" roughness={0.9} side={2} />
      </mesh>
      {slit && (
        <group position={[0.2, 0.65 - buried * 0.4, 0.5]} rotation={[0.52, 0, 0]}>
          <mesh>
            <planeGeometry args={[2.2, 0.5]} />
            <meshBasicMaterial color="#0a0a0c" side={2} />
          </mesh>
          <mesh position={[0, -0.3, 0.05]} rotation={[0.4 + Math.sin(f / 5) * 0.3, 0, 0]}>
            <planeGeometry args={[2.0, 0.5]} />
            <meshStandardMaterial color="#7a7a5a" side={2} />
          </mesh>
        </group>
      )}
      {buried > 0 && (
        <mesh position={[0, 0.9, 0]} scale={[1, buried, 1]}>
          <boxGeometry args={[5, 0.9, 3]} />
          <meshStandardMaterial color="#e8eef6" flatShading />
        </mesh>
      )}
    </group>
  );
};

const HIKERS = ["#c0392b", "#2b6fe6", "#3a8a5a", "#8a3a8a", "#e07a1a", "#2a2a30", "#5a7ab8", "#b05a3a", "#6a6a2a"];
const hiker = (i: number): BeanLook => ({ body: HIKERS[i % 9], legs: "#2a2a30", hat: "beanie", hatColor: HIKERS[(i + 3) % 9], skin: "#e2b48c", backpack: i % 2 ? "#5a4a3a" : "#3a3a4a" });

const World: React.FC<WP> = ({ f, t, x, ramp, after }) => {
  const day = x.day === true;
  const tex = softTexture();
  const prints = useMemo(() => new Array(26).fill(0).map((_, i) => ({ x: Math.sin(i * 0.4) * 1.2 + i * 0.22 + (i % 2 ? 0.25 : -0.25), z: 2 + i * 1.1 })), []);
  const slab = ramp(x.slabAt, 18);
  const run = ramp(x.runAt, 60);
  return (
    <>
      {day ? (
        <>
          <fog attach="fog" args={["#dfe6f0", 40, 320]} />
          <SkyDome top="#7a90b0" horizon="#e6ecf4" />
          <DayLights warm={false} sun={[40, 50, 60]} />
        </>
      ) : (
        <>
          <fog attach="fog" args={["#141a2a", 18, 160]} />
          <SkyDome top="#02030a" horizon="#1a2236" />
          <Stars />
          <NightLights moon={[-40, 50, -80]} strength={1.1} />
        </>
      )}
      <Slope night={!day} />
      <group position={[0, -40, -320]}>
        <Alps />
      </group>
      <Snowfall center={[0, dyH(0, 6), 6]} area={40} height={20} count={day ? 200 : 450} size={0.1} speed={0.08} />
      {(x.tentSlit === true || x.tent === true) && <Tent slit={x.tentSlit === true} buried={slab * 0.5} />}
      {x.prints === true &&
        prints.map((p, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[p.x, dyH(p.x, p.z) + 0.03, p.z]} scale={[0.55, 1, 1]}>
            <circleGeometry args={[0.18, 8]} />
            <meshStandardMaterial color="#5a6478" />
          </mesh>
        ))}
      {x.flee === true &&
        [0, 1, 2, 3].map((i) => {
          const z = 6 + i * 1.6 + t * 9;
          return <Bean key={i} position={[0.6 + i * 0.4, dyH(0.6, z), z]} rotY={0.1} scale={0.9} pose={walk(f * 0.36 + i, 1, true)} look={{ ...hiker(i), backpack: undefined }} />;
        })}
      {x.team === true &&
        new Array(9).fill(0).map((_, i) => {
          const z = 4 - i * 2.2 - t * 6;
          return <Bean key={i} position={[Math.sin(i) * 0.5, dyH(0, z), z]} rotY={Math.PI} scale={1.0} pose={walk(f * 0.2 + i, 0.55)} look={hiker(i)} />;
        })}
      {x.rescue === true && <Bean position={[-2.6, dyH(-2.6, 1.8), 1.8]} rotY={2.2} scale={1.05} pose={BP.shock} look={{ body: "#3a3a3a", legs: "#2a2a2a", hat: "ranger", hatColor: "#4a3a2a", skin: "#e2b48c", held: "stick", eyes: "wide" }} />}
      {x.cedar === true && (
        <group>
          <Pine position={[7.5, dyH(7.5, 29.5), 29.5]} s={1.3} />
          <Pine position={[12, dyH(12, 33), 33]} s={1.1} />
          <group position={[4.4, dyH(4.4, 31), 31]}>
            {[0, 1, 2].map((i) => (
              <mesh key={i} rotation={[0, i * 1.1, Math.PI / 2]} position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 1.2, 5]} />
                <meshStandardMaterial color="#1a1410" />
              </mesh>
            ))}
            <sprite position={[0, 0.3, 0]} scale={[0.8, 0.8, 1]}>
              <spriteMaterial map={tex} color="#ff6a1a" transparent opacity={0.5 + 0.2 * Math.sin(f / 3)} depthWrite={false} toneMapped={false} />
            </sprite>
          </group>
        </group>
      )}
      {after(x.ufoAt) && (
        <group position={[-8 + Math.sin(f / 20) * 2, 22, -30]} rotation={[0.2, f * 0.05, 0]}>
          <mesh scale={[1, 0.25, 1]}>
            <sphereGeometry args={[4, 24, 12]} />
            <meshStandardMaterial color="#9aa0aa" metalness={0.8} roughness={0.3} />
          </mesh>
          {new Array(8).fill(0).map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 0.785) * 3.6, -0.4, Math.sin(i * 0.785) * 3.6]}>
              <sphereGeometry args={[0.3, 8, 6]} />
              <meshBasicMaterial color={(Math.floor(f / 5) + i) % 2 ? "#5ff2ff" : "#ffd84d"} toneMapped={false} />
            </mesh>
          ))}
          <pointLight color="#5ff2ff" intensity={40} distance={60} />
        </group>
      )}
      {after(x.rocketAt) && (
        <group position={[lerp(-40, 40, ramp(x.rocketAt, 40)), 14 + ramp(x.rocketAt, 40) * 20, -50]} rotation={[0, 0, -1.0]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 3, 10]} />
            <meshStandardMaterial color="#d8d8d8" />
          </mesh>
          <sprite position={[0, -3, 0]} scale={[3, 6, 1]}>
            <spriteMaterial map={tex} color="#ffb347" transparent opacity={0.9} depthWrite={false} toneMapped={false} />
          </sprite>
        </group>
      )}
      {after(x.yetiAt) && <Bean position={[4, dyH(4, -6), -6]} rotY={-0.4} scale={2.4 * Math.min(1, ramp(x.yetiAt, 8) + 0.01)} pose={BP.shock} look={{ body: "#e8e8f0", legs: "#e8e8f0", hat: "hood", hatColor: "#f4f4f8", skin: "#b8b8c8", beard: "#f4f4f8", eyes: "wide" }} />}
      {(x.slabOutline === true || x.slabAt !== undefined) && (
        <group position={[0, dyH(0, -7) + 1.4 - slab * 1.6, -7 + slab * 6]} rotation={[0.22, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[6, 1.2, 5]} />
            <meshStandardMaterial color="#eef3fa" flatShading emissive={x.slabOutline === true ? "#5ff2ff" : "#000"} emissiveIntensity={x.slabOutline === true ? 0.25 + 0.15 * Math.sin(f / 4) : 0} />
          </mesh>
        </group>
      )}
      {x.runAt !== undefined &&
        run > 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const z = 2 + i * 0.8 + run * 10;
          return <Bean key={i} position={[-1.4 + i * 0.7, dyH(0, z), z]} rotY={0.05} scale={0.95} pose={walk(f * 0.4 + i, 1, true)} look={{ ...hiker(i), backpack: undefined }} />;
        })}
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([-2.4, 2.8, -5.5], [-1.6, 2.4, -3.8], [0.6, 0.4, 6], [1, 0, 11], { entry: false, x: { tentSlit: true, flee: true, prints: true }, ov: [chip("-30°C", "minus", { bg: "#1a3a5a", until: "andar" }), stamp("ANDAR SE FAADA!", "andar", { size: 80 })] }),
  date: sh([30, 34, 70], [22, 26, 56], [0, 10, -60], [0, 10, -60], { x: { day: true, tent: true }, ov: [date("1959", "FEB"), tag("URAL PAHAAD, RUSSIA", "ural", { size: 50 })] }),
  team: sh([10, 3, 10], [8, 3, 4], [0, 1.5, 0], [0, 2, -8], { x: { day: true, team: true }, ov: [tag("IGOR DYATLOV + 8", "dyatlov", { size: 52, until: "wapas" }), stamp("KOI WAPAS NAHI LAUTA", "wapas", { size: 62 })] }),
  tent: sh([4.4, 1.8, 4.4], [3.6, 1.6, 3.6], [-0.6, 0.6, 0.4], [-0.6, 0.6, 0.4], { x: { day: true, tentSlit: true, rescue: true }, ov: [stamp("ANDAR SE KATA!", "kata", { size: 84 }), chip("SAAMAAN WAHIN PADA", "saamaan", { y: 840 })] }),
  bodies: sh([0, -5.4, 37.5], [1, -5.6, 35.5], [5, -7.3, 30.6], [5, -7.4, 30.6], { x: { cedar: true, prints: true }, ov: [chip("GEHRI CHOTEIN", "gehri", { bg: "#5a1010", until: "thand" }), stamp("THAND SE MAUT", "thand", { size: 84 })] }),
  theories: sh([0, 2, 12], [0, 2.4, 10], [0, 8, -30], [0, 9, -30], { x: { ufoAt: "alien", rocketAt: "hathiyaar", yetiAt: "yeti" }, ov: [chip("ALIEN?", "alien", { until: "hathiyaar" }), chip("SECRET HATHIYAAR?", "hathiyaar", { until: "yeti" }), stamp("YETI?!", "yeti", { size: 110 })] }),
  science: sh([14, 4, 4], [12, 4, 2], [0, 2, -4], [0, 2, -4], { x: { day: true, tent: true, slabOutline: true }, ov: [date("2021"), chip("SWISS MODEL", "swiss", { bg: "#1b5e20", until: "avalanche" }), stamp("CHHOTA AVALANCHE", "avalanche", { size: 70 })] }),
  slab: sh([9, 3, 7], [8, 2.6, 6], [0, 1, -2], [0, 1, 2], { x: { tentSlit: true, slabAt: "parat", runAt: "ghabrakar" }, flash: "parat", ov: [stamp("BARF KI PARAT!", "parat", { size: 76, until: "ghabrakar" }), chip("GHABRAKAR BAHAR", "ghabrakar", { until: "jaanleva" }), stamp("JAANLEVA THAND", "jaanleva", { size: 72 })] }),
  unknown: sh([0, 3, 20], [0, 4, 22], [0, 12, -60], [0, 14, -60], { x: { tent: true }, ov: [stamp("PURA SACH: ANJAAN", "poora", { size: 70 })] }),
  cta: sh([5, 2, 8], [4, 2.4, 10], [0, 1, 0], [0, 1.4, 0], { x: { tentSlit: true }, ov: [cta("AVALANCHE", "KUCH AUR")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "dyatlov-pass/mix.m4a", line1: "-30° MEIN TENT", line2: "KYUN FAADA?", nudge: "bodies" });
export const DyatlovPass = short.Ep;
export const dyatlovFrames = short.total;
