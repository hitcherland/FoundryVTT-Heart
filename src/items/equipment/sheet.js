import sheetHTML from './sheet.html';
import templateJSON from './template.json';
import HeartItemSheet from '../base/sheet';

const types = ['miscellaneous', 'delve', 'kill', 'mend'];

function initialise() {
    game.heart.equipment_types = types;
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