/* Data-driven 9:16 shot scenes: each scene id -> camera move, world flags and 2D overlays.
 * A World component receives WP (frame, progress, flags, word-frame helpers). */
import React from "react";
import { AbsoluteFill, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, ProgressBar, TopTitle } from "../Captions";
import { CommentBubble, DateBadge, NameTag, VoteButtons } from "../Props";
import { ChannelCard, SubscribeNudge } from "../Subscribe";
import { FPS, flash, prog, Timeline, Word, wordFrame } from "../../lib/util";
import { Chip, Stamp } from "./Overlays";
import { Stage3D } from "./Stage3D";
import { CameraRig, lerp3 } from "./World";

export type V3 = [number, number, number];
export type SP = { words: Word[]; dur: number };
export type WP = {
  f: number;
  t: number;
  dur: number;
  x: Record<string, unknown>;
  wf: (k: string, nth?: number) => number;
  /** true once the word `k` (if a string) has started (+pad frames) */
  after: (k: unknown, pad?: number) => boolean;
  /** 0..1 ramp over `len` frames starting at word `k` */
  ramp: (k: unknown, len?: number, pad?: number) => number;
};
export type Ov = {
  k: "chip" | "stamp" | "tag" | "date" | "cta";
  text?: string;
  at?: string;
  until?: string;
  x?: number;
  y?: number;
  bg?: string;
  fg?: string;
  color?: string;
  size?: number;
  top?: string;
  big?: string;
  left?: string;
  right?: string;
};
export type Shot = {
  p: [V3, V3];
  l: [V3, V3];
  fov?: number;
  x?: Record<string, unknown>;
  sepia?: boolean;
  tint?: string;
  tintOp?: number;
  exp?: number;
  flash?: string;
  ov?: Ov[];
  entry?: boolean;
  /** hard cut inside the scene: from word `at`, use a second camera path and extra world flags */
  cut?: { at: string; p: [V3, V3]; l: [V3, V3]; x?: Record<string, unknown>; fov?: number; exp?: number };
};

export const sh = (p0: V3, p1: V3, l0: V3, l1: V3 = l0, rest: Partial<Shot> = {}): Shot => ({ p: [p0, p1], l: [l0, l1], ...rest });
export const chip = (text: string, at?: string, o: Partial<Ov> = {}): Ov => ({ k: "chip", text, at, ...o });
export const stamp = (text: string, at?: string, o: Partial<Ov> = {}): Ov => ({ k: "stamp", text, at, ...o });
export const tag = (text: string, at?: string, o: Partial<Ov> = {}): Ov => ({ k: "tag", text, at, ...o });
export const date = (big: string, top = "SAN", at?: string, o: Partial<Ov> = {}): Ov => ({ k: "date", big, top, at, ...o });
export const cta = (left: string, right: string): Ov => ({ k: "cta", left, right });

const OY = 640;

const OvLayer: React.FC<{ ov: Ov[]; words: Word[] }> = ({ ov, words }) => {
  const f = useCurrentFrame();
  const wf = (k: string) => wordFrame(words, k);
  return (
    <g>
      {ov.map((o, i) => {
        const at = o.at ? wf(o.at) - 2 : 3;
        const until = o.until ? wf(o.until) - 3 : undefined;
        const x = o.x ?? 540;
        const y = o.y ?? OY;
        if (o.k === "chip") return <Chip key={i} x={x} y={y} at={at} text={o.text ?? ""} bg={o.bg ?? "#111"} until={until} />;
        if (o.k === "stamp") return <Stamp key={i} x={x} y={y} at={at} text={o.text ?? ""} size={o.size ?? 84} color={o.color ?? "#e01b1b"} until={until} />;
        if (o.k === "tag") return <NameTag key={i} x={x} y={y + 40} at={at} text={o.text ?? ""} size={o.size ?? 48} bg={o.bg ?? "#ffd84d"} fg={o.fg ?? "#111"} until={until} />;
        if (o.k === "date") {
          if (until !== undefined && f > until) return null;
          return (
            <g key={i} transform={`translate(${o.x ?? 850},${o.y ?? 520}) scale(0.6)`}>
              <DateBadge x={0} y={0} at={at} top={o.top ?? "SAN"} big={o.big ?? ""} />
            </g>
          );
        }
        // cta: vote -> comment bubble -> channel card
        const fCom = wf("comment");
        const fAur = wf("aur");
        const fIti = wf("itihaas");
        const fSub = wf("subscribe");
        return (
          <g key={i}>
            {f < fCom - 2 && <VoteButtons y={OY} at={2} left={o.left ?? "HAAN"} right={o.right ?? "NAHI"} />}
            {f < fIti && f >= fCom - 2 && (
              <g opacity={1 - prog(f, fAur, fIti)}>
                <CommentBubble x={540} y={600} at={fCom - 2} />
              </g>
            )}
            <ChannelCard x={540} y={470} at={fIti - 4} clickAt={fSub + 4} />
          </g>
        );
      })}
    </g>
  );
};

export const makeScenes = (World: React.FC<WP>, shots: Record<string, Shot>) => {
  const out: Record<string, React.FC<SP>> = {};
  for (const id of Object.keys(shots)) {
    const s = shots[id];
    const Scene: React.FC<SP> = ({ words, dur }) => {
      const f = useCurrentFrame();
      const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
      const wf = (k: string, nth = 1) => wordFrame(words, k, nth);
      const after = (k: unknown, pad = 0) => typeof k === "string" && f >= wf(k) + pad;
      const ramp = (k: unknown, len = 12, pad = 0) => (typeof k === "string" ? prog(f, wf(k) + pad, wf(k) + pad + len) : 0);
      const isCta = (s.ov ?? []).some((o) => o.k === "cta");
      const focus = isCta ? prog(f, wf("aur") - 2, wf("aur") + 10) : 0;
      const fc = s.cut ? wf(s.cut.at) - 2 : Infinity;
      const cut = s.cut && f >= fc ? s.cut : undefined;
      const ct = cut ? prog(f, fc, dur, Easing.out(Easing.quad)) : t;
      const P = cut ? cut.p : s.p;
      const L = cut ? cut.l : s.l;
      const X = cut ? { ...(s.x ?? {}), ...(cut.x ?? {}) } : s.x ?? {};
      const flashOp = Math.max(s.flash ? flash(f, wf(s.flash), 7, 0.5) : 0, s.cut ? flash(f, fc, 6, 0.6) : 0);
      return (
        <Stage3D
          exposure={cut?.exp ?? s.exp ?? 1.3}
          entryFlash={s.entry ?? true}
          flashOp={flashOp}
          tint={isCta ? "#000000" : s.sepia ? "#7a4a1a" : s.tint}
          tintOp={isCta ? focus * 0.45 : s.sepia ? 0.22 : s.tintOp ?? 0}
          overlay={s.ov ? <OvLayer ov={s.ov} words={words} /> : undefined}
        >
          <World f={f} t={t} dur={dur} x={X} wf={wf} after={after} ramp={ramp} />
          <CameraRig pos={lerp3(P[0], P[1], ct)} look={lerp3(L[0], L[1], ct)} fov={cut?.fov ?? s.fov ?? 50} />
        </Stage3D>
      );
    };
    Scene.displayName = `Shot_${id}`;
    out[id] = Scene;
  }
  return out;
};

/** Standard 9:16 episode: scenes in sequence, mid-video subscribe nudge, title, captions, progress, audio. */
export const makeShort = (opts: { timeline: Timeline; scenes: Record<string, React.FC<SP>>; audio: string; line1: string; line2: string; nudge: string; nudgeY?: number }) => {
  const { timeline, scenes, audio, line1, line2, nudge, nudgeY = 1080 } = opts;
  const total = Math.round(timeline.duration * FPS);
  const Ep: React.FC = () => {
    const cta = timeline.scenes.find((s) => s.id === "cta");
    const mid = timeline.scenes.find((s) => s.id === nudge);
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        {timeline.scenes.map((sc) => {
          const from = Math.round(sc.start * FPS);
          const to = Math.round((sc.start + sc.duration) * FPS);
          const Scene = scenes[sc.id];
          if (!Scene) throw new Error(`no scene component for ${sc.id}`);
          return (
            <Sequence key={sc.id} name={sc.id} from={from} durationInFrames={to - from}>
              <Scene words={sc.words} dur={to - from} />
            </Sequence>
          );
        })}
        {mid && (
          <Sequence name="subscribe-nudge" from={Math.round(mid.start * FPS) + 8} durationInFrames={80}>
            <SubscribeNudge y={nudgeY} scale={0.8} />
          </Sequence>
        )}
        <TopTitle line1={line1} line2={line2} startAt={-10} hideFrom={cta ? Math.round(cta.start * FPS) - 4 : undefined} />
        <Captions timeline={timeline} y={1400} />
        <ProgressBar total={total} />
        <Audio src={staticFile(audio)} />
      </AbsoluteFill>
    );
  };
  return { Ep, total };
};
