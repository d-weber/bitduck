'use strict';

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

/**
 * Config class
 *  - Handle config file
 *
 * @type {Config}
 */
module.exports = class Config {
    constructor(root_path) {
        this.rootPath = path.resolve(root_path);
        try {
            this.config = JSON.parse(fs.readFileSync(this.getConfigPath()));
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
        let arg_path = this.getConfigPathFromArgs();
        return arg_path
            ? arg_path
            : path.join(this.getRootPath(), 'config', 'config.json');
    }

    // Return process args
    getArgs() {
        return minimist(process.argv.slice(2));
    }

    // Return config path if set by args
    getConfigPathFromArgs() {
        let path,
            args = this.getArgs();

        if (args.config) {
            return args.config;
        }

        if (args.c) {
            return args.c;
        }

        return false;
    }
};
