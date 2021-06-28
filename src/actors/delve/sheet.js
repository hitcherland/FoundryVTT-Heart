import sheetHTML from './sheet.html';
import HeartActorSheet from '../sheet';

export default class DelveSheet extends HeartActorSheet {
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return 'systems/heart/assets/dungeon-light.svg';
    }
}