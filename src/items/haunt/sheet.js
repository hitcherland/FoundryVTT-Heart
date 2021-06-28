import sheetHTML from './sheet.html';
import HeartItemSheet from '../sheet';

export default class HauntSheet extends HeartItemSheet {
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return "systems/heart/assets/prayer.svg";
    }
}