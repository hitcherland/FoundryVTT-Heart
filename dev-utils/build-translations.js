const fs = require('fs');
const path = require('path');
const glob = require('glob');
const {mergeDeep} = require('./common');


const paths = glob.globSync('./@(src|pack-data|release-notes)/**/lang/*.json');

const translations = paths.reduce((map, filename) => {
    const basename = path.basename(filename);
    if (map[basename] === undefined) {
        map[basename] = {};
    }

    console.log(`merging ${filename}`);
    const content = fs.readFileSync(filename);
    const json = JSON.parse(content);
    mergeDeep(map[basename], json);
    return map;
}, {});

const target = './dist/lang';
if (fs.existsSync(target)) {
    console.log(`Cleaning up old ${target}`)
    fs.rmSync(target, {recursive: true});
};
fs.mkdirSync(target);

Object.entries(translations).forEach(([filename, translation]) => {
    console.warn(`Writing to ${target}/${filename}`);
    const output = JSON.stringify({"heart": translation}, null, 4);
    fs.writeFileSync(`${target}/${filename}`, output);
});