const fs = require('fs');
const path = require('path');
const glob = require('glob');

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

module.exports = class FoundryVTTTranslationMerger {
    constructor(moduleName, distPath) {
        this.moduleName = moduleName;
        this.distPath = distPath;
        console.warn(this.moduleName);
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap('FoundryVTT-Translation-Merger', this.mergeTranslations(compiler).bind(this));
    }

    mergeTranslations(compiler) {
        return function(compilation) {
            function handle(err, filenames) {
                if(err) {
                    compilation.err(err);
                    return;
                }

                const translations = filenames.reduce((map, filename) => {
                    const basename = path.basename(filename);
                    if(map[basename] === undefined) {
                        map[basename] = {};
                    }

                    const content = fs.readFileSync(filename);
                    try {
                        const json = JSON.parse(content);
                        mergeDeep(map[basename], json);
                    } catch(err) {
                    }

                    return map;
                    
                }, {});

                Object.entries(translations).forEach((([filename, translation]) => {
                    const content = JSON.stringify({[this.moduleName]: translation}, null, 4);
                    compilation.emitAsset(
                        `lang/${filename}`,
                        new (compiler.webpack.sources.RawSource)(content)
                    );
                }).bind(this));
            }

            glob.glob('./@(src|pack-data)/**/lang/*.json', handle.bind(this));
        }
    }
}