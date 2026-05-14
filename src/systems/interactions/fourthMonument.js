import { showFeedback } from "../../ui/feedback.js";

export const fourthMonument = {
  conditionalBallChange(system, slide) {
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

    const ballData = slide.interaction.setup.balls;

    const tenisData = ballData.find(b => b.type === "tenis");
    const basketData = ballData.find(b => b.type === "basket");

    scene.tenisCount = tenisData.count;
    scene.basketCount = basketData.count;

    scene.totalCount = scene.tenisCount + scene.basketCount;
    scene.pickCount = 0;
    scene.hasInteracted = false;

    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2 + 65;

    const spacing = 30;

    const boxWidth = 140;
    const boxHeight = 90;

    const box = scene.trackObject(
      scene.add.rectangle(centerX, centerY, boxWidth, boxHeight, 0x222222)
        .setStrokeStyle(2, 0xffffff)
        .setScrollFactor(0)
        .setDepth(2000)
    );

    const infoText = scene.trackObject(
      scene.add.text(centerX - 180, centerY - 20, "", {
        fontSize: "14px",
        color: "#ffffff",
        align: "center"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2002)
    );

    const updateDisplay = () => {
      const total = scene.tenisCount + scene.basketCount;

      if (total === 0) {
        infoText.setText("Semua bola sudah diambil");
        return;
      }

      const pTenis = scene.tenisCount / total;
      const pBasket = scene.basketCount / total;

      let text = "";

      if (slide.interaction.display.showRemaining) {
        text += `Tenis: ${scene.tenisCount} | Basket: ${scene.basketCount}\n`;
      }

      if (slide.interaction.display.showProbability) {
        text += `P(Tenis) = ${scene.tenisCount}/${total} (${pTenis.toFixed(2)})\n`;
        text += `P(Basket) = ${scene.basketCount}/${total} (${pBasket.toFixed(2)})`;
      }

      infoText.setText(text);
    };

    const createBall = (type, x, y) => {
        const texture = type === "tenis" ? "tennisBall" : "basketBall";

        const ball = scene.trackObject(
          scene.add.image(x, y, texture)
            .setScale(0.1)
            .setScrollFactor(0)
            .setDepth(2001)
            .setInteractive({ draggable: true })
        );

        ball.type = type;
        ball.startX = x;
        ball.startY = y;

        scene.input.setDraggable(ball);

        return ball;
    };
    
    const startX = centerX - 80;
    const row1Y = centerY - 20;
    const row2Y = centerY + 20;

    let index = 0;

    for (let i = 0; i < scene.tenisCount; i++) {
        createBall("tenis", startX + index * spacing + 47, row1Y);
        index++;
    }
    
    index = 0;
    
    for (let i = 0; i < scene.basketCount; i++) {
        createBall("basket", startX + index * spacing + 60, row2Y);
        index++;
    }
    
    updateDisplay();

    scene._ballDragHandler = (pointer, gameObject, dragX, dragY) => {
      if (!gameObject.type) return;

      gameObject.x = dragX;
      gameObject.y = dragY;
    };

    scene._ballDragEndHandler = (pointer, gameObject) => {
      if (!gameObject.type) return;

        const type = gameObject.type;
        const bounds = box.getBounds();

        const isInside =
        Phaser.Geom.Rectangle.Contains(bounds, gameObject.x, gameObject.y);

        if (isInside) {
          gameObject.x = gameObject.startX;
          gameObject.y = gameObject.startY;
          return;
        }

      if (type === "tenis" && scene.tenisCount > 0) {
        scene.tenisCount--;
        scene.pickCount++;
        scene.totalCount = scene.tenisCount + scene.basketCount;

        updateDisplay();

        if (slide.interaction.feedback?.afterPick) {
            showFeedback(system, slide.interaction.feedback.afterPick);
        }
      }

      if (type === "basket" && scene.basketCount > 0) {
        scene.basketCount--;
        scene.pickCount++;
        scene.totalCount = scene.tenisCount + scene.basketCount;
            
        updateDisplay();

        if (slide.interaction.feedback?.afterPick) {
            showFeedback(system, slide.interaction.feedback.afterPick);
        }
      }

      if (scene.pickCount >= 2 && !scene.hasInteracted) {
        scene.hasInteracted = true;
      }

      gameObject.destroy();

      scene._interactiveObjects = scene._interactiveObjects.filter(
        obj => obj !== gameObject
      );
    };

    scene.trackEvent("drag", scene._ballDragHandler);
    scene.trackEvent("dragend", scene._ballDragEndHandler);
  },

    conditionalProbabilityFocus(system, slide) {
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

      const initial = slide.interaction.setup.initial;
      const condition = slide.interaction.setup.condition;

      const tenisData = initial.find(b => b.type === "tenis");
      const basketData = initial.find(b => b.type === "basket");

      scene.tenisCount = tenisData.count;
      scene.basketCount = basketData.count;

      if (condition.given === "tenis") {
        scene.tenisCount -= 1;
      }

      const centerX = scene.cameras.main.width / 2;
      const centerY = scene.cameras.main.height / 2 + 65;

      const spacing = 30;

      const box = scene.trackObject(
        scene.add.rectangle(centerX + 60, centerY, 140, 90, 0x222222)
          .setStrokeStyle(2, 0xffffff)
          .setScrollFactor(0)
          .setDepth(2000)
      );

      const createBall = (type, x, y) => {
        const texture = type === "tenis" ? "tennisBall" : "basketBall";

        return scene.trackObject(
          scene.add.image(x, y, texture)
            .setScale(0.1)
            .setScrollFactor(0)
            .setDepth(2001)
        );
      };

      const spawnRow = (type, count, y) => {
        const totalWidth = (count - 1) * spacing;
        const startX = centerX - totalWidth / 2 + 60;

        for (let i = 0; i < count; i++) {
          createBall(type, startX + i * spacing, y);
        }
      };

      spawnRow("tenis", scene.tenisCount, centerY - 20);
      spawnRow("basket", scene.basketCount, centerY + 20);

      const infoText = scene.trackObject(
        scene.add.text(centerX - 180, centerY - 30, "", {
          fontSize: "16px",
          color: "#ffffff",
          align: "center"
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2002)
      );

      infoText.setText(
        `Tenis: ${scene.tenisCount} | Basket: ${scene.basketCount}\n`
      );

      let optionButtons = [];

      const createOption = (text, x, y) => {
        const btn = scene.trackObject(
          scene.add.text(x, y, text, {
            fontSize: "18px",
            backgroundColor: "#333",
            padding: { x: 10, y: 5 }
          })
          .setOrigin(0.5)
          .setInteractive()
          .setScrollFactor(0)
          .setDepth(2002)
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

        const optionY = centerY + 20;
        const optionX = centerX - 180;

      slide.interaction.question.options.forEach((opt, i) => {
        createOption(opt, optionX + (i - 1) * 60, optionY);
      });
    },

    conditionalProbabilitySteps(system, slide) {
      const scene = system.scene;

      scene._interactiveObjects = [];
      scene._interactiveEvents = [];

      scene.trackObject = (obj) => {
        scene._interactiveObjects.push(obj);
        return obj;
      };

      const centerX = scene.cameras.main.width / 2;
      const centerY = scene.cameras.main.height / 2 + 60;

        const balls = slide.interaction.setup.balls;

        const tenisData = balls.find(b => b.type === "tenis");
        const basketData = balls.find(b => b.type === "basket");

        scene.tenisCount = tenisData.count;
        scene.basketCount = basketData.count;

      let currentStep = 0;

      const spacing = 30;

      const box = scene.trackObject(
        scene.add.rectangle(centerX - 190, centerY + 20, 140, 90, 0x222222)
          .setStrokeStyle(2, 0xffffff)
          .setScrollFactor(0)
          .setDepth(2000)
      );

      const createBall = (type, x, y) => {
        const texture = type === "tenis" ? "tennisBall" : "basketBall";

        return scene.trackObject(
          scene.add.image(x, y, texture)
            .setScale(0.1)
            .setScrollFactor(0)
            .setDepth(2001)
        );
      };

      const spawnRow = (type, count, y) => {
        const totalWidth = (count - 1) * spacing;
        const startX = centerX - totalWidth / 2;

        for (let i = 0; i < count; i++) {
          createBall(type, startX - 190 + i * spacing, y);
        }
      };

      spawnRow("tenis", scene.tenisCount, centerY - 0);
      spawnRow("basket", scene.basketCount, centerY + 40);

      const questionText = scene.trackObject(
        scene.add.text(centerX, centerY - 40, "", {
          fontSize: "16px",
          align: "center",
          wordWrap: { width: 400 }
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
            .setDepth(2002)
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
                showFeedback(system, stepData.stepFeedback.wrong);

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

    scene.tenisCount = null;
    scene.basketCount = null;
  },

};