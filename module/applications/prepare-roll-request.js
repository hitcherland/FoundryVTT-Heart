import {CreateRollRequestChatMessage} from '../roll/chat-messages.js'
import {HeartApplication} from './base.js';

export class PrepareRollRequestApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/heart/templates/applications/prepare-roll-request.html',
            classes: ["heart prepare-roll-request"],
        });
    }

    get title() {
        return game.i18n.localize('heart.prepare:roll_request');
    }

    Submit(data) {
        CreateRollRequestChatMessage(data);
    }

    getData(options={}) {
        return {
            description: options.description || "",
            difficulty: options.difficulty,
            difficulties: options.difficulties || game.heart.difficulties,
            domains: options.domains || game.heart.domains,
            selected_skills: options.selected_skills || [],
            selected_domains: options.selected_domains || [],
            skills: options.skills || game.heart.skills,
        }
    }
}

