import chatTemplateHTML from './roll.html';
import tooltipTemplateHTML from '../heart-roll/tooltip.html';
import './roll.sass';

const fallout_results = {
    'no-fallout': (total, totalStress) => total > totalStress,
    'minor-fallout': (total, totalStress) => total <= totalStress && total <= 6,
    'major-fallout': (total, totalStress) => total <= totalStress && total > 6
};

export function initialise() {
    game.heart.fallout_results = Object.keys(fallout_results);
}

export default class FalloutRoll extends Roll {
    static get CHAT_TEMPLATE() { return chatTemplateHTML.path; }

    static get requirements() {
        const characters = game.actors.filter(x => x.type === 'character');
        return {
            character: {
                label: game.i18n.localize(`heart.character.label-single`),
                options: characters.reduce((map, char) => {
                    map[char.id] = char.name
                    return map;
                }, {})
            }, 
        }
    }

    static build({character}={}, data={}, options={}) {
        return new Promise((resolve, reject) => {
            const requirements = this.requirements;
        
            if(character !== undefined) delete requirements.character;

            const buildData = {character};
            if(Object.keys(requirements).length > 0) {
                game.heart.applications.RequirementApplication.build({
                    requirements,
                    callback: moreData => {
                        foundry.utils.mergeObject(buildData, moreData)
                        resolve(this._build(buildData, data, options));
                    },
                    type: 'prepare-fallout-roll',
                });
            } else {
                return resolve(this._build(buildData, data, options));
            }
        })
    }

    static _build({character}, data={}, options={}) {
        const actor = game.actors.get(character).proxy;
        options.totalStress = actor.totalStress;
        return new this('1d12', data, options);
    }

    get result() {
        return Object.keys(fallout_results).find(result => fallout_results[result](this.total, this.options.totalStress));
    }

    static get TOOLTIP_TEMPLATE() { return tooltipTemplateHTML.path; }

    async getTooltip() {
        const parts = this.dice.map(d => d.getTooltipData());
        const kept = this.dice.findIndex(d => d.total === this.total);
        return foundry.applications.handlebars.renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { kept, parts });
    }

    async render(chatOptions = {}) {
        chatOptions = foundry.utils.mergeObject({
            user: game.user.id,
            flavor: null,
            template: this.constructor.CHAT_TEMPLATE,
            blind: false
        }, chatOptions);
        const isPrivate = chatOptions.isPrivate;

        const showClearStressButton = chatOptions.showClearStressButton !== undefined ? chatOptions.showClearStressButton : false;

        // Execute the roll, if needed
        if (!this._evaluated) await this.evaluate();

        const description = game.i18n.format('heart.rolls.fallout-roll.description(totalStress)', {
            totalStress: this.options.totalStress
        });

        // Define chat data
        const chatData = {
            description: isPrivate ? '???' : description,
            formula: isPrivate ? "???" : this._formula,
            flavor: isPrivate ? null : chatOptions.flavor,
            user: chatOptions.user,
            tooltip: isPrivate ? "" : await this.getTooltip(),
            total: isPrivate ? "?" : this.total,
            result: isPrivate ? "?" : this.result,
            showClearStressButton: isPrivate ? false : showClearStressButton,
        };

        // Render the roll display template
        const output = await foundry.applications.handlebars.renderTemplate(chatOptions.template, chatData);
        return output;
    }

    async clearStress(msg) {
        let character = msg.rolls[0].options.character || msg.speaker.actor;
        let actor = game.actors.get(character);
        let resistances = actor.system.resistances;

        if (this.result == 'major-fallout') {
            Object.keys(resistances).forEach(key => { Object.assign(resistances[key], { value: 0 }); });
            await actor.update({ "system.resistances": resistances });
            msg.showClearStressButton = false;
        }

        if (this.result == 'minor-fallout') {
            await new Promise(resolve => {
                game.heart.applications.RequirementApplication.build({
                    requirements: {
                        resistance: {
                            options: game.heart.resistances.reduce((map, resistance) => {
                                map[resistance] = game.i18n.localize(`heart.resistance.${resistance}`)
                                return map;
                            }, {})
                        }
                    },
                    callback: async ({resistance}) => {
                        resistances[resistance].value = 0;
                        await actor.update({ "system.resistances": resistances });
                        msg.showClearStressButton = false;
                        resolve();
                    },
                    type: "clear-stress"
                });
            });
        }
    }

    static activateListeners(html) {
      const el = html instanceof HTMLElement ? html : html[0] || html;
      el.addEventListener('click', async function(ev) {
        const button = ev.target.closest('.fallout-roll [data-action=clear-stress]');
        if (!button) return;

        ev.preventDefault();
        const msgElement = button.closest('.chat-message');
        const messageId = msgElement.dataset.messageId;
        const msg = game.messages.get(messageId);
        const falloutRoll = msg.falloutRoll;

        await falloutRoll.clearStress(msg);

        await ui.chat.updateMessage(msg, true);
        ui.chat.scrollBottom();
      });
  }
}