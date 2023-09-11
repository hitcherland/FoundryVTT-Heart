
function mergeDeep(target, ...sources) {
    sources.forEach(function(source) {
        for(const key in source) {
            if(target[key] instanceof Array && source[key] instanceof Array) {
                target[key].push(...source[key])
            } else if(target[key] instanceof Object && source[key] instanceof Object ) {
                mergeDeep(target[key], source[key])
            } else {
                target[key] = source[key]
            }
        }
    });

    return target;
}

module.exports = {
    mergeDeep
}