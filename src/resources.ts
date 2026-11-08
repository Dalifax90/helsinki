import { ImageSource, Loader } from "excalibur";
export const Resources = {
    Sword: new ImageSource('/images/sword.png'),

    PlayerFront: new ImageSource('/images/sprite_1.png'),
    PlayerBack: new ImageSource('/images/sprite_2.png'),
    PlayerRight: new ImageSource('/images/sprite_3.png'),
    PlayerLeft: new ImageSource('/images/sprite_4.png'),
};


// We build a loader and add all of our resources to the boot loader
// You can build your own loader by extending DefaultLoader
export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
