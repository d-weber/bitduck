"use strict";

let cluster = require("cluster");
let config = require("./libraries/config");
let app = require("./app.js");

// Flag de debug
let debug = process.execArgv.indexOf("--debug") !== -1;

// Types de workers
let worker_types = new Map();

if (cluster.isMaster) { // Master Process

    // Chargement de la config
    config.setRootPath(__dirname + "/..");
    let app_config = config.getValue("app");

    // Crée un worker pour chaque core
    for (let i = 0; i < app_config.cores; i += 1) {
        cluster.fork();
    }

    // Si un worker tombe, on le remplace
    cluster.on("exit", function() {
        cluster.fork();
    });

} else { // Worker Process
    // Si on est en debug, on définit le port de debug de chaque worker
    if (debug) {
        process._debugPort = 5858 + cluster.worker.id;
    }
    app.start(cluster.worker.id);
}


