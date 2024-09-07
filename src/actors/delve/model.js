import { BaseActorData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, NumberField, StringField, ArrayField } = foundry.data.fields;

class DelveData extends BaseActorData {
  static defineSchema() {
    return {
      connection: new StringField(),
      description: new HTMLField(),
      domains: new ArrayField(new StringField({ choices: game.heart.domains })),
      events: new ArrayField(new StringField({})),
      notes: new HTMLField(),
      resistance: new NumberField({ integer: true, initial: 0 }),
      resistanceMax: new NumberField({ integer: true, initial: 5 }),
      stress: new StringField({ choices: game.heart.die_sizes }),
      tier: new StringField(),
    };
  }

  static async migrateData(source) {
    migrateChildrenToChildUUIDs(source);
    if (source.questionArray === undefined) {
      source.questionArray = [];
    }
    if (source.questions !== undefined) {
      Object.values(source.questions).forEach((question) => {
        source.questionArray.push(question);
      });
    }
    return super.migrateData(source);
  }
}

export function initialise() {
  CONFIG.Actor.dataModels.delve = DelveData;
}
