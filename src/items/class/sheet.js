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

    get template() {
        return data.template;
    }

    get img() {
        return data.img;
    }

    getData() {
        const data = super.getData();        
        data.coreAbilities = this.item.children.filter(x => x.type === 'ability' && x.system.type === 'core');
        data.minorAbilities = this.item.children.filter(x => x.type === 'ability' && x.system.type === 'minor');
        data.majorAbilities = this.item.children.filter(x => x.type === 'ability' && x.system.type === 'major');
        data.zenithAbilities = this.item.children.filter(x => x.type === 'ability' && x.system.type === 'zenith');
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('[data-action=add-equipment-group]').click(ev => {
            const id = randomID();
            const groups = this.item.system.equipment_groups || [];
            groups.push(id);
            return this.item.update({'system.equipment_groups': groups});
        });

        html.find('[data-group-id] [data-action=delete-equipment-group]').click(async ev => {
            const target = $(ev.currentTarget);
            const groupId = target.closest('[data-group-id]').data('groupId');
            const groups = this.item.system.equipment_groups.filter(x => x !== groupId);

            const ids = this.item.children.filter(x => x.type === 'equipment' && x.system.group === groupId).map(item => item.id);
            Dialog.confirm({
              title: 'Confirm Deletion',
              content: 'Are you sure you want to delete this equipment group? It cannot be recovered.',
              yes: () => {
                this.item.deleteChildren(ids);
                this.render();
                return this.item.update({'system.equipment_groups': groups});
              }
            });

        });

        html.find('[data-group-id] [data-action=activate-group]').click(async ev => {
            const target = $(ev.currentTarget);
            const groupId = target.closest('[data-group-id]').data('groupId');
            const activeGroupId = this.item.system.active_equipment_group;
            
            const childrenUpdates = {};

            const previousEquipmentGroups = [...this.item.system.active_equipment_groups];
            let activeEquipmentGroups = this.item.system.active_equipment_groups;
            if (groupId === "core" && activeEquipmentGroups.find(g => g === "core") === undefined) {
                activeEquipmentGroups.push('core');
            }

            if (groupId !== "core" && activeEquipmentGroups.find(g => g === groupId) === undefined) {
                activeEquipmentGroups = activeEquipmentGroups.filter(g => g === "core");
                activeEquipmentGroups.push(groupId);
            }

            await this.item.update({'system.active_equipment_groups': activeEquipmentGroups});

            this.item.children.filter(x => x.type === 'equipment').forEach(async child => {
                if(previousEquipmentGroups.includes(child.system.group) && !activeEquipmentGroups.includes(child.system.group)) {
                    childrenUpdates[`${child.id}.system.active`] = false;
                }

                if(activeEquipmentGroups.includes(child.system.group)) {
                    childrenUpdates[`${child.id}.system.active`] = true;
                }
            });

            await this.item.updateChildren(childrenUpdates);
        });

        html.find('[data-group-id] [data-action=deactivate-group]').click(async ev => {
            const target = $(ev.currentTarget);
            const groupId = target.closest('[data-group-id]').data('groupId');

            const childrenUpdates = {};
            this.item.children.filter(x => x.type === 'equipment').forEach(async child => {
                if(child.system.group === groupId) {
                    childrenUpdates[`${child.id}.system.active`] = false;
                }
            });

            await this.item.updateChildren(childrenUpdates);
            const activeEquipmentGroups = this.item.system.active_equipment_groups.filter(g => g !== groupId);
            await this.item.update({'system.active_equipment_groups': activeEquipmentGroups});
        });
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