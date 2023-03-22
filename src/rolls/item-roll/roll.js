export default class ItemRoll extends Roll {
    static build({item} = {}, data={}, options={}) {
        options.item = item;
        let die_size = options.stepIncrease ? stepIncrease(item.system.die_size) : item.system.die_size;
        return new this(die_size, data, options);
    }
}

function stepIncrease(die_size) {
    const gameDieSizes = game.heart.die_sizes;

    var currentDieSizeIndex = gameDieSizes.indexOf(die_size);

    if(currentDieSizeIndex < (gameDieSizes.length - 1)) {
        var largerSize = gameDieSizes[currentDieSizeIndex+1];
        return largerSize;
    }
    return die_size;
}