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

    static DEFAULT_OPTIONS = {
        actions: {
            "add-question": this._onAddQuestion,
            "delete-question": this._onDeleteQuestion,
        },
    };

    static PARTS = {
        main: { template: data.template, scrollable: [".heart.sheet"] },
    };

    get img() {
        return data.img;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.minorBeats = this.document.children.filter(x => x.type === 'beat' && x.system.type === 'minor');
        context.majorBeats = this.document.children.filter(x => x.type === 'beat' && x.system.type === 'major');
        context.zenithBeats = this.document.children.filter(x => x.type === 'beat' && x.system.type === 'zenith');
        return context;
    }

    static _onAddQuestion(event, target) {
        event.preventDefault();
        const id = foundry.utils.randomID();
        this.document.update({[`system.questions.${id}`]: {
            question: '',
            answer: ''
        }});
    }

    static _onDeleteQuestion(event, target) {
        event.preventDefault();
        const id = target.closest('[data-id]').dataset.id;
        this.document.update({[`system.questions.-=${id}`]: null});
    }

    async _canDragDropItem(item) {
        if (item.type === 'ability' && item.type === undefined) {
            await item.update({'system.type': 'core'});
        }

        if (item.type === 'beat' && item.type === undefined) {
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
