import { showFeedback } from "./feedback.js";

export function createClickOption(system, slide) {
    const scene = system.scene;

    const centerX = scene.cameras.main.width / 2;
    const baseY = scene.cameras.main.height / 2 + 40;

    const options = slide.interaction.options;

    const cols = 2;
    const spacingX = 20;
    const spacingY = 50;

    const paddingX = 15;
    const paddingY = 10;

    const minWidth = 120;
    const maxWidth = 260;

    scene.uiElements ??= [];

    const textObjects = options.map(option => {
        return scene.add.text(0, 0, option, {
            fontSize: "14px",
            color: "#ffffff",
            wordWrap: { width: maxWidth }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2002);
    });

    let maxTextWidth = 0;

    textObjects.forEach(text => {
        if (text.width > maxTextWidth) {
            maxTextWidth = text.width;
        }
    });

    let finalButtonWidth = maxTextWidth + paddingX * 2;

    finalButtonWidth = Math.max(finalButtonWidth, minWidth);
    finalButtonWidth = Math.min(finalButtonWidth, maxWidth);

    textObjects.forEach((text, index) => {

        const col = index % cols;
        const row = Math.floor(index / cols);

        const offsetX = (col - 0.5) * (finalButtonWidth + spacingX);
        const offsetY = row * spacingY;

        const x = centerX + offsetX;
        const y = baseY + offsetY;

        const btn = scene.add.rectangle(
            x,
            y,
            finalButtonWidth,
            text.height + paddingY * 2,
            0x333333
        )
        .setScrollFactor(0)
        .setDepth(2001)
        .setInteractive();

        text.setPosition(x, y);

        attachOptionLogic(system, btn, options[index], slide);

        scene.uiElements.push(btn, text);
    });
}

export function attachOptionLogic(system, btn, option, slide) {
    const scene = system.scene;

    btn.isLocked = false;

    btn.on("pointerdown", () => {
        if (scene.hasInteracted) return;

        const isCorrect = option === slide.interaction.correct;

        if (isCorrect) {
            btn.setFillStyle(0x2ecc71);

            showFeedback(system, slide.interaction.feedback.correct);

            scene.hasInteracted = true;
            btn.isLocked = true;

        } else {
            btn.setFillStyle(0xe74c3c);

            showFeedback(system, slide.interaction.feedback.wrong);
        }
    });

    btn.on("pointerover", () => {
        if (btn.isLocked) return;
        btn.setFillStyle(0x555555);
    });

    btn.on("pointerout", () => {
        if (btn.isLocked) return;
        btn.setFillStyle(0x333333);
    });
}