import { Color, DisplayMode, Engine, FadeInOut } from "excalibur";
import { loader } from "./resources";
import { MyLevel } from "./level";
import { StartScreen } from "./startScreen";

const game = new Engine({
  width: 800,
  height: 600,
  displayMode: DisplayMode.FitScreenAndFill,
  pixelArt: true,
  scenes: {
    menu: StartScreen,
    level: {
      scene: MyLevel,
      transitions: {
        in: new FadeInOut({ duration: 400, direction: "in", color: Color.Black }),
        out: new FadeInOut({ duration: 400, direction: "out", color: Color.Black })
      }
    }
  }
});

game.start("menu", {
  loader,
  inTransition: new FadeInOut({ duration: 400, direction: "in", color: Color.Black })
});