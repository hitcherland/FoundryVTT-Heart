import sheetHTML from './sheet.html';
import './adversary.sass';
import HeartActorSheet from '../base/sheet';
import template from './template.json';

export default class AdversarySheet extends HeartActorSheet {
    static get defaultOptions() {
        const defaultOptions = super.defaultOptions;
        return mergeObject(defaultOptions, {
            dragDrop: [{dragSelector: '.item', dropSelector: null}]
        })
    }

    async _onDropItemCreate(itemData) {
        if(this.actor.type === 'adversary') {

            itemData.system.active = true;
        }

        return super._onDropItemCreate(itemData);
    }

    static get type() { return Object.keys(template.Actor)[0]; }

    get template() {
        return sheetHTML.path;
    }

    get img() {
        return 'systems/heart/assets/high-punch.svg';
    }

    getData() {
        const data = super.getData();
        data.user = game.user;
        data.showTextboxesBelowItems = game.settings.get('heart', 'showTextboxesBelowItems')
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.ordered-checkable-box:not(.checked)').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {};
            data[target] = index + 1;
            this.actor.update(data);
        });

        html.find('.ordered-checkable-box.checked').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {};
            if (index + 1 === getProperty(this.data, target)) {
                data[target] = index;
            } else {
                data[target] = index + 1;
            }
            this.actor.update(data);
        });

    }
}