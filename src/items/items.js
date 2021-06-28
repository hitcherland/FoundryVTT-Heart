import './items.sass';

import HeartItemSheet from './sheet';
import sheetModules from './**/sheet.js';

function ItemSheetFactory(data) {
    const safe_data = Object.freeze({...data});
    return class extends HeartItemSheet {
        get template() {
            return safe_data.template;
        }
    
        get img() {
            return safe_data.img;
        }
    }
}

export default function initialiseItems() {
    Items.unregisterSheet('core', ItemSheet);
    sheetModules.forEach((module) => {
        if(module.default === HeartItemSheet) return;
        console.warn({data: module.data, module});
        const data = module.data;
        let sheet;
        if(module.default instanceof ItemSheet) {
            sheet = module.default;
        } else if(data.sheet instanceof ItemSheet) {
            sheet = data.sheet
        } else {
            sheet = ItemSheetFactory(data);
        }

        Items.registerSheet('heart', sheet, {
            types: [data.type],
            makeDefault: true,
            label: `heart.${data.type}`
        });
    });
}