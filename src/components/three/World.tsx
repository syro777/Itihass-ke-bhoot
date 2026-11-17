/* Procedural low-poly 3D world for Remotion + React Three Fiber.
 * Everything is driven by useCurrentFrame() (no useFrame), so renders are deterministic.
 */
import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

/* ---------------- noise ---------------- */
const hash = (x: number, y: number, seed = 1) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const vnoise = (x: number, y: number, seed = 1) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
export const fbm = (x: number, y: number, oct = 5, seed = 1) => {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(x * f, y * f, seed + i);
    f *= 2;
    amp *= 0.5;
  }
  return s;
};
export const rand = (i: number, seed = 1) => hash(i * 1.37, i * 0.73 + 11.1, seed);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------------- terrain: lake bowl ringed by peaks ---------------- */
export const LAKE_R = 20;
/** Shoreline radius for a direction (irregular, kund-like). */
export const shoreR = (a: number) => LAKE_R + 2.6 * Math.sin(3 * a + 1.2) + 1.6 * Math.sin(5 * a + 0.4) + 1.2 * Math.cos(2 * a);
export const heightAt = (x: number, z: number) => {
  const r = Math.hypot(x, z);
  const R = shoreR(Math.atan2(z, x));
  if (r < R - 0.5) return -2.4 + Math.pow(r / R, 2) * 2.0;
  let h = smooth(R - 0.5, R + 50, r) * 30 + smooth(60, 260, r) * 150;
  h += (fbm(x * 0.018, z * 0.018, 5, 3) - 0.5) * (8 + r * 0.45);
  h += 230 * Math.exp(-((x + 30) ** 2 + (z + 300) ** 2) / (2 * 70 ** 2)); // Trishul-like massif behind
  return h;
};

export const Terrain: React.FC<{ size?: number; seg?: number; snowLine?: number }> = ({ size = 900, seg = 180, snowLine = 55 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
    }
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    const p = ng.attributes.position as THREE.BufferAttribute;
    const n = ng.attributes.normal as THREE.BufferAttribute;
    const cols = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i += 3) {
      const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      const ny = (n.getY(i) + n.getY(i + 1) + n.getY(i + 2)) / 3;
      const x = p.getX(i);
      const z = p.getZ(i);
      const patch = fbm(x * 0.05, z * 0.05, 3, 9);
      if (y > snowLine + (patch - 0.5) * 30 && ny > 0.5) c.set("#f7fafd");
      else if (ny < 0.6) c.set("#8d8794");
      else if (y < 0.6) c.set("#7b8b74");
      else c.set(patch > 0.6 ? "#eef3f8" : "#b0a28c");
      c.offsetHSL(0, 0, (rand(i, 4) - 0.5) * 0.05);
      for (let k = 0; k < 3; k++) {
        cols[(i + k) * 3] = c.r;
        cols[(i + k) * 3 + 1] = c.g;
        cols[(i + k) * 3 + 2] = c.b;
      }
    }
    ng.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return ng;
  }, [size, seg, snowLine]);
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} />
    </mesh>
  );
};

/* ---------------- lake ---------------- */
const waterTexture = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    gr.addColorStop(0, "#0f6f80");
    gr.addColorStop(0.65, "#1ea3a8");
    gr.addColorStop(1, "#8fe3d8");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
})();

export const Lake: React.FC<{ opacity?: number; ice?: boolean; tint?: string }> = ({ opacity = 0.8, ice = true, tint = "#ffffff" }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const R = shoreR(a) + 0.4;
      const x = Math.cos(a) * R;
      const y = Math.sin(a) * R;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    const g = new THREE.ShapeGeometry(shape, 1);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + p.getX(i) / 52, 0.5 + p.getY(i) / 52);
    return g;
  }, []);
  const floes = useMemo(
    () =>
      new Array(16).fill(0).map((_, i) => {
        const a = rand(i, 61) * Math.PI * 2;
        const r = shoreR(a) - 1.2 - rand(i + 4, 61) * 3;
        return { a, x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.6 + rand(i + 9, 61) * 1.6, rot: rand(i + 2, 61) * 6 };
      }).filter((fl) => Math.abs(fl.a - Math.PI / 2) > 0.6),
    [],
  );
  return (
    <group>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial map={waterTexture()} color={tint} transparent opacity={opacity} roughness={0.05} metalness={0.3} />
      </mesh>
      {ice &&
        floes.map((fl, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, fl.rot + f * 0.0006]} position={[fl.x, 0.04, fl.z]} scale={[fl.s, fl.s * 0.7, 1]}>
            <circleGeometry args={[1, 6]} />
            <meshStandardMaterial color="#f2fbff" roughness={0.4} />
          </mesh>
        ))}
    </group>
  );
};

/* ---------------- skulls & bones ---------------- */
const BONE = "#e6dcc3";
export const Skull: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({ position, rotation = [0, 0, 0], scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh castShadow position={[0, 0.55, 0]} scale={[1, 0.92, 1.12]}>
      <sphereGeometry args={[0.55, 24, 18]} />
      <meshStandardMaterial color={BONE} roughness={0.85} />
    </mesh>
    <mesh castShadow position={[0, 0.18, 0.28]} scale={[0.82, 0.62, 0.7]}>
      <sphereGeometry args={[0.5, 20, 14]} />
      <meshStandardMaterial color={BONE} roughness={0.85} />
    </mesh>
    {[-0.2, 0.2].map((x) => (
      <mesh key={x} position={[x, 0.38, 0.52]} scale={[1, 1.1, 0.6]}>
        <sphereGeometry args={[0.15, 16, 12]} />
        <meshStandardMaterial color="#1a1412" roughness={1} />
      </mesh>
    ))}
    <mesh position={[0, 0.2, 0.62]} rotation={[0.3, 0, 0]}>
      <coneGeometry args={[0.07, 0.14, 3]} />
      <meshStandardMaterial color="#1a1412" />
    </mesh>
    {[-0.15, -0.05, 0.05, 0.15].map((x) => (
      <mesh key={x} position={[x, -0.02, 0.6]}>
        <boxGeometry args={[0.07, 0.1, 0.05]} />
        <meshStandardMaterial color="#f4ecd6" />
      </mesh>
    ))}
  </group>
);

export const Bone: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; length?: number }> = ({ position, rotation = [0, 0, 0], length = 1.6 }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.09, 0.09, length, 10]} />
      <meshStandardMaterial color={BONE} roughness={0.85} />
    </mesh>
    {[-1, 1].map((s) =>
      [-0.09, 0.09].map((zz) => (
        <mesh key={`${s}${zz}`} castShadow position={[(s * length) / 2, 0, zz]}>
          <sphereGeometry args={[0.13, 12, 10]} />
          <meshStandardMaterial color={BONE} roughness={0.85} />
        </mesh>
      )),
    )}
  </group>
);

/** Deterministic scatter of skulls and bones in the lake bed and on the shore. */
export const BoneField: React.FC<{ count?: number; seed?: number; rMin?: number; rMax?: number; reveal?: number }> = ({ count = 26, seed = 5, rMin = 2, rMax = LAKE_R + 2, reveal = 1 }) => {
  const items = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const a = rand(i, seed) * Math.PI * 2;
        const r = rMin + Math.sqrt(rand(i + 50, seed)) * (rMax - rMin);
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const y = heightAt(x, z) + 0.05;
        return { x, y, z, rot: rand(i + 99, seed) * Math.PI * 2, skull: i % 2 === 0, s: 1.6 + rand(i + 7, seed) * 0.8, len: 2.0 + rand(i + 3, seed) * 1.2 };
      }),
    [count, seed, rMin, rMax],
  );
  return (
    <group>
      {items.map((b, i) =>
        i / count > reveal ? null : b.skull ? (
          <Skull key={i} position={[b.x, b.y, b.z]} rotation={[-0.75, b.rot, 0.1]} scale={b.s} />
        ) : (
          <Bone key={i} position={[b.x, b.y + 0.1, b.z]} rotation={[0, b.rot, 0.1]} length={b.len} />
        ),
      )}
    </group>
  );
};

/* ---------------- sky, mist, snow, stars ---------------- */
export const SkyDome: React.FC<{ top: string; horizon: string; bottom?: string }> = ({ top, horizon, bottom }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { top: { value: new THREE.Color(top) }, hor: { value: new THREE.Color(horizon) }, bot: { value: new THREE.Color(bottom ?? horizon) } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 top; uniform vec3 hor; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(hor, top, pow(clamp(h*1.6,0.0,1.0),0.7)) : mix(hor, bot, clamp(-h*3.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }",
      }),
    [top, horizon, bottom],
  );
  return (
    <mesh material={mat}>
      <sphereGeometry args={[1500, 32, 16]} />
    </mesh>
  );
};

const softTexture = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    tex = new THREE.CanvasTexture(c);
    return tex;
  };
})();

export const Mist: React.FC<{ count?: number; y?: number; spread?: number; opacity?: number; color?: string }> = ({ count = 14, y = 2.5, spread = 28, opacity = 0.35, color = "#e8f0ff" }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  return (
    <group>
      {new Array(count).fill(0).map((_, i) => {
        const a = rand(i, 21) * Math.PI * 2;
        const r = rand(i + 5, 21) * spread;
        const drift = ((f * 0.04 + rand(i + 9, 21) * 60) % 60) - 30;
        return (
          <sprite key={i} position={[Math.cos(a) * r + drift, y + rand(i + 2, 21) * 3, Math.sin(a) * r]} scale={[22, 9, 1]}>
            <spriteMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} />
          </sprite>
        );
      })}
    </group>
  );
};

export const Snowfall: React.FC<{ count?: number; area?: number; height?: number; speed?: number; size?: number; center?: [number, number, number] }> = ({
  count = 900,
  area = 60,
  height = 40,
  speed = 0.08,
  size = 0.22,
  center = [0, 0, 0],
}) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = useMemo(() => new Float32Array(count * 3), [count]);
  for (let i = 0; i < count; i++) {
    const y0 = rand(i + 3, 31) * height;
    pos[i * 3] = center[0] + (rand(i, 31) - 0.5) * area + Math.sin(f / 20 + i) * 0.6;
    pos[i * 3 + 1] = center[1] + (((y0 - f * speed * (0.6 + rand(i + 8, 31))) % height) + height) % height;
    pos[i * 3 + 2] = center[2] + (rand(i + 1, 31) - 0.5) * area;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos.slice(), 3));
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={size} transparent opacity={0.9} map={softTexture()} depthWrite={false} />
    </points>
  );
};

export const Stars: React.FC<{ count?: number; opacity?: number }> = ({ count = 800, opacity = 1 }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const th = rand(i, 41) * Math.PI * 2;
      const ph = Math.acos(rand(i + 1, 41) * 0.95);
      p[i * 3] = Math.sin(ph) * Math.cos(th) * 1200;
      p[i * 3 + 1] = Math.cos(ph) * 1200;
      p[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * 1200;
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#fff8e7" size={3.2} sizeAttenuation={false} transparent opacity={opacity * (0.8 + 0.2 * Math.sin(f / 6))} fog={false} />
    </points>
  );
};

/* ---------------- camera rig ---------------- */
export const CameraRig: React.FC<{ pos: [number, number, number]; look: [number, number, number]; fov?: number; roll?: number }> = ({ pos, look, fov = 50, roll = 0 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(...look);
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

export const lerp3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Standard outdoor lighting rig (hemisphere + sun with soft shadows). */
export const Daylight: React.FC<{ sun?: [number, number, number]; sunColor?: string; sky?: string; ground?: string; intensity?: number }> = ({
  sun = [60, 80, 40],
  sunColor = "#ffe2b8",
  sky = "#bcd7ff",
  ground = "#6b5a48",
  intensity = 3.2,
}) => (
  <group>
    <ambientLight intensity={0.5} />
    <hemisphereLight args={[sky, ground, 1.6]} />
    <directionalLight
      position={sun}
      color={sunColor}
      intensity={intensity}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-60}
      shadow-camera-right={60}
      shadow-camera-top={60}
      shadow-camera-bottom={-60}
      shadow-camera-far={400}
    />
  </group>
);

/** Keep a camera position above the terrain surface. */
export const clampCam = (p: [number, number, number], clearance = 10): [number, number, number] => [p[0], Math.max(p[1], heightAt(p[0], p[2]) + clearance), p[2]];

/** Canvas texture with text lines (for signs and sky glyphs). */
export const textTexture = (lines: { text: string; size: number; color: string; font?: string }[], w = 1024, h = 512, bg?: string, glow?: string) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  const total = lines.reduce((a, l) => a + l.size * 1.15, 0);
  let y = (h - total) / 2;
  for (const l of lines) {
    g.font = `${l.font ?? "900"} ${l.size}px Poppins, Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "top";
    if (glow) {
      g.shadowColor = glow;
      g.shadowBlur = 40;
    }
    g.fillStyle = l.color;
    g.fillText(l.text, w / 2, y);
    y += l.size * 1.15;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Falling hailstones (frame driven). */
export const Hail: React.FC<{ count?: number; center: [number, number, number]; area?: number; height?: number }> = ({ count = 380, center, area = 30, height = 30 }) => {
  const f = useCurrentFrame();
  return (
    <group>
      {new Array(count).fill(0).map((_, i) => {
        const y0 = rand(i, 71) * height;
        const y = (((y0 - f * 0.9 * (0.8 + rand(i + 2, 71) * 0.4)) % height) + height) % height;
        const x = center[0] + (rand(i + 3, 71) - 0.5) * area;
        const z = center[2] + (rand(i + 5, 71) - 0.5) * area;
        return (
          <mesh key={i} position={[x, center[1] + y, z]}>
            <icosahedronGeometry args={[0.07 + rand(i + 7, 71) * 0.07, 0]} />
            <meshStandardMaterial color="#eef6ff" roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};
