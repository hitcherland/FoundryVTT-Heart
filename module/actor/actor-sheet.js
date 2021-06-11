import { RenderStressRoll, RenderRoll } from '../chat/chat.js';

function RollStress(actor, resistance) {
    const total_stress = Object.values(actor.data.data.resistances).reduce((o, v) => {
        return o + v.value;
    }, 0);

    Roll.create('1d12').evaluate({ 'async': true }).then(async (roll) => {
        const result = parseInt(roll.result);
        let message = '';
        let clearStress = false;
        if (result > total_stress) {
            message = game.i18n.localize('heart.NoFallout');
        } else if (result <= 6) {
            message = game.i18n.localize('heart.MinorFallout');
            clearStress = resistance;
        } else {
            message = game.i18n.localize('heart.MajorFallout');
            clearStress = 'total';
        }

        const content = await RenderStressRoll(roll, actor, resistance, message, clearStress);

        const chatMessageData = {
            flavor: game.i18n.localize('heart.FalloutRollFlavor'),
            speaker: {
                actor
            },
            content,
            roll
        }

        ChatMessage.create(chatMessageData);
    });
}

async function CreateRollChatMessage(actor, roll, dicepair, result) {

    const content = await RenderRoll(actor, dicepair, result);

    const chatMessageData = {
        flavor: game.i18n.localize('heart.RollMessage'),
        speaker: {
            actor
        },
        content,
        roll
    }

    ChatMessage.create(chatMessageData);
}

function titlecase(str) {
    return str[0].toUpperCase() + str.slice(1);
}

async function RollPrompt(actor) {
    const callback = html => {
        const form = html[0].querySelector("form");
        const fd = new FormDataExtended(form);
        const data = fd.toObject();

        const dice = [game.i18n.localize('heart.RollBase')];
        if(data.skill) {
            dice.push(`Skill: ${game.i18n.localize('heart.SheetSkill' + titlecase(data.skill))}`);
        }

        if(data.domain) {
            dice.push(`Domain: ${game.i18n.localize('heart.SheetDomain' + titlecase(data.domain))}`);
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
                if (roll.result === '10') {
                    return CreateRollChatMessage(actor, roll, dicepairs, 'SuccessAtACost');
                } else if (roll.result === '1') {
                    return CreateRollChatMessage(actor, roll, dicepairs, 'CriticalFailure');
                } else {
                    return CreateRollChatMessage(actor, roll, dicepairs, 'Failure');
                }
            });
        } else {
            let formula = `${dice.length}d10`; //`{${dice.join(', ')}}`;
            if (difficulty > 0) {
                formula += `dh${difficulty}`
            }
            formula += 'kh';

            return Roll.create(formula).evaluate({ 'async': true }).then(roll => {

                const dicepairs = roll.dice[0].results.map((roll, i) => { return {roll, flavor: dice[i]} });
                console.warn(dicepairs, roll.dice);

                const result = parseInt(roll.result);
                if (result >= 10) {
                    return CreateRollChatMessage(actor, roll, dicepairs, 'CriticalSuccess');
                } else if (result >= 8) {
                    return CreateRollChatMessage(actor, roll, dicepairs, 'Success');
                } else if (result >= 6) {
                    return CreateRollChatMessage(actor, roll, dicepairs, 'SuccessAtACost');
                } else if (result >= 2) {
                    return CreateRollChatMessage(actor, roll, dicepairs, 'Failure');
                } else {
                    return CreateRollChatMessage(actor, roll, dicepairs, 'CriticalFailure');
                }
            });
        }
    }

    const content = await renderTemplate('systems/heart/templates/rolls/roll-dialog-prompt.html', {
        actor
    });

    Dialog.prompt({
        title: 'Make a Roll',
        label: 'Roll',
        content,
        callback,
        options: {
            classes: ['dialog', 'heart']
        }
    })
}

export class ActorSheetHeartCharacter extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["heart", "sheet", "actor", "character"],
        });
    }

    get template() {
        return 'systems/heart/templates/actors/heart-character-sheet.html'
    }

    getData() {
        const data = super.getData();
        if (data.data.img === CONST.DEFAULT_TOKEN) {
            data.data.img = "systems/heart/assets/heart_logo_playbook.png";
        }
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.ordered-checkable-box:not(.checked)').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {}
            data[target] = index + 1;
            this.actor.update(data);
        });

        html.find('.ordered-checkable-box.checked').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {}
            if (index + 1 === getProperty(this.actor.data, target)) {
                data[target] = index;
            } else {
                data[target] = index + 1;
            }
            this.actor.update(data);
        });

        html.find('.rollable[data-resistance]').click(ev => {
            const element = ev.currentTarget;
            const resistance = element.dataset.resistance;
            RollStress(this.actor, resistance);
        });

        html.find('.rollable:not([data-resistance])').click(ev => {
            const element = ev.currentTarget;
            RollPrompt(this.actor);
        });
    }
}