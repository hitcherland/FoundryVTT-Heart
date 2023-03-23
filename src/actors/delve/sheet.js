import sheetHTML from './sheet.html';
import './delve.sass';
import HeartActorSheet from '../base/sheet';
import template from './template.json';

export default class DelveSheet extends HeartActorSheet {
    static get type() { return Object.keys(template.Actor)[0]; }

    getData() {
      const data = super.getData();
      data.user = game.user;
      data.showTextboxesBelowItems = game.settings.get('heart', 'showTextboxesBelowItems')
      return data;
    }
    
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return 'systems/heart/assets/dungeon-light.svg';
    }
}