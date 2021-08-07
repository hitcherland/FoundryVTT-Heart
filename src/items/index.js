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

        this.children;
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
        if (this.proxy !== undefined && this.proxy.effects !== undefined) {
            const effects = new Collection(super.effects.entries());
            this.proxy.effects.forEach(effect => {
                effects.set(effect.id, effect);
            });
            return effects;
        } else {
            return super.effects;
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
        if (this._children !== undefined)
            return this._children;

        if (this.data.data.children === undefined) {
            if (game.system.model.Item[this.type].children !== undefined) {
                return new Collection();
            } else {
                return
            }
        }

        const map = new Collection();
        Object.entries(this.data.data.children).forEach(([key, data]) => {
            let documentName = data.documentName;
            const child = new CONFIG[documentName ?? 'Item'].documentClass(data, {
                parentItem: this
            });

            map.set(key, child);
        });

        this._children = map;

        return map;
    }

    get childrenTypes() {
        return this.children.reduce((map, child) => {
            if (map[child.type] === undefined)
                map[child.type] = [];

            map[child.type].push(child);
            return map;
        }, {});
    }

    get isOwner() {
        if (!this.isChild) {
            return this.testUserPermission(game.user, "OWNER");
        }

        return this.parentItem.testUserPermission(game.user, "OWNER");
    }

    async update(data = {}, context = {}) {
        if (this.isChild) {
            await this.parentItem.updateChildren({ [`${this.id}`]: data }, context);
        } else {
            return await super.update(data, context);
        }
    }

    async addChildren(datas=[]) {
        const update = {};
        datas.forEach(data => {
            const id = randomID();
            data._id = id;

            const child = new CONFIG[data.documentName].documentClass(data, {
                parentItem: this
            });
            
            const childData = child.toObject();
            childData.documentName = data.documentName;
            update[id] = childData;
            this.children.set(id, child);
        });

        return await this.update(flattenObject({'data.children': update}));
    }

    async refreshChildren() {
        if (this.children === undefined || this.children.size === 0) return;

        await Promise.all(this.children.map(async (child) => {
            mergeObject(child.data._source, this.data.data.children[child.id]);
            child.prepareData();

            if (child.children?.size ?? 0 >= 0) {
                child.refreshChildren();
            }

            if (child.sheet.rendered)
                await child.sheet.render();
        }));
    }

    async updateChildren(data = {}, context = {}) {
        const ctx = { ...context, render: false };
        const updates = await this.update({ 'data.children': data }, ctx);
        if (updates === undefined) return;

        this.refreshChildren();

        if (this.sheet.rendered)
            await this.sheet.render(true);
        
        if(this.isEmbedded && this.parent.sheet.rendered)
            await this.parent.sheet.render(true);
            
        return updates;
    }

    async delete() {
        if (this.isChild) {
            if (this.sheet.rendered)
                await this.sheet.close()

            await this.parentItem.deleteChildren([this.id]);
        } else
            return super.delete();
    }

    async deleteChildren(ids) {
        if (this.data.data.children === undefined) return;

        const updates = {};
        ids.forEach(id => {
            this.children.delete(id);
            updates[`data.children.-=${id}`] = null
        });
        return await this.update(updates);
    }

    getEmbeddedDocument(embeddedName, embeddedId) {
        if (embeddedName.startsWith('@')) {
            if (this.data.data.children === undefined)
                return;

            return this.children.get(embeddedId);
        } else {
            return super.getEmbeddedDocument(embeddedName, embeddedId);
        }
    }

    get permission() {
        if (this.isChild) return this.parentItem.permission;
        return super.permission;
    }

    testUserPermission(user, permission, { exact = false } = {}) {
        if (this.isChild) return this.parentItem.testUserPermission(user, permission, { exact });
        return super.testUserPermission(user, permission, { exact });
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