import HeartItemSheet from './base/sheet';
import sheetModules from './**/sheet.js';

class HeartItem extends Item {
    constructor(data={}, context={}) {
        super(data, context);

        Object.defineProperty(this, "parentItem", {
          value: context.parentItem || null,
          writable: false
        });
    }

    get isChild() {
        return this.parentItem !== null;
    }

    async update(data={}, context={}) {
        if(this.isChild) {
            const update = this.parentItem.update({
                [`data.children.${this.data._id}`]: data
            });
            
            update.then(parent => {
                const child = parent.data.data.children[this.data._id];
                mergeObject(this.data._source, child);
                mergeObject(this.data, child);
            });

            return update;
        } else {
            return super.update(data, context);
        }
    }
}


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
    console.log('heart | Assigning new Item documentClass');
    CONFIG.Item.documentClass = HeartItem;
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
        if(module.initialise) {
            module.initialise();
        }

        if(type === 'base') return;
        
        CONFIG.Item.typeLabels[type] = `heart.${type}.label-single`;
        Items.registerSheet('heart', Sheet, {
            types: [type],
            makeDefault: true,
            label: `heart.${type}.label-single`
        });
    });
}