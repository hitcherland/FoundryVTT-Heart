import sheetHTML from './sheet.html';
import HeartSheetMixin from '../common/sheet';'../common/sheet';

export default class HeartActorSheet extends HeartSheetMixin(ActorSheet) {
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return this.default_img;
    }
}