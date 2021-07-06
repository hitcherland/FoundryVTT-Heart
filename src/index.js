import templates from './**/*.@(html|handlebars|hbs)';
import './index.sass';
import './common/sheet.sass';

import modules from './**/index.js';
import './**/lang/*.json';
import './**/template.json';

/*
import {activateRollListeners} from './module/roll/chat-log.js';
import {PrepareRollRequestApplication} from './module/applications/prepare-roll-request.js';
import {PrepareRollApplication} from './module/applications/prepare-roll.js';
import {PrepareStressRollApplication} from './module/applications/prepare-stress-roll.js';
import {PrepareFalloutRollApplication} from './module/applications/prepare-fallout-roll.js';
*/

function activateTemplates() {
    templates.forEach(function(module) {
        const template = module.default;
        const compiled = Handlebars.compile(template.source);
        Handlebars.registerPartial(template.path, compiled);
        _templateCache[template.path] = compiled;
    });
}

function registerSettings() {
    game.settings.register('heart', 'normalActionTable', {
        name: 'Normal Actions RollTable Source',
        hint: 'When we roll d10 for normal actions, use this table',
        scope: 'world',
        config: true,
        default: 'Compendium.heart.action-tables.eEJiBJABFXLu1QKR',
        type: String,
    });

    game.settings.register('heart', 'difficultActionTable', {
        name: 'Difficult Actions RollTable Source',
        hint: 'When we roll d10 for difficult actions, use this table',
        scope: 'world',
        config: true,
        default: 'Compendium.heart.action-tables.GkSEWldXerpMjmkG',
        type: String,
    });
}

function titlecase(str) {
    return str.replace(/\w\S*/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

function initialise() {
    activateTemplates();

    game.heart = {
        difficulties: ['standard', 'risky', 'dangerous', 'impossible'],
        resistances: ['blood', 'mind', 'echo', 'fortune', 'supplies'],
        skills: ['compel', 'delve', 'discern', 'endure', 'evade', 'hunt', 'kill', 'mend','sneak'],
        domains: ['cursed', 'desolate', 'haven', 'occult', 'religion', 'technology', 'warren', 'wild'],
        stress_dice: ['d4', 'd6', 'd8', 'd10', 'd12'],
        roll_results: ['critical_failure', 'failure', 'success_at_a_cost', 'success', 'critical_success'],
        stress_results: ['no_fallout', 'minor_fallout', 'major_fallout']
    };

    console.log(`heart | Registering ${modules.length} modules`);
    modules.forEach(module => {
        if(module.initialise !== undefined) {
            module.initialise();
        }
    });

    Handlebars.registerHelper('ordered-checkable', function(value, max) {
        let output = '';
        for(let i=0; i<max; i++) {
            output += `<a data-index="${i}" class="ordered-checkable-box${i < value ? ' checked': ''}"></a>`;
        }
        return output;
    });

    Handlebars.registerHelper('join', function(separator, ...items) {
        const options = items.pop();
        const array = options.hash.array || [];
        return [...items, ...array].join(separator);
    });

    Handlebars.registerHelper('concat', function(a, b) {
        return a + b;
    });

    Handlebars.registerHelper('titlecase', function(a) {
        return a[0].toUpperCase() + a.slice(1);
    });

    Handlebars.registerHelper('includes', function(array, item, options) {
        if(array === undefined) {
            console.warn('includes has undefined array', array, item, options);
            return false;
        }
        return array.includes(item);
    });

    Handlebars.registerHelper('randomID', function() {
        return randomID();
    });

    Handlebars.registerHelper('numEq', function(a, b) {
        return a == b;
    });

    Handlebars.registerHelper('notification', function(target, targetName, options) {
        const fa = Boolean(target) ? 'check': 'times';
        let type = options.hash.optional ? 'optional' : 'required';
        const title = game.i18n.localize(`heart.notification:${type}`);
        return `<span class="fas fa-${fa}-circle" data-notification="${type}" data-target="${targetName}" title="${title}" data-type="${options.hash.type}"></span>`;
    });

    Handlebars.registerHelper('getActor', function(id) {
        return game.actors.get(id);
    });

    Handlebars.registerHelper('localizeHeart', function(...args) {
        const options = args.splice(-1, 1)[0];
        const value = `heart.${args.join('.')}`;
        return HandlebarsHelpers.localize(value, options)
    });
}

Hooks.once('init', initialise);

Hooks.once('ready', function() {
    registerSettings();
});

if (module.hot) {
    module.hot.accept();

    (async () => {
        initialise();

        if(game.i18n !== undefined) {
            game.i18n.translations = {};
            await game.i18n.setLanguage(game.i18n.lang);
        }

        // Refresh all open windows with new css and/or html
        Object.values(ui.windows).forEach(function(window) {
            window.render(true);
        });
    })()
}
