import templates from './**/*.@(html|handlebars|hbs)';
import './index.sass';
import './common/sheet.sass';

import modules from './**/index.js';

function activateTemplates() {
    templates.forEach(function(module) {
        const template = module.default;
        const compiled = Handlebars.compile(template.source);
        Handlebars.registerPartial(template.path, compiled);
        _templateCache[template.path] = compiled;
    });
}

function registerSettings() {
    game.settings.register('heart', 'showStartupMessage', {
        name: 'Show Startup Message',
        hint: 'Show the startup message, which provides a brief tutorial on how to use Heart.',
        scope: 'client',
        config: true,
        default: true,
        type: Boolean,
    });

    game.settings.register('heart', 'showTextboxesBelowItems', {
        name: 'Show Textboxes Below Item Lists',
        hint: 'On the character sheet, toggle the legacy text boxes',
        scope: 'client',
        config: true,
        default: true,
        type: Boolean,
    });
}

function initialise() {

    activateTemplates();

    game.heart = {
        difficulties: ['standard', 'risky', 'dangerous', 'impossible'],
        resistances: ['blood', 'mind', 'echo', 'fortune', 'supplies'],
        skills: ['compel', 'delve', 'discern', 'endure', 'evade', 'hunt', 'kill', 'mend','sneak'],
        domains: ['cursed', 'desolate', 'haven', 'occult', 'religion', 'technology', 'warren', 'wild'],
        stress_dice: ['d4', 'd6', 'd8', 'd10', 'd12'],
        die_sizes: ['d4', 'd6', 'd8', 'd10', 'd12'],
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

    Handlebars.registerHelper('undef', function(a) {
        return a === undefined;
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

    Handlebars.registerHelper('not', function(a) {
        return !Boolean(a);
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

    Handlebars.registerHelper('ownsAnyActors', function(ids) {
        for(let id of ids) {
            const actor = game.actors.get(id);
            if(!actor) continue;

            if(actor.isOwner) return true;
        }

        return false;
    });
}

Hooks.once('init', initialise);

Hooks.once('ready', function() {
    registerSettings();
    if(game.settings.get('heart', 'showStartupMessage')) {
         let d = new Dialog({
          title: game.i18n.format("heart.dialog.title(VERSION)", {VERSION: game.system.data.version}),
          content: game.i18n.format("heart.dialog.content(VERSION)", {VERSION: game.system.data.version}),
          buttons: {
           close: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("heart.dialog.skip"),
            callback: () => {}
           },
           prevent: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("heart.dialog.dont-show-again"),
            callback: () => game.settings.set('heart', 'showStartupMessage', false)
           }
          },
          default: "skip",
          render: html => {},
          close: html => {}
         });
         d.render(true);
    }
});

if (module.hot) {
    module.hot.accept();

    (async () => {
        Hooks._ids = {};
        Hooks._hooks.renderChatLog = [];
        Hooks._hooks.renderChatPopout = [];
        initialise();

        if(game.i18n !== undefined) {
            game.i18n.translations = {};
            await game.i18n.setLanguage(game.i18n.lang);
        }

        // Refresh all open windows with new css and/or html
        Object.values(ui.windows).forEach(function(window) {
            window.render(true);
        });

        if(ui.chat !== undefined) {
            ui.chat._lastId = null; 
            ui.chat.element.find('#chat-log').html(""); 
            ui.chat._renderBatch(ui.chat.element, CONFIG.ChatMessage.batchSize)
        }
    })()
}
