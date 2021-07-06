import modules from './*/application.js';
import './application.sass';

export function initialise() {
    console.log('heart | Registering applications');
    if(game.heart.applications === undefined) {
        game.heart.applications = {};
    }

    modules.forEach(function(module) {
        game.heart.applications[module.default.name] = module.default;
        if(module.initialise) {
            module.initialise();
        }
    });
}