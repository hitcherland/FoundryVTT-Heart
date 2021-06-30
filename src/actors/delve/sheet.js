import sheetHTML from './sheet.html';
import HeartActorSheet from '../base/sheet';
import template from './template.json';

export default class DelveSheet extends HeartActorSheet {
    static get type() { return Object.keys(template.Actor)[0]; }
    
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return 'systems/heart/assets/dungeon-light.svg';
    }
}