import chatTemplateHTML from './roll.html';
import './roll.sass';

const fallout_results = {
    'no_fallout': (total, total_stress) => total > total_stress,
    'minor_fallout': (total, total_stress) => total <= total_stress && total <= 6,
    'major_fallout': (total, total_stress) => total <= total_stress && total > 6
};

export function initialise() {
    game.heart.fallout_results = Object.keys(fallout_results);
}

export default class FalloutRoll extends Roll {
    static get CHAT_TEMPLATE() { return chatTemplateHTML.path; }

    static build(total_stress=0, data={}, options={}) {
        options.total_stress = total_stress
        const formula = `1d12`;
        return new this(formula, data, options);
    }

    get result() {
        return Object.keys(fallout_results).find(result => fallout_results[result](this.total, this.options.total_stress));
    }

    async render(chatOptions = {}) {
        chatOptions = foundry.utils.mergeObject({
            user: game.user.id,
            flavor: null,
            template: this.constructor.CHAT_TEMPLATE,
            blind: false
        }, chatOptions);
        const isPrivate = chatOptions.isPrivate;

        // Execute the roll, if needed
        if (!this._evaluated) await this.evaluate({ async: true });

        const description = game.i18n.format('heart.fallout_roll:description(total_stress)', {
            total_stress: this.options.total_stress
        });

        // Define chat data
        const chatData = {
            description: isPrivate ? '???' : description,
            formula: isPrivate ? "???" : this._formula,
            flavor: isPrivate ? null : chatOptions.flavor,
            user: chatOptions.user,
            tooltip: isPrivate ? "" : await this.getTooltip(),
            total: isPrivate ? "?" : this.total,
            result: isPrivate ? "?" : this.result
        };

        // Render the roll display template
        return renderTemplate(chatOptions.template, chatData);
    }
}