export function showFeedback(system, message) {
    const scene = system.scene;
    scene.feedbackCloud.setVisible(true).setAlpha(1);

    scene.handleFeedbackNext = () => {
        scene.feedbackCloud.setVisible(false).setAlpha(1);

        if (scene.feedbackText) {
            scene.feedbackText.destroy();
            scene.feedbackText = null;
        }
    };

    if (scene.feedbackTimer) {
        scene.feedbackTimer.remove(false);
    }

    if (scene.feedbackText) {
        scene.feedbackText.destroy();
    }

    scene.feedbackText = scene.add.text(
        scene.feedbackCloud.x,
        scene.feedbackCloud.y - 20,
        message,
        {
            fontSize: "20px",
            color: "#171717",
            align: "center",
            wordWrap: { width: 300 }
        }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(3001);

    scene.tweens.add({
        targets: scene.feedbackText,
        alpha: 1,
        duration: 250
    });

    scene._hideFeedbackHandler = () => {
        scene.tweens.add({
            targets: [scene.feedbackText, scene.feedbackCloud],
            alpha: 0,
            duration: 300,
            onComplete: () => {
                scene.feedbackCloud.setVisible(false).setAlpha(1);

                if (scene.feedbackText) {
                    scene.feedbackText.destroy();
                    scene.feedbackText = null;
                }
            }
        });
    };

    scene.feedbackTimer = scene.time.delayedCall(5000, scene._hideFeedbackHandler);
    scene.btnNext.on("pointerdown", scene.handleFeedbackNext);
    scene.uiElements ??= [];
    scene.uiElements.push(scene.feedbackText);
}