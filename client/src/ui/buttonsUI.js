export function createButton(system, slide) {
    const scene = system.scene;
    const interaction = slide.interaction;

    const centerX = scene.cameras.main.width / 2 - 180;
    const baseY = scene.cameras.main.height / 2 + 70;

    const buttons = interaction.button;

    const spacing = 100;
    const totalWidth = (buttons.length - 1) * spacing;
    let startX = centerX - totalWidth / 2;

    const paddingX = 20;
    const paddingY = 10;

    scene.uiElements ??= [];

    buttons.forEach((btnData, index) => {

        const x = startX + index * spacing;
        const y = baseY;

        const text = scene.add.text(0, 0, btnData.label, {
            fontSize: "14px",
            color: "#ffffff"
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2002);

        const buttonWidth = text.width + paddingX * 2;
        const buttonHeight = text.height + paddingY * 2;

        const button = scene.add.rectangle(
            x,
            y,
            buttonWidth,
            buttonHeight,
            0x333333
        )
        .setScrollFactor(0)
        .setDepth(2001)
        .setInteractive({ useHandCursor: true });

        text.setPosition(x, y);

        button.on("pointerdown", () => {
            system.executeAction(interaction.action, btnData);
            scene.hasInteracted = true;
        });

        button.on("pointerover", () => {
            button.setFillStyle(0x555555);
        });

        button.on("pointerout", () => {
            button.setFillStyle(0x333333);
        });

        scene.uiElements.push(button, text);
    });
}