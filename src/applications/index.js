import modules from './*/application.js';

export function initialise() {
    console.log('heart | Registering applications');
    modules.forEach(function(module) {
        module.initialise();
    });
}