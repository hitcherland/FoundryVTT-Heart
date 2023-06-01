import sheetHTML from './sheet.html';
import templateJSON from './template.json';
import HeartItemSheet from '../base/sheet';

import './sheet.sass';

const types = ['miscellaneous', 'delve', 'kill', 'mend'];
const beat_levels = ['minor', 'major', 'zenith']

function initialise() {
    game.heart.equipment_types = types;
    game.heart.beat_levels = beat_levels
}

const data = Object.freeze({
    type: Object.keys(templateJSON.Item)[0],
    img: 'systems/heart/assets/battle-gear.svg',
    template: sheetHTML.path,
});

export default class extends HeartItemSheet {
    static get type() { return data.type; }

    get template() {
        return data.template || sheetHTML.path;
    }

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

    getData() {
      const data = super.getData();
      return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.ordered-checkable-box:not(.checked)').click(ev => {
          ev.preventDefault();
          const element = ev.currentTarget;
          const parent = element.parentElement;
          const target = parent.dataset.target;
          const value = parent.dataset.value;

          let currentResistances = getProperty(this.item, target)
          currentResistances.push(value)
          let data = {}
          data[target] = currentResistances
          this.item.update(data)
        });

        html.find('.ordered-checkable-box.checked').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const parent = element.parentElement;
            const target = parent.dataset.target;
            const value = parent.dataset.value;

            let newResistances = getProperty(this.item, target).filter(e => e !== value)
            let data = {}
            data[target] = newResistances
            this.item.update(data)
        });

    }

}

export {
  data,
  initialise
}