const fs = require("fs")

new Promise(async () => {
    const {compilePack} = await import("@foundryvtt/foundryvtt-cli");

    let folderList = fs.readdirSync('pack-data');
    for (let folder of folderList) {
        await compilePack(`pack-data/${folder}`, `dist/packs/${folder}`, {log: true});
    }
})