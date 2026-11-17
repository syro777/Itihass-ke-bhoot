import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, ProgressBar, TopTitle } from "../../components/Captions";
import { SubscribeNudge } from "../../components/Subscribe";
import { FPS, Timeline } from "../../lib/util";
import timelineJson from "../../data/roopkund.timeline.json";
import { SCENES, SP } from "./Scenes3D";

export const timeline = timelineJson as Timeline;
export const totalFrames = Math.round(timeline.duration * FPS);

export const Roopkund: React.FC = () => {
  const cta = timeline.scenes.find((s) => s.id === "cta");
  const mid = timeline.scenes.find((s) => s.id === "theory");
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timeline.scenes.map((sc) => {
        const from = Math.round(sc.start * FPS);
        const to = Math.round((sc.start + sc.duration) * FPS);
        const Scene = (SCENES as Record<string, React.FC<SP>>)[sc.id];
        return (
          <Sequence key={sc.id} name={sc.id} from={from} durationInFrames={to - from}>
            <Scene words={sc.words} dur={to - from} />
          </Sequence>
        );
      })}
      {mid && (
        <Sequence name="subscribe-nudge" from={Math.round(mid.start * FPS) + 12} durationInFrames={80}>
          <SubscribeNudge y={620} scale={0.8} />
        </Sequence>
      )}
      <TopTitle line1="HIMALAYA KI" line2="KANKAAL JHEEL" hideFrom={cta ? Math.round(cta.start * FPS) - 4 : undefined} />
      <Captions timeline={timeline} y={1400} />
      <ProgressBar total={totalFrames} />
      <Audio src={staticFile("roopkund/mix.m4a")} />
    </AbsoluteFill>
  );
};
