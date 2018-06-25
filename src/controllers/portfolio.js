// Dependencies :
const AssetsModel = require('../models/assets');

/**
 * Class Portfolio
 */
module.exports = new class Portfolio {
    /**
     * Request data of a portfolio
     *
     * @param app
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async get(app, req, res) {
        let assets = await AssetsModel.get(app, req.user_id).then((assets) => {
            // Default portfolio
            return assets.length ? assets : [['BTC', 1]];
        });

        // Get all assets data in //
        let assetsData = await Promise.all(
            assets.map(async function([symbol, quantity]) {
                let price = await AssetsModel.getCurrentPrice(app, symbol);
                return [symbol, price, quantity];
            })
        );

        // Reformat coin data to object
        let result = assetsData.reduce(
            (obj, [symbol, price, quantity]) => {
                obj['assets'][symbol] = {
                    price: price,
                    quantity: quantity,
                    total: price * quantity,
                };

                obj['total'] += obj['assets'][symbol].total;

                return obj;
            },
            {
                assets: {},
                total: 0,
                user_id: req.user_id,
            }
        );

        // Calculate percents of each asset / total
        for (let asset in result.assets) {
            if (result.assets.hasOwnProperty(asset)) {
                result.assets[asset]['percent'] =
                    result.assets[asset].total / result.total;
            }
        }

        // Disable caching
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
        res.send(
            JSON.stringify({
                portfolio: result,
            })
        );
    }

    /**
     * Add asset to a portfolio
     *
     * @param app
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async add(app, req, res) {
        if (
            req.body.asset === undefined ||
            req.body.asset.symbol === undefined ||
            req.body.asset.quantity === undefined ||
            isNaN(req.body.asset.quantity)
        ) {
            throw new Error('Bad asset format');
        }

        // Check if we have a price
        let symbol = req.body.asset.symbol.toUpperCase();
        let quantity = Number.parseFloat(req.body.asset.quantity);
        let price = await AssetsModel.getCurrentPrice(app, symbol);

        // if the price is zero, cmc do not track it
        if (price === 0) {
            throw new Error('Unknown asset');
        }

        // Add it to this user portfolio
        await AssetsModel.add(app, req.user_id, symbol, quantity);

        res.send(
            JSON.stringify({
                asset: {
                    symbol: symbol,
                    quantity: quantity,
                    price: price,
                    total: price * quantity,
                },
            })
        );
    }
}();
