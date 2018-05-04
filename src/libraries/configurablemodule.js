"use strict";
/**
 * Module qui a pour but d'être étendu et qui ajoute les fonctions de
 * configuration
 */
function ConfigurableModule() {}

/**
 * Permet de définir la configuration du module
 * 
 * @param {object} config
 * @returns {undefined}
 */
ConfigurableModule.prototype.setConfig = function(config) {
    this.config = config;
};

/**
 * Permet de lire la configuration du module
 * 
 * @returns {object}
 */
ConfigurableModule.prototype.getConfig = function() {
    if (typeof(this.config) === "undefined") {
        throw new Error("Configuration non initialisée");
    }
    return this.config;
};

module.exports = new ConfigurableModule();
