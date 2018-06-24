"use strict";

// Dependencies
const util = require('util');

module.exports = class LogWriter{
    constructor (levels = false) {
        this.logLevels = levels ? levels : ['info', 'warn', 'error'];

        return this.log(`Log levels : ${JSON.stringify(this.logLevels)}`, 'info');
    }

    // If we should log this level
    isLogged (level) {
        return this.logLevels.indexOf(level) >= 0;
    };

    // Principal function
    log (message, level = 'info') {
        // Si on a un log level, on vérifie son type.
        if (level !== "info" && level !== "warn" && level !== "error") {
            return this.log("level de log invalide (" + level + ")", "error");
        }

        // Si on ne log pas ce level on s'arrête là
        if (!this.isLogged(level)) {
            return false;
        }

        // Easy log errors
        if (message instanceof Error) {
            message = message.stack ? message.stack : message.toString();
        }

        // On affiche le message horodaté
        return util.log(`${level} - ${message}`);
    };
};