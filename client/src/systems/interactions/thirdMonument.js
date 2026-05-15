import { showFeedback } from "../../ui/feedback.js";

export const thirdMonument = {
  cardProbabilityLab(system, slide) {
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

    scene.redCount = 5;
    scene.blueCount = 5;

    const centerX = scene.cameras.main.width / 2 + 150;
    const centerY = scene.cameras.main.height / 2 + 60;

    const sliderX = centerX - 320;
    const sliderY = centerY + 25;

    scene.cardStartX = centerX;
    scene.cardStartY = centerY;

    scene.cardBox = scene.trackObject(
      scene.add.rectangle(centerX, centerY, 90, 90, 0x222222)
        .setStrokeStyle(2, 0xffffff)
        .setScrollFactor(0)
        .setDepth(2001)
    );

    scene.card = scene.trackObject(
      scene.add.image(centerX, centerY, "cardRed")
        .setScale(0.1)
        .setScrollFactor(0)
        .setDepth(2002)
        .setInteractive({ draggable: true })
    );

    scene.probText = scene.trackObject(
      scene.add.text(centerX - 140, centerY + 25, "", {
        fontSize: "14px",
        color: "#ffffff",
        align: "center"
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2002)
    );

    scene.sliderBar = scene.trackObject(
      scene.add.rectangle(sliderX, sliderY, 120, 4, 0xffffff)
        .setScrollFactor(0)
        .setDepth(2002)
    );

    scene.sliderHandle = scene.trackObject(
      scene.add.circle(sliderX, sliderY, 8, 0xffcc00)
        .setScrollFactor(0)
        .setDepth(2003)
        .setInteractive({ draggable: true })
    );

    scene.input.setDraggable(scene.card);
    scene.input.setDraggable(scene.sliderHandle);

    scene.updateProbabilityText = () => {
      const red = scene.redCount;
      const blue = scene.blueCount;
      const total = red + blue;

      const redProb = (red / total * 100).toFixed(0);
      const blueProb = (blue / total * 100).toFixed(0);

      scene.probText.setText(
        `Merah: ${red} | Biru: ${blue}\n` +
        `P(Merah): ${red}/${total} (${redProb}%)\n` +
        `P(Biru): ${blue}/${total} (${blueProb}%)`
      );
    };

    scene.updateProbabilityText();

    scene._cardDragHandler = (pointer, gameObject, dragX, dragY) => {
      if (gameObject !== scene.card) return;

      gameObject.x = dragX;
      gameObject.y = dragY;
    };

    scene._cardDragEndHandler = (pointer, gameObject) => {
      if (gameObject !== scene.card) return;

      const total = scene.redCount + scene.blueCount;
      const rand = Math.random() * total;

      let result;

      if (rand < scene.redCount) {
        result = "cardRed";
      } else {
        result = "cardBlue";
      }

      scene.card.setTexture(result);

      gameObject.x = scene.cardStartX;
      gameObject.y = scene.cardStartY;

      scene.updateProbabilityText();
      scene.hasInteracted = true;
    };

    scene._sliderDragHandler = (pointer, gameObject, dragX) => {
      if (gameObject !== scene.sliderHandle) return;

      const minX = sliderX - 60;
      const maxX = sliderX + 60;

      let clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
      gameObject.x = clampedX;

      const percent = (clampedX - minX) / (maxX - minX);
      const total = 10;

      scene.redCount = Math.round(percent * total);
      scene.blueCount = total - scene.redCount;

      scene.updateProbabilityText();
    };

    scene.trackEvent("drag", scene._cardDragHandler);
    scene.trackEvent("drag", scene._sliderDragHandler);
    scene.trackEvent("dragend", scene._cardDragEndHandler);
  },

  matchProbabilityConcept(system, slide) {
    const scene = system.scene;

    scene._interactiveObjects = [];
    scene._interactiveEvents = [];

    scene.trackObject = (obj) => {
      scene._interactiveObjects.push(obj);
      return obj;
    };

    scene.trackEvent = (event, handler) => {
      scene.input.on(event, handler);
      scene._interactiveEvents.push({ event, handler });
    };

    const centerX = scene.cameras.main.width / 2;
    const startY = scene.cameras.main.height / 2 + 35;

    const leftItems = slide.interaction.pairs.map(p => p.left);
    const rightItems = Phaser.Utils.Array.Shuffle(
      slide.interaction.pairs.map(p => p.right)
    );

    scene.selectedLeft = null;
    scene.matchCount = 0;
    const totalMatch = slide.interaction.pairs.length;

    scene.leftTexts = [];
    scene.rightTexts = [];
    scene.matchLines = [];

    const baseStyle = { backgroundColor: "#333" };
    const hoverStyle = { backgroundColor: "#555" };
    const activeStyle = { backgroundColor: "#6666ff" };
    const correctStyle = { backgroundColor: "#2ecc71" };
    const wrongStyle = { backgroundColor: "#e74c3c" };

    const applyDefault = (obj) => {
      if (!obj.locked) obj.setStyle(baseStyle);
    };

    const addCommonEvents = (obj) => {
      obj.on("pointerover", () => {
        if (!obj.locked && obj !== scene.selectedLeft) {
          obj.setStyle(hoverStyle);
        }
      });

      obj.on("pointerout", () => {
        if (!obj.locked && obj !== scene.selectedLeft) {
          obj.setStyle(baseStyle);
        }
      });
    };

    const drawMatchLine = (leftObj, rightObj) => {
      const leftBounds = leftObj.getBounds();
      const rightBounds = rightObj.getBounds();

      const startX = leftBounds.right;
      const startY = leftBounds.centerY;

      const endX = rightBounds.left;
      const endY = rightBounds.centerY;

      const graphics = scene.add.graphics();

      graphics.lineStyle(2, 0x2ecc71, 1);

      graphics.beginPath();
      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
      graphics.strokePath();

      graphics.setDepth(9999);
      graphics.setScrollFactor(0);

      scene.trackObject(graphics);
    };

    leftItems.forEach((text, i) => {
      const obj = scene.trackObject(
        scene.add.text(centerX - 250, startY + i * 30, text, {
          fontSize: "14px",
          backgroundColor: "#333",
          padding: { x: 6, y: 4 }
        })
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(2002)
      );

      obj.locked = false;

      addCommonEvents(obj);

      obj.on("pointerdown", () => {
        if (obj.locked) return;

        scene.selectedLeft = obj;

        scene.leftTexts.forEach(t => {
          if (!t.locked) t.setStyle(baseStyle);
        });

        obj.setStyle(activeStyle);
      });

      scene.leftTexts.push(obj);
    });

    rightItems.forEach((text, i) => {
      const obj = scene.trackObject(
        scene.add.text(centerX - 80, startY + i * 30, text, {
          fontSize: "14px",
          backgroundColor: "#333",
          padding: { x: 6, y: 4 }
        })
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(2002)
      );

      obj.locked = false;

      addCommonEvents(obj);

      obj.on("pointerdown", () => {
        if (!scene.selectedLeft || obj.locked) return;

        const leftObj = scene.selectedLeft;
        const leftText = leftObj.text;
        const correct = slide.interaction.pairs.find(p => p.left === leftText);

        if (correct.right === text) {
          obj.setStyle(correctStyle);
          leftObj.setStyle(correctStyle);
          drawMatchLine(leftObj, obj);

          obj.locked = true;
          leftObj.locked = true;

          scene.matchCount++;

          if (scene.matchCount === totalMatch) {
            scene.hasInteracted = true;
          }
        } else {
          obj.setStyle(wrongStyle);
          leftObj.setStyle(wrongStyle);

          scene.time.delayedCall(300, () => {
            applyDefault(obj);
            applyDefault(leftObj);
          });
        }

        scene.selectedLeft = null;
      });

      scene.rightTexts.push(obj);
    });
  },

  constructProbabilityAnswer(system, slide) {
    const scene = system.scene;
    
    scene._interactiveObjects = [];
    scene._interactiveEvents = [];
    
    scene.trackObject = (obj) => {
      scene._interactiveObjects.push(obj);
      return obj;
    };

    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2 + 65;

    scene.selectedNumerator = null;
    scene.selectedDenominator = null;

    const numeratorText = scene.trackObject(
      scene.add.text(centerX + 140, centerY - 30, "?", {
        fontSize: "24px",
        backgroundColor: "#333",
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2002)
    );

    const line = scene.trackObject(
      scene.add.text(centerX + 140, centerY, "────", {
        fontSize: "24px"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2002)
    );

    const denominatorText = scene.trackObject(
      scene.add.text(centerX + 140, centerY + 30, "?", {
        fontSize: "24px",
        backgroundColor: "#333",
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2002)
    );

    let optionButtons = [];

    const checkAnswer = () => {
      if (scene.selectedNumerator === null || scene.selectedDenominator === null) return;

      const n = scene.selectedNumerator;
      const d = scene.selectedDenominator;

      if (
        n === slide.interaction.correct.numerator &&
        d === slide.interaction.correct.denominator
      ) {
        showFeedback(system, slide.interaction.feedback.correct);

        scene.hasInteracted = true;

        optionButtons.forEach(btn => {
          btn.setFillStyle(0x2ecc71);
          btn.disableInteractive();
        });

      } else if (
        n === slide.interaction.simplified.numerator &&
        d === slide.interaction.simplified.denominator
      ) {
        showFeedback(system, slide.interaction.feedback.simplified);

        scene.hasInteracted = true;

        optionButtons.forEach(btn => {
          btn.setFillStyle(0x3498db);
          btn.disableInteractive();
        });

      } else {
        showFeedback(system, slide.interaction.feedback.wrong);

        optionButtons.forEach(btn => {
          btn.setFillStyle(0xe74c3c);
        });

        scene.time.delayedCall(800, () => {
          optionButtons.forEach(btn => {
            btn.setFillStyle(0x444444);
          });

          scene.selectedNumerator = null;
          scene.selectedDenominator = null;

          numeratorText.setText("?");
          denominatorText.setText("?");
        });
      }
    };

    const createOptions = (options, y, isNumeratorRow) => {
      const cols = 4;
      const spacingX = 2;

      options.forEach((value, i) => {
        const col = i % cols;

        const startX = centerX - ((cols - 1) * 60) - ((cols - 1) * spacingX / 2);
        const x = startX + col * (80 + spacingX);
        const posY = y;

        const text = scene.trackObject(
          scene.add.text(x, posY, value.toString(), {
            fontSize: "18px",
            color: "#ffffff"
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(2002)
        );

        const btn = scene.trackObject(
          scene.add.rectangle(
            x,
            posY,
            Math.max(text.width + 20, 60),
            text.height + 15,
            0x444444
          )
          .setScrollFactor(0)
          .setDepth(2001)
          .setInteractive()
        );

        optionButtons.push(btn);

        text.setPosition(btn.x, btn.y);

        btn.on("pointerdown", () => {
          btn.setFillStyle(0x555555);

          if (isNumeratorRow) {
            scene.selectedNumerator = value;
            numeratorText.setText(value);
          } else {
            scene.selectedDenominator = value;
            denominatorText.setText(value);
          }

          checkAnswer();
        });
      });
    };

    createOptions(slide.interaction.numeratorOptions, centerY - 30, true);
    createOptions(slide.interaction.denominatorOptions, centerY + 30, false);
  },

  probabilityQuizFlow(system, slide) {
    const scene = system.scene;

    scene._interactiveObjects = [];
    scene._interactiveEvents = [];

    scene.trackObject = (btn) => {
      scene._interactiveObjects.push(btn);
      return btn;
    };

    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2 + 55;

    let currentStep = 0;

    const questionText = scene.trackObject(
      scene.add.text(centerX, centerY - 40, "", {
        fontSize: "16px",
        align: "center",
        wordWrap: { width: 400 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2002)
    );

    let optionObjects = [];

    const renderStep = () => {
      optionObjects.forEach(btn => btn.destroy());
      optionObjects = [];

      const stepData = slide.interaction.steps[currentStep];
      questionText.setText(stepData.question);
      
      stepData.options.forEach((opt, i) => {
        const cols = 2;
        const spacingX = 20;
        const spacingY = 50;
  
        const col = i % cols;
        const row = Math.floor(i / cols);
  
        const x = centerX + (col - 0.5) * (140 + spacingX);
        const y = centerY - 10 + row * spacingY;

        const text = scene.trackObject(
          scene.add.text(x, y, opt, {
            fontSize: "16px",
            color: "#ffffff",
            wordWrap: { width: 260 }
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(2002)
        );

        const btn = scene.trackObject(
          scene.add.rectangle(
            x,
            y,
            Math.max(text.width + 30, 120),
            text.height + 20,
            0x333333
          )
          .setScrollFactor(0)
          .setDepth(2001)
          .setInteractive()
        );

        text.setPosition(btn.x, btn.y);

        btn.on("pointerdown", () => {
          const isCorrect = opt === stepData.correct;
          const isLastStep = currentStep === slide.interaction.steps.length - 1;

          if (isCorrect) {
            btn.setFillStyle(0x2ecc71);
          
            optionObjects.forEach(o => o.disableInteractive());
          
            scene.time.delayedCall(500, () => {
              currentStep++;
            
              if (currentStep < slide.interaction.steps.length) {
                renderStep();
              } else {
                showFinalResult();
              }
            });
          
          } else {
            btn.setFillStyle(0xe74c3c);

            if (isLastStep) {
              showFeedback(system, slide.interaction.feedback.wrong);
            
              optionObjects.forEach(o => o.disableInteractive());
            
              scene.time.delayedCall(1000, () => {
                currentStep = 0;
                renderStep();
              });
            
            } else {
              showFeedback(system, slide.interaction.feedback.tryAgain);
            
              scene.time.delayedCall(600, () => {
                btn.setFillStyle(0x333);
              });
            }
          }
        });

        optionObjects.push(btn, text);
      });
    };

    const showFinalResult = () => {
      showFeedback(system, slide.interaction.feedback.correct);
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

    scene.updateProbabilityText = null;
    scene.selectedLeft = null;
    scene.leftTexts = null;
    scene.rightTexts = null;
  }

};