async function _createChatMessage({data={}, requirements={}, template}, {user, speaker}={}) {
    const allowed_data = {};
    for(let key in requirements) {
        allowed_data[key] = data[key] || requirements[key];
    }
    const actor = game.actors.get(allowed_data.actor_id);

    const template_path = `systems/heart/templates/chat-messages/${template}.html`;
    user = user || game.user;
    speaker = speaker || {};
    speaker.actor = speaker.actor || allowed_data.actor_id;
    speaker.alias = speaker.alias || actor?.name;
    speaker.token = speaker.token || null;
    speaker.scene = speaker.scene || null;

    console.log(speaker);

    return CONFIG.ChatMessage.documentClass.create({
        content: await renderTemplate(template_path, allowed_data),
        speaker,
        user,
    });
}

export async function CreateRollRequestChatMessage(data = {}) {
    return _createChatMessage({
        requirements: {
            actor_id: undefined,
            actor_ids: game.actors.filter(x => x.data.data.resistances).map(x => x.id),
            description: undefined,
            difficulty: undefined,
            domains: game.heart.domains,
            selected_skills: [],
            selected_domains: [],
            skills: game.heart.skills
        },
        data,
        template: 'roll-request'
    }, {
        user: game.user,
        speaker: {
            alias: `Roll Request from ${game.user.name}`,
        }
    });
}

export async function CreateRollChatMessage(data={}) {
    return _createChatMessage({
        requirements: {
            actor_id: undefined,
            difficulty: 'standard',
            dicepairs: [],
            result: undefined,
            user: game.user,
        },
        data,
        template: 'roll'
    });
}

export async function CreateStressRollChatMessage(data={}) {
    return _createChatMessage({
        requirements: {
            actor_id: undefined,
            multiplier: 1,
            protection: 0,
            resistance: undefined,
            result: undefined,
            stress_gain: 0,
            total_stress: 0,
            stress_di: 'd4',
        },
        data,
        template: 'stress'
    });
}

export async function CreateFalloutRollChatMessage(data={}) {
    return _createChatMessage({
        requirements: {
            actor_id: undefined,
            fallout: undefined,
            resistance: undefined,
            result: undefined,
            total_stress: 0,
        },
        data,
        template: 'fallout'
    });
}