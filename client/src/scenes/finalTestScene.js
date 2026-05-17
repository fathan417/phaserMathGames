import FinalTestSystem from '../systems/finalTestSystem.js';
import QuestionSystem from '../systems/questionSystem.js';
import BattleSystem from '../systems/battleSystem.js';
import CharacterSystem from '../systems/CharacterSystem.js';
import { loadCharSprites } from "../utils/loadCharSprites.js";
import { createCharAnimations } from "../utils/createCharAnimations.js";
import { getCharKey } from "../utils/getCharKey.js";

export default class finalTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'finalTestScene' });
    }

    init(data) {
      this.playerData = data.player;
      this.enemyData = data.enemy;
      this.myId = data.myId;
      this.myRole = data.myRole;
      this.mySpawn = data.mySpawn;
      this.enemySpawn = data.enemySpawn;
      this.isMultiplayer = data.isMultiplayer;
    }

    preload() {
        // BGM
        this.load.audio("bgmFinal", "assets/audio/battleTheme.mp3");

        // MAP
        this.load.tilemapTiledJSON('finalTestMap', 'assets/maps/finalTestMap.tmj');

        // BACKGROUND MAP
        this.load.image("gameBackground", "assets/ui/match/gameBackground.jpg");

        // TILESETS
        this.load.image("grass", "assets/environment/tilesets/TX_Tileset_Grass.png");
        this.load.image("wall", "assets/environment/tilesets/TX_Tileset_Wall.png");

        // PROPS
        this.load.image("plant", "assets/environment/props/TX_Plant_with_Shadow.png");
        this.load.image("props", "assets/environment/props/TX_Props_with_Shadow.png");

        // PLAYER
        this.load.spritesheet("player", "assets/characterDefault/TX_Player.png", {
          frameWidth: 32,
          frameHeight: 60
        });

        // ENEMY
        this.load.spritesheet("enemy", "assets/characterDefault/TX_Player.png", {
          frameWidth: 32,
          frameHeight: 60
        });

        const configs = [this.playerData, this.enemyData];

        configs.forEach(cfg => {
          const className = cfg.class.class.toLowerCase().replace(/\s+/g, "");
          const subclass = cfg.subclass.toLowerCase().replace(/\s+/g, "");
        
          loadCharSprites(this, className, subclass, {
            actions: ["idle", "attack", "die"],
            directions: ["front"]
          });
        });

        this.load.image("hpBarContainerUp", "assets/ui/match/up.png");
        this.load.image("hpBarContainerDown", "assets/ui/match/down.png");
        this.load.image("timerBg", "assets/ui/settings/bg.png");
        this.load.image("hpBarBg", "assets/ui/load_bar/bg.png");
        this.load.image("hpBarFill", "assets/ui/load_bar/2.png");
        this.load.image("questionBtn", "assets/ui/level_select/table.png");
        this.load.image("ult", "assets/ui/btn/upgrade.png");
        for (let i = 0; i <= 9; i++) {
          this.load.image(`num_${i}`, `assets/ui/bubble/${i}.png`);
        }

        // YOU WIN
        this.load.image('win_bg', 'assets/ui/you_win/bg.png');
        this.load.image('win_header', 'assets/ui/you_win/header.png');
        this.load.image('win_table', 'assets/ui/you_win/table.png');
        this.load.image('win_star_1', 'assets/ui/you_win/star_1.png');
        this.load.image('win_star_2', 'assets/ui/you_win/star_2.png');
        this.load.image('win_star_3', 'assets/ui/you_win/star_3.png');
        this.load.image('win_star_4', 'assets/ui/you_win/star_4.png');
        this.load.image('btnClose2', 'assets/ui/btn/close_2.png');

        // YOU LOSE
        this.load.image('lose_bg', 'assets/ui/you_lose/bg.png');
        this.load.image('lose_header', 'assets/ui/you_lose/header.png');
        this.load.image('lose_table', 'assets/ui/you_lose/table.png');
        this.load.image('lose_star_4', 'assets/ui/you_lose/star_4.png');
    }

    create() {
        this.isMultiplayer = this.isMultiplayer || false;
        this.hasAnswered = false;

        this.finalMusic = this.sound.add("bgmFinal", {
            loop: true,
            volume: 0
        });
      
        this.finalMusic.play();
      
        this.tweens.add({
            targets: this.finalMusic,
            volume: 0.5,
            duration: 1000,
            ease: "Linear"
        });

        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, "gameBackground")
          .setDisplaySize(width, height);

        const configs = [this.playerData, this.enemyData];

        configs.forEach(cfg => {
          const className = cfg.class.class.toLowerCase().replace(/\s+/g, "");
          const subclass = cfg.subclass.toLowerCase().replace(/\s+/g, "");
        
          createCharAnimations(this, className, subclass, {
            actions: ["idle", "attack", "die"],
            directions: ["front"]
          });
        });

        this.playerCharacter = new CharacterSystem(this, this.playerData.class);
        this.playerCharacter.selectedSubclass = this.playerData.subclass;

        this.enemyCharacter = new CharacterSystem(this, this.enemyData.class);
        this.enemyCharacter.selectedSubclass = this.enemyData.subclass;

        const fullSkills = this.playerCharacter.getSkills();
        const selectedSkills = this.playerData.skills;

        const filteredSkills = fullSkills.filter(fullSkill =>
          selectedSkills.some(sel => sel.name === fullSkill.name)
        );

        this.playerCharacter.getSkills = () => filteredSkills;

        this.setupMap();
        this.setupPlayer();
        this.setupEnemy();
        this.setupCollision();
        this.setupCamera();

        this.finalTestSystem = new FinalTestSystem(this);
        this.finalTestSystem.init(this.playerCharacter, this.enemyCharacter);

        this.battleSystem = new BattleSystem(this);
        this.battleSystem.setFinalTestSystem(this.finalTestSystem);
        this.battleSystem.setBattleObjects({
            player: this.player,
            enemy: this.enemy,
            shadow: this.shadow,
            enemyShadow: this.enemyShadow
        });
            
        this.battleSystem.setCharacters(
            this.playerCharacter,
            this.enemyCharacter
        );

        this.questionSystem = new QuestionSystem(this, {
            onAnswer: (isCorrect) => {
                this.handleAnswer(isCorrect);
            },
            onResetTimer: () => {
                this.battleSystem.timer = 50;
            },
            isBattleOver: () => this.battleSystem.isBattleOver
        });

        this.finalTestSystem.setQuestionSystem(this.questionSystem);
        this.finalTestSystem.setBattleSystem(this.battleSystem);
        this.questionSystem.init();
    }

    update() {
      if (this.finalTestSystem) {
        this.finalTestSystem.update();
      }

      if (this.player && this.shadow) {
        this.shadow.x = this.player.x;
        this.shadow.y = this.player.y + 3;
      }
      
      if (this.enemy && this.enemyShadow) {
        this.enemyShadow.x = this.enemy.x;
        this.enemyShadow.y = this.enemy.y + 3;
      }
    }

    handleAnswer(isCorrect) {
      if (this.battleSystem.isAnimating) return;
      if (this.hasAnswered) return;

      this.hasAnswered = true;

      if (this.isMultiplayer) {
        this.sendAnswerToServer(isCorrect);
      } else {
        if (isCorrect) {
            this.processBattleResult("player");
        } else {
            this.processBattleResult("enemy");
        }
      }
      
    }

    processBattleResult(attacker) {
      if (attacker === "player") {
          this.battleSystem.onCorrectAnswer();
          this.battleSystem.playerAttackTrigger();
          this.hasAnswered = false; 
      } else {
          this.battleSystem.onWrongAnswer();
          this.battleSystem.enemyAttackTrigger();
          this.hasAnswered = false; 
      }
    }

    sendAnswerToServer(isCorrect) {
      const data = {
          playerId: "player1",
          isCorrect: isCorrect,
          time: Date.now()
      };
    
      this.simulateServerReceive(data);
    }

    simulateServerReceive(data) {
      if (!this.serverQueue) {
          this.serverQueue = [];
      }
    
      this.serverQueue.push(data);
    
      setTimeout(() => {
          this.resolveServerQueue();
      }, 100);
    }

    resolveServerQueue() {
      if (!this.serverQueue || this.serverQueue.length === 0) return;
      
      this.serverQueue.sort((a, b) => a.time - b.time);
      
      const winner = this.serverQueue[0];
      
      if (winner.isCorrect) {
          this.processBattleResult("player");
      } else {
          this.processBattleResult("enemy");
      }
    
      this.serverQueue = [];
      this.hasAnswered = false; 
    }

    simulateServerResponse(isCorrect) {
        if (isCorrect) {
            this.processBattleResult("player");
        } else {
            this.processBattleResult("enemy");
        }
    }

    createShadow(scene, x, y, scale = 1) {
      const shadow = scene.add.ellipse(x, y, 30 * scale, 12 * scale, 0x000000, 0.4);
      shadow.setDepth(3);
      return shadow;
    }

    setupMap() {
        const map = this.make.tilemap({ key: 'finalTestMap' });

        const tilesets = [
          map.addTilesetImage("grass", "grass"),
          map.addTilesetImage("wall", "wall"),
          map.addTilesetImage("plant", "plant"),
          map.addTilesetImage("props", "props"),
        ];

        this.groundLayer     = map.createLayer("grass", tilesets);
        this.wallLayer       = map.createLayer("wall", tilesets);

        this.obstacleBottom  = map.createLayer("obstacle-bottom", tilesets);
        this.obstacleTop     = map.createLayer("obstacle", tilesets);

        this.decoration      = map.createLayer("decoration", tilesets);

        this.layers = [
            this.groundLayer,
            this.wallLayer,
            this.obstacleBottom,
            this.obstacleTop,
            this.decoration
        ];

        this.groundLayer.setDepth(0);

        this.obstacleBottom.setDepth(3);
        this.obstacleTop.setDepth(1002);

        this.decoration.setDepth(1);

        this.wallLayer.setCollisionByProperty({ Collides: true });
        this.obstacleBottom.setCollisionByProperty({ Collides: true });
        this.decoration.setCollisionByProperty({ Collides: true });

        this.map = map;
    }

    setupCamera() {
      const mapWidth  = this.map.widthInPixels;
      const mapHeight = this.map.heightInPixels;

      this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

      this.cameras.main.setBounds(-80, 130, mapWidth, mapHeight);
      this.cameras.main.setZoom(1.6);

    }

    setupPlayer() {
      const spawnPoint = this.map.findObject(
        "spawn",
        obj => obj.name === "playerSpawn1"
      );

      const key = getCharKey(this.playerCharacter, "idle", "front");

      this.player = this.physics.add.sprite(
        spawnPoint.x,
        spawnPoint.y,
        key,
        0
      );

      this.shadow = this.createShadow(
        this,
        spawnPoint.x,
        spawnPoint.y + 3,
        this.player.scale
      );

      const scaleMap = {
        defender: 0.2,
        guard: 0.26,
        specialist: 0.26 
      };
      const keyScale = this.playerData.class.class.toLowerCase().replace(/\s+/g, "");

      this.player.anims.play(getCharKey(this.playerCharacter, "idle", "front"), true);
      this.player.setScale(scaleMap[keyScale]);
      this.player.setOrigin(0.5, 0.75);
      this.player.setCollideWorldBounds(true);
      this.player.setDepth(4);
      this.player.setImmovable(true);
      this.player.setVelocity(0, 0);
      this.player.body.setSize(18, 20);
      this.player.body.setOffset(7.5, 38);
      this.player.body.setAllowGravity(false);
    }

    setupEnemy() {
      const spawnPoint = this.map.findObject(
        "spawn",
        obj => obj.name === "playerSpawn2"
      );

      const key = getCharKey(this.enemyCharacter, "idle", "front");

      this.enemy = this.physics.add.sprite(
        spawnPoint.x,
        spawnPoint.y,
        key,
        0
      );

      this.enemyShadow = this.createShadow(
        this,
        spawnPoint.x,
        spawnPoint.y + 3,
        this.enemy.scale
      );

      const scaleMap = {
        defender: 0.2,
        guard: 0.26,
        specialist: 0.26 
      };
      const keyScale = this.enemyData.class.class.toLowerCase().replace(/\s+/g, "");

      this.enemy.anims.play(getCharKey(this.enemyCharacter, "idle", "front"), true);
      this.enemy.setScale(scaleMap[keyScale]);
      this.enemy.setOrigin(0.5, 0.75);
      this.enemy.setCollideWorldBounds(true);
      this.enemy.setDepth(4);
      this.enemy.setImmovable(true);
      this.enemy.setVelocity(0, 0);
      this.enemy.body.setSize(18, 20);
      this.enemy.body.setOffset(7.5, 38);
      this.enemy.body.setAllowGravity(false);
    }

    setupCollision() {
      this.physics.add.collider(this.player, this.wallLayer);
      this.physics.add.collider(this.player, this.obstacleBottom);
      this.physics.add.collider(this.player, this.decoration);
      this.physics.add.collider(this.enemy, this.wallLayer);
      this.physics.add.collider(this.enemy, this.obstacleBottom);
      this.physics.add.collider(this.enemy, this.decoration);
    }
}