import sheetHTML from './sheet.html';

const fallout_levels = ['minor', 'major', 'critical']

function initialise() {
    game.heart.fallout_levels = fallout_levels;
}

const data = Object.freeze({
    type: 'fallout',
    img: 'systems/heart/assets/fallout-shelter.svg',
    template: sheetHTML.path,
});

export {
    data,
    initialise
}