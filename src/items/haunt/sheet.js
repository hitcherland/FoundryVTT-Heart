import sheetHTML from './sheet.html';
import templateJSON from './template.json';
import HeartItemSheet from '../base/sheet';

import './sheet.sass';

const data = Object.freeze({
    type: Object.keys(templateJSON.Item)[0],
    img: 'systems/heart/assets/prayer.svg',
    template: sheetHTML.path,
});

export default class extends HeartItemSheet {
    static get type() { return data.type; }

    static DEFAULT_OPTIONS = {
        actions: {
            "toggle-checkable": this._onToggleCheckable,
            "service-roll": this._onServiceRoll,
            "upgrade": this._onUpgrade,
            "downgrade": this._onDowngrade,
            "add-service": this._onAddService,
            "delete-service": this._onDeleteService,
        },
    };

    static PARTS = {
        main: { template: data.template, scrollable: [".heart.sheet"] },
    };

    get img() {
        return data.img;
    }

    static _onToggleCheckable(event, target) {
        event.preventDefault();
        const index = parseInt(target.dataset.index);
        const parent = target.parentElement;
        const targetPath = parent.dataset.target;
        const isChecked = target.classList.contains('checked');
        const data = {};
        if (isChecked) {
            if (index + 1 === foundry.utils.getProperty(this.document, targetPath)) {
                data[targetPath] = index;
            } else {
                data[targetPath] = index + 1;
            }
        } else {
            data[targetPath] = index + 1;
        }
        this.document.update(data);
    }

    static async _onServiceRoll(event, target) {
        event.preventDefault();
        const id = target.closest('[data-id]').dataset.id;
        const service = this.document.system.resistances[id];
        const item = {system:{die_size:service.die_size}};

        const roll = game.heart.rolls.ItemRoll.build({item});
        await roll.evaluate();

        roll.toMessage({
            flavor: `${localizeHeart(this.document.name)} (<span class="item-type">${localizeHeart(this.document.type)}</span>)<div class="resistance-text">${localizeHeart(service.resistance)}</div>`,
            speaker: {alias: "GM"}
        });
    }

    static _onUpgrade(event, target) {
        event.preventDefault();
        const dieSizes = game.heart.die_sizes;
        const services = this.document.system.resistances;

        const updates = {};
        updates['system.upgradeTrack'] = 0;
        Object.keys(services).forEach(key => {
            var service = services[key];
            var indexOf = dieSizes.indexOf(service.die_size);

            if(indexOf < (dieSizes.length - 1)) {
                var largerSize = dieSizes[indexOf+1];
                updates[`system.resistances.${key}.die_size`] = largerSize;
            }
        });

        this.document.update(updates);
    }

    static _onDowngrade(event, target) {
        event.preventDefault();
        const dieSizes = game.heart.die_sizes;
        const services = this.document.system.resistances;

        const updates = {};

        Object.keys(services).forEach(key => {
            var service = services[key];
            var indexOf = dieSizes.indexOf(service.die_size);

            if(indexOf > 0) {
                var smallerSize = dieSizes[indexOf-1];
                updates[`system.resistances.${key}.die_size`] = smallerSize;
            }
        });

        this.document.update(updates);
    }

    static _onAddService(event, target) {
        event.preventDefault();
        const id = foundry.utils.randomID();
        this.document.update({[`system.resistances.${id}`]: {
            die_size: 'd4',
            resistance: 'blood'
        }});
    }

    static _onDeleteService(event, target) {
        event.preventDefault();
        const id = target.closest('[data-id]').dataset.id;
        this.document.update({[`system.resistances.-=${id}`]: null});
    }

    async _canDragDropItem(item) {
        if(item.type === 'service' && item.type === undefined) {
            await item.update({'system.type': 'core'});
        }

        return ['service'].includes(item.type);
    }

    async _onDropItem(event, data) {
        return super._onDropItem(event, data);
    }
}

export {
    data
}
