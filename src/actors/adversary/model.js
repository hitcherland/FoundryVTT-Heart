import { BaseActorData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, NumberField, ObjectField, SchemaField, StringField, ArrayField } =
  foundry.data.fields;

class AdversaryData extends BaseActorData {
  static defineSchema() {
    return {
      descriptors: new StringField(),
      difficulty: new StringField(),
      motivation: new StringField(),
      names: new StringField(),
      notes: new HTMLField(),
      protection: new NumberField({integer: true, initial: 0}),
      resistance: new NumberField({integer: true, initial: 0}),
      resistanceMax: new NumberField({integer: true, initial: 5}),
      special: new HTMLField(),
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
  CONFIG.Actor.dataModels.adversary = AdversaryData;
}
