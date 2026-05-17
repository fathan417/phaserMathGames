export default class InteractionSystem {
  constructor(scene, playerData, enemyData) {
    this.scene = scene;
    this.playerData = playerData;
    this.enemyData = enemyData;

    this.btnInteract = scene.add.image(0, 0, "btnInteract");
    this.btnInteract.setScale(0.22, 0.19);
    this.btnInteract.setDepth(1500);
    this.btnInteract.setVisible(false);
    this.btnInteract.setInteractive();

    this.btnText = scene.add.text(0, 0, "", {
      fontFamily: 'Poppins, sans-serif',
      fontSize: "11px",
      fontStyle: "bold",
      color: "#1c1c1c",
      align: "center"
    });
    this.btnText.setDepth(1501);
    this.btnText.setOrigin(0.5, 0.5);
    this.btnText.setVisible(false);

    this.btnInteract.on("pointerdown", () => {
      if (scene.destroyFloorTitle) {
        scene.destroyFloorTitle();
      }
      if (this.scene.currentInteractable) {
        this.handleInteraction(this.scene.currentInteractable);
      }
    });
  }

  getInteractionText(type) {
    switch (type) {
      case "statue":
        return "Interaksi";
      case "door":
        return "Buka";
      case "portal":
        return "Masuk";
      default:
        return "Interact";
    }
  }

  updateInteraction() {
    const scene = this.scene;

    let nearest = null;
    let minDistance = 65;

    scene.interactables.forEach(obj => {
      const distance = Phaser.Math.Distance.Between(
        scene.player.x,
        scene.player.y,
        obj.x + obj.width / 2,
        obj.y + obj.height / 2 + 30
      );

      if (distance < minDistance) {
        nearest = obj;
        minDistance = distance;
      }
    });

    if (nearest && !nearest.activated) {

      const objCenterX = nearest.x + nearest.width / 2;
      const objCenterY = nearest.y + nearest.height / 2;
        
      this.btnInteract.setPosition(objCenterX + 50, objCenterY);
        
      const label = this.getInteractionText(nearest.type);
      this.btnText.setText(label);
        
      this.btnText.setPosition(
        this.btnInteract.x,
        this.btnInteract.y
      );
    
      this.btnInteract.setVisible(true);
      this.btnText.setVisible(true);
    
    } else {
      this.btnInteract.setVisible(false);
      this.btnText.setVisible(false);
    }

    scene.currentInteractable = nearest;

    if (Phaser.Input.Keyboard.JustDown(scene.keyE)) {
      if (scene.destroyFloorTitle) {
        scene.destroyFloorTitle();
      }
      if (scene.currentInteractable) {
        this.handleInteraction(scene.currentInteractable);
      }
    }
  }

  handleInteraction(obj) {
    if (obj.type === "statue") {
      this.handleStatue(obj);
    } else if (obj.type === "door") {
      this.handleDoor(obj);
    } else if (obj.type === "portal") {
      this.handlePortal(obj);
    }
  }

  handleStatue(obj) {
    const scene = this.scene;

    if (!obj.activated) {
      if (scene.isInMaterial) return;

      scene.materialSystem.materialInteraction.setActiveHandler(obj.name);
      scene.isInMaterial = true;
      scene.activeStatue = obj;
      scene.currentMaterial = scene.materials[obj.name] || ["Materi belum tersedia."];
      scene.currentPage = 0;
      scene.materialSystem.nextMaterialPage();

    }
  }

  handleDoor(obj) {
    const scene = this.scene;

    if (scene.groupProgress[obj.group] >= 2 && !obj.activated) {
      this.openDoorTiles(obj);

      scene.currentFloor += 1;
      scene.showFloorTitle();
    }
  }

  openDoorTiles(obj) {
    const scene = this.scene;
    obj.activated = true;

    for (let x = obj.x; x < obj.x + obj.width; x += 32) {
      for (let y = obj.y; y < obj.y + obj.height; y += 32) {

        const tile = scene.interactBottom.getTileAtWorldXY(x, y);

        if (tile) {
          let newIndex = tile.index;

          if (tile.index === 369) newIndex = 401;
          if (tile.index === 370) newIndex = 402;
          if (tile.index === 371) newIndex = 403;

          if (tile.index === 385) newIndex = 417;
          if (tile.index === 386) newIndex = 418;
          if (tile.index === 387) newIndex = 419;

          scene.interactBottom.putTileAt(newIndex, tile.x, tile.y);
        }
      }
    }
  }

  handlePortal(obj) {
    const scene = this.scene;
    obj.activated = true;
    scene.openSkillSelectionUI();
    scene.setUIVisible(false);
    scene.btnRight.setVisible(false).disableInteractive();
    scene.btnLeft.setVisible(false).disableInteractive();
    scene.btnUp.setVisible(false).disableInteractive();
    scene.btnDown.setVisible(false).disableInteractive();
    scene.player.setVelocity(0);
  }
}