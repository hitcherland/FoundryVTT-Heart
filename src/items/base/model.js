export class BaseItemData extends foundry.abstract.TypeDataModel {

}

export function FindMatchingItemInCompendium(data) {
    let uuid;
    const all = game.packs.forEach(pack => {
        return pack.index.forEach(i => {
            if (i.type === data.type && data.name === i.name) {
                uuid = i.uuid;
            }
        });
    });
    return uuid;
}

export function migrateChildrenToChildUUIDs(source) {
    Object.values(source.children).forEach((data) => {
        if (source.childUUIDs === undefined) {
            source.childUUIDs = [];
        }

        const matchingUUID = FindMatchingItemInCompendium(data);
        if (matchingUUID) {
            if (source.childUUIDs.includes(matchingUUID)) {
                return;
            }
            source.childUUIDs.push(matchingUUID);
        } else {
            console.warn("Failed to find similar item in the compendia, should probably create an item for this");
            source.childUUIDs.push(data._id);
        }
    });
    source.children = undefined;
}