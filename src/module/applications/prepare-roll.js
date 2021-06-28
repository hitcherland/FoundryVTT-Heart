import {HeartRoll} from '../roll/roll.js'
import {HeartApplication} from './base.js';

export class PrepareRollApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/heart/templates/applications/prepare-roll.html',
            classes: ["heart prepare-roll"],
            width: 500,
            height: 400
        });
    }

    get title() {
        return game.i18n.localize('heart.prepare:roll');
    }

    Submit(data) {
        HeartRoll(data);
    }

    getData(options={}) {
        return {
            actor_id: options.actor_id || CONFIG.ChatMessage.documentClass.getSpeaker().actor,
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