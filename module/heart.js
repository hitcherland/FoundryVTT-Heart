import {ActorSheetHeartCharacter} from './actor/actor-sheet.js'
import {ChatListeners} from './chat/chat.js';

Hooks.once('init', function() {
    Actors.unregisterSheet('core', ActorSheet)
    Actors.registerSheet('heart', ActorSheetHeartCharacter, {
        types: ["character"],
        makeDefault: true,
        label: 'heart.SheetClassCharacter'
    });

    Handlebars.registerHelper("ordered-checkable", function(value, max, options) {
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
});

Hooks.on('renderChatLog', (app, html, data) =>ChatListeners(html));
Hooks.on('renderChatPopout', (app, html, data) => ChatListeners(html));