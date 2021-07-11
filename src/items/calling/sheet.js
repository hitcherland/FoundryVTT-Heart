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
        data.minorBeats = (this.childrenTypes.beat || []).filter(x => x.data.type === 'minor');
        data.majorBeats = (this.childrenTypes.beat || []).filter(x => x.data.type === 'major');
        data.zenithBeats = (this.childrenTypes.beat || []).filter(x => x.data.type === 'zenith');
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('[data-action=add-question]').click(ev => {
            const id = randomID();
            this.item.update({[`data.questions.${id}`]: {
                question: '',
                answer: ''
            }});
        });

        html.find('[data-action=delete-question]').click(ev => {
            const target = $(ev.currentTarget);
            const id = target.closest ('[data-id]').data('id');
            this.item.update({[`data.questions.-=${id}`]: null});
        });
    }
}

export {
    data
}