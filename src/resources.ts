import { ImageSource, Loader } from "excalibur";

export const Resources = {
  PlayerUp: new ImageSource("./images/andando pra cima.png"),
  PlayerDown: new ImageSource("./images/andandoprabaixo.png"),
  PlayerLeft: new ImageSource("./images/andandoesquerda.png"),
  PlayerRight: new ImageSource("./images/andandodireita.png"),
  Sword: new ImageSource("./images/espada.png")
} as const;

// We build a loader and add all of our resources to the boot loader
// You can build your own loader by extending DefaultLoader
export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
