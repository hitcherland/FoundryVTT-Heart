const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./foundryvtt.config.json'));
const manifest = JSON.parse(fs.readFileSync("./dist/system.json"));

console.log(process.argv);
version = process.argv[2] || "???";
manifest.version = version;

const githubRepo = config.githubRepo;
if (githubRepo) {
    manifest.url = `https://github.com/${githubRepo}`;
    manifest.manifest = `https://github.com/${githubRepo}/releases/latest/download/system.json`
    manifest.readme = `https://raw.githubusercontent.com/${githubRepo}/${version}/README.md`;
    manifest.download = `https://github.com/${githubRepo}/releases/download/${version}/heart.zip`;
}

// Return as nicely parsed string
const output = JSON.stringify(manifest, null, 4);
console.log(`Updating manifest`);
fs.writeFileSync(`./dist/system.json`, output);