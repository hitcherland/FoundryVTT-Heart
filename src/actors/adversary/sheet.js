import sheetHTML from './sheet.html';

export default class AdversarySheet extends ActorSheet {
    get template() {
        return sheetHTML.path;
    }
}