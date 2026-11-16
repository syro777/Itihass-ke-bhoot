import React, { useMemo } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Timeline } from "../lib/util";

type CapWord = { text: string; emph: boolean; start: number; end: number };
type Page = { words: CapWord[]; start: number; end: number };

const MAX_WORDS = 3;
const MAX_CHARS = 17;

export const buildPages = (tl: Timeline): Page[] => {
  const pages: Page[] = [];
  for (const sc of tl.scenes) {
    let cur: CapWord[] = [];
    const flush = () => {
      if (cur.length) {
        pages.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      }
      cur = [];
    };
    for (const w of sc.words) {
      const text = w.text.replace(/[,.:;…]+$/g, "");
      const cw: CapWord = { text, emph: w.emph, start: sc.start + w.start, end: sc.start + w.end };
      const chars = cur.reduce((n, c) => n + c.text.length + 1, 0) + text.length;
      if (cur.length >= MAX_WORDS || (cur.length > 0 && chars > MAX_CHARS)) flush();
      cur.push(cw);
      if (/[,.!?:;…]$/.test(w.text)) flush();
    }
    flush();
  }
  // keep each page on screen until the next one starts (max +0.5s of hold)
  for (let i = 0; i < pages.length; i++) {
    const next = pages[i + 1];
    pages[i].end = next ? Math.min(next.start, pages[i].end + 0.5) : pages[i].end + 0.6;
  }
  return pages;
};

const OUTLINE = (px: number, c = "#000") => {
  const s: string[] = [];
  for (let a = 0; a < 16; a++) {
    const r = (a / 16) * Math.PI * 2;
    s.push(`${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${c}`);
  }
  s.push(`0 ${px + 6}px 0 ${c}`);
  return s.join(",");
};

export const Captions: React.FC<{ timeline: Timeline; y?: number }> = ({ timeline, y = 1300 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pages = useMemo(() => buildPages(timeline), [timeline]);
  const page = pages.find((p) => t >= p.start - 0.04 && t < p.end);
  if (!page) return null;
  const enter = spring({ frame: frame - Math.round(page.start * fps), fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: y,
          transform: `translateY(-50%) scale(${0.82 + 0.18 * enter})`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: 36,
          rowGap: 4,
        }}
      >
        {page.words.map((w, i) => {
          const active = t >= w.start - 0.02 && t < (page.words[i + 1]?.start ?? page.end);
          const spoken = t >= w.start - 0.02;
          const wf = spring({ frame: frame - Math.round(w.start * fps), fps, config: { damping: 10, stiffness: 260, mass: 0.5 } });
          const color = w.emph ? "#ff3434" : active ? "#ffe14d" : "#ffffff";
          const scale = active ? (w.emph ? 1.08 : 1.05) * (0.92 + 0.08 * wf) : 1;
          return (
            <span
              key={i}
              style={{
                fontFamily: "Poppins",
                fontWeight: 900,
                fontSize: w.emph ? 112 : 96,
                lineHeight: 1.12,
                color,
                opacity: spoken ? 1 : 0.88,
                textTransform: "uppercase",
                letterSpacing: 1,
                display: "inline-block",
                transform: `scale(${scale}) rotate(${active ? (i % 2 ? 2 : -2) : 0}deg)`,
                textShadow: OUTLINE(8) + (w.emph && active ? ", 0 0 40px rgba(255,40,40,0.9)" : ""),
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const TopTitle: React.FC<{ line1: string; line2: string; hideFrom?: number }> = ({ line1, line2, hideFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 2, fps, config: { damping: 11 } });
  const hide = hideFrom !== undefined ? spring({ frame: frame - hideFrom, fps, config: { damping: 14 } }) : 0;
  const wob = Math.sin(frame / 18) * 1.2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `scale(${p * (1 - hide)}) rotate(${wob}deg)`,
          opacity: 1 - hide,
        }}
      >
        <div style={{ fontFamily: "Poppins", fontWeight: 900, fontSize: 64, color: "#ffffff", textShadow: OUTLINE(6), letterSpacing: 1 }}>{line1}</div>
        <div style={{ fontFamily: "Creepster", fontSize: 120, color: "#ff2e2e", textShadow: OUTLINE(7) + ", 0 0 30px rgba(255,0,0,0.6)", marginTop: -6, letterSpacing: 4 }}>
          {line2}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProgressBar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, height: 12, width: `${(frame / total) * 100}%`, background: "linear-gradient(90deg,#ff2e2e,#ffd84d)" }} />
    </AbsoluteFill>
  );
};
