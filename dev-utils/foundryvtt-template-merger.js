const fs = require('fs');
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

module.exports = class FoundryVTTSymlinkPlugin {
    constructor(distPath) {
        this.distPath = distPath;
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap('FoundryVTT-Template-Merger', this.mergeTemplates(compiler));
    }

    mergeTemplates(compiler) {
        return function(compilation) {
            glob.glob('./src/**/template.json', (err, filenames) => {
                if(err) {
                    compilation.err(err);
                    return;
                }

                const contents = filenames.map(filename => {
                    return fs.readFileSync(filename);
                });

                const template = mergeDeep({}, ...contents.map(content => JSON.parse(content)));

                for(const top of Object.keys(template)) {
                    const types = Object.keys(template[top]).filter(x => x !== "templates");
                    template[top].types = types;
                }

                const template_json = JSON.stringify(template, null, 4);
                return compilation.emitAsset(
                    'template.json',
                    new (compiler.webpack.sources.RawSource)(template_json)
                )
            });
        }.bind(this)
    }
}