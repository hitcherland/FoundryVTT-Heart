import applicationHTML from './application.html';
import HeartApplication from '../base/application';

export default class PrepareRollApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: applicationHTML.path,
        });
    }

    static get formType() {
        return 'prepare-roll'
    }

    getData() {
        const data = super.getData();
        return mergeObject(data, {
            'characters': game.actors.filter(actor => actor.type === 'character').reduce((map, char) => {
                map[char.id] = char.name;
                return map;
            }, {}),
            'skills': game.heart.skills.reduce((map, skill) => {
                map[skill] = game.i18n.localize(`heart.skill.${skill}`);
                return map;
            }, {}),
            'domains': game.heart.domains.reduce((map, domain) => {
                map[domain] = game.i18n.localize(`heart.domain.${domain}`);
                return map;
            }, {}),
            'difficulties': game.heart.difficulties.reduce((map, difficulty) => {
                map[difficulty] = game.i18n.localize(`heart.difficulty.${difficulty}`);
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
            const character = game.actors.get(characterId);

            const difficulty = data.get('difficulty');
            const skill = data.get('skill');
            const domain = data.get('domain');
            const mastery = data.get('mastery');
            const helpers = JSON.parse(data.get('helper')).map(x => {
                return game.actors.get(x);
            });

            const roll = await game.heart.rolls.HeartRoll.build({
                difficulty,
                skill: character.data.data.skills[skill].value ? skill : undefined,
                domain: character.data.data.domains[domain].value ? domain : undefined,
                mastery,
                helpers
            });

            roll.toMessage({
                speaker: {
                    actor: characterId
                }
            });

            this.close()
        });

        const data = new FormDataExtended(form);
        const characterId = data.get('character');
        html.find(`[name=helper] option[value=${characterId}]`).attr('disabled', 'disabled');

        html.on('change', '[name=character]', (ev) => {
            const characterSelect = html.find('[name=character]');
            const helperSelect = html.find('[name=helper]');
            const val = characterSelect.val();

            helperSelect.find(`option`).each((i, el) => {
                const element = $(el);
                if(element.val() === val) {

                    element.attr('disabled', 'disabled');
                    element.attr('checked', false);
                } else {
                    element.removeAttr('disabled')
                }
            });
        }); 
    }
}