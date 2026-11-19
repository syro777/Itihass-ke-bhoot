import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "../../components/Captions";
import { ChapterBadge, ChapterCard, DarMeter, NightClock } from "../../components/LongForm";
import { CommentBubble } from "../../components/Props";
import { ChannelCard, SubscribeNudge } from "../../components/Subscribe";
import { SharedDefs } from "../../components/Stickman";
import { Stage3D } from "../../components/three/Stage3D";
import { CameraRig } from "../../components/three/World";
import { FPS, Timeline, wordFrame } from "../../lib/util";
import timelineJson from "../../data/bhootiya-5.timeline.json";
import { ShotScene } from "./Shots";
import { Bhangarh } from "./Worlds";

export const timeline = timelineJson as Timeline;
export const totalFrames = Math.round(timeline.duration * FPS);

const CH = [
  { first: "d1", last: "d12", num: "#5", place: "DUMAS BEACH", region: "SURAT, GUJARAT", time: "9:00 PM" },
  { first: "w1", last: "w13", num: "#4", place: "DOW HILL", region: "KURSEONG, WEST BENGAL", time: "10:00 PM" },
  { first: "s1", last: "s15", num: "#3", place: "SHANIWAR WADA", region: "PUNE, MAHARASHTRA", time: "11:00 PM" },
  { first: "k1", last: "k13", num: "#2", place: "KULDHARA", region: "JAISALMER, RAJASTHAN", time: "11:30 PM" },
  { first: "b1", last: "b17", num: "#1", place: "BHANGARH", region: "ALWAR, RAJASTHAN", time: "11:55 PM" },
];
const CLOCKS: Record<string, [number, number, string]> = { d0: [9, 0, "9:00 PM"], w0: [10, 0, "10:00 PM"], s0: [11, 0, "11:00 PM"], k0: [11, 30, "11:30 PM"], b0: [11, 55, "11:55 PM"] };
const METERS: Record<string, number> = { d11: 6, w13: 7, s15: 8, k13: 8, b17: 10 };
const NUDGES = ["i6", "w4", "k2"];

const sc = (id: string) => {
  const s = timeline.scenes.find((q) => q.id === id);
  if (!s) throw new Error(`scene ${id} missing`);
  return s;
};
const fr = (sec: number) => Math.round(sec * FPS);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <SharedDefs />
      {children}
    </svg>
  </AbsoluteFill>
);

export const Bhootiya5: React.FC = () => {
  const o2 = sc("o2");
  const o3 = sc("o3");
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timeline.scenes.map((s) => {
        const from = fr(s.start);
        const to = fr(s.start + s.duration);
        return (
          <Sequence key={s.id} name={s.id} from={from} durationInFrames={to - from}>
            <ShotScene id={s.id} words={s.words} dur={to - from} />
          </Sequence>
        );
      })}
      {CH.map((c) => {
        const a = sc(c.first);
        const b = sc(c.last);
        const cardDur = fr(a.duration);
        return (
          <React.Fragment key={c.num}>
            <Sequence name={`card ${c.num}`} from={fr(a.start)} durationInFrames={cardDur}>
              <ChapterCard num={c.num} place={c.place} region={c.region} time={c.time} dur={cardDur} />
            </Sequence>
            <Sequence name={`badge ${c.num}`} from={fr(a.start + a.duration)} durationInFrames={fr(b.start + b.duration) - fr(a.start + a.duration)}>
              <ChapterBadge num={c.num} place={c.place} />
            </Sequence>
          </React.Fragment>
        );
      })}
      {Object.entries(CLOCKS).map(([id, [h, m, label]]) => {
        const s = sc(id);
        return (
          <Sequence key={id} name={`clock ${id}`} from={fr(s.start)} durationInFrames={fr(s.duration)}>
            <Svg>
              <NightClock hour={h} minute={m} label={label} x={1640} y={300} />
            </Svg>
          </Sequence>
        );
      })}
      {Object.entries(METERS).map(([id, v]) => {
        const s = sc(id);
        return (
          <Sequence key={id} name={`meter ${id}`} from={fr(s.start)} durationInFrames={fr(s.duration)}>
            <Svg>
              <DarMeter value={v} at={Math.max(0, wordFrame(s.words, "dar") - 2)} x={960} y={440} />
            </Svg>
          </Sequence>
        );
      })}
      {NUDGES.map((id) => (
        <Sequence key={id} name={`nudge ${id}`} from={fr(sc(id).start) + 10} durationInFrames={80}>
          <SubscribeNudge x={1560} y={830} scale={0.75} />
        </Sequence>
      ))}
      <Sequence name="comment" from={fr(o2.start)} durationInFrames={fr(o2.duration)}>
        <Svg>
          <CommentBubble x={960} y={300} at={Math.max(0, wordFrame(o2.words, "comment") - 4)} />
        </Svg>
      </Sequence>
      <Sequence name="channel card" from={fr(o3.start)}>
        <Svg>
          <ChannelCard x={960} y={400} at={Math.max(0, wordFrame(o3.words, "itihaas") - 4)} clickAt={wordFrame(o3.words, "subscribe") + 4} />
        </Svg>
      </Sequence>
      <Captions timeline={timeline} y={965} size={60} maxWords={4} maxChars={26} side={240} />
      <Audio src={staticFile("bhootiya-5/mix.m4a")} />
    </AbsoluteFill>
  );
};

/** 1280x720 YouTube thumbnail. */
export const Bhootiya5Thumb: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Stage3D exposure={1.8} entryFlash={false} tint="#6a0010" tintOp={0.18}>
        <Bhangarh f={f + 40} t={0.5} dur={100} x={{ ghosts: true }} wf={() => 0} />
        <pointLight position={[4, 6, 30]} color="#ff3a2a" intensity={160} distance={40} />
        <CameraRig pos={[-16, 2.4, 50]} look={[8, 9, -10]} fov={46} />
      </Stage3D>
      <AbsoluteFill>
        <svg width={1280} height={720} viewBox="0 0 1280 720">
          <defs>
            <linearGradient id="thg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity={0.85} />
              <stop offset="0.6" stopColor="#000" stopOpacity={0.35} />
              <stop offset="1" stopColor="#000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <rect width={1280} height={720} fill="url(#thg)" />
          <text x={48} y={150} fontFamily="Poppins" fontWeight={900} fontSize={92} fill="#ffffff" stroke="#000" strokeWidth={10} paintOrder="stroke">
            BHARAT KI 5
          </text>
          <text x={40} y={300} fontFamily="Creepster" fontSize={170} fill="#ff2e2e" stroke="#000" strokeWidth={12} paintOrder="stroke" letterSpacing={2}>
            BHOOTIYA
          </text>
          <text x={48} y={420} fontFamily="Poppins" fontWeight={900} fontSize={104} fill="#ffffff" stroke="#000" strokeWidth={10} paintOrder="stroke">
            JAGAH
          </text>
          <g transform="translate(48,480) rotate(-3)">
            <rect x={0} y={0} width={640} height={96} rx={20} fill="#ffd84d" stroke="#000" strokeWidth={6} />
            <text x={320} y={66} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={48} fill="#111">
              #1 PAR ENTRY MANA!
            </text>
          </g>
          <text x={52} y={660} fontFamily="Poppins" fontWeight={800} fontSize={34} fill="#ffd84d" stroke="#000" strokeWidth={6} paintOrder="stroke">
            RAAT 12 BAJE • 3D STORY
          </text>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
