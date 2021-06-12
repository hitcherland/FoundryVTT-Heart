function titlecase(str) {
    return str.replace(/\w\S*/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

export async function CreatePrepareRollDialog(data = {}) {
    const actor_id = data.actor_id;
    const difficulties = data.difficulties || game.heart.difficulties;
    const difficulty = data.difficulty || difficulties[0];
    const domains = data.domains || game.heart.domains;
    const selected_skills = data.selected_skills || [];
    const selected_domains = data.selected_domains || [];
    const skills = data.skills || game.heart.skills;

    const difficultyMap = difficulties.reduce((map, difficulty) => {
        map[difficulty] = game.i18n.localize(`heart.Difficulty${titlecase(difficulty)}`);
        return map;
    }, {});

    const content = await renderTemplate('systems/heart/templates/dialogs/prepare-roll.html', {
        actor_id,
        difficulty,
        difficulties: difficultyMap,
        domains,
        selected_skills,
        selected_domains,
        skills,
    });

    const dialog = new Dialog({
        title: game.i18n.localize('heart.PrepareRoll'),
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
                    data.skills = [];
                    data.domains = [];
                    Object.keys(data).forEach(function(key) {
                        if(key.startsWith('skill-')) {
                            if(data[key]) {
                                data.skills.push(key.replace(/^skill-/, ''));
                            }
                            delete data[key];
                        } else if(key.startsWith('domain-')) {
                            if(data[key]) {
                                data.domains.push(key.replace(/^domain-/, ''));
                            }
                            delete data[key];
                        }
                    });

                    if(data.skills.length === 1) {
                        data.selected_skills = data.skills[0];
                    }

                    if(data.domains.length === 1) {
                        data.selected_domains = data.domains[0];
                    }

                    CreateRollRequestChatMessage(data);
                }
            }
        },
    }, {
        classes: ["heart", "dialog"],
    });

    dialog.render(true);
    return dialog;
}


export async function CreateRollRequestChatMessage(data = {}) {
    const actor_id = data.actor_id;
    const difficulty = data.difficulty || game.heart.difficulties[0];
    const skills = data.skills || game.heart.skills;
    const domains = data.domains || game.heart.domains;
    const selectable = data.selectable || false;
    const selected_skills = data.selected_skills || [];
    const selected_domains = data.selected_domains || [];

    const content = await renderTemplate('systems/heart/templates/chat-messages/roll-request.html', {
        actor_id,
        difficulty,
        domains,
        selectable,
        selected_skills,
        selected_domains,
        skills,
    });

    return CONFIG.ChatMessage.documentClass.create({
        user: game.user,
        content,
        speaker: {
            alias: `Roll Request from ${game.user.name}`,
        }
    });
}

export function activateRollListeners(html) {
    html.on('click', 'button[data-action=roll]', ev => {
        ev.preventDefault();
        const target = $(ev.currentTarget);
        const form = target.closest("form");
        const data = {};

        data.difficulty = form.find('[name=difficulty]').val()
        data.skill =  form.find('[name=skill]:checked').data('value');
        data.domain =  form.find('[name=domain]:checked').data('value');
        data.skills = form.find('[name=skill]').map(function() { return $(this).data('value'); }).get()
        data.domains = form.find('[name=domain]').map(function() { return $(this).data('value'); }).get()

        const actor_id = CONFIG.ChatMessage.documentClass.getSpeaker().actor;

        if(actor_id === null) {
            ui.notifications.warn("heart.NoActorSelected")
            return;
        }
        const actor = game.actors.get(actor_id);

        data.actor_id = actor_id;

        data.skills = data.skills.filter( x => actor.data.data.skills[x].value );
        data.domains = data.domains.filter( x => actor.data.data.domains[x].value );
        if(!data.skills.includes(data.skill)) data.skill = undefined;
        if(!data.domains.includes(data.domain)) data.domain = undefined;

        CreateRollDialog(data);
    });

    html.on('click', 'button[data-action=roll-stress]', ev => {
        ev.preventDefault();
        const target = $(ev.currentTarget);
        const form = target.closest("form");
        const data = {};

        const actor_id = form.find('[name=actor_id]').val();
        data.multiplier = parseInt(form.find('[name=multiplier]').val());
        data.actor = game.actors.get(actor_id);
        CreateRollStressDialog(data);
    }); 
}

export async function CreateRollDialog(data = {}) {
    const actor_id = data.actor_id;
    const difficulties = data.difficulties || game.heart.difficulties
    const difficulty = data.difficulty;
    
    const difficultyMap = difficulties.reduce((map, difficulty) => {
        map[difficulty] = game.i18n.localize(`heart.Difficulty${titlecase(difficulty)}`);
        return map;
    }, {});

    const skill = data.skill;
    const skills = data.skills || game.heart.skills;
    const domain = data.domain;
    const domains = data.domains || game.heart.domains;

    const content = await renderTemplate('systems/heart/templates/dialogs/roll.html', {
        actor_id,
        difficulty,
        difficulties: difficultyMap,
        domain,
        domains,
        skill,
        skills,
    });

    const dialog = new Dialog({
        title: game.i18n.localize('Roll'),
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
                    
                    console.warn(data);
                    if(!(data.difficulty) || data.difficulty === "null") {
                        ui.notifications.warn(game.i18n.localize('heart.RollFailedDifficultyRequired'));
                        return;
                    }

                    data.skills = [];
                    data.domains = [];
                    Object.keys(data).forEach(function(key) {
                        if(key.startsWith('skill-')) {
                            if(data[key]) {
                                data.skills.push(key.replace(/^skill-/, ''));
                            }
                            delete data[key];
                        } else if(key.startsWith('domain-')) {
                            if(data[key]) {
                                data.domains.push(key.replace(/^domain-/, ''));
                            }
                            delete data[key];
                        }
                    });

                    if(data.skills.length === 1) {
                        data.selected_skills = data.skills[0];
                    }

                    if(data.domains.length === 1) {
                        data.selected_domains = data.domains[0];
                    }

                    HeartRoll(data);
                }
            }
        },
    }, {
        classes: ["heart", "dialog"],
        height: 366,
    });

    dialog.render(true);
    return dialog;
}

function HeartRoll(data={}) {
    let actor;
    if(data.actor_id) {
        actor = game.actors.get(data.actor_id);
    } else {
        actor = game.actors.get(CONFIG.ChatMessage.documentClass.getSpeaker().actor);
    }

    const dice = [game.i18n.localize('heart.RollBase')];
    if(data.skill) {
        dice.push(game.i18n.localize('heart.SheetSkill' + titlecase(data.skill)));
    }

    if(data.domain) {
        dice.push(game.i18n.localize('heart.SheetDomain' + titlecase(data.domain)));
    }

    if(data.mastery) {
        dice.push(`${game.i18n.localize('heart.Mastery')}`);
    }

    let difficulty = 0;
    if (data.difficulty === 'risky') {
        difficulty = 1
    } else if (data.difficulty === 'dangerous') {
        difficulty = 2
    }

    if (difficulty >= dice.length) {
        let formula = '2d10kl';
        return Roll.create(formula).evaluate({ 'async': true }).then(roll => {
            const dicepairs = roll.dice[0].results.map((x, i) => [x, "Too Difficult"]);
            let message = 'Failure';
            if (roll.result === '10') {
                message = 'SuccessAtACost';
            } else if (roll.result === '1') {
                message = 'CriticalFailure';
            }
            return CreateRollChatMessage(actor, roll, dicepairs, message);
        });
    } else {
        let formula = `${dice.length}d10`;
        if (difficulty > 0) {
            formula += `dh${difficulty}`
        }
        formula += 'kh';

        return Roll.create(formula).evaluate({ 'async': true }).then(roll => {
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
            return CreateRollChatMessage(actor, roll, dicepairs, message);
        });
    }
}

async function CreateRollChatMessage(actor, roll, dicepairs, result) {

    const content = await renderTemplate('systems/heart/templates/chat-messages/roll.html', {
        actor,
        roll,
        dicepairs,
        result
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
                    console.warn(data);
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

async function HeartStressRoll(data={}) {
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


async function CreateStressRollChatMessage(data={}) {
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
