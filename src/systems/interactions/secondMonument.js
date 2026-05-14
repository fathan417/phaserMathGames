export const secondMonument = {
    showCoinSet(system, slide) {
        const scene = system.scene;

        const centerX = scene.cameras.main.width / 2;
        const centerY = scene.cameras.main.height / 2 + 70;
        const offset = 40;

        if (scene.coinSet) {
            scene.coinSet.forEach(obj => obj.destroy());
        }

        scene.coinSet = [];

        const coinAngka = scene.add.image(centerX - offset, centerY, "coinAngka")
          .setScale(0.1)
          .setScrollFactor(0)
          .setDepth(2001);

        const coinGambar = scene.add.image(centerX + offset, centerY, "coinGambar")
          .setScale(0.1)
          .setScrollFactor(0)
          .setDepth(2001);

        scene.coinSet.push(coinAngka, coinGambar);
    },

    showDiceFaces(system, slide) {
        const scene = system.scene;

        const centerX = scene.cameras.main.width / 2;
        const centerY = scene.cameras.main.height / 2 + 60;

        const cols = 3;
        const rows = 2;

        const spacingX = 60;
        const spacingY = 50;

        const startX = centerX - spacingX;
        const startY = centerY - spacingY / 2;

        if (scene.diceSet) {
            scene.diceSet.forEach(obj => obj.destroy());
        }

        scene.diceSet = [];

        let index = 0;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
            
                const x = startX + col * spacingX;
                const y = startY + row * spacingY;
            
                const dice = scene.add.image(x, y, "dice", index)
                    .setScale(1.4)
                    .setScrollFactor(0)
                    .setDepth(2001);
            
                scene.diceSet.push(dice);
            
                index++;
            }
        }
    },

    showEventDice(system, payload) {
        const scene = system.scene;
        const type = payload.value;

        const centerX = scene.cameras.main.width / 2 + 30;
        const centerY = scene.cameras.main.height / 2 + 60;

        let indices = [];

        if (type === "ganjil") {
            indices = [0, 2, 4];
        } else if (type === "genap") {
            indices = [1, 3, 5];
        }

        if (scene.eventDiceSet) {
            scene.eventDiceSet.forEach(d => d.destroy());
        }
      
        scene.eventDiceSet = [];
      
        const spacing = 60;
        const totalWidth = (indices.length - 1) * spacing;
        let startX = centerX - totalWidth / 2;
      
        indices.forEach((frame, i) => {
            const x = startX + i * spacing;
        
            const dice = scene.add.image(x, centerY, "dice", frame)
                .setScale(1.4)
                .setScrollFactor(0)
                .setDepth(2001);
        
            scene.eventDiceSet.push(dice);
        });
    },

    cleanup(system) {
        const scene = system.scene;
        
        if (scene.coinSet) {
            scene.coinSet.forEach(obj => obj.destroy());
            scene.coinSet = null;
        }
    
        if (scene.diceSet) {
            scene.diceSet.forEach(obj => obj.destroy());
            scene.diceSet = null;
        }
    
        if (scene.eventDiceSet) {
            scene.eventDiceSet.forEach(d => d.destroy());
            scene.eventDiceSet = null;
        }
    }
};