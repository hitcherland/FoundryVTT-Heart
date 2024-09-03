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

    get heart_effects() {
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

        if (this.system.children === undefined) {
            if (game.model.Item[this.type].children !== undefined) {
                return new Collection();
            } else {
                return
            }
        }

        const map = new Collection();
        Object.entries(this.system.children).forEach(([key, data]) => {
            let documentName = data.documentName;
            if (!documentName) {
                documentName = 'Item'
            }
            const child = new CONFIG[documentName].documentClass(data, {
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

    _onUpdate(data, options, userId) {
        // Refresh the "item.children" compendium and re-render any
        // documents when we update them
        super._onUpdate(data, options, userId);
        if (data.system && data.system.children) {
            this.refreshChildren();
        }
    }

    async update(data = {}, context = {}) {
        if (this.isChild) {
            await this.parentItem.updateChildren({
                [`${this.id}`]: data
            }, context);
            return this;
        } else {
            return await super.update(data, context);
        }
    }

    // required for dragging/dropping of nested-children
    updateSource(changes = {}, options = {}) {
        if (this.isChild && options.force !== true) {
            this.parentItem.updateChildren({
                [`${this.id}`]: changes
            }, options);
            return {};
        } else {
            return super.updateSource(changes, options);
        }
    }

    _addChild(data) {
        let class_;
        if (Item.TYPES.includes(data.type)) {
            class_ = CONFIG.Item.documentClass;
        } else {
            class_ = CONFIG.Actor.documentClass;
        }

        const child = new class_(data, {
            parentItem: this
        });

        const id = child.id;
        this.children.set(id, child);
        return child;
    }

    async addChildren(datas = []) {
        const update = {};
        datas.forEach(data => {
            const id = foundry.utils.randomID();
            data._id = id;
            const child = this._addChild(data);
            const childData = child.toObject();
            childData.documentName = data.documentName;
            update[child.id] = childData;
        });

        return this.update(flattenObject({
            'system.children': update
        }), {
            render: true
        });
    }

    async refreshChildren() {
        if (this.system.children === undefined) return;
        Object.entries(this.system.children).forEach(([id, data]) => {
            if (this.children.has(id)) {
                const child = this.children.get(id);
                child.updateSource(this.system.children[child.id], {force: true});
                child.prepareData();

                if (child.children && child.children.size && child.children.size >=0) {
                    child.refreshChildren();
                }

                if (child.sheet.rendered) {
                    child.sheet.render();
                }
            } else {
                this._addChild(data);
            }
        });

        this.children.forEach(child => {
            if (this.system.children[child.id] === undefined) {
                this._deleteChild(child.id);
            }
        })

        if (this.sheet.rendered) {
            this.sheet.render();
        }
    }

    async updateChildren(data = {}, context = {}) {
        return await this.update({
            'system.children': data
        }, context);
    }

    async delete() {
        if (this.isChild) {
            if (this.sheet.rendered)
                await this.sheet.close()

            await this.parentItem.deleteChildren([this.id]);
        } else
            return super.delete();
    }

    _deleteChild(id) {
        const child = this.children.get(id)
        child.sheet.close();
        this.children.delete(id);
    }
    async deleteChildren(ids) {
        if (this.system.children === undefined) return;

        const updates = {};
        ids.forEach(id => {
            this._deleteChild(id);
            updates[`system.children.-=${id}`] = null
        });

        return this.update(updates);
    }

    getEmbeddedDocument(embeddedName, embeddedId) {
        if (embeddedName.startsWith('@')) {
            if (this.system.children === undefined)
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

    testUserPermission(user, permission, {
        exact = false
    } = {}) {
        if (this.isChild) return this.parentItem.testUserPermission(user, permission, {
            exact
        });
        return super.testUserPermission(user, permission, {
            exact
        });
    }
}

HeartItem.proxies = {};


function ItemSheetFactory(data) {
    const safe_data = Object.freeze({
        ...data
    });
    const CustomHeartItemSheet = class extends HeartItemSheet {
        static get type() {
            return data.type;
        }

        get template() {
            return safe_data.template;
        }

        get img() {
            return safe_data.img;
        }

        /** @inheritdoc */
        get id() {
            return `${this.constructor.name}-${this.document.uuid.replace(/[\.@]/g, "-")}`;
        }
    };
    return CustomHeartItemSheet;
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

if (process.env.NODE_ENV !== 'production') {
    async function simulateDragDrop(dragstart, dragTarget, drop, dropTarget) {
        const dataTransfer = new DataTransfer();

        await dragstart({
            dataTransfer,
            currentTarget: dragTarget,
            target: dragTarget
        });

        return await drop({
            dataTransfer,
            currentTarget: dropTarget,
            target: dropTarget
        });
    }

    function simulateDropOntoTarget(data, target) {
        const dataTransfer = new DataTransfer();
        dataTransfer.setData("text/plain", JSON.stringify(data));
        const event = new DragEvent("drop", {
            dataTransfer,
            target,
        });

        target.dispatchEvent(event);
    }

    function simulateDragFromTarget(target) {
        const dataTransfer = new DataTransfer();
        const event = new DragEvent("dragstart", {
            dataTransfer
        });

        target.dispatchEvent(event);
        return event;
    }

    function waitForElement(selector) {
        return new Promise(resolve => {
            const target = document.body;
            if (target.querySelector(selector)) {
                return resolve(target.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (target.querySelector(selector)) {
                    observer.disconnect();
                    resolve(target.querySelector(selector));
                }
            });

            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(target, {
                childList: true,
                subtree: true
            });
        });
    }

    class Draggable {
        constructor(name, data) {
            this.data = data;
            this.name = name;
        }

        async setup() {};
        async teardown() {};
    }

    class DraggableItem extends Draggable {
        async setup() {
            this.item = await Item.create(this.data);
            this.target = await waitForElement(`[data-document-id="${this.item.id}"]`);
            this.dragstart = ui.items._dragDrop[0].callbacks.dragstart;
            return this.item;
        }

        async teardown() {
            await this.item.delete();
            this.item = undefined;
            return;
        }
    }

    class DraggableCompendiumItem extends Draggable {
        async setup() {
            this.compendium = await CompendiumCollection.createCompendium({
                label: 'test-compendium',
                type: 'Item'
            });
            this.item = await Item.create({
                ...this.data,
                name: foundry.utils.randomID()
            }, {
                pack: this.compendium.metadata.id
            });

            await this.compendium.render(true);
            this.dragstart = this.compendium.apps[0]._dragDrop[0].callbacks.dragstart;
            this.target = await waitForElement(`[data-document-id="${this.item.id}"]`);
        }

        async teardown() {
            await this.compendium.apps[0].close();
            await this.item.delete();
            await this.compendium.deleteCompendium();
            const clone = game.items.find((doc) => doc.name === this.item.name);
            if (clone) {
                await clone.delete();
            }

            this.item = undefined;
            this.compendium = undefined;
            return;
        }
    }

    class DraggableLockedCompendiumItem extends DraggableCompendiumItem {
        async setup() {
            await super.setup();
            await this.compendium.configure({
                locked: true
            });
            return this.item;
        }

        async teardown() {
            await this.compendium.configure({
                locked: true
            });
            await super.teardown();
        }
    }

    class Droppable {
        constructor(name, data) {
            this.data = data;
            this.name = name;
        }

        async setup() {}
        async teardown() {}
    }

    class DroppableTab extends Droppable {
        async setup() {
            await this.data.tab.activate();
            this.target = this.data.tab.element.get(0);
            this.drop = this.data.tab._dragDrop[0].callbacks.drop;
            this.collection = this.data.tab.collection;
            this.expectedFolder = undefined;
            return this.target;
        }
    }

    class DroppableTabFolder extends DroppableTab {
        async setup() {
            await super.setup();
            this.folder = await Folder.create({
                name: "test-folder",
                type: "Item",
            });
            this.expectedFolder = this.folder.id;

            await waitForElement(`[data-folder-id="${this.folder.id}"]`);
            this.target = this.data.tab.element.find(`[data-folder-id="${this.folder.id}"]`).get(0);
            return this.target;
        }

        async teardown() {
            await this.folder.delete();
            this.folder = undefined;
            this.expectedFolder = undefined;
            await super.teardown();
        }
    }

    class DragDropTest {
        constructor(draggable, droppable, expectations = {
            success: true
        }) {
            this.name = `drag ${draggable.name} onto ${droppable.name}`;
            this.draggable = draggable;
            this.droppable = droppable;
            this.expectations = expectations;
        }
    }

    Hooks.once("quenchReady", (quench) => {
        quench.registerBatch(
            "dragging_and_dropping",
            (ctx) => {
                const {
                    describe,
                    it,
                    assert,
                    beforeEach,
                    afterEach,
                } = ctx;

                const draggables = {
                    WorldItem: new DraggableItem("world-item", {
                        name: 'test-item',
                        type: 'equipment'
                    }),
                    CompendiumItem: new DraggableCompendiumItem("compendium-item", {
                        name: 'test-item',
                        type: 'equipment'
                    }),
                    LockedCompendiumItem: new DraggableLockedCompendiumItem("locked-compendium-item", {
                        name: 'test-item',
                        type: 'equipment'
                    })
                };

                const droppables = {
                    ItemTab: new DroppableTab("item-tab", {
                        tab: ui.items
                    }),
                    FolderInItemTab: new DroppableTabFolder("folder-in-item-tab", {
                        tab: ui.items
                    })
                };

                const tests = [
                    new DragDropTest(draggables.WorldItem, droppables.ItemTab),
                    new DragDropTest(draggables.WorldItem, droppables.FolderInItemTab),
                    new DragDropTest(draggables.CompendiumItem, droppables.ItemTab, {
                        success: true,
                        makeCopy: true
                    }),
                    new DragDropTest(draggables.CompendiumItem, droppables.FolderInItemTab, {
                        success: true,
                        makeCopy: true
                    }),
                ];

                tests.forEach(test => {
                    describe(test.name, () => {
                        const draggable = test.draggable;
                        const droppable = test.droppable;
                        const expectations = test.expectations;
                        let output;

                        beforeEach("setup", async () => {
                            await draggable.setup();
                            await droppable.setup();
                        });

                        afterEach("teardown", async () => {
                            await draggable.teardown();
                            await droppable.teardown();
                            if (output && output._id !== null) {
                                await output.delete();
                            }
                        });

                        if (expectations.success) {
                            it(`drag should drop`, async () => {
                                output = await simulateDragDrop(
                                    draggable.dragstart,
                                    draggable.target,
                                    droppable.drop,
                                    droppable.target
                                );

                                if (expectations.makeCopy) {
                                    // This assumes you've used randomID() to create a fairly unique name
                                    assert.include(droppable.collection.map(x => x.name), draggable.item.name);
                                    assert.equal(droppable.collection.find(x => x.name === draggable.item.name).folder, droppable.folder);
                                } else {
                                    assert.include(droppable.collection, draggable.item);
                                    assert.equal(draggable.item.folder, droppable.folder);
                                }

                            });
                        } else {
                            it(`drag should not drop`, async () => {
                                simulateDropOntoTarget(draggable.item.toDragData(), droppable.target().get(0));
                                assert.notInclude(droppable.collection, draggable.item);
                                assert.notEqual(draggable.item.folder, droppable.folder);
                            });
                        }
                    });
                })
            }
        );
    });
}