/* Shot table for "5 Bhootiya Jagah": every scene id -> world, camera move, world flags and 2D overlays. */
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { NameTag } from "../../components/Props";
import { Chip, Stamp } from "../../components/three/Overlays";
import { Stage3D } from "../../components/three/Stage3D";
import { CameraRig, lerp3 } from "../../components/three/World";
import { flash, prog, Word, wordFrame } from "../../lib/util";
import { Bhangarh, bhH, Crossroads, DowHill, Dumas, Kuldhara, Shaniwar, V3, WP } from "./Worlds";

type WorldKey = "cross" | "dumas" | "dow" | "shani" | "kul" | "bhan";
type Ov = { k: "chip" | "stamp" | "tag"; text: string; at?: string; until?: string; x?: number; y?: number; bg?: string; fg?: string; color?: string; size?: number };
type Shot = { w: WorldKey; p: [V3, V3]; l: [V3, V3]; fov?: number; x?: Record<string, unknown>; sepia?: boolean; tint?: string; tintOp?: number; exp?: number; flash?: string; ov?: Ov[] };

const WORLDS: Record<WorldKey, React.FC<WP>> = { cross: Crossroads, dumas: Dumas, dow: DowHill, shani: Shaniwar, kul: Kuldhara, bhan: Bhangarh };

const sh = (w: WorldKey, p0: V3, p1: V3, l0: V3, l1: V3 = l0, rest: Partial<Shot> = {}): Shot => ({ w, p: [p0, p1], l: [l0, l1], ...rest });
const chip = (text: string, at?: string, o: Partial<Ov> = {}): Ov => ({ k: "chip", text, at, ...o });
const stamp = (text: string, at?: string, o: Partial<Ov> = {}): Ov => ({ k: "stamp", text, at, ...o });
const tag = (text: string, at?: string, o: Partial<Ov> = {}): Ov => ({ k: "tag", text, at, ...o });

const GREEN = "#1b5e20";
const PURPLE = "#4a1a6a";
const RED = "#7a1010";
const hutY = bhH(-24, -30);
const palY = bhH(0, -44);

export const SHOTS: Record<string, Shot> = {
  /* intro */
  i1: sh("bhan", [4.2, 1.9, 31], [4.6, 2.0, 29.2], [5.2, 2.0, 26], undefined, { exp: 1.3, ov: [stamp("SURYAST KE BAAD: MANA!", "mana", { size: 70 })] }),
  i2: sh("cross", [9, 3.2, 13], [6, 2.8, 9], [0, 2.2, 0], [0, 2.4, 0], { ov: [chip("5 BHOOTIYA JAGAH", "paanch", { bg: RED })] }),
  i3: sh("cross", [3, 1.2, 8], [2.5, 1.4, 6.5], [-8, 6, -30]),
  i4: sh("cross", [2.6, 2.9, 4.0], [2.0, 2.8, 3.2], [0.6, 2.8, 0], undefined, { ov: [chip("ITIHAAS", "asli", { x: 700, bg: GREEN }), chip("KAHANI", "kahani", { x: 1220, bg: PURPLE })] }),
  i5: sh("cross", [1.6, 2.0, 5], [1.1, 1.9, 4.0], [0.6, 1.8, 0], undefined, { x: { lit: [[4, "ek"]], hideExplorer: true }, ov: [stamp("#1 = ?", "ek", { size: 96 })] }),
  i5b: sh("cross", [4, 1.9, 5.5], [3.4, 1.8, 4.6], [1.7, 1.5, 1.6], undefined, { ov: [chip("DAR METER: 0 - 10", "dar", { bg: RED })] }),
  i6: sh("cross", [3.6, 1.6, 4.2], [3.0, 1.7, 3.6], [1.6, 1.4, 1.4], undefined, { x: { lanternAt: "lalten" } }),

  /* #5 Dumas */
  d0: sh("dumas", [0, 6, 40], [0, 4.5, 30], [0, 1.5, 0]),
  d1: sh("dumas", [-14, 2.5, 22], [-10, 2.2, 18], [0, 1, 0]),
  d2: sh("dumas", [12, 3, 26], [8, 2.6, 20], [0, 2, -20], undefined, { x: { sunset: true }, ov: [chip("ARAB SAGAR KA KINARA", "arab")] }),
  d2b: sh("dumas", [0, 1.6, 3.2], [0, 1.8, 1.8], [0, 5, -200], undefined, { x: { sunset: true } }),
  d3: sh("dumas", [3, 1.2, 10], [2, 0.9, 8], [0, 0.2, 4], undefined, { ov: [tag("KAALI RET", "kaali", { y: 260, size: 52 })] }),
  d4: sh("dumas", [8, 2.6, 15], [6, 2.2, 12], [3, 1.2, 8], undefined, { x: { pyre: true }, sepia: true, ov: [chip("LOKKATHA", "kehte", { bg: PURPLE, until: "shmashaan" }), stamp("SHMASHAAN?", "shmashaan", { size: 80 })] }),
  d5: sh("dumas", [4.5, 1.5, 10.5], [3.8, 1.2, 9.6], [3, 0.6, 8], undefined, { x: { pyre: true }, sepia: true, ov: [stamp("RAAKH?", "raakh", { size: 96 })] }),
  d6: sh("dumas", [0, 2.2, 15], [0, 2.0, 12], [0, 1.4, 2], undefined, { x: { ghosts: true, explorer: true }, exp: 1.3, ov: [stamp("WAPAS JAO!", "wapas", { size: 90 })] }),
  d7: sh("dumas", [2.5, 1.0, 14], [2.0, 0.9, 12.5], [0, 0.8, 4], undefined, { x: { dogs: true, ghosts: true }, exp: 1.3, ov: [chip("KHAALI ANDHERE PAR BHAUNKNA", "bhaunkte")] }),
  d8: sh("dumas", [2.5, 4.5, 18], [1.8, 3.6, 14], [0, 0, 6], undefined, { x: { prints: true }, exp: 1.3, ov: [stamp("PAKKA RECORD: NAHI", "pakka", { size: 72 })] }),
  d9: sh("dumas", [0.9, 0.55, 9.6], [0.6, 0.45, 9.0], [0, 0, 8], undefined, { x: { sparkle: true }, exp: 1.4, ov: [chip("SCIENCE", undefined, { bg: GREEN }), chip("IRON JAISE KHANIJ", "iron", { y: 320, bg: GREEN })] }),
  d10: sh("dumas", [6, 1.6, 12], [5, 1.5, 10], [0, 1.2, 5], undefined, { x: { wind: true, explorer: true }, exp: 1.3, ov: [chip("SAMANDAR KI HAWA", "hawa", { bg: GREEN })] }),
  d11: sh("dumas", [0, 8, 46], [0, 7, 40], [0, 1, 0]),
  d12: sh("dumas", [0, 3, 30], [0, 9, 34], [0, 6, -60], [0, 14, -120], { ov: [chip("RAAKH YA KHANIJ?", "raakh", { bg: PURPLE })] }),

  /* #4 Dow Hill */
  w0: sh("dow", [32, 40, 44], [24, 30, 34], [0, 0, -24]),
  w1: sh("dow", [0, 1.8, 14], [0, 1.8, 10], [0, 1.6, -30]),
  w2: sh("dow", [-40, 26, 30], [-30, 20, 20], [0, 2, -30]),
  w3: sh("dow", [3.6, 0.95, 5.8], [3.2, 0.9, 5.2], [2.6, 0.75, 4], undefined, { x: { orchid: true }, exp: 1.35, ov: [chip("SAFED ORCHID KI DHARTI", "safed", { bg: GREEN })] }),
  w4: sh("dow", [-4, 3, -6], [-6, 3.4, -9], [-19, 4, -24], undefined, { ov: [chip("ANGREZON KE ZAMANE KE SCHOOL", "angrezon")] }),
  w4b: sh("dow", [-7.4, 2.0, -13.4], [-8.0, 2.0, -14.6], [-9.85, 1.8, -19.35], undefined, { exp: 1.3, ov: [chip("DOW HILL SCHOOL: 1879", "1879", { bg: RED })] }),
  w5: sh("dow", [2, 6, 20], [1, 5, 12], [0, 1, -40], undefined, { ov: [chip("DONO SCHOOLON KE BEECH KI SADAK", "sadak")] }),
  w6: sh("dow", [0, 1.6, 12], [0, 1.6, 6], [0, 1.4, -40], undefined, { ov: [stamp("DEATH ROAD", "death", { size: 100 })] }),
  w7: sh("dow", [-1.2, 1.6, 2.2], [-0.8, 1.55, 1.2], [0.5, 1.2, -6], undefined, { x: { boy: true, woodcutter: true, shockAt: "sir", vanishAt: "gaayab" }, exp: 1.3, ov: [stamp("BINA SIR!", "sir", { size: 100 })] }),
  w8: sh("dow", [3, 1.4, -1], [2.5, 1.4, -2], [0, 1.2, -6], undefined, { x: { boy: true }, exp: 1.3, ov: [chip("SCHOOL UNIFORM", "uniform")] }),
  w9: sh("dow", [-1, 1.7, 8], [-0.5, 1.7, 4], [6, 1.5, -12], undefined, { x: { eyes: true, walker: true }, exp: 1.3, ov: [stamp("LAAL AANKHEIN", "laal", { size: 84 })] }),
  w10: sh("dow", [-4, 3, -6], [-5, 3.2, -8], [-19, 4, -24], undefined, { x: { day: true }, ov: [chip("SACH?", "sach", { bg: GREEN, until: "prashaasan" }), chip("PRASHAASAN: AISI KOI MAUT NAHI HUI", "prashaasan", { bg: GREEN })] }),
  w11: sh("dow", [12, 14, 22], [10, 12, 18], [0, 3, -20], undefined, { ov: [chip("KOHRA = AANKHON KA DHOKHA?", "dhokha", { bg: GREEN })] }),
  w12: sh("dow", [-6, 2.6, -8], [-8, 2.8, -11], [-19, 4, -24], undefined, { x: { schoolLit: 0 }, ov: [chip("SARDIYON KI CHHUTTIYAN", "chhuttiyon")] }),
  w13: sh("dow", [0, 2, 16], [0, 2, 12], [0, 1.6, -30]),

  /* #3 Shaniwar Wada */
  s0: sh("shani", [0, 5, 48], [0, 5, 38], [0, 7, 0]),
  s1: sh("shani", [-10, 2, 30], [-7, 2, 24], [0, 6, 0]),
  s2: sh("shani", [44, 30, 40], [34, 24, 30], [0, 6, -24], undefined, { x: { day: true, palace: true }, sepia: true, ov: [chip("PESHWA BAJIRAO I • 1730", "bajirao")] }),
  s3: sh("shani", [0, 2.4, -3.5], [0, 2.2, -5.5], [0, 1.6, -11], undefined, { x: { day: true, palace: true, bajirao: true }, sepia: true, ov: [chip("BAJIRAO - MASTANI", "mastani", { bg: PURPLE })] }),
  s4: sh("shani", [-40, 22, 36], [-30, 18, 28], [0, 6, -20], undefined, { x: { day: true, palace: true }, sepia: true, ov: [chip("MARATHA SAAMRAJYA", "maratha")] }),
  s4b: sh("shani", [3.5, 4.6, 7], [2.2, 4.4, 5], [0, 4.5, 1.2], undefined, { exp: 1.3, ov: [chip("DILLI DARWAZA", "dilli", { until: "nukeele" }), stamp("NUKEELE KEELE", "nukeele", { size: 80 })] }),
  s5: sh("shani", [16, 6, -2], [12, 5, -6], [0, 6, -30], undefined, { x: { palace: true }, ov: [chip("30 AUGUST 1773", undefined, { bg: RED })] }),
  s6: sh("shani", [0, 2.6, -1], [0, 2.4, -3], [0, 1.4, -12], undefined, { x: { palace: true, chase: true }, tint: "#5a0a0a", tintOp: 0.22, ov: [tag("PESHWA NARAYANRAO (18)", "narayanrao", { y: 270, size: 46, until: "gardi" }), chip("GARDI SAINIK", "gardi", { bg: RED })] }),
  s7: sh("shani", [201.3, 2.3, 1.6], [200.8, 2.0, 1.1], [199.9, 1.0, 0.05], undefined, { x: { letter: true }, exp: 1.3, ov: [tag("RAGHUNATHRAO KA AADESH", "raghunathrao", { y: 270, size: 44, until: "dhara" }), chip("DHARA = PAKDO", "dhara", { bg: GREEN })] }),
  s8: sh("shani", [200.6, 1.9, 0.9], [200.3, 1.7, 0.6], [199.9, 1.0, 0.05], undefined, { x: { letter: true, maaraAt: "maara" }, exp: 1.3, flash: "maara", ov: [tag("ANANDIBAI", "anandibai", { y: 270, size: 48, until: "maara" }), stamp("MAARA!", "maara", { size: 110 })] }),
  s9: sh("shani", [0.5, 1.8, -2.5], [0.4, 1.8, -3.0], [0, 1.6, -12], undefined, { x: { palace: true, help: true }, tint: "#5a0a0a", tintOp: 0.2, ov: [stamp("KAKA, MALA VACHVA!", "kaka", { size: 72 })] }),
  s10: sh("shani", [10, 3, -4], [8, 3, -6], [0, 1, -24], undefined, { ov: [chip("KOI NAHI BACHA PAAYA", "nahi", { bg: RED })] }),
  s11: sh("shani", [36, 14, 22], [30, 12, 16], [0, 8, -30], undefined, { x: { fire: true }, tint: "#ff4a1a", tintOp: 0.12, ov: [chip("1828: 7 DIN TAK AAG", "1828", { bg: RED, until: "raakh" }), stamp("RAAKH", "raakh", { size: 100 })] }),
  s12: sh("shani", [9, 4.5, -5], [6, 3.5, -9], [0, 0.5, -30], undefined, { ov: [chip("AAJ: SIRF DEEWAREIN AUR NEEV", "deewarein")] }),
  s13: sh("shani", [4, 2, 24], [3, 2, 20], [-4, 14, -60], undefined, { exp: 1.3, ov: [chip("PURNIMA KI RAAT", "purnima", { bg: PURPLE, until: "cheekh" }), stamp("CHEEKH?", "cheekh", { size: 96 })] }),
  s14: sh("shani", [-8, 3, -10], [-5, 2.8, -14], [0, 1, -28], undefined, { ov: [chip("ITIHAAS: SACH", "sach", { x: 640, bg: GREEN }), chip("CHEEKH: LOKKATHA", "lokkatha", { x: 1260, bg: PURPLE })] }),
  s15: sh("shani", [0, 5, 44], [0, 5, 40], [0, 7, 0]),

  /* #2 Kuldhara */
  k0: sh("kul", [60, 30, 60], [44, 22, 44], [0, 1, 0]),
  k1: sh("kul", [0, 1.8, 22], [0, 1.8, 16], [0, 1.6, -20]),
  k2: sh("kul", [-36, 22, 30], [-28, 18, 24], [0, 1, -2], undefined, { ov: [chip("SAIKDON GHAR, KOI NAHI", "saikdon")] }),
  k3: sh("kul", [16, 10, 26], [11, 7.5, 19], [0, 1, 0], undefined, { x: { day: true, villagers: true }, sepia: true, ov: [chip("PALIWAL BRAHMIN", "paliwal")] }),
  k3b: sh("kul", [11.5, 2.6, 19.5], [10.5, 2.3, 18.4], [8, 0.8, 15], undefined, { x: { day: true, villagers: true }, sepia: true, ov: [chip("PAANI BACHANE KE TAREEKE", "paani", { bg: GREEN })] }),
  k4: sh("kul", [0, 2, 18], [0, 2, 12], [0, 1.6, -10], undefined, { ov: [chip("~1825", "1825", { bg: RED, until: "khaali" }), stamp("KHAALI!", "khaali", { size: 96 })] }),
  k5: sh("kul", [4.5, 2.4, 10.5], [3.5, 2.2, 9], [0, 1.4, 3], undefined, { x: { salim: true, pointAt: "beti" }, sepia: true, ov: [tag("DIWAN SALIM SINGH", "salim", { y: 270, size: 48 })] }),
  k6: sh("kul", [8, 6, 4], [6, 5, -4], [0, 1, -30], undefined, { x: { exodus: true }, exp: 1.3, ov: [stamp("84 GAON, 1 RAAT?", "chaurasi", { size: 80 })] }),
  k7: sh("kul", [0, 4, -46], [0, 4.5, -50], [0, 2, 0], undefined, { x: { exodus: true }, flash: "shraap", exp: 1.3, ov: [stamp("SHRAAP!", "shraap", { size: 110 })] }),
  k8: sh("kul", [0, 1.7, 16], [0, 1.7, 9], [0, 1.5, -10], undefined, { x: { ghosts: true }, exp: 1.3, ov: [chip("KADMON KI AAHAT?", "kadmon", { bg: PURPLE })] }),
  k9: sh("kul", [10.6, 2.4, 18.2], [9.6, 2.2, 17.2], [8, 0.4, 15], undefined, { x: { dry: true }, exp: 1.3, ov: [chip("ITIHAASKAAR:", "itihaaskaar", { bg: GREEN }), chip("PAANI KI KAMI", "paani", { y: 320, x: 700, bg: GREEN }), chip("BHAARI TAX", "tax", { y: 320, x: 1220, bg: GREEN })] }),
  k10: sh("kul", [-50, 30, 10], [-40, 26, 0], [0, 0, 0], undefined, { ov: [chip("DHEERE DHEERE?", "dheere", { bg: GREEN })] }),
  k11: sh("kul", [0, 40, 40], [0, 34, 30], [0, 0, -4], undefined, { ov: [stamp("DOBARA KOI NAHI BASA", "dobara", { size: 72 })] }),
  k12: sh("kul", [0, 2, 20], [0, 2, 15], [0, 1.6, -4], undefined, { x: { day: true, tourists: true }, ov: [chip("AAJ: HERITAGE SITE", "heritage", { bg: GREEN })] }),
  k13: sh("kul", [30, 14, 30], [26, 12, 26], [0, 1, 0]),

  /* #1 Bhangarh */
  b0: sh("bhan", [0, 3, 70], [0, 3, 56], [0, 5, 18]),
  b1: sh("bhan", [-8, 2, 40], [-6, 2, 34], [0, 5, 18]),
  b2: sh("bhan", [60, 40, 70], [44, 30, 52], [0, 3, -12], undefined, { x: { day: true }, ov: [chip("16VI SADI • RAJA BHAGWANT DAS", "solahvi")] }),
  b3: sh("bhan", [0, 2.2, 17], [0, 2.2, 8], [0, 2, -20], undefined, { x: { day: true, crowd: true }, sepia: true, ov: [chip("BAZAAR", "bazaar", { x: 560 }), chip("MANDIR", "mandir", { x: 960 }), chip("HAVELIYAN", "haveliyan", { x: 1360 })] }),
  b4: sh("bhan", [0, 2.2, 14], [0, 2.4, 6], [0, 2, -20], undefined, { exp: 1.3, ov: [stamp("KHANDAHAR", "khandahar", { size: 100 })] }),
  b5: sh("bhan", [-8, 3, 2], [-10, 2.8, 0], [-16, 2.5, -6], undefined, { exp: 1.3, ov: [chip("MANDIR: SAHI SALAMAT", "mandir", { bg: GREEN })] }),
  b6: sh("bhan", [24, 10, 36], [20, 9, 30], [0, 6, -40], undefined, { ov: [stamp("2 KAHANIYAN", "do", { size: 90 })] }),
  b7: sh("bhan", [-20.5, hutY + 2, -21.5], [-21.2, hutY + 1.8, -23], [-23.6, hutY + 0.9, -27], undefined, { x: { sadhu: true, day: true }, sepia: true, ov: [tag("GURU BALU NATH", "guru", { y: 270, size: 52 })] }),
  b8: sh("bhan", [-28, hutY + 3, -22], [-27, hutY + 3, -24], [0, palY + 4, -44], undefined, { x: { sadhu: true, day: true }, sepia: true, ov: [stamp("SHART: PARCHHAAIN NAHI!", "shart", { size: 64 })] }),
  b9: sh("bhan", [-16, hutY + 7, -18], [-17, hutY + 6.5, -20], [-24, hutY, -30], undefined, { x: { sadhu: true, shadow: true, day: true }, sepia: true, flash: "padi", ov: [stamp("UJAD GAYA", "ujad", { size: 96 })] }),
  b10: sh("bhan", [2.8, 2, 9.5], [2.2, 1.9, 8.4], [0.3, 1.5, 5], undefined, { x: { princess: true, itr: true, day: true }, sepia: true, ov: [tag("RAJKUMARI RATNAVATI", "ratnavati", { y: 270, size: 48 })] }),
  b11: sh("bhan", [20, 2.4, -1], [22, 2.2, -2], [26, 1.4, -6], undefined, { x: { tantrik: true, day: true, rock: true }, sepia: true, tint: "#2a0a3a", tintOp: 0.25, ov: [tag("TANTRIK SINGHIA", "tantrik", { y: 270, size: 48, until: "jaadu" }), chip("JAADU KA ITR", "jaadu", { bg: PURPLE })] }),
  b12: sh("bhan", [10, 4, 8], [12, 4, 4], [16, 1.4, -6], undefined, { x: { princess: true, itr: true, throwAt: "phenk", rock: true, tantrik: true, day: true }, sepia: true, ov: [chip("ITR CHATTAN PAR!", "chattan", { bg: PURPLE })] }),
  b13: sh("bhan", [32, 4, 2], [31, 3.6, 0], [24, 1.2, -9], undefined, { x: { roll: true, tantrik: true, day: true }, sepia: true, flash: "giri", ov: [stamp("SHRAAP!", "shraap", { size: 110 })] }),
  b14: sh("bhan", [4.2, 1.9, 31], [4.6, 2.0, 29.2], [5.2, 2.0, 26], undefined, { exp: 1.3, ov: [chip("PURATATTVA VIBHAAG KA BOARD", "puratattva", { until: "mana" }), stamp("PRAVESH MANA", "mana", { size: 96 })] }),
  b15: sh("bhan", [-50, 14, 60], [-42, 12, 50], [0, 2, 0], undefined, { x: { leopards: true }, ov: [chip("ASAL WAJAH: SURAKSHA?", "suraksha", { bg: GREEN }), tag("SARISKA KE JAANWAR", "sariska", { y: 330, size: 46 })] }),
  b16: sh("bhan", [0, 2, 34], [0, 2.2, 27], [0, 4, 0], undefined, { x: { ghosts: true }, exp: 1.3, ov: [stamp("HIMMAT HAI?", "himmat", { size: 90 })] }),
  b17: sh("bhan", [0, 6, 56], [0, 6, 50], [0, 5, 10], undefined, { flash: "das" }),

  /* outro */
  o1: sh("cross", [3.2, 2.8, 4.6], [2.6, 2.7, 3.8], [0.6, 2.7, 0], undefined, { x: { lit: [[0, "dumas"], [1, "dow"], [2, "shaniwar"], [3, "kuldhara"], [4, "bhangarh"]] } }),
  o2: sh("cross", [8, 2.5, 10], [6, 2.4, 8], [1, 1.8, 0], undefined, { x: { allLit: true } }),
  o3: sh("cross", [10, 3, 14], [9, 3, 12.5], [0, 2.5, 0], undefined, { x: { allLit: true } }),
  o4: sh("cross", [3, 1.8, 7], [2.6, 2.4, 9], [0, 1.6, -12], undefined, { x: { allLit: true, walkAway: true } }),
};

const OvLayer: React.FC<{ ov: Ov[]; words: Word[] }> = ({ ov, words }) => (
  <g>
    {ov.map((o, i) => {
      const at = o.at ? wordFrame(words, o.at) - 2 : 4;
      const until = o.until ? wordFrame(words, o.until) - 3 : undefined;
      const x = o.x ?? 960;
      const y = o.y ?? 190;
      if (o.k === "chip") return <Chip key={i} x={x} y={y} at={at} text={o.text} bg={o.bg ?? "#111"} until={until} />;
      if (o.k === "stamp") return <Stamp key={i} x={x} y={y + 20} at={at} text={o.text} size={o.size ?? 84} color={o.color ?? "#e01b1b"} until={until} />;
      return <NameTag key={i} x={x} y={y + 40} at={at} text={o.text} size={o.size ?? 46} bg={o.bg ?? "#ffd84d"} fg={o.fg ?? "#111"} until={until} />;
    })}
  </g>
);

export const ShotScene: React.FC<{ id: string; words: Word[]; dur: number }> = ({ id, words, dur }) => {
  const f = useCurrentFrame();
  const s = SHOTS[id];
  if (!s) throw new Error(`no shot for scene ${id}`);
  const t = prog(f, 0, dur, Easing.inOut(Easing.quad));
  const World = WORLDS[s.w];
  const wf = (k: string, nth = 1) => wordFrame(words, k, nth);
  const flashOp = s.flash ? flash(f, wf(s.flash), 8, 0.55) : 0;
  return (
    <Stage3D
      exposure={s.exp ?? 1.2}
      flashOp={flashOp}
      tint={s.sepia ? "#7a4a1a" : s.tint}
      tintOp={s.sepia ? 0.2 : s.tintOp ?? 0}
      overlay={s.ov ? <OvLayer ov={s.ov} words={words} /> : undefined}
    >
      <World f={f} t={t} dur={dur} x={s.x ?? {}} wf={wf} />
      <CameraRig pos={lerp3(s.p[0], s.p[1], t)} look={lerp3(s.l[0], s.l[1], t)} fov={s.fov ?? 45} />
    </Stage3D>
  );
};
