async function _createChatMessage({data={}, requirements={}, template}, {user, speaker}={}) {
    const allowed_data = {};
    for(let key in requirements) {
        allowed_data[key] = data[key] || requirements[key];
    }

    if(allowed_data.actor_id) {
        allowed_data.actor = game.actors.get(allowed_data.actor_id);
    }

    const template_path = `systems/heart/templates/chat-messages/${template}.html`;
    user = user || game.user;
    speaker = speaker || {};
    speaker.actor = speaker.actor || allowed_data.actor_id;
    speaker.alias = speaker.alias || allowed_data.actor?.name;
    speaker.token = speaker.token || null;
    speaker.scene = speaker.scene || null;

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
            dicepairs: [],
            result: undefined,
            roll: undefined,
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
            fallout: 'no',
            fallout_result: undefined,
            multiplier: 1,
            protection: 0,
            resistance: undefined,
            stress: 0,
            stress_di: 0,
            stress_roll: 1,
            total_stress: 0,
        },
        data,
        template: 'stress'
    });

    const actor = data.actor;
    const resistance = data.resistance;
    const fallout = data.fallout || 'no';
    const fallout_result = data.fallout_result || null;
    const stress = data.stress || 0;
    const total_stress = data.total_stress || 0;
    const stress_di = data.stress_di || 'd4';
    const multiplier = data.multiplier || 1;
    const protection = data.protection || 0;
    const stress_roll = data.stress_roll || 1;

    const content = await renderTemplate('systems/heart/templates/chat-messages/stress.html', {
        actor,
        resistance,
        fallout,
        fallout_result,
        stress,
        total_stress,
        stress_di,
        multiplier,
        protection,
        stress_roll,
    });

    return CONFIG.ChatMessage.documentClass.create({
        user: game.user,
        content,
        speaker: {
            actor: actor?.id,
            alias: actor?.name
        }
    });
}