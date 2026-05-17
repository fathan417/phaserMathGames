import { getCharKey } from "../utils/getCharKey.js";

export default class MovementSystem {
  constructor(scene, player, playerCharacter, enemy, enemyCharacter, myId) {
    this.scene = scene;
    this.player = player;
    this.enemy = enemy;
    this.playerCharacter = playerCharacter;
    this.enemyCharacter = enemyCharacter;
    this.myId = myId;
    this.speed = 130;

    this.lastDirection = "front";
  }

  updateMovement() {
    const scene = this.scene;
    const speed = this.speed;

    if (!this.player || !this.myId) return false;

    scene.player.setVelocity(0);

    let moving = false;

    if (scene.keys.left.isDown || scene.cursorsMobile.left) {
      this.moveHorizontal(-speed);
      this.lastDirection = "left";
      moving = true;
    
    } else if (scene.keys.right.isDown || scene.cursorsMobile.right) {
      this.moveHorizontal(speed);
      this.lastDirection = "right";
      moving = true;
    }

    if (scene.keys.up.isDown || scene.cursorsMobile.up) {
      this.moveVertical(-speed);
      this.lastDirection = "back";
      moving = true;
    
    } else if (scene.keys.down.isDown || scene.cursorsMobile.down) {
      this.moveVertical(speed);
      this.lastDirection = "front";
      moving = true;
    }

    
    const action = moving ? "walk" : "idle";
    const playerKey = getCharKey(this.playerCharacter, action, this.lastDirection);
    
    if (this.player.anims.currentAnim?.key !== playerKey) {
      this.player.anims.play(playerKey, true);
    }
    
    window.socket.emit("playerMove", {
      x: this.player.x,
      y: this.player.y,
      anim: playerKey,
      dir: this.lastDirection
    });

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