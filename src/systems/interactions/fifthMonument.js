import { showFeedback } from "../../ui/feedback.js";

export const fifthMonument = {
    independentCoinIntro(system, slide) {
      const scene = system.scene;

      scene._interactiveObjects = [];
      scene._interactiveEvents = [];

      scene.trackObject = (obj) => {
        scene._interactiveObjects.push(obj);
        return obj;
      };

      scene.trackEvent = (eventName, handler) => {
        scene.input.on(eventName, handler);
        scene._interactiveEvents.push({ eventName, handler });
      };

      const centerX = scene.cameras.main.width / 2;
      const centerY = scene.cameras.main.height / 2 + 70;

      scene.coinStartX = centerX;
      scene.coinStartY = centerY;

      let throwCount = 0;

        scene.infoText = scene.trackObject(
          scene.add.text(centerX - 180, centerY - 20, "P(Gambar) = 1/2\nP(Angka) = 1/2", {
            fontSize: "14px",
            color: "#ffffff",
            align: "center"
          })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(2002)
        );

        scene.countText = scene.trackObject(
          scene.add.text(centerX - 180, centerY + 20, "Jumlah lemparan: 0", {
            fontSize: "14px",
            color: "#ffffff"
          })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(2002)
        );

      scene.coin = scene.trackObject(
        scene.add.image(centerX, centerY, "coinAngka")
          .setScale(0.12)
          .setScrollFactor(0)
          .setDepth(2002)
          .setInteractive({ draggable: true })
      );

      scene.input.setDraggable(scene.coin);

        scene._coinDragHandler = (pointer, gameObject, dragX, dragY) => {
          if (gameObject !== scene.coin) return;

          gameObject.x = scene.coinStartX;

          const minY = scene.coinStartY - 120;
          const maxY = scene.coinStartY;

          gameObject.y = Phaser.Math.Clamp(dragY, minY, maxY);
        };

      scene._coinDragEndHandler = (pointer, gameObject) => {
        if (gameObject !== scene.coin) return;

        const dragDistance = scene.coinStartY - gameObject.y;

        if (dragDistance > 50) {
          const result = Math.random() < 0.5 ? "coinAngka" : "coinGambar";

          scene.coin.setTexture(result);

          scene.tweens.add({
            targets: scene.coin,
            y: scene.coinStartY - 10,
            duration: 120,
            yoyo: true,
            ease: "Quad.easeOut",
            onComplete: () => {
              scene.coin.x = scene.coinStartX;
              scene.coin.y = scene.coinStartY;
            }
          });

          throwCount++;
          scene.countText.setText(`Jumlah lemparan: ${throwCount}`);

          if (throwCount >= 2) {
            scene.hasInteracted = true;
          }

        } else {
          gameObject.x = scene.coinStartX;
          gameObject.y = scene.coinStartY;
        }
      };

      scene.trackEvent("drag", scene._coinDragHandler);
      scene.trackEvent("dragend", scene._coinDragEndHandler);
    },

    independentProbabilityDemo(system, slide) {
      const scene = system.scene;

      scene._interactiveObjects = [];
      scene._interactiveEvents = [];

      scene.trackObject = (obj) => {
        scene._interactiveObjects.push(obj);
        return obj;
      };

      scene.trackEvent = (eventName, handler) => {
        scene.input.on(eventName, handler);
        scene._interactiveEvents.push({ eventName, handler });
      };

      const centerX = scene.cameras.main.width / 2;
      const centerY = scene.cameras.main.height / 2 + 10;

      const baseY = centerY + 40;

      scene.trackObject(
        scene.add.text(centerX, baseY, slide.interaction.question.text, {
          fontSize: "14px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 400 }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2002)
      );
      let optionButtons = [];

      const createOption = (text, x, y) => {
        const btn = scene.trackObject(
          scene.add.text(x, y, text, {
            fontSize: "16px",
            backgroundColor: "#333",
            padding: { x: 10, y: 5 }
          })
          .setOrigin(0.5)
          .setInteractive()
          .setScrollFactor(0)
          .setDepth(2003)
        );

        btn.on("pointerdown", () => {
          btn.setStyle({ backgroundColor: "#555" });
          const isCorrect = text === slide.interaction.question.correct;

          if (isCorrect) {
            showFeedback(system, slide.interaction.feedback.correct);
            btn.setStyle({ backgroundColor: "#2ecc71" });
                    
            optionButtons.forEach(b => {
              b.disableInteractive();
            });
          
            scene.hasInteracted = true;
          } else {
            showFeedback(system, slide.interaction.feedback.wrong);
            btn.setStyle({ backgroundColor: "#e74c3c" });
          
            scene.time.delayedCall(800, () => {
              btn.setStyle({ backgroundColor: "#333" });
            });
          }
        });
        optionButtons.push(btn);
        return btn;
      };

      const optionX = centerX;
      const optionY = centerY + 90;

      slide.interaction.question.options.forEach((opt, i) => {
        createOption(opt, optionX + (i - 1) * 60, optionY);
      });
    },

    independentProbabilitySteps(system, slide) {
      const scene = system.scene;

      scene._interactiveObjects = [];
      scene._interactiveEvents = [];

      scene.trackObject = (obj) => {
        scene._interactiveObjects.push(obj);
        return obj;
      };

      const centerX = scene.cameras.main.width / 2;
      const centerY = scene.cameras.main.height / 2 + 60;

      let currentStep = 0;

      const box = scene.trackObject(
        scene.add.rectangle(centerX - 180, centerY + 10, 120, 70, 0x222222)
          .setStrokeStyle(2, 0xffffff)
          .setScrollFactor(0)
          .setDepth(2000)
      );

      const createDice = (value, x, y) => {
        return scene.trackObject(
          scene.add.text(x, y, `🎲 ${value}`, {
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#333",
            padding: { x: 10, y: 5 }
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(2001)
        );
      };

      const target = slide.interaction.setup.target;

      createDice(target[0], centerX - 180, centerY - 10);
      createDice(target[1], centerX - 180, centerY + 30);

      const questionText = scene.trackObject(
        scene.add.text(centerX, centerY - 40, "", {
          fontSize: "16px",
          align: "center",
          wordWrap: { width: 500 },
          color: "#ffffff"
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2002)
      );

      let optionObjects = [];

      const renderStep = () => {
        optionObjects.forEach(obj => obj.destroy());
        optionObjects = [];

        const stepData = slide.interaction.steps[currentStep];
        questionText.setText(stepData.question);

        stepData.options.forEach((opt, i) => {
          const obj = scene.trackObject(
            scene.add.text(centerX + (i - 1) * 70, centerY, opt, {
              fontSize: "16px",
              backgroundColor: "#333",
              padding: { x: 10, y: 5 }
            })
            .setInteractive()
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(2003)
          );

          obj.on("pointerdown", () => {
            const isCorrect = opt === stepData.correct;
            const isLastStep = currentStep === slide.interaction.steps.length - 1;

            if (isCorrect) {
              obj.setStyle({ backgroundColor: "#2ecc71" });
              optionObjects.forEach(o => o.disableInteractive());
               let text;

              if (stepData.stepFeedback && stepData.stepFeedback.correct) {
                text = stepData.stepFeedback.correct;
              } else {
                text = slide.interaction.finalFeedback.correct;
              }
              showFeedback(system, text);

              scene.time.delayedCall(800, () => {
                currentStep++;

                if (currentStep < slide.interaction.steps.length) {
                  renderStep();
                } else {
                  showFinalResult();
                }
              });

            } else {
              obj.setStyle({ backgroundColor: "#e74c3c" });

              if (isLastStep) {
                showFeedback(system, slide.interaction.finalFeedback.wrong);

                optionObjects.forEach(o => o.disableInteractive());

                scene.time.delayedCall(1200, () => {
                  currentStep = 0;
                  renderStep();
                });

              } else {
                let wrongText = "Salah, coba lagi.";
                showFeedback(system, wrongText);

                scene.time.delayedCall(700, () => {
                  obj.setStyle({ backgroundColor: "#333" });
                });
              }
            }
          });

          optionObjects.push(obj);
        });
      };

      const showFinalResult = () => {
        showFeedback(system, slide.interaction.finalFeedback.correct);
        scene.hasInteracted = true;
      };

      renderStep();
    },

    cleanup(system) {
    const scene = system.scene;

    if (scene._interactiveObjects) {
      scene._interactiveObjects.forEach(obj => obj.destroy());
      scene._interactiveObjects = null;
    }

    if (scene._interactiveEvents) {
      scene._interactiveEvents.forEach(e => {
        scene.input.off(e.eventName, e.handler);
      });
      scene._interactiveEvents = null;
    }
  }
};