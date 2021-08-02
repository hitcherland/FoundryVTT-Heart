import sheetHTML from './sheet.html';
import templateJSON from './template.json';
import HeartItemSheet from '../base/sheet';

import './sheet.sass';

const data = Object.freeze({
    type: Object.keys(templateJSON.Item)[0],
    img: 'systems/heart/assets/drum.svg',
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
        data.coreAbilities = this.item.children.filter(x => x.type === 'ability' && x.data.data.type === 'core');
        data.minorAbilities = this.item.children.filter(x => x.type === 'ability' && x.data.data.type === 'minor');
        data.majorAbilities = this.item.children.filter(x => x.type === 'ability' && x.data.data.type === 'major');
        data.zenithAbilities = this.item.children.filter(x => x.type === 'ability' && x.data.data.type === 'zenith');
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('[data-action=add-equipment-group]').click(ev => {
            const id = randomID();
            const groups = this.item.data.data.equipment_groups || [];
            groups.push(id);
            return this.item.update({'data.equipment_groups': groups});
        });

        html.find('[data-group-id] [data-action=delete-equipment-group]').click(async ev => {
            const target = $(ev.currentTarget);
            const groupId = target.closest('[data-group-id]').data('groupId');
            const groups = this.item.data.data.equipment_groups.filter(x => x === groupId);
            
            this.item.children.filter(x => x.type === 'resource' && x.data.data.group === groupId).forEach(item => {
               item.delete();
            });

            return this.item.update({'data.equipment_groups': groups});

        });
    }
}

export {
    data
}