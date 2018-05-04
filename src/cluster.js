"use strict";

var cluster = require("cluster");
var config = require("./libraries/config");
var microservice = require("./microservice.js");

// Flag de debug
var debug = process.execArgv.indexOf("--debug") !== -1;

// Si on est dans le process Maître
if (cluster.isMaster) {

    // Chargement de la config
    config.setRootPath(__dirname + "/..");
    var microServiceConfig = config.getValue("microservice");

    // Crée un worker pour chaque core
    for (var i = 0; i < microServiceConfig.cores; i += 1) {
        cluster.fork();
    }

    // Si un worker tombe, one le remplace
    cluster.on("exit", function() {
        cluster.fork();
    });

    // Si on est dans un worker
} else {
    // Si on est en debug, on définit le port de debug de chaque worker
    if (debug) {
        process._debugPort = 5858 + cluster.worker.id;
    }
    microservice.start(cluster.worker.id);
}
