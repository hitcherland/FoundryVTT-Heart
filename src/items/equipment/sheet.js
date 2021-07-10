import sheetHTML from './sheet.html';
import templateJSON from './template.json';

const types = ['miscellaneous', 'delve', 'kill', 'mend'];

function initialise() {
    game.heart.equipment_types = types;
}

const data = Object.freeze({
    type: Object.keys(templateJSON.Item)[0],
    img: 'systems/heart/assets/battle-gear.svg',
    template: sheetHTML.path,
});

export {
    data,
    initialise
}