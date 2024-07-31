import { BaseItemData } from "../base/model.js";

const { HTMLField, NumberField } = foundry.data.fields;

class TagData extends BaseItemData {
  static defineSchema() {
    return {
      description: new HTMLField({ required: true }),
      limited_uses: new NumberField({ integer: true }),
    };
  }
}

export function initialise() {
  CONFIG.Item.dataModels.tag = TagData;
}
