import sheetHTML from "./sheet.html";
import HeartItemSheet from "../base/sheet";

import "./sheet.sass";

const data = Object.freeze({
  type: 'calling',
  img: "systems/heart/assets/drum.svg",
  template: sheetHTML.path,
});

export default class extends HeartItemSheet {
  static get type() {
    return data.type;
  }

  get template() {
    return data.template;
  }

  get img() {
    return data.img;
  }

  async getData() {
    const data = await super.getData();
    data.minorBeats = data.childrenTypes.beat?.filter(
      (beat) => beat.system.type == "minor"
    );
    data.majorBeats = data.childrenTypes.beat?.filter(
      (beat) => beat.system.type == "major"
    );
    data.zenithBeats = data.childrenTypes.beat?.filter(
      (beat) => beat.system.type == "zenith"
    );
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-action=add-question]").click((ev) => {
      const id = foundry.utils.randomID();
      this.item.update({
        [`system.questions.${id}`]: {
          question: "",
          answer: "",
        },
      });
    });

    html.find("[data-action=delete-question]").click((ev) => {
      const target = $(ev.currentTarget);
      const id = target.closest("[data-id]").data("id");
      this.item.update({ [`system.questions.-=${id}`]: null });
    });
  }

  async _canDragDropItem(item) {
    if (item.type === "ability" && item.type === undefined) {
      await item.update({ "system.type": "core" });
    }

    if (item.type === "beat" && item.type === undefined) {
      await item.update({ "system.type": "minor" });
    }
    return ["ability", "beat"].includes(item.type);
  }
}

export { data };
