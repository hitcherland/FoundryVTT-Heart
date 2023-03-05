export default class ItemRoll extends Roll {
    static build({item} = {}, data={}, options={}) {
        options.item = item;
        let die_size = options.stepIncrease ? stepIncrease(item.system.die_size) : item.system.die_size;
        return new this(die_size, data, options);
    }
}

function stepIncrease(die_size) {
    if (die_size == "d12") {
        return "d12";
    }
    else {
        return "d".concat("", (parseInt(die_size.slice(1)) + 2));
    }
}