import sheetHTML from './sheet.html';
import './adversary.sass';
import HeartActorSheet from '../base/sheet';
import template from './template.json';

export default class AdversarySheet extends HeartActorSheet {
    static DEFAULT_OPTIONS = {
        dragDrop: [{dragSelector: '.item', dropSelector: null}],
        actions: {
            "toggle-checkable": AdversarySheet._onToggleCheckable,
        },
    };

    static PARTS = {
        main: { template: sheetHTML.path, scrollable: [".heart.sheet"] },
    };

    async _onDropItemCreate(itemData) {
        if (this.actor.type === 'adversary') {
            itemData.system.active = true;
        }

        return super._onDropItemCreate(itemData);
    }

    static get type() { return Object.keys(template.Actor)[0]; }

    get img() {
        return 'systems/heart/assets/high-punch.svg';
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.showTextboxesBelowItems = game.settings.get('heart', 'showTextboxesBelowItems');
        return context;
    }

    static _onToggleCheckable(event, target) {
        event.preventDefault();
        const index = parseInt(target.dataset.index);
        const parent = target.parentElement;
        const targetPath = parent.dataset.target;
        const isChecked = target.classList.contains('checked');
        const data = {};
        if (isChecked) {
            if (index + 1 === foundry.utils.getProperty(this.actor, targetPath)) {
                data[targetPath] = index;
            } else {
                data[targetPath] = index + 1;
            }
        } else {
            data[targetPath] = index + 1;
        }
        this.actor.update(data);
    }
}
