const fs = require('fs');
const glob = require('glob');
const {mergeDeep} = require('./common');

const paths = glob.globSync('./src/**/template.json');
const templates = {};
paths.forEach((path) => {
    console.warn(`Adding template ${path}`);
    const content = fs.readFileSync(path);
    const template = JSON.parse(content);
    mergeDeep(templates, template);
});

Object.keys(templates).forEach((documentType) => {
    const types = Object.keys(templates[documentType]).filter(x => x !== "templates");
    templates[documentType].types = types;
});

fs.writeFileSync('./dist/template.json', JSON.stringify(templates, null, 4));