import sheetHTML from './sheet.html';
import HeartSheetMixin from '../../common/sheet';
import './preview.sass';

const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class HeartItemSheet extends HeartSheetMixin(HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)) {
    static get type() { return 'base'; }

    static DEFAULT_OPTIONS = {
        classes: ["heart", "sheet", "item"],
        actions: {
            "add-child": HeartItemSheet._onAddChild,
            view: HeartItemSheet._onView,
            "delete": HeartItemSheet._onDelete,
            activate: HeartItemSheet._onActivate,
            deactivate: HeartItemSheet._onDeactivate,
            complete: HeartItemSheet._onComplete,
            uncomplete: HeartItemSheet._onUncomplete,
            "toggle-boolean": HeartItemSheet._onToggleBoolean,
        },
        form: {
            submitOnChange: true,
        },
        window: {
            resizable: true,
        },
        dragDrop: [{ dragSelector: ".item", dropSelector: null }],
    };

    static PARTS = {
        main: { template: sheetHTML.path, scrollable: [".heart.sheet"] },
    };

    get default_img() {
        return 'icons/svg/item-bag.svg';
    }

    get img() {
        return this.default_img;
    }

    get children() {
        return this.document.children;
    }

    get childrenTypes() {
        return this.document.children?.reduce((map, value) => {
            if (map[value.type] === undefined) {
                map[value.type] = [value];
            } else {
                map[value.type].push(value);
            }

            return map;
        }, {});
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.user = game.user;

        context.die_sizes = game.heart.die_sizes.reduce((map, die) => {
            map[die] = game.i18n.format('heart.die_size.d(N)', { N: die.replace(/^d/, '') })
            return map;
        }, {});

        context.skills = game.heart.skills.reduce((map, skill) => {
            map[skill] = game.i18n.localize(`heart.skill.${skill}`)
            return map;
        }, {});

        context.domains = game.heart.domains.reduce((map, domain) => {
            map[domain] = game.i18n.localize(`heart.domain.${domain}`)
            return map;
        }, {});

        context.equipment_types = game.heart.equipment_types.reduce((map, equipment_type) => {
            map[equipment_type] = game.i18n.localize(`heart.equipment.type.${equipment_type}`)
            return map;
        }, {});

        context.resistances = game.heart.resistances.reduce((map, resistance) => {
            map[resistance] = game.i18n.localize(`heart.resistance.${resistance}`)
            return map;
        }, {});

        context.beat_levels = game.heart.beat_levels.reduce((map, beat_level) => {
            map[beat_level] = game.i18n.localize(`heart.beat.level.${beat_level}`)
            return map;
        }, {});

        context.fallout_levels = game.heart.fallout_levels.reduce((map, fallout_level) => {
            map[fallout_level] = game.i18n.localize(`heart.fallout.level.${fallout_level}`)
            return map;
        }, {});

        context.children = this.children;
        context.childrenTypes = this.childrenTypes;
        context.system = this.document.system;
        context.type = this.document.type;
        context.editable = this.isEditable;
        context.owner = this.document.isOwner;
        context.item = this.document;

        return context;
    }

    static _onToggleBoolean(event, target) {
        event.preventDefault();
        const path = target.dataset.path;
        const current = foundry.utils.getProperty(this.document, path);
        this.document.update({ [path]: !current });
    }

    static _onAddChild(event, target) {
        event.preventDefault();
        const documentName = target.dataset.documentName || 'Item';
        const type = target.dataset.type;
        let itemData = {};
        try {
            itemData = JSON.parse(target.dataset.data || '{}');
        } catch (e) {
            itemData = {};
        }

        const data = { documentName, type: type, name: `New ${type}`, system: itemData };
        this.document.addChildren([data]);
    }

    static async _onView(event, target) {
        event.preventDefault();
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        item.sheet.render(true);
    }

    static async _onDelete(event, target) {
        event.preventDefault();
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        if (item === null) return;
        await item.deleteDialog();
    }

    static async _onActivate(event, target) {
        event.preventDefault();
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        await item.update({ 'system.active': true });
        this.render(true);
    }

    static async _onDeactivate(event, target) {
        event.preventDefault();
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        await item.update({ 'system.active': false });
        this.render(true);
    }

    static async _onComplete(event, target) {
        event.preventDefault();
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        await item.update({ 'system.complete': true });
        this.render(true);
    }

    static async _onUncomplete(event, target) {
        event.preventDefault();
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        await item.update({ 'system.complete': false });
        this.render(true);
    }

    async _onDrop(event) {
        // Try to extract the data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return false;
        }

        // Handle the drop with a Hooked function
        const allowed = Hooks.call("dropItemSheetData", this.document, this, data);
        if (allowed === false) return;

        // Handle different data types
        switch (data.type) {
            case "Item":
                data.documentName = 'Item';
                return this._onDropItem(event, data);
        }
    }

    async _onDropItem(event, data) {
        if (!this.document.isOwner) return false;
        const item = await Item.implementation.fromDropData(data);

        if (!this._canDragDropItem(item)) {
            return;
        }

        const itemData = item.toObject();
        itemData.documentName = 'Item';

        const parentItem = this.document;
        let sameActor = (data.parentItemId === parentItem.id);
        if (sameActor) return;

        return parentItem.addChildren([itemData]);
    }

    async _canDragDropItem(item) {
        return false;
    }

    async _onDragStart(event) {
        const li = event.currentTarget;
        if (event.target.classList.contains("content-link")) return;

        let dragData = {
            parentItemId: this.document.id,
            uuid: event.target.dataset.documentId,
            type: "Item"
        };

        // Owned Items
        if (dragData.uuid.startsWith('Compendium')) {
            const item = await fromUuid(li.dataset.itemId);
            dragData.data = item.toObject();
            // Delete _id so that when dropped in Item panel Foundry knows to create a new item.
            delete dragData.data._id;
            delete dragData.uuid;
        }

        // Set data transfer
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
}
