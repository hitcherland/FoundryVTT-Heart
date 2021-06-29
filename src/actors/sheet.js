import sheetHTML from './sheet.html';
import HeartSheetMixin from '../common/sheet';'../common/sheet';

export default class HeartActorSheet extends HeartSheetMixin(ActorSheet) {
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return this.default_img;
    }

    getData() {
        const data = super.getData();

        const items = {};
        Object.keys(CONFIG.Item.typeLabels).forEach((type) => {
            items[type] = [];
        });

        this.actor.items.forEach((item) => {
            items[item.type].push(item);
        });

        data.heart = items;

        return data;
    }
}