import {createButton} from "../ui/buttonsUI.js";
import {createClickOption} from "../ui/optionsUI.js";

export default class MaterialInteractionSystem {
    constructor(scene) {
        this.scene = scene;
        this.handlers = {};
        this.activeHandler = null
    }

    registerHandler(name, handler) {
        this.handlers[name] = handler;
    }

    setActiveHandler(name) {
        this.activeHandler = this.handlers[name];

        if (!this.activeHandler) {
            console.warn(`Handler "${name}" tidak ditemukan`);
        }
    }

    executeAction(action, payload) {
        if (!this.activeHandler) {
            console.warn("Belum ada handler aktif");
            return;
        }

        const fn = this.activeHandler[action];

        if (fn) {
            fn(this, payload);
        } else {
            console.warn(`Action "${action}" tidak ditemukan di handler aktif`);
        }
    }

    create(slide) {
        if (!slide.interaction) return;

        const { type, action } = slide.interaction;

        if (type === "clickOption") {
            createClickOption(this, slide);
            return;
        }
        if (type === "button") {
            createButton(this, slide);
            return;
        }

        this.executeAction(action, slide);
    }

    clear() {
        const scene = this.scene;   

        if (this.activeHandler && this.activeHandler.cleanup) {
            this.activeHandler.cleanup(this);
        }
        if (scene.uiElements) {
            scene.uiElements.forEach(obj => obj.destroy());
            scene.uiElements = [];
        }
    }
}