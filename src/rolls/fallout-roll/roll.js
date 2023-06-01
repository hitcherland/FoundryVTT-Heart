import chatTemplateHTML from './roll.html';
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
                        mergeObject(buildData, moreData)
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
        if (!this._evaluated) await this.evaluate({ async: true });

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
        const output = await renderTemplate(chatOptions.template, chatData);
        return output;
    }

    async clearStress(msg) {
      return new Promise((resolve, reject) => {
          let character = msg.rolls[0].options.character || msg.speaker.actor;
          let stressType = msg.rolls[0].options.resistance || '';
  
          let actor = game.actors.get(character);
          let resistances = actor.system.resistances;
          let target_prop = "system.resistances"

          if (this.result == 'major-fallout') {
            Dialog.confirm({
              title: 'Confirm Stress Reset',
              content: `Are you sure you want to reset ${actor.name}'s stress? This cannot be reversed.`,
              yes: () => {
                Object.keys(resistances).forEach(key =>{Object.assign(resistances[key], { value: 0 });});
            
                let data = {};
                data[target_prop] = resistances;
                actor.update(data);
                msg.showClearStressButton = false
              }
            });
          }
          if (this.result == 'minor-fallout' && stressType) {
            removeMinorStress(stressType, actor, resistances, target_prop);
          }
          if (this.result == 'minor-fallout' && stressType == '') {
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

                removeMinorStress(resistance, actor, resistances, target_prop);
              },
              type: "clear-stress"
            });
          }
      });

      function removeMinorStress(stressType, actor, resistances, target_prop) {
        Dialog.confirm({
          title: `Confirm Set ${stressType} to 0`,
          content: `Are you sure you want to reset ${actor.name}'s ${stressType} stress to 0? This cannot be reversed.`,
          yes: () => {
            resistances[stressType].value = 0;

            let data = {};
            data[target_prop] = resistances;
            actor.update(data);
            msg.showClearStressButton = false;
          }
        });
      }
    }

    static activateListeners(html) {
      html.on('click', '.fallout-roll [data-action=clear-stress]', async function(ev) {
        ev.preventDefault();
        const target = $(ev.currentTarget);
        const msgElement = target.closest('.chat-message');
        const messageId = msgElement.data('messageId');
        const msg = game.messages.get(messageId);
        const falloutRoll = msg.falloutRoll;

        await falloutRoll.clearStress(msg);

        await ui.chat.updateMessage(msg, true);
        ui.chat.scrollBottom();
    });
  }
}