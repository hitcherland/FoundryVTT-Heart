import sheetHTML from './sheet.html';
import templateJSON from './template.json';

const data = Object.freeze({
    type: Object.keys(templateJSON.Item)[0],
    img: 'systems/heart/assets/drum.svg',
    template: sheetHTML.path,
});

export {
    data
}