import HeartItemSheet from './base/sheet';
import sheetModules from './**/sheet.js';
import proxies from './*/proxy.js';

class HeartItem extends Item {
    constructor(data = {}, context = {}) {
        super(data, context);

        Object.defineProperty(this, "parentItem", {
            value: context.parentItem || null,
            writable: false
        });
    }

    get proxy() {
        if (this._proxy === undefined && this.constructor.proxies[this.type] !== undefined) {
            this._proxy = this.constructor.proxies[this.type](this);
        }

        return this._proxy;
    }

    get isChild() {
        return this.parentItem !== null;
    }

    get effects() {
        if (this.proxy !== undefined) {
            const effects = new Collection(super.effects.entries());
            this.proxy.effects.forEach(effect => {
                effects.set(effect.id, effect);
            });
            return effects;
        } else {
            return super.effects;
        }
    }

    async update(data = {}, context = {}) {
        if (this.isChild) {
            const update = this.parentItem.update({
                [`data.children.${this.id}`]: data
            });

            update.then(parent => {
                const child = this.parentItem.data.data.children[this.id];
                mergeObject(this.data._source, child);
                mergeObject(this.data, child);
            });

            return update;
        } else {
            return super.update(data, context);
        }
    }

    get uuid() {
        if (!this.isChild) {
            return super.uuid;
        } else {
            return this.parentItem.uuid + '.@' + super.uuid;
        }
    }

    get children() {
        if (this.data.data.children === undefined)
            return;

        const map = new Collection();
        Object.entries(this.data.data.children).forEach(([key, value]) => {
            map.set(key, this.getEmbeddedDocument('@' + value.documentName, key));
        });

        return map;
    }


    get isOwner() {
        if (!this.isChild) {
            return this.testUserPermission(game.user, "OWNER");
        }

        return this.parentItem.testUserPermission(game.user, "OWNER");
    }

    async delete() {
        if (this.isChild)
            await this.parentItem.update({ [`data.children.-=${this.id}`]: null });
        try {
            super.delete();
        } catch (err) { }
    }

    getEmbeddedDocument(embeddedName, embeddedId) {
        if (embeddedName.startsWith('@')) {
            if (this.data.data.children === undefined)
                return;

            const child_data = this.data.data.children[embeddedId];
            if (child_data === undefined)
                return undefined;
            const documentName = embeddedName.slice(1) || child_data.documentName;
            return new CONFIG[documentName].documentClass(child_data, {
                parentItem: this
            });
        } else {
            return super.getEmbeddedDocument(embeddedName, embeddedId);
        }
    }
}

HeartItem.proxies = {};


function ItemSheetFactory(data) {
    const safe_data = Object.freeze({ ...data });
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
        if (module.default !== undefined) {
            Sheet = module.default;
        } else if (data.sheet instanceof ItemSheet) {
            Sheet = data.sheet
        } else {
            Sheet = ItemSheetFactory(data);
        }

        const type = Sheet.type;

        console.log(`heart | -- Registering ${type} sheet`);
        if (game.heart.items === undefined) {
            game.heart.items = {}
        }

        if (game.heart.items[type] === undefined) {
            game.heart.items[type] = {}
        }

        game.heart.items[type].sheet = Sheet
        if (module.initialise) {
            module.initialise();
        }

        if (type === 'base') return;

        CONFIG.Item.typeLabels[type] = `heart.${type}.label-single`;
        Items.registerSheet('heart', Sheet, {
            types: [type],
            makeDefault: true,
            label: `heart.${type}.label-single`
        });
    });

    proxies.forEach(function (module) {
        Object.entries(module.default).forEach(([type, proxy]) => {
            HeartItem.proxies[type] = proxy;
        });
    });
}