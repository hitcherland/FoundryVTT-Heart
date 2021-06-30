import HeartItemSheet from './base/sheet';
import sheetModules from './**/sheet.js';

function ItemSheetFactory(data) {
    const safe_data = Object.freeze({...data});
    return class extends HeartItemSheet {
        static get type() { return data.type; }

        get template() {
            return safe_data.template;
        }
    
        get img() {
            return safe_data.img;
        }
    }
}

export function initialise() {
    console.log('heart | Registering item sheets');
    Items.unregisterSheet('core', ItemSheet);
    sheetModules.forEach((module) => {
        
        const data = module.data;
        let Sheet;
        if(module.default !== undefined) {
            Sheet = module.default;
        } else if(data.sheet instanceof ItemSheet) {
            Sheet = data.sheet
        } else {
            Sheet = ItemSheetFactory(data);
        }

        const type = Sheet.type;

        console.log(`heart | -- Registering ${type} sheet`);
        if(game.heart.items === undefined) {
            game.heart.items = {}
        }

        if(game.heart.items[type] === undefined) {
            game.heart.items[type] = {}
        }

        game.heart.items[type].sheet = Sheet

        if(type === 'base') return;

        Items.registerSheet('heart', Sheet, {
            types: [type],
            makeDefault: true,
            label: `heart.${type}`
        });
    });
}