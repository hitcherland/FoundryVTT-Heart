import applicationHTML from './application.html';
import HeartApplication from '../base/application';

export default class PrepareStressRollApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: applicationHTML.path,
        });
    }

    static get formType() {
        return 'prepare-stress-roll';
    }

    getData() {
        const data = super.getData();
        return mergeObject(data, {
            'characters': game.actors.filter(actor => actor.type === 'character').reduce((map, char) => {
                map[char.id] = char.name;
                return map;
            }, {}),
            'results': game.heart.stress_results.reduce((map, result) => {
                map[result] = game.i18n.localize(`heart.result.${result}`);
                return map;
            }, {}),
            'dice_sizes': game.heart.stress_dice.reduce((map, dice) => {
                map[dice] = game.i18n.format(`heart.dice_size.d(N)`, {N: dice.replace(/^d/, '')});
                return map;
            }, {}),
        });
    }
    
    activateListeners(html) {
        super.activateListeners(html);
        const form = html.get(0);

        html.find('[data-action=submit]').click(async ev => {
            const data = new FormDataExtended(form);

            const characterId = data.get('character');
            const result = data.get('result');
            const diceSize = data.get('dice-size');

            const roll = await game.heart.rolls.StressRoll.build(result, diceSize);
            const msg = roll.toMessage({
                speaker: {
                    actor: characterId
                }
            });
            msg.stressRoll = roll;
            this.close()
        });
    }
}