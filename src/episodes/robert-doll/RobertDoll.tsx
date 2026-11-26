import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook, BeanPose } from "../../components/three/Bean";
import { Room, Table } from "../../components/three/Mystery3D";
import { Palm } from "../../components/three/Props3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { rand, SkyDome, softTexture, Stars, textTexture } from "../../components/three/World";
import { lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/robert-doll.timeline.json";
import { Sea } from "../bhootiya-5/Worlds";

const PINK = "#ff3cac";
const TEAL = "#2bd2ff";
const DOLL: BeanLook = { body: "#f0eee6", legs: "#f0eee6", hat: "officer", hatColor: "#f0eee6", skin: "#c9a87a", eyes: "wide" };
const GENE: BeanLook = { body: "#2a3a6a", legs: "#e8e4da", hat: "hair", hatColor: "#5a3a1e", skin: "#e8c0a0" };

/** Robert: sailor-suit doll on a little chair, holding a toy lion. */
const Robert: React.FC<{ position: V3; rotY?: number; s?: number; glare?: number; tilt?: number }> = ({ position, rotY = 0, s = 0.55, glare = 0, tilt = 0 }) => {
  const f = useCurrentFrame();
  const pose: BeanPose = { ...BP.sit, la: [0.9, 0.3], ra: [0.9, -0.3], head: [0.18 + tilt, 0.12 + Math.sin(f / 50) * 0.02] };
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.25 * s * 1.6, -0.12]} castShadow>
        <boxGeometry args={[0.9 * s * 1.6, 0.08, 0.8 * s * 1.6]} />
        <meshStandardMaterial color="#5a3a1e" />
      </mesh>
      <mesh position={[0, 0.75 * s * 1.6, -0.6 * s * 1.6]} castShadow>
        <boxGeometry args={[0.9 * s * 1.6, 1.0 * s * 1.6, 0.08]} />
        <meshStandardMaterial color="#5a3a1e" />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.38 * s * 1.6, 0.12 * s * 1.6, -0.12 + sz * 0.32 * s * 1.6]}>
            <boxGeometry args={[0.06, 0.25 * s * 1.6, 0.06]} />
            <meshStandardMaterial color="#4a2a14" />
          </mesh>
        )),
      )}
      <group position={[0, 0.3 * s * 1.6, 0]}>
        <Bean position={[0, 0, 0]} scale={s} pose={pose} look={DOLL} />
        {/* navy sailor collar + red bow */}
        <mesh position={[0, 1.27 * s, 0.1 * s]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.62 * s, 0.1 * s, 0.4 * s]} />
          <meshStandardMaterial color="#1a2a5a" />
        </mesh>
        <mesh position={[0, 1.12 * s, 0.33 * s]}>
          <sphereGeometry args={[0.08 * s, 8, 6]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
        {/* toy lion */}
        <group position={[0.05 * s, 0.85 * s, 0.6 * s]}>
          <mesh>
            <sphereGeometry args={[0.2 * s, 12, 10]} />
            <meshStandardMaterial color="#d8a840" />
          </mesh>
          <mesh position={[0, 0.06 * s, 0.12 * s]}>
            <torusGeometry args={[0.14 * s, 0.07 * s, 8, 14]} />
            <meshStandardMaterial color="#a8661a" />
          </mesh>
        </group>
        {glare > 0 &&
          [-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.14 * s + 0.03, 1.72 * s, 0.42 * s]}>
              <sphereGeometry args={[0.035 * s, 8, 6]} />
              <meshBasicMaterial color="#ff2020" transparent opacity={glare} toneMapped={false} />
            </mesh>
          ))}
        {glare > 0 && <pointLight position={[0, 1.7 * s, 0.8 * s]} color="#ff2020" intensity={3 * glare} distance={2} />}
      </group>
    </group>
  );
};

const GlassCase: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.5, 1.0, 1.2]} />
      <meshStandardMaterial color="#3a2414" />
    </mesh>
    <mesh position={[0, 1.75, 0]}>
      <boxGeometry args={[1.4, 1.5, 1.1]} />
      <meshPhysicalMaterial color="#d8f0ff" transparent opacity={0.12} roughness={0.05} metalness={0} depthWrite={false} />
    </mesh>
    {[-1, 1].map((sx) =>
      [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * 0.7, 1.75, sz * 0.55]}>
          <boxGeometry args={[0.04, 1.5, 0.04]} />
          <meshStandardMaterial color="#2a1a0e" />
        </mesh>
      )),
    )}
    <mesh position={[0, 2.52, 0]}>
      <boxGeometry args={[1.5, 0.06, 1.2]} />
      <meshStandardMaterial color="#2a1a0e" />
    </mesh>
  </group>
);

const Letters: React.FC<{ fill: number; flying: number }> = ({ fill, flying }) => {
  const f = useCurrentFrame();
  const tex = useMemo(() => {
    const out: THREE.CanvasTexture[] = [];
    for (let v = 0; v < 3; v++) {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 160;
      const g = c.getContext("2d")!;
      g.fillStyle = ["#f4efe0", "#fff8e8", "#eae6f4"][v];
      g.fillRect(0, 0, 128, 160);
      g.strokeStyle = "#3a3a6a";
      g.lineWidth = 3;
      for (let i = 0; i < 9; i++) {
        g.beginPath();
        g.moveTo(12, 22 + i * 15);
        for (let k = 0; k < 10; k++) g.lineTo(12 + k * 11, 22 + i * 15 + Math.sin(k * 2 + i + v) * 2.5);
        g.stroke();
      }
      g.font = "700 20px serif";
      g.fillStyle = "#8a1a1a";
      g.fillText(["SORRY", "Dear Robert", "Forgive me"][v], 10, 18);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      out.push(t);
    }
    return out;
  }, []);
  const n = Math.round(70 * fill);
  return (
    <group>
      {new Array(n).fill(0).map((_, i) => (
        <mesh key={i} position={[-3.6 + (i % 10) * 0.8 + rand(i, 3) * 0.2, 1.3 + Math.floor(i / 10) * 0.62 + rand(i + 1, 3) * 0.1, -3.97]} rotation={[0, 0, (rand(i + 2, 3) - 0.5) * 0.3]}>
          <planeGeometry args={[0.5, 0.62]} />
          <meshStandardMaterial map={tex[i % 3]} />
        </mesh>
      ))}
      {flying > 0 &&
        new Array(10).fill(0).map((_, i) => {
          const q = ((f * 0.025 + i * 0.1) % 1);
          return (
            <mesh key={`fl${i}`} position={[lerp((rand(i, 5) - 0.5) * 4, -3.6 + (i % 10) * 0.8, q), lerp(1.5 + rand(i + 1, 5) * 2, 2 + (i % 4) * 0.6, q), lerp(4, -3.9, q)]} rotation={[(1 - q) * 3 + i, (1 - q) * 2, i]}>
              <planeGeometry args={[0.5, 0.62]} />
              <meshStandardMaterial map={tex[i % 3]} side={THREE.DoubleSide} transparent opacity={flying} />
            </mesh>
          );
        })}
    </group>
  );
};

const Museum: React.FC<{ x: WP["x"]; f: number; ramp: WP["ramp"]; after: WP["after"] }> = ({ x, f, ramp, after }) => {
  const sign = useMemo(() => textTexture([{ text: "PHOTO SE PEHLE", size: 64, color: "#f4e8c8" }, { text: "ROBERT SE", size: 64, color: "#f4e8c8" }, { text: "IJAAZAT MAANGO", size: 72, color: "#ffd84d" }], 768, 512, "#2a1a10"), []);
  const glare = Math.max(ramp(x.glareAt, 8), x.glare === true ? 0.6 + 0.4 * Math.sin(f / 6) : 0);
  const tex = softTexture();
  return (
    <>
      <color attach="background" args={["#050306"]} />
      <ambientLight intensity={0.3} color="#9a8aff" />
      <spotLight position={[0, 5.5, 2.5]} angle={0.42} penumbra={0.6} intensity={95} distance={14} color="#ffe0b0" castShadow />
      <pointLight position={[-3.5, 2.5, 2]} color={PINK} intensity={8} distance={8} />
      <pointLight position={[3.5, 2.5, 2]} color={TEAL} intensity={6} distance={8} />
      <Room wall="#3a2a3a" floor="#2a1e1a" w={9} d={8} h={5} />
      <GlassCase position={[0, 0, -1.4]} />
      <Robert position={[0, 1.02, -1.35]} glare={glare} tilt={after(x.tiltAt) ? 0.35 : 0} />
      <mesh position={[1.5, 1.45, -0.9]} rotation={[0, -0.35, 0]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <mesh position={[1.5, 0.5, -0.9]} rotation={[0, -0.35, 0]}>
        <boxGeometry args={[0.06, 0.9, 0.06]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
      <Letters fill={typeof x.letters === "number" ? (x.letters as number) : x.letters === true ? 1 : 0} flying={x.flying === true ? 1 : 0} />
      {x.tourist === true && (
        <group>
          <Bean position={[-0.7, 0, 1.6]} rotY={2.79} scale={1.0} pose={{ ...BP.hold, head: [0, -0.05] }} look={{ body: PINK, legs: "#2f3440", hat: "cap", hatColor: TEAL, skin: "#d9a57e", backpack: "#2a2a30" }} />
          <group position={[-0.55, 1.42, 1.18]} rotation={[0, 2.79, 0]}>
            <mesh>
              <boxGeometry args={[0.18, 0.32, 0.03]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
          {after(x.snapAt) && f % 40 < 3 && (
            <sprite position={[-0.5, 1.45, 1.05]} scale={[2.5, 2.5, 1]}>
              <spriteMaterial map={tex} color="#ffffff" transparent opacity={0.9} depthWrite={false} toneMapped={false} />
            </sprite>
          )}
        </group>
      )}
    </>
  );
};

const House1904: React.FC<{ x: WP["x"]; f: number; ramp: WP["ramp"]; after: WP["after"] }> = ({ x, f, ramp, after }) => {
  const open = ramp(x.openAt, 16);
  const broken = after(x.breakAt);
  return (
    <>
      <color attach="background" args={["#0a0806"]} />
      <ambientLight intensity={0.4} color="#ffe0b0" />
      <pointLight position={[1.5, 3.4, 2]} color="#ffd090" intensity={20} distance={12} />
      <directionalLight position={[-4, 4, 2]} intensity={0.6} color="#ffe8c8" />
      <Room wall="#7a5a3a" floor="#4a301c" w={9} d={7} h={4.2} windowGlow={0.4} />
      {new Array(9).fill(0).map((_, i) => (
        <mesh key={i} position={[-4 + i, 2.1, -3.47]}>
          <planeGeometry args={[0.06, 4.2]} />
          <meshStandardMaterial color="#6a4a2e" />
        </mesh>
      ))}
      {x.gift === true && (
        <group>
          <Bean position={[-0.9, 0, 0.6]} rotY={0.5} scale={0.72} pose={open > 0.5 ? BP.cheer : BP.hold} look={GENE} blink={f % 60 < 4} />
          <group position={[0.3, 0, 0.4]}>
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.9, 0.7, 0.9]} />
              <meshStandardMaterial color="#8a1a2a" />
            </mesh>
            <mesh position={[-0.45 - open * 0.3, 0.72 + open * 0.4, 0]} rotation={[0, 0, open * 1.2]}>
              <boxGeometry args={[0.95, 0.08, 0.95]} />
              <meshStandardMaterial color="#a82a3a" />
            </mesh>
            <Robert position={[0, 0.12 + open * 0.55, 0]} s={0.42} rotY={-0.3} />
          </group>
        </group>
      )}
      {x.blame === true && (
        <group>
          <Bean position={[-0.85, 0, 0.6]} rotY={0.7} scale={0.72} pose={after(x.pointAt) ? BP.point : BP.shock} look={GENE} />
          <Robert position={[0.85, 0, -0.4]} rotY={-0.5} s={0.5} glare={after(x.pointAt) ? 0.7 : 0} />
          <Table position={[0, 0, -1.6]} w={1.4} d={0.8} h={0.9} color="#5a3a1e" />
          {!broken ? (
            <mesh position={[0, 1.2, -1.6]}>
              <cylinderGeometry args={[0.15, 0.22, 0.55, 12]} />
              <meshStandardMaterial color="#3a6aa8" />
            </mesh>
          ) : (
            new Array(7).fill(0).map((_, i) => (
              <mesh key={i} position={[0.2 + (rand(i, 4) - 0.5) * 1.2, 0.05, -0.9 + (rand(i + 1, 4) - 0.5) * 0.9]} rotation={[rand(i, 6) * 3, i, rand(i + 2, 6)]}>
                <tetrahedronGeometry args={[0.1 + rand(i + 3, 4) * 0.08, 0]} />
                <meshStandardMaterial color="#3a6aa8" />
              </mesh>
            ))
          )}
        </group>
      )}
    </>
  );
};

/** Neon sunset over the Keys: islands, the long bridge, a sports car, the old brick fort. */
const Keys: React.FC<{ x: WP["x"]; f: number; t: number }> = ({ x, t }) => {
  const tex = softTexture();
  const islands = useMemo(() => [0, 34, 66, 100, 132].map((cx, i) => ({ cx, r: i === 0 ? 16 : 7 + rand(i, 3) * 4 })), []);
  const carX = lerp(26, 58, t);
  return (
    <>
      <fog attach="fog" args={["#a04a8a", 60, 360]} />
      <SkyDome top="#1a0a3a" horizon="#ff7a5a" />
      <Stars opacity={0.35} />
      <sprite position={[-260, 18, -60]} scale={[90, 90, 1]}>
        <spriteMaterial map={tex} color="#ffb060" transparent opacity={0.95} depthWrite={false} fog={false} />
      </sprite>
      <ambientLight intensity={0.45} color="#c08aff" />
      <directionalLight position={[-100, 30, -20]} intensity={1.1} color="#ffb080" castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#3a2a6a" roughness={0.6} metalness={0.1} />
      </mesh>
      <Sea color="#4a2a7a" />
      {islands.map((is, i) => (
        <group key={i} position={[is.cx, 0, 0]}>
          <mesh scale={[1, 0.12, 0.6]} receiveShadow>
            <sphereGeometry args={[is.r, 20, 12]} />
            <meshStandardMaterial color="#e8c890" roughness={1} />
          </mesh>
          <mesh position={[0, 0.5, 0]} scale={[0.85, 0.1, 0.5]}>
            <sphereGeometry args={[is.r, 20, 12]} />
            <meshStandardMaterial color="#3a7a3a" roughness={1} />
          </mesh>
          {new Array(i === 0 ? 7 : 3).fill(0).map((_, k) => (
            <Palm key={k} position={[(rand(k + i * 7, 2) - 0.5) * is.r * 1.3, 0.6, (rand(k + i * 7 + 1, 2) - 0.5) * is.r * 0.7]} scale={1.2} seed={k + i} />
          ))}
        </group>
      ))}
      {/* the long bridge */}
      <mesh position={[74, 1.6, 4]} castShadow receiveShadow>
        <boxGeometry args={[124, 0.4, 3.2]} />
        <meshStandardMaterial color="#b8b0c0" />
      </mesh>
      {new Array(21).fill(0).map((_, i) => (
        <mesh key={i} position={[14 + i * 6, 0.6, 4]}>
          <boxGeometry args={[0.6, 2, 2.4]} />
          <meshStandardMaterial color="#8a8494" />
        </mesh>
      ))}
      {new Array(12).fill(0).map((_, i) => (
        <mesh key={`l${i}`} position={[16 + i * 10, 3.0, 5.5]}>
          <sphereGeometry args={[0.18, 8, 6]} />
          <meshBasicMaterial color={i % 2 ? PINK : TEAL} toneMapped={false} />
        </mesh>
      ))}
      {/* sports car */}
      <group position={[carX, 2.1, 3.2]}>
        <mesh castShadow>
          <boxGeometry args={[3.2, 0.5, 1.5]} />
          <meshStandardMaterial color={PINK} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[-0.3, 0.4, 0]}>
          <boxGeometry args={[1.4, 0.4, 1.3]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.6} />
        </mesh>
        <mesh position={[1.62, 0, 0]}>
          <boxGeometry args={[0.05, 0.16, 1.2]} />
          <meshBasicMaterial color="#fff6d0" toneMapped={false} />
        </mesh>
        <pointLight position={[3, 0.2, 0]} color="#fff0c0" intensity={5} distance={6} />
      </group>
      {/* Fort East Martello: brick walls and a round tower */}
      <group position={[0, 0.6, -2]}>
        {[
          [0, -5, 12, 0.8],
          [0, 5, 12, 0.8],
          [-6, 0, 0.8, 10.8],
          [6, 0, 0.8, 10.8],
        ].map(([px, pz, w, d], i) => (
          <mesh key={i} position={[px, 1.2, pz]} castShadow receiveShadow>
            <boxGeometry args={[w, 2.4, d]} />
            <meshStandardMaterial color="#9a4a32" roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 2.6, 0]} castShadow>
          <cylinderGeometry args={[3, 3.4, 5.2, 18]} />
          <meshStandardMaterial color="#a8563a" roughness={1} />
        </mesh>
        {new Array(6).fill(0).map((_, i) => (
          <mesh key={`w${i}`} position={[Math.cos(i) * 3.05, 3.2, Math.sin(i) * 3.05]} rotation={[0, -i + Math.PI / 2, 0]}>
            <planeGeometry args={[0.5, 0.8]} />
            <meshBasicMaterial color={i === 2 ? "#ffcf6a" : "#1a0a0a"} toneMapped={false} />
          </mesh>
        ))}
        {x.fortGlow === true && <pointLight position={[0, 4, 4]} color="#ffb060" intensity={30} distance={14} />}
      </group>
    </>
  );
};

const World: React.FC<WP> = ({ f, t, x, after, ramp }) => {
  if (x.set === "museum") return <Museum x={x} f={f} ramp={ramp} after={after} />;
  if (x.set === "house") return <House1904 x={x} f={f} ramp={ramp} after={after} />;
  return <Keys x={x} f={f} t={t} />;
};

const DOLL_CLOSE: [V3, V3] = [
  [0.45, 2.15, 0.95],
  [0.22, 2.1, 0.4],
];
const DOLL_LOOK: [V3, V3] = [
  [0, 1.98, -1.35],
  [0, 2.02, -1.35],
];

export const SCENES = makeScenes(World, {
  hook: sh([68, 3.2, 14], [64, 3.4, 12], [30, 2.6, 2], [34, 2.8, 2], {
    entry: false,
    fov: 55,
    cut: { at: "asli", p: DOLL_CLOSE, l: DOLL_LOOK, x: { set: "museum", glare: true }, fov: 45, exp: 1.5 },
    ov: [chip("GTA 6: LEONIDA KEYS", "leonida", { bg: "#5a1a6a", until: "asli" }), stamp("BHOOTIYA GUDIYA!", "gudiya", { size: 86, until: "maafi" }), stamp("LOG MAAFI MAANGTE!", "maafi", { size: 76 })],
  }),
  place: sh([60, 40, 70], [26, 18, 34], [40, 0, 0], [0, 2, -2], { x: { fortGlow: true }, ov: [tag("FLORIDA KEYS, USA", "florida", { size: 50, until: "key" }), chip("KEY WEST KA KILA", "key", { bg: "#5a2a1a" })] }),
  robert: sh([1.3, 2.3, 2.6], [0.7, 2.15, 1.4], [0, 1.95, -1.35], [0, 2.0, -1.35], { exp: 1.5, x: { set: "museum" }, ov: [tag("ROBERT", "robert", { size: 64, until: "sau" }), chip("100+ SAAL PURANI", "sau", { bg: "#3a2a1a", until: "bhootiya" }), stamp("SABSE BHOOTIYA?", "bhootiya", { size: 84 })] }),
  gene: sh([2.8, 2.2, 4.4], [2.2, 1.9, 3.4], [-0.2, 0.9, 0.4], [-0.2, 0.9, 0.4], { x: { set: "house", gift: true, openAt: "tohfe" }, sepia: true, ov: [date("1904", "SAN", "1904"), tag("GENE OTTO", "gene", { size: 56 })] }),
  blame: sh([0.3, 2.3, 5.6], [0.2, 2.1, 4.6], [0, 0.8, -0.6], [0, 0.8, -0.6], { fov: 58, x: { set: "house", blame: true, breakAt: "tootta", pointAt: "robert" }, sepia: true, ov: [chip("KEHTE HAIN...", "kehte", { bg: "#4a1a6a", until: "robert" }), stamp("ROBERT NE KIYA!", "robert", { size: 84 })] }),
  museum: sh([-0.1, 2.25, 4.8], [0.15, 2.15, 3.7], [0.3, 1.8, -1.3], [0.3, 1.85, -1.3], { exp: 1.5, fov: 56, x: { set: "museum", tourist: true, snapAt: "photo" }, ov: [date("1994", "SAN", "1994"), stamp("PEHLE IJAAZAT!", "ijaazat", { size: 84 })] }),
  letters: sh([0.2, 2.4, 4.6], [0.1, 2.8, 3.2], [0, 2.6, -4], [0, 3.0, -4], { x: { set: "museum", letters: 1, flying: true }, ov: [chip("BADKISMATI KE BAAD...", "badkismati", { bg: "#3a1a1a", until: "chitthiyan" }), stamp("SORRY ROBERT!", "chitthiyan", { size: 92 })] }),
  truth: sh([0.8, 2.2, 2.2], [0.3, 2.12, 0.7], [0, 1.98, -1.35], [0, 2.04, -1.35], { x: { set: "museum", letters: 1, glareAt: "panga", tiltAt: "panga" }, exp: 1.4, ov: [chip("SABOOT: NAHI", "saboot", { bg: "#1b5e20", until: "panga" }), stamp("PANGA MAT LENA!", "panga", { size: 84 })] }),
  cta: sh([1.4, 2.2, 3.6], [1.0, 2.1, 2.8], [0, 1.85, -1.35], [0, 1.9, -1.35], { x: { set: "museum", letters: 1, glare: true }, ov: [cta("IJAAZAT", "PHOTO")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "robert-doll/mix.m4a", line1: "GTA 6 KI ASLI JAGAH", line2: "BHOOTIYA GUDIYA!", nudge: "gene" });
export const RobertDoll = short.Ep;
export const robertDollFrames = short.total;
