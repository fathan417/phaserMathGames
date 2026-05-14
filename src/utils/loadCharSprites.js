import characterConfig from "../../data/characterConfig.js";

export function loadCharSprites(scene, charClass, characterName, options = {}) {
  const {
    directions = ["front", "back", "left", "right"],
    actions = ["attack", "hurt", "idle", "walk", "die"]
  } = options;

  const config = characterConfig[characterName];

  if (!config) return;

  const basePath = `assets/characters/${charClass}/${characterName}`;
  const load = scene.load;
  const textureExists = scene.textures.exists.bind(scene.textures);

  for (const action of actions) {

    const frameCount = config[action];
    if (!frameCount) continue;

    if (action === "die") {

      const folderPath = `${basePath}/die`;
      const prefix = `${characterName}_die`;

      for (let i = 0; i < frameCount; i++) {
        const key = `${prefix}_${i}`;
        if (textureExists(key)) continue;

        load.image(key, `${folderPath}/die_${i}.png`);
      }

      continue;
    }

    for (const dir of directions) {

      const folderPath = `${basePath}/${dir}/${action}`;
      const prefix = `${characterName}_${dir}_${action}`;

      for (let i = 0; i < frameCount; i++) {
        const key = `${prefix}_${i}`;

        if (textureExists(key)) continue;

        load.image(
          key,
          `${folderPath}/${dir}_${action}_${i}.png`
        );
      }
    }
  }
}