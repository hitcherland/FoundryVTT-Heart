import sheetHTML from './sheet.html';
import HeartActorSheet from '../sheet';

export default class LandmarkSheet extends HeartActorSheet {
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return 'systems/heart/assets/occupy.svg';
    }
}