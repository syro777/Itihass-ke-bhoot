import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook } from "../../components/three/Bean";
import { HauntFX } from "../../components/three/Haunt";
import { Room } from "../../components/three/Mystery3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { Clouds, Mist, rand, SkyDome, softTexture, Stars } from "../../components/three/World";
import { FPS, lerp, Timeline } from "../../lib/util";
import timelineJson from "../../data/brown-lady.timeline.json";
import { Moon, NightLights } from "../bhootiya-5/Worlds";

const OAK = "#4a2e1a";
const OAK_D = "#2e1a0e";
const DOROTHY: BeanLook = { body: "#6a4a2a", legs: "#6a4a2a", hat: "hair", hatColor: "#4a3020", coat: true, skin: "#f0d0b8" };
const LORD: BeanLook = { body: "#8a1a1a", legs: "#2a1a10", hat: "hair", hatColor: "#f0f0ea", coat: true, skin: "#e8c0a0" };
const PHOTOG: BeanLook = { body: "#3a3a40", legs: "#2a2a30", hat: "cap", hatColor: "#2a2a30", skin: "#e8c0a0" };

const Box: React.FC<{ p: V3; s: V3; c?: string; r?: V3 }> = ({ p, s, c = OAK, r = [0, 0, 0] }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={0.85} />
  </mesh>
);

/** Translucent lady in a long gown; op 0..1. */
const Apparition: React.FC<{ position: V3; op: number; s?: number }> = ({ position, op, s = 1 }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  if (op <= 0.01) return null;
  const c = "#e8d8b8";
  const m = (o: number) => <meshBasicMaterial color={c} transparent opacity={o * op} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />;
  return (
    <group position={[position[0], position[1] + Math.sin(f / 18) * 0.06, position[2]]} scale={s}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.55 + i * 0.3, 0]}>
          <cylinderGeometry args={[0.32 - i * 0.04, 0.62 - i * 0.12, 1.1 - i * 0.2, 16, 1, true]} />
          {m(0.12 + i * 0.08)}
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.6, 12]} />
        {m(0.35)}
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.2, 14, 10]} />
        {m(0.45)}
      </mesh>
      <mesh position={[0, 2.06, -0.04]} scale={[1.2, 1.35, 1.2]}>
        <sphereGeometry args={[0.22, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        {m(0.28)}
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.24, 1.45, 0.08]} rotation={[0.5, 0, sd * 0.2]}>
          <cylinderGeometry args={[0.05, 0.06, 0.6, 8]} />
          {m(0.3)}
        </mesh>
      ))}
      {[-1, 1].map((sd) => (
        <mesh key={`e${sd}`} position={[sd * 0.07, 2.02, 0.18]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial color="#000" transparent opacity={0.9 * op} />
        </mesh>
      ))}
      <sprite position={[0, 1.3, 0]} scale={[2.4, 3.6, 1]}>
        <spriteMaterial map={tex} color="#d8c8a0" transparent opacity={0.35 * op} depthWrite={false} toneMapped={false} />
      </sprite>
      <pointLight position={[0, 1.4, 0.4]} color="#e8d8b0" intensity={6 * op} distance={6} />
    </group>
  );
};

const Candle: React.FC<{ position: V3 }> = ({ position }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  const fl = 0.8 + 0.2 * Math.sin(f / 2 + position[0]) * Math.sin(f / 5.3 + position[2]);
  return (
    <group position={position}>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
        <meshStandardMaterial color="#f0ead8" />
      </mesh>
      <sprite position={[0, 0.06, 0]} scale={[0.35 * fl, 0.5 * fl, 1]}>
        <spriteMaterial map={tex} color="#ffb050" transparent opacity={0.9} depthWrite={false} toneMapped={false} />
      </sprite>
      <pointLight position={[0, 0.1, 0.2]} color="#ffa040" intensity={6 * fl} distance={7} />
    </group>
  );
};

const Portrait: React.FC<{ position: V3; rotY: number; seed: number }> = ({ position, rotY, seed }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 320;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1a120c";
    g.fillRect(0, 0, 256, 320);
    const gr = g.createRadialGradient(128, 120, 10, 128, 140, 140);
    gr.addColorStop(0, ["#a88a6a", "#9a7a5a", "#8a6a4a"][seed % 3]);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(128, 120, 46, 60, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = ["#2a1a3a", "#3a1a1a", "#1a2a1a"][seed % 3];
    g.fillRect(60, 190, 136, 130);
    g.fillStyle = "#000";
    g.fillRect(108, 108, 10, 6);
    g.fillRect(138, 108, 10, 6);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [seed]);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[1.5, 1.85, 0.08]} />
        <meshStandardMaterial color="#8a6a2a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh>
        <planeGeometry args={[1.25, 1.6]} />
        <meshStandardMaterial map={tex} />
      </mesh>
    </group>
  );
};

/** Oak staircase hall: one flight rising towards -z to a landing, panelled walls, portraits, candles. */
const Stairs: React.FC<{ x: WP["x"]; f: number; t: number; ramp: WP["ramp"]; after: WP["after"] }> = ({ x, f, t, ramp, after }) => {
  const N = 13;
  const ghostOp = x.ghost === true ? 0.9 : after(x.ghostAt) ? ramp(x.ghostAt, 18) * 0.9 : 0;
  const descend = x.descend === true ? t : after(x.ghostAt) ? Math.min(1, t * 1.2) : 0;
  const gi = lerp(typeof x.from === "number" ? (x.from as number) : N - 1, 3, descend);
  const flash = x.flashAt ? Math.max(0, 1 - Math.abs(f - (typeof x.flashAt === "number" ? (x.flashAt as number) : -999)) / 4) : 0;
  return (
    <>
      <color attach="background" args={["#030202"]} />
      <fog attach="fog" args={["#0a0806", 8, 30]} />
      <ambientLight intensity={0.3} color="#c8a880" />
      <directionalLight position={[3, 8, 6]} intensity={0.4} color="#a8b8d8" />
      <pointLight position={[0, 6, 2]} color="#ffb070" intensity={14} distance={16} />
      <pointLight position={[0, 7, -4]} color="#8aa0d0" intensity={8} distance={12} />
      <Room wall="#3a2618" floor="#22160e" w={12} d={12} h={11} />
      {/* wainscot panels */}
      {[-1, 1].map((sd) =>
        new Array(6).fill(0).map((_, i) => (
          <Box key={`${sd}${i}`} p={[sd * 5.96, 1.2, 4.5 - i * 1.8]} s={[0.06, 2.4, 1.6]} c={OAK_D} />
        )),
      )}
      {/* the flight */}
      {new Array(N).fill(0).map((_, i) => (
        <group key={i}>
          <Box p={[0, 0.17 + i * 0.34, 3 - i * 0.62]} s={[4.4, 0.34, 0.62]} c={OAK} />
          <mesh position={[0, 0.35 + i * 0.34, 3 - i * 0.62 + 0.2]}>
            <boxGeometry args={[2.6, 0.012, 0.3]} />
            <meshStandardMaterial color="#5a1010" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.35 + 6 * 0.34, -0.72]} rotation={[-Math.atan2(0.34, 0.62), 0, 0]}>
        <planeGeometry args={[2.6, N * 0.71]} />
        <meshStandardMaterial color="#5a1010" roughness={1} />
      </mesh>
      <Box p={[0, N * 0.34 + 0.15, 3 - N * 0.62 - 1.2]} s={[9, 0.3, 3]} c={OAK} />
      {[-1, 1].map((sd) => (
        <group key={sd}>
          {new Array(N).fill(0).map((_, i) => (
            <mesh key={i} position={[sd * 2.15, 0.9 + i * 0.34, 3 - i * 0.62]}>
              <cylinderGeometry args={[0.04, 0.05, 1.1, 8]} />
              <meshStandardMaterial color={OAK_D} />
            </mesh>
          ))}
          <mesh position={[sd * 2.15, 1.5 + 6 * 0.34, -0.72]} rotation={[-Math.atan2(0.34, 0.62), 0, 0]}>
            <boxGeometry args={[0.14, 0.12, N * 0.71]} />
            <meshStandardMaterial color={OAK_D} />
          </mesh>
          <mesh position={[sd * 2.15, 1.0, 3.3]}>
            <boxGeometry args={[0.3, 2, 0.3]} />
            <meshStandardMaterial color={OAK_D} />
          </mesh>
        </group>
      ))}
      <Portrait position={[-5.9, 4.4, -1]} rotY={Math.PI / 2} seed={0} />
      <Portrait position={[5.9, 4.6, -0.4]} rotY={-Math.PI / 2} seed={1} />
      <Portrait position={[0, 7.2, -5.9]} rotY={0} seed={2} />
      {[
        [-5.8, 3.2, 2],
        [5.8, 3.2, 2],
        [-3.6, 6.4, -5.8],
        [3.6, 6.4, -5.8],
      ].map((p, i) => (
        <Candle key={i} position={p as V3} />
      ))}
      <Apparition position={[0, 0.34 * gi + 0.2, 3 - gi * 0.62]} op={ghostOp * (0.85 + 0.15 * Math.sin(f / 3))} s={1.15} />
      {x.photogs === true && (
        <group position={[0.4, 0, 7.2]}>
          <Bean position={[-0.9, 0, 0.4]} rotY={Math.PI} scale={1} pose={after(x.pointAt) ? { ...BP.point, ra: [1.8, -0.1] } : BP.hold} look={PHOTOG} />
          <Bean position={[0.9, 0, 0.6]} rotY={Math.PI + 0.2} scale={1} pose={BP.hold} look={{ ...PHOTOG, hat: "none", glasses: true }} />
          <group position={[0.1, 0, -0.4]}>
            {[-1, 0, 1].map((k) => (
              <mesh key={k} position={[k * 0.25, 0.75, k === 0 ? 0.3 : -0.1]} rotation={[k === 0 ? -0.25 : 0.1, 0, k * 0.25]}>
                <cylinderGeometry args={[0.02, 0.02, 1.5, 6]} />
                <meshStandardMaterial color="#3a2a1a" />
              </mesh>
            ))}
            <Box p={[0, 1.6, 0]} s={[0.5, 0.5, 0.6]} c="#1a1a1a" />
            <mesh position={[0, 1.6, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.16, 0.3, 14]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.6} />
            </mesh>
          </group>
        </group>
      )}
      {flash > 0 && <pointLight position={[0.4, 2, 6.6]} color="#ffffff" intensity={300 * flash} distance={40} />}
    </>
  );
};

/** The house in fog. */
const Hall: React.FC = () => {
  const trees = useMemo(() => new Array(14).fill(0).map((_, i) => ({ x: (i % 2 ? 1 : -1) * (22 + rand(i, 3) * 26), z: -10 + rand(i + 1, 3) * 30 })), []);
  return (
    <>
      <fog attach="fog" args={["#141a24", 20, 120]} />
      <SkyDome top="#020308" horizon="#1e2634" />
      <Stars opacity={0.5} />
      <Moon position={[-30, 40, -120]} size={22} />
      <NightLights moon={[-30, 40, -120]} strength={0.7} />
      <Clouds y={34} count={10} spread={140} opacity={0.55} color="#1a2030" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#1a2418" roughness={1} />
      </mesh>
      <group position={[0, 0, -10]}>
        <Box p={[0, 6, 0]} s={[34, 12, 12]} c="#b8b0a0" />
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 15, 12, 0]}>
            {[0, 1, 2].map((k) => (
              <Box key={k} p={[0, 0.8 + k * 1.2, 0]} s={[4 - k * 1.2, 1.2, 12.2]} c="#a8a090" />
            ))}
          </group>
        ))}
        <Box p={[0, 12.4, 0]} s={[22, 0.8, 12.4]} c="#6a6a72" />
        {[-3, -1, 1, 3].map((cx) => (
          <mesh key={cx} position={[cx, 4.5, 6.6]}>
            <cylinderGeometry args={[0.4, 0.45, 9, 12]} />
            <meshStandardMaterial color="#d0c8b8" />
          </mesh>
        ))}
        <mesh position={[0, 10, 6.6]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.01, 5, 2, 3]} />
          <meshStandardMaterial color="#c8c0b0" />
        </mesh>
        {new Array(24).fill(0).map((_, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const lit = (i * 7) % 11 === 3;
          return (
            <mesh key={i} position={[-14 + col * 4, 2.6 + row * 3.4, 6.02]}>
              <planeGeometry args={[1.3, 2.0]} />
              <meshBasicMaterial color={lit ? "#ffc860" : "#0a0c12"} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, 0, tr.z]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.2, 0.4, 8, 6]} />
            <meshStandardMaterial color="#14100c" />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[Math.cos(k * 2 + i) * 1.1, 6.5 + k, Math.sin(k * 2 + i) * 1.1]} rotation={[Math.sin(k + i), 0, Math.cos(k + i) * 0.9]}>
              <cylinderGeometry args={[0.05, 0.12, 3, 5]} />
              <meshStandardMaterial color="#14100c" />
            </mesh>
          ))}
        </group>
      ))}
      <Mist count={16} y={0.6} spread={40} opacity={0.3} color="#a8b8c8" />
    </>
  );
};

/** 1720s legend room: Dorothy at the window, the lord turning the key. */
const Locked: React.FC<{ x: WP["x"]; f: number; ramp: WP["ramp"]; after: WP["after"] }> = ({ x, ramp, after }) => {
  const shut = ramp(x.shutAt, 14);
  return (
    <>
      <color attach="background" args={["#040302"]} />
      <ambientLight intensity={0.25} color="#ffd8b0" />
      <Room wall="#4a3424" floor="#2a1c12" w={10} d={8} h={5} windowGlow={0.5} />
      <Candle position={[1.4, 1.2, -2.6]} />
      <Box p={[1.4, 0.5, -2.6]} s={[1.2, 1.0, 0.8]} c={OAK} />
      <Bean position={[-1.6, 0, -1.8]} rotY={-0.6} scale={1.05} pose={after(x.shutAt) ? { ...BP.facepalm } : { ...BP.idle, head: [0.6, 0] }} look={DOROTHY} />
      {/* door on the right wall */}
      <group position={[4.97, 0, 0.6]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 1.5, -0.02]}>
          <planeGeometry args={[1.6, 3.0]} />
          <meshBasicMaterial color="#0a0604" />
        </mesh>
        <group position={[-0.8, 0, 0]} rotation={[0, (1 - shut) * 1.2, 0]}>
          <mesh position={[0.8, 1.5, 0]}>
            <boxGeometry args={[1.6, 3.0, 0.1]} />
            <meshStandardMaterial color={OAK_D} />
          </mesh>
        </group>
        {x.lord === true && shut < 1 && <Bean position={[0, 0, -1.2]} rotY={0} scale={1.05} pose={BP.point} look={LORD} />}
      </group>
      {shut >= 1 && (
        <mesh position={[4.9, 1.4, 0.2]}>
          <boxGeometry args={[0.1, 0.18, 0.4]} />
          <meshStandardMaterial color="#8a7a3a" metalness={0.8} roughness={0.3} />
        </mesh>
      )}
    </>
  );
};

/** Magazine page with the famous image (stylised), and the double-exposure explainer. */
const Paper: React.FC<{ x: WP["x"]; t: number; f: number }> = ({ x, t }) => {
  const mk = (kind: "mag" | "stairs" | "statue") => {
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 800;
    const g = c.getContext("2d")!;
    g.fillStyle = kind === "mag" ? "#efe6d0" : "rgba(0,0,0,0)";
    g.fillRect(0, 0, 600, 800);
    const ph = (x0: number, y0: number, w: number, h: number) => {
      if (kind !== "statue") {
        g.fillStyle = "#3a2a1a";
        g.fillRect(x0, y0, w, h);
        g.strokeStyle = "#6a5236";
        g.lineWidth = 6;
        for (let i = 0; i < 12; i++) {
          g.beginPath();
          g.moveTo(x0 + w * 0.2 - i * 6, y0 + h - i * (h / 13));
          g.lineTo(x0 + w * 0.8 + i * 6, y0 + h - i * (h / 13));
          g.stroke();
        }
      }
      if (kind !== "stairs") {
        const gr = g.createRadialGradient(x0 + w / 2, y0 + h * 0.45, 4, x0 + w / 2, y0 + h * 0.5, w * 0.35);
        gr.addColorStop(0, "rgba(250,240,220,0.95)");
        gr.addColorStop(1, "rgba(250,240,220,0)");
        g.fillStyle = gr;
        g.beginPath();
        g.ellipse(x0 + w / 2, y0 + h * 0.5, w * 0.16, h * 0.34, 0, 0, Math.PI * 2);
        g.fill();
      }
    };
    if (kind === "mag") {
      g.fillStyle = "#1a1a1a";
      g.font = "900 64px Poppins, serif";
      g.textAlign = "center";
      g.fillText("MAGAZINE", 300, 90);
      g.font = "700 30px Poppins, serif";
      g.fillText("DECEMBER 1936", 300, 135);
      ph(70, 170, 460, 520);
      g.font = "700 28px serif";
      g.fillText("\"The Brown Lady\"", 300, 740);
    } else ph(0, 0, 600, 800);
    const tt = new THREE.CanvasTexture(c);
    tt.colorSpace = THREE.SRGBColorSpace;
    return tt;
  };
  const tex = useMemo(() => ({ mag: mk("mag"), stairs: mk("stairs"), statue: mk("statue") }), []);
  const dbl = x.double === true;
  const k = Math.min(1, t * 1.6);
  return (
    <>
      <color attach="background" args={["#060403"]} />
      <ambientLight intensity={0.5} color="#ffe0c0" />
      <pointLight position={[0.6, 3, 2]} color="#ffd8a0" intensity={18} distance={10} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#3a2414" />
      </mesh>
      {!dbl ? (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0.08]}>
          <planeGeometry args={[3, 4]} />
          <meshStandardMaterial map={tex.mag} />
        </mesh>
      ) : (
        <>
          <mesh position={[lerp(-1.8, 0, k), 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 3.2]} />
            <meshBasicMaterial map={tex.stairs} transparent opacity={0.9} />
          </mesh>
          <mesh position={[lerp(1.8, 0, k), 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 3.2]} />
            <meshBasicMaterial map={tex.statue} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </>
      )}
    </>
  );
};

const World: React.FC<WP> = ({ f, t, x, ramp, after }) => {
  if (x.set === "hall") return <Hall />;
  if (x.set === "locked") return <Locked x={x} f={f} ramp={ramp} after={after} />;
  if (x.set === "paper") return <Paper x={x} t={t} f={f} />;
  return <Stairs x={x} f={f} t={t} ramp={ramp} after={after} />;
};

const TL = timelineJson as Timeline;
const at = (id: string, sec: number) => {
  const s = TL.scenes.find((x) => x.id === id);
  return s ? Math.round((s.start + sec) * FPS) : -100;
};
const clickFrame = (() => {
  const s = TL.scenes.find((x) => x.id === "click");
  const w = s?.words.find((ww) => ww.key === "click");
  return s && w ? Math.round((w.start - s.start) * FPS) : 4;
})();

export const SCENES = makeScenes(World, {
  hook: sh([0.4, 1.6, 9.5], [0.2, 1.8, 7.6], [0, 3.0, 0], [0, 2.6, 0.5], { entry: false, exp: 1.8, shake: 0.03, x: { ghost: true, descend: true, from: 8 }, ov: [chip("DUNIYA KI SABSE MASHHOOR", "duniya", { bg: "#2a1a10", until: "tasveer" }), stamp("BHOOT KI TASVEER!", "tasveer", { size: 82, until: "seedhi" }), date("1936", "SAN", "seedhi")] }),
  place: sh([14, 4, 40], [8, 5, 30], [0, 6, -10], [0, 7, -10], { exp: 1.6, x: { set: "hall" }, ov: [tag("RAYNHAM HALL, ENGLAND", "raynham", { size: 46 })] }),
  legend: sh([1.6, 2.4, 4.4], [1.0, 2.2, 3.4], [-0.6, 1.4, -1.2], [-1.0, 1.4, -1.6], { sepia: true, exp: 1.5, x: { set: "locked", lord: true, shutAt: "band" }, ov: [chip("LOKKATHA", "lokkatha", { bg: "#4a1a6a", until: "dorothy" }), tag("LADY DOROTHY", "dorothy", { size: 54, until: "band" }), stamp("KAMRE MEIN BAND!", "band", { size: 80 })] }),
  sightings: sh([0.8, 1.4, 9.5], [0.5, 1.6, 7.6], [0, 3.6, -2.5], [0, 3.0, -1], { exp: 1.8, shake: 0.03, x: { ghostAt: "aurat" }, ov: [chip("KEHTE HAIN...", "kehte", { bg: "#2a1a10", until: "bhoore" }), stamp("'THE BROWN LADY'", "aurat", { size: 74 })] }),
  captain: sh([-1.6, 1.6, 7.5], [-1.2, 1.7, 6.2], [0, 2.6, -1], [0, 2.4, 0], { exp: 1.8, shake: 0.06, x: { ghost: true, descend: true, from: 9 }, flash: "goli", ov: [tag("EK CAPTAIN", "captain", { size: 54, until: "goli" }), stamp("BANG!", "goli", { size: 120 })] }),
  photo: sh([3.6, 4.4, 13.5], [2.4, 4.0, 12], [0, 2.4, 0], [0, 2.8, -1], { exp: 1.8, x: { photogs: true, ghostAt: "utar", pointAt: "bola" }, ov: [date("1936", "SAN", "1936"), chip("19 SEPT 1936", "photographer", { bg: "#2a1a10", until: "utar" }), stamp("KOI UTAR RAHA HAI!", "utar", { size: 72 })] }),
  click: sh([0.4, 1.6, 9.8], [0.3, 1.7, 9.0], [0, 3.0, -1], [0, 3.0, -1], { sepia: true, exp: 1.8, x: { ghost: true, descend: true, from: 7, flashAt: clickFrame }, flash: "click", ov: [stamp("CLICK!", "click", { size: 120, until: "parchhaain" }), stamp("PARCHHAAIN!", "parchhaain", { size: 100 })] }),
  famous: sh([0.5, 4.6, 1.6], [0.2, 3.8, 1.0], [0, 0, 0], [0, 0, 0], { exp: 1.4, x: { set: "paper" }, ov: [chip("MAGAZINE, DEC 1936", "country", { bg: "#2a1a10", until: "duniya" }), stamp("DUNIYA BHAR MEIN MASHHOOR", "duniya", { size: 58 })] }),
  truth: sh([0.2, 4.4, 0.9], [0.1, 3.6, 0.6], [0, 0, 0], [0, 0, 0], { exp: 1.4, x: { set: "paper", double: true }, ov: [chip("JAANKAR KEHTE HAIN", "jaankar", { bg: "#1a2a4a", until: "double" }), stamp("DOUBLE EXPOSURE?", "double", { size: 78 })] }),
  cta: sh([0.4, 1.5, 9.5], [0.2, 1.7, 8.0], [0, 3.2, -1], [0, 3.2, -1], { exp: 1.8, shake: 0.02, x: { ghost: true, descend: true, from: 8 }, ov: [cta("BHOOT", "CHAAL")] }),
});

const short = makeShort({
  timeline: TL,
  scenes: SCENES,
  audio: "brown-lady/mix.m4a",
  line1: "DUNIYA KI SABSE MASHHOOR",
  line2: "BHOOT KI TASVEER",
  nudge: "place",
  fx: <HauntFX flashes={[at("sightings", 3.0), at("truth", 1.5)]} tint="#140a04" />,
});
export const BrownLady = short.Ep;
export const brownLadyFrames = short.total;
