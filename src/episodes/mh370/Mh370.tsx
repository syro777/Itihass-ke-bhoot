import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { BP, Bean } from "../../components/three/Bean";
import { Palm } from "../../components/three/Props3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { Clouds, rand, SkyDome, softTexture, Stars, textTexture } from "../../components/three/World";
import { lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/mh370.timeline.json";
import { DayLights, Moon, Sea } from "../bhootiya-5/Worlds";

/** Generic twin-engine wide-body airliner, nose +x. */
const Jet: React.FC<{ position: V3; rot?: V3; s?: number; lights?: boolean; fade?: number }> = ({ position, rot = [0, 0, 0], s = 1, lights = true, fade = 1 }) => {
  const f = useCurrentFrame();
  const op = fade;
  const mat = (c: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => <meshStandardMaterial color={c} metalness={0.3} roughness={0.4} transparent={op < 1} opacity={op} {...extra} />;
  return (
    <group position={position} rotation={rot} scale={s}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.62, 7.6, 8, 16]} />
        {mat("#f4f4f6")}
      </mesh>
      <mesh position={[0.3, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.63, 0.63, 6.4, 16, 1, true, -0.25, 0.5]} />
        {mat("#1a2a6a")}
      </mesh>
      <mesh position={[0.3, -0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.632, 0.632, 6.6, 16, 1, true, Math.PI - 0.3, 0.6]} />
        {mat("#c8102e")}
      </mesh>
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <mesh position={[0.1, -0.25, sd * 2.6]} rotation={[0, sd * 0.45, 0]} castShadow>
            <boxGeometry args={[1.7, 0.12, 4.8]} />
            {mat("#e8e8ec")}
          </mesh>
          <mesh position={[0.9, -0.6, sd * 1.9]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.36, 0.32, 1.4, 14]} />
            {mat("#d8d8dc")}
          </mesh>
          <mesh position={[-3.6, 0.2, sd * 1.0]} rotation={[0, sd * 0.5, 0]}>
            <boxGeometry args={[0.8, 0.08, 1.8]} />
            {mat("#e8e8ec")}
          </mesh>
          {lights && (
            <mesh position={[-0.9, -0.25, sd * 4.9]}>
              <sphereGeometry args={[0.1, 8, 6]} />
              <meshBasicMaterial color={sd > 0 ? "#30ff60" : "#ff2020"} toneMapped={false} transparent opacity={op} />
            </mesh>
          )}
        </group>
      ))}
      <mesh position={[-3.7, 1.0, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[1.3, 1.9, 0.1]} />
        {mat("#1a2a6a")}
      </mesh>
      {new Array(14).fill(0).map((_, i) => (
        <mesh key={i} position={[2.8 - i * 0.42, 0.22, 0.6]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.16, 0.14]} />
          <meshBasicMaterial color={lights ? "#ffe8a0" : "#20242c"} toneMapped={false} transparent opacity={op} />
        </mesh>
      ))}
      {lights && f % 30 < 3 && (
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.14, 8, 6]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

/** Night sky above the clouds. */
const Sky: React.FC<{ x: WP["x"]; f: number; t: number; ramp: WP["ramp"]; after: WP["after"] }> = ({ x, f, t, ramp, after }) => {
  const tex = softTexture();
  const fade = 1 - ramp(x.vanishAt, 24);
  const radio = after(x.radioAt);
  const px = lerp(-6, 6, t);
  return (
    <>
      <fog attach="fog" args={["#0a1020", 40, 220]} />
      <SkyDome top="#02040c" horizon="#16203a" />
      <Stars />
      <Moon position={[-40, 30, -120]} size={22} />
      <ambientLight intensity={0.6} color="#8aa0ff" />
      <hemisphereLight args={["#9ab0ff", "#1a2030", 0.8]} />
      <directionalLight position={[-40, 30, -60]} intensity={0.9} color="#c8d8ff" />
      <directionalLight position={[10, 20, 30]} intensity={0.8} color="#d8e0ff" />
      <Clouds y={-6} count={26} spread={160} opacity={0.75} color="#3a4a6a" scale={1.6} />
      <Clouds y={-14} count={20} spread={200} opacity={0.6} color="#2a3450" scale={2} seed={7} />
      {x.plane !== false && fade > 0.01 && <Jet position={[px, Math.sin(f / 30) * 0.3, 0]} rot={[0.03, 0, Math.sin(f / 40) * 0.03]} s={1.2} lights={x.ghost !== true} fade={x.ghost === true ? 0.35 : fade} />}
      {radio &&
        [0, 1, 2].map((i) => {
          const q = ((f * 0.03 + i / 3) % 1);
          return (
            <mesh key={i} position={[px + 4.6, 0.4, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1 + q * 9, 1 + q * 9, 1]}>
              <ringGeometry args={[0.95, 1, 48]} />
              <meshBasicMaterial color="#7affc0" transparent opacity={0.7 * (1 - q)} side={THREE.DoubleSide} toneMapped={false} />
            </mesh>
          );
        })}
      {fade < 1 && fade > 0 && (
        <sprite position={[px, 0, 0]} scale={[14, 8, 1]}>
          <spriteMaterial map={tex} color="#8aa0c0" transparent opacity={0.6 * (1 - fade)} depthWrite={false} />
        </sprite>
      )}
    </>
  );
};

/* ------------------------------- map table ------------------------------- */
// x = lon - 100, z = -lat (north is -z)
const P = (lon: number, lat: number, y = 0): V3 => [lon - 100, y, -lat];
const LAND: Record<string, [number, number][]> = {
  malay: [[98.3, 12], [99.6, 12], [100.0, 10.5], [99.5, 9.3], [100.3, 8.3], [101.0, 6.9], [102.1, 6.2], [103.4, 4.8], [103.5, 2.7], [104.3, 1.4], [103.5, 1.3], [102.3, 2.2], [101.3, 2.9], [100.6, 4.2], [100.3, 5.4], [99.8, 6.6], [98.6, 7.9], [98.3, 9.5]],
  indochina: [[99.6, 12], [100.5, 13.5], [102.3, 12.2], [103, 10.6], [104.8, 8.6], [106.8, 10.4], [109.2, 11.6], [109.3, 15], [107, 17.5], [105.5, 19.5], [107.8, 21.5], [108.5, 24], [98, 24], [97.5, 16], [98.6, 13]],
  sumatra: [[95.3, 5.6], [97.5, 5.2], [100.4, 2.3], [103.7, -1.0], [106.0, -3.2], [105.8, -5.9], [104.5, -5.9], [102.3, -4.0], [100.4, -1.3], [98.6, 1.7], [95.9, 3.8]],
  java: [[105.2, -6.8], [106.5, -6], [108.3, -6.2], [110.4, -6.9], [112.6, -6.9], [114.5, -7.8], [114.4, -8.7], [111, -8.2], [108.5, -7.7], [106.4, -7.4]],
  borneo: [[109, 1.8], [110, 1.7], [111.5, 2.5], [113, 3.2], [115, 4.9], [117, 7], [119, 5.4], [118, 1], [116, -3.9], [114, -3.5], [111, -3], [110, -1.5], [109, 0]],
  australia: [[113, -22], [114, -21.8], [116.7, -20.6], [121, -19.5], [125, -14.5], [129, -15], [130, -12], [136, -12], [140, -17], [142, -10.7], [146, -19], [153, -25], [153, -28], [150, -37], [147, -38.5], [141, -38], [138, -35], [135.5, -34.6], [131, -31.5], [124, -33.9], [117, -35], [115, -34.3], [115.7, -31.6], [114.6, -28.7], [113.5, -26.5]],
  srilanka: [[79.8, 9.8], [81.9, 7.4], [81.4, 6.2], [80.1, 6.0], [79.8, 8.0]],
  india: [[72.8, 19], [74.5, 14], [76.5, 8.5], [77.6, 8.1], [80.3, 13.2], [80.2, 15.8], [82.4, 17], [86.9, 21.5], [88.5, 22], [90, 22.5], [89, 26], [70, 26], [70, 21]],
};
const ROUTE: [number, number][] = [
  [101.7, 3.1],
  [103.6, 6.9],
  [101.2, 6.2],
  [100.3, 5.4],
  [98.5, 6.2],
  [96.5, 6.8],
  [95.0, 4.5],
  [94.0, -5],
  [93.3, -18],
  [93.0, -35.0],
];
const SAT: [number, number] = [64.5, 0];

const Land: React.FC<{ pts: [number, number][]; color: string }> = ({ pts, color }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape(pts.map(([lo, la]) => new THREE.Vector2(lo - 100, la)));
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [pts]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
};

const Tube: React.FC<{ pts: V3[]; r: number; color: string; dashed?: boolean; glow?: boolean }> = ({ pts, r, color, glow }) => {
  const geo = useMemo(() => {
    if (pts.length < 2) return null;
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i]), new THREE.Vector3(...pts[i + 1])));
    return new THREE.TubeGeometry(path, Math.max(8, pts.length * 8), r, 6, false);
  }, [pts, r]);
  React.useEffect(() => () => geo?.dispose(), [geo]);
  if (!geo) return null;
  return (
    <mesh geometry={geo}>
      {glow ? <meshBasicMaterial color={color} toneMapped={false} /> : <meshStandardMaterial color={color} />}
    </mesh>
  );
};

/** Polyline cut at fraction k of its length. */
const cut = (pts: V3[], k: number): V3[] => {
  if (k <= 0) return [];
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[2] - pts[i][2]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * Math.min(1, k);
  const out: V3[] = [pts[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) {
      out.push(pts[i + 1]);
      left -= seg[i];
    } else {
      const u = left / seg[i];
      out.push([lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u), lerp(pts[i][2], pts[i + 1][2], u)]);
      break;
    }
  }
  return out;
};

const Label: React.FC<{ at: V3; text: string; size?: number; color?: string }> = ({ at, text, size = 1, color = "#ffffff" }) => {
  const tex = useMemo(() => textTexture([{ text, size: 90, color }], 1024, 160), [text, color]);
  return (
    <mesh position={[at[0], 0.6, at[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[6.4 * size, 1.0 * size]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

const MapTable: React.FC<{ x: WP["x"]; f: number; t: number; ramp: WP["ramp"]; after: WP["after"] }> = ({ x, f, t, ramp, after }) => {
  const route = useMemo(() => ROUTE.map(([lo, la]) => P(lo, la, 0.45)), []);
  const planned = useMemo(() => [P(101.7, 3.1, 0.42), P(103.6, 6.9, 0.42), P(108, 14, 0.42), P(112, 22, 0.42)], []);
  // how much of the real route to show (0..1 of full length), per scene
  const from = (x.routeFrom as number) ?? 0;
  const to = (x.routeTo as number) ?? 0;
  const k = lerp(from, to, Math.min(1, t * 1.15));
  const shown = cut(route, k);
  const head = shown[shown.length - 1] ?? route[0];
  const prev = shown[shown.length - 2] ?? route[0];
  const ang = Math.atan2(-(head[2] - prev[2]), head[0] - prev[0]);
  const blipOff = ramp(x.offAt, 6);
  const arcs = after(x.arcsAt) ? ramp(x.arcsAt, 40) : x.arcs === true ? 1 : 0;
  const zones = x.zones === true ? 1 : ramp(x.zonesAt, 20);
  const arcGeo = useMemo(
    () =>
      [36, 38, 39.5, 41, 42.5, 44, 45.2].map((rad) => {
        const pts: V3[] = [];
        for (let a = -0.35; a <= 1.1; a += 0.03) pts.push([SAT[0] - 100 + Math.cos(a) * rad, 0.4, -SAT[1] + Math.sin(a) * rad]);
        return pts;
      }),
    [],
  );
  const pulse = 0.5 + 0.5 * Math.sin(f / 4);
  return (
    <>
      <color attach="background" args={["#020610"]} />
      <ambientLight intensity={0.8} color="#c8d8ff" />
      <directionalLight position={[10, 40, 20]} intensity={0.9} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 10]} receiveShadow>
        <planeGeometry args={[200, 160]} />
        <meshStandardMaterial color="#0e2a4a" roughness={0.9} />
      </mesh>
      {new Array(21).fill(0).map((_, i) => (
        <group key={i}>
          <mesh position={[-100 + i * 10, 0.02, 10]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.06, 160]} />
            <meshBasicMaterial color="#1e4a78" />
          </mesh>
          <mesh position={[0, 0.02, -70 + i * 8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[200, 0.06]} />
            <meshBasicMaterial color="#1e4a78" />
          </mesh>
        </group>
      ))}
      {Object.entries(LAND).map(([k2, pts]) => (
        <Land key={k2} pts={pts} color={k2 === "malay" ? "#8aa860" : "#6a8a50"} />
      ))}
      <Label at={P(103.5, 15.5)} text="BEIJING ↑" size={0.9} color="#ffd84d" />
      <Label at={P(100.5, 1.5)} text="KUALA LUMPUR" size={0.75} />
      <Label at={P(84, -12)} text="HIND MAHASAGAR" size={2.4} color="#8ac8ff" />
      <Label at={P(128, -26)} text="AUSTRALIA" size={2} color="#e8f0d0" />
      {x.planned === true && <Tube pts={cut(planned, Math.min(1, t * 1.3))} r={0.09} color="#ffd84d" glow />}
      {shown.length > 1 && <Tube pts={shown} r={x.thick === true ? 0.35 : 0.13} color="#ff3040" glow />}
      {blipOff < 1 && (
        <group position={[head[0], 0.8, head[2]]} rotation={[0, ang, 0]} scale={x.thick === true ? 2.4 : 1}>
          <mesh>
            <boxGeometry args={[1.0, 0.12, 0.22]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={1 - blipOff} />
          </mesh>
          <mesh position={[0.05, 0, 0]}>
            <boxGeometry args={[0.24, 0.1, 1.0]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={1 - blipOff} />
          </mesh>
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 0.95 + pulse * 0.4, 32]} />
            <meshBasicMaterial color="#ff3040" transparent opacity={0.6 * (1 - blipOff)} toneMapped={false} />
          </mesh>
        </group>
      )}
      {blipOff > 0 && (
        <group position={[route[1][0], 0.8, route[1][2]]} scale={x.thick === true ? 2.4 : 1}>
          {[0.6, -0.6].map((r) => (
            <mesh key={r} rotation={[-Math.PI / 2, 0, r]}>
              <planeGeometry args={[2.4 * blipOff, 0.28]} />
              <meshBasicMaterial color="#ff2030" toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
      {arcs > 0 && (
        <>
          {arcGeo.map((pts, i) => (
            <Tube key={i} pts={cut(pts, Math.min(1, arcs * 1.4 - i * 0.06))} r={i === 6 ? 0.35 : 0.18} color={i === 6 ? "#7affc0" : "#3ac8a0"} glow />
          ))}
          <group position={[SAT[0] - 100, 8, -SAT[1]]}>
            <mesh>
              <boxGeometry args={[1.6, 1.6, 1.6]} />
              <meshStandardMaterial color="#c8c8d0" metalness={0.7} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 3, 0, 0]}>
                <boxGeometry args={[4, 0.1, 1.8]} />
                <meshStandardMaterial color="#2a4aa8" metalness={0.5} />
              </mesh>
            ))}
          </group>
          <Label at={P(64.5, 5)} text="INMARSAT" size={1.6} color="#7affc0" />
        </>
      )}
      {zones > 0 &&
        [
          [93.5, -33.5, 0.5],
          [95, -30.5, 0.6],
          [91.8, -36.4, 0.45],
        ].map(([lo, la, r], i) => (
          <mesh key={i} position={[lo - 100, 0.5, la * -1]} rotation={[-Math.PI / 2, 0, r]}>
            <planeGeometry args={[4.8 * zones, 2.6 * zones]} />
            <meshBasicMaterial color={i === 0 ? "#ff3040" : "#ff9a30"} transparent opacity={0.45 + 0.25 * pulse} toneMapped={false} />
          </mesh>
        ))}
    </>
  );
};

/** Reunion beach with the flaperon. */
const Beach: React.FC<{ f: number }> = ({ f }) => (
  <>
    <fog attach="fog" args={["#cfe4f0", 60, 300]} />
    <SkyDome top="#3d7fd0" horizon="#d8ecf4" />
    <DayLights warm={false} sun={[40, 50, 30]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial color="#2a7aa0" roughness={0.4} metalness={0.2} />
    </mesh>
    <Sea color="#2a8ab0" />
    <mesh position={[0, 0, 30]} receiveShadow>
      <boxGeometry args={[200, 0.6, 60]} />
      <meshStandardMaterial color="#e0cfa0" roughness={1} />
    </mesh>
    <mesh position={[0, 0.32, 2 + Math.sin(f / 18) * 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 0.8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
    </mesh>
    {[
      [-60, -140, 40],
      [10, -180, 55],
      [70, -150, 35],
    ].map(([x, z, h], i) => (
      <mesh key={i} position={[x, h / 2 - 2, z]}>
        <coneGeometry args={[h * 1.1, h, 7]} />
        <meshStandardMaterial color="#3a6a3a" roughness={1} flatShading />
      </mesh>
    ))}
    {[-14, -8, 9, 15].map((x, i) => (
      <Palm key={i} position={[x, 0.3, 14 + (i % 2) * 3]} scale={1.5} seed={i} />
    ))}
    {/* flaperon */}
    <group position={[0.5, 0.42, 6]} rotation={[0.05, 0.5, 0.08]}>
      <mesh castShadow>
        <boxGeometry args={[3.4, 0.22, 1.2]} />
        <meshStandardMaterial color="#e4e4e0" roughness={0.6} />
      </mesh>
      <mesh position={[1.75, 0, 0]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.4, 0.22, 1.1]} />
        <meshStandardMaterial color="#d8d8d4" />
      </mesh>
      {new Array(18).fill(0).map((_, i) => (
        <mesh key={i} position={[-1.5 + rand(i, 5) * 3, 0.12, -0.5 + rand(i + 1, 5)]}>
          <sphereGeometry args={[0.06 + rand(i + 2, 5) * 0.05, 6, 4]} />
          <meshStandardMaterial color="#3a3a2a" />
        </mesh>
      ))}
    </group>
    <Bean position={[-2.8, 0.3, 4.6]} rotY={0.9} scale={1.05} pose={BP.point} look={{ body: "#f0a020", legs: "#2a4a6a", hat: "cap", hatColor: "#1a6a9a", skin: "#8a5a3a" }} />
  </>
);

/** Deep-sea search: autonomous sub with sonar fan over the seabed. */
const Deep: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const tex = softTexture();
  const bed = useMemo(() => {
    const g = new THREE.PlaneGeometry(160, 160, 80, 80);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const X = p.getX(i);
      const Z = p.getZ(i);
      p.setY(i, Math.sin(X * 0.08) * 1.6 + Math.cos(Z * 0.07) * 1.4 + Math.sin((X + Z) * 0.21) * 0.5);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const ax = lerp(-10, 10, t);
  const sweep = Math.sin(f / 10) * 0.5;
  return (
    <>
      <color attach="background" args={["#010812"]} />
      <fog attach="fog" args={["#06224a", 14, 80]} />
      <ambientLight intensity={1.1} color="#4a7ac8" />
      <hemisphereLight args={["#6aa0ff", "#0a1a2a", 0.8]} />
      <directionalLight position={[0, 30, 10]} intensity={0.4} color="#6aa0ff" />
      <mesh geometry={bed} position={[0, -6, 0]} receiveShadow>
        <meshStandardMaterial color="#5a6a78" roughness={1} flatShading />
      </mesh>
      <group position={[ax, 2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.45, 3.4, 8, 14]} />
          <meshStandardMaterial color="#f0c020" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[-2.2, 0, 0]}>
          <boxGeometry args={[0.4, 1.2, 0.08]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[2.15, 0, 0]}>
          <sphereGeometry args={[0.16, 8, 6]} />
          <meshBasicMaterial color="#e8f6ff" toneMapped={false} />
        </mesh>
        <pointLight position={[2.6, 0, 0]} color="#c8e8ff" intensity={30} distance={18} />
        <group rotation={[0, 0, sweep * 0.2]}>
          <mesh position={[0, -4, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[6, 8, 3, 1, true]} />
            <meshBasicMaterial color="#40ffb0" transparent opacity={0.12 + 0.05 * Math.sin(f / 3)} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <mesh position={[ax - 4, -5.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 14]} />
        <meshBasicMaterial color="#40ffb0" transparent opacity={0.12} depthWrite={false} toneMapped={false} />
      </mesh>
      {new Array(40).fill(0).map((_, i) => (
        <sprite key={i} position={[(rand(i, 3) - 0.5) * 40, ((rand(i + 1, 3) * 20 + f * 0.02) % 20) - 6, (rand(i + 2, 3) - 0.5) * 30]} scale={[0.15, 0.15, 1]}>
          <spriteMaterial map={tex} color="#9ac8ff" transparent opacity={0.5} depthWrite={false} />
        </sprite>
      ))}
    </>
  );
};

const World: React.FC<WP> = ({ f, t, x, ramp, after }) => {
  if (x.set === "map") return <MapTable x={x} f={f} t={t} ramp={ramp} after={after} />;
  if (x.set === "beach") return <Beach f={f} />;
  if (x.set === "deep") return <Deep f={f} t={t} />;
  return <Sky x={x} f={f} t={t} ramp={ramp} after={after} />;
};

// map camera helper: centre (lon, lat), height h, slight tilt
const M = (lon: number, lat: number, h: number): [V3, V3] => [
  [lon - 100, h, -lat + h * 0.22],
  [lon - 100, 0, -lat],
];
const mapShot = (a: [number, number, number], b: [number, number, number], rest = {}) => {
  const A = M(...a);
  const B = M(...b);
  return sh(A[0], B[0], A[1], B[1], rest);
};

export const SCENES = makeScenes(World, {
  hook: sh([-5, 3.8, 22], [4, 3.2, 19], [-6, 0, 0], [6, 0, 0], { entry: false, fov: 55, exp: 1.5, x: { vanishAt: "gaayab" }, flash: "gaayab", ov: [stamp("239 LOG!", "239", { size: 110, until: "gaayab" }), stamp("GAAYAB!", "gaayab", { size: 110, until: "baarah" }), chip("12 SAAL SE LAPATA", "baarah", { bg: "#5a1010" })] }),
  flight: mapShot([102, 6, 26], [103, 8, 22], { x: { set: "map", planned: true, routeFrom: 0, routeTo: 0.078 }, ov: [date("8 MAR", "2014", "2014"), tag("MH370: KUALA LUMPUR → BEIJING", "kuala_lumpur", { size: 38 })] }),
  goodnight: sh([4, 5, 21], [11, 4, 17], [-6, 0.3, 0], [6, 0.3, 0], { exp: 1.5, x: { radioAt: "aakhiri" }, ov: [chip("RAAT 1:19 BAJE", "chaalis", { bg: "#1a2a4a", until: "good" }), stamp("\"GOOD NIGHT...\"", "good", { size: 80 })] }),
  dark: mapShot([103, 6.5, 18], [103.3, 6.8, 15], { x: { set: "map", routeFrom: 0.078, routeTo: 0.078, offAt: "gaayab" }, ov: [stamp("TRANSPONDER OFF!", "transponder", { size: 78, until: "gaayab" }), stamp("RADAR SE GAAYAB!", "gaayab", { size: 78 })] }),
  turn: mapShot([100.5, 6, 22], [99.5, 6, 24], { x: { set: "map", routeFrom: 0.078, routeTo: 0.221 }, ov: [chip("MILITARY RADAR", "military", { bg: "#1a3a1a", until: "muda" }), stamp("U-TURN!", "muda", { size: 110 })] }),
  satellite: mapShot([92, 0, 70], [88, -12, 96], { x: { set: "map", routeFrom: 0.221, routeTo: 1, arcsAt: "satellite", thick: true }, ov: [chip("SATELLITE 'HANDSHAKES'", "satellite", { bg: "#0a3a2a", until: "saat" }), stamp("~7 GHANTE UDAAN!", "saat", { size: 80 })] }),
  debris: sh([6, 3.4, 15], [4, 2.5, 11.5], [0, 0.6, 5.5], [0, 0.5, 5.5], { x: { set: "beach" }, ov: [date("2015", "SAN", "2015"), tag("REUNION DWEEP", "dweep", { size: 54, until: "pankh" }), stamp("PANKH KA TUKDA!", "pankh", { size: 80 })] }),
  search: sh([-14, 1, 13], [8, 0.5, 13], [-9, -1, 0], [11, -1.5, 0], { exp: 1.5, x: { set: "deep" }, ov: [chip("1,20,000+ KM² SEABED", "laakh", { bg: "#0a2a4a", until: "nahi" }), stamp("PHIR BHI NAHI MILA", "nahi", { size: 76 })] }),
  today: mapShot([94, -30, 40], [93.5, -33, 28], { x: { set: "map", routeFrom: 1, routeTo: 1, arcs: true, zonesAt: "shart", thick: true }, ov: [date("2026", "SAN", "2026"), chip("NO FIND, NO FEE", "shart", { bg: "#1a1a1a", until: "saat" }), stamp("$70 MILLION!", "saat", { size: 100, color: "#1b8a3a" })] }),
  cta: sh([0, 4, 24], [2, 3.5, 20], [0, 0, 0], [6, 0, 0], { x: { ghost: true }, ov: [cta("HAADSA", "RAAZ")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "mh370/mix.m4a", line1: "12 SAAL SE GAAYAB", line2: "MH370 KAHAN HAI?", nudge: "turn" });
export const Mh370 = short.Ep;
export const mh370Frames = short.total;
