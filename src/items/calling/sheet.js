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
        data.minorBeats = this.item.children.filter(x => x.type === 'beat' && x.system.type === 'minor');
        data.majorBeats = this.item.children.filter(x => x.type === 'beat' && x.system.type === 'major');
        data.zenithBeats = this.item.children.filter(x => x.type === 'beat' && x.system.type === 'zenith');
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('[data-action=add-question]').click(ev => {
            const id = randomID();
            this.item.update({[`system.questions.${id}`]: {
                question: '',
                answer: ''
            }});
        });

        html.find('[data-action=delete-question]').click(ev => {
            const target = $(ev.currentTarget);
            const id = target.closest ('[data-id]').data('id');
            this.item.update({[`system.questions.-=${id}`]: null});
        });
    }

    async _canDragDropItem(item) {
        if(item.type === 'ability' && item.type === undefined) {
            await item.update({'system.type': 'core'});
        }
        
        if(item.type === 'beat' && item.type === undefined) {
            await item.update({'system.type': 'minor'});
        }
        return ['ability', 'beat'].includes(item.type);
    }

    async _onDropItem(event, data) {

        return super._onDropItem(event, data);
    }
}

export {
    data
}