function LogWriter() {}

/**
 * Librarie path de nodejs
 */
LogWriter.prototype.path = require("path");

/**
 * Librarie util de nodejs
 */
LogWriter.prototype.util = require("util");

/**
 * Affiche un message de log dans la console
 * @param {string} message
 * @param {string} level
 * @param {string} filename
 * @returns {bool}
 */
LogWriter.prototype.log = function(message, level, filename) {
    // Par defaut le log level est info.
    if (!level) {
        level = "info";
    }
    // Si on a un log level, on vérifie son type.
    else if (level !== "info" && level !== "warn" && level !== "error") {
        return this.log("level de log invalide (" + level + ")", "error", filename);
    }
    // Si on ne log pas ce level on s'arrête là
    if (!this.isLogged(level)) {
        return false;
    }
    if (message instanceof Error) {
        message = message.stack ? message.stack : message.toString();
    }
    // On affiche le message horodaté
    return this.util.log(level + " - " + message);
};

/**
 * Retourne vrai si le level passé en paramètre doit être affiché
 * @param {String} level
 * @returns {Boolean}
 */
LogWriter.prototype.isLogged = function(level) {
    return this.logLevels.indexOf(level) >= 0;
};

LogWriter.prototype.logLevels = false;

LogWriter.prototype.setLogLevels = function(levels) {
    this.logLevels = levels;
    // On set les valeurs par défaut si on a rien
    if (!this.logLevels) {
        this.logLevels = [
            "info",
            "warn",
            "error"
        ];
    }
    return this.log("Log levels utilisés : " + JSON.stringify(this.logLevels), "info");
};


module.exports = new LogWriter();
