import { Easing, interpolate, random, spring } from "remotion";

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export type Word = {
  text: string;
  key: string;
  emph: boolean;
  hi: string;
  start: number;
  end: number;
};

export type SceneData = {
  id: string;
  mood: string;
  start: number;
  duration: number;
  words: Word[];
};

export type Timeline = {
  id: string;
  fps: number;
  duration: number;
  scenes: SceneData[];
  sfx: { sfx: string; t: number; gain: number }[];
};

/** Frame (relative to scene start) at which the n-th occurrence of a caption word starts. */
export const wordFrame = (words: Word[], key: string, nth = 1, edge: "start" | "end" = "start") => {
  const hits = words.filter((w) => w.key === key.toLowerCase());
  const w = hits[Math.min(nth, hits.length) - 1];
  if (!w) {
    throw new Error(`word "${key}" not found in scene`);
  }
  return Math.round((edge === "start" ? w.start : w.end) * FPS);
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 0→1 progress between frames a and b with easing. */
export const prog = (frame: number, a: number, b: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Springy pop-in starting at frame `at`. */
export const pop = (frame: number, at: number, fps = FPS, damping = 11) =>
  spring({ frame: frame - at, fps, config: { damping, stiffness: 170, mass: 0.7 } });

/** Decaying camera shake offset starting at frame `at`. */
export const shake = (frame: number, at: number, strength = 26, len = 16, seed = "s") => {
  const t = frame - at;
  if (t < 0 || t > len) return { x: 0, y: 0, r: 0 };
  const k = (1 - t / len) ** 2 * strength;
  return {
    x: (random(`${seed}x${frame}`) - 0.5) * 2 * k,
    y: (random(`${seed}y${frame}`) - 0.5) * 2 * k,
    r: (random(`${seed}r${frame}`) - 0.5) * 0.08 * k,
  };
};

export const sumShake = (...s: { x: number; y: number; r: number }[]) =>
  s.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y, r: a.r + b.r }), { x: 0, y: 0, r: 0 });

/** White flash opacity peaking at `at`. */
export const flash = (frame: number, at: number, len = 8, peak = 0.85) => {
  const t = frame - at;
  if (t < 0 || t > len) return 0;
  return peak * (1 - t / len);
};

export const mixColor = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const m = (s: number) => Math.round(lerp(ch(pa, s), ch(pb, s), clamp01(t)));
  return `rgb(${m(16)},${m(8)},${m(0)})`;
};
