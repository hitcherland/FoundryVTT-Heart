import applicationHTML from './application.html';
import HeartApplication from '../base/application';

export default class PrepareFalloutRollApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: applicationHTML.path,
        });
    }

    static get formType() {
        return 'prepare-fallout-roll'
    }

    getData() {
        const data = super.getData();

        return mergeObject(data, {
            'characters': game.actors.filter(actor => actor.type === 'character').reduce((map, char) => {
                map[char.id] = char.name;
                return map;
            }, {})
        });
    }
    
    activateListeners(html) {
        super.activateListeners(html);
        const form = html.get(0);

        html.find('[data-action=submit]').click(async ev => {
            const data = new FormDataExtended(form);
            const characterId = data.get('character');
            const character = game.actors.get(characterId).proxy;
            const stress = character.totalStress;

            const roll = await game.heart.rolls.FalloutRoll.build(stress);
            roll.toMessage({
                speaker: {
                    actor: characterId
                }
            });
            this.close()
        });
    }
}