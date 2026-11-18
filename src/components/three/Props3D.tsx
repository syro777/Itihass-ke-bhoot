/* Reusable 3D props: Pushpak vimana, book, shelves, wall clock, failing aircraft, beach. All frame-driven. */
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { rand, softTexture } from "./World";

const GOLD = { color: "#d9a93a", metalness: 0.65, roughness: 0.32 };
const IVORY = { color: "#f3e6c8", metalness: 0.1, roughness: 0.6 };

/** Golden flying palace (Pushpak vimana), respectful temple-palace styling. */
export const Pushpak: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; scale?: number; wire?: boolean; glow?: number }> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  wire = false,
  glow = 1,
}) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 18) * 0.25;
  const M = (p: { color: string; metalness: number; roughness: number }) =>
    wire ? <meshBasicMaterial color="#7fd4ff" wireframe transparent opacity={0.8} /> : <meshStandardMaterial {...p} />;
  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={rotation} scale={scale}>
      {/* base platform */}
      <mesh castShadow>
        <cylinderGeometry args={[3.2, 2.6, 0.7, 8]} />
        {M(GOLD)}
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[2.4, 1.2, 0.5, 8]} />
        {M(GOLD)}
      </mesh>
      {/* pillars + upper floor */}
      {new Array(8).fill(0).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.6, 0.95, Math.sin(a) * 2.6]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 1.3, 8]} />
            {M(IVORY)}
          </mesh>
        );
      })}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[3.0, 3.0, 0.3, 8]} />
        {M(GOLD)}
      </mesh>
      {/* central shikhara */}
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} position={[0, 2.25 + k * 0.62, 0]} castShadow>
          <cylinderGeometry args={[1.7 - k * 0.38, 1.9 - k * 0.38, 0.62, 8]} />
          {M(k % 2 ? IVORY : GOLD)}
        </mesh>
      ))}
      <mesh position={[0, 4.75, 0]} castShadow>
        <sphereGeometry args={[0.62, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {M(GOLD)}
      </mesh>
      <mesh position={[0, 5.55, 0]}>
        <sphereGeometry args={[0.2, 12, 8]} />
        {M(GOLD)}
      </mesh>
      {/* corner chhatris with flags */}
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        const x = Math.cos(a) * 2.3;
        const z = Math.sin(a) * 2.3;
        return (
          <group key={k} position={[x, 1.85, z]}>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.7, 6]} />
              {M(IVORY)}
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <sphereGeometry args={[0.38, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              {M(GOLD)}
            </mesh>
            {!wire && (
              <group position={[0, 1.25, 0]}>
                <mesh position={[0, 0.4, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.9, 6]} />
                  <meshStandardMaterial color="#6b4a2b" />
                </mesh>
                <mesh position={[0.28, 0.65, 0]} rotation={[0, Math.sin(f / 5 + k) * 0.5, 0]}>
                  <planeGeometry args={[0.55, 0.32]} />
                  <meshStandardMaterial color="#d0241c" side={THREE.DoubleSide} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
      {!wire && glow > 0 && (
        <group position={[0, -1, 0]}>
          <pointLight color="#ffd27a" intensity={30 * glow} distance={30} decay={1.5} />
          <sprite scale={[9, 4, 1]}>
            <spriteMaterial map={softTexture()} color="#ffcf70" transparent opacity={0.55 * glow} depthWrite={false} />
          </sprite>
        </group>
      )}
    </group>
  );
};

/** Canvas texture: blueprint page with a vimana sketch and a Devanagari title. */
export const blueprintTexture = (title = "वैमानिक शास्त्र") => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 680;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9d9b0";
  g.fillRect(0, 0, 512, 680);
  g.strokeStyle = "rgba(90,60,20,0.35)";
  for (let y = 40; y < 680; y += 34) {
    g.beginPath();
    g.moveTo(30, y);
    g.lineTo(482, y);
    g.stroke();
  }
  g.fillStyle = "#3a2410";
  g.font = "700 46px Hind, sans-serif";
  g.textAlign = "center";
  g.fillText(title, 256, 70);
  g.strokeStyle = "#1d4fa0";
  g.lineWidth = 5;
  g.beginPath();
  g.ellipse(256, 330, 170, 60, 0, 0, Math.PI * 2);
  g.stroke();
  for (const x of [130, 210, 300, 380]) {
    g.beginPath();
    g.moveTo(x, 285);
    g.lineTo(x, 200);
    g.stroke();
    g.beginPath();
    g.ellipse(x, 196, 46, 10, 0, 0, Math.PI * 2);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(90, 400);
  g.lineTo(420, 400);
  g.stroke();
  g.setLineDash([10, 8]);
  g.strokeRect(70, 470, 370, 150);
  g.setLineDash([]);
  g.fillStyle = "#1d4fa0";
  g.font = "700 30px Hind, sans-serif";
  g.fillText("रुक्म विमान", 256, 555);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Old book on a surface; `open` 0..1 swings the cover. */
export const Book: React.FC<{ position: [number, number, number]; open: number; glow?: number; scale?: number }> = ({ position, open, glow = 0, scale = 1 }) => {
  const page = useMemo(() => blueprintTexture(), []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.16, 2]} />
        <meshStandardMaterial color="#efe2c0" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.02, 0]} castShadow>
        <boxGeometry args={[1.56, 0.05, 2.06]} />
        <meshStandardMaterial color="#5a1f14" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 1.9]} />
        <meshStandardMaterial map={page} emissive="#ffe9b0" emissiveIntensity={0.25 * glow} />
      </mesh>
      {/* cover hinged on the left edge */}
      <group position={[-0.78, 0.2, 0]} rotation={[0, 0, open * Math.PI * 0.98]}>
        <mesh position={[0.78, 0, 0]} castShadow>
          <boxGeometry args={[1.56, 0.05, 2.06]} />
          <meshStandardMaterial color="#6b2418" roughness={0.6} />
        </mesh>
        <mesh position={[0.78, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.4, 24]} />
          <meshStandardMaterial color="#d9a93a" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      {glow > 0 && <pointLight position={[0, 1.2, 0]} color="#ffd98a" intensity={8 * glow} distance={6} decay={1.5} />}
    </group>
  );
};

/** A wall of bookshelves. */
export const Shelves: React.FC<{ position: [number, number, number]; width?: number; rows?: number }> = ({ position, width = 14, rows = 5 }) => {
  const books = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; c: string }[] = [];
    const cols = ["#6b2418", "#2b4a6b", "#4a5a2a", "#7a5a2a", "#3a2a4a", "#8a3a1a"];
    for (let r = 0; r < rows; r++) {
      let x = -width / 2 + 0.2;
      let i = 0;
      while (x < width / 2 - 0.3) {
        const w = 0.14 + rand(r * 100 + i, 51) * 0.12;
        const h = 0.6 + rand(r * 100 + i + 7, 51) * 0.3;
        out.push({ x: x + w / 2, y: r * 1.1 + h / 2 + 0.06, w, h, c: cols[(r * 7 + i) % cols.length] });
        x += w + 0.02;
        i++;
      }
    }
    return out;
  }, [width, rows]);
  return (
    <group position={position}>
      <mesh position={[0, (rows * 1.1) / 2, -0.25]}>
        <boxGeometry args={[width + 0.4, rows * 1.1 + 0.3, 0.1]} />
        <meshStandardMaterial color="#3a2414" />
      </mesh>
      {new Array(rows + 1).fill(0).map((_, r) => (
        <mesh key={r} position={[0, r * 1.1, 0]}>
          <boxGeometry args={[width + 0.4, 0.08, 0.55]} />
          <meshStandardMaterial color="#5a3a1e" />
        </mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0]}>
          <boxGeometry args={[b.w, b.h, 0.42]} />
          <meshStandardMaterial color={b.c} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

/** Wall clock with frame-driven hands. */
export const WallClock: React.FC<{ position: [number, number, number]; scale?: number }> = ({ position, scale = 1 }) => {
  const f = useCurrentFrame();
  const sec = Math.floor(f / 15) * ((Math.PI * 2) / 60);
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.12, 32]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]}>
        <torusGeometry args={[0.8, 0.06, 8, 32]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      <mesh position={[0, 0.2, 0.08]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.05, 0.42, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <group position={[0, 0, 0.1]} rotation={[0, 0, -sec]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.025, 0.6, 0.02]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
      </group>
    </group>
  );
};

/** The "Vaimanika" craft on a runway: rotors spin up, it hops, then breaks apart at `crashAt`. */
export const FailCraft: React.FC<{ position: [number, number, number]; spinFrom: number; liftAt: number; crashAt: number }> = ({ position, spinFrom, liftAt, crashAt }) => {
  const f = useCurrentFrame();
  const spin = Math.max(0, f - spinFrom) * Math.min(1, Math.max(0, f - spinFrom) / 40) * 0.6;
  const lift = f < liftAt ? 0 : f < crashAt ? Math.sin(Math.min(1, (f - liftAt) / 18) * Math.PI * 0.5) * 1.4 : Math.max(-0.2, 1.4 - ((f - crashAt) / 6) ** 2 * 0.8);
  const wob = f >= liftAt && f < crashAt ? Math.sin(f / 1.6) * 0.12 : 0;
  const t = Math.max(0, f - crashAt);
  const fly = (i: number): [number, number, number] => [(rand(i, 91) - 0.5) * t * 0.22, Math.max(-0.3, t * 0.12 - t * t * 0.006), (rand(i + 4, 91) - 0.5) * t * 0.22];
  const parts = [
    { pos: [-1.4, 1.5, -1.0], i: 1 },
    { pos: [1.4, 1.5, -1.0], i: 2 },
    { pos: [-1.4, 1.5, 1.0], i: 3 },
    { pos: [1.4, 1.5, 1.0], i: 4 },
  ];
  return (
    <group position={[position[0], position[1] + Math.max(0, lift), position[2]]} rotation={[wob, 0, t > 0 ? Math.min(0.5, t * 0.03) : wob]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.7, 3, 8, 16]} />
        <meshStandardMaterial color="#b8bcc4" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[2.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.7, 0.9, 16]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.6} roughness={0.35} />
      </mesh>
      {parts.map((p) => {
        const off = t > 0 ? fly(p.i) : [0, 0, 0];
        return (
          <group key={p.i} position={[p.pos[0] + off[0], p.pos[1] + off[1], p.pos[2] + off[2]]} rotation={[t * 0.2 * p.i, 0, t * 0.15]}>
            <mesh position={[0, -0.6, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 1.2, 6]} />
              <meshStandardMaterial color="#555" />
            </mesh>
            <mesh rotation={[0, spin + p.i, 0]}>
              <boxGeometry args={[1.6, 0.05, 0.22]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Palm tree. */
export const Palm: React.FC<{ position: [number, number, number]; scale?: number; seed?: number }> = ({ position, scale = 1, seed = 1 }) => {
  const f = useCurrentFrame();
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.16, 0.26, 5, 8]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
      </mesh>
      {new Array(7).fill(0).map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} position={[0.3, 5, 0]} rotation={[Math.sin(a) * 0.9 + Math.sin(f / 12 + i + seed) * 0.06, a, Math.cos(a) * 0.9]}>
            <boxGeometry args={[0.35, 0.05, 2.6]} />
            <meshStandardMaterial color="#3f8f3a" roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};
