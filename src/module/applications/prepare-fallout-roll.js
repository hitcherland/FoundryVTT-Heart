import {HeartFalloutRoll} from '../roll/roll.js'
import {HeartApplication} from './base.js';

export class PrepareFalloutRollApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/heart/templates/applications/prepare-fallout-roll.html',
            classes: ["heart prepare-fallout-roll"],
            height: 375
        });
    }

    get title() {
        return game.i18n.localize('heart.prepare:fallout_roll');
    }

    Submit(data) {
        HeartFalloutRoll(data);
    }

    getData(options={}) {
        return {
            actor_id: options.actor_id || CONFIG.ChatMessage.documentClass.getSpeaker().actor,
            resistance: options.resistance,
            resistances: options.resistances || game.heart.resistances,
        }
    }
}