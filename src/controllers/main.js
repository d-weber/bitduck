"use strict";

function Main() {}

Main.prototype.cmc = require('../libraries/coinmarketcap');
var async = require('async');

/**
 * Méthode de récupération des favoris d'un membre
 *
 * @param app
 * @param req
 * @throw errors
 */
Main.prototype.get = function(app, req) {
    req.coins = {
        'BTC': 0.1,
        'XRP': 750,
        'XLM': 1000,
        'PRL': 500,
        'NANO': 25,
        'OMG': 10,
        'SHL': 500,
        'KEY': 5000,
        'DOGE': 8000,
        'STORJ' : 33
    };
    var self = this;
    return new Promise(function(resolve, reject) {
        var result = {
            'coins': {},
            'total': 0
        };

        var tasks = [];

        Object.keys(req.coins).forEach(function(coin) {
            tasks.push(function(callback) {
                self.cmc.get(coin, function (err, coin_data) {
                    var total = coin_data.price * req.coins[coin];
                    result.coins[coin] = {
                        'count': req.coins[coin],
                        'price': coin_data.price,
                        'total': total
                    };

                    result.total += total;
                    callback(null, true);
                });
            });
        });

        async.parallel(tasks, function(err, data) {
            var total = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(result.total)

            resolve({
                "http_code": 200,
                "content": '<h1>' + total + '</h1>'
            });
        });


    });
};


module.exports = new Main();