'use strict';
/*eslint no-console:0*/

function App() {}

// Fonction de démarrage du MS
App.prototype.start = function(workerId) {
    let express = require('express');
    let app = express();
    let path = require('path');
    let responseTime = require('response-time');
    let bodyParser = require('body-parser');
    let cookieParser = require('cookie-parser');
    let uniqid = require('uniqid');

    /**
     * Injection de dépendances
     */
    try {
        // Chargement de la config
        let config = require('./libraries/config');
        config.setRootPath(__dirname + '/..');

        // Chargement du logWriter
        app.logWriter = require('./libraries/logwriter');
        app.logWriter.setLogLevels(config.getValue('logLevels'));
        app.log = (msg, level) => {
            app.logWriter.log(msg, level);
        };

        // Définition du port de l'application
        let msConfig = config.getValue('app');
        app.port = msConfig.port;
        if (!msConfig.host) {
            throw new Error('Le champ host est manquant dans la configuration du microservice');
        }
        app.host = msConfig.host;

        app.redis = require('./libraries/redis');
        app.redis.setConfig(config.getValue('redis'));

        // On va chercher la version directement dans le package afin de pouvoir
        // lancer la commande sans passer par npm
        app.version = require(path.join(config.getRootPath(), 'package.json')).version;

    } catch (err) {
        console.log(err);
        throw err;
    }

    app.use(bodyParser.json());
    app.use(cookieParser());

    /**
     * Log du temps de réponse
     */
    app.use(responseTime((req, res, time) => {
        app.log('Requête ' + req.method + ' ' + req.url + ' temps de réponse : ' + time + ' ms', 'info');
    }));

    /**
     * Assets
     */
    app.use('/static', express.static(__dirname + '/../static/'));

    /**
     * Get user id
     */
    app.all('*', (req, res, next)=> {
        // Check if we have the user uniqid in 🍪, or get one
        req.user_id = req.cookies.user_id === undefined ? uniqid() : req.cookies.user_id;

        // Set or reset the 🍪 for 1 Month
        res.cookie('user_id', req.user_id, { maxAge: 2592000000, httpOnly: false });
        app.log('User ID :  ' + req.user_id, 'info');

        next();
    });

    /**
     * Default entry point
     */
    app.get('/',(req, res, next) => {
        res.sendFile(path.join(__dirname + '/../static/html/app.html'));
    });

    /**
     * Routes
     */
    app.get('/portfolio', (req, res, next) => { // Get user Portfolio
        return require('./controllers/portfolio').get(app, req, res).catch((err)=> {next(err)});
    });
    app.post('/portfolio', (req, res, next) => { // Add asset to user Portfolio
        return require('./controllers/portfolio').add(app, req, res).catch((err)=> {next(err)});
    });

    /**
     * Route Status
     */
    app.get('/state', (req, res) => {
        res.send({
            type: 'Duck',
            status: 'running',
            version: app.version
        });
    });

    /**
     * Error Handler
     */
    app.use((err, req, res, _next) => {
        if (err) {
            app.log(err.message, 'error');
            res.status(500);
            res.send({
                errors: {
                    message: err.message
                }
            });
        }
    });

    /**
     * Error 404 Handler
     */
    app.all('*', (req, res) => {
        res.status(404);
        res.send({
            errors: {
                message: 'Not Found'
            }
        });
    });

    /**
     * Démarrage du MS
     */
    // 511 correspond à la valeur par défaut de la longueur de la queue des
    // connexions en attentes.
    app.listen(app.port, app.host, 511, () => {
        app.log('Worker du ms #' + workerId + ' démarré sur : ' + app.host + ':' +
            app.port, 'info');
    });
};

module.exports = new App();