import finalTestQuestions from '../../data/finalTest.js';

export default class QuestionSystem {
    constructor(scene, config = {}) {
        this.scene = scene;

        this.onAnswerCallback = config.onAnswer || (() => {});
        this.onResetTimer = config.onResetTimer || (() => {});
        this.isBattleOver = config.isBattleOver || (() => false);

        this.currentQuestionIndex = 0;
        this.questions = this.getQuestions();

        this.questionText = null;
        this.answerButtons = [];

        this.isLocked = false;
        this.isStaggered = false;
    }

    init() {
        const scene = this.scene;

        const containerX = scene.cameras.main.width / 2;
        const containerY = scene.cameras.main.height / 2 + 140;

        this.questionContainer = scene.add.container(containerX, containerY);
        this.questionContainer.setDepth(4001);
        this.questionContainer.setScrollFactor(0);

        const bg = scene.add.image(850, 200, "timerBg")
        .setScale(0.575, 0.325)
        .disableInteractive()
        .setOrigin(0.5)
        .setPosition(0, 30);

        this.questionText = scene.add.text(0, 0, '', {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fill: '#ffffff',
            fontStyle: "bold",
            wordWrap: { width: 600 }
        }).setOrigin(0.5, 0);
        this.questionText.setPosition(0, -90);

        this.questionContainer.add([bg, this.questionText]);
        this.questionContainer.iterate(child => {
            child.setScrollFactor(0);
        });

        this.loadQuestion();
    }

    getQuestions() {
        return finalTestQuestions;
    }

    loadQuestion() {
        const scene = this.scene;
        const q = this.questions[this.currentQuestionIndex];

        this.isLocked = false;
        this.onResetTimer();

        this.questionText.setText(q.question);

        this.answerButtons.forEach(btn => btn.destroy());
        this.answerButtons = [];

        const startY = -10;

        const col = 2;
        const spacingX = 15;
        const spacingY = 15;

        q.options.forEach((opt, index) => {

            const bg = scene.add.image(0, 0, "questionBtn")
                .setOrigin(0.5)
                .setScale(0.575, 0.175);

            const txt = scene.add.text(0, 0, opt, {
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px',
                fontStyle: "bold",
                color: '#151515',
                align: 'center',
                wordWrap: { width: 150 }
            }).setOrigin(0.5);

            const btn = scene.add.container(0, 0, [bg, txt])
                .setDepth(4003)
                .setSize(bg.displayWidth, bg.displayHeight)
                .setInteractive({ useHandCursor: true })
                btn.on('pointerdown', () => {
                    this.handleAnswer(index);
                });

            btn.width = bg.displayWidth;
            btn.height = bg.displayHeight;

            this.questionContainer.add(btn);
            this.questionContainer.iterate(child => {
                child.setScrollFactor(0);
            });

            this.answerButtons.push(btn);
        });

        let maxWidth = 0;
        let maxHeight = 0;

        this.answerButtons.forEach(btn => {
            if (btn.width > maxWidth) maxWidth = btn.width;
            if (btn.height > maxHeight) maxHeight = btn.height;
        });

        this.answerButtons.forEach(btn => {
            btn.setSize(maxWidth, maxHeight);
        });

        const totalWidth = (maxWidth * col) + spacingX;

        const startX = -totalWidth / 2 + maxWidth / 2;

        this.answerButtons.forEach((btn, index) => {
            const row = Math.floor(index / col);
            const column = index % col;

            const x = startX + column * (maxWidth + spacingX);
            const y = startY + row * (maxHeight + spacingY);

            btn.setPosition(x, y);
        });
    }

    handleAnswer(index) {
        if (this.isBattleOver()) return;
        if (this.isLocked) return;
        if (this.isStaggered) return;
        if (this.scene.battleSystem.isAnimating) return;

        this.isLocked = true;

        const q = this.questions[this.currentQuestionIndex];
        const isCorrect = index === q.correct;

        this.onAnswerCallback(isCorrect);
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.isBattleOver()) return;

        this.currentQuestionIndex++;

        if (this.currentQuestionIndex >= this.questions.length) {
            this.currentQuestionIndex = 0;
        }

        this.loadQuestion();
    }

    applyStagger(duration = 6000, targetChar, sourceChar) {
        if (this.isStaggered) return;

        this.isStaggered = true;

        let finalDuration = duration;

        if (targetChar && targetChar._statusModifiers && targetChar._staggerModifiers) {
            const increase = targetChar._staggerModifiers["stagger"];
            const reduction = targetChar._statusModifiers["stagger"];

            if (increase < reduction) return;

            const finalReduction = increase - reduction;
            finalDuration = Math.max(0, duration - (finalReduction * 1000));

        } else {
            if (targetChar && targetChar._statusModifiers) {
                const reduction = targetChar._statusModifiers["stagger"];
            
                if (reduction) {
                    finalDuration = Math.max(0, duration - (reduction * 1000));
                }

            } else if (targetChar && targetChar._staggerModifiers) {
                const increase = targetChar._staggerModifiers["stagger"];
            
                if (increase) {
                    finalDuration = Math.max(0, duration + (increase * 1000));
                }
            }
        }

        this.scene.time.delayedCall(finalDuration, () => {
            this.isStaggered = false;
        });

        return finalDuration;
    }
}