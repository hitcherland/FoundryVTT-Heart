import {HeartRoll} from '../roll/dialogs.js'
import {HeartApplication} from './base.js';

export class PrepareRollApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/heart/templates/dialogs/prepare-roll.html',
            classes: ["heart prepare-roll"],
            height: 375
        });
    }

    get title() {
        return game.i18n.localize('heart.PrepareRoll');
    }

    Submit(data) {
        HeartRoll(data);
    }

    getData(options={}) {
        return {
            actor_id: options.actor?.id || options.actor_id,
            actor_ids: options.actor_ids || game.actors.filter(x => x.data.data.resistances).map(x => x.id),
            description: options.description || "",
            difficulty: options.difficulty,
            difficulties: options.difficulties || game.heart.difficulties,
            domain: options.domain || [],
            domains: options.domains || game.heart.domains,
            skill: options.skill || [],
            skills: options.skills || game.heart.skills,
        }
    }
}