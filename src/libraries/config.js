'use strict';

const Fs = require('fs');
const Path = require('path');
const Minimist = require('minimist');

/**
 * Config class
 *  - Handle config file
 *
 * @type {Config}
 */
module.exports = class Config {
    constructor(rootPath) {
        this.rootPath = Path.resolve(rootPath);
        try {
            this.config = JSON.parse(Fs.readFileSync(this.getConfigPath()));
        } catch (error) {
            console.log(`Config file error (${error.message})`);
            process.exit();
        }
    }

    // Return root path of config file
    getRootPath() {
        if (!this.rootPath) {
            throw new Error('Config path not found');
        }

        return this.rootPath;
    }

    // Return a value in config
    getValue(key) {
        return this.config[key];
    }

    // Return config gile path
    getConfigPath() {
        let argPath = this.getConfigPathFromArgs();
        return argPath || Path.join(this.getRootPath(), 'config', 'config.json');
    }

    // Return process args
    getArgs() {
        return Minimist(process.argv.slice(2));
    }

    // Return config path if set by args
    getConfigPathFromArgs() {
        let args = this.getArgs();

        if (args.config) {
            return args.config;
        }

        if (args.c) {
            return args.c;
        }

        return false;
    }
};
