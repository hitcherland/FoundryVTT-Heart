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
                    map[char.data._id] = char.name
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
            result: isPrivate ? "?" : this.result
        };

        // Render the roll display template
        return renderTemplate(chatOptions.template, chatData);
    }
}