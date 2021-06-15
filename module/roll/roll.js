import {CreateRollChatMessage, CreateStressRollChatMessage, CreateFalloutRollChatMessage} from './chat-messages.js';

const difficulty_map = {
    'standard': 0,
    'risky': 1,
    'dangerous': 2,
    'impossible': 3,
};

export async function HeartRoll(data={}) {
    const actor_id = data.actor_id || CONFIG.ChatMessage.documentClass.getSpeaker().actor;
    if(!actor_id) {
        ui.notifications.warn(game.i18n.localize("heart.warning:no_actor_selected"));
        return;
    }

    const dice = [game.i18n.localize('heart.prepare:roll:base')];
    if(data.skill) {
        dice.push(game.i18n.localize(`heart.skill:${data.skill}`));
    }

    if(data.domain) {
        dice.push(game.i18n.localize(`heart.domain:${data.domain}`));
    }

    if(data.mastery) {
        dice.push(`${game.i18n.localize('heart.prepare:roll:mastery')}`);
    }

    for(let i=0; i<data.help; i++) {
        dice.push(`${game.i18n.localize('heart.prepare:roll:help')}`);
    }

    let difficulty = difficulty_map[data.difficulty] || 0;
    let result, roll, dicepairs;
    if(data.difficulty === 'impossible') {
        result = 'failure';
    } else {
        let action_table_type = 'normal';
        let formula = `${dice.length}d10${difficulty > 0 ? `dh${difficulty}` : ''}kh`;

        if (difficulty >= dice.length) {
            action_table_type = 'difficult';
        }

        roll = await Roll.create(formula).evaluate({'async': true});
        const resultValue = parseInt(roll.result);
        const action_table_uuid = game.settings.get('heart', `${action_table_type}ActionTable`);
        const action_table = await fromUuid(action_table_uuid);
        dicepairs = roll.dice[0].results.map((roll, i) => { return {roll, flavor: dice[i]} });
        result = action_table.getResultsForRoll(resultValue)[0].getChatText();
    }

    return CreateRollChatMessage({
        actor_id,
        difficulty: data.difficulty,
        roll,
        dicepairs,
        result
    });
}

export async function HeartStressRoll(data={}) {
    const actor_id = data.actor_id || CONFIG.ChatMessage.documentClass.getSpeaker().actor;
    if(!actor_id) {
        ui.notifications.warn(game.i18n.localize("heart.warning:no_actor_selected"));
        return;
    }

    const actor = game.actors.get(actor_id);
    const resistance = data.resistance;
    const roll_result = data.result;
    const stress_di = data.stress_di;

    const multiplier = roll_result === 'critical_failure' ? 2 : 1;
    const protection = actor.data.data.resistances[resistance].protection;

    const stress_roll = await Roll.create(stress_di).evaluate({ 'async': true });
    let result = parseInt(stress_roll.result);
    let stress_gain = Math.max(0, result * multiplier - protection);

    CreateStressRollChatMessage({
        actor_id,
        multiplier,
        protection,
        resistance,
        result,
        stress_gain,
        stress_di,
    });
}

export async function HeartFalloutRoll(data={}) {
    const actor_id = data.actor_id || CONFIG.ChatMessage.documentClass.getSpeaker().actor;
    if(!actor_id) {
        ui.notifications.warn(game.i18n.localize("heart.warning:no_actor_selected"));
        return;
    }

    const actor = game.actors.get(actor_id);
    const resistance = data.resistance;

    const total_stress = Object.values(actor.data.data.resistances).reduce((o, v) => {
        return o + v.value;
    }, 0);

    const roll = await Roll.create('1d12').evaluate({ 'async': true });
    const result = parseInt(roll.result);
    let fallout = 'no_fallout'
    if (result <= total_stress) {
        fallout = result <= 6 ? 'minor_fallout': 'major_fallout';
    }

    CreateFalloutRollChatMessage({
        actor_id,
        resistance,
        total_stress,
        fallout,
        result
    });
}