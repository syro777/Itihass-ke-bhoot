import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { BP, Bean, BeanLook, walk } from "../../components/three/Bean";
import { HauntFX } from "../../components/three/Haunt";
import { Room } from "../../components/three/Mystery3D";
import { WallClock } from "../../components/three/Props3D";
import { chip, cta, date, makeScenes, makeShort, sh, stamp, tag, V3, WP } from "../../components/three/ShortShots";
import { Clouds, Mist, rand, SkyDome, softTexture, Stars, textTexture } from "../../components/three/World";
import { FPS, Timeline } from "../../lib/util";
import timelineJson from "../../data/malcha-mahal.timeline.json";
import { Moon, NightLights, Wisp } from "../bhootiya-5/Worlds";

const STONE = "#8a8274";
const STONE_D = "#4e4840";
const BEGUM: BeanLook = { body: "#1a1418", legs: "#1a1418", hat: "hood", hatColor: "#120e10", coat: true, skin: "#d9a57e" };
const SON: BeanLook = { body: "#2a2a34", legs: "#1a1a20", hat: "hair", hatColor: "#2a2020", skin: "#d9a57e" };
const DAUGHTER: BeanLook = { body: "#3a2a3a", legs: "#2a1a2a", hat: "hood", hatColor: "#2a1a2a", skin: "#d9a57e" };

const Box: React.FC<{ p: V3; s: V3; c?: string; r?: V3 }> = ({ p, s, c = STONE, r = [0, 0, 0] }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={1} flatShading />
  </mesh>
);

const Flame: React.FC<{ position: V3; k?: number; s?: number }> = ({ position, k = 1, s = 1 }) => {
  const f = useCurrentFrame();
  const tex = softTexture();
  const fl = (0.75 + 0.25 * Math.sin(f / 2.2) * Math.sin(f / 4.7 + 1)) * k;
  return (
    <group position={position} scale={s}>
      <sprite scale={[1.4 * fl, 1.4 * fl, 1]}>
        <spriteMaterial map={tex} color="#ff9a30" transparent opacity={0.85 * fl} depthWrite={false} toneMapped={false} />
      </sprite>
      <pointLight color="#ffa040" intensity={10 * fl} distance={9} />
    </group>
  );
};

const Dog: React.FC<{ position: V3; rotY?: number; eyes?: boolean }> = ({ position, rotY = 0, eyes = true }) => {
  const f = useCurrentFrame();
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box p={[0, 0.75, 0]} s={[0.42, 0.42, 1.2]} c="#141214" />
      <Box p={[0, 1.08, 0.62]} s={[0.3, 0.3, 0.42]} c="#141214" r={[-0.3 + Math.sin(f / 9) * 0.05, 0, 0]} />
      <Box p={[0, 0.98, 0.9]} s={[0.18, 0.16, 0.3]} c="#1a1416" />
      {[-0.1, 0.1].map((x) => (
        <Box key={x} p={[x, 1.32, 0.56]} s={[0.06, 0.2, 0.08]} c="#141214" />
      ))}
      {[
        [-0.14, -0.45],
        [0.14, -0.45],
        [-0.14, 0.45],
        [0.14, 0.45],
      ].map(([x, z], i) => (
        <Box key={i} p={[x, 0.3, z]} s={[0.1, 0.6, 0.1]} c="#141214" />
      ))}
      {eyes &&
        [-0.08, 0.08].map((x) => (
          <mesh key={`e${x}`} position={[x, 1.14, 0.84]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshBasicMaterial color="#ff3030" toneMapped={false} />
          </mesh>
        ))}
    </group>
  );
};

const DeadTree: React.FC<{ position: V3; s?: number; seed?: number }> = ({ position, s = 1, seed = 0 }) => (
  <group position={position} scale={s} rotation={[0, seed, 0]}>
    <mesh position={[0, 2.5, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.28, 5, 6]} />
      <meshStandardMaterial color="#1a1612" roughness={1} />
    </mesh>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[Math.cos(i * 1.7 + seed) * 0.6, 3.6 + i * 0.5, Math.sin(i * 1.7 + seed) * 0.6]} rotation={[Math.sin(i + seed) * 0.8, 0, Math.cos(i * 2 + seed) * 0.9]}>
        <cylinderGeometry args={[0.03, 0.08, 1.8, 5]} />
        <meshStandardMaterial color="#1a1612" roughness={1} />
      </mesh>
    ))}
    <mesh position={[0, 5.2, 0]}>
      <icosahedronGeometry args={[1.4, 0]} />
      <meshStandardMaterial color="#17221a" roughness={1} flatShading />
    </mesh>
  </group>
);

/** The Tughlaq hunting lodge: battered stone walls, arches, parapet, rubble. */
const Lodge: React.FC<{ lantern: number; ghosts: boolean }> = ({ lantern, ghosts }) => (
  <group>
    <Box p={[0, 3, 0]} s={[14, 6, 10]} />
    <Box p={[0, 6.25, 0]} s={[14.4, 0.5, 10.4]} c={STONE_D} />
    {new Array(10).fill(0).map((_, i) => (
      <Box key={i} p={[-6.6 + i * 1.47, 6.85, 5.1]} s={[0.7, 0.7, 0.3]} c={STONE_D} />
    ))}
    {[-4.2, 0, 4.2].map((x, i) => (
      <group key={x} position={[x, 0, 5.02]}>
        <mesh position={[0, 1.7, 0]}>
          <planeGeometry args={[2.0, 3.4]} />
          <meshStandardMaterial color={i === 2 && lantern > 0 ? "#3a2210" : "#060504"} emissive={i === 2 && lantern > 0 ? "#ff8a20" : "#000"} emissiveIntensity={0.22 * lantern} />
        </mesh>
        <mesh position={[0, 3.4, 0]}>
          <circleGeometry args={[1.0, 16, 0, Math.PI]} />
          <meshStandardMaterial color={i === 2 && lantern > 0 ? "#3a2210" : "#060504"} emissive={i === 2 && lantern > 0 ? "#ff8a20" : "#000"} emissiveIntensity={0.22 * lantern} />
        </mesh>
      </group>
    ))}
    {lantern > 0 && <Flame position={[4.2, 1.6, 4.4]} k={lantern} s={0.7} />}
    {/* broken corner + rubble + creepers */}
    <Box p={[7.6, 1.2, 4.2]} s={[2, 2.4, 2]} c={STONE_D} r={[0, 0.4, 0.2]} />
    {new Array(10).fill(0).map((_, i) => (
      <Box key={`r${i}`} p={[6 + rand(i, 4) * 4, 0.3, 5 + rand(i + 1, 4) * 3]} s={[0.6 + rand(i + 2, 4), 0.5, 0.6]} c={STONE_D} r={[0, rand(i, 5) * 3, 0]} />
    ))}
    {new Array(8).fill(0).map((_, i) => (
      <Box key={`v${i}`} p={[-6.5 + i * 1.8, 4 - (i % 3), 5.08]} s={[0.25, 2.6 + (i % 2), 0.05]} c="#1e3a20" />
    ))}
    {ghosts && (
      <>
        <Wisp position={[-4.2, 2, 4.6]} seed={1} s={0.8} op={1.4} />
        <Wisp position={[0, 2.2, 4.6]} seed={3} s={0.7} op={1.2} />
      </>
    )}
  </group>
);

const Gate: React.FC<{ open: number }> = ({ open }) => {
  const sign = useMemo(() => textTexture([{ text: "ANDAR", size: 90, color: "#b0101a" }, { text: "MAT AANA!", size: 90, color: "#b0101a" }], 768, 400, "#e8e0cc"), []);
  return (
    <group position={[0, 0, 15]}>
      {[-3, 3].map((x) => (
        <Box key={x} p={[x, 1.6, 0]} s={[0.9, 3.2, 0.9]} c={STONE_D} />
      ))}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 2.5, 0, 0]} rotation={[0, sd * open * 1.2, 0]}>
          {new Array(7).fill(0).map((_, i) => (
            <mesh key={i} position={[-sd * (0.3 + i * 0.36), 1.4, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 2.6, 5]} />
              <meshStandardMaterial color="#2a2420" metalness={0.6} roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[-sd * 1.25, 2.6, 0]}>
            <boxGeometry args={[2.5, 0.08, 0.05]} />
            <meshStandardMaterial color="#2a2420" metalness={0.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[3.9, 1.6, 0.5]} rotation={[0, -0.25, 0.06]}>
        <planeGeometry args={[1.6, 0.85]} />
        <meshStandardMaterial map={sign} />
      </mesh>
    </group>
  );
};

const Forest: React.FC<{ x: WP["x"]; f: number; t: number; ramp: WP["ramp"]; after: WP["after"] }> = ({ x, f, t, ramp, after }) => {
  const trees = useMemo(() => new Array(46).fill(0).map((_, i) => ({ x: (rand(i, 2) - 0.5) * 90, z: -60 + rand(i + 1, 2) * 100, s: 1 + rand(i + 2, 2) * 1.2 })).filter((p) => Math.abs(p.x) > 10 || p.z < -12 || p.z > 24), []);
  const lantern = x.lantern === true ? 1 : x.lanternOff ? 1 - ramp(x.lanternOff, 20) : 0;
  return (
    <>
      <fog attach="fog" args={["#0c1418", 24, 120]} />
      <ambientLight intensity={0.35} color="#6a8aa8" />
      <directionalLight position={[20, 30, 40]} intensity={1.1} color="#9ab8d8" />
      <pointLight position={[0, 9, 12]} color="#7a9ab8" intensity={30} distance={30} />
      <SkyDome top="#020406" horizon="#16262a" />
      <Stars opacity={0.4} />
      <Moon position={[30, 40, -120]} size={20} />
      <NightLights moon={[30, 40, -120]} strength={0.75} />
      <Clouds y={30} count={10} spread={140} opacity={0.6} color="#1a2228" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#1e2416" roughness={1} />
      </mesh>
      {trees.map((tr, i) => (
        <DeadTree key={i} position={[tr.x, 0, tr.z]} s={tr.s} seed={i} />
      ))}
      <Lodge lantern={lantern} ghosts={after(x.ghostAt) || x.ghosts === true} />
      <Gate open={x.gateOpen === true ? 1 : ramp(x.gateAt, 24)} />
      <Mist count={18} y={0.5} spread={30} opacity={0.32} color="#9ab0b0" />
      {x.dogs === true && (
        <>
          <Dog position={[-2, 0, 18.5]} rotY={0.3} />
          <Dog position={[2.4, 0, 17.8]} rotY={-0.4} />
        </>
      )}
      {x.arrive === true && (
        <group position={[0, 0, 26 - t * 8]}>
          <Bean position={[0, 0, 0]} rotY={Math.PI} scale={1.05} pose={walk(f * 0.15, 0.4)} look={BEGUM} />
          <Bean position={[-1.3, 0, 0.8]} rotY={Math.PI} scale={0.95} pose={walk(f * 0.15 + 1, 0.4)} look={{ ...SON, held: "lantern" }} />
          <Bean position={[1.3, 0, 0.9]} rotY={Math.PI} scale={0.9} pose={walk(f * 0.15 + 2, 0.4)} look={DAUGHTER} />
          <Flame position={[-1.0, 1.4, 1.3]} s={0.5} />
          <Dog position={[2.4, 0, -0.6]} rotY={Math.PI} eyes={false} />
        </group>
      )}
    </>
  );
};

const Station: React.FC<{ f: number }> = ({ f }) => {
  const sign = useMemo(() => textTexture([{ text: "WAITING ROOM", size: 80, color: "#f4ecd0" }], 1024, 200, "#1a3a2a"), []);
  const city = useMemo(() => textTexture([{ text: "NEW DELHI", size: 110, color: "#ffd84d" }, { text: "नई दिल्ली", size: 90, color: "#ffd84d", font: "700" }], 1024, 400, "#2a1a10"), []);
  const train = (f * 0.6) % 40;
  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <ambientLight intensity={0.35} color="#c8e0c0" />
      <pointLight position={[0, 3.6, 0]} color="#e8f0c0" intensity={22 + (f % 47 < 2 ? -18 : 0)} distance={14} />
      <Room wall="#3a4a3a" floor="#2a2a26" w={12} d={8} h={4.4} />
      <mesh position={[0, 3.6, -3.97]}>
        <planeGeometry args={[4, 0.8]} />
        <meshBasicMaterial map={sign} />
      </mesh>
      <mesh position={[-3.6, 2.2, -3.96]}>
        <planeGeometry args={[2.4, 0.95]} />
        <meshBasicMaterial map={city} />
      </mesh>
      <WallClock position={[3.4, 2.6, -3.9]} scale={1.1} />
      {/* window to the platform: passing train lights */}
      <group position={[5.97, 2.0, -0.8]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[4, 1.6]} />
          <meshBasicMaterial color="#080a10" />
        </mesh>
        {new Array(6).fill(0).map((_, i) => (
          <mesh key={i} position={[((train + i * 7) % 40) - 20, 0, 0.01]}>
            <planeGeometry args={[1.0, 0.5]} />
            <meshBasicMaterial color="#ffe0a0" toneMapped={false} />
          </mesh>
        ))}
      </group>
      {[-2.6, 1.4].map((x) => (
        <group key={x} position={[x, 0, -1.6]}>
          <Box p={[0, 0.45, 0]} s={[3.2, 0.12, 0.8]} c="#5a3a1e" />
          <Box p={[0, 0.9, -0.38]} s={[3.2, 0.8, 0.08]} c="#5a3a1e" />
          {[-1.4, 1.4].map((lx) => (
            <Box key={lx} p={[lx, 0.22, 0]} s={[0.1, 0.45, 0.7]} c="#3a2414" />
          ))}
        </group>
      ))}
      <Bean position={[-2.6, 0.08, -1.5]} rotY={0} scale={1.05} pose={{ ...BP.sit, head: [0, 0.05] }} look={BEGUM} />
      <Bean position={[-1.6, 0.05, -1.4]} rotY={-0.2} scale={0.8} pose={BP.sit} look={SON} />
      <Bean position={[1.0, 0.05, -1.4]} rotY={0.2} scale={0.75} pose={BP.sit} look={DAUGHTER} />
      <Dog position={[-0.2, 0, -0.2]} rotY={0.6} eyes={false} />
      <Dog position={[2.6, 0, 0.4]} rotY={-0.9} eyes={false} />
      {[0, 1, 2].map((i) => (
        <Box key={i} p={[-4.6 + i * 0.7, 0.3, 0.6]} s={[0.6, 0.6, 0.5]} c={["#6a4a2a", "#3a4a6a", "#5a2a2a"][i]} />
      ))}
    </>
  );
};

const Inside: React.FC<{ x: WP["x"]; f: number; ramp: WP["ramp"] }> = ({ x, f, ramp }) => {
  const paper = useMemo(
    () =>
      textTexture(
        [
          { text: "THE NEWS", size: 70, color: "#1a1a1a" },
          { text: "2019 JAANCH", size: 54, color: "#4a4a4a", font: "700" },
          { text: "SHAHI RISHTA?", size: 76, color: "#1a1a1a" },
          { text: "— KOI SABOOT NAHI —", size: 44, color: "#8a1a1a", font: "700" },
        ],
        768,
        900,
        "#e8e2d0",
      ),
    [],
  );
  const dim = ramp(x.dimAt, 30);
  const rock = Math.sin(f / 14) * 0.08 * (x.rock === true ? 1 : 0);
  return (
    <>
      <color attach="background" args={["#030303"]} />
      <ambientLight intensity={0.12} color="#8aa0c0" />
      <directionalLight position={[-3, 3, 4]} intensity={0.25} color="#8aa0d0" />
      <Room wall={STONE} floor="#2e2a24" w={10} d={8} h={5} windowGlow={0.25} />
      <Box p={[0.8, 0.45, -1.2]} s={[1.6, 0.9, 1.0]} c="#3a2414" />
      <Flame position={[1.2, 1.25, -1.2]} k={1 - dim * 0.95} s={0.7} />
      <mesh position={[1.2, 1.0, -1.2]}>
        <cylinderGeometry args={[0.12, 0.16, 0.22, 10]} />
        <meshStandardMaterial color="#5a4a2a" metalness={0.5} />
      </mesh>
      <group position={[-1.0, 0, -0.6]} rotation={[rock, 0.4, 0]}>
        <Box p={[0, 0.5, 0]} s={[0.9, 0.1, 0.9]} c="#4a2a14" />
        <Box p={[0, 1.05, -0.42]} s={[0.9, 1.1, 0.1]} c="#4a2a14" />
        {[
          [-0.4, -0.4],
          [0.4, -0.4],
          [-0.4, 0.4],
          [0.4, 0.4],
        ].map(([px, pz], i) => (
          <Box key={i} p={[px, 0.25, pz]} s={[0.08, 0.5, 0.08]} c="#3a1e0e" />
        ))}
      </group>
      <mesh position={[-1.8, 2.6, -3.96]}>
        <planeGeometry args={[1.3, 1.7]} />
        <meshStandardMaterial color="#1a1410" />
      </mesh>
      <mesh position={[-1.8, 2.6, -3.95]}>
        <ringGeometry args={[0.7, 0.85, 4, 1, Math.PI / 4]} />
        <meshStandardMaterial color="#8a6a2a" metalness={0.6} />
      </mesh>
      {x.paper === true && (
        <mesh position={[0.5, 0.92, -1.05]} rotation={[-Math.PI / 2, 0, -0.12]}>
          <planeGeometry args={[0.9, 1.05]} />
          <meshStandardMaterial map={paper} />
        </mesh>
      )}
      {x.ghost === true && <Wisp position={[-1.0, 1.6, -0.9]} seed={2} s={0.7} op={1.6} />}
    </>
  );
};

const World: React.FC<WP> = ({ f, t, x, ramp, after }) => {
  if (x.set === "station") return <Station f={f} />;
  if (x.set === "inside") return <Inside x={x} f={f} ramp={ramp} />;
  return <Forest x={x} f={f} t={t} ramp={ramp} after={after} />;
};

export const SCENES = makeScenes(World, {
  hook: sh([3, 1.4, 34], [1.2, 2.2, 22], [0, 3.2, 0], [0, 3.6, 0], { entry: false, shake: 0.05, exp: 1.6, x: { lantern: true, dogs: true, ghostAt: "sach" }, ov: [chip("DELHI KA JUNGLE", "jungle", { bg: "#1a2a1a", until: "shahi" }), tag("'SHAHI' PARIVAAR?", "shahi", { size: 52, until: "sach" }), stamp("SACH KUCH AUR!", "sach", { size: 84 })] }),
  place: sh([18, 9, 26], [12, 6, 20], [0, 3, 0], [0, 3, 0], { exp: 1.6, x: { lantern: true }, ov: [tag("MALCHA MAHAL, DELHI", "malcha", { size: 50, until: "tughlaq" }), chip("TUGHLAQ DAUR, ~600 SAAL", "tughlaq", { bg: "#3a2a1a" })] }),
  begum: sh([2.4, 2.0, 4.6], [1.6, 1.9, 3.4], [-1.8, 1.4, -1.5], [-2.2, 1.3, -1.5], { sepia: true, exp: 1.4, x: { set: "station" }, ov: [date("1970s", "DASHAK", "1970"), tag("BEGUM WILAYAT MAHAL", "wilayat", { size: 46, until: "awadh" }), chip("'AWADH KI WAARIS'?", "awadh", { bg: "#4a1a3a" })] }),
  station: sh([-0.4, 2.6, 5.4], [0.2, 2.2, 4.2], [-0.6, 1.4, -1.6], [-0.8, 1.4, -1.6], { sepia: true, exp: 1.4, shake: 0.02, x: { set: "station" }, ov: [chip("HARJAANE KI MAANG", "harjaane", { bg: "#3a2a1a", until: "das" }), stamp("~10 SAAL STATION PAR!", "das", { size: 70 })] }),
  given: sh([3.5, 3.0, 34], [2.0, 2.8, 28.5], [0, 1.6, 18], [0, 2.6, 8], { exp: 1.8, x: { arrive: true, gateAt: "mahal" }, ov: [date("1985", "SAN", "1985"), chip("SARKAAR NE DIYA MAHAL", "sarkaar", { bg: "#1a2a4a" })] }),
  isolated: sh([-2.4, 1.6, 24], [-1.4, 1.7, 19.5], [0, 1.8, 15], [0, 1.6, 15], { shake: 0.04, exp: 1.6, x: { dogs: true, lantern: true }, ov: [chip("NA BIJLI, NA PAANI", "bijli", { bg: "#1a1a1a", until: "naata" }), stamp("DUNIYA SE KATE!", "naata", { size: 84 })] }),
  deaths: sh([2.6, 2.0, 3.6], [1.9, 1.8, 2.6], [0, 1.0, -1.0], [-0.3, 1.0, -1.0], { exp: 1.5, x: { set: "inside", rock: true, dimAt: "akela" }, ov: [date("1993", "SAN", "1993", { until: "2017" }), date("2017", "SAN", "2017"), stamp("AKELA MRIT MILA", "akela", { size: 70 })] }),
  twist: sh([0.9, 2.6, 1.4], [0.6, 2.1, 0.4], [0.5, 0.9, -1.05], [0.5, 0.9, -1.05], { exp: 1.6, shake: 0.015, x: { set: "inside", paper: true }, flash: "rishta", ov: [chip("NYT JAANCH, 2019", "times", { bg: "#1a1a1a", until: "rishta" }), stamp("KOI SHAHI RISHTA NAHI!", "rishta", { size: 66 })] }),
  today: sh([3, 2.2, 22], [1.8, 2.4, 18.5], [0, 2.8, 4], [0, 2.9, 4], { shake: 0.05, exp: 1.8, x: { ghosts: true, lanternOff: "ajeeb" }, ov: [chip("MAHAL KHAALI", "khaali", { bg: "#1a1a1a", until: "ajeeb" }), stamp("AJEEB AAWAAZEIN?!", "ajeeb", { size: 80 })] }),
  cta: sh([2, 3, 30], [1, 3, 24], [0, 3, 0], [0, 3.2, 0], { exp: 1.6, x: { ghosts: true, dogs: true }, ov: [cta("DHOKHA", "DARD")] }),
});

const TL = timelineJson as Timeline;
const at = (id: string, sec: number) => {
  const s = TL.scenes.find((x) => x.id === id);
  return s ? Math.round((s.start + sec) * FPS) : -100;
};
const short = makeShort({
  timeline: TL,
  scenes: SCENES,
  audio: "malcha-mahal/mix.m4a",
  line1: "DELHI KE JUNGLE KA",
  line2: "SHAHI RAHASYA",
  nudge: "place",
  fx: <HauntFX flashes={[at("hook", 5.2), at("isolated", 1.6), at("today", 3.4)]} tint="#06140e" />,
});
export const Malcha = short.Ep;
export const malchaFrames = short.total;
