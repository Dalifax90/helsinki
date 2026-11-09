// @ts-nocheck
import { ImageSource, Loader, FontSource, Audio } from "excalibur";

export const Resources = {
  // Ninja Adventure characters - sprite sheet 64x112
  // Columns: DOWN=0, UP=1, LEFT=2, RIGHT=3
  // Rows: IDLE=0, MOVING=0..3, ATTACK=4, JUMP=5, DEAD=6
  NinjaSheet: new ImageSource("./assets/ninja/characters/ninja_blue.png"),
  SamuraiGreenSheet: new ImageSource("./assets/ninja/characters/samurai_green.png"),
  SamuraiBlueSheet: new ImageSource("./assets/ninja/characters/samurai_blue.png"),

  // Tilesets
  FloorInterior: new ImageSource("./assets/ninja/tiles/floor.png"),
  WallSimple: new ImageSource("./assets/ninja/tiles/wall.png"),
  Village: new ImageSource("./assets/ninja/tiles/village.png"),

  // Props
  Crate: new ImageSource("./assets/ninja/props/crate.png"),
  Pot: new ImageSource("./assets/ninja/props/pot.png"),
  Grass: new ImageSource("./assets/ninja/props/grass.png"),

  // UI
  Heart: new ImageSource("./assets/ninja/ui/heart.png"),

  // Font
  FontNormal: new FontSource("./assets/ninja/font/font_normal.ttf", "NinjaAdventure"),

  // Audio - paths are relative to the HTML document
  ThemeLostVillage: "./assets/audio/theme_lost_village.ogg",
} as const;

// We build a loader and add all of our resources to the boot loader
// You can build your own loader by extending DefaultLoader
export const loader = new Loader();
// Add image resources
loader.addResource(Resources.NinjaSheet);
loader.addResource(Resources.SamuraiGreenSheet);
loader.addResource(Resources.SamuraiBlueSheet);
loader.addResource(Resources.FloorInterior);
loader.addResource(Resources.WallSimple);
loader.addResource(Resources.Village);
loader.addResource(Resources.Crate);
loader.addResource(Resources.Pot);
loader.addResource(Resources.Grass);
loader.addResource(Resources.Heart);
// Add font resource
loader.addResource(Resources.FontNormal);
// Audio loading - will be accessed via engine.audio
export async function loadResources(): Promise<void> {
  await loader.load();
}