import mainMenuScene from "./src/scenes/mainMenuScene.js";
import gameScene from "./src/scenes/gameScene.js";
import finalTestScene from './src/scenes/finalTestScene.js';

window.socket = io("http://192.168.18.14:3000");

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1480,
    height: 720
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