'use strict';

// Dependencies
const express = require('express');
const path = require('path');
const responseTime = require('response-time');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uniqid = require('uniqid');
const logWriter = require('./libraries/logwriter');
const config = require('./libraries/config');

/**
 * Application
 *
 * @type {module.App}
 */
module.exports = class App{
    constructor(worker_id, host, port){
        this.worker_id = worker_id;
        this.host = host;
        this.port = port;
        this.express = express();

        // Set Config Path
        this.config = new config(`${__dirname}/..`);

        // Look for the app version directly in package.json
        // Se we can start it without npm
        this.version = require(path.join(this.config.getRootPath(), 'package.json')).version;

        this.setLog();
        this.setRedis();
        this.setExpressDependencies();
        this.setExpressResponseTime();
        this.setExpressStaticAssets();
        this.setExpressCookieMiddleware();
        this.setExpressRoutes();
        this.setExpressErrorHandlers();
    }

    // Set express router error handlers
    setExpressErrorHandlers(){
        // Error handler
        this.express.use((err, req, res, _next) => {
            if (err) {
                this.log(err.message, 'error');
                res.status(500);
                res.send({
                    errors: {
                        message: err.message
                    }
                });
            }
        });

        // 404 Handler
        this.express.all('*', (req, res) => {
            res.status(404);
            res.send({
                errors: {
                    message: 'Not Found'
                }
            });
        });
    }

    // Set express routes
    setExpressRoutes(){
        // Entry point
        this.express.get('/',(req, res, next) => {
            res.sendFile(path.join(__dirname + '/../static/html/app.html'));
        });

        // Get portfolio
        this.express.get('/portfolio', (req, res, next) => { // Get user Portfolio
            return require('./controllers/portfolio').get(this, req, res).catch((err)=> {next(err)});
        });

        // Update portfolio
        this.express.post('/portfolio', (req, res, next) => { // Add asset to user Portfolio
            return require('./controllers/portfolio').add(this, req, res).catch((err)=> {next(err)});
        });

        // Status
        this.express.get('/state', (req, res) => {
            res.send({
                type: 'Duck',
                status: 'running',
                version: this.version
            });
        });
    }

    // Set portfolio_id cookie handler middleware
    setExpressCookieMiddleware(){
        this.express.all('*', (req, res, next)=> {
            // Check if we have the user uniqid in 🍪, or get one
            req.user_id = req.cookies.user_id === undefined ? uniqid() : req.cookies.user_id;

            // Set or reset the 🍪 for 1 Month
            res.cookie('user_id', req.user_id, { maxAge: 2592000000, httpOnly: false });
            this.log('User ID :  ' + req.user_id, 'info');

            next();
        });
    }

    // Set Uri for static assets served by express
    setExpressStaticAssets(){
        this.express.use('/static', express.static(__dirname + '/../static/'));
    }

    // Set response time infos at each call
    setExpressResponseTime(){
        this.express.use(responseTime((req, res, time) => {
            this.log(`Request ${req.method} ${req.url} processed in ${time}ms`, 'info');
        }));
    }

    // Set Express Dependencies
    setExpressDependencies()
    {
        this.express.use(bodyParser.json());
        this.express.use(cookieParser());
    }

    // Set Redis lib
    setRedis(){
        this.redis = require('./libraries/redis');
        this.redis.setConfig(this.config.getValue('redis'));
    }

    // Set logWriter
    setLog(){
        logWriter.setLogLevels(this.config.getValue('logLevels'));
        this.log = (msg, level) => {
            logWriter.log(msg, level);
        };
    }

    // Start the application
    start(){
        this.express.listen(this.port, this.host, 511, () => {
            this.log(`Worker #${this.worker_id} started on ${this.host}:${this.port}`, 'info');
        });
    }
};
