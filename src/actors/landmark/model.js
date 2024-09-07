import { BaseActorData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, NumberField, ObjectField, SchemaField, StringField, ArrayField } =
  foundry.data.fields;

class LandmarkData extends BaseActorData {
  static defineSchema() {
    return {
      description: new HTMLField(),
      domains: new ArrayField(new StringField({choices: game.heart.domains})),
      potentialPlots: new StringField(),
      specialRules: new HTMLField(),
      stress: new StringField({ choices: game.heart.die_sizes }),
      tier: new StringField()
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
  CONFIG.Actor.dataModels.landmark = LandmarkData;
}
