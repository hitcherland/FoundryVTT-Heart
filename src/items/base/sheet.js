import sheetHTML from './sheet.html';
import HeartSheetMixin from '../../common/sheet';
import './preview.sass';

export default class HeartItemSheet extends HeartSheetMixin(ItemSheet) {
    static get type() { return 'base'; }

    static get defaultOptions() {
        const defaultOptions = super.defaultOptions;
        return mergeObject(defaultOptions, {
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

            const data = {documentName, type: type, name: `New ${type}`, system: itemData };
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
            map[die] = game.i18n.format('heart.die_size.d(N)', { N: die.replace(/^d/, '') })
            return map;
        }, {});

        data.skills = game.heart.skills.reduce((map, skill) => {
            map[skill] = game.i18n.localize(`heart.skill.${skill}`)
            return map;
        }, {});

        data.domains = game.heart.domains.reduce((map, domain) => {
            map[domain] = game.i18n.localize(`heart.domain.${domain}`)
            return map;
        }, {});

        data.equipment_types = game.heart.equipment_types.reduce((map, equipment_type) => {
            map[equipment_type] = game.i18n.localize(`heart.equipment.type.${equipment_type}`)
            return map;
        }, {});

        data.resistances = game.heart.resistances.reduce((map, resistance) => {
            map[resistance] = game.i18n.localize(`heart.resistance.${resistance}`)
            return map;
        }, {});

        data.beat_levels = game.heart.beat_levels.reduce((map, beat_level) => {
          map[beat_level] = game.i18n.localize(`heart.beat.level.${beat_level}`)
          return map;
      }, {});

        data.children = this.children;
        data.childrenTypes = this.childrenTypes;
        data.system = this.item.system;

        return data;
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
        const allowed = Hooks.call("dropItemSheetData", this.item, this, data);
        if (allowed === false) return;

        // Handle different data types
        switch (data.type) {
            case "Item":
                data.documentName = 'Item';
                return this._onDropItem(event, data);
        }
    }

    async _onDropItem(event, data) {
        if (!this.item.isOwner) return false;
        const item = await Item.implementation.fromDropData(data);
        
        if(!this._canDragDropItem(item)) {
            return;
        }

        const itemData = item.toObject();
        itemData.documentName = 'Item';

        const parentItem = this.item;
        let sameActor = (data.parentItemId === parentItem.id);
        if (sameActor) return;

        return parentItem.addChildren([itemData]);
    }

    async _canDragDropItem(item) {
        return false;
    }

    async _onDragStart(event) {
        const li = event.currentTarget;
        if (event.target.classList.contains("entity-link")) return;

        // Create drag data
        let dragData = {
            parentItemId: this.item.id
        };

        // Owned Items
        if (li.dataset.itemId) {
            const item = await fromUuid(li.dataset.itemId);
            dragData.type = "Item";
            dragData.data = item.toObject();
            // Delete _id so that when dropped in Item panel Foundry knows to create a new item.
            delete dragData.data._id;
        }

        // Set data transfer
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
}