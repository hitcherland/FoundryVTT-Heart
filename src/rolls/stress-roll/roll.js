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

        
        const showTakeStressButton = chatOptions.showTakeStressButton !== undefined ? chatOptions.showTakeStressButton : false;
        const showFalloutRollButton = chatOptions.showFalloutRollButton !== undefined ? chatOptions.showFalloutRollButton : false;

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
            showTakeStressButton: isPrivate ? false : showTakeStressButton,
            showFalloutRollButton: isPrivate ? false : !showTakeStressButton && showFalloutRollButton,
            total: isPrivate ? "?" : this.total,
            result: isPrivate ? "?" : this.result
        };

        console.warn(chatData, showTakeStressButton, chatOptions.showTakeStressButton, showFalloutRollButton, chatOptions.showFalloutRollButton);

        // Render the roll display template
        return renderTemplate(chatOptions.template, chatData);
    }

    takeStress(character, resistance='blood') {
        ui.notifications.warn('This is not properly implemented yet');
        if(character) {
            const character = game.actors.get(character);
            const updateData = {};
            const resistanceBlock = character.data.data.resistances[resistance];
            const newValue = resistanceBlock.value + Math.max(0, this.total - resistanceBlock.protection);
            
            updateData[`data.resistances.${resistance}.value`] = newValue;
            character.update(updateData)
        }
    }

    buildFalloutRoll(character) {
        if(character) {
            const character = game.actors.get(character);
            const stress = Object.values(character.data.data.resistances).reduce((sum, resistance) => {
                return sum + resistance.value;
            }, 0);
            return game.heart.rolls.FalloutRoll.build(stress);
        } else {
            ui.notifications.warn('This is not properly implemented yet');
            return game.heart.rolls.FalloutRoll.build(5);
        }

    }

    static activateListeners(html) {
        html.on('click', '.stress-roll [data-action=take-stress]', async function(ev) {
            ev.preventDefault();
            const target = $(ev.currentTarget);
            const msgElement = target.closest('.chat-message');
            const messageId = msgElement.data('messageId');
            const msg = game.messages.get(messageId);
            const stressRoll = msg.stressRoll;
            const actor_id = msg.speaker?.actor || CONFIG.ChatMessage.documentClass.getSpeaker().actor;
            stressRoll.takeStress(actor_id)
            msg.showTakeStressButton = false;
            msg.showFalloutRollButton = true;

            console.warn(msg.showTakeStressButton, msg.showFalloutRollButton)
        });

        html.on('click', '.stress-roll [data-action=roll-fallout]', async function(ev) {
            ev.preventDefault();
            const target = $(ev.currentTarget);
            const msgElement = target.closest('.chat-message');
            const messageId = msgElement.data('messageId');
            const msg = game.messages.get(messageId);
            const stressRoll = msg.stressRoll;
            const actor_id = msg.speaker?.actor || CONFIG.ChatMessage.documentClass.getSpeaker().actor;
            msg.falloutRoll = stressRoll.buildFalloutRoll(actor_id);
            msg.showFalloutRollButton = false;
        });
    }
}