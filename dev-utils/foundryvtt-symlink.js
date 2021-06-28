const fs = require('fs');
const path = require('path');
const process = require('process');

function log(msg) {
    console.log(`FoundryVTT-Symlink: ${msg}`);
}

function err(msg) {
    console.error(`FoundryVTT-Symlink: ${msg}`);
    throw msg;
}

module.exports = class FoundryVTTSymlinkPlugin {
    constructor(name, type, distPath, foundryvttPath) {
        if (name === undefined) {
            throw `Package name must be defined`;
        }
        this.name = name;

        if (!["module", "system", "world"].includes(type)) {
            throw `type must be one of "module", "system" or "world"`;
        }
        this.type = type;

        this.distPath = distPath;
        this.foundryvttPath = foundryvttPath;
    }
    
    apply(compiler) {
        compiler.hooks.compile.tap('FoundryVTT-Symlink', this.prepareSymlink.bind(this));
    }

    prepareSymlink() {
        let foundryvttPath = this.foundryvttPath;

        if (this.foundryvttPath === undefined) {
            if (process.platform === 'win32') {
                foundryvttPath = path.join(process.env.LOCALAPPDATA, 'FoundryVTT', 'Data')
            } else if (process.platform === 'linux') {
                foundryvttPath = path.join(process.env.HOME, '.local', 'share', 'FoundryVTT', 'Data');
            /*
            // Fill this out when mac data path is confirmed.
            } else if(process.platform === 'darwin') {
                foundryvttPath = path.join(...);
            }
            */
            } else {
                throw `Unexpected OS, cannot symlink safely`;
            }
        }
    
        const packagePath = path.resolve(foundryvttPath, `${this.type}s`, this.name);
        fs.symlink(this.distPath, packagePath, 'junction', function(err) {
            if(err) {
                if(err.code === 'EEXIST' && err.syscall === 'symlink' && err.dest === packagePath) {
                    log('Symbolic link already exists');
                } else {
                    error(`Failed to create symbolic link: ${err}`);
                }
            } else {
                log(`Created symbolic link from "${this.distPath}" to "${packagePath}"`)
            }
        }.bind(this));
    }
}