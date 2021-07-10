import applicationHTML from './application.html';
import HeartApplication from '../base/application';

export default class PrepareRollRequestApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: applicationHTML.path,
        });
    }

    static get formType() {
        return 'prepare-roll-request';
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
            const data = new FormData(form);

            const difficulty = data.get('difficulty');
            const characters = data.getAll('character');
            const skills = data.getAll('skill');
            const domains = data.getAll('domain');
            const validHelpers = data.getAll('helper');

            CONFIG.ChatMessage.documentClass.create({
                flags: {
                    heart: {
                        ["roll-request"]: {
                            difficulty,
                            characters,
                            skills,
                            domains,
                            validHelpers,
                        }
                    }
                }
            });

            this.close();
        });
    }
}