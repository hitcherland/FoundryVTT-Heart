
import sheet_modules from './*/sheet.js';

export function initialise() {
    console.log('heart | Registering actor sheets');
    Actors.unregisterSheet('core', ActorSheet);
    sheet_modules.forEach(function(module) {
        const Sheet = module.default;
        const type = Sheet.type;

        if(game.heart.actors === undefined) {
            game.heart.actors = {}
        }

        if(game.heart.actors[type] === undefined) {
            game.heart.actors[type] = {}
        }

        game.heart.actors[type].sheet = Sheet

        if(type === 'base') return;

        Actors.registerSheet('heart', Sheet, {
            types: [type],
            makeDefault: true,
            label: `heart.${type}`
        });
    });
}