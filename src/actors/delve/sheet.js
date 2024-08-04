import sheetHTML from './sheet.html';
import './delve.sass';
import HeartActorSheet from '../base/sheet';

export default class DelveSheet extends HeartActorSheet {
    static get type() { return "delve"; }

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