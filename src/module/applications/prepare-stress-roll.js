import {HeartStressRoll} from '../roll/roll.js'
import {HeartApplication} from './base.js';

export class PrepareStressRollApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/heart/templates/applications/prepare-stress-roll.html',
            classes: ["heart prepare-stress-roll"],
            height: 375
        });
    }

    get title() {
        return game.i18n.localize('heart.prepare:stress_roll');
    }

    Submit(data) {
        HeartStressRoll(data);
    }

    getData(options={}) {
        return {
            actor_id: options.actor_id || CONFIG.ChatMessage.documentClass.getSpeaker().actor,
            result: options.result,
            results: options.results || game.heart.roll_results.slice(0, 3),
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