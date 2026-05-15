export default class CharacterSystem {
    constructor(scene, characterData) {
        this.scene = scene;

        this.characterData = characterData;
        this.selectedSubclass = null;
    }

    getClassName() {
        return this.characterData.class;
    }

    getSubclasses() {
        return this.characterData.subclasses;
    }

    getSubclass(name) {
        return this.characterData.subclasses.find(
            sub => sub.subclass === name
        );
    }

    getBaseStats() {
        if (!this.selectedSubclass) return null;

        const sub = this.getSubclass(this.selectedSubclass);
        return sub ? sub.baseStats : null;
    }

    getSkills() {
        if (!this.selectedSubclass) return [];

        const sub = this.getSubclass(this.selectedSubclass);
        return sub ? (sub.skills || []) : [];
    }
}