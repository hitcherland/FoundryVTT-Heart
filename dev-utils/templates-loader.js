const loaderUtils = require('loader-utils');

module.exports = function (source) {
    const options = loaderUtils.getOptions(this);
    const path = this._module.rawRequest.replace(/^\.\//, `${options.name}:`);

    // Log all files being processed by the loader
    //console.log("Processing file:", this.resourcePath);

    // Check if the current file is the actor sheet template
    // if (this.resourcePath.includes('src\\actors\\character\\sheet')) {
    //     console.log("Actor Sheet Template Source:", source); // Log only the actor sheet template

    // }

    const output = {
        path,
        source
    };

    return `export default ${JSON.stringify(output)}`;
};