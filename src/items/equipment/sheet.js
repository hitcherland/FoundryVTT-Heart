import sheetHTML from './sheet.html';
import HeartItemSheet from '../sheet';

export default class EquipmentSheet extends HeartItemSheet {
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return "systems/heart/assets/battle-gear.svg";
    }
}