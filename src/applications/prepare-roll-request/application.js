import applicationHTML from './application.html';
import HeartApplication from '../base/application';

export default class PrepareRollRequestApplication extends HeartApplication {
    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        actions: {
            ...super.DEFAULT_OPTIONS.actions,
            submit: PrepareRollRequestApplication._onSubmit,
        },
    };

    static PARTS = {
        main: { template: applicationHTML.path, scrollable: [".heart.form"] },
    };

    static get formType() {
        return 'prepare-roll-request';
    }

    async _prepareContext(options) {
        return {
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
        };
    }

    static _onSubmit(event, target) {
        const form = this.element;
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
                        difficulty, characters, skills, domains, validHelpers,
                    }
                }
            }
        });
        this.close();
    }
}
