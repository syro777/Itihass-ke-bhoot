/* Thar-desert kit: dunes, a Rajasthani temple, artillery shells, guns, sandbags, a victory pillar,
 * a border fence and a museum display case. All frame-driven (no useFrame). */
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { fbm, rand, softTexture, textTexture } from "./World";

type V3 = [number, number, number];

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------------- dunes ---------------- */
export const FENCE_Z = -90;
/** Dune height: flat around the origin (temple site) and along the border-fence strip. */
export const duneH = (x: number, z: number, flatR = 22) => {
  const r = Math.hypot(x, z);
  const warp = fbm(x * 0.006, z * 0.006, 3, 17) * 6;
  const ridge = 1 - Math.abs(Math.sin(x * 0.028 + z * 0.011 + warp));
  const dunes = Math.pow(ridge, 1.6) * 9 + fbm(x * 0.01, z * 0.01, 4, 23) * 14;
  return smooth(flatR, flatR + 45, r) * smooth(4, 26, Math.abs(z - FENCE_Z)) * dunes;
};

export const DesertTerrain: React.FC<{ size?: number; seg?: number; night?: boolean }> = ({ size = 700, seg = 150, night = false }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, duneH(pos.getX(i), pos.getZ(i)));
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    const p = ng.attributes.position as THREE.BufferAttribute;
    const n = ng.attributes.normal as THREE.BufferAttribute;
    const cols = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i += 3) {
      const nx = (n.getX(i) + n.getX(i + 1) + n.getX(i + 2)) / 3;
      const ny = (n.getY(i) + n.getY(i + 1) + n.getY(i + 2)) / 3;
      const x = p.getX(i);
      const z = p.getZ(i);
      const patch = fbm(x * 0.04, z * 0.04, 3, 9);
      if (ny < 0.8) c.set(nx > 0 ? "#c98f55" : "#d9a465");
      else c.set(patch > 0.55 ? "#efcd94" : "#e4ba7c");
      c.offsetHSL(0, 0, (rand(i, 4) - 0.5) * 0.04);
      for (let k = 0; k < 3; k++) {
        cols[(i + k) * 3] = c.r;
        cols[(i + k) * 3 + 1] = c.g;
        cols[(i + k) * 3 + 2] = c.b;
      }
    }
    ng.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return ng;
  }, [size, seg]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={1} color={night ? "#b9a9c8" : "#ffffff"} />
    </mesh>
  );
};

/** Desert scrub (khejri-like low trees and bushes) scattered on the dunes. */
export const Scrub: React.FC<{ count?: number; seed?: number; rMin?: number; rMax?: number }> = ({ count = 26, seed = 3, rMin = 26, rMax = 160 }) => {
  const items = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const a = rand(i, seed) * Math.PI * 2;
        const r = rMin + rand(i + 9, seed) * (rMax - rMin);
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        return { x, z, y: duneH(x, z), s: 0.7 + rand(i + 3, seed) * 1.2, tree: rand(i + 5, seed) > 0.6 };
      }),
    [count, seed, rMin, rMax],
  );
  return (
    <group>
      {items.map((b, i) => (
        <group key={i} position={[b.x, b.y, b.z]} scale={b.s}>
          {b.tree && (
            <mesh position={[0, 1.2, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.2, 2.4, 6]} />
              <meshStandardMaterial color="#6b4e32" roughness={1} />
            </mesh>
          )}
          <mesh position={[0, b.tree ? 2.7 : 0.4, 0]} scale={b.tree ? [1.8, 0.8, 1.8] : [1, 0.6, 1]} castShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#7a8a4a" flatShading roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ---------------- flags ---------------- */
const tricolourTexture = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = 300;
    c.height = 200;
    const g = c.getContext("2d")!;
    g.fillStyle = "#ff9933";
    g.fillRect(0, 0, 300, 67);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 67, 300, 66);
    g.fillStyle = "#138808";
    g.fillRect(0, 133, 300, 67);
    g.strokeStyle = "#000080";
    g.lineWidth = 4;
    g.beginPath();
    g.arc(150, 100, 26, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      g.beginPath();
      g.moveTo(150, 100);
      g.lineTo(150 + Math.cos(a) * 26, 100 + Math.sin(a) * 26);
      g.lineWidth = 1.5;
      g.stroke();
    }
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
})();

/** Waving cloth flag (vertex wave). Attached at its left edge. */
export const Flag: React.FC<{ position: V3; w?: number; h?: number; color?: string; tricolour?: boolean; rotY?: number; seed?: number }> = ({
  position,
  w = 1.8,
  h = 1.0,
  color = "#ff7a1a",
  tricolour = false,
  rotY = 0,
  seed = 0,
}) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 12, 4);
    g.translate(w / 2, 0, 0);
    return g;
  }, [w, h]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const k = x / w;
    pos.setZ(i, Math.sin(x * 3 - f * 0.35 + seed) * 0.18 * k);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} position={position} rotation={[0, rotY, 0]} castShadow>
      <meshStandardMaterial color={tricolour ? "#ffffff" : color} map={tricolour ? tricolourTexture() : null} side={THREE.DoubleSide} roughness={0.8} />
    </mesh>
  );
};

/* ---------------- temple ---------------- */
const CREAM = "#f4ecdc";
const STONE = "#e2d3b5";
const RED = "#c8462c";
const GOLD = "#e8b23a";

const Chhatri: React.FC<{ position: V3; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    {[-0.55, 0.55].map((x) =>
      [-0.55, 0.55].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.9, z]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 1.8, 6]} />
          <meshStandardMaterial color={CREAM} />
        </mesh>
      )),
    )}
    <mesh position={[0, 1.85, 0]} castShadow>
      <boxGeometry args={[1.5, 0.15, 1.5]} />
      <meshStandardMaterial color={RED} />
    </mesh>
    <mesh position={[0, 1.92, 0]} castShadow>
      <sphereGeometry args={[0.72, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={CREAM} roughness={0.7} />
    </mesh>
    <mesh position={[0, 2.75, 0]}>
      <coneGeometry args={[0.12, 0.35, 8]} />
      <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} />
    </mesh>
  </group>
);

/** Rajasthani desert temple (plinth, mandap, porch, shikhara, flag). Front faces +z. */
export const Temple: React.FC<{ position?: V3; rotY?: number; scale?: number; glow?: number; bellSwing?: number }> = ({
  position = [0, 0, 0],
  rotY = 0,
  scale = 1,
  glow = 1,
  bellSwing = 0,
}) => {
  const f = useCurrentFrame();
  const flick = 0.85 + 0.15 * Math.sin(f / 3.3) * Math.sin(f / 7.1);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {/* plinth + steps */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 1.2, 12]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.22, 0]} receiveShadow>
        <boxGeometry args={[12.2, 0.06, 12.2]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.2 + (2 - i) * 0.3 - 0.05, 6.3 + i * 0.55]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.3 + (2 - i) * 0.6, 0.55]} />
          <meshStandardMaterial color={STONE} />
        </mesh>
      ))}
      {/* mandap */}
      <mesh position={[0, 3.3, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[7, 4.2, 7]} />
        <meshStandardMaterial color={CREAM} roughness={0.85} />
      </mesh>
      <mesh position={[0, 5.65, -0.5]} castShadow>
        <boxGeometry args={[7.6, 0.5, 7.6]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      <mesh position={[0, 6.05, -0.5]} castShadow>
        <boxGeometry args={[6.6, 0.3, 6.6]} />
        <meshStandardMaterial color={CREAM} />
      </mesh>
      {/* door glow */}
      <mesh position={[0, 2.7, 3.01]}>
        <planeGeometry args={[1.9, 2.9]} />
        <meshStandardMaterial color="#ffcf8a" emissive="#ffa23a" emissiveIntensity={1.4 * glow * flick} />
      </mesh>
      <mesh position={[0, 4.35, 3.02]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.95, 0.12, 6, 16, Math.PI]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      {/* porch */}
      {[-3.1, -1.4, 1.4, 3.1].map((x) => (
        <mesh key={x} position={[x, 3.0, 4.6]} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 3.6, 8]} />
          <meshStandardMaterial color={CREAM} />
        </mesh>
      ))}
      <mesh position={[0, 4.95, 4.0]} castShadow>
        <boxGeometry args={[7.6, 0.35, 2.4]} />
        <meshStandardMaterial color={CREAM} />
      </mesh>
      <mesh position={[0, 5.2, 4.0]} castShadow>
        <boxGeometry args={[7.8, 0.18, 2.6]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      {/* bell */}
      <group position={[1.6, 4.75, 4.6]} rotation={[bellSwing, 0, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 4]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <mesh position={[0, -0.75, 0]} castShadow>
          <coneGeometry args={[0.28, 0.45, 12, 1, true]} />
          <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* shikhara */}
      <mesh position={[0, 9.45, -0.5]} castShadow>
        <cylinderGeometry args={[0.8, 3.0, 6.5, 8]} />
        <meshStandardMaterial color="#f1e4cc" roughness={0.8} flatShading />
      </mesh>
      {[0.25, 0.5, 0.75].map((k) => (
        <mesh key={k} position={[0, 6.2 + k * 6.5, -0.5]}>
          <cylinderGeometry args={[3.0 - k * 2.2 + 0.05, 3.0 - k * 2.2 + 0.12, 0.22, 8]} />
          <meshStandardMaterial color={RED} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 12.9, -0.5]} castShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.45, 16]} />
        <meshStandardMaterial color="#e8d8b8" />
      </mesh>
      <mesh position={[0, 13.45, -0.5]}>
        <sphereGeometry args={[0.38, 14, 10]} />
        <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 13.95, -0.5]}>
        <coneGeometry args={[0.16, 0.6, 10]} />
        <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 15.0, -0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 2.6, 6]} />
        <meshStandardMaterial color="#8a6a3a" />
      </mesh>
      <Flag position={[0.04, 15.8, -0.5]} w={2.0} h={1.1} color="#ff6a00" seed={1.3} />
      {/* corner chhatris */}
      {[-4.9, 4.9].map((x) => [-4.9, 4.9].map((z) => <Chhatri key={`${x}${z}`} position={[x, 1.2, z]} s={1} />))}
      <pointLight position={[0, 3, 5.5]} color="#ffb060" intensity={26 * glow * flick} distance={16} decay={1.6} />
    </group>
  );
};

/* ---------------- shells ---------------- */
const SHELL_LEN = 1.45;
/** Artillery shell, axis +y (base at origin, nose up). */
export const Shell: React.FC<{ position?: V3; rotation?: V3; scale?: number; color?: string }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = "#5e6644" }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0.45, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.2, 0.9, 16]} />
      <meshStandardMaterial color={color} metalness={0.45} roughness={0.45} />
    </mesh>
    <mesh position={[0, 0.14, 0]}>
      <cylinderGeometry args={[0.215, 0.215, 0.09, 16]} />
      <meshStandardMaterial color="#b0643a" metalness={0.7} roughness={0.35} />
    </mesh>
    <mesh position={[0, 1.13, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.2, 0.46, 16]} />
      <meshStandardMaterial color={color} metalness={0.45} roughness={0.45} />
    </mesh>
    <mesh position={[0, 1.4, 0]}>
      <cylinderGeometry args={[0.03, 0.07, 0.1, 10]} />
      <meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.3} />
    </mesh>
  </group>
);

const UP = new THREE.Vector3(0, 1, 0);
const eulerAlong = (d: THREE.Vector3): V3 => {
  const q = new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
};

export type Drop = { from: V3; to: V3; land: number; dur: number; arc?: number; s?: number };

/** Shells flying in (with tracer), landing nose-first in the sand with a dust puff — and not exploding.
 * With `topple`, a landed shell tips over and lies in the sand (reads clearly as an unexploded shell). */
export const ShellRain: React.FC<{ drops: Drop[]; tracer?: string; dust?: string; bury?: number; topple?: boolean }> = ({
  drops,
  tracer = "#ffcf7a",
  dust = "#d9b27a",
  bury = 0.7,
  topple = true,
}) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  return (
    <group>
      {drops.map((d, i) => {
        const s = d.s ?? 1;
        const arc = d.arc ?? 6;
        const t0 = d.land - d.dur;
        if (f < t0) return null;
        const t = Math.min(1, (f - t0) / d.dur);
        const from = new THREE.Vector3(...d.from);
        const to = new THREE.Vector3(...d.to);
        const p = from.clone().lerp(to, t).add(new THREE.Vector3(0, arc * Math.sin(Math.PI * t), 0));
        const vel = to.clone().sub(from).add(new THREE.Vector3(0, arc * Math.PI * Math.cos(Math.PI * t), 0));
        const dir = vel.normalize();
        const rot = eulerAlong(dir);
        if (t < 1) {
          const base = p.clone().sub(dir.clone().multiplyScalar(SHELL_LEN * s));
          const tc = p.clone().sub(dir.clone().multiplyScalar(SHELL_LEN * s + 2.4 * s));
          const tail = p.clone().sub(dir.clone().multiplyScalar(SHELL_LEN * s + 0.4 * s));
          return (
            <group key={i}>
              <Shell position={[base.x, base.y, base.z]} rotation={rot} scale={s} />
              <mesh position={[tc.x, tc.y, tc.z]} rotation={rot}>
                <cylinderGeometry args={[0.03 * s, 0.16 * s, 4.8 * s, 6]} />
                <meshBasicMaterial color={tracer} transparent opacity={0.6} depthWrite={false} />
              </mesh>
              <sprite position={[tail.x, tail.y, tail.z]} scale={[2.2 * s, 2.2 * s, 1]}>
                <spriteMaterial map={tex} color="#ffb347" transparent opacity={0.9} depthWrite={false} />
              </sprite>
            </group>
          );
        }
        const a = Math.min(1, (f - d.land) / 26);
        const sink = bury * Math.min(1, (f - d.land) / 5);
        let base = to.clone().add(dir.clone().multiplyScalar(sink * SHELL_LEN * s - SHELL_LEN * s));
        let srot = rot;
        if (topple) {
          const k = Math.min(1, Math.max(0, (f - d.land - 3) / 9));
          const e = 1 - (1 - k) * (1 - k);
          const h = new THREE.Vector3(dir.x, 0, dir.z);
          if (h.lengthSq() < 1e-6) h.set(1, 0, 0);
          h.normalize();
          const lie = new THREE.Vector3(h.x, -0.14, h.z).normalize();
          const q0 = new THREE.Quaternion().setFromUnitVectors(UP, dir);
          const q1 = new THREE.Quaternion().setFromUnitVectors(UP, lie);
          const q = new THREE.Quaternion().slerpQuaternions(q0, q1, e);
          const eu = new THREE.Euler().setFromQuaternion(q);
          srot = [eu.x, eu.y, eu.z];
          const restCenter = new THREE.Vector3(to.x + h.x * 0.3 * s, to.y + 0.1 * s, to.z + h.z * 0.3 * s);
          const restBase = restCenter.clone().sub(lie.clone().multiplyScalar(0.72 * s));
          base = base.clone().lerp(restBase, e);
        }
        return (
          <group key={i}>
            <Shell position={[base.x, base.y, base.z]} rotation={srot} scale={s} />
            {!topple && sink > 0 && (
              <mesh position={[to.x, to.y + 0.02, to.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 0.35]}>
                <torusGeometry args={[0.42 * s, 0.12 * s, 6, 14]} />
                <meshStandardMaterial color="#c08a50" roughness={1} />
              </mesh>
            )}
            {a < 1 &&
              [0, 1, 2, 3, 4].map((k) => (
                <sprite key={k} position={[to.x + Math.cos(k * 1.7) * a * 1.4 * s, to.y + 0.4 * s + a * (1 + k * 0.3) * s, to.z + Math.sin(k * 1.7) * a * 1.4 * s]} scale={[(1.2 + a * 3.5) * s, (1.2 + a * 3.5) * s, 1]}>
                  <spriteMaterial map={tex} color={dust} transparent opacity={0.75 * (1 - a)} depthWrite={false} />
                </sprite>
              ))}
            {a < 1 &&
              new Array(10).fill(0).map((_, k) => {
                const ang = k * 0.63 + i;
                const sp = 0.06 + rand(k + i * 7, 5) * 0.08;
                const tt = (f - d.land) / 30;
                return (
                  <mesh key={`g${k}`} position={[to.x + Math.cos(ang) * sp * (f - d.land) * s, to.y + Math.max(0, (0.22 * (f - d.land) - 0.012 * (f - d.land) ** 2) * s), to.z + Math.sin(ang) * sp * (f - d.land) * s]}>
                    <sphereGeometry args={[0.07 * s * (1 - tt * 0.5), 5, 4]} />
                    <meshStandardMaterial color="#caa066" />
                  </mesh>
                );
              })}
          </group>
        );
      })}
    </group>
  );
};

/* ---------------- field gun ---------------- */
export const FieldGun: React.FC<{ position: V3; rotY?: number; fireAt?: number[]; elev?: number; scale?: number }> = ({ position, rotY = 0, fireAt = [], elev = 0.38, scale = 1 }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  const last = fireAt.filter((t) => t <= f).pop();
  const since = last === undefined ? 999 : f - last;
  const recoil = since < 12 ? 0.6 * Math.exp(-since / 3) : 0;
  const L = 3.4;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.22, 16]} />
          <meshStandardMaterial color="#2a2a24" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 1.9, 8]} />
        <meshStandardMaterial color="#3a3a32" />
      </mesh>
      <mesh position={[0, 1.25, -0.35]} castShadow>
        <boxGeometry args={[2.2, 1.2, 0.08]} />
        <meshStandardMaterial color="#4f5636" roughness={0.7} />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.45, 1.5]} rotation={[0.28, x * 0.25, 0]} castShadow>
          <boxGeometry args={[0.16, 0.16, 3.2]} />
          <meshStandardMaterial color="#4f5636" />
        </mesh>
      ))}
      <group position={[0, 1.15, 0]} rotation={[-(Math.PI / 2 - elev), 0, 0]}>
        <mesh position={[0, L / 2 - recoil - 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.17, L, 12]} />
          <meshStandardMaterial color="#3d4430" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.6 - recoil, 0]}>
          <boxGeometry args={[0.5, 0.9, 0.5]} />
          <meshStandardMaterial color="#353a2a" />
        </mesh>
        {since < 5 && (
          <group position={[0, L - 0.4, 0]}>
            <sprite scale={[4.2 - since * 0.6, 4.2 - since * 0.6, 1]}>
              <spriteMaterial map={tex} color="#ffd27a" transparent opacity={1 - since / 5} depthWrite={false} />
            </sprite>
            <pointLight color="#ffb347" intensity={120 * (1 - since / 5)} distance={30} />
          </group>
        )}
      </group>
      {fireAt.map((t) => {
        const a = (f - t) / 50;
        if (a < 0 || a > 1) return null;
        const tip = new THREE.Vector3(0, 1.15 + Math.sin(elev) * L, -Math.cos(elev) * L);
        return [0, 1, 2].map((k) => (
          <sprite key={`${t}${k}`} position={[tip.x + (k - 1) * 0.5 * a, tip.y + a * (1.5 + k * 0.8), tip.z - a * 1.5]} scale={[1.5 + a * 4, 1.5 + a * 4, 1]}>
            <spriteMaterial map={tex} color="#8a8478" transparent opacity={0.55 * (1 - a)} depthWrite={false} />
          </sprite>
        ));
      })}
    </group>
  );
};

/* ---------------- sandbags ---------------- */
export const Sandbags: React.FC<{ position: V3; rotY?: number; n?: number; rows?: number }> = ({ position, rotY = 0, n = 6, rows = 3 }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    {new Array(rows).fill(0).map((_, r) =>
      new Array(n - r).fill(0).map((__, i) => (
        <mesh key={`${r}-${i}`} position={[(i - (n - r - 1) / 2) * 0.95, 0.25 + r * 0.42, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.75]} castShadow receiveShadow>
          <capsuleGeometry args={[0.26, 0.5, 4, 8]} />
          <meshStandardMaterial color={r % 2 ? "#a88d5e" : "#b59a6a"} roughness={1} />
        </mesh>
      )),
    )}
  </group>
);

/* ---------------- victory pillar ---------------- */
export const VijayStambh: React.FC<{ position: V3; scale?: number }> = ({ position, scale = 1 }) => {
  const plaque = useMemo(() => textTexture([{ text: "VIJAY STAMBH", size: 92, color: "#3a2410" }, { text: "1971", size: 80, color: "#9a1c10" }], 1024, 300, "#e9d9b0"), []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.8, 4.2]} />
        <meshStandardMaterial color="#d8cbb0" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.8, 3.0]} />
        <meshStandardMaterial color="#cdbd9c" />
      </mesh>
      <mesh position={[0, 1.2, 1.51]}>
        <planeGeometry args={[2.7, 0.75]} />
        <meshStandardMaterial map={plaque} />
      </mesh>
      <mesh position={[0, 6.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.9, 9, 4]} />
        <meshStandardMaterial color="#f2ede2" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0, 10.75, 0]} castShadow>
        <boxGeometry args={[1.3, 0.3, 1.3]} />
        <meshStandardMaterial color="#cdbd9c" />
      </mesh>
      <mesh position={[0, 11.25, 0]}>
        <sphereGeometry args={[0.45, 14, 10]} />
        <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[2.6, 4.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 9, 6]} />
        <meshStandardMaterial color="#9a9a9a" metalness={0.6} roughness={0.3} />
      </mesh>
      <Flag position={[2.64, 8.4, 0]} w={2.4} h={1.6} tricolour seed={0.4} />
    </group>
  );
};

/* ---------------- border fence ---------------- */
export const BorderFence: React.FC<{ z?: number; from?: number; to?: number; lights?: number }> = ({ z = FENCE_Z, from = -260, to = 260, lights = 1 }) => {
  const posts = [];
  for (let x = from; x <= to; x += 7) posts.push(x);
  return (
    <group>
      {posts.map((x) => (
        <mesh key={x} position={[x, 1.8, z]} castShadow>
          <boxGeometry args={[0.18, 3.6, 0.18]} />
          <meshStandardMaterial color="#6d6a62" />
        </mesh>
      ))}
      {[0.9, 1.8, 2.7, 3.5].map((y) => (
        <mesh key={y} position={[(from + to) / 2, y, z]}>
          <boxGeometry args={[to - from, 0.05, 0.05]} />
          <meshStandardMaterial color="#9a9a96" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {posts
        .filter((_, i) => i % 6 === 0)
        .map((x) => (
          <group key={`l${x}`} position={[x, 0, z + 1.2]}>
            <mesh position={[0, 3.5, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 7, 6]} />
              <meshStandardMaterial color="#555" />
            </mesh>
            <mesh position={[0, 7.1, 0.25]}>
              <boxGeometry args={[0.7, 0.35, 0.3]} />
              <meshStandardMaterial color="#fff6d8" emissive="#fff0b0" emissiveIntensity={1.5 * lights} />
            </mesh>
          </group>
        ))}
    </group>
  );
};

/* ---------------- museum display case ---------------- */
export const DisplayCase: React.FC<{ position: V3; label?: string }> = ({ position, label = "1965 • BINA PHATE GOLE" }) => {
  const plate = useMemo(() => textTexture([{ text: label, size: 84, color: "#f6e7b8" }], 1024, 200, "#2a1a10"), [label]);
  const shells: { x: number; z: number; s: number; c: string }[] = [
    { x: -1.15, z: 0.05, s: 0.75, c: "#5e6644" },
    { x: -0.55, z: -0.2, s: 1.0, c: "#4f5a3a" },
    { x: 0.05, z: 0.1, s: 1.25, c: "#6a6248" },
    { x: 0.65, z: -0.2, s: 0.95, c: "#5a6040" },
    { x: 1.2, z: 0.05, s: 0.7, c: "#6e6a50" },
  ];
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 1.0, 1.7]} />
        <meshStandardMaterial color="#3a2414" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <boxGeometry args={[3.5, 0.06, 1.6]} />
        <meshStandardMaterial color="#7a1020" roughness={1} />
      </mesh>
      {shells.map((s, i) => (
        <Shell key={i} position={[s.x, 1.06, s.z]} scale={s.s} color={s.c} />
      ))}
      <mesh position={[0, 2.26, 0]}>
        <boxGeometry args={[3.6, 2.4, 1.7]} />
        <meshStandardMaterial color="#d8ecff" transparent opacity={0.1} roughness={0.05} metalness={0.2} depthWrite={false} />
      </mesh>
      {[-1.78, 1.78].map((x) =>
        [-0.83, 0.83].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 2.26, z]}>
            <boxGeometry args={[0.05, 2.4, 0.05]} />
            <meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.3} />
          </mesh>
        )),
      )}
      <mesh position={[0, 3.47, 0]}>
        <boxGeometry args={[3.65, 0.05, 1.75]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0.86]}>
        <planeGeometry args={[2.0, 0.4]} />
        <meshStandardMaterial map={plate} emissive="#ffffff" emissiveMap={plate} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
};

/** Flickering diya flames. */
export const Diyas: React.FC<{ points: V3[]; size?: number }> = ({ points, size = 0.45 }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  return (
    <group>
      {points.map((p, i) => {
        const fl = 0.8 + 0.2 * Math.sin(f / 2.7 + i * 1.3) * Math.sin(f / 5.3 + i);
        return (
          <group key={i} position={p}>
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.16, 0.1, 0.08, 10]} />
              <meshStandardMaterial color="#9a5a2a" />
            </mesh>
            <mesh position={[0, 0.17, 0]} scale={[1, 1.8 * fl, 1]}>
              <sphereGeometry args={[0.055, 8, 6]} />
              <meshBasicMaterial color="#ffe08a" />
            </mesh>
            <sprite position={[0, 0.2, 0]} scale={[size * fl, size * fl, 1]}>
              <spriteMaterial map={tex} color="#ffb347" transparent opacity={0.85} depthWrite={false} />
            </sprite>
          </group>
        );
      })}
    </group>
  );
};
