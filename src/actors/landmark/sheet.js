import sheetHTML from './sheet.html';
import './landmark.sass';
import HeartActorSheet from '../base/sheet';
import template from './template.json';

export default class LandmarkSheet extends HeartActorSheet {
    static DEFAULT_OPTIONS = {
        dragDrop: [{dragSelector: '.item', dropSelector: null}],
        actions: {
            "toggle-checkable": LandmarkSheet._onToggleCheckable,
            "add-child": LandmarkSheet._onAddChild,
            upgrade: LandmarkSheet._onUpgrade,
            downgrade: LandmarkSheet._onDowngrade,
            "add-service": LandmarkSheet._onAddService,
            "delete-service": LandmarkSheet._onDeleteService,
            "service-roll": LandmarkSheet._onServiceRoll,
        },
    };

    static PARTS = {
        main: { template: sheetHTML.path, scrollable: [".heart.sheet"] },
    };

    async _onDropItemCreate(itemData) {
        if (this.actor.type === 'landmark') {
            itemData.system.active = true;
        }

        return super._onDropItemCreate(itemData);
    }

    static get type() { return Object.keys(template.Actor)[0]; }

    get img() {
        return 'systems/heart/assets/monument.svg';
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.showTextboxesBelowItems = game.settings.get('heart', 'showTextboxesBelowItems');
        context.die_sizes = game.heart.die_sizes.reduce((map, die) => {
            map[die] = game.i18n.format('heart.die_size.d(N)', { N: die.replace(/^d/, '') });
            return map;
        }, {});
        context.resistances = game.heart.resistances.reduce((map, resistance) => {
            map[resistance] = game.i18n.localize(`heart.resistance.${resistance}`);
            return map;
        }, {});
        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        this.element.querySelectorAll('[name=service-selector-die]').forEach(el => {
            el.addEventListener('change', async ev => {
                const uuid = ev.currentTarget.closest('[data-item-id]').dataset.itemId;
                const item = await fromUuid(uuid);
                const id = ev.currentTarget.closest('[data-id]').dataset.id;
                item.update({[`system.resistances.${id}`]: {
                    die_size: ev.target.value
                }});
            });
        });

        this.element.querySelectorAll('[name=service-selector-resistance]').forEach(el => {
            el.addEventListener('change', async ev => {
                const uuid = ev.currentTarget.closest('[data-item-id]').dataset.itemId;
                const item = await fromUuid(uuid);
                const id = ev.currentTarget.closest('[data-id]').dataset.id;
                item.update({[`system.resistances.${id}`]: {
                    resistance: ev.target.value
                }});
            });
        });
    }

    static async _onToggleCheckable(event, target) {
        event.preventDefault();
        const index = parseInt(target.dataset.index);
        const parent = target.parentElement;
        const targetPath = parent.dataset.target;
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        const isChecked = target.classList.contains('checked');
        const data = {};
        if (isChecked) {
            if (index + 1 === foundry.utils.getProperty(item, targetPath)) {
                data[targetPath] = index;
            } else {
                data[targetPath] = index + 1;
            }
        } else {
            data[targetPath] = index + 1;
        }
        item.update(data);
    }

    static async _onAddChild(event, target) {
        const documentName = target.dataset.documentName || 'Item';
        const type = target.dataset.type;
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        const itemData = target.dataset.data ? JSON.parse(target.dataset.data) : {};

        const data = { documentName, type: type, name: `New ${type}`, system: itemData };
        item.addChildren([data]);
    }

    static async _onUpgrade(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        const dieSizes = game.heart.die_sizes;
        const services = item.system.resistances;

        const updates = {};
        updates['system.upgradeTrack'] = 0;

        Object.keys(services).forEach(key => {
            var service = services[key];
            var indexOf = dieSizes.indexOf(service.die_size);

            if (indexOf < (dieSizes.length - 1)) {
                var largerSize = dieSizes[indexOf + 1];
                updates[`system.resistances.${key}.die_size`] = largerSize;
            }
        });

        item.update(updates);
    }

    static async _onDowngrade(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        const dieSizes = game.heart.die_sizes;
        const services = item.system.resistances;

        const updates = {};

        Object.keys(services).forEach(key => {
            var service = services[key];
            var indexOf = dieSizes.indexOf(service.die_size);

            if (indexOf > 0) {
                var smallerSize = dieSizes[indexOf - 1];
                updates[`system.resistances.${key}.die_size`] = smallerSize;
            }
        });

        item.update(updates);
    }

    static async _onAddService(event, target) {
        const id = foundry.utils.randomID();
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        item.update({[`system.resistances.${id}`]: {
            die_size: 'd4',
            resistance: 'blood'
        }});
    }

    static async _onDeleteService(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        const id = target.closest('[data-id]').dataset.id;
        item.update({[`system.resistances.-=${id}`]: null});
    }

    static async _onServiceRoll(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const hauntitem = await fromUuid(uuid);
        const id = target.closest('[data-id]').dataset.id;
        const service = hauntitem.system.resistances[id];
        const item = {system: {die_size: service.die_size}};

        const roll = game.heart.rolls.ItemRoll.build({item});
        await roll.evaluate();

        roll.toMessage({
            flavor: `${localizeHeart(hauntitem.name)} (<span class="item-type">${hauntitem.type}</span>)<div class="resistance-text">${localizeHeart(service.resistance)}</div>`,
            speaker: {alias: "GM"}
        });
    }
}
