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
      <Still id="LogoAvatar" component={LogoAvatar} width={800} height={800} />
      <Still id="LogoFull" component={LogoFull} width={1200} height={1200} />
      <Still id="Banner" component={Banner} width={2560} height={1440} />
    </>
  );
};
