import chatTemplateHTML from './roll.html';

export default class StressRoll extends Roll {
    static get CHAT_TEMPLATE() { return chatTemplateHTML.path; }

    static get requirements() {
        const characters = game.actors.filter(x => x.type === 'character');
        const results = game.heart.stress_results;
        const di_sizes = game.heart.stress_dice;
        return {
            character: {
                label: game.i18n.localize(`heart.character.label-single`),
                options: characters.reduce((map, char) => {
                    map[char.data._id] = char.name
                    return map;
                }, {})
            }, 
            result: {
                label: game.i18n.localize(`heart.result.label-single`),
                options: results.reduce((map, difficulty) => {
                    map[difficulty] = game.i18n.localize(`heart.result.${difficulty}`)
                    return map;
                }, {})
            }, 
            di_size: {
                label: game.i18n.localize(`heart.di_size.label-single`),
                options: di_sizes.reduce((map, di_size) => {
                    map[di_size] = game.i18n.format(`heart.di_size.d(N)`, {N: di_size.replace(/^d/, '')})
                    return map;
                }, {})
            }
        };
    }

    static build({result, di_size, character}={}, data={}, options={}) {
        return new Promise((resolve, reject) => {
            const requirements = this.requirements;
        
            if(result !== undefined) delete requirements.result;
            if(di_size !== undefined) delete requirements.di_size;
            if(character !== undefined) delete requirements.character;

            const buildData = {
                result,
                di_size,
                character
            };

            if(Object.keys(requirements).length > 0) {
                game.heart.applications.RequirementApplication.build({
                    requirements,
                    callback: moreData => {
                        mergeObject(buildData, moreData)
                        resolve(this._build(buildData, data, options));
                    },
                    type: 'prepare-stress-roll',
                });
            } else {
                return resolve(this._build(buildData, data, options));
            }
        })
    }

    static _build({result, di_size, character}, data={}, options={}) {
        options.result = result;
        options.di_size = di_size;
        options.character = character;

        let formula = di_size;
        if(result === 'critical_failure') {
            formula = `2 * {${di_size}}`;
        }

        console.warn(formula);
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

        const description = game.i18n.format('heart.rolls.stress-roll.description(di_size)', {
            di_size: this.options.di_size,
            result: game.i18n.localize(`heart.result:${this.options.result}`)
        });

        // Define chat data
        const chatData = {
            character: chatOptions.character || this.options.character,
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

        // Render the roll display template
        return renderTemplate(chatOptions.template, chatData);
    }

    takeStress(character, resistance='blood') {
        character = character || this.options.character;
        if(character) {
            const actor = game.actors.get(character);
            const updateData = {};
            const resistanceBlock = actor.data.data.resistances[resistance];
            console.warn(resistanceBlock, resistance, this.total, this);
            const newValue = (resistanceBlock.value || 0) + Math.max(0, parseInt(this.total) - resistanceBlock.protection);
            console.warn(newValue);
            
            updateData[`data.resistances.${resistance}.value`] = newValue;
            actor.update(updateData)
        }
    }

    buildFalloutRoll(character) {
        character = character || this.options.character;
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
            const actor_id = stressRoll.options.character;
            stressRoll.takeStress(actor_id)
            msg.showTakeStressButton = false;
            msg.showFalloutRollButton = true;
        });

        html.on('click', '.stress-roll [data-action=roll-fallout]', async function(ev) {
            ev.preventDefault();
            const target = $(ev.currentTarget);
            const msgElement = target.closest('.chat-message');
            const messageId = msgElement.data('messageId');
            const msg = game.messages.get(messageId);
            const stressRoll = msg.stressRoll;
            const actor_id = stressRoll.options.character;
            msg.falloutRoll = stressRoll.buildFalloutRoll(actor_id);
            msg.showFalloutRollButton = false;
        });
    }
}