import React from "react";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook } from "../../components/three/Bean";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { rand, softTexture } from "../../components/three/World";
import { lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/kohinoor-curse.timeline.json";

/** Brilliant-cut diamond (crown + pavilion), axis +y. */
const Diamond: React.FC<{ position: V3; s?: number; spin?: number; glow?: number }> = ({ position, s = 1, spin = 0, glow = 1 }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  return (
    <group position={position} scale={s}>
      <group rotation={[0.15, spin, 0]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.52, 1.0, 0.36, 8]} />
          <meshStandardMaterial color="#e8f6ff" metalness={0.9} roughness={0.04} emissive="#9fe8ff" emissiveIntensity={0.25 * glow} flatShading />
        </mesh>
        <mesh position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[1.0, 0.9, 8]} />
          <meshStandardMaterial color="#d8eeff" metalness={0.9} roughness={0.04} emissive="#7fd8ff" emissiveIntensity={0.2 * glow} flatShading />
        </mesh>
      </group>
      {new Array(7).fill(0).map((_, i) => {
        const tw = Math.max(0, Math.sin(f / 5 + i * 1.9));
        return (
          <sprite key={i} position={[Math.cos(i * 0.9) * 0.9, 0.2 + Math.sin(i * 1.3) * 0.4, Math.sin(i * 0.9) * 0.9]} scale={[0.6 * tw * glow, 0.6 * tw * glow, 1]}>
            <spriteMaterial map={tex} color="#ffffff" transparent opacity={0.9} depthWrite={false} toneMapped={false} />
          </sprite>
        );
      })}
      <pointLight color="#bff4ff" intensity={10 * glow} distance={6} />
    </group>
  );
};

const Crown: React.FC<{ position: V3; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.62, 0.6, 0.5, 24, 1, true]} />
      <meshStandardMaterial color="#e8b23a" metalness={0.85} roughness={0.25} side={2} />
    </mesh>
    <mesh position={[0, 0.45, 0]}>
      <sphereGeometry args={[0.56, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#5a1a6a" roughness={0.9} />
    </mesh>
    {[0, Math.PI / 2].map((r) => (
      <mesh key={r} position={[0, 0.5, 0]} rotation={[0, r, 0]}>
        <torusGeometry args={[0.6, 0.05, 6, 24, Math.PI]} />
        <meshStandardMaterial color="#e8b23a" metalness={0.85} roughness={0.25} />
      </mesh>
    ))}
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[0.06, 0.24, 0.06]} />
      <meshStandardMaterial color="#e8b23a" metalness={0.85} />
    </mesh>
    <mesh position={[0, 1.25, 0]}>
      <boxGeometry args={[0.18, 0.06, 0.06]} />
      <meshStandardMaterial color="#e8b23a" metalness={0.85} />
    </mesh>
    <Diamond position={[0, 0.3, 0.62]} s={0.16} glow={0.6} />
  </group>
);

const Stage: React.FC<{ color?: string; light?: string }> = ({ color = "#140a12", light = "#fff2d8" }) => (
  <>
    <color attach="background" args={[color]} />
    <ambientLight intensity={0.35} />
    <spotLight position={[0, 7, 3]} angle={0.45} penumbra={0.6} intensity={140} color={light} castShadow />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#2a1420" roughness={0.9} />
    </mesh>
    <mesh position={[0, 4, -5]}>
      <planeGeometry args={[30, 10]} />
      <meshStandardMaterial color="#3a1a2a" />
    </mesh>
  </>
);

const NADIR: BeanLook = { body: "#2a2a30", legs: "#2a2a30", hat: "turban", hatColor: "#1a1a1a", beard: "#111", skin: "#c98e6a", coat: true };
const RANJIT: BeanLook = { body: "#f2ead8", legs: "#f2ead8", hat: "turban", hatColor: "#e07a1a", beard: "#f0f0f0", skin: "#c98e6a", coat: true };
const DULEEP: BeanLook = { body: "#f2ead8", legs: "#f2ead8", hat: "turban", hatColor: "#e8b23a", skin: "#d2a07a" };
const OFFICER: BeanLook = { body: "#b0123a", legs: "#1a1a2a", hat: "officer", hatColor: "#111", skin: "#e8c0a0" };
const QUEEN: BeanLook = { body: "#5a1a6a", legs: "#5a1a6a", hat: "hair", hatColor: "#4a3020", skin: "#f0d0b8", coat: true };
const KINGS = ["#2a2a30", "#5a2a1a", "#f2ead8", "#2a4a6a"];

const World: React.FC<WP> = ({ f, t, x, ramp, after }) => {
  const set = (x.set as string) ?? "vault";
  if (set === "mine")
    return (
      <>
        <color attach="background" args={["#0e0a08"]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[1.5, 2.4, 1.5]} color="#ffb060" intensity={20} distance={10} />
        {new Array(14).fill(0).map((_, i) => (
          <mesh key={i} position={[(rand(i, 3) - 0.5) * 10, rand(i + 1, 3) * 5, -3 - rand(i + 2, 3) * 3]} scale={1.5 + rand(i + 3, 3) * 2}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#4a3a2e" flatShading roughness={1} />
          </mesh>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#3a2a1e" />
        </mesh>
        <Diamond position={[0, 1.3, -1.4]} s={0.35} spin={f * 0.03} glow={1.2} />
        <Bean position={[-1.6, 0, 0.4]} rotY={0.6} scale={1.0} pose={{ ...BP.idle, ra: [2.4 + Math.sin(f / 4) * 0.5, -0.3] }} look={{ body: "#8a6a4a", legs: "#5a4a3a", hat: "turban", hatColor: "#e8dcc0", skin: "#a87a5a", held: "stick" }} />
        <Bean position={[1.8, 0, 0.6]} rotY={-0.7} scale={1.0} pose={BP.point} look={{ body: "#6a4a2a", legs: "#5a4a3a", hat: "turban", hatColor: "#c0392b", skin: "#a87a5a", held: "lantern" }} />
      </>
    );
  if (set === "throne") {
    const grab = ramp(x.nadirAt, 20);
    return (
      <>
        <Stage color="#140a08" light="#ffe2b0" />
        <group position={[0, 0, -1.5]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[3.6, 1, 2.2]} />
            <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} />
          </mesh>
          {new Array(11).fill(0).map((_, i) => {
            const a = -1.3 + i * 0.26;
            return (
              <mesh key={i} position={[Math.sin(a) * 1.6, 2.4 + Math.cos(a) * 1.6, -0.9]} rotation={[0, 0, -a]}>
                <planeGeometry args={[0.36, 1.6]} />
                <meshStandardMaterial color={i % 3 === 0 ? "#1a8a7a" : i % 3 === 1 ? "#2a5ab8" : "#3a9a3a"} emissive="#2a6a6a" emissiveIntensity={0.3} side={2} />
              </mesh>
            );
          })}
          {[-1.6, 1.6].map((px) => (
            <mesh key={px} position={[px, 2.4, 0.8]}>
              <cylinderGeometry args={[0.08, 0.08, 3.8, 8]} />
              <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 4.4, 0]}>
            <boxGeometry args={[3.6, 0.2, 2.2]} />
            <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
        <Diamond position={[lerp(0, 1.6, grab), lerp(2.2, 1.6, grab), lerp(-0.9, 1.6, grab)]} s={0.22} spin={f * 0.04} />
        {after(x.nadirAt, -8) && <Bean position={[2.2, 0, 2.2]} rotY={-2.4} scale={1.15} pose={grab > 0.5 ? BP.hold : BP.point} look={NADIR} />}
      </>
    );
  }
  if (set === "ranjit") {
    const fallen = !after(x.ranjitAt);
    return (
      <>
        <Stage color={fallen ? "#1a0606" : "#140a08"} light={fallen ? "#ff6a5a" : "#ffe2b0"} />
        {fallen ? (
          <group position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2 - 0.1]}>
            <Bean position={[0, 0, 0]} scale={1.1} pose={BP.idle} look={{ ...NADIR, eyes: "closed" }} />
          </group>
        ) : (
          <>
            <mesh position={[0, 0.4, -0.4]} castShadow>
              <boxGeometry args={[2.4, 0.8, 1.6]} />
              <meshStandardMaterial color="#c9a24a" metalness={0.6} roughness={0.35} />
            </mesh>
            <Bean position={[0, 0.8, -0.3]} scale={1.15} pose={BP.sit} look={RANJIT} blink={f % 80 < 4} />
            <Diamond position={[-0.62, 1.95, 0.05]} s={0.12} spin={f * 0.04} />
          </>
        )}
      </>
    );
  }
  if (set === "duleep") {
    const give = ramp(x.giveAt, 24);
    return (
      <>
        <Stage color="#0e0c12" light="#e8ecff" />
        <Bean position={[-1.2, 0, 0]} rotY={0.9} scale={0.75} pose={BP.hold} look={DULEEP} blink={f % 60 < 4} />
        <Bean position={[1.4, 0, 0.2]} rotY={-0.9} scale={1.15} pose={give > 0.5 ? BP.hold : BP.point} look={OFFICER} />
        <Diamond position={[lerp(-0.7, 0.8, give), lerp(1.0, 1.4, give), lerp(0.4, 0.7, give)]} s={0.14} spin={f * 0.04} />
      </>
    );
  }
  if (set === "queens")
    return (
      <>
        <Stage color="#120a14" light="#fff0e0" />
        <mesh position={[0.8, 0.9, 0.4]} castShadow>
          <boxGeometry args={[1.2, 0.3, 1.0]} />
          <meshStandardMaterial color="#7a1020" roughness={0.9} />
        </mesh>
        <mesh position={[0.8, 0.4, 0.4]}>
          <cylinderGeometry args={[0.12, 0.16, 0.8, 10]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.6} />
        </mesh>
        <Crown position={[0.8, 1.05, 0.4]} s={0.55} />
        <Bean position={[-1.0, 0, 0]} rotY={0.5} scale={1.1} pose={BP.idle} look={QUEEN} blink={f % 70 < 4} />
      </>
    );
  if (set === "tower")
    return (
      <>
        <color attach="background" args={["#06060a"]} />
        <ambientLight intensity={0.25} />
        <spotLight position={[0, 6, 2]} angle={0.35} penumbra={0.5} intensity={160} color="#f4f0ff" castShadow />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#14141a" />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.6, 1.2, 1.6]} />
          <meshStandardMaterial color="#1a1a22" />
        </mesh>
        <Crown position={[0, 1.25, 0]} s={0.7} />
        <mesh position={[0, 1.9, 0]}>
          <boxGeometry args={[1.5, 1.4, 1.5]} />
          <meshStandardMaterial color="#d8ecff" transparent opacity={0.1} roughness={0.05} depthWrite={false} />
        </mesh>
      </>
    );
  // vault (default): the diamond on a pedestal, kings toppling behind
  const fall = ramp(x.fallAt, 24);
  return (
    <>
      <Stage />
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 1.0, 16]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.4} />
      </mesh>
      <Diamond position={[0, 1.55, 0]} s={0.42} spin={f * 0.03 + t} glow={1.2} />
      {x.fallers === true &&
        KINGS.map((c, i) => (
          <group key={i} position={[-3 + i * 2, 0, -3]} rotation={[0, 0, -fall * (Math.PI / 2 - 0.15) * (i % 2 ? 1 : -1)]}>
            <Bean position={[0, 0, 0]} scale={1.1} pose={BP.idle} look={{ body: c, legs: c, hat: "turban", hatColor: i % 2 ? "#e8b23a" : "#ffffff", beard: "#222", skin: "#3a2a2a", coat: true, eyes: fall > 0.5 ? "closed" : "normal" }} />
          </group>
        ))}
    </>
  );
};

export const SCENES = makeScenes(World, {
  hook: sh([0, 1.9, 6.5], [0, 1.7, 4.6], [0, 1.5, 0], [0, 1.5, 0], { entry: false, x: { fallers: true, fallAt: "raaj" }, ov: [chip("JIS AADMI NE PEHNA...", "aadmi", { until: "raaj" }), stamp("RAAJ KHATAM?", "raaj", { size: 92 })] }),
  name: sh([1.5, 1.7, 3.2], [1.0, 1.6, 2.6], [0, 1.5, 0], [0, 1.5, 0], { ov: [tag("KOH-I-NOOR", "kohinoor", { size: 64, until: "roshni" }), chip("ROSHNI KA PAHAAD", "roshni", { bg: "#1a3a5a" })] }),
  origin: sh([3, 1.9, 6.4], [2.4, 1.7, 5.2], [0, 1.2, -0.6], [0, 1.2, -0.6], { x: { set: "mine" }, ov: [chip("MAANA JAATA HAI...", undefined, { bg: "#4a1a6a", until: "golconda" }), tag("GOLCONDA KI KHADAAN", "golconda", { size: 46 })] }),
  mughal: sh([0, 2.8, 8], [0.4, 2.5, 6.4], [0, 2.4, -1], [0.6, 2.0, 0], { x: { set: "throne", nadirAt: "nadir" }, ov: [tag("MAYUR SINGHASAN", "mayur", { size: 52, until: "1739" }), date("1739", "SAN", "1739"), stamp("NADIR SHAH KI LOOT!", "loot", { size: 64 })] }),
  ranjit: sh([0, 2.2, 6.4], [0, 1.9, 5], [0, 1.2, 0], [0, 1.4, 0], { x: { set: "ranjit", ranjitAt: "phir" }, ov: [stamp("HATYA!", "hatya", { until: "phir", size: 100 }), tag("MAHARAJA RANJIT SINGH", "ranjit", { size: 44 })] }),
  duleep: sh([3.4, 2, 6.4], [2.6, 1.8, 5.2], [0, 1.1, 0], [0, 1.1, 0], { x: { set: "duleep", giveAt: "le" }, ov: [date("1849"), tag("DULEEP SINGH (10 SAAL)", "duleep", { size: 44 })] }),
  curse: sh([0, 2, 6.6], [0, 1.7, 4.8], [0, 1.5, 0], [0, 1.5, 0], { x: { fallers: true, fallAt: "bhagwan" }, sepia: true, ov: [chip("LOKKATHA", "lokkatha", { bg: "#4a1a6a", until: "bhagwan" }), stamp("SIRF BHAGWAN YA AURAT", "bhagwan", { size: 56 })] }),
  queens: sh([2.8, 1.9, 5.4], [2.1, 1.7, 4.4], [0, 1.3, 0], [0, 1.3, 0], { x: { set: "queens" }, ov: [chip("BRITAIN MEIN?", "britain", { until: "raaniyon" }), stamp("SIRF RAANIYON NE!", "raaniyon", { size: 74 })] }),
  today: sh([0, 2.2, 5.6], [0, 1.9, 4.2], [0, 1.6, 0], [0, 1.6, 0], { x: { set: "tower" }, ov: [tag("TOWER OF LONDON", "tower", { size: 56, until: "taaj" }), chip("TAAJ MEIN JADA", "taaj", { bg: "#5a1a6a" })] }),
  cta: sh([0, 1.8, 5.4], [0, 1.7, 4.4], [0, 1.5, 0], [0, 1.5, 0], { ov: [cta("SHRAAP", "SANYOG")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "kohinoor-curse/mix.m4a", line1: "IS HEERE NE KITNE", line2: "RAAJ GIRAAYE?", nudge: "duleep" });
export const KohinoorCurse = short.Ep;
export const kohinoorFrames = short.total;
