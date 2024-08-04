import { BaseItemData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, StringField, ObjectField, ArrayField } = foundry.data.fields;

class EquipmentData extends BaseItemData {
  static defineSchema() {
    return {
      children: new ObjectField(),
      childUUIDs: new ArrayField(new StringField()),
      description: new HTMLField({ required: true }),
      die_size: new StringField({
        required: true,
        choices: game.heart.die_sizes,
      }),
      resistances: new ArrayField(
        new StringField({ choices: game.heart.resistances })
      ),
      type: new StringField({
        required: true,
        choices: game.heart.equipment.types,
      }),
    };
  }

  static async migrateData(source) {
    await migrateChildrenToChildUUIDs(source);
    return super.migrateData(source);
  }
}

export function initialise() {
  CONFIG.Item.dataModels.equipment = EquipmentData;
}
