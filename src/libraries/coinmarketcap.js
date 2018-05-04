function CoinMarketCap() {}


CoinMarketCap.prototype.request = require("request");
CoinMarketCap.prototype.prices = {};
CoinMarketCap.prototype.listing = {};
CoinMarketCap.prototype.ttl = 30;
CoinMarketCap.prototype.expires = {};

CoinMarketCap.prototype.get = function(coin, callback) {
    var self = this;
    // Récupère l'identifiant
    this.getId(coin, function(err, coin_id) {
        if (coin_id === false) {
            return callback('nope');
        }

        self.getPrice(coin_id, function (err, price) {
            return callback(null, {
                'price': price
            });
        });
    });
};

CoinMarketCap.prototype.getPrice = function(coin_id, callback) {
    if (typeof this.prices[coin_id] !== 'undefined' && Date.now() < this.expires[coin_id]) {
        return callback(null, this.prices[coin_id]);
    }
    var self = this;

    self.request('https://api.coinmarketcap.com/v2/ticker/' + coin_id + '/?convert=EUR', function (error, response, body) {
        if (error) return error;

        var data = JSON.parse(body).data;

        if (data == null) {
            self.prices[coin_id] = 0;
        } else {
            self.prices[coin_id] = data.quotes.EUR.price;
        }

        // On définis le timeout du prix
        self.expires[coin_id] =  Date.now() + (self.ttl * 1000);

        return callback(null, self.prices[coin_id]);
    });
};

CoinMarketCap.prototype.getListing = function(callback) {
    var self = this;
    if (self.listing.length > 0) {
        return callback(null, self.listing);
    }

    self.request('https://api.coinmarketcap.com/v2/listings/', function (error, response, body) {
        if (error) callback(error);

        var data = JSON.parse(body).data;

        data.forEach(function(coin) {
            self.listing[coin.symbol] = coin.id;
        });

        return callback(null, self.listing);
    });
};

CoinMarketCap.prototype.getId = function(coin, callback) {
    this.getListing(function(err, listing) {

        if (typeof listing[coin] !== 'undefined') {
            return callback(null, listing[coin]);
        } else {
            return callback('nope');
        }
    });
};

module.exports = new CoinMarketCap();
