'use strict';

// Dependencies
const Express = require('express');
const Path = require('path');
const ResponseTime = require('response-time');
const BodyParser = require('body-parser');
const CookieParser = require('cookie-parser');
const UniqId = require('uniqid');
const Config = require('./libraries/config');
const Redis = require('./libraries/redis');
const Winston = require('winston');
const StrfTime = require('strftime');

/**
 * Application
 *
 * @type {module.App}
 */
module.exports = class App {
    constructor(workerId, host, port) {
        this.workerId = workerId;
        this.host = host;
        this.port = port;
        this.express = Express();

        // Set Config Path
        this.config = new Config(`${__dirname}/..`);

        // Look for the app version directly in package.json
        // Se we can start it without npm
        this.version = require(Path.join(
            this.config.getRootPath(),
            'package.json'
        )).version;

        this.setLogger();
        this.setRedis();
        this.setExpressDependencies();
        this.setExpressResponseTime();
        this.setExpressStaticAssets();
        this.setExpressCookieMiddleware();
        this.setExpressRoutes();
        this.setExpressErrorHandlers();
    }

    // Set express router error handlers
    setExpressErrorHandlers() {
        // Error handler
        this.express.use((err, req, res, _next) => {
            if (err) {
                this.log(err.message, 'error');
                res.status(400);
                res.send({
                    errors: {
                        message: err.message,
                    },
                });
            }
        });

        // 404 Handler
        this.express.all('*', (req, res) => {
            res.status(404);
            res.send({
                errors: {
                    message: 'Not Found',
                },
            });
        });
    }

    // Set express routes
    setExpressRoutes() {
        // Entry point
        this.express.get('/', (req, res, next) => {
            res.sendFile(Path.join(__dirname, '/../static/html/app.html'));
        });

        // Get portfolio
        this.express.get('/portfolio', (req, res, next) => {
            // Get user Portfolio
            return require('./controllers/portfolio')
                .get(this, req, res)
                .catch((err) => {
                    next(err);
                });
        });

        // Update portfolio
        this.express.post('/portfolio', (req, res, next) => {
            // Add asset to user Portfolio
            return require('./controllers/portfolio')
                .add(this, req, res)
                .catch((err) => {
                    next(err);
                });
        });

        // Status
        this.express.get('/state', (req, res) => {
            res.send({
                type: 'Duck',
                status: 'running',
                version: this.version,
            });
        });
    }

    // Set portfolio_id cookie handler middleware
    setExpressCookieMiddleware() {
        this.express.all('*', (req, res, next) => {
            // Check if we have the user uniqid in 🍪, or get one
            req.user_id =
                req.cookies.user_id === undefined
                    ? UniqId()
                    : req.cookies.user_id;

            // Set or reset the 🍪 for 1 Month
            res.cookie('user_id', req.user_id, {
                maxAge: 2592000000,
                httpOnly: false,
            });
            this.log('User ID :  ' + req.user_id, 'info');

            next();
        });
    }

    // Set Uri for static assets served by express
    setExpressStaticAssets() {
        this.express.use('/static', Express.static(Path.join(__dirname, '/../static/')));
    }

    // Set response time infos at each call
    setExpressResponseTime() {
        this.express.use(
            ResponseTime((req, res, time) => {
                this.log(
                    `Request ${req.method} ${req.url} processed in ${time}ms`,
                    'info'
                );
            })
        );
    }

    // Set Express Dependencies
    setExpressDependencies() {
        this.express.use(BodyParser.json());
        this.express.use(CookieParser());
    }

    // Set Redis lib
    setRedis() {
        this.redis = new Redis(this.config.getValue('redis'));
    }

    // Set logger
    setLogger() {
        this.logger = Winston.createLogger({
            level: this.config.getValue('logLevels'),
            format: Winston.format.combine(
                Winston.format.colorize(),
                Winston.format.timestamp(),
                Winston.format.printf(info => {
                    let time = StrfTime('%F %T', new Date(info.timestamp));
                    return `${time} ${info.level} >> ${info.message}`;
                })
            ),
            transports: [
                new Winston.transports.Console()
            ],
        });

        // Easy access
        this.log = (msg, level) => {
            this.logger.log({
                level: level,
                message: msg,
            });
        };
    }

    // Start the application
    start() {
        this.express.listen(this.port, this.host, 511, () => {
            this.log(
                `Worker #${this.workerId} started on ${this.host}:${
                    this.port
                }`,
                'warn'
            );
        });
    }
};
