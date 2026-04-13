import sheetHTML from './sheet.html';
import templateJSON from './template.json';
import HeartItemSheet from '../base/sheet';

import './sheet.sass';

const types = ['miscellaneous', 'delve', 'kill', 'mend'];
const beat_levels = ['minor', 'major', 'zenith']

function initialise() {
    game.heart.equipment_types = types;
    game.heart.beat_levels = beat_levels;
}

const data = Object.freeze({
    type: Object.keys(templateJSON.Item)[0],
    img: 'systems/heart/assets/battle-gear.svg',
    template: sheetHTML.path,
});

export default class extends HeartItemSheet {
    static get type() { return data.type; }

    static DEFAULT_OPTIONS = {
        actions: {
            "toggle-checkable": this._onToggleCheckable,
        },
    };

    static PARTS = {
        main: { template: data.template, scrollable: [".heart.sheet"] },
    };

    get img() {
        return data.img;
    }

    //FIXME:? This is required to open equipment that is a child of a class/calling from the player sheet.
    // It maybe should be using get id() from the ItemSheetFactory instead?
    get id() {
      return `${this.constructor.name}-${this.document.uuid.replace(/[\.@]/g, "-")}`;
    }

    get resistanceTypes() {
      return this.system.resistances;
    }

    static _onToggleCheckable(event, target) {
        event.preventDefault();
        const parent = target.parentElement;
        const fieldTarget = parent.dataset.target;
        const value = parent.dataset.value;
        const isChecked = target.classList.contains('checked');

        let currentResistances = foundry.utils.getProperty(this.document, fieldTarget);
        if (isChecked) {
            currentResistances = currentResistances.filter(e => e !== value);
        } else {
            currentResistances.push(value);
        }
        let data = {};
        data[fieldTarget] = currentResistances;
        this.document.update(data);
    }
}

export {
  data,
  initialise
}
