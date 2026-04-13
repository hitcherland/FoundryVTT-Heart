import sheetHTML from './sheet.html';
import templateJSON from './template.json';
import HeartItemSheet from '../base/sheet';

import './sheet.sass';

const data = Object.freeze({
    type: Object.keys(templateJSON.Item)[0],
    img: 'systems/heart/assets/drum.svg',
    template: sheetHTML.path,
});

export default class extends HeartItemSheet {
    static get type() { return data.type; }

    static DEFAULT_OPTIONS = {
        actions: {
            "add-equipment-group": this._onAddEquipmentGroup,
            "delete-equipment-group": this._onDeleteEquipmentGroup,
            "activate-group": this._onActivateGroup,
            "deactivate-group": this._onDeactivateGroup,
        },
    };

    static PARTS = {
        main: { template: data.template, scrollable: [".heart.sheet"] },
    };

    get img() {
        return data.img;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.coreAbilities = this.document.children.filter(x => x.type === 'ability' && x.system.type === 'core');
        context.minorAbilities = this.document.children.filter(x => x.type === 'ability' && x.system.type === 'minor');
        context.majorAbilities = this.document.children.filter(x => x.type === 'ability' && x.system.type === 'major');
        context.zenithAbilities = this.document.children.filter(x => x.type === 'ability' && x.system.type === 'zenith');
        return context;
    }

    static _onAddEquipmentGroup(event, target) {
        event.preventDefault();
        const id = foundry.utils.randomID();
        const groups = this.document.system.equipment_groups || [];
        groups.push(id);
        return this.document.update({'system.equipment_groups': groups});
    }

    static async _onDeleteEquipmentGroup(event, target) {
        event.preventDefault();
        const groupId = target.closest('[data-group-id]').dataset.groupId;
        const groups = this.document.system.equipment_groups.filter(x => x !== groupId);

        const ids = this.document.children.filter(x => x.type === 'equipment' && x.system.group === groupId).map(item => item.id);
        foundry.applications.api.DialogV2.confirm({
            window: { title: 'Confirm Deletion' },
            content: 'Are you sure you want to delete this equipment group? It cannot be recovered.',
            yes: { callback: () => {
                this.document.deleteChildren(ids);
                this.render();
                return this.document.update({'system.equipment_groups': groups});
            }}
        });
    }

    static async _onActivateGroup(event, target) {
        event.preventDefault();
        const groupId = target.closest('[data-group-id]').dataset.groupId;

        const childrenUpdates = {};

        const previousEquipmentGroups = [...this.document.system.active_equipment_groups];
        let activeEquipmentGroups = this.document.system.active_equipment_groups;
        if (groupId === "core" && activeEquipmentGroups.find(g => g === "core") === undefined) {
            activeEquipmentGroups.push('core');
        }

        if (groupId !== "core" && activeEquipmentGroups.find(g => g === groupId) === undefined) {
            activeEquipmentGroups = activeEquipmentGroups.filter(g => g === "core");
            activeEquipmentGroups.push(groupId);
        }

        await this.document.update({'system.active_equipment_groups': activeEquipmentGroups});

        this.document.children.filter(x => x.type === 'equipment').forEach(async child => {
            if(previousEquipmentGroups.includes(child.system.group) && !activeEquipmentGroups.includes(child.system.group)) {
                childrenUpdates[`${child.id}.system.active`] = false;
            }

            if(activeEquipmentGroups.includes(child.system.group)) {
                childrenUpdates[`${child.id}.system.active`] = true;
            }
        });

        await this.document.updateChildren(childrenUpdates);
    }

    static async _onDeactivateGroup(event, target) {
        event.preventDefault();
        const groupId = target.closest('[data-group-id]').dataset.groupId;

        const childrenUpdates = {};
        this.document.children.filter(x => x.type === 'equipment').forEach(async child => {
            if(child.system.group === groupId) {
                childrenUpdates[`${child.id}.system.active`] = false;
            }
        });

        await this.document.updateChildren(childrenUpdates);
        const activeEquipmentGroups = this.document.system.active_equipment_groups.filter(g => g !== groupId);
        await this.document.update({'system.active_equipment_groups': activeEquipmentGroups});
    }

    async _canDragDropItem(item) {
        if(item.type === 'ability' && item.type === undefined) {
            await item.update({'system.type': 'core'});
        }

        return ['ability', 'resource', 'equipment'].includes(item.type);
    }
}

export {
    data
}
