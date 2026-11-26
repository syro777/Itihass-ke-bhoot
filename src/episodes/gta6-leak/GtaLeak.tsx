import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook, walk } from "../../components/three/Bean";
import { Room } from "../../components/three/Mystery3D";
import { Palm } from "../../components/three/Props3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { rand, SkyDome, softTexture, Stars, textTexture } from "../../components/three/World";
import { Timeline } from "../../lib/util";
import timelineJson from "../../data/gta6-leak.timeline.json";

const PINK = "#ff3cac";
const TEAL = "#2bd2ff";
const HACKER: BeanLook = { body: "#3a3a4c", legs: "#2f4a7a", hat: "hood", hatColor: "#34343f", skin: "#e2b48c" };
const COP: BeanLook = { body: "#1a2440", legs: "#141a2a", hat: "officer", hatColor: "#141a2a", skin: "#d9a57e" };

/** Glitchy screen textures: code rain, the leak title card, access granted. */
const useScreens = () =>
  useMemo(() => {
    const make = (kind: "leak" | "code" | "granted" | "title", seed: number) => {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 576;
      const g = c.getContext("2d")!;
      g.fillStyle = kind === "granted" ? "#2a0008" : "#05080c";
      g.fillRect(0, 0, 1024, 576);
      g.font = "700 22px monospace";
      for (let i = 0; i < 26; i++) {
        g.fillStyle = kind === "granted" ? "#ff4060" : `rgba(80,255,160,${0.25 + rand(i + seed, 5) * 0.5})`;
        let s = "";
        for (let k = 0; k < 60; k++) s += "01{}<>/#$%&ABCDEF"[Math.floor(rand(i * 60 + k + seed * 7, 9) * 17)];
        g.fillText(s, 10 + rand(i, seed) * 30, 22 * i + 10);
      }
      g.textAlign = "center";
      if (kind === "leak" || kind === "title") {
        const off = (rand(seed, 3) - 0.5) * 24;
        g.font = "900 170px Poppins, Arial, sans-serif";
        g.fillStyle = "rgba(43,210,255,0.85)";
        g.fillText("GTA VI", 512 + off, 250);
        g.fillStyle = "rgba(255,60,172,0.85)";
        g.fillText("GTA VI", 512 - off, 250);
        g.fillStyle = "#ffffff";
        g.fillText("GTA VI", 512, 250);
        if (kind === "leak") {
          g.fillStyle = "#e01b1b";
          g.fillRect(262, 300, 500, 110);
          g.font = "900 86px Poppins, Arial, sans-serif";
          g.fillStyle = "#ffffff";
          g.fillText("LEAKED", 512, 388);
        }
      }
      if (kind === "granted") {
        g.font = "900 92px Poppins, Arial, sans-serif";
        g.fillStyle = "#ffffff";
        g.fillText("ACCESS", 512, 260);
        g.fillText("GRANTED", 512, 370);
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    return {
      leak: [0, 1, 2].map((s) => make("leak", s + 1)),
      code: [0, 1, 2].map((s) => make("code", s + 4)),
      granted: [make("granted", 9)],
      title: [0, 1].map((s) => make("title", s + 11)),
    };
  }, []);

const Screen: React.FC<{ position: V3; mode: "leak" | "code" | "granted" | "title"; w?: number; h?: number }> = ({ position, mode, w = 2.8, h = 1.58 }) => {
  const f = useCurrentFrame();
  const tex = useScreens();
  const list = tex[mode];
  const map = list[Math.floor(f / 3) % list.length];
  return (
    <group position={position}>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[w + 0.16, h + 0.16, 0.08]} />
        <meshStandardMaterial color="#0a0a0c" />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 1.2]} color={mode === "granted" ? "#ff4060" : mode === "code" ? "#60ffa0" : TEAL} intensity={14} distance={7} />
      {/* fire stick in the HDMI port */}
      <group position={[w / 2 - 0.4, -h / 2 - 0.02, 0.04]} scale={2.2}>
        <mesh>
          <boxGeometry args={[0.32, 0.09, 0.05]} />
          <meshStandardMaterial color="#141416" />
        </mesh>
        <mesh position={[0.12, 0, 0.03]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshBasicMaterial color={f % 20 < 10 ? "#ffb020" : "#3a2a10"} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

const Phone: React.FC<{ position: V3; on?: boolean }> = ({ position, on = true }) => (
  <group position={position} rotation={[-0.9, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.16, 0.3, 0.02]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    <mesh position={[0, 0, 0.012]}>
      <planeGeometry args={[0.14, 0.27]} />
      <meshBasicMaterial color={on ? "#7affc0" : "#111"} toneMapped={false} />
    </mesh>
  </group>
);

const NeonWindow: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, "#1a0630");
    gr.addColorStop(0.6, "#6a1a6a");
    gr.addColorStop(1, "#ff5a8a");
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 14; i++) {
      const w = 30 + rand(i, 2) * 40;
      const h = 120 + rand(i + 1, 2) * 260;
      const x = i * 38;
      g.fillStyle = "#0a0614";
      g.fillRect(x, 512 - h, w, h);
      for (let k = 0; k < 20; k++) {
        g.fillStyle = rand(i * 20 + k, 4) > 0.5 ? "#ffd070" : rand(k, i) > 0.5 ? TEAL : PINK;
        g.fillRect(x + 5 + (k % 3) * 9, 512 - h + 10 + Math.floor(k / 3) * 18, 5, 7);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group position={[-4.98, 2.1, -0.8]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[3.4, 2.2]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.15, 0, 0.05]}>
          <boxGeometry args={[1.2, 2.4, 0.04]} />
          <meshStandardMaterial color="#3a1a4a" transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
};

const Hotel: React.FC<{ x: WP["x"]; f: number; after: WP["after"] }> = ({ x, f, after }) => {
  const mode = after(x.grantedAt) ? "granted" : x.screen === "code" ? "code" : x.screen === "title" ? "title" : "leak";
  return (
    <>
      <color attach="background" args={["#05030a"]} />
      <ambientLight intensity={0.22} color="#8a7aff" />
      <pointLight position={[-4, 2.6, -0.8]} color={PINK} intensity={16} distance={9} />
      <pointLight position={[3, 3.6, 2]} color="#5a6aff" intensity={6} distance={10} />
      <Room wall="#2a2236" floor="#3a2a34" w={10} d={8} h={4.2} />
      <mesh position={[0, 4.15, -3.9]}>
        <boxGeometry args={[10, 0.06, 0.06]} />
        <meshBasicMaterial color={PINK} toneMapped={false} />
      </mesh>
      <NeonWindow />
      <Screen position={[0.6, 2.3, -3.9]} mode={mode} />
      {/* bed */}
      <mesh position={[-1.2, 0.3, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.6, 4]} />
        <meshStandardMaterial color="#e8e4f0" />
      </mesh>
      <mesh position={[-1.2, 0.62, 1.4]}>
        <boxGeometry args={[3.02, 0.08, 2.4]} />
        <meshStandardMaterial color="#5a2a6a" />
      </mesh>
      <mesh position={[-1.2, 0.75, 2.35]}>
        <boxGeometry args={[2.2, 0.25, 0.6]} />
        <meshStandardMaterial color="#f4f0f8" />
      </mesh>
      {/* hacker on the bed edge, facing the TV */}
      <Bean position={[0.1, 0.28, -0.6]} rotY={Math.PI - 0.12} scale={1} pose={{ ...BP.sit, la: [1.25, 0.25], ra: [1.25, -0.25], head: [0, after(x.lookAt) ? -0.15 : 0.35] }} look={HACKER} />
      <Phone position={[0.1, 1.05, -1.15]} on />
      {/* takeaway mess */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[1.8 + i * 0.4, 0.15, 0.8 - i * 0.3]} rotation={[0, i, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.3, 10]} />
          <meshStandardMaterial color={i % 2 ? "#e01b1b" : "#f0f0f0"} />
        </mesh>
      ))}
      {x.alarm === true && f % 16 < 8 && <pointLight position={[0, 3, 0]} color="#ff2020" intensity={18} distance={12} />}
    </>
  );
};

const ServerRoom: React.FC<{ x: WP["x"]; f: number; t: number; after: WP["after"]; ramp: WP["ramp"] }> = ({ x, f, t, after, ramp }) => {
  const tex = softTexture();
  const clips = useMemo(() => new Array(14).fill(0).map((_, i) => ({ x: (rand(i, 3) - 0.5) * 6, z: (rand(i + 1, 3) - 0.5) * 3, s: rand(i + 2, 3), h: i })), []);
  const clipTex = useMemo(() => [0, 1, 2, 3].map((i) => textTexture([{ text: "▶", size: 120, color: "#ffffff" }, { text: `CLIP ${[7, 23, 51, 88][i]}`, size: 60, color: "#ffd84d" }], 512, 288, ["#2a5a8a", "#6a2a6a", "#2a6a4a", "#8a4a1a"][i])), []);
  const leak = ramp(x.leakAt, 20);
  const money = x.money === true;
  const alarm = x.alarm === true || after(x.alarmAt);
  return (
    <>
      <color attach="background" args={["#03050a"]} />
      <fog attach="fog" args={["#03050a", 26, 70]} />
      <ambientLight intensity={1.3} color="#8aa8ff" />
      <hemisphereLight args={["#9ab8ff", "#202830", 0.9]} />
      <pointLight position={[0, 6, 4]} color="#8aa8ff" intensity={40} distance={30} />
      <pointLight position={[0, 6, -6]} color="#6a9aff" intensity={40} distance={30} />
      {[-2, -8, 4].map((z) => (
        <mesh key={z} position={[0, 6.2, z]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 4]} />
          <meshBasicMaterial color="#cfe0ff" toneMapped={false} />
        </mesh>
      ))}
      {alarm && <pointLight position={[Math.sin(f / 4) * 6, 5, Math.cos(f / 4) * 6]} color="#ff2020" intensity={60} distance={25} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#14181f" metalness={0.4} roughness={0.5} />
      </mesh>
      {[-1, 1].map((side) =>
        new Array(7).fill(0).map((_, i) => (
          <group key={`${side}${i}`} position={[side * 3.2, 0, 4 - i * 2.2]}>
            <mesh position={[0, 2.2, 0]} castShadow>
              <boxGeometry args={[1.4, 4.4, 1.8]} />
              <meshStandardMaterial color="#3a4252" metalness={0.5} roughness={0.4} />
            </mesh>
            {new Array(10).fill(0).map((__, k) => (
              <mesh key={k} position={[-side * 0.71, 0.5 + k * 0.38, (rand(i * 10 + k, side + 3) - 0.5) * 1.2]} rotation={[0, -side * (Math.PI / 2), 0]}>
                <planeGeometry args={[0.14, 0.08]} />
                <meshBasicMaterial color={(f + i * 7 + k * 13) % (12 + k) < 6 ? (alarm ? "#ff3030" : k % 3 ? "#40ff90" : TEAL) : "#0a1a10"} toneMapped={false} />
              </mesh>
            ))}
          </group>
        )),
      )}
      <mesh position={[0, 0.02, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 16]} />
        <meshBasicMaterial color={alarm ? "#5a0a10" : "#0a2a3a"} toneMapped={false} />
      </mesh>
      {leak > 0 &&
        clips.map((c, i) => {
          const q = (t * 1.6 + c.s) % 1;
          return (
            <group key={i} position={[c.x * (0.3 + q), 1.5 + q * 7, -3 + c.z + q * 6]} rotation={[0, (c.s - 0.5) * 0.8, (c.s - 0.5) * 0.4]}>
              <mesh>
                <planeGeometry args={[1.2, 0.68]} />
                <meshBasicMaterial map={clipTex[i % 4]} transparent opacity={leak * Math.min(1, (1 - q) * 3)} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      {leak > 0 && (
        <sprite position={[0, 3, -4]} scale={[6, 6, 1]}>
          <spriteMaterial map={tex} color={TEAL} transparent opacity={0.4 * leak} depthWrite={false} toneMapped={false} />
        </sprite>
      )}
      {money &&
        new Array(36).fill(0).map((_, i) => {
          const sp = 0.6 + rand(i, 8) * 0.6;
          const y = 9 - ((f * 0.08 * sp + rand(i + 1, 8) * 9) % 9);
          return (
            <group key={`m${i}`} position={[(rand(i + 2, 8) - 0.5) * 6, y, -1 + (rand(i + 3, 8) - 0.5) * 6]} rotation={[f * 0.05 * sp + i, i, f * 0.03 + i]}>
              <mesh>
                <boxGeometry args={[0.5, 0.06, 0.24]} />
                <meshStandardMaterial color="#3a8a4a" />
              </mesh>
              <mesh position={[0, 0.035, 0]}>
                <boxGeometry args={[0.12, 0.01, 0.25]} />
                <meshStandardMaterial color="#e8e4c8" />
              </mesh>
            </group>
          );
        })}
    </>
  );
};

const Street: React.FC<{ x: WP["x"]; f: number; t: number; after: WP["after"] }> = ({ f, t }) => {
  const sign = useMemo(() => textTexture([{ text: "HOTEL", size: 150, color: "#ffffff" }], 1024, 256, undefined, PINK), []);
  const windows = useMemo(() => new Array(60).fill(0).map((_, i) => rand(i, 13) > 0.55), []);
  const red = f % 14 < 7;
  return (
    <>
      <fog attach="fog" args={["#1a0a2a", 30, 140]} />
      <SkyDome top="#0a0420" horizon="#ff4a8a" />
      <Stars opacity={0.5} />
      <ambientLight intensity={0.3} color="#8a6aff" />
      <directionalLight position={[-20, 30, 20]} intensity={0.4} color="#c8b0ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#1e1a26" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 6]}>
        <planeGeometry args={[300, 0.15]} />
        <meshBasicMaterial color="#ffd070" />
      </mesh>
      {/* hotel */}
      <group position={[0, 0, -6]}>
        <mesh position={[0, 7, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 14, 6]} />
          <meshStandardMaterial color="#e8d8e8" />
        </mesh>
        {windows.map((on, i) => (
          <mesh key={i} position={[-7.5 + (i % 10) * 1.65, 3.5 + Math.floor(i / 10) * 1.8, 3.01]}>
            <planeGeometry args={[0.9, 1.0]} />
            <meshBasicMaterial color={on ? "#ffd890" : "#2a2440"} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 1.3, 3.02]}>
          <planeGeometry args={[2.4, 2.6]} />
          <meshBasicMaterial color="#ffe8b0" toneMapped={false} />
        </mesh>
        <mesh position={[0, 14.8, 3.2]}>
          <planeGeometry args={[8, 2]} />
          <meshBasicMaterial map={sign} transparent toneMapped={false} />
        </mesh>
        <pointLight position={[0, 14, 5]} color={PINK} intensity={40} distance={20} />
      </group>
      {[-12, -8, 8, 12].map((px, i) => (
        <Palm key={i} position={[px, 0, 2]} scale={1.4} seed={i} />
      ))}
      {/* police car */}
      <group position={[4.5, 0, 5.5]} rotation={[0, -0.3, 0]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[4.2, 0.8, 1.9]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[1.4, 0.82, 1.92]} />
          <meshStandardMaterial color="#1a1a2a" />
        </mesh>
        <mesh position={[-0.2, 1.3, 0]} castShadow>
          <boxGeometry args={[2.2, 0.65, 1.7]} />
          <meshStandardMaterial color="#20242c" metalness={0.4} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[-0.2 + s * 0.3, 1.7, 0]}>
            <boxGeometry args={[0.55, 0.16, 0.5]} />
            <meshBasicMaterial color={(s > 0) === red ? (s > 0 ? "#ff2030" : "#2050ff") : "#202020"} toneMapped={false} />
          </mesh>
        ))}
        {[-1.4, 1.4].map((wx) =>
          [-0.95, 0.95].map((wz) => (
            <mesh key={`${wx}${wz}`} position={[wx, 0.32, wz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.34, 0.34, 0.2, 14]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          )),
        )}
        <pointLight position={[0, 2.2, 0]} color={red ? "#ff2030" : "#2050ff"} intensity={50} distance={16} />
      </group>
      {/* cop with the laptop in an evidence bag */}
      <group position={[2.2, 0, 4.6]}>
        <Bean position={[0, 0, 0]} rotY={-0.4} scale={1.05} pose={BP.hold} look={COP} />
        <group position={[-0.25, 1.15, 0.5]} rotation={[0.2, -0.4, 0]}>
          <mesh>
            <boxGeometry args={[0.7, 0.5, 0.08]} />
            <meshStandardMaterial color="#c8d8e8" transparent opacity={0.45} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.56, 0.38, 0.04]} />
            <meshStandardMaterial color="#2a2a30" />
          </mesh>
          <mesh position={[0, 0.2, 0.05]}>
            <planeGeometry args={[0.5, 0.08]} />
            <meshBasicMaterial color="#e01b1b" />
          </mesh>
        </group>
      </group>
      <Bean position={[-1.5 + t * 1.2, 0, 3.4 - t * 2.4]} rotY={Math.PI + 0.4} scale={1} pose={walk(f * 0.18, 0.5)} look={HACKER} />
    </>
  );
};

const Court: React.FC<{ x: WP["x"]; f: number; after: WP["after"]; ramp: WP["ramp"] }> = ({ x, after, ramp }) => {
  const crest = useMemo(() => textTexture([{ text: "+", size: 300, color: "#e01b1b" }, { text: "SECURE HOSPITAL", size: 64, color: "#1a1a1a" }], 768, 512, "#f4f4f4"), []);
  const hosp = ramp(x.hospAt, 12);
  return (
    <>
      <color attach="background" args={["#0e0a08"]} />
      <ambientLight intensity={0.8} color="#ffe0c0" />
      <pointLight position={[0, 6, 3]} color="#ffd8a0" intensity={50} distance={22} />
      <pointLight position={[2.6, 4, 4]} color="#ffe8c8" intensity={25} distance={12} />
      <pointLight position={[1.4, 2.4, -0.6]} color="#ffe8c8" intensity={10} distance={5} />
      <pointLight position={[-4, 3, 4]} color="#6a8aff" intensity={6} distance={12} />
      <Room wall="#5a3a24" floor="#3a2416" w={14} d={10} h={7} />
      {[-5, -2.5, 2.5, 5].map((px) => (
        <mesh key={px} position={[px, 3.5, -4.9]}>
          <boxGeometry args={[0.5, 7, 0.2]} />
          <meshStandardMaterial color="#3a2414" />
        </mesh>
      ))}
      {/* bench */}
      <mesh position={[0, 1.3, -3.4]} castShadow receiveShadow>
        <boxGeometry args={[6, 2.6, 1.4]} />
        <meshStandardMaterial color="#6a3a1e" />
      </mesh>
      <mesh position={[0, 2.66, -3.4]}>
        <boxGeometry args={[6.2, 0.12, 1.6]} />
        <meshStandardMaterial color="#4a2614" />
      </mesh>
      <Bean position={[0, 1.6, -4.1]} rotY={0} scale={1.0} pose={after(x.pointAt) ? BP.point : BP.idle} look={{ body: "#e01b1b", legs: "#1a1a1a", hat: "hair", hatColor: "#f2f2f2", skin: "#e8c0a0", glasses: true }} />
      {/* dock with the defendant */}
      <group position={[2.6, 0, 1.2]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[2.2, 1.2, 1.6]} />
          <meshStandardMaterial color="#5a341a" />
        </mesh>
        <mesh position={[0, 1.9, 0.8]}>
          <boxGeometry args={[2.2, 1.4, 0.04]} />
          <meshStandardMaterial color="#c8e0f0" transparent opacity={0.25} />
        </mesh>
        <Bean position={[0, 0.3, -0.2]} rotY={-2.68} scale={1.0} pose={after(x.headDownAt) ? { ...BP.idle, head: [0, 0.6] } : BP.idle} look={HACKER} />
      </group>
      {hosp > 0 && (
        <mesh position={[0, 5.4, -4.85]} scale={[hosp, hosp, 1]}>
          <planeGeometry args={[3, 2]} />
          <meshBasicMaterial map={crest} toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

const World: React.FC<WP> = ({ f, t, x, after, ramp }) => {
  if (x.set === "server") return <ServerRoom x={x} f={f} t={t} after={after} ramp={ramp} />;
  if (x.set === "street") return <Street x={x} f={f} t={t} after={after} />;
  if (x.set === "court") return <Court x={x} f={f} after={after} ramp={ramp} />;
  return <Hotel x={x} f={f} after={after} />;
};

export const SCENES = makeScenes(World, {
  hook: sh([2.4, 1.9, 3.4], [1.7, 1.8, 2.4], [0.4, 1.7, -2.6], [0.5, 1.9, -3], { entry: false, fov: 58, exp: 1.6, x: { screen: "leak" }, ov: [stamp("GTA 6 LEAK!", "leak", { size: 96, until: "satrah" }), chip("SIRF 17 SAAL!", "satrah", { bg: "#5a1010", until: "stick" }), stamp("TV STICK SE!", "stick", { size: 92 })] }),
  server: sh([0, 2.2, 9], [0, 2.8, 5.5], [0, 2.4, -6], [0, 3.6, -6], { x: { set: "server", leakAt: "nabbe", alarmAt: "rockstar" }, ov: [date("2022", "SAN", "2022"), stamp("90 VIDEOS LEAK!", "nabbe", { size: 80 })] }),
  bail: sh([13, 2.4, 21], [10.5, 2.2, 17.5], [2, 3.2, 2], [1.5, 3.4, 1], { x: { set: "street" }, ov: [stamp("LAPTOP ZABT!", "zabt", { size: 90, until: "hotel" }), tag("ZAMAANAT PAR, HOTEL MEIN", "hotel", { size: 44 })] }),
  stick: sh([2.4, 1.5, 1.4], [1.9, 1.7, 0.4], [1.2, 1.8, -3.9], [1.2, 1.9, -3.9], { exp: 1.5, x: { screen: "code", grantedAt: "sendh", alarm: false }, flash: "sendh", ov: [chip("TV + FIRE STICK + PHONE", "tv", { bg: "#1a1a2a", until: "sendh" }), stamp("SENDH!", "sendh", { size: 110 })] }),
  cost: sh([0, 2.0, 8], [0, 2.4, 6], [0, 3.2, -3], [0, 3.6, -3], { x: { set: "server", money: true, alarm: true }, ov: [chip("ROCKSTAR KE MUTABIK", "rockstar", { bg: "#3a3a3a", until: "pachaas" }), stamp("$5 MILLION!", "pachaas", { size: 104, color: "#1b8a3a" })] }),
  court: sh([0.5, 3.0, 8.5], [0.3, 2.9, 6.8], [0, 3.0, -3], [0, 3.4, -3], { exp: 1.5, x: { set: "court", hospAt: "aspataal", pointAt: "bhej" }, ov: [date("2023", "SAN", "2023"), stamp("SECURE HOSPITAL", "aspataal", { size: 70, until: "hacking" }), chip("PHIR SE HACKING?!", "hacking", { bg: "#5a1010" })] }),
  twist: sh([0.2, 1.95, -2.6], [0.8, 1.9, -1.8], [2.6, 1.65, 1.0], [2.6, 1.7, 1.0], { exp: 1.5, x: { set: "court", headDownAt: "kabool" }, flash: "twist", ov: [chip("RELEASE SE KUCH DIN PEHLE", "release", { bg: "#2a2a5a", until: "kabool" }), stamp("JURM KABOOL!", "kabool", { size: 96, until: "saza" }), chip("SAZA: ABHI BAAKI", "saza", { bg: "#5a1010" })] }),
  cta: sh([2.6, 2.2, 3.8], [2.0, 2.0, 3.0], [0.4, 1.8, -2.6], [0.5, 2.0, -3], { x: { screen: "title" }, ov: [cta("GENIUS", "PAAGAL")] }),
});

const short = makeShort({ timeline: timelineJson as Timeline, scenes: SCENES, audio: "gta6-leak/mix.m4a", line1: "HOTEL ROOM SE", line2: "GTA 6 LEAK!", nudge: "cost" });
export const GtaLeak = short.Ep;
export const gtaLeakFrames = short.total;
