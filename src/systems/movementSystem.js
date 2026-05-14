import { getCharKey } from "../utils/getCharKey.js";

export default class MovementSystem {
  constructor(scene, player, character) {
    this.scene = scene;
    this.player = player;
    this.character = character;
    this.speed = 130;

    this.lastDirection = "front";
  }

  updateMovement() {
    const scene = this.scene;
    const speed = this.speed;

    scene.player.setVelocity(0);

    let moving = false;

    if (scene.keys.left.isDown) {
      this.moveHorizontal(-speed);
      this.lastDirection = "left";
      moving = true;
    
    } else if (scene.keys.right.isDown) {
      this.moveHorizontal(speed);
      this.lastDirection = "right";
      moving = true;
    }

    if (scene.keys.up.isDown) {
      this.moveVertical(-speed);
      this.lastDirection = "back";
      moving = true;
    
    } else if (scene.keys.down.isDown) {
      this.moveVertical(speed);
      this.lastDirection = "front";
      moving = true;
    }

    const action = moving ? "walk" : "idle";
      
    const key = getCharKey(this.character, action, this.lastDirection);
      
    if (this.player.anims.currentAnim?.key !== key) {
      this.player.anims.play(key, true);
    }

    scene.player.body.velocity.normalize().scale(speed);
    scene.player.setDepth(4);

    return moving;
  }

  moveHorizontal(velocity) {
    const scene = this.scene;
    scene.player.setVelocityX(velocity);
  }

  moveVertical(velocity) {
    const scene = this.scene;
    scene.player.setVelocityY(velocity);
  }
}