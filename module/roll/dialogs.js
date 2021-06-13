import {CreateRollChatMessage, CreateStressRollChatMessage} from './chat-messages.js';

const difficulty_map = {
    'standard': 0,
    'risky': 1,
    'dangerous': 2
};

export async function HeartRoll(data={}) {
    if(!data.actor_id) {
        ui.notifications.warn(game.i18n.localize("heart.NoActorSelected"))
        return;
    }

    const dice = [game.i18n.localize('heart.RollBase')];
    if(data.skill) {
        dice.push(game.i18n.localize('heart.SheetSkill' + game.heart.titlecase(data.skill)));
    }

    if(data.domain) {
        dice.push(game.i18n.localize('heart.SheetDomain' + game.heart.titlecase(data.domain)));
    }

    if(data.mastery) {
        dice.push(`${game.i18n.localize('heart.Mastery')}`);
    }

    let difficulty = difficulty_map[data.difficulty] || 0;

    if (difficulty >= dice.length) {
        let formula = '2d10kl';
        const roll = await Roll.create(formula).evaluate({ 'async': true });
        const dicepairs = roll.dice[0].results.map((x, i) => [x, "Too Difficult"]);
        let message = 'Failure';
        if (roll.result === '10') {
            message = 'SuccessAtACost';
        } else if (roll.result === '1') {
            message = 'CriticalFailure';
        }
        return CreateRollChatMessage({
            actor_id: data.actor_id,
            roll,
            dicepairs,
            result: message
        });
    } else {
        let formula = `${dice.length}d10`;
        if (difficulty > 0) {
            formula += `dh${difficulty}`
        }
        formula += 'kh';
        const roll = await Roll.create(formula).evaluate({ 'async': true });
        const dicepairs = roll.dice[0].results.map((roll, i) => { return {roll, flavor: dice[i]} });
        const result = parseInt(roll.result);
        let message = 'CriticalFailure'
        if (result >= 10) {
            message = 'CriticalSuccess';
        } else if (result >= 8) {
            message = 'Success';
        } else if (result >= 6) {
            message = 'SuccessAtACost';
        } else if (result >= 2) {
            message = 'Failure';
        }
        return CreateRollChatMessage({
            actor_id: data.actor_id,
            roll,
            dicepairs,
            result: message,
        });
    }
}

export async function HeartStressRoll(data={}) {
    if(!data.actor_id) {
        ui.notifications.warn(game.i18n.localize("heart.NoActorSelected"))
        return;
    }

    const actor_id = data.actor_id;
    const actor = game.actors.get(actor_id);

    const stress_di = data.stress_di;
    const multiplier = parseInt(data.multiplier);
    const resistance = data.resistance;

    const total_stress = Object.values(actor.data.data.resistances).reduce((o, v) => {
        return o + v.value;
    }, 0);

    const output_data = {
        actor,
        resistance,
        fallout: 'no',
        fallout_result: null,
        stress: 0,
        total_stress,
        stress_di,
        multiplier
    };

    const stress_roll = await Roll.create(stress_di).evaluate({ 'async': true });
    data.stress_roll = stress_roll.result;
    const protection = actor.data.data.resistances[resistance].protection;
    output_data.protection = protection;
    output_data.stress = Math.max(0, parseInt(stress_roll.result) * multiplier - protection);

    if(output_data.stress > 0) {
        const fallout_roll = await Roll.create('1d12').evaluate({ 'async': true });
        const result = parseInt(fallout_roll.result);
        output_data.fallout_result = result;
        if (result > total_stress) {
            output_data.fallout = 'no';
        } else if (result <= 6) {
            output_data.fallout = 'minor';
        } else {
            output_data.fallout = 'major'
        }
    }

    CreateStressRollChatMessage(output_data);
}

export async function CreateRollStressDialog(data) {
    const actor = data.actor;
    const multiplier = data.multiplier || 1;
    const stress_di = data.stress_di;
    const resistance = data.resistance;
    const resistances = data.resistances || game.heart.resistances;
    const stress_dice = data.stress_dice || game.heart.stress_dice;

    const content = await renderTemplate('systems/heart/templates/dialogs/stress.html', {
        actor,
        multiplier,
        resistance,
        resistances,
        stress_di,
        stress_dice
    });

    const dialog = new Dialog({
        title: game.i18n.localize('heart.RollStress'),
        content,
        buttons: {
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("Cancel")
            },
            create: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("Create"),
                callback: async html => {
                    const form = html[0].querySelector("form");
                    const fd = new FormDataExtended(form);
                    const data = fd.toObject();
                    HeartStressRoll(data);
                }
            }
        },
    }, {
        classes: ["heart", "dialog"],
        height: 303,
    });

    dialog.render(true);
    return dialog;
}