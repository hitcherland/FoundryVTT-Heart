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
    'critical_failure',
    'failure',
    'success_at_a_cost'
];

export function initialise() {
    const results = {...normal_results, difficult_results};
    game.heart.difficulties = Object.keys(difficulty_reductions);
    game.heart.results = Object.keys(results);
    game.heart.stress_results = stress_results;

    Hooks.on('renderChatLog', (app, html, data) => HeartRoll.activateListeners(html));
    Hooks.on('renderChatPopout', (app, html, data) => HeartRoll.activateListeners(html));
}

export default class HeartRoll extends Roll {
    static get CHAT_TEMPLATE() { return chatTemplateHTML.path; }
    static get TOOLTIP_TEMPLATE() { return tooltipTemplateHTML.path; } 

    static build(pools = {}, data={}, options={}) {
        const {
            skill,
            domain,
            mastery = false,
            helpers = [],
            difficulty = 'standard'
        } = pools;

        let formula_terms = [];
        [
            game.i18n.localize('heart.prepare:roll:base'),
            skill ? game.i18n.localize(`heart.skill:${skill}`) : undefined,
            domain ? game.i18n.localize(`heart.domain:${domain}`) : undefined, 
            mastery ? game.i18n.localize(`heart.prepare:roll:mastery`) : false,
            ...helpers].forEach(flavor => {
            if (!flavor) return;
            formula_terms.push(`1d10[${flavor}]`);
        });


        if(difficulty === 'impossible') {
            formula_terms = [];
        }

        const difficulty_reduction = difficulty_reductions[difficulty];
        const difficulty_modifier = difficulty_reduction > 0 ? `dh${difficulty_reduction}` : ''
        const formula = `{${formula_terms.join(', ')}}${difficulty_modifier}kh`;

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

        const description = game.i18n.format('heart.roll:description(difficulty, count)', {
            difficulty: game.i18n.localize(`heart.difficulty:${this.options.difficulty}`),
            count: this.dice.length
        });

        // Define chat data
        const chatData = {
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

    async buildStressRoll(dice_size='d4', data={}, options={}) {
        if (!this._evaluated) await this.evaluate({ async: true });
        return game.heart.rolls.StressRoll.build(this.result, dice_size, data, options);
    }

    static activateListeners(html) {
        html.on('click', '.heart-roll [data-action=roll-stress]', async function(ev) {
            const target = $(ev.currentTarget);
            const msgElement = target.closest('.chat-message');
            const messageId = msgElement.data('messageId');
            const msg = game.messages.get(messageId);
            const roll = msg.roll;
            const stressRoll = await roll.buildStressRoll();
            msg.stressRoll = stressRoll;
            msg.showStressRollButton = false;
        });
    }
}