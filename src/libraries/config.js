"use strict";

function Config() {}

Config.prototype.fs = require("fs");

/**
 * Contient le chemin de base Config
 * @type String
 */
Config.prototype.rootPath = "";

/**
 * Librarie path de nodejs
 */
Config.prototype.path = require("path");

/**
 * Librarie fs de nodejs
 */
Config.prototype.fs = require("fs");

/**
 * Librarie minimist
 */
Config.prototype.minimist = require("minimist");

/**
 * Logger utilisé dans la classe
 */
Config.prototype.logger = console;

/**
 * Spécifie le chemin racine du Config
 * @param {string} path
 * @returns {undefined}
 */
Config.prototype.setRootPath = function(path) {
    this.rootPath = this.path.resolve(path);
};

/**
 * Retourne la racine du Config
 * @returns {String}
 */
Config.prototype.getRootPath = function() {
    if (!this.rootPath) {
        throw new Error("Chemin du Config non configuré");
    }

    return this.rootPath;
};

/**
 * Valeur du fichier de configuration
 * @type Boolean|@exp;JSON@call;parse
 */
Config.prototype.config = false;

/**
 * Retourne la valeur de la clé de configuration key
 * @param {String} value
 * @returns {Array|Object|Boolean}
 */
Config.prototype.getValue = function(key) {
    if (this.config === false) {
        try {
            this.config = JSON.parse(this.fs.readFileSync(this.getConfigPath()));
            this.logger.log("Configuration chargée (config : " + JSON.stringify(this.config) + ")");
        } catch (error) {
            // Si le fichier n'existe pas.
            if (error.code === "ENOENT") {
                // Important de le faire avant le log pour éviter
                // les appels récursifs.
                this.config = {};
                this.logger.log("fichier de configuration non trouvé (fichier : " + this.getConfigPath() + ")");
            } else {
                throw error;
            }
        }
    }
    return this.config[key];
};


/**
 * Retourne le chemin du fichier de configuration
 * @returns {String}
 */
Config.prototype.getConfigPath = function() {
    var path = this.getConfigPathFromArgs();
    if (path) {
        return path;
    } else {
        return this.path.join(this.getRootPath(), "config", "config.json");
    }
};

/**
 * Retourne les arguments de la ligne de commande
 * @returns {Object}
 */
Config.prototype.getArgs = function() {
    return this.minimist(process.argv.slice(2));
};

/**
 * Retourne le chemin du fichier de configuration depuis la ligne de commande
 * @returns {String}
 */
Config.prototype.getConfigPathFromArgs = function() {
    var path, args = this.getArgs();
    if (args.config) {
        path = args.config;
    } else {
        if (args.c) {
            path = args.c;
        } else {
            path = "";
        }
    }
    return path;
};

module.exports = new Config();
