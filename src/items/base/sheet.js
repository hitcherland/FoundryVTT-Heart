import sheetHTML from './sheet.html';
import HeartSheetMixin from '../../common/sheet';

export default class HeartItemSheet extends HeartSheetMixin(ItemSheet) {
    static get type() { return 'base'; }

    get template() {
        return sheetHTML.path;
    }

    get default_img() {
        return 'icons/svg/item-bag.svg';
    }

    get img() {
        return this.default_img;
    }
}