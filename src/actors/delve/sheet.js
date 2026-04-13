import sheetHTML from './sheet.html';
import './delve.sass';
import HeartActorSheet from '../base/sheet';
import template from './template.json';

export default class DelveSheet extends HeartActorSheet {
    static get type() { return Object.keys(template.Actor)[0]; }

    static PARTS = {
        main: { template: sheetHTML.path, scrollable: [".heart.sheet"] },
    };

    get img() {
        return 'systems/heart/assets/dungeon-light.svg';
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.showTextboxesBelowItems = game.settings.get('heart', 'showTextboxesBelowItems');
        return context;
    }
}
