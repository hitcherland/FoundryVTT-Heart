import sheetHTML from './sheet.html';
import templateJSON from './template.json';

const fallout_levels = ['minor', 'major', 'critical']

function initialise() {
    game.heart.fallout_levels = fallout_levels;
}

const data = Object.freeze({
    type: Object.keys(templateJSON.Item)[0],
    img: 'systems/heart/assets/fallout-shelter.svg',
    template: sheetHTML.path,
});

export {
    data,
    initialise
}