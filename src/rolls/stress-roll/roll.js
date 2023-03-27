import chatTemplateHTML from './roll.html';

export default class StressRoll extends Roll {
    static get CHAT_TEMPLATE() { return chatTemplateHTML.path; }

    static get requirements() {
        const characters = game.actors.filter(x => x.type === 'character');
        const results = game.heart.stress_results;
        const die_sizes = game.heart.stress_dice;
        //Prepend resistances array with a blank string so that users don't have to select one
        const resistances = [''].concat(game.heart.resistances);
        let requirements = {
            character: {
                label: game.i18n.localize(`heart.character.label-single`),
                options: characters.reduce((map, char) => {
                    map[char.id] = char.name
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
            die_size: {
                label: game.i18n.localize(`heart.die_size.label-single`),
                options: die_sizes.reduce((map, die_size) => {
                    map[die_size] = game.i18n.format(`heart.die_size.d(N)`, {N: die_size.replace(/^d/, '')})
                    return map;
                }, {})
            }
        };
        if (game.settings.get('heart', 'preSelectStressType')){
          const resistance = {
            label: game.i18n.localize(`heart.resistance.label-single`),
            options: resistances.reduce((map, resistance) => {
                map[resistance] = game.i18n.format(`heart.resistance.${resistance}`)
                if(resistance === "") map[resistance] = resistance
                return map;
            }, {})
          };
          requirements["resistance"] = resistance;
        }
        return requirements;
    }

    static build({result, die_size, character, resistance}={}, data={}, options={}) {
        return new Promise((resolve, reject) => {
            const requirements = this.requirements;

            if(result !== undefined) delete requirements.result;
            if(die_size !== undefined) delete requirements.die_size;
            if(character !== undefined) delete requirements.character;
            if(resistance !== undefined) delete requirements.resistance;

            const buildData = {
                result,
                die_size,
                character,
                resistance
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

    static _build({result, die_size, character, resistance}, data={}, options={}) {
        options.result = result;
        options.die_size = die_size;
        options.character = character;
        options.resistance = resistance;

        let formula = die_size;
        if(result === 'critical_failure') {
            formula = `2 * {${die_size}}`;
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

        const description = game.i18n.format('heart.rolls.stress-roll.description(die_size)', {
            die_size: this.options.die_size,
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
            resistance: isPrivate ? "" : this.options.resistance,
            total: isPrivate ? "?" : this.total,
            result: isPrivate ? "?" : this.result
        };

        // Render the roll display template
        return renderTemplate(chatOptions.template, chatData);
    }

    async takeStress(character, resistance='') {
        return new Promise((resolve, reject) => {
            character = character || this.options.character;
            resistance = resistance || this.options.resistance;
            if(resistance) {
              this.applyStress(character, resistance);
              resolve();
              return;
            }

            game.heart.applications.RequirementApplication.build({
                requirements: {
                    resistance: {
                        options: game.heart.resistances.reduce((map, resistance) => {
                            map[resistance] = game.i18n.localize(`heart.resistance.${resistance}`)
                            return map;
                        }, {})
                    }
                },
                callback: ({resistance}) => {

                    this.applyStress(character, resistance, reject);
                    resolve();
                },
                type: "take-stress"
            });
        });
    }

    applyStress(character, resistance, reject) {
      const actor = game.actors.get(character);
      const updateData = {};
      const resistanceBlock = actor.system.resistances[resistance];
      const total = this.total;
      if (total === undefined) {
        ui.notifications.error(`Somehow this roll isn't evaluated`, this);
        reject();
      }
      const newValue = (resistanceBlock.value || 0) + Math.max(0, parseInt(total) - resistanceBlock.protection);
      updateData[`system.resistances.${resistance}.value`] = newValue;
      console.log(actor, updateData, resistanceBlock, total);
      actor.update(updateData);
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
            await stressRoll.takeStress(actor_id)
            msg.showTakeStressButton = false;
            msg.showFalloutRollButton = true;

            await ui.chat.updateMessage(msg, true);
            ui.chat.scrollBottom();
        });

        html.on('click', '.stress-roll [data-action=roll-fallout]', async function(ev) {
            ev.preventDefault();
            const target = $(ev.currentTarget);
            const msgElement = target.closest('.chat-message');
            const messageId = msgElement.data('messageId');
            const msg = game.messages.get(messageId);
            const stressRoll = msg.stressRoll;
            const falloutRoll = await game.heart.rolls.FalloutRoll.build({
                character: stressRoll.options.character
            });

            await falloutRoll.evaluate({async: true});
            if (game.dice3d && game.settings.get('heart', 'showFalloutRoll3dDice')) {
              await game.dice3d.showForRoll(falloutRoll, game.user, true);
            }

            await msg.setFalloutRoll(falloutRoll);
            msg.showFalloutRollButton = false;

            await ui.chat.updateMessage(msg, true);
            ui.chat.scrollBottom();
        });
    }
}