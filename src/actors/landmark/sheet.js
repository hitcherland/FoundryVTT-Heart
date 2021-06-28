import sheetHTML from './sheet.html';

export default class LandmarkSheet extends ActorSheet {
    get template() {
        return sheetHTML.path;
    }
}