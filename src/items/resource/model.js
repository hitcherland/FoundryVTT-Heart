import { BaseItemData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, BooleanField, StringField, ArrayField } =
  foundry.data.fields;

class ResourceData extends BaseItemData {
  static defineSchema() {
    return {
      childUUIDs: new ArrayField(new StringField()),
      complete: new BooleanField({ initial: false }),
      description: new HTMLField({ required: true }),
      die_size: new StringField({ choices: game.heart.die_sizes }),
      domain: new StringField({ choices: game.heart.domains }),
    };
  }

  static async migrateData(source) {
    await migrateChildrenToChildUUIDs(source);
    return super.migrateData(source);
  }
}

export function initialise() {
  CONFIG.Item.dataModels.resource = ResourceData;
}
