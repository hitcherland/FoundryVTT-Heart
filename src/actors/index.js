
import sheet_modules from './*/sheet.js';
import proxies from './*/proxy.js';

class HeartActor extends Actor {
    get proxy() {
        if(this._proxy === undefined && this.constructor.proxies[this.type] !== undefined) {
            this._proxy = this.constructor.proxies[this.type](this);
        }

        return this._proxy;
    }
}

HeartActor.proxies = {};

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
        
        CONFIG.Actor.typeLabels[type] = `heart.${type}.label-single`;

        game.heart.actors[type].sheet = Sheet

        if(type === 'base') return;

        Actors.registerSheet('heart', Sheet, {
            types: [type],
            makeDefault: true,
            label: `heart.${type}`
        });
    });

    CONFIG.Actor.documentClass = HeartActor;

    proxies.forEach(function(module) {
        HeartActor.proxies[module.default.name.toLowerCase()] = module.default;
    });
}