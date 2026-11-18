import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, Vignette } from "../Scenery";
import { SharedDefs } from "../Stickman";

/** 3D stage + 2D overlay layer with vignette, grain, tint and flash. */
export const Stage3D: React.FC<{
  children: React.ReactNode;
  overlay?: React.ReactNode;
  flashOp?: number;
  tint?: string;
  tintOp?: number;
  exposure?: number;
}> = ({ children, overlay, flashOp = 0, tint, tintOp = 0, exposure = 1.15 }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const entry = interpolate(f, [0, 6], [0.45, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={width} height={height} shadows gl={{ toneMappingExposure: exposure }} camera={{ fov: 55, near: 0.1, far: 3000 }}>
        {children}
      </ThreeCanvas>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <SharedDefs />
          <Vignette strength={0.9} />
          {tint && tintOp > 0 && <rect width={1080} height={1920} fill={tint} opacity={tintOp} />}
          <Grain opacity={0.05} />
          {overlay}
          {Math.max(flashOp, entry) > 0 && <rect width={1080} height={1920} fill="#ffffff" opacity={Math.max(flashOp, entry)} />}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

