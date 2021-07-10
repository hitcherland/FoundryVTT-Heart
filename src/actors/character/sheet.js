//import {PrepareRollRequestApplication} from '../applications/prepare-roll-request.js';
//import {PrepareRollApplication} from '../applications/prepare-roll.js';
//import {PrepareStressRollApplication} from '../applications/prepare-stress-roll.js';
//import {PrepareFalloutRollApplication} from '../applications/prepare-fallout-roll.js';

import sheetHTML from './sheet.html';
import './character.sass';
import HeartActorSheet from '../base/sheet';
import template from './template.json';

export default class CharacterSheet extends HeartActorSheet {
    static get type() { return Object.keys(template.Actor)[0]; }

    get template() {
        return sheetHTML.path;
    }

    get img() {
        return 'systems/heart/assets/high-punch.svg';
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
            if (index + 1 === getProperty(this.actor.data, target)) {
                data[target] = index;
            } else {
                data[target] = index + 1;
            }
            this.actor.update(data);
        });

        
        html.find('[data-action=prepare-request-roll]').click(ev => {
            new PrepareRollRequestApplication({}).render(true);
        });

        html.find('[data-action=add][data-type]').click(ev => {
            const type = $(ev.currentTarget).data('type');
            const doc = new CONFIG.Item.documentClass({
                type,
                name: `New ${type}`
            });

            
            this.actor.createEmbeddedDocuments('Item', [doc.toObject()]);
        });

        html.find('[data-action=view]').click(ev => {
            const id = $(ev.currentTarget).closest('[data-item]').data('item');
            const item = this.actor.items.get(id);
            item.sheet.render(true);
        });

        html.find('[data-action=delete]').click(ev => {
            const id = $(ev.currentTarget).closest('[data-item]').data('item');
            const item = this.actor.items.get(id);
            item.delete();
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

        html.find('[data-action=fallout-roll]').click(async ev => {
            const roll = await game.heart.rolls.FalloutRoll.build({
                character: this.actor.id
            });

            roll.toMessage({
                speaker: {actor: this.actor.id}
            });
        });

        /*
        html.find('[data-action=prepare-roll]').click(ev => {
            const skills = Object.entries(this.actor.data.data.skills).filter(([k, v]) => {
                return v.value;
            }).map(([k, v]) => k);

            const domains = Object.entries(this.actor.data.data.domains).filter(([k, v]) => {
                return v.value;
            }).map(([k, v]) => k);

            new PrepareRollApplication({
                actor_id: this.actor.id,
                skills,
                domains
            }).render(true);
        });

        html.find('[data-action=prepare-stress-roll]').click(ev => {
            new PrepareStressRollApplication({
                actor_id: this.actor.id,
            }).render(true);
        });

        html.find('[data-action=prepare-fallout-roll]').click(ev => {
            new PrepareFalloutRollApplication({
                actor_id: this.actor.id,
            }).render(true);
        });
        */
    }
}