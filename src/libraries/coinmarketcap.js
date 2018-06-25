// Dependencies :
const request = require('async-request');

/**
 * Class CoinMarketCap
 *  - abstract symbol -> cmc_coinId
 *
 * Request coinmarketcap.com for prices and listings
 */
module.exports = new class CoinMarketCap {
    /**
     * Get listing of all listed cmc coins [SYMBOL=>ID]
     *
     * @returns {Promise<Map>}
     */
    async getListing() {
        if (typeof this.cmc_listing !== 'undefined') {
            return this.cmc_listing;
        }

        // Request the CMC API
        let response = await request(this.getApiUrl('listings'));
        let data = JSON.parse(response.body).data;

        // Transform coin raw data => map
        return (this.cmc_listing = new Map(
            data.map((coin) => [coin.symbol, coin.id])
        ));
    }

    /**
     * Return CMC id of a crypto
     *
     * @param {string} symbol
     * @returns {Promise<int>}
     */
    async getIdBySymbol(symbol) {
        let listing = await this.getListing();

        return listing.get(symbol);
    }

    /**
     * Return actual price of a crypto
     *
     * @param symbol
     * @returns {Promise<int>}
     */
    async getPrice(symbol) {
        let coinId = await this.getIdBySymbol(symbol);

        return this.getPriceById(coinId);
    }

    /**
     * Return current price of a cryp via id
     *  - Cache it for 30s
     *
     * @param coinId
     * @returns {Promise<int>}
     */
    async getPriceById(coinId) {
        let response = await request(
            this.getApiUrl('ticker/' + coinId + '/?convert=EUR')
        );
        let data = JSON.parse(response.body).data;

        return data == null ? 0 : data.quotes.EUR.price;
    }

    /**
     * Return CMC url
     *
     * @param uri
     * @returns {string}
     */
    getApiUrl(uri) {
        return 'https://api.coinmarketcap.com/v2/' + uri;
    }
}();
