// @ts-nocheck
import { Color, DisplayMode, Engine, FadeInOut, Input, Keys } from "excalibur";
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

// Music system - use HTML Audio directly
let audioElement: HTMLAudioElement | null = null;
let isMuted = false;

game.start("menu", { loader }).then(() => {
  // Create audio element and play music
  audioElement = new Audio();
  audioElement.src = "/assets/ninja/audio/theme_lost_village.ogg";
  audioElement.loop = true;
  audioElement.volume = 0.5;
  audioElement.play();
  
  // Add keyboard listener for M key mute toggle
  game.input.keyboard.on("press", (event) => {
    if (event.key === Keys.M) {
      isMuted = !isMuted;
      if (audioElement) {
        audioElement.volume = isMuted ? 0 : 0.5;
      }
    }
  });
}).catch(err => {
  console.error("Erro ao carregar recursos:", err);
});