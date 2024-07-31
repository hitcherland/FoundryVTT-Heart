import { BaseItemData } from "../base/model.js";

const { BooleanField, HTMLField, StringField } = foundry.data.fields;

class BeatData extends BaseItemData {
  static defineSchema() {
    return {
      complete: new BooleanField({ initial: false }),
      description: new HTMLField({ required: true }),
      type: new StringField({ required: true, choices: game.heart.beat.types }),
    };
  }
}

export function initialise() {
  CONFIG.Item.dataModels.beat = BeatData;
}
