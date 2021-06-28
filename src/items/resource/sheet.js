import sheetHTML from './sheet.html';
import HeartItemSheet from '../sheet';

export default class ResourceSheet extends HeartItemSheet {
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return 'systems/heart/assets/ore.svg';
    }
}