import './sheet.sass';
import sheetHTML from './sheet.html';
import HeartSheetMixin from '../../common/sheet';

export default class HeartActorSheet extends HeartSheetMixin(ActorSheet) {
    static get type() { return 'base'; }
    
    get template() {
        return sheetHTML.path;
    }

    get img() {
        return this.default_img;
    }

    getData() {
        const data = super.getData();

        const items = {};
        Object.keys(CONFIG.Item.typeLabels).forEach((type) => {
            items[type] = [];
        });

        this.actor.items.forEach((item) => {
            items[item.type].push(item);
        });

        data.heart = items;
        data.system = this.actor.system;

        return data;
    }

    async _onDragStart(event) {
        const li = event.currentTarget;
        if (event.target.classList.contains("content-link")) return;

        // Create drag data
        let dragData = {
            actorId: this.actor.id,
            sceneId: this.actor.isToken ? canvas.scene?.id : null,
            tokenId: this.actor.isToken ? this.actor.token.id : null,
            pack: this.actor.pack
        };

        // Owned Items
        if (li.dataset.itemId) {
            const item = await fromUuid(li.dataset.itemId);
            dragData.type = "Item";
            dragData.data = item.toObject();
            // Delete _id so that when dropped in Item panel Foundry knows to create a new Item
            delete dragData.data._id;
        }

        // Active Effect
        if (li.dataset.effectId) {
            const effect = this.actor.heart_effects.get(li.dataset.effectId);
            dragData.type = "ActiveEffect";
            dragData.data = effect.data;
        }

        // Set data transfer
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
}