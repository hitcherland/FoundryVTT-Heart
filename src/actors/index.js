
import sheet_modules from './*/sheet.js';
import proxies from './*/proxy.js';

class HeartActor extends Actor {
    get proxy() {
        if(this._proxy === undefined && this.constructor.proxies[this.type] !== undefined) {
            this._proxy = this.constructor.proxies[this.type](this);
        }

        return this._proxy;
    }

    get heart_effects() {
        if(this.proxy !== undefined) {
            const effects = new Collection(super.effects.entries());
            this.proxy.effects.forEach(effect => {
                effects.set(effect.id, effect);
            });
            return effects;
        } else {
            return super.effects;
        }
    }

    getEmbeddedDocument(embeddedName, embeddedId) {
        if(embeddedName.startsWith('@')) {
            if(this.system.children === undefined) 
            return;
        
            const child_data = this.system.children[embeddedId];
            if(child_data === undefined)
                return undefined;
            const documentName = embeddedName.slice(1) || child_data.documentName;
            return new CONFIG[documentName].documentClass(child_data, {
                parentItem: this
            });
        } else {
            return super.getEmbeddedDocument(embeddedName, embeddedId);
        }
    };
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
        
        CONFIG.Actor.typeLabels[type] = `heart.${type}.single`;

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
        Object.entries(module.default).forEach(([type, proxy]) => {
            HeartActor.proxies[type] = proxy;
        });
    });
}