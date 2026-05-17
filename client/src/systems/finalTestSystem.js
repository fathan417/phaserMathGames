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

        this.comboText = scene.add.text(315, 230, '', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '22px',
            fontStyle: "bold",
            fill: '#fff'
        })
        .setDepth(4005)
        .setScrollFactor(0);

        this.ultimateButton = scene.add.image(360, 300, "ult")
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
        
        this.playerName = scene.add.text(315, 170, '', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontStyle: "bold",
            fill: '#fff'
        })
        .setDepth(4005)
        .setScrollFactor(0);

        this.enemyName = scene.add.text(1160, 170, '', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontStyle: "bold",
            fill: '#fff'
        })
        .setOrigin(1, 0)
        .setDepth(4005)
        .setScrollFactor(0);

        this.playerHpBarContainerUp = scene.add.image(450, 170, "hpBarContainerUp")
          .setScale(0.27, 0.22)
          .setDepth(4001)
          .setScrollFactor(0);

        this.playerHpBarBg = scene.add.image(450, 150, "hpBarBg")
          .setScale(0.17)
          .setDepth(4001)
          .setScrollFactor(0);

        this.playerHpBarFill = scene.add.image(310, 150, "hpBarFill")
          .setScale(0.27)
          .setDepth(4002)
          .setScrollFactor(0)
          .setOrigin(0, 0.5);

        this.enemyHpBarContainerUp = scene.add.image(1020, 170, "hpBarContainerUp")
          .setScale(0.27, 0.22)
          .setDepth(4001)
          .setScrollFactor(0)
          .setFlipX(true);

        this.enemyHpBarBg = scene.add.image(1030, 150, "hpBarBg")
          .setScale(0.17)
          .setDepth(4001)
          .setScrollFactor(0)
          .setFlipX(true);;

        this.enemyHpBarFill = scene.add.image(1170, 150, "hpBarFill")
          .setScale(0.27)
          .setDepth(4002)
          .setScrollFactor(0)
          .setOrigin(1, 0.5)
          .setFlipX(true);
        
        this.timerBg = scene.add.image(817.5, 160, "timerBg")
          .setScale(0.125, 0.1125)
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