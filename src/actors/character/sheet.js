//import {PrepareRollRequestApplication} from '../applications/prepare-roll-request.js';
//import {PrepareRollApplication} from '../applications/prepare-roll.js';
//import {PrepareStressRollApplication} from '../applications/prepare-stress-roll.js';
//import {PrepareFalloutRollApplication} from '../applications/prepare-fallout-roll.js';

import sheetHTML from './sheet.html';

export default class CharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["heart", "sheet", "actor", "character"],
            width: 820,
        });
    }

    get template() {
        return sheetHTML.path;
    }

    getData() {
        const data = super.getData();
        if (data.data.img === CONST.DEFAULT_TOKEN) {
            data.data.img = "systems/heart/assets/heart_logo_playbook.png";
        }
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
            if (index + 1 === getProperty(this.actor.data, target)) {
                data[target] = index;
            } else {
                data[target] = index + 1;
            }
            this.actor.update(data);
        });

        /*
        html.find('[data-action=prepare-request-roll]').click(ev => {
            new PrepareRollRequestApplication({}).render(true);
        });

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