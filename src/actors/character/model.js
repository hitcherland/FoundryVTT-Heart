import { BaseActorData, migrateChildrenToChildUUIDs } from "../base/model.js";

const { HTMLField, NumberField, ObjectField, SchemaField, StringField, ArrayField } =
  foundry.data.fields;

class CharacterData extends BaseActorData {
  static defineSchema() {
    return {
      notes: new HTMLField(),
      resistances: new SchemaField({
        "blood": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "max": new NumberField({integer: true, initial: 10}),
            "protection": new NumberField({integer: true, initial: 0}),
        }),
        "mind": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "max": new NumberField({integer: true, initial: 10}),
            "protection": new NumberField({integer: true, initial: 0}),
        }),
        "echo": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "max": new NumberField({integer: true, initial: 10}),
            "protection": new NumberField({integer: true, initial: 0}),
        }),
        "fortune": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "max": new NumberField({integer: true, initial: 10}),
            "protection": new NumberField({integer: true, initial: 0}),
        }),
        "supplies": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "max": new NumberField({integer: true, initial: 10}),
            "protection": new NumberField({integer: true, initial: 0}),
        })
      }),
      skills: new SchemaField({
        "compel": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "delve": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "discern": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "endure": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "evade": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "hunt": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "kill": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "mend": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "sneak": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        })
      }),
      domains: new SchemaField({
        "cursed": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "desolate": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "haven": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "occult": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "religion": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "technology": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "warren": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        }),
        "wild": new SchemaField({
            "value": new NumberField({integer: true, initial: 0}),
            "knack": new StringField(),
        })
      }),
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
  CONFIG.Actor.dataModels.character = CharacterData;
}
