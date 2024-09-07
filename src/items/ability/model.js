import { BaseItemData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, StringField, ArrayField } = foundry.data.fields;

class AbilityData extends BaseItemData {
  static defineSchema() {
    return {
      childUUIDs: new ArrayField(new StringField()),
      description: new HTMLField({ required: true }),
      type: new StringField({
        required: true,
        choices: game.heart.ability.types,
      }),
    };
  }

  static async migrateData(source) {
    migrateChildrenToChildUUIDs(source);
    return super.migrateData(source);
  }
}

export function initialise() {
  CONFIG.Item.dataModels.ability = AbilityData;
}
