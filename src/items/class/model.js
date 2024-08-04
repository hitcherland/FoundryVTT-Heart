import { BaseItemData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, StringField, ArrayField } = foundry.data.fields;

class ClassData extends BaseItemData {
  static defineSchema() {
    return {
      childUUIDs: new ArrayField(new StringField()),
      description: new HTMLField({ required: true }),
      domain: new StringField({ choices: game.heart.domains }),
      skill: new StringField({ choices: game.heart.skills }),
    };
  }

  static async migrateData(source) {
    await migrateChildrenToChildUUIDs(source);
    return super.migrateData(source);
  }
}

export function initialise() {
  CONFIG.Item.dataModels.class = ClassData;
}
