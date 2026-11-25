import "./fonts";
import { Composition, Still } from "remotion";
import { Banner, LogoAvatar, LogoFull } from "./brand/Brand";
import { Bhangarh, totalFrames } from "./episodes/bhangarh/Bhangarh";
import { Kuldhara, totalFrames as kuldharaFrames } from "./episodes/kuldhara/Kuldhara";
import { ShaniwarWada, totalFrames as shaniwarFrames } from "./episodes/shaniwar-wada/ShaniwarWada";
import { FPS, H, W } from "./lib/util";
import { Roopkund, totalFrames as roopkundFrames } from "./episodes/roopkund/Roopkund";
import { Pushpak, totalFrames as pushpakFrames } from "./episodes/pushpak/Pushpak";
import { Gumnaami, totalFrames as gumnaamiFrames } from "./episodes/gumnaami/Gumnaami";
import { Tanot, totalFrames as tanotFrames } from "./episodes/tanot/Tanot";
import { ShastriBhabha, totalFrames as shastriBhabhaFrames } from "./episodes/shastri-bhabha/ShastriBhabha";
import { Bhootiya5, Bhootiya5Thumb, totalFrames as bhootiya5Frames } from "./episodes/bhootiya-5/Bhootiya5";
import { Jatinga, totalFrames as jatingaFrames } from "./episodes/jatinga/Jatinga";
import { ShivajiEscape, totalFrames as shivajiFrames } from "./episodes/shivaji-agra-escape/ShivajiEscape";
import { TowerRavens, towerRavensFrames } from "./episodes/tower-ravens/TowerRavens";
import { Flight19, flight19Frames } from "./episodes/flight-19/Flight19";
import { DyatlovPass, dyatlovFrames } from "./episodes/dyatlov-pass/DyatlovPass";
import { ChandBaori, chandBaoriFrames } from "./episodes/chand-baori/ChandBaori";
import { GolcondaClap, golcondaFrames } from "./episodes/golconda-clap/GolcondaClap";
import { Kiradu, kiraduFrames } from "./episodes/kiradu/Kiradu";
import { IslandOfDolls, islandOfDollsFrames } from "./episodes/island-of-dolls/IslandOfDolls";
import { KohinoorCurse, kohinoorFrames } from "./episodes/kohinoor-curse/KohinoorCurse";
import { Kailasa, kailasaFrames } from "./episodes/kailasa-ellora/Kailasa";
import { Flannan, flannanFrames } from "./episodes/flannan-isles/Flannan";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Bhangarh" component={Bhangarh} durationInFrames={totalFrames} fps={FPS} width={W} height={H} />
      <Composition id="Kuldhara" component={Kuldhara} durationInFrames={kuldharaFrames} fps={FPS} width={W} height={H} />
      <Composition id="ShaniwarWada" component={ShaniwarWada} durationInFrames={shaniwarFrames} fps={FPS} width={W} height={H} />
      <Composition id="Roopkund" component={Roopkund} durationInFrames={roopkundFrames} fps={FPS} width={W} height={H} />
      <Composition id="Pushpak" component={Pushpak} durationInFrames={pushpakFrames} fps={FPS} width={W} height={H} />
      <Composition id="Gumnaami" component={Gumnaami} durationInFrames={gumnaamiFrames} fps={FPS} width={W} height={H} />
      <Composition id="Tanot" component={Tanot} durationInFrames={tanotFrames} fps={FPS} width={W} height={H} />
      <Composition id="ShastriBhabha" component={ShastriBhabha} durationInFrames={shastriBhabhaFrames} fps={FPS} width={W} height={H} />
      <Composition id="Jatinga" component={Jatinga} durationInFrames={jatingaFrames} fps={FPS} width={W} height={H} />
      <Composition id="ShivajiEscape" component={ShivajiEscape} durationInFrames={shivajiFrames} fps={FPS} width={W} height={H} />
      <Composition id="TowerRavens" component={TowerRavens} durationInFrames={towerRavensFrames} fps={FPS} width={W} height={H} />
      <Composition id="Flight19" component={Flight19} durationInFrames={flight19Frames} fps={FPS} width={W} height={H} />
      <Composition id="DyatlovPass" component={DyatlovPass} durationInFrames={dyatlovFrames} fps={FPS} width={W} height={H} />
      <Composition id="ChandBaori" component={ChandBaori} durationInFrames={chandBaoriFrames} fps={FPS} width={W} height={H} />
      <Composition id="GolcondaClap" component={GolcondaClap} durationInFrames={golcondaFrames} fps={FPS} width={W} height={H} />
      <Composition id="Kiradu" component={Kiradu} durationInFrames={kiraduFrames} fps={FPS} width={W} height={H} />
      <Composition id="IslandOfDolls" component={IslandOfDolls} durationInFrames={islandOfDollsFrames} fps={FPS} width={W} height={H} />
      <Composition id="KohinoorCurse" component={KohinoorCurse} durationInFrames={kohinoorFrames} fps={FPS} width={W} height={H} />
      <Composition id="Kailasa" component={Kailasa} durationInFrames={kailasaFrames} fps={FPS} width={W} height={H} />
      <Composition id="Flannan" component={Flannan} durationInFrames={flannanFrames} fps={FPS} width={W} height={H} />
      <Composition id="Bhootiya5" component={Bhootiya5} durationInFrames={bhootiya5Frames} fps={FPS} width={1920} height={1080} />
      <Still id="Bhootiya5Thumb" component={Bhootiya5Thumb} width={1280} height={720} />
      <Still id="LogoAvatar" component={LogoAvatar} width={800} height={800} />
      <Still id="LogoFull" component={LogoFull} width={1200} height={1200} />
      <Still id="Banner" component={Banner} width={2560} height={1440} />
    </>
  );
};
