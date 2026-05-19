import MaterialSystem from "../systems/materialSystem.js";
import InteractionSystem from "../systems/interactionSystem.js";
import MovementSystem from "../systems/movementSystem.js";
import materialsData from "../../data/material.js";
import CharacterSystem from '../systems/CharacterSystem.js';
import { loadCharSprites } from "../utils/loadCharSprites.js";
import { createCharAnimations } from "../utils/createCharAnimations.js";
import { getCharKey } from "../utils/getCharKey.js";
import Guard from '../../data/characters/guard.js';
import Defender from '../../data/characters/defender.js';
import Specialist from '../../data/characters/specialist.js';

const classMap = {
  Guard,
  Defender,
  Specialist
};

function resolveCharacter(data) {
  return {
    class: classMap[data.class],
    subclass: data.subclass,
    skills: data.skills
  };
}

export default class gameScene extends Phaser.Scene {

  constructor() {
    super("gameScene");
  }

  init(data) {
    this.playerData = data.player;
    this.enemyData = data.enemy;
    this.myId = data.myId;
    this.myRole = data.myRole;
    this.mySpawn = data.mySpawn;
    this.enemySpawn = data.enemySpawn;
    this.isMultiplayer = data.isMultiplayer;
    this.selectedSkills = [];
    
    this.coinGame = 25;
    this.statueProgress = 0;
    this.totalStatue = 0;

    this.isInPrologue = true;
  }

  preload() {
    // BGM
    this.load.audio("bgmGame", "assets/audio/materialTheme.mp3");

    // MAP
    this.load.tilemapTiledJSON("map", "assets/maps/map.tmj");

    // BACKGROUND MAP
    this.load.image("gameBackground", "assets/ui/match/gameBackground.jpg");

    // TILESETS
    this.load.image("grass", "assets/environment/tilesets/TX_Tileset_Grass.png");
    this.load.image("wall", "assets/environment/tilesets/TX_Tileset_Wall.png");
    this.load.image("stone", "assets/environment/tilesets/TX_Tileset_Stone_Ground.png");

    // PROPS
    this.load.image("plant", "assets/environment/props/TX_Plant_with_Shadow.png");
    this.load.image("props", "assets/environment/props/TX_Props_with_Shadow.png");
    this.load.image("props_no_shadow", "assets/environment/props/TX_Props.png");

    // PLAYER & ENEMY
    const configs = [this.playerData, this.enemyData];

    configs.forEach(cfg => {
      const className = cfg.class.toLowerCase().replace(/\s+/g, "");
      const subclass = cfg.subclass.toLowerCase().replace(/\s+/g, "");
    
      loadCharSprites(this, className, subclass, {
        actions: ["idle", "walk"],
        directions: ["front", "back", "left", "right"]
      });
    });

    // COIN
    this.load.image("coinAngka", "assets/sprite/coinAngka.png");
    this.load.image("coinGambar", "assets/sprite/coinGambar.png");

    // DICE
    this.load.spritesheet("dice", "assets/sprite/dice.png", {
      frameWidth: 32,
      frameHeight: 32
    });

    // CARD
    this.load.image("cardRed", "assets/sprite/cardRed.png");
    this.load.image("cardBlue", "assets/sprite/cardBlue.png");

    // BALL
    this.load.image("tennisBall", "assets/sprite/tennisBall.png");
    this.load.image("basketBall", "assets/sprite/basketBall.png");

    // PROGRESS
    this.load.image("coin", "assets/sprite/coin.png");
    this.load.image("star", "assets/ui/upgrade/star.png");
    this.load.image("statue", "assets/sprite/statue.png");
    this.load.image("ui_bg", "assets/ui/settings/bg.png");

    // SHOP
    this.load.image("shop_bg", "assets/ui/shop/bg.png");
    this.load.image("shop_table", "assets/ui/shop/table.png");
    this.load.image("shop_header", "assets/ui/shop/header.png");
    this.load.image("shop_btn", "assets/ui/shop/btn.png");
    this.load.image("shop_ok", "assets/ui/btn/ok.png");

    // MATERIAL
    this.load.image("btnNext", "assets/ui/btn/next.png");
    this.load.image("feedback", "assets/ui/btn/about.png");
    this.load.image("feedbackCloud", "assets/ui/clouds/4.png");

    // INTERACTION
    this.load.image("btnInteract", "assets/ui/shop/btn.png");
    this.load.image("prologueCloud", "assets/ui/clouds/4.png");
    this.load.image("btnPlay", "assets/ui/menu/play.png");
  }

  create() {
    this.gameMusic = this.sound.add("bgmGame", {
        loop: true,
        volume: 0
    });

    this.gameMusic.play();

    this.tweens.add({
        targets: this.gameMusic,
        volume: 0.5,
        duration: 1000,
        ease: "Linear"
    });

    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.4)
      .setOrigin(0)
      .setDepth(-1)
      .setScrollFactor(0);

    this.add.image(width / 2, height / 2, "gameBackground")
      .setDisplaySize(width, height)
      .setDepth(-2)
      .setScrollFactor(0);

    this.playerCharacter = new CharacterSystem(this, this.playerData.class);
    this.playerCharacter.selectedSubclass = this.playerData.subclass;

    this.enemyCharacter = new CharacterSystem(this, this.enemyData.class);
    this.enemyCharacter.selectedSubclass = this.enemyData.subclass;

    this.prologueTexts = [
      "Selamat datang di Dungeon Terra...",
      "Carilah monument di tiap lantai untuk menambah wawasanmu.",
      "Pengetahuan adalah kekuatan. Kumpulkan kekuatanmu untuk menghadapi musuh."
    ];

    this.floorData = {
      1: "DASAR PELUANG",
      2: "RUANG SAMPEL",
      3: "RUMUS PELUANG",
      4: "PELUANG BERSYARAT",
      5: "PELUANG SALING BEBAS",
      6: "END PORTAL"
    };

    this.currentPrologueIndex = 0;
    this.currentFloor = 1;

    this.setupMap();
    this.setupProgress();
    this.setupPlayer();
    this.setupEnemy();
    this.setupCollision();
    this.setupCamera();
    this.setupControlButtons();
    this.setupInput();
    this.setupAnimation();
    this.setupInteraction();
    this.setupMaterial();
    this.updateUI();
    // this.setupDebug();

    this.time.delayedCall(800, () => {
      this.startPrologue();
    });

    window.socket.on("enemyMove", (data) => {
      if (!this.enemy) return;

      this.enemy.setPosition(data.x, data.y);
      if (this.enemy.anims.currentAnim?.key !== data.anim) {
        this.enemy.anims.play(data.anim, true);
      }
    });

    this.materialSystem = new MaterialSystem(this);
    this.interactionSystem = new InteractionSystem(this, this.playerData, this.enemyData);
    this.movementSystem = new MovementSystem(this, this.player, this.playerCharacter, this.enemy, this.enemyCharacter, this.myId);
  }

  update() {
    if (this.isInPrologue) {
      this.player.setVelocity(0);
      this.enemy.setVelocity(0);

      if (this.prologueCloud) {
        this.prologueCloud.setPosition(this.player.x - 100, this.player.y - 100);
        this.prologueText.setPosition(this.player.x - 100, this.player.y - 140);
      }
      return;
    }

    if (this.materialSystem.updateMaterialMode()) return;
    this.movementSystem.updateMovement();
    this.interactionSystem.updateInteraction();
    // this.updateDebug();

    const shadowMap = {
      defender: 20,
      guard: 16,
      specialist: 16
    }
    const playerKeyShadow = this.playerData.class.toLowerCase().replace(/\s+/g, "");
    const enemyKeyShadow = this.enemyData.class.toLowerCase().replace(/\s+/g, "");

    if (this.player && this.shadow) {
      this.shadow.x = this.player.x;
      this.shadow.y = this.player.y - shadowMap[playerKeyShadow];
    }

    if (this.enemy && this.enemyShadow) {
      this.enemyShadow.x = this.enemy.x;
      this.enemyShadow.y = this.enemy.y - shadowMap[enemyKeyShadow];
    }

  }

  startPrologue() {
    const x = this.player.x;
    const y = this.player.y
    
    this.prologueCloud = this.add.image(x, y, "prologueCloud");
    this.prologueCloud.setScale(0.28, 0.17).setDepth(2000);
    
    this.prologueText = this.add.text(x, y, "", {
      fontFamily: 'Poppins, sans-serif',
      fontSize: "12px",
      color: "#171717",
      align: "center",
      wordWrap: { width: 190 }
    });

    this.prologueText.setOrigin(0.5, 0);
    this.prologueText.setDepth(2001);

    this.playNextPrologue();
  }

  playNextPrologue() {
    if (this.currentPrologueIndex >= this.prologueTexts.length) {
      this.endPrologue();
      this.showFloorTitle();
      return;
    }

    const text = this.prologueTexts[this.currentPrologueIndex];
    this.prologueText.setText(text);

    this.currentPrologueIndex++;

    this.time.delayedCall(3500, () => {
      this.playNextPrologue();
    });
  }

  endPrologue() {
    this.prologueCloud.destroy();
    this.prologueText.destroy();

    this.isInPrologue = false;
  }

  showFloorTitle() {
    const floor = this.currentFloor;
    const title = this.floorData[floor] || "Unknown";

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.floorText = this.add.text(centerX, centerY - 100, `FLOOR ${floor}`, {
      fontFamily: 'Poppins, sans-serif',
      fontSize: "68px",
      fontStyle: "bold",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5).setAlpha(0).setDepth(4000).setScrollFactor(0);

    this.titleText = this.add.text(centerX, centerY - 55, title, {
      fontFamily: 'Poppins, sans-serif',
      fontSize: "24px",
      fontStyle: "bold",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5).setAlpha(0).setDepth(4000).setScrollFactor(0);

    this.tweens.add({
      targets: [this.floorText, this.titleText],
      alpha: 1,
      duration: 500,
      ease: "Power2"
    });

    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: [this.floorText, this.titleText],
        alpha: 0,
        duration: 500,
        ease: "Power2",
        onComplete: () => {
          this.destroyFloorTitle();
        }
      });
    });
  }

  destroyFloorTitle() {
    if (this.floorText) {
      this.floorText.destroy();
      this.floorText = null;
    }

    if (this.titleText) {
      this.titleText.destroy();
      this.titleText = null;
    }
  }

  //#region SETUP METHODS
    setupMap() {
      const map = this.make.tilemap({ key: "map" });

      const tilesets = [
        map.addTilesetImage("grass", "grass"),
        map.addTilesetImage("wall", "wall"),
        map.addTilesetImage("stone", "stone"),
        map.addTilesetImage("plant", "plant"),
        map.addTilesetImage("props", "props"),
        map.addTilesetImage("props_no_shadow", "props_no_shadow")
      ];

      this.groundLayer     = map.createLayer("grass", tilesets);
      this.wallLayer       = map.createLayer("wall", tilesets);

      this.obstacleBottom  = map.createLayer("obstacle-bottom", tilesets);
      this.interactBottom  = map.createLayer("interact-bottom", tilesets);

      this.decoration      = map.createLayer("decoration", tilesets);
      this.obstacleTop     = map.createLayer("obstacle", tilesets);
      this.interactTop     = map.createLayer("interact", tilesets);

      this.overlayLayer    = map.createLayer("overlayObs", tilesets);

      this.layers = [
        this.groundLayer,
        this.wallLayer,
        this.obstacleBottom,
        this.interactBottom,
        this.decoration,
        this.obstacleTop,
        this.interactTop,
        this.overlayLayer
      ];

      this.groundLayer.setDepth(0);

      this.obstacleBottom.setDepth(3);
      this.interactBottom.setDepth(2);
      this.decoration.setDepth(1);

      this.obstacleTop.setDepth(1002);
      this.interactTop.setDepth(1000);

      this.overlayLayer.setDepth(50);

      this.wallLayer.setCollisionByProperty({ Collides: true });
      this.obstacleBottom.setCollisionByProperty({ Collides: true });
      this.interactBottom.setCollisionByProperty({ Collides: true });
      this.decoration.setCollisionByProperty({ Collides: true });

      this.map = map;
    }

    setupProgress() {
      this.uiGroup = this.add.group();

      this.uiBg = this.add.image(440, 230, "ui_bg")
        .setScale(0.08)
        .setDepth(99999)
        .setScrollFactor(0);

      this.coinIcon = this.add.image(425, 215, "coin")
        .setScale(0.2)
        .setDepth(99999)
        .setScrollFactor(0);

      this.coinText = this.add.text(445, 207.5, this.coinGame, {
        fontSize: "18px",
        color: "#ffffff"
      }).setDepth(99999).setScrollFactor(0);

      this.statueIcon = this.add.image(425, 240, "statue")
        .setScale(0.25)
        .setDepth(99999)
        .setScrollFactor(0);

      this.statueText = this.add.text(445, 233, this.statueProgress, {
        fontSize: "18px",
        color: "#ffffff"
      }).setDepth(99999).setScrollFactor(0);

      this.uiGroup.addMultiple([
        this.uiBg,
        this.coinIcon,
        this.coinText,
        this.statueIcon,
        this.statueText
      ]);
    }

    setUIVisible(isVisible) {
      this.uiGroup.setVisible(isVisible);
    }

    updateUI() {
      this.coinText.setText(this.coinGame);
      this.statueText.setText(this.statueProgress);
    }

    openSkillSelectionUI() {
      this.playerCoins = this.coinGame;
      this.isSkillSelectionOpen = true;
      this.skillUIElements = [];
      this.shopSkillUI = [];

      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      const tableY = centerY + 20;
      const btnY = tableY + 90;

      const skills = this.playerData.skills;
      const positions = [
        centerX - 190,
        centerX,
        centerX + 190
      ];

      const bg = this.add.image(centerX, centerY, "shop_bg")
        .setScale(0.48, 0.3)
        .setScrollFactor(0)
        .setDepth(10000);

      const header = this.add.image(centerX, centerY - 110, "shop_header")
        .setScale(0.13)
        .setScrollFactor(0)
        .setDepth(10002);

      const coinIcon = this.add.image(centerX + 220, centerY - 120, "coin")
        .setScale(0.28)
        .setScrollFactor(0)
        .setDepth(10002);
          
      const coinText = this.add.text(centerX + 238, centerY - 130, this.playerCoins, {
        fontFamily: 'Poppins, sans-serif',
        fontSize: "20px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(10002);

      const okBtn = this.add.image(centerX + 270, centerY + 100, "shop_ok")
        .setScale(0.18)
        .setScrollFactor(0)
        .setDepth(10002)
        .setInteractive();
      
      okBtn.on("pointerdown", () => {
          if (this.selectedSkills.length === 0) {
            return;
          }
        
          if (this.isTransitioning) return;
          this.isTransitioning = true;
        
          this.playerData.skills = this.selectedSkills;
        
          const player = resolveCharacter(this.playerData);
          const enemy = resolveCharacter(this.enemyData);
        
          this.tweens.add({
              targets: this.gameMusic,
              volume: 0,
              duration: 1000,
              ease: "Linear",
              onComplete: () => {
                  this.gameMusic.stop();
              
                  this.scene.start('finalTestScene', {
                      player,
                      enemy,
                      isMultiplayer: this.isMultiplayer,
                      myId: this.myId,
                      myRole: this.myRole,
                      mySpawn: this.mySpawn,
                      enemySpawn: this.enemySpawn,
                      socket: window.socket
                  });
              }
          });
        
      });
      
      skills.forEach((skill, index) => {
        const price = skill.type === "ultimate" ? 15 : 10;
        const isAffordable = this.coinGame >= price;
        
        const x = positions[index];
        const y = tableY - 20;
      
        const table = this.add.image(x, y, "shop_table")
          .setScale(0.16, 0.25)
          .setScrollFactor(0)
          .setDepth(10001);
      
        const btn = this.add.image(x, btnY - 10, "shop_btn")
          .setScale(0.2, 0.225)
          .setScrollFactor(0)
          .setDepth(10002)
          .setInteractive();

        btn.on("pointerdown", () => {
          const ui = this.shopSkillUI[index];
          
          if (ui.bought) {
            return;
          }

          if (this.coinGame < price) {
            return;
          }
          
          this.coinGame -= price;
          coinText.setText(this.coinGame);
          this.selectedSkills.push(skill);
          ui.bought = true;
          ui.icon.setAlpha(0.5);
          ui.title.setAlpha(0.5);
          ui.desc.setAlpha(0.5);
          ui.btn.disableInteractive();

          updatePriceColors(); 
        });
        
        const priceIcon = this.add.image(x - 10, btnY - 10, "coin")
        .setScale(0.18)
        .setScrollFactor(0)
        .setDepth(10003);

        const priceText = this.add.text(x, btnY - 16.5, price, {
          fontFamily: 'Poppins, sans-serif',
          fontSize: "12px",
          color: isAffordable ? "#141414" : "#d60d0d",
        })
        .setScrollFactor(0)
        .setDepth(10003);
      
        const isUltimate = skill.type === "ultimate";
        const iconKey = isUltimate ? "ultSkillBtn" : "passiveSkillBtn";
      
        const icon = this.add.image(x - 60, y - 74, iconKey)
          .setScale(isUltimate ? 0.12 : 0.22)
          .setScrollFactor(0)
          .setDepth(10002);
      
        const title = this.add.text(x - 40, y - 74, skill.name, {
          fontFamily: 'Poppins, sans-serif',
          fontSize: "12px",
          color: "#000000",
          fontStyle: "bold",
          wordWrap: { width: 120 }
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(10002);
      
        const desc = this.add.text(x, y - 50, skill.description, {
          fontFamily: 'Poppins, sans-serif',
          fontSize: "10px",
          color: "#000000",
          fontStyle: "bold",
          wordWrap: { width: 160 }
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(10002);
      
        this.shopSkillUI.push({ table, btn, icon, title, desc, price, priceText, bought: false });
        this.skillUIElements.push(bg, header, table, btn, icon, title, desc, okBtn);
      });

      const updatePriceColors = () => {
        this.shopSkillUI.forEach(ui => {
          const affordable = this.coinGame >= ui.price;
          ui.priceText.setColor(affordable ? "#141414" : "#d60d0d");
        });
      };
    }

    onStatueCompleted(reward) {
      this.coinGame += reward.coinGame;
      this.statueProgress += 1;

      this.updateUI();
    }

    createShadow(scene, x, y) {
      const shadow = scene.add.ellipse(x, y, 20, 5, 0x000000, 0.4);
      shadow.setDepth(3);
      return shadow;
    }

    setupPlayer() {
      const mySpawn = this.map.findObject("spawn", obj => obj.name === this.mySpawn);
      const key = getCharKey(this.playerCharacter, "idle", "front");
      const scaleMap = {
        defender: 0.12,
        guard: 0.16,
        specialist: 0.16
      }
      const sizeMapX = {
        defender: 240,
        guard: 150,
        specialist: 150
      }
      const sizeMapY = {
        defender: 190,
        guard: 120,
        specialist: 120
      }
      const offsetMapX = {
        defender: 300,
        guard: 160,
        specialist: 160
      }
      const offsetMapY = {
        defender: 370,
        guard: 270,
        specialist: 270
      }
      const shadowMap = {
        defender: 20,
        guard: 16,
        specialist: 16
      }
      const keyScale = this.playerData.class.toLowerCase().replace(/\s+/g, "");
      const keySizeX = this.playerData.class.toLowerCase().replace(/\s+/g, "");
      const keySizeY = this.playerData.class.toLowerCase().replace(/\s+/g, "");
      const keyOffsetX = this.playerData.class.toLowerCase().replace(/\s+/g, "");
      const keyOffsetY = this.playerData.class.toLowerCase().replace(/\s+/g, "");
      const keyShadow = this.playerData.class.toLowerCase().replace(/\s+/g, "");

      this.player = this.physics.add.sprite(
        mySpawn.x,
        mySpawn.y,
        key,
        0
      )
      .setScale(scaleMap[keyScale] || 0.25);

      this.shadow = this.createShadow(
        this,
        mySpawn.x,
        mySpawn.y - shadowMap[keyShadow],
      );

      this.player.anims.play(key, true);
      this.player.setOrigin(0.5, 1);
      this.player.setCollideWorldBounds(true);
      this.player.body.setSize(sizeMapX[keySizeX], sizeMapY[keySizeY]);
      this.player.body.setOffset(offsetMapX[keyOffsetX], offsetMapY[keyOffsetY]);
    }

    setupEnemy() {
      const enemySpawn = this.map.findObject("spawn", obj => obj.name === this.enemySpawn);
      const key = getCharKey(this.enemyCharacter, "idle", "front");
      const scaleMap = {
        defender: 0.12,
        guard: 0.16,
        specialist: 0.16
      }
      const sizeMapX = {
        defender: 240,
        guard: 150,
        specialist: 150
      }
      const sizeMapY = {
        defender: 190,
        guard: 120,
        specialist: 120
      }
      const offsetMapX = {
        defender: 300,
        guard: 160,
        specialist: 160
      }
      const offsetMapY = {
        defender: 370,
        guard: 270,
        specialist: 270
      }
      const shadowMap = {
        defender: 20,
        guard: 16,
        specialist: 16
      }
      const keyScale = this.enemyData.class.toLowerCase().replace(/\s+/g, "");
      const keySizeX = this.enemyData.class.toLowerCase().replace(/\s+/g, "");
      const keySizeY = this.enemyData.class.toLowerCase().replace(/\s+/g, "");
      const keyOffsetX = this.enemyData.class.toLowerCase().replace(/\s+/g, "");
      const keyOffsetY = this.enemyData.class.toLowerCase().replace(/\s+/g, "");
      const keyShadow = this.enemyData.class.toLowerCase().replace(/\s+/g, "");

      this.enemy = this.physics.add.sprite(
        enemySpawn.x,
        enemySpawn.y,
        key,
        0
      )
      .setScale(scaleMap[keyScale] || 0.25);

      this.enemyShadow = this.createShadow(
        this,
        enemySpawn.x,
        enemySpawn.y - shadowMap[keyShadow],
      );

      this.enemy.anims.play(key, true);
      this.enemy.setOrigin(0.5, 1);
      this.enemy.setCollideWorldBounds(true);
      this.enemy.body.setSize(sizeMapX[keySizeX], sizeMapY[keySizeY]);
      this.enemy.body.setOffset(offsetMapX[keyOffsetX], offsetMapY[keyOffsetY]);
    }

    setupCollision() {
      this.physics.add.collider(this.player, this.wallLayer);
      this.physics.add.collider(this.player, this.obstacleBottom);
      this.physics.add.collider(this.player, this.interactBottom);
      this.physics.add.collider(this.player, this.decoration);

      this.physics.add.collider(this.enemy, this.wallLayer);
      this.physics.add.collider(this.enemy, this.obstacleBottom);
      this.physics.add.collider(this.enemy, this.interactBottom);
      this.physics.add.collider(this.enemy, this.decoration);

    }

    setupCamera() {
      const mapWidth  = this.map.widthInPixels;
      const mapHeight = this.map.heightInPixels;

      this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

      this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
      this.cameras.main.setZoom(2);
      this.cameras.main.startFollow(this.player);
      this.cameras.main.setFollowOffset(0, 60);

    }

    setupControlButtons() {
      this.cursorsMobile = {
          up: false,
          down: false,
          left: false,
          right: false
      };
      const { width, height } = this.scale;

      this.btnRight = this.add.image(width / 2 - 240, height / 2 + 100, "btnPlay")
          .setScale(0.08)
          .setScrollFactor(0)
          .setDepth(41000)
          .setInteractive();

      this.btnRight.on("pointerdown", () => {
          this.cursorsMobile.right = true;
      });
      this.btnRight.on("pointerup", () => {
          this.cursorsMobile.right = false;
      });
      this.btnRight.on("pointerout", () => {
          this.cursorsMobile.right = false;
      });

      this.btnLeft = this.add.image(width / 2 - 320, height / 2 + 100, "btnPlay")
          .setScale(0.08)
          .setScrollFactor(0)
          .setDepth(41000)
          .setFlipX(true)
          .setInteractive();

      this.btnLeft.on("pointerdown", () => {
          this.cursorsMobile.left = true;
      });
      this.btnLeft.on("pointerup", () => {
          this.cursorsMobile.left = false;
      });
      this.btnLeft.on("pointerout", () => {
          this.cursorsMobile.left = false;
      });

      this.btnUp = this.add.image(width / 2 - 280, height / 2 + 60, "btnPlay")
          .setScale(0.08)
          .setScrollFactor(0)
          .setDepth(41000)
          .setRotation(-Math.PI / 2)
          .setInteractive();

      this.btnUp.on("pointerdown", () => {
          this.cursorsMobile.up = true;
      });     
      this.btnUp.on("pointerup", () => {
          this.cursorsMobile.up = false;
      });
      this.btnUp.on("pointerout", () => {
          this.cursorsMobile.up = false;
      });

      this.btnDown = this.add.image(width / 2 - 280, height / 2 + 140, "btnPlay")
          .setScale(0.08)
          .setScrollFactor(0)
          .setDepth(41000)
          .setRotation(Math.PI / 2)
          .setInteractive();

      this.btnDown.on("pointerdown", () => {
          this.cursorsMobile.down = true;
      });     
      this.btnDown.on("pointerup", () => {
          this.cursorsMobile.down = false;
      });
      this.btnDown.on("pointerout", () => {
          this.cursorsMobile.down = false;
      });
    }

    setupInput() {
      this.keys = this.input.keyboard.addKeys({
        up:    Phaser.Input.Keyboard.KeyCodes.W,
        down:  Phaser.Input.Keyboard.KeyCodes.S,
        left:  Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
      });

      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    }

    setupAnimation() {
      // PLAYER & ENEMY ANIMATIONS
      const configs = [this.playerData, this.enemyData];

      configs.forEach(cfg => {
        const className = cfg.class.toLowerCase().replace(/\s+/g, "");
        const subclass = cfg.subclass.toLowerCase().replace(/\s+/g, "");
      
        createCharAnimations(this, className, subclass, {
          actions: ["idle", "walk"],
          directions: ["front", "back", "left", "right"]
        });
      });
    }

    setupInteraction() {
      //INTERACTION SETUP
      const interactionLayer   = this.map.getObjectLayer("interactions");
      const interactionObjects = interactionLayer.objects;

      
      this.interactables = interactionObjects.map(obj => {
        return {
          name: obj.name,
          type: obj.type,
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          group: obj.properties?.find(p => p.name === "group")?.value
        };
      });

      //MISSION STATE SETUP
      this.missionComplete = false;
      this.groupProgress   = {};

      this.interactables.forEach(obj => {
        if (obj.type === "statue") {
          if (!this.groupProgress[obj.group]) {
            this.groupProgress[obj.group] = 0;
          }
        }
      });
    }

    setupMaterial() {
      //MATERIAL DISPLAY SETUP
      this.isInMaterial = false;
      const maxWidth = this.cameras.main.width - 700;
      const cam = this.cameras.main;

      this.materialText = this.add.text(0, 0, "", {
        fontFamily: 'Poppins, sans-serif',
        fontSize: "16px",
        color: "#ffffff",
        padding: { x: 10, y: 10 },
        align: "left",
        wordWrap: {
          width: maxWidth,
          useAdvancedWrap: true
        }
      });

      this.materialText.setScrollFactor(0);
      this.materialText.setDepth(2001);
      this.materialText.setVisible(false);
      this.materialText.setPosition(cam.width / 2, cam.height / 2 - 50);
      this.materialText.setOrigin(0.5);

      this.materialPanel = this.add.image(this.scale.width / 2, this.scale.height / 2, "shop_bg");
      this.materialPanel.setScrollFactor(0);
      this.materialPanel.setScale(0.5, 0.3);
      this.materialPanel.setDepth(2000);
      this.materialPanel.setVisible(false);
      this.materialPanel.setPosition(cam.width / 2, cam.height / 2);

      this.materialBg = this.add.rectangle(0, 0, 900, 1100, 0x000000, 0.5);
      this.materialBg.setScrollFactor(0);
      this.materialBg.setDepth(1999);
      this.materialBg.setVisible(false);
      this.materialBg.setPosition(cam.width / 2, cam.height / 2);

      this.btnNext = this.add.image(this.scale.width / 2 + 280, this.scale.height / 2 + 110, "btnNext");
      this.btnNext.setScrollFactor(0);
      this.btnNext.setScale(0.18);
      this.btnNext.setDepth(2000);
      this.btnNext.setVisible(false);
      this.btnNext.setInteractive();
      this.btnNext.on("pointerdown", () => {this.materialSystem.tryNextPage();});

      this.feedbackIcon = this.add.image(this.scale.width / 2 + 280, this.scale.height / 2 + 60, "feedback");
      this.feedbackIcon.setScrollFactor(0);
      this.feedbackIcon.setScale(0.18);
      this.feedbackIcon.setDepth(2000);
      this.feedbackIcon.setVisible(false);

      this.feedbackCloud = this.add.image(this.scale.width / 2 + 150, this.scale.height / 2 - 35, "feedbackCloud");
      this.feedbackCloud.setScrollFactor(0);
      this.feedbackCloud.setScale(0.425, 0.275);
      this.feedbackCloud.setDepth(3000);
      this.feedbackCloud.setVisible(false);

      this.currentPage = 0;
      this.currentMaterial = [];

      this.materials = materialsData;
    }

    setupDebug() {
      //DEBUG COLLISION
      const debugGraphics = this.add.graphics().setAlpha(0.7);

      this.layers.forEach(layer => {
        layer.renderDebug(debugGraphics, {
          tileColor: null,
          collidingTileColor: new Phaser.Display.Color(255, 0, 0, 150),
          faceColor: new Phaser.Display.Color(40, 255, 40, 255)
        });
      });

      //DEBUG PHYSICS BODIES
      this.physics.world.createDebugGraphic();

      //DEBUG VISUAL INTERACTABLES
      this.interactables.forEach(obj => {
        const debugRect = this.add.rectangle(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          obj.width,
          obj.height
        );

        debugRect.setStrokeStyle(2, 0xff0000);
      });
    }
  //#endregion

  //#region UPDATE METHODS
    updateDebug() {
      // DEBUG INTERACTION TILE
      if (this.currentInteractable) {
        const worldX = this.currentInteractable.x;
        const worldY = this.currentInteractable.y; 
        const tile = this.interactBottom.getTileAtWorldXY(worldX, worldY);
      }
    }
  //#endregion

}