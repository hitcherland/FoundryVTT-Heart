import { BaseItemData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, ObjectField, SchemaField, StringField, ArrayField } =
  foundry.data.fields;

class CallingData extends BaseItemData {
  static defineSchema() {
    return {
      childUUIDs: new ArrayField(new StringField()),
      description: new HTMLField({ required: true }),
      questionArray: new ArrayField(
        new SchemaField({
          question: new HTMLField({ required: true }),
          answer: new HTMLField(),
        })
      ),
      // to be deprecated
      questions: new ArrayField(new ObjectField()),
      children: new ObjectField(),
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
  CONFIG.Item.dataModels.calling = CallingData;
}
