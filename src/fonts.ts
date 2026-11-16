import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const fonts = [
  { family: "Poppins", url: "Poppins-Black.ttf", weight: "900" },
  { family: "Poppins", url: "Poppins-ExtraBold.ttf", weight: "800" },
  { family: "Creepster", url: "Creepster-Regular.ttf", weight: "400" },
  { family: "Hind", url: "Hind-Bold.ttf", weight: "700" },
  { family: "Teko", url: "Teko.ttf", weight: "600" },
];

export const fontsLoaded = Promise.all(fonts.map((f) => loadFont({ family: f.family, url: staticFile(f.url), weight: f.weight })));
