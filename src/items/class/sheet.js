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
}

export {
    data
}