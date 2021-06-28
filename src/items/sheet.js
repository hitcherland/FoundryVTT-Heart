import sheetHTML from './sheet.html';
import HeartSheetMixin from '../common/sheet';'../common/sheet';

export default class HeartItemSheet extends HeartSheetMixin(ItemSheet) {
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