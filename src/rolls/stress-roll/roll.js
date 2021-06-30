import chatTemplateHTML from './roll.html';

export default class StressRoll extends Roll {
    static get CHAT_TEMPLATE() { return chatTemplateHTML.path; }

    static build(result, dice_size, data={}, options={}) {
        options.result = result;
        options.dice_size = dice_size;

        let formula = dice_size;
        if(result === 'critical_failure') {
            formula = `2 * {${dice_size}}`;
        }
        return new this(formula, data, options);
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

        const description = game.i18n.format('heart.stress_roll:description(dice_size,result)', {
            dice_size: this.options.dice_size,
            result: game.i18n.localize(`heart.result:${this.options.result}`)
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