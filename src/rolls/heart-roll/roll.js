import './roll.sass';

import chatTemplateHTML from './roll.html';
import tooltipTemplateHTML from './tooltip.html';

const difficulty_reductions = {
    standard: 0,
    risky: 1,
    dangerous: 2,
    impossible: Infinity,
}

const normal_results = {
    'critical_failure': [1, 1],
    'failure': [2, 5],
    'success_at_a_cost': [6, 7],
    'success': [8, 9],
    'critical_success': [10, 10]
};

const difficult_results = {
    'critical_failure': [1, 1],
    'failure': [2, 9],
    'success_at_a_cost': [10, 10],
}

const stress_results = [
    'n_a',
    'success_at_a_cost',
    'failure',
    'critical_failure'
];

export function initialise() {
    const results = {...normal_results, ...difficult_results};
    game.heart.difficulties = Object.keys(difficulty_reductions);
    game.heart.results = Object.keys(results);
    game.heart.stress_results = stress_results;
}

export default class HeartRoll extends Roll {
    static get CHAT_TEMPLATE() { return chatTemplateHTML.path; }
    static get TOOLTIP_TEMPLATE() { return tooltipTemplateHTML.path; } 

    static get requirements() {
        const characters = game.actors.filter(x => x.type === 'character');
        const skills = game.heart.skills;
        const domains = game.heart.domains;
        const difficulties = game.heart.difficulties;
        return {
            character: {
                label: game.i18n.localize(`heart.character.label-single`),
                options: characters.reduce((map, char) => {
                    map[char.id] = char.name
                    return map;
                }, {})
            }, 
            difficulty: {
                label: game.i18n.localize(`heart.difficulty.label-single`),
                options: difficulties.reduce((map, difficulty) => {
                    map[difficulty] = game.i18n.localize(`heart.difficulty.${difficulty}`)
                    return map;
                }, {})
            }, 
            skill: {
                label: game.i18n.localize(`heart.skill.label-single`),
                options: skills.reduce((map, skill) => {
                    map[skill] = game.i18n.localize(`heart.skill.${skill}`)
                    return map;
                }, {})
            }, 
            domain: {
                label: game.i18n.localize(`heart.domain.label-single`),
                options: domains.reduce((map, domain) => {
                    map[domain] = game.i18n.localize(`heart.domain.${domain}`)
                    return map;
                }, {})
            }, 
            mastery: {
                label: game.i18n.localize(`heart.mastery.label-single`),
                isCheckbox: true,
            }, 
            helpers: {
                label: game.i18n.localize(`heart.helper.label-single`),
                isMany: true,
                options: characters.reduce((map, char) => {
                    map[char.id] = char.name
                    return map;
                }, {})
            }
        }
    }

    static build(pools = {}, data={}, options={}) {
        return new Promise((resolve, reject) => {
            let {
                character,
                skill,
                domain,
                mastery,
                helpers,
                difficulty
            } = pools;

            const requirements = this.requirements;
        
            if(character !== undefined) delete requirements.character;
            if(difficulty !== undefined) delete requirements.difficulty;
            if(skill !== undefined) delete requirements.skill;
            if(domain !== undefined) delete requirements.domain;
            if(mastery !== undefined) delete requirements.mastery;
            if(helpers !== undefined) delete requirements.helpers;

            const buildData = {
                character,
                difficulty,
                skill,
                domain,
                mastery,
                helpers,
            };

            if(Object.keys(requirements).length > 0) {
                game.heart.applications.RequirementApplication.build({
                    requirements,
                    callback: moreData => {
                        mergeObject(buildData, moreData)
                        resolve(this._build(buildData, data, options));
                    },
                    type: 'prepare-roll',
                });
            } else {
                return resolve(this._build(buildData, data, options));
            }
        })
    }

    static _build({character, difficulty, skill, domain, mastery, helpers}={}, data={}, options={}) {
        const actor = game.actors.get(character);

        if(skill !== null)
            skill = actor.system.skills[skill].value ? skill : undefined;

        if(domain !== null)
            domain = actor.system.domains[domain].value ? domain : undefined;
            
        helpers = helpers.filter(x => x !== character);

        let formula_terms = [];
        [
            game.i18n.localize('heart.rolls.roll.base'),
            skill ? game.i18n.localize(`heart.skill.${skill}`) : undefined,
            domain ? game.i18n.localize(`heart.domain.${domain}`) : undefined, 
            mastery ? game.i18n.localize(`heart.mastery.short`) : false,
            ...helpers.map(h => game.actors.get(h).name)].forEach(flavor => {
            if (!flavor) return;
            formula_terms.push(`1d10[${flavor}]`);
        });


        if(difficulty === 'impossible') {
            formula_terms = [];
        }

        const difficulty_reduction = difficulty_reductions[difficulty];
        const difficulty_modifier = difficulty_reduction > 0 ? `dh${difficulty_reduction}` : ''
        const formula = `{${formula_terms.join(', ')}}${difficulty_modifier}kh`;

        options.character = character;
        options.result_set = formula_terms.length > difficulty_reduction ? 'normal' : 'difficult';
        options.skill = skill;
        options.domain = domain;
        options.mastery = mastery;
        options.difficulty = difficulty;
        options.helpers = helpers;

        return new this(formula, data, options);
    }

    get result() {
        if(this.options.difficulty === 'impossible') {
            return 'failure';   
        }

        let results = normal_results;
        if(this.options.result_set === 'difficult') {
            results = difficult_results;
        }

        return Object.keys(results).find(result => {
            const [minVal, maxVal] = results[result];
            return minVal <= this.total && this.total <= maxVal;
        });
    }

    async render(chatOptions = {}) {
        chatOptions = foundry.utils.mergeObject({
            user: game.user.id,
            flavor: null,
            template: this.constructor.CHAT_TEMPLATE,
            blind: false
        }, chatOptions);
        const isPrivate = chatOptions.isPrivate;

        const showStressRollButton = chatOptions.showStressRollButton !== undefined ? chatOptions.showStressRollButton : false;

        // Execute the roll, if needed
        if (!this._evaluated) await this.evaluate({ async: true });

        const description = game.i18n.format('heart.rolls.roll.description(difficulty,count)', {
            difficulty: game.i18n.localize(`heart.difficulty.${this.options.difficulty}`),
            count: this.dice.length
        });

        // Define chat data
        const chatData = {
            character: chatOptions.character || this.options.character,
            description: isPrivate ? '???' : description,
            formula: isPrivate ? "???" : this._formula,
            flavor: isPrivate ? null : chatOptions.flavor,
            user: chatOptions.user,
            tooltip: isPrivate ? "" : await this.getTooltip(),
            showStressRollButton: isPrivate ? false : showStressRollButton && stress_results.includes(this.result),
            total: isPrivate ? "?" : this.total,
            result: isPrivate ? "?" : this.result
        };

        // Render the roll display template
        return renderTemplate(chatOptions.template, chatData);
    }

    async getTooltip() {
        const parts = this.dice.map(d => d.getTooltipData());
        const kept = this.dice.findIndex(d => d.total == this.total);
        return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {
            kept,
            parts 
        });
    }

    static activateListeners(html) {
        html.on('click', '.heart-roll [data-action=roll-stress]', async function(ev) {
            const target = $(ev.currentTarget);
            const msgElement = target.closest('.chat-message');
            const messageId = msgElement.data('messageId');
            const msg = game.messages.get(messageId);
            const roll = msg.roll;

            
            if (!roll._evaluated) await this.evaluate({ async: true });
            const stressRoll = await game.heart.rolls.StressRoll.build({
                character: roll.options.character,
                result: roll.result,
            }, msg);

            await stressRoll.evaluate({async: true});
            if (game.dice3d && game.settings.get('heart', 'showStressRoll3dDice')) {
              await game.dice3d.showForRoll(stressRoll, game.user, true);
            }

            await msg.setStressRoll(stressRoll);
            msg.showStressRollButton = false;

            await ui.chat.updateMessage(msg, true);
            ui.chat.scrollBottom();
        });
    }
}