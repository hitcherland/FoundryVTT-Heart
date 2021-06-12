import {ActorSheetHeartCharacter} from './actor/actor-sheet.js'
import {CreatePrepareRollDialog, activateRollListeners} from './roll/roll.js';

Hooks.once('init', function() {
    Actors.unregisterSheet('core', ActorSheet)
    Actors.registerSheet('heart', ActorSheetHeartCharacter, {
        types: ["character"],
        makeDefault: true,
        label: 'heart.SheetClassCharacter'
    });

    game.heart = {
        CreatePrepareRollDialog,
        difficulties: ['standard', 'risky', 'dangerous'],
        resistances: ['blood', 'mind', 'echo', 'fortune', 'supplies'],
        skills: ['compel', 'delve', 'discern', 'endure', 'evade', 'hunt', 'kill', 'mend','sneak'],
        domains: ['cursed', 'desolate', 'haven', 'occult', 'religion', 'technology', 'warren', 'wild'],
        stress_dice: ['d4', 'd6', 'd8', 'd10', 'd12']
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

    Handlebars.registerHelper('includes', function(a, b) {
        if(a === undefined) {
            console.warn('includes has undefined A', a, b);
            return false;
        }
        return a.includes(b);
    });

    Handlebars.registerHelper('randomID', function(a, b) {
        return randomID();
    });
});

Hooks.on('renderChatLog', (app, html, data) => activateRollListeners(html));
Hooks.on('renderChatPopout', (app, html, data) => activateRollListeners(html));