import sheetHTML from './sheet.html';
import HeartSheetMixin from '../../common/sheet';
import './preview.sass';

export default class HeartItemSheet extends HeartSheetMixin(ItemSheet) {
    static get type() { return 'base'; }

    static get defaultOptions() {
        const defaultOptions = super.defaultOptions;
        return foundry.utils.mergeObject(defaultOptions, {
            dragDrop: defaultOptions.dragDrop.concat([{ dragSelector: ".item", dropSelector: null }])
        });
    }

    get template() {
        return sheetHTML.path;
    }

    get default_img() {
        return 'icons/svg/item-bag.svg';
    }

    get img() {
        return this.default_img;
    }

    get children() {
        return this.item.children;
    }

    get childrenTypes() {
        return this.item.children?.reduce((map, value) => {
            if (map[value.type] === undefined) {
                map[value.type] = [value];
            } else {
                map[value.type].push(value);
            }
            return map;
        }, {});
    }

    activateListeners(html) {
       
        super.activateListeners(html);

        html.find('[data-action=add-child][data-type]').click(ev => {
            const target = $(ev.currentTarget);
            const documentName = target.data('document-name') || 'Item';
            const type = target.data('type');
            let itemData = target.data('data') || {};

            const data = { documentName, type: type, name: `New ${type}`, system: itemData };
            this.item.addChildren([data]);
        });

        html.find('[data-item-id] [data-action=view]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.sheet.render(true);
        });

        html.find('[data-item-id] [data-action=delete]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            if(item === null) return;
            await item.deleteDialog();
        });

        html.find('[data-item-id] [data-action=activate]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            await item.update({ 'system.active': true });
            this.render(true);
        });

        html.find('[data-item-id] [data-action=deactivate]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            await item.update({ 'system.active': false });
            this.render(true);
        });

        html.find('[data-item-id] [data-action=complete]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            await item.update({ 'system.complete': true });
            this.render(true);
        });

        html.find('[data-item-id] [data-action=uncomplete]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            await item.update({ 'system.complete': false });
            this.render(true);
        });
    }

    getData() {
        const data = super.getData();
        data.user = game.user;

        data.die_sizes = game.heart.die_sizes.reduce((map, die) => {
            map[die] = game.i18n.format('heart.die_size.d(N)', { N: die.replace(/^d/, '') });
            return map;
        }, {});

        data.skills = game.heart.skills.reduce((map, skill) => {
            map[skill] = game.i18n.localize(`heart.skill.${skill}`);
            return map;
        }, {});

        data.domains = game.heart.domains.reduce((map, domain) => {
            map[domain] = game.i18n.localize(`heart.domain.${domain}`);
            return map;
        }, {});

        data.equipment_types = game.heart.equipment_types.reduce((map, equipment_type) => {
            map[equipment_type] = game.i18n.localize(`heart.equipment.type.${equipment_type}`);
            return map;
        }, {});

        data.resistances = game.heart.resistances.reduce((map, resistance) => {
            map[resistance] = game.i18n.localize(`heart.resistance.${resistance}`);
            return map;
        }, {});

        data.beat_levels = game.heart.beat_levels.reduce((map, beat_level) => {
          map[beat_level] = game.i18n.localize(`heart.beat.level.${beat_level}`);
          return map;
        }, {});

        data.fallout_levels = game.heart.fallout_levels.reduce((map, fallout_level) => {
          map[fallout_level] = game.i18n.localize(`heart.fallout.level.${fallout_level}`);
          return map;
        }, {});

        data.children = this.children;
        data.childrenTypes = this.childrenTypes;
        data.system = this.item.system;

        return data;
    }

    async _onDrop(event) {
        console.log("=== _onDrop triggered ===");
        
        // Try to extract the data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
            console.log("Extracted drop data:", data);
        } catch (err) {
            console.error("Error parsing drop data:", err);
            return false;
        }

        // Handle the drop with a Hooked function
        const allowed = Hooks.call("dropItemSheetData", this.item, this, data);
        console.log("Hooks result for dropItemSheetData:", allowed);
        if (allowed === false) {
            console.log("Drop prevented by hook");
            return;
        }

        // Handle different data types
        switch (data.type) {
            case "Item":
                console.log("Dropped data type: Item");
                data.documentName = 'Item';
                return this._onDropItem(event, data);
            default:
                console.warn("Dropped data type not handled:", data.type);
        }
    }

    async _onDropItem(event, data) {
        console.log("=== _onDropItem triggered ===");
        console.log("Data received for drop:", data);

        if (!this.item.isOwner) {
            console.warn("Current user is not the owner of the item; drop not allowed.");
            return false;
        }

        const item = await Item.implementation.fromDropData(data);
        console.log("Item created from drop data:", item);

        if (!this._canDragDropItem(item)) {
            console.warn("Drag drop not allowed for item:", item);
            return;
        }

        if(item.parent == null) {
            console.log("Item has no parent; not duplicating on drop.");
            return;
        }

        const itemData = item.toObject();
        console.log("Item data object:", itemData);
        itemData.documentName = 'Item';

        const parentItem = this.item;
        let sameActor = (data.parentItemId === parentItem.id);
        console.log("Same actor check:", sameActor);
        if (sameActor) {
            console.log("Dropped item belongs to the same actor; skipping duplicate.");
            return;
        }

        console.log("Adding dropped item as a child to parent item:", parentItem.id);
        return parentItem.addChildren([itemData]);
    }

    async _canDragDropItem(item) {
        console.log("Checking if item can be drag-dropped:", item);
        let result = false;
        console.log("_canDragDropItem result:", result);
        return result;
    }

    async _onDragStart(event) {
        console.log("=== _onDragStart triggered ===");
        const li = event.currentTarget;
        if (event.target.classList.contains("entity-link")) {
            console.log("Drag start ignored because target has class 'entity-link'");
            return;
        }

        let dragData = {
            parentItemId: this.item.id,
            uuid: event.target.dataset.documentId,
            type: "Item"
        };

        console.log("Initial dragData:", dragData);

        // Owned Items (Compendium Items)
        if (dragData.uuid.startsWith('Compendium')) {
            console.log("DragData indicates a Compendium item");
            const item = await fromUuid(li.dataset.itemId);
            console.log("Fetched item from Compendium:", item);
            dragData.data = item.toObject();
            // Delete _id so that Foundry creates a new item on drop.
            delete dragData.data._id;
            delete dragData.uuid;
            console.log("Modified dragData for compendium item:", dragData);
        }

        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        console.log("Drag data set on dataTransfer:", dragData);
    }
}
