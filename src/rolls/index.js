import rollModules from './*/roll.js';
import './roll.sass';

export function initialise() {
    console.log('heart | Registering rolls');
    rollModules.forEach((module) => {
        const Roll = module.default;

        const index = CONFIG.Dice.rolls.findIndex(x => x.name === Roll.name)
        if (index < 0) {
            CONFIG.Dice.rolls.push(Roll);
        } else {
            CONFIG.Dice.rolls[index] = Roll;
        }
        
        if (game.heart.rolls === undefined) {
            game.heart.rolls = {}
        }
        
        game.heart.rolls[Roll.name] = Roll;

        if(Roll.activateListeners !== undefined) {
            Hooks.on('renderChatLog', (app, html, data) => Roll.activateListeners(html));
            Hooks.on('renderChatPopout', (app, html, data) => Roll.activateListeners(html));
        }
    
        if(module.initialise !== undefined) {
            module.initialise()
        }
    });
}