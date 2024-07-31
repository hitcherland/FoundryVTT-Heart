import { BaseItemData } from "../base/model.js";

const { HTMLField, BooleanField, StringField } = foundry.data.fields;

class FalloutData extends BaseItemData {
  static defineSchema() {
    return {
      complete: new BooleanField({ initial: false }),
      description: new HTMLField({ required: true }),
      resistance: new StringField({
        required: true,
        choices: game.heart.resistances,
      }),
      type: new StringField({
        required: true,
        choices: game.heart.fallout.types,
      }),
    };
  }
}

export function initialise() {
  CONFIG.Item.dataModels.fallout = FalloutData;
}
