import applicationHTML from "./application.html";
import HeartApplication from "../base/application.js";

export default class BeatTrackerApplication extends HeartApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: applicationHTML.path,
      classes: ["form", "heart", this.formType],
      resizable: true,
    });
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: applicationHTML.path,
    });
  }

  static get formType() {
    return "beat-tracker";
  }

  getData() {
    const data = super.getData();

    const charactersWithBeats = game.actors
      .filter((actor) => actor.type === "character")
      .reduce((arr, character) => {
        arr.push({
          character,
          activeBeats: character.items.filter(
            (item) => item.type === "beat" && item.system.active
          ),
        });
        return arr;
      }, []);

    return foundry.utils.mergeObject(data, {
      characters: charactersWithBeats,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-action=close]").click(() => {
      this.close();
    });
  }
}
