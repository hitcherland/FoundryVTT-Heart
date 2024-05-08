import {compilePack} from "@foundryvtt/foundryvtt-cli";
import {readdirSync} from "node:fs";

let folderList = readdirSync("pack-data");
Promise.all(folderList.map(async folder => {
    await compilePack(`pack-data/${folder}`, `dist/packs/${folder}`, {log: true});
}))