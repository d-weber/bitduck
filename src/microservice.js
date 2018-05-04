"use strict";
/*eslint no-console:0*/

function MicroService() {}

// Fonction de démarrage du MS
MicroService.prototype.start = function(workerId) {
    var express = require("express");
    var app = express();
    var path = require("path");
    var responseTime = require("response-time");
    var bodyParser = require("body-parser");

    /**
     * Injection de dépendances
     */
    try {
        // Chargement de la config
        var config = require("./libraries/config");
        config.setRootPath(__dirname + "/..");

        // Chargement du logWriter
        app.logWriter = require("./libraries/logwriter");
        app.logWriter.setLogLevels(config.getValue("logLevels"));
        app.log = function(msg, level) {
            app.logWriter.log(msg, level);
        };

        // Définition du port de l"application
        var msConfig = config.getValue("microservice");
        app.port = msConfig.port;
        if (!msConfig.host) {
            throw new Error("Le champ host est manquant dans la configuration " +
                "du microservice");
        }
        app.host = msConfig.host;

        // On va chercher la version directement dans le package afin de pouvoir
        // lancer la commande sans passer par npm
        var packageVersion = require(
            path.join(config.getRootPath(), "package.json")
        ).version;

        // Définition de la version de l'app
        app.version = packageVersion.split(".")[0];
    } catch (err) {
        console.log(err);
        throw err;
    }

    app.use(bodyParser.json());

    /**
     * Url parameters
     */
    app.param("member_id", function(req, res, next, memberId) {
        memberId = Number(memberId);
        if (memberId > 0) {
            req.member_id = memberId;
            next();
        } else {
            throw new Error("Paramètre member_id non valide");
        }
    });

    /**
     * Log du temps de réponse
     */
    app.use(responseTime(function(req, res, time) {
        app.log("Requête " + req.method + " " + req.url + " temps de réponse : " + time + " ms", "info");
    }));

    /**
     * Routes
     */
    app.get("/", function(req, res, next) {
        require(path.join(__dirname, "controllers", "main")).get(app, req).then(function(data) {
            res.status(data.http_code);
            res.send(data.content);
        }).catch(function(err) {
            next(err);
        });
    });

    /**
     * Route Status
     */
    app.get("/state", function(req, res) {
        res.send({
            type: "Duck",
            status: "running",
            version: app.version
        });
    });

    /**
     * Error Handler
     */
    app.use(function(err, req, res, _next) {
        if (err) {
            app.log(err.message, "error");
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
    app.all("*", function(req, res) {
        res.status(404);
        res.send({
            errors: {
                message: "Not Found"
            }
        });
    });

    /**
     * Démarrage du MS
     */
    // 511 correspond à la valeur par défaut de la longueur de la queue des
    // connexions en attentes.
    app.listen(app.port, app.host, 511, function() {
        app.log("Worker du ms #" + workerId + " démarré sur : " + app.host + ":" +
            app.port, "info");
    });
};

module.exports = new MicroService();