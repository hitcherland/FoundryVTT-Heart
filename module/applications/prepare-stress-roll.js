import {HeartStressRoll} from '../roll/dialogs.js'
import {HeartApplication} from './base.js';

export class PrepareStressRollApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/heart/templates/dialogs/prepare-stress-roll.html',
            classes: ["heart prepare-roll"],
            height: 375
        });
    }

    get title() {
        return game.i18n.localize('heart.PrepareRoll');
    }

    Submit(data) {
        HeartStressRoll(data);
    }

    getData(options={}) {
        return {
            actor_id: options.actor?.id || options.actor_id,
            actor_ids: options.actor_ids || game.actors.filter(x => x.data.data.resistances).map(x => x.id),
            multiplier: options.multiplier || 1,
            description: options.description || "",
            difficulty: options.difficulty,
            difficulties: options.difficulties || game.heart.difficulties,
            resistance: options.resistance,
            resistances: options.resistances || game.heart.resistances,
            stress_di: options.stress_di,
            stress_dice: options.stress_dice || game.heart.stress_dice
        }
    }
}