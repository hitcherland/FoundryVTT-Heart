import applicationHTML from "./application.html";
import HeartApplication from "../base/application.js";

export default class BeatTrackerApplication extends HeartApplication {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    actions: {
      ...super.DEFAULT_OPTIONS.actions,
      close: BeatTrackerApplication._onClose,
    },
  };

  static PARTS = {
    main: { template: applicationHTML.path, scrollable: [".heart.form"] },
  };

  static get formType() {
    return "beat-tracker";
  }

  async _prepareContext(options) {
    const context = {};

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

    context.characters = charactersWithBeats;

    return context;
  }

  static _onClose(event, target) {
    this.close();
  }
}
