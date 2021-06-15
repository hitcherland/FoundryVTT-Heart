import {ActorSheetHeartCharacter} from './actor/actor-sheet.js'
import {activateRollListeners} from './roll/chat-log.js';
import {PrepareRollRequestApplication} from './applications/prepare-roll-request.js';
import {PrepareRollApplication} from './applications/prepare-roll.js';
import {PrepareStressRollApplication} from './applications/prepare-stress-roll.js';
import {PrepareFalloutRollApplication} from './applications/prepare-fallout-roll.js';

function registerSettings() {
    game.settings.register('heart', 'normalActionTable', {
        name: 'Normal Actions RollTable Source',
        hint: "When we roll d10 for normal actions, use this table",
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
    })
}

function titlecase(str) {
    return str.replace(/\w\S*/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

async function generateRandomResource() {
    const random_domain_table_uuid = 'RollTable.GJuqsV18fRNn7pFO'
    const random_value_table_uuid = 'RollTable.wBvFFOhH51dNlnpx';
    
    const random_value_table = await fromUuid(random_value_table_uuid);
    const random_domain_table = await fromUuid(random_domain_table_uuid);
    
    const random_value = (await random_value_table.roll()).results[0].getChatText();
    
    async function getDomains() {
      let result = (await random_domain_table.roll()).results[0].getChatText();
      const output = [result];
      let i = output.indexOf('_combine_');
      while(i >= 0) {
        output.splice(i, 1);
        output.push(
          (await random_domain_table.roll()).results[0].getChatText(),
          (await random_domain_table.roll()).results[0].getChatText()
        );
        i = output.indexOf('_combine_');
      }
      return output;
    }

    const random_domain = await getDomains();

    const item = new CONFIG.Item.documentClass({
        name: "New Resource",
        type: "resource",
        data: {
            "value": random_value,
            "domains": random_domain,
        }
    });

    item.sheet.render(true);
}

Hooks.once('init', function() {
    Actors.unregisterSheet('core', ActorSheet)
    Actors.registerSheet('heart', ActorSheetHeartCharacter, {
        types: ["character"],
        makeDefault: true,
        label: 'heart.SheetClassCharacter'
    });

    game.heart = {
        titlecase,
        PrepareRollRequestApplication,
        PrepareRollApplication,
        PrepareStressRollApplication,
        PrepareFalloutRollApplication,
        generateRandomResource,
        difficulties: ['standard', 'risky', 'dangerous', 'impossible'],
        resistances: ['blood', 'mind', 'echo', 'fortune', 'supplies'],
        skills: ['compel', 'delve', 'discern', 'endure', 'evade', 'hunt', 'kill', 'mend','sneak'],
        domains: ['cursed', 'desolate', 'haven', 'occult', 'religion', 'technology', 'warren', 'wild'],
        stress_dice: ['d4', 'd6', 'd8', 'd10', 'd12'],
        roll_results: ["critical_failure", "failure", "success_at_a_cost", "success", "critical_success"],
        stress_results: ["no_fallout", "minor_fallout", "major_fallout"]
    };

    registerSettings();

    Handlebars.registerHelper("ordered-checkable", function(value, max) {
        let output = '';
        for(let i=0; i<max; i++) {
            output += `<a data-index="${i}" class="ordered-checkable-box${i < value ? " checked": ""}"></a>`
        }
        return output;
    });

    Handlebars.registerHelper("concat", function(a, b) {
        return a + b;
    });

    Handlebars.registerHelper("titlecase", function(a) {
        return a[0].toUpperCase() + a.slice(1);
    });

    Handlebars.registerHelper('includes', function(a, b, options) {
        if(a === undefined) {
            console.warn('includes has undefined A', a, b, options);
            return false;
        }
        return a.includes(b);
    });

    Handlebars.registerHelper('randomID', function(a, b) {
        return randomID();
    });

    Handlebars.registerHelper('notification', function(target, targetName, options) {
        const fa = Boolean(target) ? 'check': 'times';
        let type = options.hash.optional ? 'optional' : 'required';
        const title = game.i18n.localize(`heart.notification:${type}`);
        return `<span class="fas fa-${fa}-circle" data-notification="${type}" data-target="${targetName}" title="${title}" data-type="${options.hash.type}"></span>`
    });

    Handlebars.registerHelper('getActor', function(id) {
        return game.actors.get(id);
    });

    Handlebars.registerHelper('localizeHeart', function(...args) {
        const options = args.splice(-1, 1)[0];
        const value = `heart.${args.join(':')}`;
        return HandlebarsHelpers.localize(value, options);
    });

    loadTemplates([
        'systems/heart/templates/util/section.html',
        'systems/heart/templates/util/radio.html',
        'systems/heart/templates/util/multicheckbox.html'
    ])
});

Hooks.on('renderChatLog', (app, html, data) => activateRollListeners(html));
Hooks.on('renderChatPopout', (app, html, data) => activateRollListeners(html));