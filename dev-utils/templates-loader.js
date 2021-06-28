// return sources with their path
const loaderUtils = require('loader-utils');

module.exports = function (source) {
    const options = loaderUtils.getOptions(this);
    const path = this._module.rawRequest.replace(/^\.\//, `${options.name}:`);
    const output = {
        path,
        source
    };
    return `export default ${JSON.stringify(output)}`;
}