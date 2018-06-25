'use strict';

const redis = require('async-redis');

/**
 * Simple wrapper to handle a unique redis connection
 *
 * @type {Redis}
 */
module.exports = class Redis {
    constructor(config) {
        this.config = config;
    }

    /**
     * Utility to chunk redis zrange result
     *  - [a,b,c,d] => [[a,b], [c,d]]
     *
     * @param {Array} array
     * @param {int} chunk_size
     * @return {Array}
     */
    chunkZRangeResult(array, chunk_size = 2) {
        return array.reduce((all, one, i) => {
            const ch = Math.floor(i / chunk_size);
            all[ch] = [].concat(all[ch] || [], one);
            return all;
        }, []);
    }

    /**
     * Return current connection to redis
     *  - If it doesn't exist, create it
     *
     * @returns {Promise<*>}
     */
    async getConnection() {
        if (typeof this.connection === 'undefined') {
            if (typeof this.config === 'undefined') {
                throw new Error('Redis configuration not found');
            }

            this.connection = await redis.createClient({
                host: this.config.host,
                port: this.config.port,
                prefix: this.config.prefix,
            });

            this.connection.on('error', function(err) {
                throw new Error(err);
            });

            this.connection.select(this.config.database);
        }

        return this.connection;
    }
};
