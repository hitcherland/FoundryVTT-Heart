
function mergeDeep(target, source, complainOnDuplicates=true) {
    for(const key in source) {
        if(complainOnDuplicates && target[key] !== undefined) {
            console.warn("Warning: key already defined", key, {old_value: target[key], new_value: source[key]});
        }
        if(target[key] instanceof Array && source[key] instanceof Array) {
            target[key].push(...source[key])
        } else if(target[key] instanceof Object && source[key] instanceof Object ) {
            mergeDeep(target[key], source[key], complainOnDuplicates)
        } else {
            target[key] = source[key]
        }
    }

    return target;
}

module.exports = {
    mergeDeep
}