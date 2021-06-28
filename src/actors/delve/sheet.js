import sheetHTML from './sheet.html';

export default class DelveSheet extends ActorSheet {
    get template() {
        return sheetHTML.path;
    }
}