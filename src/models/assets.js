'use strict';

// Dependencies
const cmc = require('../libraries/coinmarketcap');

/**
 * Model for handling coin prices
 *  - use redis as cache
 */
module.exports = new class Assets {
    /**
     * Cet current price of a asset via its symbol
     *
     * @param app
     * @param symbol
     * @returns {Promise<*>}
     */
    async getCurrentPrice(app, symbol) {
        // Check if in cache
        let redis = await app.redis.getConnection();
        let price = await redis.get('asset:' + symbol + ':current_price');

        // Or get it from CoinMarketCap
        if (!price) {
            price = await cmc.getPrice(symbol);
            await redis.set(`asset:${symbol}:current_price`, price, 'EX', 10);
            await redis.zadd(this.getMostUsedKey(), Date.now(), symbol);
        }

        return Number.parseFloat(price);
    }

    /**
     * Get all recently requested coins
     * - Remove old coins
     *
     * @param app
     * @returns {Promise<void>}
     */
    async getMostUsed(app) {
        let redis = await app.redis.getConnection();

        // Remove coins used > 1 Month
        await redis.zremrangebyscore(
            this.getUsedAssetsKey(),
            '-inf',
            Date.now() + 2592000 // 1 Month in seconds
        );

        return redis.zrange(this.getMostUsedKey(), 0, -1);
    }

    /**
     * Get assets of a user via his id
     *
     * @param app
     * @param userId
     * @returns {Promise<*[]>}
     */
    async get(app, userId) {
        let redis = await app.redis.getConnection();

        // Get user assets
        let rawAssets = await redis.zrange(
            this.getUserAssetsKey(userId),
            0,
            -1,
            'WITHSCORES'
        );

        // Shift key expire by 30 Days
        redis.expire(this.getUserAssetsKey(userId), 2592000);

        return app.redis.chunkZRangeResult(rawAssets);
    }

    /**
     * Add an asset to a user
     *
     * @param app
     * @param userId
     * @param symbol
     * @param count
     * @returns {Promise<boolean>}
     */
    async add(app, userId, symbol, count) {
        let redis = await app.redis.getConnection();

        // Add asset in this user assets
        await redis.zadd(this.getUserAssetsKey(userId), count, symbol);

        // Shift key expire by 30 Days
        redis.expire(this.getUserAssetsKey(userId), 2592000);

        return true;
    }

    /**
     * Return redis key of user assets
     *
     * @param userId
     * @returns {string}
     */
    getUserAssetsKey(userId) {
        return `user:${userId}:assets`;
    }

    /**
     * Return redis key for most used assets
     *
     * @returns {string}
     */
    getMostUsedKey() {
        return 'assets:most_used';
    }
}();
