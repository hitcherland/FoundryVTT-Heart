import './sheet.sass';
import sheetHTML from './sheet.html';
import HeartSheetMixin from '../../common/sheet';

const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class HeartActorSheet extends HeartSheetMixin(HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2)) {
    static get type() { return 'base'; }
    static MIN_WIDTH = 420;
    static MIN_HEIGHT = 200;

    static DEFAULT_OPTIONS = {
        classes: ["heart", "sheet", "actor"],
        position: { width: 560, height: 600 },
        actions: {
            add: HeartActorSheet._onAdd,
            view: HeartActorSheet._onView,
            "delete": HeartActorSheet._onDelete,
            "item-roll": HeartActorSheet._onItemRoll,
            roll: HeartActorSheet._onRoll,
            "stress-roll": HeartActorSheet._onStressRoll,
            activate: HeartActorSheet._onActivate,
            deactivate: HeartActorSheet._onDeactivate,
            complete: HeartActorSheet._onComplete,
            uncomplete: HeartActorSheet._onUncomplete,
        },
        form: {
            submitOnChange: true,
        },
        window: {
            resizable: true,
        },
    };

    static PARTS = {
        main: { template: sheetHTML.path, scrollable: [".heart.sheet"] },
    };

    get img() {
        return this.default_img;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const items = {};
        Object.keys(CONFIG.Item.typeLabels).forEach((type) => {
            items[type] = [];
        });
        this.actor.items.forEach((item) => {
            items[item.type].push(item);
        });
        context.heart = items;
        context.system = this.actor.system;
        context.actor = this.actor;
        context.user = game.user;
        context.editable = this.isEditable;
        context.owner = this.actor.isOwner;
        context.type = this.actor.type;
        return context;
    }

    static _onAdd(event, target) {
        const type = target.dataset.type;
        const itemData = target.dataset.data ? JSON.parse(target.dataset.data) : {};
        const doc = new CONFIG.Item.documentClass({
            type,
            name: `New ${type}`,
            system: itemData
        });
        this.actor.createEmbeddedDocuments('Item', [doc.toObject()]);
    }

    static async _onView(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        item.sheet.render(true);
    }

    static async _onDelete(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        await item.deleteDialog();
    }

    static async _onItemRoll(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        let rollOptions = {'stepIncrease': false, 'stepDecrease': false};
        if (event.shiftKey) rollOptions.stepIncrease = true;
        if (event.altKey) rollOptions.stepDecrease = true;
        if (event.altKey && event.shiftKey) rollOptions = {'stepIncrease': false, 'stepDecrease': false};

        const roll = game.heart.rolls.ItemRoll.build({item}, {}, rollOptions);
        await roll.evaluate();
        roll.toMessage({
            flavor: `${localizeHeart(item.name)} (<span class="item-type">${item.type}</span>)`,
            speaker: {actor: this.actor.id}
        });
    }

    static async _onRoll(event, target) {
        const roll = await game.heart.rolls.HeartRoll.build({
            character: this.actor.id
        });
        roll.toMessage({
            speaker: {actor: this.actor.id}
        });
    }

    static async _onStressRoll(event, target) {
        const roll = await game.heart.rolls.StressRoll.build({
            character: this.actor.id
        });
        roll.toMessage({
            speaker: {actor: this.actor.id}
        });
    }

    static async _onActivate(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        item.update({'system.active': true});
    }

    static async _onDeactivate(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        item.update({'system.active': false});
    }

    static async _onComplete(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        item.update({'system.complete': true});
    }

    static async _onUncomplete(event, target) {
        const uuid = target.closest('[data-item-id]').dataset.itemId;
        const item = await fromUuid(uuid);
        item.update({'system.complete': false});
    }

    async _onDragStart(event) {
        const li = event.currentTarget;
        if (event.target.classList.contains("content-link")) return;

        let dragData = {
            actorId: this.actor.id,
            sceneId: this.actor.isToken ? canvas.scene?.id : null,
            tokenId: this.actor.isToken ? this.actor.token.id : null,
            pack: this.actor.pack
        };

        if (li.dataset.itemId) {
            const item = await fromUuid(li.dataset.itemId);
            dragData.type = "Item";
            dragData.data = item.toObject();
            delete dragData.data._id;
        }

        if (li.dataset.effectId) {
            const effect = this.actor.heart_effects.get(li.dataset.effectId);
            dragData.type = "ActiveEffect";
            dragData.data = effect.toObject();
        }

        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
}
