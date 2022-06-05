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

    get template() {
        return data.template;
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
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {};
            data[target] = index + 1;
            this.item.update(data);
        });

        html.find('.ordered-checkable-box.checked').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {};
            if (index + 1 === getProperty(this.item.data, target)) {
                data[target] = index;
            } else {
                data[target] = index + 1;
            }
            this.item.update(data);
        });

        html.find('[data-action=item-roll]').click(async ev => {
            const uuid = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);

            const roll = game.heart.rolls.ItemRoll.build({item});
            await roll.evaluate({async: true});

            roll.toMessage({
                flavor: `${localizeHeart(this.item.name)} (<span class="item-type">${item.type}</span>)`,
                speaker: {alias: "GM"}
            });
        });

        html.find('[data-action=upgrade]').click(async ev => {
            const target = $(ev.currentTarget);
            const dieSizes = this.item.data.data.die_sizes;
            
            const updates = {};
            updates['data.upgradeTrack'] = 0;

            const childrenUpdates = {};
            this.item.children.filter(x => x.type === 'service').forEach(async child => {
                var indexOf = dieSizes.indexOf(child.data.data.die_size);
                
                if(indexOf < (dieSizes.length - 1)) {
                    var largerSize = dieSizes[indexOf+1];
                    childrenUpdates[`${child.id}.data.die_size`] = largerSize;
                }
            });

            await this.item.updateChildren(childrenUpdates);
            this.item.update(updates);
        });

        html.find('[data-action=downgrade]').click(async ev => {
            const target = $(ev.currentTarget);
            const dieSizes = this.item.data.data.die_sizes;

            const childrenUpdates = {};
            this.item.children.filter(x => x.type === 'service').forEach(async child => {
                var indexOf = dieSizes.indexOf(child.data.data.die_size);
                
                if(indexOf > 0) {
                    var smallerSize = dieSizes[indexOf-1];
                    childrenUpdates[`${child.id}.data.die_size`] = smallerSize;
                }
            });

            await this.item.updateChildren(childrenUpdates);
        });
    }

    async _canDragDropItem(item) {
        if(item.type === 'service' && item.data.type === undefined) {
            await item.update({'data.type': 'core'});
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