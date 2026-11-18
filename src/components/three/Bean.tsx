/* Stylised 3D "bean" characters (the 3D version of the channel's stickman), posed per frame. */
import React from "react";

export type BeanPose = {
  la: [number, number]; // left arm  [forward, out] radians
  ra: [number, number]; // right arm
  ll: number; // left leg forward swing
  rl: number; // right leg
  lean: number; // body lean forward
  head: [number, number]; // head [yaw, pitch]
  bob: number; // vertical offset
  crouch: number; // 0..1 kneel/crouch
};

export const BP = {
  idle: { la: [0.1, 0.15], ra: [0.1, -0.15], ll: 0, rl: 0, lean: 0, head: [0, 0], bob: 0, crouch: 0 } as BeanPose,
  cover: { la: [2.6, 0.5], ra: [2.6, -0.5], ll: 0.3, rl: -0.3, lean: 0.25, head: [0, 0.35], bob: 0, crouch: 0.15 } as BeanPose,
  point: { la: [0.1, 0.15], ra: [1.5, -0.1], ll: 0, rl: 0, lean: 0, head: [0, 0], bob: 0, crouch: 0 } as BeanPose,
  hold: { la: [1.1, 0.25], ra: [1.1, -0.25], ll: 0, rl: 0, lean: 0.05, head: [0, 0.25], bob: 0, crouch: 0 } as BeanPose,
  lantern: { la: [0.1, 0.15], ra: [0.9, -0.2], ll: 0, rl: 0, lean: 0, head: [0, -0.15], bob: 0, crouch: 0 } as BeanPose,
  kneel: { la: [0.9, 0.2], ra: [1.2, -0.2], ll: 1.4, rl: -0.2, lean: 0.35, head: [0, 0.4], bob: 0, crouch: 0.55 } as BeanPose,
  shock: { la: [0.6, 1.0], ra: [0.6, -1.0], ll: 0.1, rl: -0.1, lean: -0.15, head: [0, -0.1], bob: 0, crouch: 0 } as BeanPose,
  sit: { la: [0.7, 0.35], ra: [0.7, -0.35], ll: 1.5, rl: 1.5, lean: 0, head: [0, 0.05], bob: 0, crouch: 1 } as BeanPose,
  facepalm: { la: [0.1, 0.15], ra: [2.3, -0.6], ll: 0, rl: 0, lean: 0.1, head: [0, 0.3], bob: 0, crouch: 0 } as BeanPose,
  cheer: { la: [2.8, 0.3], ra: [2.8, -0.3], ll: 0, rl: 0, lean: -0.05, head: [0, -0.2], bob: 0, crouch: 0 } as BeanPose,
};

export const walk = (phase: number, amt = 1, run = false): BeanPose => {
  const s = Math.sin(phase);
  const A = (run ? 0.9 : 0.55) * amt;
  return {
    la: [-A * s, 0.12],
    ra: [A * s, -0.12],
    ll: A * s,
    rl: -A * s,
    lean: run ? 0.25 : 0.05,
    head: [0, 0],
    bob: Math.abs(Math.cos(phase)) * 0.06 * amt,
    crouch: 0,
  };
};

export type BeanLook = {
  skin?: string;
  body?: string; // shirt / coat colour
  legs?: string;
  hat?: "none" | "ranger" | "turban" | "cap" | "hood" | "beanie";
  hatColor?: string;
  coat?: boolean; // long coat skirt
  backpack?: string;
  beard?: string;
  glasses?: boolean;
  eyes?: "normal" | "wide" | "closed";
  held?: "none" | "stick" | "map" | "lantern" | "skull";
};

const Limb: React.FC<{ len: number; r: number; color: string }> = ({ len, r, color }) => (
  <mesh position={[0, -len / 2, 0]} castShadow>
    <capsuleGeometry args={[r, len, 6, 12]} />
    <meshStandardMaterial color={color} roughness={0.8} />
  </mesh>
);

export const Bean: React.FC<{ position: [number, number, number]; rotY?: number; scale?: number; pose?: BeanPose; look?: BeanLook; blink?: boolean }> = ({
  position,
  rotY = 0,
  scale = 1,
  pose = BP.idle,
  look = {},
  blink = false,
}) => {
  const skin = look.skin ?? "#e2b48c";
  const body = look.body ?? "#3b6ea8";
  const legs = look.legs ?? "#2f3440";
  const hipY = 0.78 - pose.crouch * 0.35;
  const eyes = blink ? "closed" : look.eyes ?? "normal";
  const eyeR = eyes === "wide" ? 0.085 : 0.065;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <group position={[0, pose.bob, 0]}>
        {/* legs */}
        {[
          [-0.14, pose.ll],
          [0.14, pose.rl],
        ].map(([x, a], i) => (
          <group key={i} position={[x, hipY, 0]} rotation={[-a, 0, 0]}>
            <Limb len={0.55} r={0.12} color={legs} />
            <mesh position={[0, -0.72, 0.06]} castShadow>
              <boxGeometry args={[0.2, 0.12, 0.32]} />
              <meshStandardMaterial color="#2a2018" roughness={0.9} />
            </mesh>
          </group>
        ))}
        <group position={[0, hipY, 0]} rotation={[pose.lean, 0, 0]}>
          {/* torso */}
          <mesh position={[0, 0.42, 0]} castShadow>
            <capsuleGeometry args={[0.33, 0.45, 6, 16]} />
            <meshStandardMaterial color={body} roughness={0.75} />
          </mesh>
          {look.coat && (
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.36, 0.48, 0.55, 16, 1, true]} />
              <meshStandardMaterial color={body} roughness={0.8} side={2} />
            </mesh>
          )}
          {look.backpack && (
            <mesh position={[0, 0.5, -0.36]} castShadow>
              <boxGeometry args={[0.46, 0.55, 0.22]} />
              <meshStandardMaterial color={look.backpack} roughness={0.8} />
            </mesh>
          )}
          {/* arms */}
          {[
            [-0.42, pose.la],
            [0.42, pose.ra],
          ].map(([x, a], i) => {
            const [fw, out] = a as [number, number];
            return (
              <group key={i} position={[x as number, 0.72, 0]} rotation={[-fw, 0, out]}>
                <Limb len={0.48} r={0.095} color={body} />
                <mesh position={[0, -0.62, 0]}>
                  <sphereGeometry args={[0.1, 12, 10]} />
                  <meshStandardMaterial color={skin} roughness={0.7} />
                </mesh>
                {i === 1 && look.held === "stick" && (
                  <mesh position={[0, -0.62, 0.05]} rotation={[0.2, 0, 0]}>
                    <cylinderGeometry args={[0.035, 0.035, 1.6, 8]} />
                    <meshStandardMaterial color="#6b4a2b" />
                  </mesh>
                )}
                {i === 1 && look.held === "lantern" && (
                  <group position={[0, -0.85, 0]}>
                    <mesh>
                      <boxGeometry args={[0.2, 0.28, 0.2]} />
                      <meshStandardMaterial color="#ffcf70" emissive="#ffb347" emissiveIntensity={2.5} />
                    </mesh>
                    <pointLight color="#ffb347" intensity={14} distance={14} decay={1.6} />
                  </group>
                )}
                {i === 1 && look.held === "map" && (
                  <mesh position={[0.25, -0.66, 0.1]} rotation={[-0.4, 0, 0.1]}>
                    <planeGeometry args={[0.6, 0.45]} />
                    <meshStandardMaterial color="#efe0b4" side={2} />
                  </mesh>
                )}
              </group>
            );
          })}
          {/* head */}
          <group position={[0, 1.08, 0]} rotation={[pose.head[1], pose.head[0], 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.34, 24, 18]} />
              <meshStandardMaterial color={skin} roughness={0.65} />
            </mesh>
            {[-0.12, 0.12].map((x) =>
              eyes === "closed" ? (
                <mesh key={x} position={[x, 0.04, 0.315]}>
                  <boxGeometry args={[0.1, 0.02, 0.02]} />
                  <meshStandardMaterial color="#1a1412" />
                </mesh>
              ) : (
                <group key={x} position={[x, 0.05, 0.29]}>
                  <mesh>
                    <sphereGeometry args={[eyeR, 14, 10]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0, eyeR * 0.75]}>
                    <sphereGeometry args={[eyeR * 0.55, 12, 8]} />
                    <meshStandardMaterial color="#141018" roughness={0.2} />
                  </mesh>
                </group>
              ),
            )}
            {look.glasses && (
              <mesh position={[0, 0.05, 0.33]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.1, 0.012, 6, 20]} />
                <meshStandardMaterial color="#222" />
              </mesh>
            )}
            {look.beard && (
              <mesh position={[0, -0.18, 0.18]} scale={[1, 0.8, 0.7]}>
                <sphereGeometry args={[0.22, 14, 10]} />
                <meshStandardMaterial color={look.beard} roughness={0.9} />
              </mesh>
            )}
            {look.hat === "ranger" && (
              <group position={[0, 0.24, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.55, 0.55, 0.04, 24]} />
                  <meshStandardMaterial color={look.hatColor ?? "#8a7448"} />
                </mesh>
                <mesh position={[0, 0.14, 0]} castShadow>
                  <cylinderGeometry args={[0.24, 0.3, 0.26, 16]} />
                  <meshStandardMaterial color={look.hatColor ?? "#8a7448"} />
                </mesh>
              </group>
            )}
            {look.hat === "turban" && (
              <mesh position={[0, 0.2, -0.02]} scale={[1.08, 0.72, 1.08]} castShadow>
                <sphereGeometry args={[0.36, 18, 12]} />
                <meshStandardMaterial color={look.hatColor ?? "#e8741e"} roughness={0.9} />
              </mesh>
            )}
            {look.hat === "cap" && (
              <group position={[0, 0.22, 0]}>
                <mesh scale={[1, 0.45, 1]} castShadow>
                  <sphereGeometry args={[0.35, 16, 10]} />
                  <meshStandardMaterial color={look.hatColor ?? "#3a3a44"} />
                </mesh>
                <mesh position={[0, -0.04, 0.3]} rotation={[0.25, 0, 0]}>
                  <boxGeometry args={[0.4, 0.04, 0.2]} />
                  <meshStandardMaterial color={look.hatColor ?? "#3a3a44"} />
                </mesh>
              </group>
            )}
            {look.hat === "beanie" && (
              <mesh position={[0, 0.16, 0]} scale={[1.05, 0.75, 1.05]} castShadow>
                <sphereGeometry args={[0.35, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={look.hatColor ?? "#c0392b"} />
              </mesh>
            )}
            {look.hat === "hood" && (
              <mesh position={[0, 0.08, -0.04]} castShadow>
                <sphereGeometry args={[0.42, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
                <meshStandardMaterial color={look.hatColor ?? "#2a2430"} side={2} />
              </mesh>
            )}
          </group>
        </group>
      </group>
    </group>
  );
};
