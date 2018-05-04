"use strict";
/*eslint no-console:0*/

function VarnishApi() {}

VarnishApi.prototype.request = require("request");
VarnishApi.prototype.config = {};

/**
 * Set la config
 *
 * @param {Object} config
 */
VarnishApi.prototype.setConfig = function(config) {
    this.config = config;
};

/**
 * Purge une url sur Varnish
 *
 * @param {String} region
 * @param {String} url
 * @param {Function} callback
 */
VarnishApi.prototype.purge = function(region, url, callback) {
    // Set les options de la requète de Purge Varnish
    var options = {
        uri: this.config[region].url + url,
        method: "PURGE"
    };

    // Effectue la requète auprès de varnish
    this.request(options, function(err, response) {
        callback(err, response);
    });
};

module.exports = new VarnishApi();
