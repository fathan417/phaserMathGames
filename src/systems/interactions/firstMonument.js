export const firstMonument = {
    createCoin(system, slide) {
        const scene = system.scene;
        
        scene.coinState = "angka";
        
        scene.coinImage = scene.add.image(
            scene.cameras.main.width / 2 + 150,
            scene.cameras.main.height / 2 + 60,
            "coinAngka"
        );
    
        scene.coinImage.setScale(0.1);
        scene.coinImage.setScrollFactor(0);
        scene.coinImage.setDepth(2001);
        scene.coinImage.setInteractive();
    
        scene.coinImage.on("pointerdown", () => {
          if (scene.coinState === "angka") {
            scene.coinImage.setTexture("coinGambar");
            scene.coinState = "gambar";
          } else {
            scene.coinImage.setTexture("coinAngka");
            scene.coinState = "angka";
          }
      
            scene.hasInteracted = true;
        });
    },

    createSlider(system, slide) {
      const scene = system.scene;
        
      const centerX = scene.cameras.main.width / 2;
      const centerY = scene.cameras.main.height / 2 + 55;
      const sliderWidth = 300;
        
      const left = centerX - sliderWidth / 2;
      const right = centerX + sliderWidth / 2;
        
      scene.sliderTrack = scene.add.rectangle(centerX, centerY, sliderWidth, 6, 0xffffff)
        .setScrollFactor(0)
        .setDepth(2001);
        
      scene.sliderHandle = scene.add.circle(left, centerY, 10, 0xffcc00)
        .setScrollFactor(0)
        .setDepth(2002)
        .setInteractive({ draggable: true });
        
      scene.sliderValueText = scene.add.text(centerX, centerY + 30, "0.0", {
        fontSize: "18px",
        color: "#ffffff"
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2002);

        scene.input.setDraggable(scene.sliderHandle);   

        scene._sliderDragHandler = (pointer, gameObject, dragX) => {
          if (gameObject !== scene.sliderHandle) return;

          if (dragX < left) dragX = left;
          if (dragX > right) dragX = right;

          gameObject.x = dragX;

          const value = (dragX - left) / sliderWidth;
          scene.sliderValueText.setText(value.toFixed(1));

          scene.hasInteracted = true;
        };

        scene.input.on("drag", scene._sliderDragHandler);
    },

    cleanup(system) {
        const scene = system.scene;

        if (scene.coinImage) {
          scene.coinImage.destroy();
          scene.coinImage = null;
        }

        if (scene.sliderTrack) {
          scene.sliderTrack.destroy();
          scene.sliderTrack = null;
        }

        if (scene.sliderHandle) {
          scene.sliderHandle.destroy();
          scene.sliderHandle = null;
        }
           
        if (scene.sliderValueText) {
          scene.sliderValueText.destroy();
          scene.sliderValueText = null;
        }

        if (scene._sliderDragHandler) {
          scene.input.off("drag", scene._sliderDragHandler);
          scene._sliderDragHandler = null;
        }
    }
    
};