import {extractPack} from "@foundryvtt/foundryvtt-cli";
import {readdirSync} from "node:fs";

let folderList = readdirSync('dist/packs');
Promise.all(folderList.map(async folder => {
    await extractPack(`dist/packs/${folder}`, `pack-data/${folder}`, {log: true});
}))