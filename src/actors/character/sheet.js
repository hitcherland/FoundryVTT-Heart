import sheetHTML from './sheet.html';
import './character.sass';
import HeartActorSheet from '../base/sheet';

export default class CharacterSheet extends HeartActorSheet {
    static get defaultOptions() {
        const defaultOptions = super.defaultOptions;
        return foundry.utils.mergeObject(defaultOptions, {
            dragDrop: [{dragSelector: '.item', dropSelector: null}]
        })
    }

    // workaround for nested-children uuids not dragging properly
    async _onDragStart(event) {
        const target = event.currentTarget;
        const uuid = target.dataset.itemId;
        const document = await fromUuid(uuid);
        const dragData = document.toDragData();
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }

    async _onDropItemCreate(itemData) {
        if(this.actor.type === 'character') {
            if(itemData.type === 'calling' ) {
                this.actor.itemTypes.calling.forEach(item => {
                    item.delete();
                });
            }

            if(itemData.type === 'class') {
                this.actor.itemTypes.class.forEach(item => {
                    item.delete();
                });
            }

            itemData.system.active = true;
        }

        return super._onDropItemCreate(itemData);
    }

    static get type() { return "character"; }

    get template() {
        return sheetHTML.path;
    }

    get img() {
        return 'systems/heart/assets/high-punch.svg';
    }

    getData() {
        const data = super.getData();
        const callingItem = this.actor.proxy.calling;
        const classItem = this.actor.proxy.class;
        data.user = game.user;
        data.callingItem = callingItem;
        data.classItem = classItem;
        data.showTextboxesBelowItems = game.settings.get('heart', 'showTextboxesBelowItems');
        data.showTotalStress = game.settings.get('heart', 'showTotalStress');
        data.showStressInputBox = game.settings.get('heart', 'showStressInputBox');
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.ordered-checkable-box:not(.checked)').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {};
            data[target] = index + 1;
            this.actor.update(data);
        });

        html.find('.ordered-checkable-box.checked').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {};
            if (index + 1 === foundry.utils.getProperty(this.actor, target)) {
                data[target] = index;
            } else {
                data[target] = index + 1;
            }
            this.actor.update(data);
        });

        html.find('.resistance-input').change(ev =>{
            ev.preventDefault();
            const element = ev.currentTarget;
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {};
            data[target] = parseInt(element.value);
            this.actor.update(data);

        })

        html.find('[data-action=prepare-request-roll]').click(ev => {
            new game.heart.applications.PrepareRollRequestApplication({}).render(true);
        });

        html.find('[data-action=fallout-roll]').click(async ev => {
            const roll = await game.heart.rolls.FalloutRoll.build({
                character: this.actor.id
            });

            roll.toMessage({
                speaker: {actor: this.actor.id}
            });
        });
    }
}