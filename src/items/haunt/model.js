import { BaseItemData } from "../base/model.js";

const { HTMLField, StringField, ArrayField } = foundry.data.fields;

class HauntData extends BaseItemData {
  static defineSchema() {
    return {
      description: new HTMLField({
        required: true,
      }),
      resistances: new ArrayField(
        new StringField({
          choices: game.heart.resistances,
        })
      ),
      upgradeTrack: new StringField(),
    };
  }
}

export function initialise() {
  CONFIG.Item.dataModels.haunt = HauntData;
}