import {CreateRollRequestChatMessage} from '../roll/chat-messages.js'
import {HeartApplication} from './base.js';

export class PrepareRollRequestApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/heart/templates/dialogs/prepare-roll-request.html',
            classes: ["heart prepare-roll-request"],
        });
    }

    get title() {
        return game.i18n.localize('heart.PrepareRollRequest');
    }

    Submit(data) {
        if(data.actor_ids.length === 0) {
            data.actor_ids = game.actors.filter(x => x.data.data.resistances).map(x => x.id);
        }
        CreateRollRequestChatMessage(data);
    }

    getData(options={}) {
        return {
            actor_id: options.actor?.id || options.actor_id,
            actor_ids: options.actor_ids || game.actors.filter(x => x.data.data.resistances).map(x => x.id),
            description: options.description || "",
            difficulty: options.difficulty,
            difficulties: options.difficulties || game.heart.difficulties,
            domains: options.domains || game.heart.domains,
            selected_actor_ids: options.selected_actor_ids || [],
            selected_skills: options.selected_skills || [],
            selected_domains: options.selected_domains || [],
            skills: options.skills || game.heart.skills,
        }
    }
}

