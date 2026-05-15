import characterConfig from "../../data/characterConfig.js";

export function createCharAnimations(scene, charClass, characterName, options = {}) {
  const {
    directions = ["front", "back", "left", "right"],
    actions = ["attack", "hurt", "idle", "walk", "die"]
  } = options;

  const config = characterConfig[characterName];

  if (!config) return;

  for (const action of actions) {

    const frameCount = config[action];
    if (!frameCount) continue;

    if (action === "die") {

      const animKey = `${characterName}_die`;
      const frames = [];

      for (let i = 0; i < frameCount; i++) {
        const textureKey = `${characterName}_die_${i}`;

        frames.push({ key: textureKey });
      }

      if (frames.length === 0) continue;

      scene.anims.create({
        key: animKey,
        frames,
        frameRate: 20,
        repeat: 0
      });

      continue;
    }

    for (const dir of directions) {

      const animKey = `${characterName}_${dir}_${action}`;
      const frames = [];

      for (let i = 0; i < frameCount; i++) {
        const textureKey = `${characterName}_${dir}_${action}_${i}`;

        frames.push({ key: textureKey });
      }

      if (frames.length === 0) continue;

      scene.anims.create({
        key: animKey,
        frames,
        frameRate:
          action === "idle" ? 16 :
          action === "walk" ? 20 :
          action === "attack" ? 15 :
          action === "hurt" ? 10 :
          8,
        repeat: (action === "idle" || action === "walk") ? -1 : 0
      });
    }
  }
}