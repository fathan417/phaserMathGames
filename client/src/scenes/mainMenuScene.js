import CharacterSystem from "../systems/CharacterSystem.js";
import { loadCharSprites } from "../utils/loadCharSprites.js";
import { createCharAnimations } from "../utils/createCharAnimations.js";
import { getCharKey } from "../utils/getCharKey.js";

export default class mainMenuScene extends Phaser.Scene {
    constructor() {
      super("mainMenuScene");
    
      this.characters = [
        {
          class: "Guard",
          subclass: "Swordmaster",
          skills: [
            {
              name:"Fractured Edge",
              type:"passive",
              description:"Serangan memiliki 40% peluang untuk mengurangi DEF target sebesar 10% selama 6 detik. Dapat ditumpuk hingga 2 kali (Durasi direset saat dipicu ulang)."
            },
            {
              name:"Flow of Blades",
              type:"passive",
              description:"Saat memicu combo, Combo Multiplier meningkat menjadi 150%."
            },
            {
              name:"Final Severance",
              type:"ultimate",
              description:"Serangan berikutnya memberikan 260% ATK sebagai damage. Memberikan tambahan damage sebesar 35% dari HP target yang telah hilang. Efek dikonsumsi setelah digunakan."
            }
          ]
        },
        {
          class: "Guard",
          subclass: "Primal Guard",
          skills: [
            {
              name:"Hunter’s Dominance",
              type:"passive",
              description:"Serangan memiliki 38% peluang untuk meningkatkan ATK diri sebesar 12% dan mengurangi ATK musuh sebesar 15% selama 4 detik (Durasi direset saat dipicu ulang)."
            },
            {
              name:"Wild Evasion",
              type:"passive",
              description:"Memiliki 25% peluang untuk menghindari serangan yang masuk."
            },
            {
              name:"Blood Hound Ascension",
              type:"ultimate",
              description:"Max HP +30%, ATK +25%. Serangan berubah menjadi True Damage. HP tidak dapat turun di bawah 1. Kehilangan 4% HP setiap detik (meningkat menjadi 8% per detik setelah 12 detik). Jika HP mencapai 1, unit akan mundur dari pertempuran setelah 15 detik. Durasi tidak terbatas."
            }
          ]
        },
        {
          class: "Defender",
          subclass: "Protector",
          skills: [
            {
              name:"Thorned Bulwark",
              type:"passive",
              description:"DEF +30%. Memantulkan damage sebesar 50% ATK kepada penyerang."
            },
            {
              name:"Last Bastion",
              type:"passive",
              description:"DEF meningkat seiring berkurangnya HP, hingga +25% Bonus maksimum tercapai saat HP di bawah 40%."
            },
            {
              name:"Fortress of Purity",
              type:"ultimate",
              description:"Max HP +20%, DEF +15%. Menghapus semua debuff aktif dan kebal terhadap debuff. Durasi: 16 detik."
            }
          ]
        },
        {
          class: "Defender",
          subclass: "Guardian",
          skills: [
            {
              name:"Recovery Protocol",
              type:"passive",
              description:"Jika tidak menerima damage selama 9 detik, memulihkan 2% Max HP per detik."
            },
            {
              name:"Penumbral Image",
              type:"passive",
              description:"Durasi Stagger -1.4 detik. Setiap 20 detik sejak pertempuran dimulai: Max HP +4%, DEF +2.5% (maks. 3 stack)."
            },
            {
              name:"Myriad Grains",
              type:"ultimate",
              description:"ATK +20%. Berhenti menyerang musuh; serangan akan memulihkan HP sebesar 90% ATK. Mendapatkan 15% Sanctuary (mengurangi damage yang diterima). Durasi: 20 detik."
            }
          ]
        },
        {
          class: "Specialist",
          subclass: "Alchemist",
          skills: [
            {
              name:"Catalytic Disruption",
              type:"passive",
              description:"Durasi Stagger musuh +1.5 detik."
            },
            {
              name:"Corrosive Infusion",
              type:"passive",
              description:"Serangan memberikan efek Poison. Poison memberikan damage sebesar 25% ATK per detik selama 3 detik (Durasi direset saat dipicu ulang)."
            },
            {
              name:"Murky Night",
              type:"ultimate",
              description:"Menghapus efek Stagger pada diri sendiri. Memberikan efek Silence pada musuh (menonaktifkan skill; memprioritaskan Ultimate yang belum aktif) dan efek poison meningkat menjadi 150%. Durasi 20 detik."
            }
          ]
        }
      ];
    }

    preload() {
        this.load.image("bgMenu", "assets/ui/menu/bg-menu.jpg");
        this.load.image("btnPlay", "assets/ui/menu/play.png");
        this.load.image("btnLeaderboard", "assets/ui/menu/prize.png");
        this.load.image("btnClose", "assets/ui/btn/close.png");
        this.load.image("btnGameStart", "assets/ui/btn/leader.png");
        this.load.image("popupBg", "assets/ui/level_select/bg.png");
        this.load.image("btnNext", "assets/ui/btn/next.png");
        this.load.image("btnPrev", "assets/ui/btn/prew.png");
        this.load.image("passiveSkillBtn", "assets/ui/bubble/btn_1.png");
        this.load.image("ultSkillBtn", "assets/ui/btn/upgrade.png");
        this.load.image('rating_bg', 'assets/ui/rating/bg.png');
        this.load.image('rating_header', 'assets/ui/rating/header.png');
        this.load.image('rating_table', 'assets/ui/rating/table.png');
        this.load.image('rating_scroll', 'assets/ui/rating/scroll.png');
        this.load.image('rating_close', 'assets/ui/rating/close_2.png');
        this.load.image('rating_dot', 'assets/ui/rating/dot.png');
        this.load.audio("bgmMenu", "assets/audio/lobbyTheme.mp3");

        this.characters.forEach(char => {
          const className = char.class.toLowerCase().replace(/\s+/g, "");
          const subclass = char.subclass.toLowerCase().replace(/\s+/g, "");

          loadCharSprites(this, className, subclass, {
            actions: ["idle"],
            directions: ["front"]
          });
        });
    }

    create() {
        this.menuMusic = this.sound.add("bgmMenu", {
            loop: true,
            volume: 0
        });
      
        this.menuMusic.play();

        this.tweens.add({
            targets: this.menuMusic,
            volume: 0.5,
            duration: 1000,
            ease: "Linear"
        });

        this.currentCharacterIndex = 0;

        this.characters.forEach(char => {
          const className = char.class.toLowerCase().replace(/\s+/g, "");
          const subclass = char.subclass.toLowerCase().replace(/\s+/g, "");

          createCharAnimations(this, className, subclass, {
            actions: ["idle"],
            directions: ["front"]
          });
        });

        this.skillUI = [];

        for (let i = 0; i < 3; i++) {
          let baseY = this.scale.height / 2 - 60 + (i * 100);
        
          let icon = this.add.image(this.scale.width / 2 - 400, baseY, "passiveSkillBtn")
            .setScale(0.4)
            .setDepth(102)
            .setVisible(false);
        
          let title = this.add.text(this.scale.width / 2 - 360, baseY - 10, "", {
            fontFamily: 'Poppins, sans-serif',
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
          }).setDepth(102).setVisible(false);
        
          let desc = this.add.text(this.scale.width / 2 - 360, baseY + 20, "", {
            fontFamily: 'Poppins, sans-serif',
            fontSize: "18px",
            color: "#ebebeb",
            wordWrap: { width: 730 }
          }).setDepth(102).setVisible(false);
        
          this.skillUI.push({ icon, title, desc });
        }

        const { width, height } = this.scale;

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.3)
        .setOrigin(0)
        .setDepth(1);

        this.add.image(width / 2, height / 2, "bgMenu")
        .setDisplaySize(width, height);

        this.gameTitle = this.add.text(this.scale.width / 2, 120, 'MATH GAMES', {
          fontFamily: 'Poppins, sans-serif',
          fontSize: '72px',
          fontStyle: 'bold',
          fill: '#ffffff'
        })
        .setOrigin(0.5)
        .setDepth(10)
        .setScrollFactor(0);

        const centerY = height / 2 + 100;
        const spacing = 120;

        const playButton = this.add.image(width / 2 - spacing, centerY, "btnPlay")
          .setInteractive()
          .setDepth(10)
          .setScale(0.2);

        playButton.on("pointerdown", () => {
          this.searchOverlay = this.add.rectangle(
            0,
            0,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.6
          )
          .setOrigin(0)
          .setDepth(1000);

          this.searchBox = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            "popupBg"
          )
          .setDepth(1001)
          .setScale(0.3);

          this.searchText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            "Mencari lawan...",
            {
              fontFamily: 'Poppins, sans-serif',
              fontSize: "42px",
              color: "#ffffff"
            }
          )
          .setOrigin(0.5)
          .setDepth(1002)
          .setScrollFactor(0);
        
          window.socket.emit("joinQueue");
        });

        window.socket.on("matchFound", (data) => {
          console.log("Lawan player ditemukan", data);
              
          this.enemyType = "player";
              
          this.startAfterMatch();
        });
      
        window.socket.on("matchBot", (data) => {
          console.log("Lawan bot ditemukan", data);
        
          this.enemyType = "bot";
        
          this.startAfterMatch();
        });

        const leaderboardButton = this.add.image(width / 2 + spacing, centerY, "btnLeaderboard")
          .setInteractive()
          .setDepth(10)
          .setScale(0.325);

        leaderboardButton.on("pointerdown", () => {
          this.showLeaderboard();
        });

        this.popupOverlay = this.add.rectangle(
          0,
          0,
          this.scale.width,
          this.scale.height,
          0x000000,
          0.6
        )
        .setOrigin(0)
        .setDepth(100)
        .setVisible(false);

        this.popupBox = this.add.image(
          this.scale.width / 2,
          this.scale.height / 2,
          "popupBg"
        )
        .setDepth(101)
        .setVisible(false)
        .setScale(0.675, 0.4);

        // this.popupCloseBtn = this.add.image(
        //   this.scale.width / 2 + 500,
        //   this.scale.height / 2 - 220,
        //   "btnClose"
        // )
        // .setInteractive()
        // .setDepth(102)
        // .setScale(0.3)
        // .setVisible(false);

        // this.popupCloseBtn.on("pointerdown", () => {
        //   this.closePopup();
        // });

        this.gameStartBtn = this.add.image(
          this.scale.width / 2 + 500,
          this.scale.height / 2 + 220,
          "btnGameStart"
        )
        .setInteractive()
        .setDepth(102)
        .setScale(0.3)
        .setVisible(false);
              
        this.gameStartBtn.on("pointerdown", () => {
            const selected = this.characters[this.currentCharacterIndex];
                
            this.tweens.add({
                targets: this.menuMusic,
                volume: 0,
                duration: 1000,
                ease: "Linear",
                onComplete: () => {
                    this.menuMusic.stop();
                    this.closePopup();
                    let enemySelected;
                    do {
                        const randomIndex = Phaser.Math.Between(0, this.characters.length - 1);
                        enemySelected = this.characters[randomIndex];
                    } while (enemySelected === selected);
                
                    this.scene.start("gameScene", {
                        player: {
                            class: selected.class,
                            subclass: selected.subclass,
                            skills: selected.skills
                        },
                        enemy: {
                            class: enemySelected.class,
                            subclass: enemySelected.subclass,
                            skills: enemySelected.skills
                        }
                    });
                }
            });
        });

        this.classText = this.add.text(
          this.scale.width / 2 + 260,
          this.scale.height / 2 - 230,
          "",
          {
            fontFamily: 'Poppins, sans-serif',
            fontSize: "22px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center"
          }
        )
        .setOrigin(0.5)
        .setDepth(102)
        .setVisible(false);

        this.subClassText = this.add.text(
          this.scale.width / 2 + 260,
          this.scale.height / 2 - 160,
          "",
          {
            fontFamily: 'Poppins, sans-serif',
            fontSize: "22px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center"
          }
        )
        .setOrigin(0.5)
        .setDepth(102)
        .setVisible(false);

        const btnCenterX = this.scale.width / 2;
        const btnCenterY = this.scale.height / 2;
        const btnOffsetX = 500;

        this.prevButton = this.add.image(
          btnCenterX - btnOffsetX,
          btnCenterY,
          "btnPrev"
        )
        .setDepth(102)
        .setScale(0.3)
        .setInteractive()
        .setVisible(false);

        this.nextButton = this.add.image(
          btnCenterX + btnOffsetX,
          btnCenterY,
          "btnNext"
        )
        .setDepth(102)
        .setScale(0.3)
        .setInteractive()
        .setVisible(false);

        this.nextButton.on("pointerdown", () => {
          this.currentCharacterIndex++;
        
          if (this.currentCharacterIndex >= this.characters.length) {
            this.currentCharacterIndex = 0;
          }
      
          this.updateCharacterDisplay();
        });

        this.prevButton.on("pointerdown", () => {
          this.currentCharacterIndex--;
        
          if (this.currentCharacterIndex < 0) {
            this.currentCharacterIndex = this.characters.length - 1;
          }
      
          this.updateCharacterDisplay();
        });
    }

    startAfterMatch() {
      if (this.searchText) {
        this.searchText.destroy();
      }
      if (this.searchBox) {
        this.searchBox.destroy();
      }
      if (this.searchOverlay) {
        this.searchOverlay.destroy();
      }

      this.handleStart();
    }

    handleStart() {
        this.popupOverlay.setVisible(true);
        this.popupBox.setVisible(true);
        // this.popupCloseBtn.setVisible(true);
        this.gameStartBtn.setVisible(true);
        this.classText.setVisible(true);
        this.subClassText.setVisible(true);
        this.skillUI.forEach(skill => {
          skill.icon.setVisible(true);
          skill.title.setVisible(true);
          skill.desc.setVisible(true);
        });

        this.nextButton.setVisible(true);
        this.prevButton.setVisible(true);

        this.updateCharacterDisplay();
    }

    closePopup() {
        this.popupOverlay.setVisible(false);
        this.popupBox.setVisible(false);
        // this.popupCloseBtn.setVisible(false);
        this.gameStartBtn.setVisible(false);
        this.classText.setVisible(false);
        this.subClassText.setVisible(false);
        this.skillUI.forEach(skill => {
          skill.icon.setVisible(false);
          skill.title.setVisible(false);
          skill.desc.setVisible(false);
        });

        this.nextButton.setVisible(false);
        this.prevButton.setVisible(false);

        if (this.currentCharSprite) {
            this.currentCharSprite.destroy();
            this.currentCharSprite = null;
        }
    }

    showLeaderboard() {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      const highScore = parseInt(localStorage.getItem('highScore')) || 0;

      this.leaderboardContainer = this.add.container(0, 0).setDepth(1000);

      const leaderboardOverlay = this.add.rectangle(
          0, 0,
          this.scale.width,
          this.scale.height,
          0x000000,
          0.6
      )
      .setOrigin(0)
      .setDepth(1000)
      .setScrollFactor(0);
    
      const bg = this.add.image(centerX, centerY, 'rating_bg')
          .setScale(0.4)
          .setDepth(1001)
          .setScrollFactor(0);
    
      const header = this.add.image(centerX, centerY - 200, 'rating_header')
          .setScale(0.3)
          .setDepth(1002)
          .setScrollFactor(0);
    
      const table = this.add.image(centerX, centerY + 20, 'rating_table')
          .setScale(0.4)
          .setDepth(1001)
          .setScrollFactor(0);
      
      const scoreText = this.add.text(centerX, centerY + 20, `High Score: ${highScore}`, {
          fontSize: '30px',
          color: '#141414',
          fontStyle: 'bold'
      }).setOrigin(0.5);
    
      const closeBtn = this.add.image(centerX + 230, centerY - 200, 'rating_close')
          .setScale(0.4)
          .setDepth(1003)
          .setScrollFactor(0)
          .setInteractive();
    
      closeBtn.on('pointerdown', () => {
          this.hideLeaderboard();
      });

      this.leaderboardContainer.add([
          leaderboardOverlay, bg, header, table, closeBtn, scoreText
      ]);
    }

    hideLeaderboard() {
      if (this.leaderboardContainer) {
        this.leaderboardContainer.destroy(true);
        this.leaderboardContainer = null;
      }
    }

    updateCharacterDisplay() {
        const char = this.characters[this.currentCharacterIndex];
    
        this.classText.setText(`Class:\n${char.class}`);
        this.subClassText.setText(`SubClass:\n${char.subclass}`);
    
        if (this.currentCharSprite) {
            this.currentCharSprite.destroy();
        }

        const charSystem = new CharacterSystem(this, char.class);
        charSystem.selectedSubclass = char.subclass;
      
        const key = getCharKey(charSystem, "idle", "front");
        const scaleMap = {
            defender: 0.38,
            guard: 0.49,
            specialist: 0.49
        };

        const keyScale = char.class.toLowerCase().replace(/\s+/g, "");

        this.currentCharSprite = this.add.sprite(
          this.scale.width / 2 - 15,
          this.scale.height / 2 - 200,
          key
        )
        .setDepth(102)
        .setScale(scaleMap[keyScale] || 0.25);

        this.currentCharSprite.anims.play(key, true);
        
        let skills = char.skills;

        skills.forEach((skill, index) => {
          let ui = this.skillUI[index];
        
          ui.title.setText(`${skill.name} (${skill.type})`);
          ui.desc.setText(skill.description);
        
          let isUltimate = skill.type === "ultimate";
          let iconKey = isUltimate ? "ultSkillBtn" : "passiveSkillBtn";

          ui.icon.setTexture(iconKey);
          ui.icon.setScale(isUltimate ? 0.25 : 0.4);
        });
    }
}