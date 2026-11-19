/* Mystery / cold-war kit: calendar, candles, snowy dacha, bed + flask, airliner, Alpine massif,
 * atom model, secret folder, archive box, ECG. All frame-driven (no useFrame). */
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { fbm, rand, softTexture, textTexture } from "./World";

type V3 = [number, number, number];

/* ---------------- wall calendar ---------------- */
const calTex = (() => {
  const cache: Record<string, THREE.CanvasTexture> = {};
  return (month: string, year: string, startCol: number, days: number, circled: number[]) => {
    const key = `${month}${year}${circled.join(",")}`;
    if (cache[key]) return cache[key];
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 760;
    const g = c.getContext("2d")!;
    g.fillStyle = "#f4ecd8";
    g.fillRect(0, 0, 600, 760);
    g.fillStyle = "#a3201a";
    g.fillRect(0, 0, 600, 150);
    g.textAlign = "center";
    g.fillStyle = "#fff6e0";
    g.font = "900 78px Poppins, Arial, sans-serif";
    g.fillText(month, 300, 92);
    g.font = "700 40px Poppins, Arial, sans-serif";
    g.fillText(year, 300, 136);
    const wd = ["S", "M", "T", "W", "T", "F", "S"];
    g.font = "800 30px Poppins, Arial, sans-serif";
    wd.forEach((d, i) => {
      g.fillStyle = i === 0 ? "#a3201a" : "#3a2a1a";
      g.fillText(d, 50 + i * 83.3, 200);
    });
    g.font = "700 40px Poppins, Arial, sans-serif";
    for (let d = 1; d <= days; d++) {
      const idx = startCol + d - 1;
      const col = idx % 7;
      const row = Math.floor(idx / 7);
      const x = 50 + col * 83.3;
      const y = 275 + row * 92;
      g.fillStyle = col === 0 ? "#a3201a" : "#2a1e14";
      g.fillText(String(d), x, y);
      if (circled.includes(d)) {
        g.strokeStyle = "#d4101a";
        g.lineWidth = 7;
        g.beginPath();
        g.ellipse(x, y - 14, 40, 34, -0.2, 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.moveTo(x - 30, y + 10);
        g.lineTo(x + 30, y - 40);
        g.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    cache[key] = t;
    return t;
  };
})();

export const Calendar: React.FC<{ position: V3; rotation?: V3; scale?: number; circled?: number[] }> = ({ position, rotation = [0, 0, 0], scale = 1, circled = [] }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0, -0.03]} castShadow>
      <boxGeometry args={[2.5, 3.1, 0.05]} />
      <meshStandardMaterial color="#5a3a22" />
    </mesh>
    <mesh>
      <planeGeometry args={[2.36, 2.98]} />
      <meshStandardMaterial map={calTex("JANUARY", "1966", 6, 31, circled)} roughness={0.9} />
    </mesh>
    {[-0.6, 0.6].map((x) => (
      <mesh key={x} position={[x, 1.5, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.07, 0.015, 6, 12]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
      </mesh>
    ))}
  </group>
);

/* ---------------- candle ---------------- */
export const Candle: React.FC<{ position: V3; outAt?: number; h?: number; light?: number }> = ({ position, outAt = 99999, h = 0.7, light = 1 }) => {
  const f = useCurrentFrame();
  const lit = f < outAt;
  const fl = 0.82 + 0.18 * Math.sin(f / 2.3 + position[0] * 3) * Math.sin(f / 5.1 + position[2]);
  const tex = softTexture();
  const sm = (f - outAt) / 60;
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.14, h, 16]} />
        <meshStandardMaterial color="#efe6cf" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.24, 0.26, 0.06, 18]} />
        <meshStandardMaterial color="#8a6a3a" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, h + 0.04, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.08, 4]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {lit && (
        <group position={[0, h + 0.15, 0]}>
          <mesh scale={[1, 2.1 * fl, 1]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <meshBasicMaterial color="#fff2b0" />
          </mesh>
          <sprite scale={[0.7 * fl, 0.9 * fl, 1]}>
            <spriteMaterial map={tex} color="#ffb347" transparent opacity={0.9} depthWrite={false} />
          </sprite>
          <pointLight color="#ffb060" intensity={7 * fl * light} distance={7} decay={1.6} />
        </group>
      )}
      {!lit &&
        sm < 1 &&
        [0, 1, 2, 3].map((k) => (
          <sprite key={k} position={[Math.sin(f / 9 + k) * 0.08 * (1 + k), h + 0.2 + sm * (0.6 + k * 0.35), 0]} scale={[0.25 + sm * 0.5, 0.35 + sm * 0.6, 1]}>
            <spriteMaterial map={tex} color="#b8b8c0" transparent opacity={0.5 * (1 - sm)} depthWrite={false} />
          </sprite>
        ))}
    </group>
  );
};

/* ---------------- room shell ---------------- */
export const Room: React.FC<{ wall?: string; floor?: string; w?: number; d?: number; h?: number; windowGlow?: number }> = ({ wall = "#3a2c24", floor = "#2a1e16", w = 14, d = 12, h = 6, windowGlow = 0 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d * 2]} />
      <meshStandardMaterial color={floor} roughness={0.9} />
    </mesh>
    <mesh position={[0, h / 2, -d / 2]} receiveShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color={wall} roughness={0.95} />
    </mesh>
    <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[d * 2, h]} />
      <meshStandardMaterial color={wall} roughness={0.95} />
    </mesh>
    <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[d * 2, h]} />
      <meshStandardMaterial color={wall} roughness={0.95} />
    </mesh>
    {windowGlow > 0 && (
      <group position={[w / 2 - 0.02, h * 0.55, -1]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[2.2, 2.6]} />
          <meshStandardMaterial color="#9fb4ff" emissive="#6a80d0" emissiveIntensity={0.8 * windowGlow} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.08, 2.6, 0.02]} />
          <meshStandardMaterial color="#2a1e16" />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[2.2, 0.08, 0.02]} />
          <meshStandardMaterial color="#2a1e16" />
        </mesh>
      </group>
    )}
  </group>
);

export const Table: React.FC<{ position: V3; w?: number; d?: number; h?: number; color?: string; cloth?: string }> = ({ position, w = 3, d = 1.4, h = 1.0, color = "#4a2a16", cloth }) => (
  <group position={position}>
    <mesh position={[0, h, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, 0.1, d]} />
      <meshStandardMaterial color={cloth ?? color} roughness={0.7} />
    </mesh>
    {cloth && (
      <mesh position={[0, h - 0.3, 0]}>
        <boxGeometry args={[w + 0.02, 0.6, d + 0.02]} />
        <meshStandardMaterial color={cloth} roughness={0.9} />
      </mesh>
    )}
    {[-1, 1].map((sx) =>
      [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * (w / 2 - 0.12), h / 2, sz * (d / 2 - 0.12)]} castShadow>
          <boxGeometry args={[0.1, h, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )),
    )}
  </group>
);

/* ---------------- snowy dacha ---------------- */
export const Dacha: React.FC<{ position: V3; rotY?: number; light?: number }> = ({ position, rotY = 0, light = 1 }) => {
  const f = useCurrentFrame();
  const fl = 0.9 + 0.1 * Math.sin(f / 5);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, 4.4, 6]} />
        <meshStandardMaterial color="#c9b48e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5.4, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.45, 1, 1]} castShadow>
        <coneGeometry args={[5.4, 2.4, 4]} />
        <meshStandardMaterial color="#5a2e22" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.55, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.42, 1, 0.98]}>
        <coneGeometry args={[5.3, 2.3, 4]} />
        <meshStandardMaterial color="#f2f6fb" roughness={0.6} />
      </mesh>
      <mesh position={[2.6, 6.3, -1]} castShadow>
        <boxGeometry args={[0.7, 1.8, 0.7]} />
        <meshStandardMaterial color="#6a4a3a" />
      </mesh>
      {[-3, 0, 3].map((x, i) => (
        <group key={x} position={[x, 2.5, 3.01]}>
          <mesh>
            <planeGeometry args={[1.4, 1.6]} />
            <meshStandardMaterial color="#ffd38a" emissive="#ffb347" emissiveIntensity={(i === 2 ? light : Math.min(light, 0.7) * 0.6) * 1.6 * fl} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.06, 1.6, 0.02]} />
            <meshStandardMaterial color="#3a2414" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[1.4, 0.06, 0.02]} />
            <meshStandardMaterial color="#3a2414" />
          </mesh>
        </group>
      ))}
      <pointLight position={[3, 2.5, 4.2]} color="#ffb347" intensity={14 * light} distance={10} />
    </group>
  );
};

export const Pine: React.FC<{ position: V3; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
      <meshStandardMaterial color="#4a3020" />
    </mesh>
    {[0, 1, 2].map((i) => (
      <group key={i}>
        <mesh position={[0, 1.6 + i * 1.1, 0]} castShadow>
          <coneGeometry args={[1.5 - i * 0.4, 1.8, 7]} />
          <meshStandardMaterial color="#1f3a2c" flatShading />
        </mesh>
        <mesh position={[0, 1.9 + i * 1.1, 0]}>
          <coneGeometry args={[1.1 - i * 0.35, 0.8, 7]} />
          <meshStandardMaterial color="#eef3f8" flatShading />
        </mesh>
      </group>
    ))}
  </group>
);

/* ---------------- bedroom props ---------------- */
export const Bed: React.FC<{ position: V3; rotY?: number }> = ({ position, rotY = 0 }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 0.5, 3.8]} />
      <meshStandardMaterial color="#4a2e1a" />
    </mesh>
    <mesh position={[0, 0.65, 0.05]} castShadow receiveShadow>
      <boxGeometry args={[2.0, 0.25, 3.6]} />
      <meshStandardMaterial color="#e8e4da" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.88, -1.4]} castShadow>
      <boxGeometry args={[1.5, 0.22, 0.6]} />
      <meshStandardMaterial color="#f4f1ea" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.82, 0.7]} castShadow>
      <boxGeometry args={[2.06, 0.12, 2.2]} />
      <meshStandardMaterial color="#6a1e22" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.2, -1.88]} castShadow>
      <boxGeometry args={[2.2, 1.3, 0.12]} />
      <meshStandardMaterial color="#4a2e1a" />
    </mesh>
  </group>
);

export const Flask: React.FC<{ position: V3; glow?: number; scale?: number }> = ({ position, glow = 0, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.32, 0]} castShadow>
      <cylinderGeometry args={[0.14, 0.14, 0.64, 18]} />
      <meshStandardMaterial color="#3a5a4a" metalness={0.5} roughness={0.35} emissive="#3aff8a" emissiveIntensity={0.25 * glow} />
    </mesh>
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.14, 0.14, 18]} />
      <meshStandardMaterial color="#b8bcc4" metalness={0.8} roughness={0.25} />
    </mesh>
    <group position={[0.42, 0, 0.08]}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.4, 16, 1, true]} />
        <meshStandardMaterial color="#dff2ff" transparent opacity={0.35} roughness={0.05} side={2} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.1, 0.085, 0.26, 16]} />
        <meshStandardMaterial color={glow > 0 ? "#bff7c8" : "#f4f1e6"} emissive="#3aff8a" emissiveIntensity={0.6 * glow} />
      </mesh>
    </group>
  </group>
);

/* ---------------- airliner (nose +x) ---------------- */
export const Jet: React.FC<{ position: V3; rotation?: V3; scale?: number }> = ({ position, rotation = [0, 0, 0], scale = 1 }) => {
  const WHITE = "#f2f4f6";
  const RED = "#c0262d";
  const SILVER = "#b8bcc4";
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 8, 18]} />
        <meshStandardMaterial color={WHITE} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[4, 0, 0]} scale={[1.7, 1, 1]} castShadow>
        <sphereGeometry args={[0.5, 18, 12]} />
        <meshStandardMaterial color={WHITE} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[-4.8, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.5, 0.12, 1.6, 18]} />
        <meshStandardMaterial color={WHITE} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[8.6, 0.14, 1.02]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[8.2, 0.2, 0.96]} />
        <meshStandardMaterial color={SILVER} metalness={0.6} roughness={0.35} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[-0.7, -0.2, s * 2.6]} rotation={[0, -s * 0.45, 0]} castShadow>
          <boxGeometry args={[1.7, 0.09, 4.6]} />
          <meshStandardMaterial color={SILVER} metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
      {[1.7, 3.4, -1.7, -3.4].map((z) => (
        <group key={z} position={[0.7 - Math.abs(z) * 0.48, -0.55, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.2, 0.17, 1.1, 12]} />
            <meshStandardMaterial color={SILVER} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.5, 0.25, 0.06]} />
            <meshStandardMaterial color={SILVER} />
          </mesh>
        </group>
      ))}
      <mesh position={[-4.4, 1.05, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[1.4, 1.8, 0.08]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[-4.6, 0.2, s * 1.3]} rotation={[0, -s * 0.4, 0]}>
          <boxGeometry args={[0.9, 0.06, 2.2]} />
          <meshStandardMaterial color={SILVER} />
        </mesh>
      ))}
      {new Array(12).fill(0).map((_, i) =>
        [1, -1].map((s) => (
          <mesh key={`${i}${s}`} position={[2.6 - i * 0.5, 0.26, s * 0.49]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[0.18, 0.16]} />
            <meshStandardMaterial color="#20304a" emissive="#ffd38a" emissiveIntensity={0.4} />
          </mesh>
        )),
      )}
    </group>
  );
};

/* ---------------- Alpine massif ---------------- */
const PEAKS: [number, number, number, number][] = [
  [0, 0, 150, 70],
  [-95, -40, 105, 55],
  [85, -70, 120, 55],
  [-40, -150, 135, 70],
  [130, 50, 80, 45],
  [-150, 70, 70, 50],
];
export const alpsH = (x: number, z: number) => {
  let h = 0;
  for (const [px, pz, H, R] of PEAKS) h += H * Math.exp(-((x - px) ** 2 + (z - pz) ** 2) / (2 * R * R));
  h += (fbm(x * 0.02, z * 0.02, 5, 31) - 0.5) * 26 * (0.35 + h / 150);
  return h - 12;
};

export const Alps: React.FC<{ size?: number; seg?: number }> = ({ size = 800, seg = 170 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, alpsH(pos.getX(i), pos.getZ(i)));
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    const p = ng.attributes.position as THREE.BufferAttribute;
    const n = ng.attributes.normal as THREE.BufferAttribute;
    const cols = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i += 3) {
      const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      const ny = (n.getY(i) + n.getY(i + 1) + n.getY(i + 2)) / 3;
      const patch = fbm(p.getX(i) * 0.05, p.getZ(i) * 0.05, 3, 9);
      if (ny < 0.55 && patch > 0.4) c.set("#5f5a66");
      else if (ny < 0.7) c.set("#c9d3e0");
      else c.set(y > 20 || patch > 0.45 ? "#f6f9fd" : "#dfe7f0");
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
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.9} />
    </mesh>
  );
};

/* ---------------- atom ---------------- */
export const Atom: React.FC<{ position: V3; scale?: number; glow?: number; speed?: number }> = ({ position, scale = 1, glow = 1, speed = 1 }) => {
  const f = useCurrentFrame();
  const orbits: V3[] = [
    [Math.PI / 2, 0, 0],
    [Math.PI / 2, Math.PI / 3, 0.4],
    [Math.PI / 2, -Math.PI / 3, -0.4],
  ];
  const nuc = useMemo(
    () => new Array(9).fill(0).map((_, i) => ({ p: [(rand(i, 3) - 0.5) * 0.28, (rand(i + 1, 3) - 0.5) * 0.28, (rand(i + 2, 3) - 0.5) * 0.28] as V3, c: i % 2 ? "#e0453a" : "#3a7ae0" })),
    [],
  );
  return (
    <group position={position} scale={scale} rotation={[0, f * 0.01 * speed, 0]}>
      {nuc.map((n, i) => (
        <mesh key={i} position={n.p}>
          <sphereGeometry args={[0.13, 14, 10]} />
          <meshStandardMaterial color={n.c} emissive={n.c} emissiveIntensity={0.3 * glow} roughness={0.4} />
        </mesh>
      ))}
      {orbits.map((r, k) => (
        <group key={k} rotation={r}>
          <mesh>
            <torusGeometry args={[0.95, 0.018, 8, 64]} />
            <meshStandardMaterial color="#7fe8ff" emissive="#4fd8ff" emissiveIntensity={1.2 * glow} />
          </mesh>
          <mesh position={[Math.cos(f * 0.12 * speed + k * 2.1) * 0.95, Math.sin(f * 0.12 * speed + k * 2.1) * 0.95, 0]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#bff4ff" emissiveIntensity={2 * glow} />
          </mesh>
        </group>
      ))}
      <pointLight color="#6fe0ff" intensity={8 * glow} distance={6} />
    </group>
  );
};

/* ---------------- secret folder ---------------- */
export const Folder: React.FC<{ position: V3; rotation?: V3; open?: number; title?: string; sub?: string }> = ({ position, rotation = [0, 0, 0], open = 0, title = "TOP SECRET", sub = "FILE • 1966" }) => {
  const cover = useMemo(() => textTexture([{ text: title, size: 110, color: "#b3121a" }, { text: sub, size: 64, color: "#3a2a14" }], 1024, 720, "#d9b878"), [title, sub]);
  const page = useMemo(() => {
    const lines = new Array(9).fill(0).map((_, i) => ({ text: i % 3 === 2 ? "████████   ██████" : "██████ ████ ██████████", size: 52, color: "#2a2a2a" }));
    return textTexture(lines, 720, 1000, "#f2ecdc");
  }, []);
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.5, 1.05]} />
        <meshStandardMaterial color="#c9a868" />
      </mesh>
      <mesh position={[0.02, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.3, 0.95]} />
        <meshStandardMaterial map={page} />
      </mesh>
      <group position={[-0.75, 0.03, 0]} rotation={[0, 0, -open * Math.PI * 0.92]}>
        <mesh position={[0.75, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <planeGeometry args={[1.5, 1.05]} />
          <meshStandardMaterial map={cover} side={2} />
        </mesh>
      </group>
    </group>
  );
};

/* ---------------- archive box ---------------- */
export const ArchiveBox: React.FC<{ position: V3; rotY?: number; open?: number; label?: string }> = ({ position, rotY = 0, open = 0, label = "1977" }) => {
  const tag = useMemo(() => textTexture([{ text: label, size: 84, color: "#2a1e14" }], 1024, 220, "#efe4c8"), [label]);
  const C = "#a07a4a";
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.6, 0.04, 1.1]} />
        <meshStandardMaterial color="#2a1e14" />
      </mesh>
      {[
        [0, 0.45, 0.55, 1.6, 0.9, 0.04],
        [0, 0.45, -0.55, 1.6, 0.9, 0.04],
        [0.8, 0.45, 0, 0.04, 0.9, 1.1],
        [-0.8, 0.45, 0, 0.04, 0.9, 1.1],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={C} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0.58]}>
        <planeGeometry args={[1.2, 0.26]} />
        <meshStandardMaterial map={tag} />
      </mesh>
      <group position={[0, 0.92, -0.57]} rotation={[-open * 1.9, 0, 0]}>
        <mesh position={[0, 0, 0.57]} castShadow>
          <boxGeometry args={[1.68, 0.06, 1.18]} />
          <meshStandardMaterial color="#b08a56" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

/* ---------------- explosion / smoke burst ---------------- */
export const Burst: React.FC<{ position: V3; at: number; scale?: number; snow?: boolean }> = ({ position, at, scale = 1, snow = true }) => {
  const f = useCurrentFrame();
  const t = (f - at) / 70;
  if (t < 0 || t > 1.6) return null;
  const tex = softTexture();
  return (
    <group position={position} scale={scale}>
      {t < 0.35 && <pointLight color="#ffb347" intensity={400 * (1 - t / 0.35)} distance={120} decay={1.2} />}
      {t < 0.45 && (
        <sprite position={[0, 4 + t * 6, 0]} scale={[10 + t * 40, 10 + t * 40, 1]}>
          <spriteMaterial map={tex} color="#ff5a10" transparent opacity={1 - t / 0.45} depthWrite={false} fog={false} toneMapped={false} />
        </sprite>
      )}
      {new Array(8).fill(0).map((_, i) => {
        const tt = t - 0.1 - i * 0.05;
        if (tt < 0) return null;
        const s = 8 + tt * 14 + i * 1.5;
        return (
          <sprite key={`c${i}`} position={[Math.sin(i * 1.3) * 2, 4 + tt * 22 + i * 3, Math.cos(i * 1.7) * 2]} scale={[s, s, 1]}>
            <spriteMaterial map={tex} color="#242024" transparent opacity={0.9 * Math.max(0, 1 - t / 1.6)} depthWrite={false} fog={false} />
          </sprite>
        );
      })}
      {new Array(14).fill(0).map((_, i) => {
        const a = i * 2.39;
        const r = (0.5 + rand(i, 7)) * Math.min(1, t * 2.2) * 9;
        const fire = i % 2 === 0 && t < 0.55;
        const col = fire ? (i % 4 === 0 ? "#ff4a00" : "#ff9a1a") : snow && i % 3 === 1 ? "#eef3fa" : "#3a3438";
        const s = (6 + rand(i + 3, 7) * 8) * (0.4 + Math.min(1, t * 1.6));
        return (
          <sprite key={i} position={[Math.cos(a) * r, 2 + t * (4 + rand(i + 5, 7) * 10) + Math.sin(a * 1.7) * 2, Math.sin(a) * r]} scale={[s, s, 1]}>
            <spriteMaterial map={tex} color={col} transparent opacity={(fire ? 1 : 0.85) * Math.max(0, 1 - t / 1.6)} depthWrite={false} fog={false} toneMapped={!fire} />
          </sprite>
        );
      })}
    </group>
  );
};
