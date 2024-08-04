import { BaseActorData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, NumberField, ObjectField, SchemaField, StringField, ArrayField } =
  foundry.data.fields;

class DelveData extends BaseActorData {
  static defineSchema() {
    return {
      notes: new HTMLField(),
      domains: new ArrayField(new StringField({choices: game.heart.domains})),
      tier: new StringField(),
      stress: new StringField({ choices: game.heart.die_sizes }),
      resistance: new NumberField({integer: true, initial: 0}),
      resistanceMax: new NumberField({integer: true, initial: 5}),
      events: new ArrayField(new StringField({})),
      connection: new StringField(),
      description: new HTMLField(),
      notes: new HTMLField(),
    };
  }

  static async migrateData(source) {
    await migrateChildrenToChildUUIDs(source);
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
