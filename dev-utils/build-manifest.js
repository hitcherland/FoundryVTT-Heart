const fs = require('fs');
const config = require('../foundryvtt.config.js');
const content = fs.readFileSync('./src/manifest.json');
const manifest = JSON.parse(content);

console.log(process.argv);
version = process.argv[2] || "???";
manifest.version = version;

// Required 
manifest.id = config.id;
manifest.title = config.title;
manifest.description = config.description;
manifest.author = config.author;
manifest.compatibility = config.compatibility;

// Optional
if (manifest.esmodules === undefined) manifest.esmodules = [`${config.id}.js`];

const githubRepo = config.githubRepo;
if (githubRepo) {
    if (manifest.url === undefined) manifest.url = `https://github.com/${githubRepo}`;
    if (manifest.manifest === undefined) manifest.manifest = `https://github.com/${githubRepo}/releases/latest/download/system.json`
    if (manifest.readme === undefined) manifest.readme = `https://raw.githubusercontent.com/${githubRepo}/${version}/README.md`;
    if (manifest.download === undefined) manifest.download = `https://github.com/${githubRepo}/releases/download/${version}/heart.zip`;
}

// Return as nicely parsed string
const output = JSON.stringify(manifest, null, 4);
console.log(`Writing manifest to ${config.type}.json`);
fs.writeFileSync(`./dist/${config.type}.json`, output);