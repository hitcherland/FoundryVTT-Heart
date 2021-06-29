
const difficulty_modifiers = {
    standard: ['kh'],
    risky: ['dh', 'kh'],
    dangerous: ['dh2', 'kh'],
    impossible: undefined,
}

export function initialise() {
    const index = CONFIG.Dice.rolls.findIndex(x => x.name === HeartRoll.name)
    if(index < 0) {
        CONFIG.Dice.rolls.push(HeartRoll);
    } else {
        CONFIG.Dice.rolls[index] = HeartRoll;
    }

    if(!game.heart.rolls) {
        game.heart.rolls = {}
    }

    game.heart.rolls.HeartRoll = HeartRoll;
    game.heart.difficulties = Object.keys(difficulty_modifiers);
}

export default class HeartRoll extends Roll {
    static fromPools(pools={}, data, options) {
        const {
            skill,
            domain,
            mastery=false,
            helpers=[],
            difficulty='standard'
        } = pools;

        let formula_terms = ['1d10[base]'];
        [skill, domain, mastery ? "mastery" : "", ...helpers].forEach(flavor => {
            if(!flavor) return;
            formula_terms.push(`1d10[${flavor}]`);
        });
        
        const difficulty_modifier = difficulty_modifiers[difficulty];
        const formula = `{${formula_terms.join(', ')}}${difficulty_modifier}`;

        return new this(formula, data, options);
    }
}