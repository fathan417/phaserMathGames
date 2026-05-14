import mainMenuScene from "./src/scenes/mainMenuScene.js";
import gameScene from "./src/scenes/gameScene.js";
import finalTestScene from './src/scenes/finalTestScene.js';

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight
  },

  backgroundColor: "#000000",

  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },

  scene: [mainMenuScene, gameScene, finalTestScene]
};

new Phaser.Game(config);