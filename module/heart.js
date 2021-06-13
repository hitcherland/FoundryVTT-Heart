import {ActorSheetHeartCharacter} from './actor/actor-sheet.js'
import {activateRollListeners} from './roll/roll.js';
import {PrepareRollRequestApplication} from './applications/prepare-roll-request.js';
import {PrepareRollApplication} from './applications/prepare-roll.js';
import {PrepareStressRollApplication} from './applications/prepare-stress-roll.js';

function titlecase(str) {
    return str.replace(/\w\S*/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase());
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
        difficulties: ['standard', 'risky', 'dangerous'],
        resistances: ['blood', 'mind', 'echo', 'fortune', 'supplies'],
        skills: ['compel', 'delve', 'discern', 'endure', 'evade', 'hunt', 'kill', 'mend','sneak'],
        domains: ['cursed', 'desolate', 'haven', 'occult', 'religion', 'technology', 'warren', 'wild'],
        stress_dice: ['d4', 'd6', 'd8', 'd10', 'd12'],
        roll_results: ["critical_failure", "failure", "success_at_a_cost", "success", "critical_success"],
        stress_results: ["no_fallout", "minor_fallout", "major_fallout"]
    };

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
        return `<span class="fas fa-${fa}-circle" data-notification="${type}" data-target="${targetName}" title="{{localize 'heart.${game.heart.titlecase(type)}'}}" data-type="${options.hash.type}"></span>`
    });

    Handlebars.registerHelper('getActor', function(id) {
        return game.actors.get(id);
    });

    loadTemplates([
        'systems/heart/templates/util/section.html',
        'systems/heart/templates/util/radio.html',
        'systems/heart/templates/util/multicheckbox.html'
    ])
});

Hooks.on('renderChatLog', (app, html, data) => activateRollListeners(html));
Hooks.on('renderChatPopout', (app, html, data) => activateRollListeners(html));
Hooks.on('renderChatMessage', (msg, html, data) => {
    const actor_ids = html.find('[data-actor-id]').map((i, el) => {
        return $(el).data('actorId');
    }).get();

    const actors = actor_ids.map(x => game.actors.get(x));
    const owners = actors.filter(x => x.testUserPermission(game.user, "OWNER"));
    const allowed = owners.length > 0;
    if(!allowed) {
        html.find('[data-action]').prop('disabled', true);

    }
})