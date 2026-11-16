import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { H, W } from "../lib/util";
import { Grain, Vignette } from "./Scenery";
import { SharedDefs } from "./Stickman";

export type Cam = { zoom?: number; cx?: number; cy?: number; sx?: number; sy?: number; rot?: number };

type Props = {
  cam?: Cam;
  transition?: "punch" | "glitch" | "none";
  flash?: number;
  tint?: string;
  tintOpacity?: number;
  grain?: number;
  vignette?: number;
  children: React.ReactNode;
};

/** Full-frame SVG stage with camera, entry transition, vignette, grain and flash overlays. */
export const SceneFrame: React.FC<Props> = ({ cam = {}, transition = "punch", flash = 0, tint, tintOpacity = 0, grain = 0.07, vignette = 1, children }) => {
  const frame = useCurrentFrame();
  const entryZoom =
    transition === "punch" ? interpolate(frame, [0, 10], [1.16, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 1;
  const entryFlash = transition === "punch" ? interpolate(frame, [0, 7], [0.5, 0], { extrapolateRight: "clamp" }) : 0;
  const glitchOn = transition === "glitch" && frame < 11;
  const z = (cam.zoom ?? 1) * entryZoom;
  const cx = cam.cx ?? W / 2;
  const cy = cam.cy ?? H / 2;
  const fl = Math.min(1, flash + entryFlash);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        filter: glitchOn ? `hue-rotate(${Math.round(random(`gh${frame}`) * 360)}deg) contrast(1.5) saturate(2.2)` : undefined,
        transform: glitchOn ? `translateX(${(random(`gx${frame}`) - 0.5) * 70}px)` : undefined,
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <SharedDefs />
        <g transform={`translate(${W / 2 + (cam.sx ?? 0)},${H / 2 + (cam.sy ?? 0)}) rotate(${cam.rot ?? 0}) scale(${z}) translate(${-cx},${-cy})`}>
          {children}
        </g>
        <Vignette strength={vignette} />
        {tint && tintOpacity > 0 && <rect x={0} y={0} width={W} height={H} fill={tint} opacity={tintOpacity} />}
        <Grain opacity={grain} />
        {fl > 0 && <rect x={0} y={0} width={W} height={H} fill="#ffffff" opacity={fl} />}
        {glitchOn &&
          new Array(6).fill(0).map((_, i) => (
            <rect
              key={i}
              x={0}
              y={random(`gy${frame}${i}`) * H}
              width={W}
              height={10 + random(`gw${frame}${i}`) * 60}
              fill={i % 2 ? "#ff00aa" : "#00e5ff"}
              opacity={0.35}
            />
          ))}
      </svg>
    </AbsoluteFill>
  );
};
