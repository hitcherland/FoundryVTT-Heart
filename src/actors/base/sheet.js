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

    activateListeners(html) {
        super.activateListeners(html);

        html.find('[data-action=add][data-type]').click(ev => {
          const target = $(ev.currentTarget);
          const type = target.data('type');
          const itemData = target.data('data') || {};

          const doc = new CONFIG.Item.documentClass({
              type,
              name: `New ${type}`,
              system: itemData
          });

          this.actor.createEmbeddedDocuments('Item', [doc.toObject()]);
        });

        html.find('[data-action=view]').click(async ev => {
          const uuid = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
          const item = await fromUuid(uuid);
          item.sheet.render(true);
        });

        html.find('[data-action=delete]').click(async ev => {
            const uuid = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            await item.deleteDialog();
        });

        html.find('[data-action=item-roll]').click(async ev => {
          const uuid = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
          const item = await fromUuid(uuid);
          let rollOptions = {'stepIncrease': false, 'stepDecrease': false};

          if (ev.shiftKey) {
            rollOptions.stepIncrease = true;
          }
          if (ev.altKey) {
            rollOptions.stepDecrease = true;
          }
          if (ev.altKey && ev.shiftKey) {
            rollOptions = {'stepIncrease': false, 'stepDecrease': false};
          }

          const roll = game.heart.rolls.ItemRoll.build({item}, {}, rollOptions);
          await roll.evaluate({async: true});

          roll.toMessage({
              flavor: `${localizeHeart(item.name)} (<span class="item-type">${item.type}</span>)`,
              speaker: {actor: this.actor.id}
          });
        });
      
        html.find('[data-action=roll]').click(async ev => {
            const roll = await  game.heart.rolls.HeartRoll.build({
                character: this.actor.id
            });

            roll.toMessage({
                speaker: {actor: this.actor.id}
            });
        });

        html.find('[data-action=stress-roll]').click(async ev => {
            const roll = await game.heart.rolls.StressRoll.build({
                character: this.actor.id
            });

            roll.toMessage({
                speaker: {actor: this.actor.id}
            });
        });

        html.find('[data-item-id] [data-action=activate]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.update({'system.active': true});
        });

        html.find('[data-item-id] [data-action=deactivate]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.update({'system.active': false});
        });

        html.find('[data-item-id] [data-action=complete]').click(async ev => {
          const target = $(ev.currentTarget);
          const uuid = target.closest('[data-item-id]').data('itemId');
          const item = await fromUuid(uuid);
          item.update({'system.complete': true});
        });

        html.find('[data-item-id] [data-action=uncomplete]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.update({'system.complete': false});
        });
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