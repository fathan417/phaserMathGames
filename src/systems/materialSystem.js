import MaterialInteractionSystem from "./materialInteractionSystem.js";
import { firstMonument } from "./interactions/firstMonument.js";
import { secondMonument } from "./interactions/secondMonument.js";
import { thirdMonument } from "./interactions/thirdMonument.js";
import { fourthMonument } from "./interactions/fourthMonument.js";
import { fifthMonument } from "./interactions/fifthMonument.js";

export default class MaterialSystem {
  constructor(scene) {
    this.scene = scene;
    this.materialInteraction = new MaterialInteractionSystem(scene);
    this.materialInteraction.registerHandler("statue1", firstMonument);
    this.materialInteraction.registerHandler("statue2", secondMonument);
    this.materialInteraction.registerHandler("statue3", thirdMonument);
    this.materialInteraction.registerHandler("statue4", fourthMonument);
    this.materialInteraction.registerHandler("statue5", fifthMonument);
  }

  tryNextPage() {
    const scene = this.scene;

    const slide = scene.currentMaterial[scene.currentPage - 1];
    if (slide?.interaction && !scene.hasInteracted) return;

    this.nextMaterialPage();
  }

  
  updateMaterialMode() {
    const scene = this.scene;

    if (!scene.isInMaterial) return false;

    scene.player.setVelocity(0);

    if (Phaser.Input.Keyboard.JustDown(scene.keySpace)) {
      if (scene.handleFeedbackNext) {
        scene.handleFeedbackNext();
      }
      this.tryNextPage();
    }

    return true;
  }

  nextMaterialPage() {
    const scene = this.scene;
    const slide = scene.currentMaterial[scene.currentPage];
    this.materialInteraction.clear();
    this.scene.setUIVisible(false);
    scene.hasInteracted = false;

    if (!scene.currentMaterial || scene.currentMaterial.length === 0) {
      scene.materialText.setText("Materi belum tersedia.");
      return;
    }

    if (scene.currentPage >= scene.currentMaterial.length) {
      this.endMaterialMode();
      return;
    }

    if (!slide) {
      console.warn("Slide kosong atau undefined:", scene.currentPage);
      this.endMaterialMode();
      return;
    }

    let displayText = "";
    if (slide.title) displayText += slide.title + "\n\n";
    if (slide.content) displayText += slide.content.join("\n");
    if (slide.interaction && slide.interaction.description) {
      displayText += "\n\n" + slide.interaction.description;
    }

    this.materialInteraction.create(slide);

    scene.materialText.setText(displayText);
    scene.materialText.setVisible(true);
    scene.materialPanel.setVisible(true);
    scene.materialBg.setVisible(true);
    scene.btnNext.setVisible(true);
    scene.feedbackIcon.setVisible(true);

    scene.currentPage++;
  }

  endMaterialMode() {
    const scene = this.scene;

    scene.materialText.setText("");
    scene.isInMaterial = false;
    scene.currentPage = 0;

    this.completeMaterial();
  }

  completeMaterial() {
    const scene = this.scene;
    const obj = scene.activeStatue;

    if (!obj) return;

    if (!obj.activated) {
      obj.activated = true;
      scene.groupProgress[obj.group]++;

      const worldX = obj.x + obj.width / 2;
      const worldY = obj.y + obj.height / 2;

      const tile = scene.interactBottom.getTileAtWorldXY(worldX, worldY);

      if (tile) {
        const tileX = tile.x;
        const tileY = tile.y;

        const markerTop = 1209;
        const markerBottom = 1225;

        scene.obstacleTop.putTileAt(markerTop, tileX, tileY - 1);
        scene.obstacleBottom.putTileAt(markerBottom, tileX, tileY);
      }

      this.scene.onStatueCompleted({
        coinGame: 5
      });
      this.scene.setUIVisible(true);
    }

    scene.isInMaterial = false;
    scene.activeStatue = null;

    scene.materialText.setVisible(false);
    scene.materialPanel.setVisible(false);
    scene.materialBg.setVisible(false);
    scene.btnNext.setVisible(false);
    scene.feedbackIcon.setVisible(false);
    scene.feedbackCloud.setVisible(false);
  }
}