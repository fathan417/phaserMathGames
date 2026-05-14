export default class FinalTestSystem {
    constructor(scene) {
        this.scene = scene;

        this.isBattleOver = false;
    }

    init(playerCharacter, enemyCharacter) {
        this.playerCharacter = playerCharacter;
        this.enemyCharacter = enemyCharacter;
        const scene = this.scene;
        const currentSkills = playerCharacter.getSkills();

        this.playerStatText = scene.add.text(180, 90, '', {
            fontSize: '16px',
            fill: '#fff'
        }).setDepth(4001).setScrollFactor(0);

        this.enemyStatText = scene.add.text(180, 120, '', {
            fontSize: '16px',
            fill: '#fff'
        }).setDepth(4001).setScrollFactor(0);

        this.comboText = scene.add.text(205, 180, '', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '22px',
            fontStyle: "bold",
            fill: '#fff'
        })
        .setDepth(4005)
        .setScrollFactor(0);

        this.ultimateButton = scene.add.image(250, 250, "ult")
        .setScale(0.3)
        .setDepth(4001)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

        currentSkills.forEach(skill => {
            let isUltimate = skill.type === "ultimate";
            this.ultimateButton.setVisible(isUltimate ? true : false)
        })

        this.ultimateButton.setAlpha(0.5);
        this.ultimateButton.disableInteractive();

        this.ultimateButton.on("pointerdown", () => {
            this.battleSystem.activateUltimate();
        });
        
        this.playerName = scene.add.text(215, 115, '', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '20px',
            fontStyle: "bold",
            fill: '#fff'
        })
        .setDepth(4005)
        .setScrollFactor(0);

        this.enemyName = scene.add.text(965, 115, '', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '20px',
            fontStyle: "bold",
            fill: '#fff'
        })
        .setDepth(4005)
        .setScrollFactor(0);

        this.playerHpBarContainerUp = scene.add.image(350, 110, "hpBarContainerUp")
          .setScale(0.3, 0.25)
          .setDepth(4001)
          .setScrollFactor(0);

        this.playerHpBarBg = scene.add.image(350, 100, "hpBarBg")
          .setScale(0.2, 0.2)
          .setDepth(4001)
          .setScrollFactor(0);

        this.playerHpBarFill = scene.add.image(210, 100, "hpBarFill")
          .setScale(0.3)
          .setDepth(4002)
          .setScrollFactor(0)
          .setOrigin(0, 0.5);

        this.enemyHpBarContainerUp = scene.add.image(930, 110, "hpBarContainerUp")
          .setScale(0.3, 0.25)
          .setDepth(4001)
          .setScrollFactor(0)
          .setFlipX(true);

        this.enemyHpBarBg = scene.add.image(930, 100, "hpBarBg")
          .setScale(0.2, 0.2)
          .setDepth(4001)
          .setScrollFactor(0)
          .setFlipX(true);;

        this.enemyHpBarFill = scene.add.image(1070, 100, "hpBarFill")
          .setScale(0.3)
          .setDepth(4002)
          .setScrollFactor(0)
          .setOrigin(1, 0.5)
          .setFlipX(true);
        
        this.timerBg = scene.add.image(715, 100, "timerBg")
          .setScale(0.1125)
          .setDepth(4003)
          .setScrollFactor(0)
          .setOrigin(1, 0.5);
    }

    setQuestionSystem(questionSystem) {
        this.questionSystem = questionSystem;
    }

    setBattleSystem(battleSystem) {
        this.battleSystem = battleSystem;
    
        this.battleSystem.setUI({
            playerStatText: this.playerStatText,
            enemyStatText: this.enemyStatText,
            comboText: this.comboText,
            ultimateButton: this.ultimateButton,
            playerName: this.playerName,
            enemyName: this.enemyName,
            playerHpBarFill: this.playerHpBarFill,
            enemyHpBarFill: this.enemyHpBarFill
        });
    
        this.battleSystem.setQuestionSystem(this.questionSystem);
        this.battleSystem.startTimer();
    }

    endBattle(isWin) {
        const scene = this.scene;
        this.isBattleOver = true;

        scene.scene.start('mainMenuScene');
    }

    update() {
        if (this.isBattleOver) return;

        if (this.scene.player) {
            this.scene.player.setVelocity(0, 0);
        }
    }
}