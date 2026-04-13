import sheetHTML from './sheet.html';
import './character.sass';
import HeartActorSheet from '../base/sheet';
import template from './template.json';

export default class CharacterSheet extends HeartActorSheet {
    static DEFAULT_OPTIONS = {
        dragDrop: [{dragSelector: '.item', dropSelector: null}],
        actions: {
            "toggle-checkable": CharacterSheet._onToggleCheckable,
            "toggle-boolean": CharacterSheet._onToggleBoolean,
            "prepare-request-roll": CharacterSheet._onPrepareRequestRoll,
            "fallout-roll": CharacterSheet._onFalloutRoll,
        },
    };

    static PARTS = {
        main: { template: sheetHTML.path, scrollable: [".heart.sheet"] },
    };

    // workaround for nested-children uuids not dragging properly
    async _onDragStart(event) {
        const target = event.currentTarget;
        const uuid = target.dataset.itemId;
        const document = await fromUuid(uuid);
        const dragData = document.toDragData();
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }

    async _onDropItemCreate(itemData) {
        if (this.actor.type === 'character') {
            if (itemData.type === 'calling') {
                this.actor.itemTypes.calling.forEach(item => {
                    item.delete();
                });
            }

            if (itemData.type === 'class') {
                this.actor.itemTypes.class.forEach(item => {
                    item.delete();
                });
            }

            itemData.system.active = true;
        }

        return super._onDropItemCreate(itemData);
    }

    static get type() { return Object.keys(template.Actor)[0]; }

    get img() {
        return 'systems/heart/assets/high-punch.svg';
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const callingItem = this.actor.proxy.calling;
        const classItem = this.actor.proxy.class;
        context.callingItem = callingItem;
        context.classItem = classItem;
        context.showTextboxesBelowItems = game.settings.get('heart', 'showTextboxesBelowItems');
        context.showTotalStress = game.settings.get('heart', 'showTotalStress');
        context.showStressInputBox = game.settings.get('heart', 'showStressInputBox');
        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);
        this.element.querySelectorAll('.resistance-input').forEach(input => {
            input.addEventListener('change', ev => {
                ev.preventDefault();
                const parent = ev.currentTarget.parentElement;
                const targetPath = parent.dataset.target;
                const data = {};
                data[targetPath] = parseInt(ev.currentTarget.value);
                this.actor.update(data);
            });
        });
    }

    static _onToggleCheckable(event, target) {
        event.preventDefault();
        const index = parseInt(target.dataset.index);
        const parent = target.parentElement;
        const targetPath = parent.dataset.target;
        const isChecked = target.classList.contains('checked');
        const data = {};
        if (isChecked) {
            if (index + 1 === foundry.utils.getProperty(this.actor, targetPath)) {
                data[targetPath] = index;
            } else {
                data[targetPath] = index + 1;
            }
        } else {
            data[targetPath] = index + 1;
        }
        this.actor.update(data);
    }

    static _onToggleBoolean(event, target) {
        event.preventDefault();
        const path = target.dataset.path;
        const current = foundry.utils.getProperty(this.actor, path);
        this.actor.update({ [path]: !current });
    }

    static _onPrepareRequestRoll(event, target) {
        new game.heart.applications.PrepareRollRequestApplication({}).render(true);
    }

    static async _onFalloutRoll(event, target) {
        const roll = await game.heart.rolls.FalloutRoll.build({
            character: this.actor.id
        });
        roll.toMessage({
            speaker: {actor: this.actor.id}
        });
    }
}
