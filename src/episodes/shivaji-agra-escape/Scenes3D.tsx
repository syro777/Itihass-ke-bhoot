import React, { useMemo } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { CommentBubble, DateBadge, NameTag, VoteButtons } from "../../components/Props";
import { ChannelCard } from "../../components/Subscribe";
import { BP, Bean, BeanLook, BeanPose, walk } from "../../components/three/Bean";
import { Flag } from "../../components/three/Desert3D";
import { Bed } from "../../components/three/Mystery3D";
import { Chip, Stamp } from "../../components/three/Overlays";
import { Stage3D } from "../../components/three/Stage3D";
import { CameraRig, lerp3, Mist, rand, SkyDome, softTexture, Stars } from "../../components/three/World";
import { flash, lerp, prog, Word, wordFrame } from "../../lib/util";

export type SP = { words: Word[]; dur: number };
type V3 = [number, number, number];
const OY = 640;

const RED = "#a8452e";
const MARBLE = "#ece2cc";
const SHIVAJI: BeanLook = { body: "#f2ead8", legs: "#f2ead8", hat: "turban", hatColor: "#e07a1a", beard: "#1a1410", skin: "#c98e6a", coat: true };
const SAMBHAJI: BeanLook = { body: "#f2ead8", legs: "#f2ead8", hat: "turban", hatColor: "#e07a1a", skin: "#d2a07a" };
const SADHU: BeanLook = { body: "#d4601a", legs: "#d4601a", hat: "hood", hatColor: "#c4501a", beard: "#1a1410", skin: "#c98e6a", held: "stick", coat: true };
const GUARD: BeanLook = { body: "#5a2a1a", legs: "#3a2010", hat: "turban", hatColor: "#f2ead8", held: "stick", beard: "#111", skin: "#b07d5a" };
const EMPEROR: BeanLook = { body: "#e8e2d0", legs: "#e8e2d0", hat: "turban", hatColor: "#ffffff", beard: "#d8d8d8", skin: "#d2a07a", coat: true };
const PORTER: BeanLook = { body: "#e8dcc0", legs: "#e8dcc0", hat: "turban", hatColor: "#c0392b", skin: "#a87a5a" };

/* ---------------- props ---------------- */
const Torch: React.FC<{ position: V3; s?: number }> = ({ position, s = 1 }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 2.4, 6]} />
        <meshStandardMaterial color="#3a2414" />
      </mesh>
      {new Array(6).fill(0).map((_, i) => {
        const ph = ((f * 0.05 + i * 0.17) % 1 + 1) % 1;
        return (
          <sprite key={i} position={[Math.sin(i * 2 + f / 7) * 0.08, 2.5 + ph * 0.8, 0]} scale={[0.6 * (1 - ph * 0.5), 0.8 * (1 - ph * 0.4), 1]}>
            <spriteMaterial map={tex} color={ph < 0.4 ? "#ffd27a" : "#ff6a1a"} transparent opacity={0.95 * (1 - ph)} depthWrite={false} toneMapped={false} />
          </sprite>
        );
      })}
      <pointLight position={[0, 2.7, 0]} color="#ff9a3a" intensity={16 * (0.85 + 0.15 * Math.sin(f / 2.3 + position[0]))} distance={10} decay={1.5} />
    </group>
  );
};

/** Wicker sweet basket; `peek` raises the lid and shows the hidden passenger. */
const Basket: React.FC<{ position: V3; lid?: number; peek?: BeanLook; laddoos?: boolean; s?: number }> = ({ position, lid = 0, peek, laddoos = true, s = 1 }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 0.45, 0]} castShadow>
      <cylinderGeometry args={[0.72, 0.52, 0.9, 18, 1, true]} />
      <meshStandardMaterial color="#b08a4a" roughness={1} side={2} />
    </mesh>
    <mesh position={[0, 0.02, 0]}>
      <cylinderGeometry args={[0.52, 0.52, 0.04, 18]} />
      <meshStandardMaterial color="#8a6a3a" />
    </mesh>
    {[0.2, 0.45, 0.7, 0.9].map((y) => (
      <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52 + y * 0.22, 0.025, 6, 24]} />
        <meshStandardMaterial color="#7a5a2a" />
      </mesh>
    ))}
    {peek && (
      <group position={[0, 0.03 + lid * 0.3, 0]}>
        <Bean position={[0, 0, 0]} rotY={-Math.PI / 2} scale={0.5} pose={BP.kneel} look={{ ...peek, eyes: "wide" }} />
      </group>
    )}
    <group position={[0, 0.92 + lid * 0.55, -lid * 0.25]} rotation={[-lid * 0.5, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.76, 0.74, 0.06, 20]} />
        <meshStandardMaterial color="#b0123a" roughness={0.9} />
      </mesh>
      {laddoos &&
        new Array(9).fill(0).map((_, i) => (
          <mesh key={i} position={[Math.cos(i * 2.4) * 0.38 * (i % 3 ? 1 : 0.4), 0.12 + (i % 3 === 0 ? 0.12 : 0), Math.sin(i * 2.4) * 0.38 * (i % 3 ? 1 : 0.4)]}>
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color={i % 2 ? "#f0a020" : "#e8c040"} roughness={0.7} />
          </mesh>
        ))}
    </group>
  </group>
);

/** Two porters with a bamboo pole and a hanging basket, walking along -z → +z. */
const Carry: React.FC<{ position: V3; rotY?: number; walking?: boolean; lid?: number; peek?: BeanLook; s?: number }> = ({ position, rotY = 0, walking = true, lid = 0, peek, s = 1 }) => {
  const f = useCurrentFrame();
  const ph = walking ? f * 0.22 : 0;
  const bob = walking ? Math.abs(Math.sin(ph)) * 0.05 : 0;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={s}>
      <Bean position={[0, 0, 1.4]} scale={1.0} pose={walking ? { ...walk(ph, 0.6), ra: [2.9, -0.3] } : { ...BP.idle, ra: [2.9, -0.3] }} look={PORTER} />
      <Bean position={[0, 0, -1.4]} scale={1.0} pose={walking ? { ...walk(ph + 1, 0.6), ra: [2.9, -0.3] } : { ...BP.idle, ra: [2.9, -0.3] }} look={{ ...PORTER, hatColor: "#2b6fe6" }} />
      <mesh position={[0.32, 1.92 + bob, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3.6, 6]} />
        <meshStandardMaterial color="#8a7a3a" />
      </mesh>
      {[-0.35, 0.35].map((z) => (
        <mesh key={z} position={[0.32, 1.55 + bob, z]} rotation={[z * 0.6, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.8, 4]} />
          <meshStandardMaterial color="#5a4a2a" />
        </mesh>
      ))}
      <group position={[0.32, 0.25 + bob, 0]} rotation={[Math.sin(ph) * 0.06, 0, 0]}>
        <Basket position={[0, 0, 0]} lid={lid} peek={peek} />
      </group>
    </group>
  );
};

/** Mughal courtyard: red-sandstone walls with arches, marble chhatris and a big gate (front at z=-12). */
const Haveli: React.FC<{ night?: boolean }> = ({ night = true }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color={night ? "#8a6a4a" : "#c89a6a"} roughness={1} />
    </mesh>
    {[-1, 1].map((s) => (
      <group key={s}>
        <mesh position={[s * 9, 3.5, -2]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 7, 24]} />
          <meshStandardMaterial color={RED} roughness={0.9} />
        </mesh>
        {new Array(5).fill(0).map((_, i) => (
          <group key={i} position={[s * 8.38, 2.1, -10 + i * 4]} rotation={[0, -s * Math.PI / 2, 0]}>
            <mesh>
              <planeGeometry args={[2, 3.2]} />
              <meshStandardMaterial color="#2a120c" />
            </mesh>
            <mesh position={[0, 1.6, 0.01]}>
              <circleGeometry args={[1, 16, 0, Math.PI]} />
              <meshStandardMaterial color="#2a120c" />
            </mesh>
            <mesh position={[0, 1.6, 0.02]}>
              <torusGeometry args={[1.08, 0.08, 6, 16, Math.PI]} />
              <meshStandardMaterial color={MARBLE} />
            </mesh>
          </group>
        ))}
        <mesh position={[s * 9, 7.2, -2]}>
          <boxGeometry args={[1.5, 0.4, 24.4]} />
          <meshStandardMaterial color={MARBLE} />
        </mesh>
        <group position={[s * 9, 7.4, -13]}>
          {[-0.6, 0.6].map((x) =>
            [-0.6, 0.6].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 0.8, z]}>
                <cylinderGeometry args={[0.08, 0.08, 1.6, 6]} />
                <meshStandardMaterial color={MARBLE} />
              </mesh>
            )),
          )}
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.95, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={MARBLE} />
          </mesh>
        </group>
      </group>
    ))}
    {/* gate wall */}
    {[-1, 1].map((s) => (
      <mesh key={`g${s}`} position={[s * 5.6, 4.5, -14]} castShadow>
        <boxGeometry args={[5.6, 9, 1.4]} />
        <meshStandardMaterial color={RED} roughness={0.9} />
      </mesh>
    ))}
    <mesh position={[0, 8, -14]} castShadow>
      <boxGeometry args={[5.6, 2, 1.4]} />
      <meshStandardMaterial color={RED} />
    </mesh>
    <mesh position={[0, 6.6, -13.29]}>
      <torusGeometry args={[2.8, 0.18, 6, 20, Math.PI]} />
      <meshStandardMaterial color={MARBLE} />
    </mesh>
    <mesh position={[0, 9.4, -14]}>
      <sphereGeometry args={[1.6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={MARBLE} />
    </mesh>
    <mesh position={[0, 3.3, -14.6]}>
      <planeGeometry args={[5.4, 6.6]} />
      <meshStandardMaterial color={night ? "#1a1420" : "#d8b890"} emissive={night ? "#2a2440" : "#000"} emissiveIntensity={0.4} />
    </mesh>
    <Torch position={[-3.4, 0, -12.8]} />
    <Torch position={[3.4, 0, -12.8]} />
    <Torch position={[-7.9, 0, 2]} s={0.9} />
    <Torch position={[7.9, 0, 2]} s={0.9} />
  </group>
);

const NightSky: React.FC = () => (
  <>
    <fog attach="fog" args={["#1a1426", 18, 90]} />
    <SkyDome top="#05040f" horizon="#2a1e3a" />
    <Stars />
    <ambientLight intensity={0.35} />
    <hemisphereLight args={["#6a5a9a", "#2a1a10", 0.7]} />
  </>
);

const Hall: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#d8c8a8" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[5, 22]} />
      <meshStandardMaterial color="#8a1a2a" />
    </mesh>
    {[-1, 1].map((s) =>
      new Array(5).fill(0).map((_, i) => (
        <group key={`${s}${i}`} position={[s * 5, 0, 6 - i * 4.5]}>
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.42, 6, 12]} />
            <meshStandardMaterial color={RED} />
          </mesh>
          <mesh position={[0, 6.1, 0]}>
            <boxGeometry args={[1.1, 0.3, 1.1]} />
            <meshStandardMaterial color={MARBLE} />
          </mesh>
        </group>
      )),
    )}
    <mesh position={[0, 3.5, -13]}>
      <planeGeometry args={[30, 9]} />
      <meshStandardMaterial color="#7a3a26" />
    </mesh>
    <group position={[0, 0, -11]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[5, 1.2, 3]} />
        <meshStandardMaterial color={MARBLE} />
      </mesh>
      <mesh position={[0, 1.6, -0.4]} castShadow>
        <boxGeometry args={[2.2, 0.8, 1.4]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.6} roughness={0.35} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 3, -0.4]}>
          <cylinderGeometry args={[0.08, 0.08, 3.6, 8]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 4.9, -0.4]}>
        <sphereGeometry args={[1.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.6} roughness={0.35} />
      </mesh>
      <Bean position={[0, 1.2, -0.3]} scale={1.1} pose={BP.sit} look={EMPEROR} />
    </group>
  </group>
);

const NOBLES = ["#2a4a6a", "#6a2a3a", "#3a5a2a", "#5a3a6a", "#7a5a2a", "#2a2a3a"];

/* ---------------- scenes ---------------- */
export const Hook: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fQ = wordFrame(words, "qaid");
  const fT = wordFrame(words, "tokri");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const lid = prog(f, fT - 4, fT + 10);
  return (
    <Stage3D
      entryFlash={false}
      exposure={1.35}
      overlay={<g>
        <g transform="translate(850,520) scale(0.6)"><DateBadge x={0} y={0} at={1} top="SAN" big="1666" /></g>
        <Chip x={540} y={OY + 110} at={fQ} text="AGRA • AURANGZEB KI QAID" bg="#5a1010" until={fT - 2} />
        <Stamp x={540} y={1190} at={fT} text="MITHAI KI TOKRI!" size={74} />
      </g>}
    >
      <NightSky />
      <Haveli />
      <Carry position={[0.8, 0, lerp(0, -5, t)]} rotY={Math.PI} lid={lid} peek={SHIVAJI} />
      {[-2.4, 2.4].map((x) => (
        <Bean key={x} position={[x, 0, -12.2]} rotY={0} scale={1.1} pose={BP.idle} look={GUARD} />
      ))}
      <Mist y={0.5} spread={10} opacity={0.15} color="#8a7aa8" />
      <CameraRig pos={[5.2, 1.7, lerp(0, -5, t) + 0.6]} look={[0.48, 1.1, lerp(0, -5, t)]} fov={50} />
    </Stage3D>
  );
};

export const Who: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fS = wordFrame(words, "shivaji");
  const fA = wordFrame(words, "aurangzeb");
  const emperor = f >= fA - 3;
  const t = prog(f, 0, fA - 3);
  const t2 = prog(f, fA - 3, dur);
  return (
    <Stage3D
      exposure={1.3}
      flashOp={flash(f, fA - 3, 6, 0.35)}
      overlay={<g>
        <NameTag x={540} y={OY + 100} at={fS} text="SHIVAJI MAHARAJ" size={54} bg="#ff8a1a" fg="#ffffff" until={fA - 4} />
        <NameTag x={540} y={OY + 100} at={fA} text="BAADSHAH AURANGZEB" size={46} bg="#ffffff" fg="#111" />
      </g>}
    >
      {!emperor ? (
        <>
          <fog attach="fog" args={["#e8a060", 20, 120]} />
          <SkyDome top="#3a3a7a" horizon="#ffa060" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[-10, 8, 10]} color="#ffc080" intensity={2.6} castShadow />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#7a6a4a" />
          </mesh>
          <Bean position={[0, 0, 0]} rotY={0.2} scale={1.3} pose={BP.idle} look={SHIVAJI} blink={f % 80 < 4} />
          <mesh position={[1.4, 2.2, -0.8]}>
            <cylinderGeometry args={[0.04, 0.04, 4.4, 6]} />
            <meshStandardMaterial color="#6a4a2a" />
          </mesh>
          <Flag position={[1.42, 3.8, -0.8]} w={1.6} h={1.0} color="#ff7a00" />
          <CameraRig pos={lerp3([0.9, 1.9, 7.2], [0.7, 1.9, 6.2], t)} look={[0.3, 1.7, 0]} fov={48} />
        </>
      ) : (
        <>
          <color attach="background" args={["#140a08"]} />
          <ambientLight intensity={0.45} />
          <spotLight position={[0, 9, -6]} angle={0.5} penumbra={0.6} intensity={120} color="#ffe2b0" castShadow />
          <pointLight position={[0, 3, -9]} color="#ffb060" intensity={14} distance={10} />
          <Hall />
          <CameraRig pos={lerp3([0, 2.2, -4], [0, 2.4, -5.5], t2)} look={[0, 2.4, -11]} fov={46} />
        </>
      )}
    </Stage3D>
  );
};

export const Durbar: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fAg = wordFrame(words, "agra");
  const fAp = wordFrame(words, "apmaan");
  const fC = wordFrame(words, "chhodkar");
  const fN = wordFrame(words, "nazarbandi");
  const arrest = f >= fN - 3;
  const walking = f >= fC && !arrest;
  const z = walking ? lerp(1.5, 5, prog(f, fC, fN - 3)) : 1.5;
  const t = prog(f, 0, dur);
  return (
    <Stage3D
      exposure={1.25}
      flashOp={flash(f, fN - 3, 6, 0.4)}
      overlay={<g>
        <Chip x={540} y={OY} at={fAg} text="AGRA KA DARBAR" until={fAp - 2} />
        <Stamp x={540} y={OY} at={fAp} text="APMAAN!" size={96} until={fN - 4} />
        <Stamp x={540} y={OY} at={fN} text="NAZARBANDI!" size={92} />
      </g>}
    >
      <color attach="background" args={["#140a08"]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[0, 10, 4]} angle={0.7} penumbra={0.6} intensity={110} color="#ffe2b0" castShadow />
      <pointLight position={[0, 3, -9]} color="#ffb060" intensity={14} distance={12} />
      <Hall />
      {!arrest ? (
        <>
          {NOBLES.map((c, i) => (
            <Bean key={i} position={[(i % 3 - 1) * 1.4 + (i < 3 ? 0 : 0.7), 0, -5 + (i < 3 ? 0 : 2)]} rotY={Math.PI} scale={1.0} pose={BP.idle} look={{ body: c, legs: "#e8dcc0", hat: "turban", hatColor: i % 2 ? "#e8dcc0" : "#c9a24a", beard: i % 2 ? "#222" : undefined, skin: "#c98e6a", coat: true }} />
          ))}
          <Bean position={[1.8, 0, z]} rotY={walking ? 0 : f >= fAp ? Math.PI - 1.2 : Math.PI} scale={1.1} pose={walking ? walk(f * 0.22, 0.7) : BP.idle} look={{ ...SHIVAJI, eyes: f >= fAp ? "wide" : "normal" }} />
          <CameraRig pos={lerp3([3.6, 2.4, 9], [3.2, 2.2, 8], t)} look={[0.6, 1.8, -2]} fov={50} />
        </>
      ) : (
        <>
          <Bean position={[-0.9, 0, 2]} rotY={0.5} scale={1.1} pose={{ ...BP.idle, ra: [1.2, -0.6] }} look={GUARD} />
          <Bean position={[0.9, 0, 2]} rotY={-0.5} scale={1.1} pose={{ ...BP.idle, ra: [1.2, 0.6] }} look={{ ...GUARD, hatColor: "#c0392b" }} />
          <Bean position={[0, 0, -0.6]} rotY={0} scale={1.1} pose={BP.idle} look={SHIVAJI} />
          <CameraRig pos={lerp3([0, 1.9, 6.4], [0, 1.9, 5.6], prog(f, fN - 3, dur))} look={[0, 1.4, 0]} fov={50} />
        </>
      )}
    </Stage3D>
  );
};

/** Shivaji's guarded chamber (used by plan + decoy). */
const Chamber: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    <color attach="background" args={["#120a08"]} />
    <ambientLight intensity={0.35} />
    <pointLight position={[1.6, 2.6, 0.5]} color="#ffb060" intensity={18} distance={10} decay={1.5} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#5a3a26" />
    </mesh>
    <mesh position={[0, 3, -3]}>
      <planeGeometry args={[16, 7]} />
      <meshStandardMaterial color="#7a3a26" />
    </mesh>
    <group position={[-3.2, 1.6, -2.98]}>
      <mesh>
        <planeGeometry args={[1.4, 2.2]} />
        <meshStandardMaterial color="#2a1a2a" emissive="#3a3a6a" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 1.1, 0.01]}>
        <torusGeometry args={[0.72, 0.07, 6, 16, Math.PI]} />
        <meshStandardMaterial color={MARBLE} />
      </mesh>
    </group>
    <Bed position={[0.4, 0, -1.1]} />
    <Torch position={[2.3, 0, -2.2]} s={0.8} />
    {children}
  </>
);

export const Plan: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fB = wordFrame(words, "bimaari");
  const fM = wordFrame(words, "mithai");
  const baskets = f >= fM - 6;
  const t = prog(f, 0, dur);
  return (
    <Stage3D
      exposure={1.3}
      overlay={<g>
        <Chip x={540} y={OY} at={fB} text="BIMAARI KA BAHAANA" bg="#4a1a6a" until={fM - 4} />
        <Chip x={540} y={OY} at={fM} text="ROZ MITHAI KI TOKRIYAN" bg="#b0123a" />
      </g>}
    >
      <Chamber>
        <Bean position={[0.4, 0.42, -0.3]} rotY={0} scale={1.0} pose={{ ...BP.sit, ra: [2.3, -0.6] }} look={{ ...SHIVAJI, eyes: f % 50 < 10 ? "closed" : "normal" }} />
        {baskets &&
          [-1.4, 0, 1.4].map((x, i) => <Basket key={x} position={[x * 1.2 - 0.2, 0, 2.2 + (i % 2) * 0.4]} s={0.9} lid={0} />)}
      </Chamber>
      <CameraRig pos={lerp3([1.6, 2.1, 6.4], [1.2, 2.0, 5.4], t)} look={[0.3, 1.1, -0.4]} fov={50} />
    </Stage3D>
  );
};

export const Check: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fJ = wordFrame(words, "jaanchte");
  const fB = wordFrame(words, "band");
  const later = f >= fB - 8;
  const peekLid = !later ? prog(f, fJ - 4, fJ + 10) * (1 - prog(f, fJ + 30, fJ + 40)) : 0;
  const t = prog(f, 0, dur);
  return (
    <Stage3D
      exposure={1.35}
      overlay={<g>
        <Chip x={540} y={OY} at={fJ} text="HAR TOKRI KI JAANCH" until={fB - 4} />
        <Stamp x={540} y={OY} at={fB} text="JAANCH BAND!" size={88} color="#2ecc71" />
      </g>}
    >
      <NightSky />
      <Haveli />
      <Carry position={[0.3, 0, later ? lerp(-6, -11, prog(f, fB - 8, dur)) : -6]} rotY={Math.PI} walking={later} lid={peekLid} />
      <Bean position={[-1.6, 0, -8.6]} rotY={later ? 0.4 : 1.6} scale={1.1} pose={later ? { ...BP.idle, ra: [1.6, -0.4] } : { ...BP.hold, lean: 0.35 }} look={GUARD} />
      <Bean position={[2.4, 0, -12.2]} rotY={0} scale={1.1} pose={BP.idle} look={{ ...GUARD, hatColor: "#c0392b" }} />
      <CameraRig pos={lerp3([5.6, 2.2, -4.2], [5.2, 2.1, -5.4], t)} look={[0, 1.2, -7.6]} fov={50} />
    </Stage3D>
  );
};

export const Escape: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fS = wordFrame(words, "sambhaji");
  const fC = wordFrame(words, "chhipkar");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const lid = prog(f, fC - 4, fC + 8) * (1 - prog(f, fC + 26, fC + 34));
  return (
    <Stage3D
      exposure={1.35}
      flashOp={flash(f, dur - 26, 6, 0.3)}
      overlay={<g>
        <NameTag x={540} y={OY + 80} at={fS} text="SHIVAJI + SAMBHAJI" size={48} bg="#ff8a1a" fg="#ffffff" until={fC - 3} />
        <Stamp x={540} y={1190} at={fC} text="ESCAPE!" size={110} />
      </g>}
    >
      <NightSky />
      <Haveli />
      <Carry position={[0.9, 0, lerp(-8, -20, t)]} rotY={Math.PI} lid={lid} peek={SHIVAJI} />
      <Carry position={[-1.4, 0, lerp(-4, -16, t)]} rotY={Math.PI} lid={lid * 0.8} peek={SAMBHAJI} s={0.92} />
      {[-2.4, 2.4].map((x) => (
        <Bean key={x} position={[x, 0, -12.2]} rotY={0} scale={1.1} pose={BP.idle} look={GUARD} blink />
      ))}
      <CameraRig pos={[5.4, 1.8, lerp(-8, -20, t) + 0.8]} look={[0.58, 1.1, lerp(-8, -20, t)]} fov={52} />
    </Stage3D>
  );
};

export const Decoy: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fH = wordFrame(words, "hiroji");
  const t = prog(f, 0, dur);
  return (
    <Stage3D
      exposure={1.3}
      overlay={<g>
        <NameTag x={540} y={OY} at={fH} text="HIROJI FARZAND" size={54} bg="#ffd84d" />
        <Chip x={540} y={OY + 150} at={fH + 30} text="BISTAR PAR 'SHIVAJI'" bg="#111" />
      </g>}
    >
      <Chamber>
        <mesh position={[0.4, 0.92, -0.9]} scale={[0.9, 0.5, 1.6]} castShadow>
          <sphereGeometry args={[0.6, 16, 10]} />
          <meshStandardMaterial color="#6a1e22" roughness={0.9} />
        </mesh>
        <group position={[1.32, 0.9, -0.5]}>
          <mesh>
            <sphereGeometry args={[0.1, 12, 10]} />
            <meshStandardMaterial color="#c98e6a" />
          </mesh>
          <mesh position={[0.02, 0.02, 0.06]} rotation={[0.3, 0, 0]}>
            <torusGeometry args={[0.06, 0.018, 8, 16]} />
            <meshStandardMaterial color="#ffd84d" metalness={0.9} roughness={0.2} emissive="#ffb000" emissiveIntensity={0.4} />
          </mesh>
        </group>
        <Bean position={[-3.2, 0, -2.4]} rotY={0.5} scale={1.05} pose={BP.idle} look={{ ...GUARD, eyes: f % 40 < 6 ? "closed" : "normal" }} />
      </Chamber>
      <CameraRig pos={lerp3([2.6, 1.7, 2.6], [2.1, 1.5, 1.8], t)} look={[0.6, 0.9, -0.8]} fov={48} />
    </Stage3D>
  );
};

export const Sadhu: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fS = wordFrame(words, "sadhu");
  const fSu = wordFrame(words, "surakshit");
  const t = prog(f, 0, dur);
  const hills = useMemo(() => new Array(9).fill(0).map((_, i) => ({ x: -80 + i * 20 + rand(i, 3) * 8, z: -90 - rand(i + 1, 3) * 40, h: 20 + rand(i + 2, 3) * 22 })), []);
  return (
    <Stage3D
      exposure={1.3}
      overlay={<g>
        <Chip x={540} y={OY} at={fS} text="SADHU KA BHES" bg="#d4601a" until={fSu - 3} />
        <Stamp x={540} y={OY} at={fSu} text="SURAKSHIT!" size={96} color="#2ecc71" />
      </g>}
    >
      <fog attach="fog" args={["#f0b890", 30, 220]} />
      <SkyDome top="#4a6aa8" horizon="#ffc090" />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#ffe2c0", "#5a4a30", 1.1]} />
      <directionalLight position={[-30, 12, -40]} color="#ffc080" intensity={2.4} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#7a7a44" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -40]}>
        <planeGeometry args={[3, 120]} />
        <meshStandardMaterial color="#a8865a" />
      </mesh>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.x, h.h / 2 - 1, h.z]}>
          <coneGeometry args={[h.h * 1.2, h.h, 6]} />
          <meshStandardMaterial color={i % 2 ? "#4a5a3a" : "#56663e"} flatShading />
        </mesh>
      ))}
      <Bean position={[0.2, 0, lerp(2, -4, t)]} rotY={Math.PI} scale={1.15} pose={walk(f * 0.2, 0.55)} look={SADHU} />
      <CameraRig pos={lerp3([2.2, 1.6, 6.5], [1.8, 1.8, 2.5], t)} look={lerp3([0.2, 1.4, 1], [0, 2.2, -10], t)} fov={50} />
    </Stage3D>
  );
};

export const Crown: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fR = wordFrame(words, "raigad");
  const fC = wordFrame(words, "chhatrapati");
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const tex = softTexture();
  const crowd = useMemo(() => new Array(12).fill(0).map((_, i) => ({ x: (i % 2 ? 1 : -1) * (2.2 + (i % 6 > 2 ? 1.3 : 0)), z: 1.5 + Math.floor(i / 2) % 3 * 1.4, c: NOBLES[i % 6] })), []);
  return (
    <Stage3D
      exposure={1.3}
      flashOp={flash(f, fC, 8, 0.5)}
      overlay={<g>
        <g transform="translate(850,520) scale(0.6)"><DateBadge x={0} y={0} at={2} top="SAN" big="1674" /></g>
        <NameTag x={540} y={OY + 100} at={fR} text="RAIGAD KILA" size={56} bg="#ffd84d" until={fC - 3} />
        <Stamp x={540} y={OY + 100} at={fC} text="CHHATRAPATI!" size={86} color="#ffd84d" />
      </g>}
    >
      <fog attach="fog" args={["#ffb070", 40, 200]} />
      <SkyDome top="#3a5a9a" horizon="#ffb060" />
      <ambientLight intensity={0.65} />
      <directionalLight position={[20, 25, 30]} color="#ffd8a0" intensity={2.8} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#8a7a5a" />
      </mesh>
      {new Array(7).fill(0).map((_, i) => (
        <mesh key={i} position={[-60 + i * 20, -8, -70 - (i % 2) * 20]}>
          <coneGeometry args={[26, 40, 6]} />
          <meshStandardMaterial color="#5a6a44" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.5, -2]} castShadow>
        <boxGeometry args={[6, 1, 4]} />
        <meshStandardMaterial color="#6a6a6a" />
      </mesh>
      <mesh position={[0, 1.5, -2.6]} castShadow>
        <boxGeometry args={[2.2, 1, 1.4]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 4.6, -2.6]}>
        <coneGeometry args={[1.8, 0.8, 16]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.6} roughness={0.35} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 3, -2.6]}>
          <cylinderGeometry args={[0.07, 0.07, 3.2, 8]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      <Bean position={[0, 1.0, -2.5]} scale={1.15} pose={BP.sit} look={{ ...SHIVAJI, hatColor: "#ff8a1a" }} blink={f % 80 < 4} />
      <mesh position={[3.4, 3, -2.5]}>
        <cylinderGeometry args={[0.05, 0.05, 6, 6]} />
        <meshStandardMaterial color="#6a4a2a" />
      </mesh>
      <Flag position={[3.42, 5.4, -2.5]} w={2.2} h={1.4} color="#ff7a00" />
      {crowd.map((c, i) => (
        <Bean key={i} position={[c.x, 0, c.z]} rotY={Math.PI + (c.x > 0 ? 0.5 : -0.5)} scale={1.0} pose={f >= fC ? BP.cheer : BP.idle} look={{ body: c.c, legs: "#e8dcc0", hat: "turban", hatColor: i % 2 ? "#e07a1a" : "#f2ead8", skin: "#c98e6a" }} />
      ))}
      {f >= fC &&
        new Array(40).fill(0).map((_, i) => {
          const ph = (((f - fC) * 0.02 + rand(i, 5)) % 1 + 1) % 1;
          return (
            <sprite key={i} position={[(rand(i + 1, 5) - 0.5) * 8 + Math.sin(f / 10 + i) * 0.3, 7 - ph * 7, -2 + (rand(i + 2, 5) - 0.5) * 6]} scale={[0.14, 0.14, 1]}>
              <spriteMaterial map={tex} color={i % 2 ? "#ff8a1a" : "#ffd84d"} transparent opacity={0.95} depthWrite={false} toneMapped={false} />
            </sprite>
          );
        })}
      <CameraRig pos={lerp3([0, 3.6, 12], [0, 3.0, 8.5], t)} look={[0, 2.2, -2.5]} fov={50} />
    </Stage3D>
  );
};

export const Cta: React.FC<SP> = ({ words, dur }) => {
  const f = useCurrentFrame();
  const fP = wordFrame(words, "pata");
  const fCom = wordFrame(words, "comment");
  const fAur = wordFrame(words, "aur");
  const fIti = wordFrame(words, "itihaas");
  const fSub = wordFrame(words, "subscribe");
  const t = prog(f, 0, dur);
  const focus = prog(f, fAur - 2, fAur + 10);
  const pose: BeanPose = { ...BP.idle, ra: [2.6, -0.3] };
  return (
    <Stage3D
      exposure={1.3}
      tint="#000000"
      tintOp={focus * 0.45}
      overlay={<g>
        {f < fCom - 2 && <VoteButtons y={OY} at={fP - 2} left="HAAN" right="NAHI" />}
        {f < fIti && f >= fCom - 2 && <g opacity={1 - prog(f, fAur, fIti)}><CommentBubble x={540} y={600} at={fCom - 2} /></g>}
        <ChannelCard x={540} y={470} at={fIti - 4} clickAt={fSub + 4} />
      </g>}
    >
      <fog attach="fog" args={["#ff9a60", 40, 220]} />
      <SkyDome top="#2a2a6a" horizon="#ff8a40" />
      <sprite position={[0, 6, -120]} scale={[60, 60, 1]}>
        <spriteMaterial map={softTexture()} color="#ffcf7a" transparent opacity={0.95} depthWrite={false} fog={false} />
      </sprite>
      <ambientLight intensity={0.55} />
      <directionalLight position={[0, 8, -60]} color="#ffb070" intensity={2.4} />
      {new Array(7).fill(0).map((_, i) => (
        <mesh key={i} position={[-60 + i * 20, -10, -80 - (i % 2) * 20]}>
          <coneGeometry args={[26, 40, 6]} />
          <meshStandardMaterial color="#3a3a3a" flatShading />
        </mesh>
      ))}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[14, 2, 4]} />
        <meshStandardMaterial color="#5a5048" />
      </mesh>
      {new Array(7).fill(0).map((_, i) => (
        <mesh key={i} position={[-6 + i * 2, 0.4, 1.6]}>
          <boxGeometry args={[1, 0.8, 0.8]} />
          <meshStandardMaterial color="#5a5048" />
        </mesh>
      ))}
      <Bean position={[0.4, 0, 0]} rotY={Math.PI} scale={1.2} pose={pose} look={{ ...SHIVAJI, held: "stick" }} />
      <mesh position={[-1.2, 2.5, -0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 5, 6]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      <Flag position={[-1.18, 4.4, -0.2]} w={2.0} h={1.3} color="#ff7a00" seed={2} />
      <CameraRig pos={lerp3([1.4, 1.6, 6], [1.0, 1.8, 7], t)} look={[0, 2.6, -10]} fov={50} />
    </Stage3D>
  );
};

export const SCENES = { hook: Hook, who: Who, durbar: Durbar, plan: Plan, check: Check, escape: Escape, decoy: Decoy, sadhu: Sadhu, crown: Crown, cta: Cta };
