import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, ProgressBar, TopTitle } from "../../components/Captions";
import { SubscribeNudge } from "../../components/Subscribe";
import { FPS, Timeline } from "../../lib/util";
import timelineJson from "../../data/bhangarh.timeline.json";
import { Cta, Curse, History, Hook, Location, Rock, Ruins, Sage, SP, Tantrik } from "./Scenes";

export const timeline = timelineJson as Timeline;

const SCENES: Record<string, React.FC<SP>> = {
  hook: Hook,
  location: Location,
  history: History,
  sage: Sage,
  curse: Curse,
  tantrik: Tantrik,
  rock: Rock,
  ruins: Ruins,
  cta: Cta,
};

export const totalFrames = Math.round(timeline.duration * FPS);

export const Bhangarh: React.FC = () => {
  const cta = timeline.scenes.find((s) => s.id === "cta");
  const mid = timeline.scenes.find((s) => s.id === "sage");
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timeline.scenes.map((sc) => {
        const from = Math.round(sc.start * FPS);
        const to = Math.round((sc.start + sc.duration) * FPS);
        const Scene = SCENES[sc.id];
        return (
          <Sequence key={sc.id} name={sc.id} from={from} durationInFrames={to - from}>
            <Scene words={sc.words} dur={to - from} />
          </Sequence>
        );
      })}
      {mid && (
        <Sequence name="subscribe-nudge" from={Math.round(mid.start * FPS) + 12} durationInFrames={80}>
          <SubscribeNudge y={600} scale={0.8} />
        </Sequence>
      )}
      <TopTitle line1="INDIA KA SABSE" line2="DARAAVNA KILA" hideFrom={cta ? Math.round(cta.start * FPS) - 4 : undefined} />
      <Captions timeline={timeline} y={1400} />
      <ProgressBar total={totalFrames} />
      <Audio src={staticFile("bhangarh/mix.m4a")} />
    </AbsoluteFill>
  );
};
