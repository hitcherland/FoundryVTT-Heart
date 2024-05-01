const fs = require("fs")

new Promise(async () => {
    const {extractPack} = await import("@foundryvtt/foundryvtt-cli");

    let folderList = fs.readdirSync('dist/packs');
    for (let folder of folderList) {
        await extractPack(`dist/packs/${folder}`, `pack-data/${folder}`, {log: true});
    }
})